StreamSentiment.VisualisationRegistry.registerCustom("circles", {
	"script": "http://mt.dbragin.ul.js-kit.com/app.js",
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
				"desc": "Specifies the avatar size"
			}
		}, {
			"component": "Input",
			"type": "number",
			"name": "borderWidth",
			"default": 10,
			"config": {
				"title": "Border Width",
				"desc": "Specifies the border width"
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "backgroundColor",
			"default": "#91d7fc",
			"config": {
				"title": "Background Color",
				"desc": "Specifies the background color"
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "foregroundColor",
			"default": "#54b0e1",
			"config": {
				"title": "Foreground Color",
				"desc": "Specifies the foreground color"
			}
		}, {
			"component": "Input",
			"type": "string",
			"name": "flashColor",
			"default": "#65c0f0",
			"config": {
				"title": "Flash Color",
				"desc": "Specifies the flash color"
			}
		}, {
			"component": "Checkbox",
			"type": "boolean",
			"name": "clockwise",
			"default": false,
			"config": {
				"title": "Clockwise",
				"desc": "If enabled the indication goes clockwise"
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
