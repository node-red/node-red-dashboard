**Note: this is still under heavy development. It has not been published to npm and is not ready for general use.**

# node-red-dashboard

This module provides a set of nodes in Node-RED to quickly create a live data
dashboard.

It is a continuation of the work done by Andrei Tatar under the node-red-contrib-ui module.

## Pre-requisites

This Dashboard requires Node-RED version 0.14 or more recent. If you need to use an older version of Node-RED then
please use node-red-contrib-ui.

## Install

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```
npm install node-red-dashboard
```

Open your Node-RED instance and you should have UI nodes available in the palette and a new `dashboard` tab in right side panel.
The UI interface is available at <http://localhost:1880/ui> (if default Node-RED settings are used).

## Migration from node-red-contrib-ui

These nodes will replace the contrib-ui versions. node-red-contrib-ui
**MUST** be uninstalled before installing node-red-dashboard.

 ```
 cd ~/.node-red
 npm uninstall node-red-contrib-ui
 ```
 In addition - some functionality is not exactly equivalent. There are breaking changes that will require some re-configuration.

#### New features

 The widget layout is now managed by a `Dashboard` tab in the right window of the Node-RED editor. From here you can re-order the tabs, groups and widgets, and add and edit their properties.

 Ability to specify sizes. The width and height of widgets can now be set, as can the width
 of *groups*. These are all specified in units of approximately 50 pixels.
 The default width of a group is 6 as it was in contrib-ui ( &approx; 300 pixels ). Setting a widget to `auto` will fill the available
 width of the group, but this can now be set to anything up to the group width. It is still advisable to use multiple groups if you can, rather than one big group, so that the page can dynamically resize on smaller screens.

Group labels are now optional.

External `links` to other pages can now be launched in an **iframe** - if allowed by the target page.

 **Themes** - a dark theme has been added as an alternative.
 This is set on the tab page. ( In the future we hope to allow custom themes to be added - but one step at a time. )

 **Widgets**

  - **Dropdown** - a dropdown select widget has been added. Multiple label, value pairs can be specified.
  - **Gauge** - now has 4 modes - *standard* (simple gauge), *donut* (complete 360&deg;), *compass*, and *wave*.
  - **Button** - the icon can be set using either Material or Fa-Icons - the colour may also be set. If the widget is sized to 1 wide the icon has precedence.
  - **Switch** - can now also set two icons and/or colours depending on state.
  - **Text** - the layout of the `label`, and `value` can be configured.

The `title` of the UI page can be set.

#### Removed

Radio buttons have been removed. Buttons and switches can now be sized 1x1, and switches can be made to interact (via Node-RED).

## Discussions and suggestions

Use the default Node-RED google group: <https://groups.google.com/forum/#!forum/node-red>

or the Dashboard-ui channel in <a href="http://nodered.org/slack/">Slack</a>

## Contributing

Before raising a pull-request, please read our
[contributing guide](https://github.com/node-red/node-red-dashboard/blob/master/CONTRIBUTING.md).

This project adheres to the [Contributor Covenant 1.4](http://contributor-covenant.org/version/1/4/).
 By participating, you are expected to uphold this code. Please report unacceptable
 behaviour to any of the [project's core team](https://github.com/orgs/node-red/teams/core).

## Developers

```
cd ~\.node-red\node_modules
git clone https://github.com/node-red/node-red-dashboard.git
cd node-red-dashboard
npm install
```
The plugin uses the ```dist``` folder if it exists and contains an ```index.html``` file. Make sure to delete it if you want to use the non-minified version.
After changing the front-end code in the src folder, ```gulp``` will update the minified files and update the *appcache* manifest.
