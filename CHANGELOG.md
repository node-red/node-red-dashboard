
### 2.4.3: Maintenance Release

**Enhancements**

 - Add links to web pages of icons to Tab info
 - Let alerts contain html content - Issue #253
 - Let bar charts use same colour for all bars

 **Fixes**

 - Set y-Axis scale if max and min set to stop overlapping labels
 - Make input field and justgage font match theme font choice
 - Fix icon position for min fab buttons - PR #255
 - Redo update logic on tab change - Issue #256

### 2.4.2: Maintenance Release

**Enhancements**

 - Let ui_chart enlarge points so they are visible dots

**Fixes**

 - Revert version of socket.io to keep working on node.js v0.10....

### 2.4.1: Maintenance Release

**Fixes**

 - Fix location for fa-icons
 - Make Tabs/Links window correctly expandable on Firefox

### 2.4.0: Milestone Release

**Enhancements**

 - Add ability to specify basefont style. (NOTE the Cross Platform font uses a
     system font stack approach that should look good across as many platforms as possible)
 - Merge tabs and links so all can be re-ordered - PR #234
 - Let labels handle multiple properties (like payload and colour)
 - Add possibility to use a template node to add or replace content inside <head> tag. PR #239
 - Adjust Form widget spacing to line up with other widgets

 **Fixes**

  - Simpler, better date injection to preset date-picker
  - Let switch resize after being set to 1x1

### 2.3.11: Maintenance Release

**Enhancements**

- Add name of tab to ui_control node tab change msg
- Let dropdown use value as label if not otherwise specified
- Add label field to date-picker
- Adjust labels spacing on gauges to look better at small sizes

**Fixes**

 - Make sure chart display is fully refreshed on tab change - Issue #226
 - Catch another possible missing theme escape path.
 - Fix msg. label regression for ui_text node - Issue #230
 - Retain enable/disable state of widgets (broken in 2.3.10)
 - Fix name-spacing of base node inputs
 - Fix custom theme to default back to previous setting

### 2.3.10: Maintenance Release

**Enhancements**

 - Make fixup of Font Awesome fonts easier for developers
 - Let the Wave gauge display units if you wish
 - Add *change* tab event to ui_control output and also accept +1 and -1 to move to next/prev tab - Issue #194
 - Let label field be set by a {{msg.property}} (for all widgets with label field) - Issue #220

**Fixes**

 - Unbreak change made in 2.3.9 that dropped all msg with no payload.
   - add passthru flag to button (as per other nodes) - Issue #211
   - fix bad number conversion for slider (and other nodes), if payload not set - Issue #212
     - now returns undefined which leaves UI unchanged, but passes through msg
 - Fix bar charts not being cleared properly by [] - Issue #217
 - Fix Node-RED crashing on chart bad data input conversion - Issue #218

### 2.3.9: Maintenance Release

**Fixes**

 - Dashboard Tab - still occasionally empty (for old dashboard migrations)
 - Add CSS to try to help fix scroll of Edge Mobile devices - Issue #207
 - Fix Apple Touch Icon - Issue #208
 - Fix widget sy height (was picking up sx by mistake) - Issue #210
 - Don't let widget bother handle msg with no payload (only handle enabled) - Issue #211, #212

### 2.3.8: Maintenance Release

**Enhancements**

 - Add keyboard shortcut to menu of shortcuts (ctrl-shift-d - Show Dashboard)

**Fixes**

 - Critical Fix : for Dashboard tab not populating on initial empty flow

### 2.3.7: Maintenance Release

**Enhancements**

 - Stop rendering datapoints out of range on line charts - Issue #198
 - Let dropdown placeholder text be editable - Issue #202

**Fixes**

 - Let date-picker survive changes of tabs - Issue #189
 - Change text input box to detect tab to send data (rather than loss of focus) - Issue #196
 - Update Site properties in UI when theme loaded from library - Issue #197
 - Fix audiocontext to reuse existing - Issue #199
 - Better align text input and dropdown text inputs - Issue #201
 - Let ui be hosted at / if required - Issue204
 - Let bar and pie charts be reloaded correctly from saved data - Issue #205
 - Let base colour theme edits work again (rather than resetting all the time)

### 2.3.6: Maintenance Release

**Enhancements**

 - let ui_gauge sector sizes be specified
 - sending tab change of "" to ui_control refreshes current page
 - let button widget pass messages (or be triggered by input)
 - enhance gulp, jshint and jscs checks
 - Hide page *title* tag until actually set
 - add optional i18n.js file to dist
 - optionally let switch status be set by input/feedback rather than press - PR #188

**Fixes**

- stop numeric widget emitting on accidental mouseover
- text input will now send it's payload on losing focus as well as enter (if in enter mode)
- fix form colours to be more dynamic to match theme, Issue #186

### 2.3.5: Maintenance Release

**Fixes**

 - let numeric (and slider) widget accept floating point presets if step set appropriately Issue #185
 - initialises OK if absolutely no theme present from old flow
 - knock the corners off homescreen icon

### 2.3.4: Maintenance Release

**Enhancements**

 - Add IOS homescreen icon link - PR #176
 - Let datepicker accept timestamp input to preset date.
 - Don't react to swipe in charts, or slider

**Fixes**

 - move to ngTouch rather than mdTouch to fix swipe/scroll Issue #164
 - correct data output format from bar chart type chart - fixes Issue #181
 - prevent button forwarding input messages as it makes no sense. - PR #170
 - correct select box example - PR #182
 - fix compass colour to be set by custom widget colour
 - centre icon in button widget

### 2.3.3: Maintenance Release

**Fixes**

 - Fix saving of named custom themes
 - Fix dashboard link icon not appearing for FF and Safari
 - Default old text colours so they are visible

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

 - Add Themes to Dashboard Tab - includes colour and sizes and other options - Issue #137
 - Colour-picker - add configurable lightness slider - PR #123
 - Configurable colour for Notification toasts - Issue #145
 - Remove whitespace from above gauge with no label  - Issue #159
 - Let gauge widgets scall larger when basic unit size increased - Issue #162
 - Let most labels show icons if required (via html <i syntax)
 - Add date-picker widget - Issue #14
 - Give audio node option to play when not in focus - Issue #167

**Fixes**

 - also check template for existence of sole <link tag : if so set height to 0
 - ensure ui_base node has a user to prevent node appearing in "unused" config nodes tab - Issue #110 - actually fixed in core for 0.16.1
 - chart no longer emits a blank array on start (which was wiping out file storage of data)
 - link tabs were stuck at light theme - now follow overall theme correctly - Issue #149
 - fixed numeric widget to not have rounding error, and also occasional stall/hang - Issue #150
 - fixed numeric widget not starting at min value - Issue #163
 - dashboard root path re-write from UI now working
 - remove .res and .req properties of msg in case they have circular refs - Issue #153
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
