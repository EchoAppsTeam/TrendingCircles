(function($) {
"use strict";

var circles = Echo.App.manifest("Echo.Apps.TrendingCircles");

circles.config = {
	"animateMovements": true,
	"animateTimeout": 700,
	"sortAttr": "name",
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

circles.events = {
	"Echo.Control.onDestroy": function(topic, args) {
		this.collectionView.disconnect();
	}
};

circles.renderers.header = function(element) {
	if (this.config.get('simulation')) {
		StreamSentiment.Apps.SimulationWarning.prependTo(element);
	}
	return element;
};


circles.methods.initItem = function(trend) {
	var element = $(this.substitute({"template": '<div class="{class:item}"></div>', "data": {}}));
	return new Echo.Apps.TrendingCircles.Item($.extend({
		"appkey": this.config.get('appkey'),
		"target": element,
		"data": trend,
		"parent": this.config.getAsHash(),
		"request": this.collectionView.request
	}, this.config.get("item")));
};

circles.css =
	'.{class:item} { display: inline-block; }';

Echo.App.create(circles);

})(Echo.jQuery);

(function($) {
"use strict";

var item = Echo.Control.manifest("Echo.Apps.TrendingCircles.Item");

item.config = {
	"avatarSize": 48,
	"borderWidth": 10,
	"foregroundColor": "#54b0e1",
	"backgroundColor": "#91d7fc",
	"flashColor": "#65c0f0",
	"clockwise": false,
	"fps": 60
};

item.config.normalizer = {
	"borderWidthh": function(val) {
		return val > this.get("avatarSize") * 0.5
			 ? this.get("avatarSize") * 0.5 : val;
	}
};

item.init = function() {
	var self = this;

	var r = (this.config.get("avatarSize") + 2 * this.config.get("borderWidth")) * 0.5;
	$.map(["r", "x", "y"], function(v) { self.set(v, r); });
	this.render();

	this.set("context", this.view.get("value").get(0).getContext("2d"));

	var angle = this._toRadians(this._toAngle(this.get("data.weight")));
	this._drawArc(this._toRadians(-90), angle, this.config.get("backgroundColor"), !this.config.get("clockwise"));
	this._drawArc(this._toRadians(-90), angle, this.config.get("foregroundColor"), this.config.get("clockwise"));

	this.ready();
};

item.templates.main =
	'<div class="{class:container}">' +
		'<canvas class="{class:value}"></canvas>' +
		'<div class="{class:avatar}"></div>' +
	'</div>';

item.templates.title = '{data:name} {data:weight} %';

var requestAnimationFrame = (function(){
	return window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function (callback) {
			window.setTimeout(callback, 1000 / this.config.get("fps"));
		};
})();

item.methods.update = function(data) {
	this.set("data", data);
	if (data.weight === data.previousWeight) {
		return;
	}
	var self = this, context = this.get("context");

	var startAngle = this._toRadians(this._toAngle(data.previousWeight));
	var endAngle = this._toRadians(this._toAngle(data.weight));
	var zeroAngle = this._toRadians(-90);

	var stepAngle = (endAngle - startAngle) / this.config.get("fps");
	
	var currentAngle = startAngle;

	var stop = function(angle) {
		return stepAngle < 0 && angle < endAngle ||
			stepAngle > 0 && angle > endAngle;
	};

	(function animationLoop() {

		context.clearRect(0, 0, self.r * 2, self.r * 2);
		if (stop(currentAngle)) {
			self._drawArc(zeroAngle, currentAngle, self.config.get("foregroundColor"), self.config.get("clockwise"));
			self._drawArc(zeroAngle, currentAngle, self.config.get("backgroundColor"), !self.config.get("clockwise"));
			return;
		}

		self._drawArc(zeroAngle, currentAngle, self.config.get("flashColor"), self.config.get("clockwise"));
		self._drawArc(zeroAngle, currentAngle, self.config.get("backgroundColor"), !self.config.get("clockwise"));

		currentAngle += stepAngle;
		requestAnimationFrame(animationLoop);
	})();

	this.view.get("avatar").attr(
		"title",
		this.substitute({"template": item.templates.title})
	);
};

item.renderers.value = function(element) {
	return element
		.attr("width", 2 * this.r)
		.attr("height", 2 * this.r);
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

item.methods._drawArc = function(startAngle, endAngle, color, clockwise) {
	var context = this.get("context");
	context.beginPath();
	context.arc(this.x, this.y, this.r - this.config.get("borderWidth")/2, startAngle, endAngle, !clockwise);
	context.strokeStyle = color;
	context.lineWidth = this.config.get("borderWidth");
	context.stroke();
	context.closePath();
};

item.methods._toAngle = function(weight) {
	var value = weight * 3.6;
	return this.config.get("clockwise") ? value - 90 : 270 - value;
};

item.methods._toRadians = function(degrees) {
	return degrees * Math.PI / 180;
};

item.methods._placeAvatar = function(args) {
        args = args || {};
        var element = $(args.target);
        if (!element.length) return;
        element
                .addClass("echo-avatar")
                .css({
                        "background-image": $.map(["avatar", "defaultAvatar"], function(key) {
                                return args[key]
                                        ? "url('" + args[key] + "')"
                                        : null;
                        }).join(", ")
                });

	var isIE8 = document.all && document.querySelector && !document.addEventListener;
        if (isIE8) {
                element.css({
                        "filter": $.map(["defaultAvatar", "avatar"], function(key) {
                                return args[key]
                                        ? "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + args[key] + "', sizingMethod='scale')"
                                        : null;
                        }).join(", ")
                });
        }
        return element;
};

item.css = 
	'.{class:container} { position: relative; }' +
	'.{class:avatar} { position: absolute; display: inline-block; }' +
	'.echo-avatar { background-size: cover; background-position: center; border-radius: 50%; }';

Echo.Control.create(item);

})(Echo.jQuery);
