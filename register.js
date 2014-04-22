StreamSentiment.VisualisationRegistry.registerCustom("circles", {
	"script": "//cdn.echoenabled.com/apps/echo/trending-circles/v1.0/app.js",
	"name": "Circles",
	"clazz": "Echo.Apps.TrendingCircles",
	"items": [{
		"component": "Group",
		"name": "Animation",
		"config": {
			"title": "Animation"
		},
		"items": [{
			"component": "Checkbox",
			"type": "boolean",
			"name": "animateMovements",
			"default": true,
			"config": {
				"title": "Animate movements",
				"desc": "Controls whether item movements should be animated.\n"
			}
		}, {
			"component": "Input",
			"type": "number",
			"name": "animateTimeout",
			"default": 700,
			"config": {
				"title": "Animate timeout",
				"desc": "The duration of the animation of updates.\n"
			}
		}]
	}, {
		"component": "Group",
		"type": "object",
		"name": "item",
		"config": {
			"title": "Display Settings"
		},
		"items": [{
			"component": "Input",
			"type": "number",
			"name": "avatarSize",
			"default": 48,
			"config": {
				"title": "Avatar Size",
				"desc": "Specifies the avatar size in pixels. The minimum value is 16px."
			}
		}, {
			"component": "Input",
			"type": "number",
			"name": "borderWidth",
			"default": 10,
			"config": {
				"title": "Border Width",
				"desc": "Specifies the border width of the indication circle in pixels. The value cannot be more than a half of the avatar size."
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "backgroundColor",
			"default": "#91d7fc",
			"config": {
				"title": "Background Color",
				"desc": "Specifies the background color of the indication circle. This parameter must have a hex color value."
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "foregroundColor",
			"default": "#54b0e1",
			"config": {
				"title": "Foreground Color",
				"desc": "Specifies the color of the indication. This parameter must have a hex color value."
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "flashColor",
			"default": "#65c0f0",
			"config": {
				"title": "Flash Color",
				"desc": "Specifies the flash color when live updates come to the item. This parameter must have a hex color value."
			}
		}, {
			"component": "Checkbox",
			"type": "boolean",
			"name": "clockwise",
			"default": false,
			"config": {
				"title": "Clockwise",
				"desc": "If enabled the indication goes in a clockwise direction"
			}
		}]
	}, {
		"component": "Group",
		"name": "Result Sorting",
		"config": {
			"title": "Result Sorting"
		},
		"items": [{
			"component": "Input",
			"type": "string",
			"name": "emptyMessage",
			"default": "No items at this time...",
			"config": {
				"title": "Empty message",
				"desc": "The message to show when no trending items are available.\n"
			}
		}, {
			"component": "Select",
			"type": "string",
			"name": "sortAttr",
			"default": "name",
			"config": {
				"title": "Sort attr",
				"desc": "Specifies the attribute used to sort\n",
				"options": [{
					"title": "name",
					"value": "name"
				}, {
					"title": "rank",
					"value": "rank"
				}, {
					"title": "count",
					"value": "count"
				}, {
					"title": "allTimeCount",
					"value": "allTimeCount"
				}]
			}
		}, {
			"component": "Select",
			"type": "string",
			"name": "sortOrder",
			"default": "asc",
			"config": {
				"title": "Sort order",
				"desc": "Defines the direction in which the sort attribute is applied. Can be either asc (ascending) or desc (descending).\n",
				"options": [{
					"title": "asc",
					"value": "asc"
				}, {
					"title": "desc",
					"value": "desc"
				}]
			}
		}]
	}],
	"presets": []
})
