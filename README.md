# node-red-dashboard

This module provides a set of nodes in Node-RED to quickly create a live data
dashboard.

<img src="http://nodered.org/images/dashboardd.png"/>

It is a continuation of the [node-red-contrib-ui](https://www.npmjs.com/package/node-red-contrib-ui)
module created by Andrei Tatar.

## Pre-requisites

Node-RED-Dashboard requires Node-RED version 0.14 or more recent.

## Install

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```
npm install node-red-dashboard
```

Open your Node-RED instance and you should have UI nodes available in the palette and a new `dashboard` tab in
right side panel. The UI interface is available at <http://localhost:1880/ui> (if default Node-RED settings are used).

#### Migration from node-red-contrib-ui

These nodes will replace the contrib-ui versions. node-red-contrib-ui
**MUST** be uninstalled before installing node-red-dashboard.

 ```
 cd ~/.node-red
 npm uninstall node-red-contrib-ui
 ```
 In addition - some functionality is not exactly equivalent. There are breaking changes that will require some re-configuration.

## Features

#### Dashboard sidebar

The widget layout is now managed by a `dashboard` tab in the sidebar of the Node-RED editor.

**Title** - the `title` of the UI page can be set.

**Theme** - the theme of the UI is set in the dashboard sidebar. You
cannot have different themes for each tab.

**Tabs** - From here you can re-order the tabs, groups and widgets, and add and edit their properties.

**Links** - are no longer added as nodes in the workspace - they are managed in the
dashboard sidebar. They can also be opened in an iframe - if allowed by the target page.


#### Widgets

The width and height of widgets can be set, as can the width of *groups*. These are all specified in units of approximately 50 pixels.

The default width of a group is 6 as it was in contrib-ui ( &approx;300 pixels ). Setting a widget to `auto` will fill the available
width of the group. It is still advisable to use multiple groups if you can, rather than one big group, so that the page can dynamically resize on smaller screens.

Group labels are optional.

Any widget can be disabled by passing in a `msg.enabled` property set to `false;`. *Note:* this doesn't stop the widget receiving messages but does stop inputs being active and does re-style the widget.

  - **UI-Control** - a new widget to allow some dynamic control of the dashboard. Initial function is to allow switching tabs. More capability will follow.
  - **Chart** - now has both line and bar chart modes. Also the X-Axis labels can be customised using a date formatter string.
  - **Dropdown** - a dropdown select widget has been added. Multiple label, value pairs can be specified. The choices can also be set via `msg.options` containing an array of objects. If just text then the value will be the same as the label, otherwise you can specify both by using an object of "label":"value" pairs :

        [ "Choice 1", "Choice 2", {"Choice 3","3"} ]

  Setting `msg.payload` will pre-select the value in the dropdown.
  - **Gauge** - has 4 modes - *standard* (simple gauge), *donut* (complete 360&deg;), *compass*, and *wave*. You can also specify the colour range of the standard and donut gauges.
  - **Button** - the icon can be set using either Material or fa-icons - the colour may also be set. If the widget is sized to 1 wide the icon has precedence.
  - **Switch** - can also set two icons and/or colours depending on state.
  - **Text** - the layout of the `label`, and `value` can be configured.
  - **Form** - a widget that can be composed of several sub-widgets. When submitted all values are submitted as a single message.

**Tip:** The *Text* widget will accept html - so you can use it together with the *fa-icons* we
already use to create indicator type widgets.

#### Removed

Radio buttons have been removed. Buttons and switches can now be sized 1x1, and switches can be made to interact (via Node-RED).

## Discussions and suggestions

Use the Node-RED google group: <https://groups.google.com/forum/#!forum/node-red>
or the Dashboard-ui channel in <a href="http://nodered.org/slack/">Slack</a>

## Contributing

Before raising a pull-request, please read our
[contributing guide](https://github.com/node-red/node-red-dashboard/blob/master/CONTRIBUTING.md).

This project adheres to the [Contributor Covenant 1.4](http://contributor-covenant.org/version/1/4/).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to any of the [project's core team](https://github.com/orgs/node-red/teams/core).

## Developers

```
cd ~\.node-red\node_modules
git clone https://github.com/node-red/node-red-dashboard.git
cd node-red-dashboard
npm install
```
The plugin uses the ```dist``` folder if it exists and contains an ```index.html``` file. Make sure to delete it if you want to use the non-minified version.
After changing the front-end code in the src folder, use ```gulp``` to update the minified files and update the *appcache* manifest.

    gulp

We also have have suggested *lint* and *js* styles that can be checked with:

    gulp lint
    gulp jscs

If submitting a Pull Request (PR) please do NOT include the minified `/dist` files.

Thank you.

<img src="http://nodered.org/images/dashboardl.png"/>
