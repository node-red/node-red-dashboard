/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var ui = null;

function init(RED) {
    if (!ui) {
        ui = require("./ui")(RED);
    }
}

/* addWidget:
   - options
     - RED: RED object
     - options: options to create dashboard widget
       * [node] - the node that represents the control on a flow
       * format - HTML code of widget
       * [group] - group name (optional if templateScope = 'global')
       * [width] - width of widget (default automatic)
       * [height] - height of widget (default automatic)
       * [order] - property to hold the placement order of the widget (default 0)
       * [templateScope] - scope of widget/global or local (default local)
       * [emitOnlyNewValues] - boolean (default true).
             If true, it checks if the payload changed before sending it
             to the front-end. If the payload is the same no message is sent.
       * [forwardInputMessages] - boolean (default true).
             If true, forwards input messages to the output
       * [storeFrontEndInputAsState] - boolean (default true).
             If true, any message received from front-end is stored as state
        [persistantFrontEndValue] - boolean (default true).
             If true, last received message is send again when front end reconnect.
       * [convert] - callback to convert the value before sending it to the front-end
       * [beforeEmit] - callback to prepare the message that is emitted to the front-end
       * [convertBack] - callback to convert the message from front-end before sending it to the next connected node
       * [beforeSend] - callback to prepare the message that is sent to the output
       * [initController] - callback to initialize in controller
*/

function addWidget(RED, options) {
    var is_local = (options.templateScope !== "global");
    var group = null;
    var tab = null;
    init(RED);

    var ui_control = {
        type: "template",
        order: options.order,
        format: options.format,
        class: "nr-dashboard-"+(options.node.type || "template-blank")
    };

    var node = options.node;

    if (isNaN(options.order)) {
        node.warn("*** Order property not set. Please contact developer. ***");
    }

    if (is_local) {
        group = RED.nodes.getNode(options.group);
        if (group === null) { return; }
        tab = RED.nodes.getNode(group.config.tab);
        ui_control.width = options.hasOwnProperty("width") ? options.width : group.config.width;
        ui_control.height = options.hasOwnProperty("height") ? options.height : 0;
    }
    else {
        node = {
            id: "-dummy-",
            on: function() {}
        };
    }
    ui_control.templateScope = options.hasOwnProperty("templateScope") ? options.templateScope : "local";
    var ui_options = {
        node: node,
        control: ui_control
    }
    if (is_local) {
        ui_options.group = group;
        ui_options.tab = tab;
    }
    if (options.hasOwnProperty("emitOnlyNewValues")) {
        ui_options.emitOnlyNewValues = options.emitOnlyNewValues;
    }
    if (options.hasOwnProperty("forwardInputMessages")) {
        ui_options.forwardInputMessages = options.forwardInputMessages;
    }
    if (options.hasOwnProperty("storeFrontEndInputAsState")) {
        ui_options.storeFrontEndInputAsState = options.storeFrontEndInputAsState;
    }
    if (options.hasOwnProperty("persistantFrontEndValue")) {
        ui_options.persistantFrontEndValue = options.persistantFrontEndValue;
    }
    if (options.hasOwnProperty("convert")) {
        ui_options.convert = options.convert;
    }
    if (options.hasOwnProperty("beforeEmit")) {
        ui_options.beforeEmit = options.beforeEmit;
    }
    if (options.hasOwnProperty("convertBack")) {
        ui_options.convertBack = options.convertBack;
    }
    if (options.hasOwnProperty("beforeSend")) {
        ui_options.beforeSend = options.beforeSend;
    }
    if (options.hasOwnProperty("initController")) {
        ui_control.initController = options.initController.toString();
    }
    return ui.add(ui_options);
}

/* getSizes:
    returns the grid size in pixels
    default - { sx: 48, sy: 48, gx: 6, gy: 6, cx: 6, cy: 6, px: 0, py: 0 }
*/

/* getTheme:
    returns the current theme object
*/

/* isDark:
    returns true or false if the dahsboard theme background is dark or light.
*/

module.exports = function (RED) {
    return {
        addWidget: function (options) { return addWidget(RED, options); },
        getSizes: function() { return require("./ui")(RED).getSizes(); },
        getTheme: function() { return require("./ui")(RED).getTheme(); },
        isDark: function() { return require("./ui")(RED).isDark(); }
    };
};
