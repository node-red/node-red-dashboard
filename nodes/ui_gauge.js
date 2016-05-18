module.exports = function (RED) {
	var ui = require('../ui')(RED);

	function GaugeNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;

		var tab = RED.nodes.getNode(config.tab);
		var group = RED.nodes.getNode(config.group);
		if (!tab || !group) return;

		var colors = {
			background: {
				'theme-dark': '#515151'
			},
			levels: {
				'theme-dark': ['#00B500', '#E6E600', '#CA3838']
			}
		};
		var lineWidth = {
			'theme-dark': 0.75
		};
		var pointerOptions = {
			'theme-dark': {
				color: '#8e8e93'
			}
		};

		var done = ui.add({
			node: node,
			tab: tab,
			group: group,
			control: {
				type: 'gauge',
				name: config.name,
				title: config.title,
				label: config.label,
				order: config.order,
				value: config.min,
				format: config.format,
				min: config.min,
				max: config.max,
				width: config.width || 6,
				height: config.height || 3,
				background: colors.background,
				lineWidth: lineWidth,
				pointerOptions: pointerOptions,
				levelColors: colors.levels
			},
			beforeSend: function (msg) {
				msg.topic = config.topic;
			},
			convert: ui.toFloat.bind(this, config)
		});

		node.on("close", done);
	}

	RED.nodes.registerType("ui_gauge", GaugeNode);
};
