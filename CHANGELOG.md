
### 2.3.3: Maintenance Release

**Fixes**

 - Fix saving of named custom themes

### 2.3.2: Maintenance Release

**Fixes**

 - Stop light and dark colour reset icon repeating on tab changes
 - Let colour helper library load from editor side
 - Better height detection (or lack of) for template nodes
 - Catch ui_gauge initialisation errors

### 2.3.1: Maintenance Release

**Fixes**

 - Fix gauge initialisation for upgrading dashboard version

### 2.3.0: Milestone Release

**Enhancements**

 - Add Themes to Dashboard Tab - includes colour and sizes and other options - Issue137
 - Colour-picker - add configurable lightness slider - PR123
 - Configurable colour for Notification toasts - Issue145
 - Remove whitespace from above gauge with no label  - Issue159
 - Let gauge widgets scall larger when basic unit size increased - Issue162
 - Let most labels show icons if required (via html <i syntax)
 - Add date-picker widget - Issue14
 - Give audio node option to play when not in focus - Issue167

**Fixes**

 - also check template for existence of sole <link tag : if so set height to 0
 - ensure ui_base node has a user to prevent node appearing in "unused" config nodes tab - Issue110 - actually fixed in core for 0.16.1
 - chart no longer emits a blank array on start (which was wiping out file storage of data)
 - link tabs were stuck at light theme - now follow overall theme correctly - Issue149
 - fixed numeric widget to not have rounding error, and also occasional stall/hang - Issue150
 - fixed numeric widget not starting at min value - Issue163
 - dashboard root path re-write from UI now working
 - remove .res and .req properties of msg in case they have circular refs - Issue153
 - make dropdown widget arrow, chart gridlines, match theme
 - remove .req and .res properties to remove problems with circular references

### 2.2.1: Maintenance Release

**Fixes**

 - Gauges now scale properly on IE9/10/11 and Edge
 - Increase chart size to better fill available space
 - Fix colour-picker touch support (temporary patch while awaiting upstream fix)
 - Fix slight transparency issue on select dropdown
 - Small changes to colour-picker styling
 - Allow use of wi and icofont icon families (only if loaded externally via ui_template)
 - Fix for overlapping last X-axis label (temporary while fixed upstream)

### 2.2.0: Milestone Release

**License change**

 - Change of license copyright to Javascript Foundation

**Deprecated**

 - Second output from chart node - use the `ui_control node` instead. This will emit both *connect* and *lost* messages for each client that connects or loses connection. The 2nd output from the chart node will eventually be removed in a future release.

**Enhancements**

 - Replace nvd3 charts with **charts.js** charts - to fix various issues
 - Add pie chart and horizontal bar chart options to new charts.js based widget
 - Add ui_colour_picker widget to palette
 - Add ui_audio out widget for wav, mp3 and TTS to Dashboard
 - Add step option to ui_numeric input widget
 - Add background colour setting to ui_button widget
 - ui_control emits "connect" and "lost" messages for client id and ip.
 - Add OK/Cancel Dialog mode to ui_notification widget, if msg.socketid is present the notification will only go to that client.
 - All ui elements now also emit `msg.socketid`
 - bumped fa-icons version to 4.7.0

**Fixes**

 - Replace nvd3 charts with charts.js charts - to fix various issues
 - change link `_new` refs to `_blank` to be standards compliant
 - fix fa icons default size so fixed width matches material icons width (24px)
 - bump sockets.io version
 - fixed dropdown generating messages when opening tab


### 2.1.0: Milestone Release

**License change**

 - Change of license from MIT to Apache-2.0 to be in line with other Node-RED projects
    (approved by all contributors)

**Enhancements**

 - Complete re-write of group layout code to stop overlapping issues
 - Add ui_form widget to submit complete form in one go
 - Add swipe left/right between tabs
 - Add "comms lost" toast when connection lost to server
 - Add allow formatting of chart x-axis date formatting
 - Let ui_numeric, ui_textinput and ui_dropdown also control passthru of incoming values
 - Add step size option to ui_slider widget to allow floating point numbers more easily
 - Allow switch label to be dynamically set by msg input
 - Add Dashboard version number to console.log on start

**Fixes**

 - Fill dark background more completely
 - Fix CSS sizing for Safari 10
 - Let ui_dropdown pass through payload values
 - Let dashboard open iframes again (if allowed by remote site)
 - Stop double scrollbars appearing on internal frames
 - Stop ui_control causing missing group prompt
 - Fix missing sidenav "left" item on initial page load
 - Fix enter key to work for ui_textinput on FF
 - Fix groups sizes to display border correctly on FF
 - Fix dropdown select types
 - Fix switch to only switch if input value matches on and off values


### 2.0.2: Maintenance Release

**Enhancements**

 - Add password entry option to text input
 - Add basic colour names to themes
 - Let slider and switch optionally not pass through messages
 - Add time formatter to chart x-Axis
 - Add ui_control widget to allow dynamic tab switch
 - Chart will warn every 1000 points (not a fix for too much data but just a hint :-)
 - Allow dropdown to be configured by passed in options
 - Allow text widget to optionally wait for enter key
 - Allow msg.enabled=false to disable any widget
 - Change dark theme so groups look flat (no widget borders)
 - Add bar chart mode to graph widget
 - Change template widget so default is to accept passed in html
 - Allow Gauge 3 colour ranges to be set
 - Allow Toast notification position to be set

**Fixes**

 - Relax auto-creation of ui_base
 - Handle imported flows properly when updating sidebar tree
 - Maintain expand/collapse states of sidebar tree on refresh
 - Make sure gauge colours default even if theme broken
 - Fix template editor auto height sizing to fill window
 - Template node better height auto detection (but only if in auto size mode)
 - Better layout alignment for groups on wide and narrow screens
 - Allow msg with no payload to be handled


### 2.0.1: Maintenance Release

**Fixes**

 - Sorting groups/tabs in sidebar not sticking
 - Tidy up auto-generation of ui_base node


### 2.0.0: Milestone Release

 - First release published to npm
