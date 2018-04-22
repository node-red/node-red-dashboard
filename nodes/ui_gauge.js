module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function GaugeNode(config) {
        RED.nodes.createNode(this, config);
        this.colors = config.colors || ["#00B500","#E6E600","#CA3838"];
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) { return; }
        var tab = RED.nodes.getNode(group.config.tab);
        if (!tab) { return; }

        if (config.width === "0") { delete config.width; }
        if (config.height === "0") { delete config.height; }
        if (config.height === "1") { config.hideMinMax = true; }
        node.autoheight = parseInt(group.config.width*0.5+1.5) || 4;
        if (config.gtype && config.gtype === "wave") { node.autoheight = parseInt(group.config.width*0.75+0.5); }
        if (config.gtype && config.gtype === "donut") { node.autoheight = parseInt(group.config.width -1); }
        if (config.gtype && config.gtype === "compass") { node.autoheight = parseInt(group.config.width -1); }

        var sizes = ui.getSizes();
        var theme = ui.getTheme();
        if (theme === undefined) {
            theme = {"group-textColor":{value:"#000"}};
            theme["widget-textColor"] = {value:"#000"};
            theme["widget-backgroundColor"] = {value:'#1784be'};
        }

        var gageoptions = {};
        gageoptions.lineWidth = {'theme-dark':0.75};
        gageoptions.pointerOptions = {'theme-dark':{color:'#8e8e93'}, 'theme-custom':theme["group-textColor"].value};
        gageoptions.backgroundColor = {'theme-dark':'#515151', 'theme-custom':theme["widget-textColor"].value };
        gageoptions.compassColor = {'theme-dark':'#0b8489', 'theme-light':'#1784be', 'theme-custom':theme["widget-backgroundColor"].value};

        var waveoptions = {};
        waveoptions.circleColor = {'theme-dark':'#097479', 'theme-light':'#0094ce', 'theme-custom':theme["widget-backgroundColor"].value};
        waveoptions.waveColor = {'theme-dark':'#097479', 'theme-light':'#0094ce', 'theme-custom':theme["widget-backgroundColor"].value};
        waveoptions.textColor = {'theme-dark':'#0b8489', 'theme-light':'#1784be', 'theme-custom':theme["widget-textColor"].value};
        waveoptions.waveTextColor = {'theme-dark':'#0fbbc3', 'theme-light':'#a4dbf8', 'theme-custom':theme["widget-textColor"].value};

        var done = ui.add({
            node: node,
            tab: tab,
            group: group,
            emitOnlyNewValues: false,
            control: {
                type: 'gauge',
                name: config.name,
                label: config.title,
                units: config.label,
                order: config.order,
                value: config.min,
                format: config.format,
                gtype: config.gtype || 'gage',
                min: config.min,
                seg1: config.seg1,
                seg2: config.seg2,
                max: config.max,
                sizes: sizes,
                hideMinMax: config.hideMinMax,
                width: config.width || group.config.width || 6,
                height: config.height || node.autoheight,
                colors: node.colors,
                gageoptions: gageoptions,
                waveoptions: waveoptions,
                options: null
            },
            convert: function(p,o,m) {
                var form = config.format.replace(/{{/g,"").replace(/}}/g,"").replace(/\s/g,"");
                var value = RED.util.getMessageProperty(m,form);
                if (value !== undefined) {
                    if (!isNaN(parseFloat(value))) { value = parseFloat(value); }
                    return value;
                }
                if (!isNaN(parseFloat(p))) { p = parseFloat(p); }
                return p;
                //return ui.toFloat.bind(this, config);
            }
        });
        node.on("close", done);
    }
    RED.nodes.registerType("ui_gauge", GaugeNode);
};
