(function($) {
"use strict";

var circles = Echo.App.manifest("Echo.Apps.TrendingCircles");

circles.config = {
	"item": {}
};

circles.init = function() {
	this.collectionView = new StreamSentiment.TrendCollectionView(this);
	this.collectionView.connect();
};

circles.templates.main =
	'<div class="{class:container}">' +
		'<div class="{class:header}"></div>' +
		'<div class="{class:collection}"></div>' + 
	'</div>';

circles.templates.item =
	'<div class="{class:item}"></div>';

circles.renderers.header = function(element) {
	if (this.config.get('simulation')) {
		StreamSentiment.Apps.SimulationWarning.prependTo(element);
	}
	return element;
};

circles.methods.initItem = function(trend) {
	return new Echo.Apps.TrendingCircles.Item($.extend({
		"appkey": this.config.get('appkey'),
		"target": ("<div>"),
		"data": trend,
		"parent": this.config.getAsHash(),
		"request": this.collectionView.request
	}, this.config.get("item")));
};

circles.destroy = function() {
	this.collectionView.disconnect();
};

circles.css =
	'.{class:collection} { font-size: 0.1px; }' +
	'.{class:collection} > div { display: inline-block; font-size: 16px; margin: 3px; }';

Echo.App.create(circles);

})(Echo.jQuery);

(function($) {
"use strict";

var item = Echo.App.manifest("Echo.Apps.TrendingCircles.Item");

item.config = {
	"avatarSize": 48,
	"borderWidth": 10,
	"foregroundColor": "#54b0e1",
	"backgroundColor": "#91d7fc",
	"flashColor": "#65c0f0",
	"clockwise": false,
	"startAngle": -90, // in degrees
	"fps": 60,
	"animationSteps": 60
};

item.config.normalizer = {
	"avatarSize": function(val) {
		return val < 6 ? 6 : val;
	},
	"borderWidth": function(val) {
		return val > this.get("avatarSize") * 0.5
			 ? this.get("avatarSize") * 0.5 : val;
	}
};

item.vars = {
	"x": 0, // x coordinate of the circle center
	"y": 0, // y coordinate of the circle center
	"diameter": 0,
	"arc": {
		"radius": 0,
		"width": 0
	},
	"startAngle": 0,
	"colors": {},
	"clockwise": false
};

item.init = function() {

	// calculate and store some values to prevent recalculating during the animation
	var arcWidth = this.config.get("borderWidth");
	var radius = (this.config.get("avatarSize") + 2 * arcWidth) * 0.5;
	this.set("x", radius);
	this.set("y", radius);
	this.set("diameter", radius * 2);
	this.set("arc", {
		"radius": radius - arcWidth * 0.5,
		"width": arcWidth
	});
	this.set("startAngle", this._toRadians(this.config.get("startAngle")));
	this.set("colors", {
		"background": this.config.get("backgroundColor"),
		"foreground": this.config.get("foregroundColor"),
		"flash": this.config.get("flashColor")
	});
	this.set("clockwise", this.config.get("clockwise"));

	this.set("requestAnimationFrame", this._getRequestAnimationFrame());
	this.render();
	this.ready();
};

item.templates.main =
	'<div class="{class:container}">' +
		'<canvas class="{class:value}"></canvas>' +
		'<div class="{class:avatar}"></div>' +
	'</div>';

item.templates.title = '{data:name} {data:weight} %';

item.renderers.container = function(element) {
	var self = this;
	$.map(["height", "width"], function(key) {
		element.css(key, self.diameter);
	});
	return element.attr(
		"title",
		this.substitute({"template": item.templates.title})
	);
};

item.renderers.value = function(element) {
	var self = this;
	$.map(["height", "width"], function(key) {
		element.attr(key, self.diameter);
	});

	var context = element.get(0).getContext && element.get(0).getContext("2d");
	if (!context) {
		return element;
	}

	this.set("context", context);
	var angle = this._toRadians(this._toAngle(this.get("data.previousWeight") || this.get("data.weight")));
	this._drawArc(this.startAngle, angle, this.colors["background"], !this.clockwise);
	this._drawArc(this.startAngle, angle, this.colors["foreground"], this.clockwise);
	this._animate();

	return element;
};

item.renderers.avatar = function(element) {
	var size = this.config.get("avatarSize");
	// TODO: get rid of this substitution
	var avatars = {
		"http://aboutecho.com/Content/Images/AboutEcho/Management/img-chris-saad.jpg": "http://static.squarespace.com/static/52c5b81de4b0494603ede7e5/t/52cb35abe4b08720b0f45793/1389049259794/img-chris-saad.jpg",
		"http://aboutecho.com/Content/Images/AboutEcho/Management/img-kris-loux.jpg": "http://static.squarespace.com/static/52c5b81de4b0494603ede7e5/t/52c6510ee4b0438864636e19/1388728590845/img-kris-loux.jpg",
		"http://aboutecho.com/Content/Images/AboutEcho/Management/img-philippe-cailloux.jpg": "https://pbs.twimg.com/profile_images/442034424352210944/l4gNFFG8_bigger.jpeg",
		"http://aboutecho.com/Content/Images/AboutEcho/Management/img-jason-hoch.jpg": "https://pbs.twimg.com/profile_images/2794072215/dd0cd0ae4701ce0433196b7d17c848f4_bigger.png"
	};

	return this._placeAvatar({
		"target": element,
		"avatar": avatars[this.get("data.avatar")] || this.get("data.avatar"),
		"defaultAvatar": this.config.get("defaultAvatar")
	}).css({
		"top": this.arc["width"],
		"left": this.arc["width"],
		"width": size,
		"height": size
	});
};

item.methods.update = function(data) {
	this.set("data", data);
	this._animate();
	this.view.get("container").attr(
		"title",
		this.substitute({"template": item.templates.title})
	);
};

item.methods._animate = function() {
	var weight = this.get("data.weight");
	var previousWeight = this.get("data.previousWeight");
	var context = this.get("context");
	if (weight === previousWeight || typeof previousWeight === "undefined" || !context) return;

	var self = this;
	var angleFrom = this._toRadians(this._toAngle(previousWeight));
	var angleTo = this._toRadians(this._toAngle(weight));
	var step = (angleTo - angleFrom) / this.config.get("animationSteps");

	var stop = function(angle) {
		return step < 0 && angle < angleTo ||
			step > 0 && angle > angleTo;
	};

	var angle = angleFrom;
	(function animationLoop() {
		context.clearRect(0, 0, self.diameter, self.diameter);
		if (stop(angle)) {
			self._drawArc(self.startAngle, angle, self.colors["foreground"], self.clockwise);
			self._drawArc(self.startAngle, angle, self.colors["background"], !self.clockwise);
			return;
		}

		self._drawArc(self.startAngle, angle, self.colors["flash"], self.clockwise);
		self._drawArc(self.startAngle, angle, self.colors["background"], !self.clockwise);

		angle += step;
		self.requestAnimationFrame.call(window, animationLoop);
	})();
};

item.methods._drawArc = function(angleFrom, angleTo, color, clockwise) {
	var context = this.get("context");
	context.beginPath();
	context.arc(this.x, this.y, this.arc["radius"], angleFrom, angleTo, !clockwise);
	context.strokeStyle = color;
	context.lineWidth = this.arc["width"];
	context.stroke();
	context.closePath();
};

item.methods._toAngle = function(weight) {
	// convert percentage value into corresponding circle angle in degrees
	var value = weight * 3.6;
	return this.config.get("clockwise")
		? value + this.config.get("startAngle")
		: 360 + this.config.get("startAngle") - value;
};

item.methods._toRadians = function(degrees) {
	return degrees * Math.PI / 180;
};

item.methods._getRequestAnimationFrame = function() {
	var self = this;
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / self.config.get("fps"));
		};
};

var IE8 = document.all && document.querySelector && !document.addEventListener;

item.methods._placeAvatar = function(args) {
	args = args || {};
	var element = args.target;
	if (!element.length) return;

	var self = this;
	var composeCSS = function(keys, value) {
		return $.map(keys, function(key) {
			return args[key]
				? self.substitute({
					"template": value,
					"data": {"value": args[key]}
				}) : null;
		}).join(", ");
	};

	var keys = ["avatar", "defaultAvatar"];
	element.css({"background-image": composeCSS(keys, "url('{data:value}')")});

	return IE8 ? element.css({
		"filter": composeCSS(keys.reverse(), "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{data:value}', sizingMethod='scale')")
	}) : element;
};

item.css = 
	'.{class:container} { position: relative; }' +
	'.{class:avatar} { position: absolute; display: inline-block; background-size: cover; background-position: center; border-radius: 50%; }';

Echo.App.create(item);

})(Echo.jQuery);
