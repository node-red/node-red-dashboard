
#### 2.2.0-beta: Maintenance Release (not yet released to npm)

License change

 - Change of license copyright to Javascript Foundation

Enhancements

	- Replace nvd3 charts with **charts.js** charts - to fix various issues
	- Add pie chart and horizontal bar chart options to new charts.js based widget
    - Remove second output from chart node - use the ui_control node instead
    - Add step option to ui_numeric input widget
    - Add ui_audio out widget for wav, mp3 and TTS to Dashboard
    - bumped fa-icons version to 4.7.0
    - ui_control emits "connect" and "lost" messages for client id and ip.
    - All ui elements now also emit `msg.socketid`
    - Add OK/Cancel Dialog mode to ui_notification widget, if msg.socketid is present the notification will only go to that client.

Fixes

	- Replace nvd3 charts with charts.js charts - to fix various issues
    - change link `_new` refs to `_blank` to be standards compliant
    - fix fa icons default size so fixed width matches material icons width (24px)
    - bump sockets.io version
    - fixed dropdown generating messages when opening tab


### 2.1.0: Milestone Release

License change

 - Change of license from MIT to Apache-2.0 to be in line with other Node-RED projects
    (approved by all contributors)

Enhancements

 - Complete re-write of group layout code to stop overlapping issues
 - Add ui_form widget to submit complete form in one go
 - Add swipe left/right between tabs
 - Add "comms lost" toast when connection lost to server
 - Add allow formatting of chart x-axis date formatting
 - Let ui_numeric, ui_textinput and ui_dropdown also control passthru of incoming values
 - Add step size option to ui_slider widget to allow floating point numbers more easily
 - Allow switch label to be dynamically set by msg input
 - Add Dashboard version number to console.log on start

Fixes

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

#### 2.0.2: Maintenance Release

Enhancements

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

Fixes

 - Relax auto-creation of ui_base
 - Handle imported flows properly when updating sidebar tree
 - Maintain expand/collapse states of sidebar tree on refresh
 - Make sure gauge colours default even if theme broken
 - Fix template editor auto height sizing to fill window
 - Template node better height auto detection (but only if in auto size mode)
 - Better layout alignment for groups on wide and narrow screens
 - Allow msg with no payload to be handled

#### 2.0.1: Maintenance Release

Fixes

 - Sorting groups/tabs in sidebar not sticking
 - Tidy up auto-generation of ui_base node

### 2.0.0: Milestone Release

 - First release published to npm!
