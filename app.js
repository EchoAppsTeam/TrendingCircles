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
	var element = $(this.substitute({"template": circles.templates.item}));
	return new Echo.Apps.TrendingCircles.Item($.extend({
		"appkey": this.config.get('appkey'),
		"target": element,
		"data": trend,
		"parent": this.config.getAsHash(),
		"request": this.collectionView.request
	}, this.config.get("item")));
};

circles.destroy = function() {
	this.collectionView.disconnect();
};

circles.css =
	'.{class:item} { display: inline-block; margin-right: 5px; }';

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
	"zeroAngle": -90, // in degrees
	"fps": 60,
	"animationSteps": 60
};

item.config.normalizer = {
	"borderWidth": function(val) {
		return val > this.get("avatarSize") * 0.5
			 ? this.get("avatarSize") * 0.5 : val;
	}
};

item.vars = {
	"r": 0, // circle radius
	"d": 0, // circle diameter
	"x": 0, // x coordinate of the circle center
	"y": 0, // y coordinate of the circle center
	"arcR": 0, // radius of the arc
	"zeroAngle": 0 // angle to start indication
};

item.init = function() {
	var self = this;

	// calculate and store some values to prevent recalculating during the animation
	var r = (this.config.get("avatarSize") + 2 * this.config.get("borderWidth")) * 0.5;
	$.map(["r", "x", "y"], function(v) { self.set(v, r); });
	this.set("d", r * 2);
	this.set("arcR", this.r - this.config.get("borderWidth") * 0.5);
	this.set("zeroAngle", this._toRadians(this.config.get("zeroAngle")));

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

item.renderers.value = function(element) {
	var self = this;
	$.map(["height", "width"], function(key) {
		element.attr(key, self.d);
	});
	this.set("context", element.get(0).getContext("2d"));

	var weight = this.get("data.previousWeight") ? this.get("data.previousWeight") : this.get("data.weight");
	var angle = this._toRadians(this._toAngle(weight));
	this._drawArc(this.zeroAngle, angle, this.config.get("backgroundColor"), !this.config.get("clockwise"));
	this._drawArc(this.zeroAngle, angle, this.config.get("foregroundColor"), this.config.get("clockwise"));
	this._animate();

	return element;
};

item.renderers.avatar = function(element) {
	var padding = this.config.get("borderWidth");
	var size = this.config.get("avatarSize");
	return this._placeAvatar({
		"target": element,
		"avatar": this.get("data.avatar", ""),
		"defaultAvatar": this.config.get("defaultAvatar")
	}).css({
		"top": padding,
		"left": padding,
		"width": size,
		"height": size
	}).attr(
		"title",
		this.substitute({"template": item.templates.title})
	);
};

item.methods.update = function(data) {
	this.set("data", data);
	this._animate();
	this.view.get("avatar").attr(
		"title",
		this.substitute({"template": item.templates.title})
	);
};

item.methods._animate = function() {
	var weight = this.get("data.weight");
	var previousWeight = this.get("data.previousWeight");
	if (weight === previousWeight || typeof previousWeight === "undefined") return;

	var self = this, context = this.get("context");
	var startAngle = this._toRadians(this._toAngle(previousWeight));
	var endAngle = this._toRadians(this._toAngle(weight));
	var stepAngle = (endAngle - startAngle) / this.config.get("animationSteps");

	var stop = function(angle) {
		return stepAngle < 0 && angle < endAngle ||
			stepAngle > 0 && angle > endAngle;
	};

	var angle = startAngle;
	(function animationLoop() {
		context.clearRect(0, 0, self.d, self.d);
		if (stop(angle)) {
			self._drawArc(self.zeroAngle, angle, self.config.get("foregroundColor"), self.config.get("clockwise"));
			self._drawArc(self.zeroAngle, angle, self.config.get("backgroundColor"), !self.config.get("clockwise"));
			return;
		}

		self._drawArc(self.zeroAngle, angle, self.config.get("flashColor"), self.config.get("clockwise"));
		self._drawArc(self.zeroAngle, angle, self.config.get("backgroundColor"), !self.config.get("clockwise"));

		angle += stepAngle;
		self.requestAnimationFrame.call(window, animationLoop);
	})();
};

item.methods._drawArc = function(startAngle, endAngle, color, clockwise) {
	var context = this.get("context");
	context.beginPath();
	context.arc(this.x, this.y, this.arcR, startAngle, endAngle, !clockwise);
	context.strokeStyle = color;
	context.lineWidth = this.config.get("borderWidth");
	context.stroke();
	context.closePath();
};

item.methods._toAngle = function(weight) {
	var value = weight * 3.6;
	return this.config.get("clockwise")
		? value + this.config.get("zeroAngle")
		: 360 + this.config.get("zeroAngle") - value;
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

	var isIE8 = document.all && document.querySelector && !document.addEventListener;
	if (isIE8) {
		element.css({
			"filter": composeCSS(keys.reverse(), "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{data:value}', sizingMethod='scale')")
		});
	}
	return element;
};

item.css = 
	'.{class:container} { position: relative; }' +
	'.{class:avatar} { position: absolute; display: inline-block; background-size: cover; background-position: center; border-radius: 50%; }';

Echo.App.create(item);

})(Echo.jQuery);
