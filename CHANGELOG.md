
### 3.3.1: Maintenance Release

 - Revert to uglify (for now) to fix color-picker failure. Issue #791

### 3.3.0: Milestone Release

 - Expose manifest.json display property in settingsjs ui section so can be set fullscreen if desired.
 - Change gulp build tool to use gulp-terser for later nodejs version support
 - Fix datepicker to use change not blur to stop Safari sending double messages
 - Update justgage library to include and expose differential mode (either side of a centre point).
 - Fix initial drawing of gauge not registering value correctly. Issue #788

### 3.2.4: Maintenance Release

 - Let Link Tabs also be hideable. Issue #785

### 3.2.3: Maintenance Release

 - Re-do package to omit node-sass (not required for prod)

### 3.2.2: Maintenance Release

 - Fix topic return when topic is falsey. Issue #784
 - Fix notification toast class. Issue #776
 - Fix z-index of dropdown items. Issue #775

### 3.2.0: Milestone Release

 - Fix Cross site scripting for ui_text format input. Issue #772
 - Don't accept obviously bad chart data. Issue #713
 - Bump libraries to latest

### 3.1.8: Maintenance Release

 - Use Node-RED CSS vars for ui-bas to help themeing. PR #763
 - Let spacer also have custom class

### 3.1.7: Maintenance Release

**Fixes**

 - Fix text-input datetime mode to accept setting time input. Issue #757
 - Fix ng-disabled for text, numeric and dropdown inputs
 - Fix disabling button
 - Fix numeric input width calculation

### 3.1.6: Maintenance Release

**Fixes**

- Add PR to deduplicate layput list entries. PR #752
- Really fix date picker to always send selected date. Issue #753
- Add PR to fix validity checks of node config. PR #755
- Add datetime option to text input

### 3.1.5: Maintenance Release

**Fixes**

 - Fix dropdown multiselect to search on labels and handle upper/lower case. Issue #749
 - Fix dropdown to not exit on mixed string and numerics. Issue #748

### 3.1.4: Maintenance Release

**Fixes**

 - Fix colorpicker swatch overlapping colorpicker dial. Issue #746
 - Let dropdown multiselect "select all" only select those in search. Issue #747

### 3.1.3: Maintenance Release

**Fixes**

 - Remove main entry from package.json. Issue #740
 - Let date-picker send repeated existing values.
 - Warn if Node.js version not 12+.
 - Allow ui-dropdown to accept single string for one valid option.
 - Fix socketid back to be in sync with reality. Issue #738

### 3.1.2: Maintenance Release

**Fixes**

 - Fix dialogue notification to be able to return 1. Issue #736
 - Force saving of spacer size. Forum Issue

 ### 3.1.1: Maintenance Release

 **Fixes**

 - Replace ui_control messages feedback block (found out why it was there...)

### 3.1.0: Maintenance Release

**Fixes**

 - Bump socket.io to 4.3.x
 - Remove ui_control messages weird feedback block (not sure why it was ever there...)
 - Fix bad class field in text_input. PR #783

### 3.0.4: Major Release

**Enhancements**

 - Set minimum requirement to be Node12 (in line with core)
 - Bump libraries to latest including socketIO - this also drops node 8 support, Node10 is also EOL
 - Add optional CSS Class field to core widgets

 **Fixes**

  - Fix dropdown string types (again)
  - Fix button and switch invalid buffer to not crash NR
  - Fix form to correctly send false on reset of checkbox and switch
  - Better position for 1x1 colour picker

### 2.29.3: Maintenance Release

**Fixes**

 - Try to ensure angular palette state really is saved. Issue #554
 - Let form time type show correct label. Issue #702
 - Adjust CSS for better alignment of icons in ui-list
 - Fix color-picker z layer to be behind dropdown if necessary

### 2.29.1: Maintenance Release

**Fixes**

 - Fix dropdown to send strings when requied to do so. Issue #700

### 2.29.0: Maintenance Release

**Enhancements**

 - Allow incoming msg.meta from UI. PR #690

### 2.28.2: Maintenance Release

**Fixes**

 - Fix empty dropdown causing crash on select. PR #686
 - Fix button not sending blank string. Issue #687
 - Fix dropdown not returning numbers of type string. Issue #691

### 2.28.1: Maintenance Release

**Fixes**

 - Fix ui-form sizing issue.

### 2.28.0: Milestone Release

**Enhancements**

 - Add two column option to ui_form widget. PR #680
 - Let topic setting be a typed input for nodes that output topic.

**Fixes**

 - Fix msg.vol for tts out
 - Fix dropdown again to display input value when in not passing though mode. Issue #675
 - Fix dropdown to allow clearing/resetting by sending an empty message (part of fix above)
 - Add option to switch custom icons to animate (a bit) - works with more icon types now.

### 2.27.1: Maintenance Release

**Fixes**

 - Fix CSS for layout grid to render better for some browsers
 - Add time picker to ui_form options.
 - Add better German translations. PR #673

### 2.27.0: Milestone Release

**Enhancements**

 - Let user configured middleware be an array. PR #664
 - Let polar area chart have different colours per series item. PR #662

**Fixes**

 - Fix dropdown pre-select of multiple options
 - Fix button text colour - dumb mistake. Issue #670

### 2.26.2: Maintenance Release

**Fixes**

 - Fix slider text colour to better contrast with widget background. Issue #665
 - Check served endpoint to prevent path traversal. Issue #669.

### 2.26.1: Maintenance Release

**Enhancements**

 - Add msg.level to Audio out node to set volume from 0 to 1 (0-100%).

**Fixes**

 - Update German translations. PR #654
 - Fix level update for weathericons lite.
 - Ensure dropdown new options are set even when not visible. Issue #479
 - Fix angular theme for gauges - and some other theme escapes. Issue #649

### 2.26.0: Milestone Release

**Enhancements**

 - Update weather icons to 1.6 to include more wind direction rotations and icons.
 - Add more Japanese translations for chart and form nodes. PR #653

**Fixes**

 - Fix CSS to remove lots of !important flags to allow override.
 - Fix examples in ui_template node. PR #651
 - Ensure ui_base creation is called at more appropriate time so is there ready for nodes when needed.

### 2.25.0: Milestone Release

**Enhancements**

 - Update weather icons to 1.5 to include wind direction rotations.

**Fixes**

 - Fix dropdown to not preselect option if no passthru.
 - Fix replacing iconify icons so they can be dynamic.
 - Fix gauge angular filters with space in msg properties.
 - Try to resize template when restored from collapse. Issue #642.

### 2.24.2: Maintenance Release

**Fixes**

 - Fix to swap switch icons to allow iconify icons to work. PR#597
 - Tweak dropdown CSS to always try to show select button.
 - Add node.type class to template so 3rd party nodes can tweak their md-card.

### 2.24.1: Maintenance Release

**Fixes**

 - Fix dropdown single pick search.
 - Changes to help optimise chart updates and reloads.
 - Fix ui_text so null msg doesn't blank text on enable and disable.
 - Add info about Icon usage to README.
 - Let button icon be settable by `{{property}}`.

### 2.24.0: Milestone Release

**Enhancements**

 - Let sidebar menu optionally show icons only.
 - Let iconify font icons have size parameter. eg `iconify-mdi:garage-variant 48px`

**Fixes**

 - Fix for dropdown options being options.
 - Datepicker auto selects first day of week based on browser locale.
 - Add tooltips for layout fixed/not-fixed icons.
 - Fix layout drag between groups.

### 2.23.5: Maintenance Release

**Fixes**

 - Set checkbox label to be full width. Issue #622
 - Add CSS for ui-list menu select to match theme.
 - Add node-id property to each md-card.
 - Force time picker image to contrast with background.
 - Let slider show status even if no nodes attached to output.
 - Fix dropdown to return correct message type.

### 2.23.4: Maintenance Release

**Fixes**

 - Truncate input data array if larger than number of points required. Issue #617
 - Fix dropdown regression to handle objects
 - PR to report correct IP address when using Nginx or proxy. PR #620

### 2.23.3: Maintenance Release

**Fixes**

 - Fix regression in dropdown returning 0 value. Issue #614
 - Fix ui_textinput-CR to allow any step so floats validate ok. Issue #609
 - Ensure voice option picks a unique selector. Issue #613
 - Update libraries to fix missing weather/moon icons

 ### 2.23.2: Maintenance Release

**Fixes**

 - Fix dropdown to correct return values not labels

 ### 2.23.1: Maintenance Release

**Fixes**

 - Fix date picker to return midnight on picked day. PR #600
 - Add some validation to dropdown widget values to flag duplicates.
 - Fix dropdown to only return valid options if options changed dynamically.
 - Fix group spacings to align better.
 - Fix wave gauge to also allow using random msg properties. Issue #607

### 2.23.0: Milestone Release

**Enhancements**

 - Fix custom colour sidebar choice to actually work.
 - Dropdown multiselect now allows select/deselect all. PR #590
 - Add iconify- keyword to icon handling (still need to add js via template).
 - Let notification node set timeout via msg.timeout property.

**Fixes**

 - Block direct websocket connection attempts - only allow upgrades.
 - Bump angular libs to 1.8.0 for security patch.
 - Stop chart sending blank data payload on deploy.
 - Ensure toast dialog cancel button defaults to on when in prompt with input mode. Issue #596
 - Remove some hardcoded CSS to help themeing support of editor.

### 2.22.1: Maintenance Release

**Fixes**

 - Re-insert missing weather icons fonts.
 - Fix slider logic for touch devices. Issue #589

### 2.22.0: Milestone Release

**Enhancements**

 - Add group (open/closed) event to ui_control output.
 - Let browser bar theme copy dashboard theme (for Android).
 - Add id to Tab div tag so css can be targetted.
 - Add option for multi-selects in dropdown. PR #588

**Fixes**

 - Document _dontSend option for beforeSend callback.
 - Let slider repeat click work in "send at end" mode.
 - Force client reauth when old socket connection times out and 401s. PR #586
 - Fix navigation history, so back/formward browser buttons work. PR #587
 - Force socket.io to use secure link when using https.
 - Allow dropdowns to take up more space on screen for longer lists.
 - Make sure we don't fail on a null msg from a template.

### 2.21.0: Milestone Release

**Enhancements**

 - Let tooltip words be settable via {{msg.something}}. Issue #578
 - Move Gridstack to v0.6.4 - thanks HiroyasuNishiyama. PR #581,580

**Fixes**

 - Fix Form Date input to accept inject of date correctly.

### 2.20.0: Milestone Release

**Enhancements**

 - Add open and close options for groups to ui_control node.
 - Add cubic and cubic-monotone to chart interpolation options.
 - Allow ui_control msg to widgets also set .label property.
 - Add option to try to load dist/loading,html for those that want it.
 - Add msg.event for button clicks.
 - Make Gridstack a normal dep so they can count installs. Bump to v0.5.5
 - Let mousewheel change slider. Issue #575
 - Add UTC option to Chart node X-Axis.
 - Add no resend on refresh option to template node.

 **Fixes**

 - Add placeholder to ui-form date type to give a clue that yyyy-mm-dd works for Safari.
 - Fix dropdown to save topic for input for subsequent selections. Issue #570
 - Fix colour picker to show appropriate controls by default. Issue #572

### 2.19.4: Maintenance Release

**Enhancements**

 - Add feedback option to dialog widget.
 - Add persistantFrontEndValue property to addWidget options so it possible to avoid replay message to be sent when front end reconnect. PR #558

 **Fixes**

 - Re-add gridstack min map to reduces warnings.
 - Added crossorigin attribute to manifest link. PR #560

### 2.19.3: Maintenance Release

**Enhancements**

 - Let dropdown status show selected label rather than value.

**Fixes**

 - Fix notification to send cancel instead of OK when dismissed by blank message.
 - Fix Angular theme reverting to light in menu. Issue #554

### 2.19.2: Maintenance Release

**Fixes**

 - Revert dropping of angular material icons with animation. Issue #552

 ### 2.19.1: Maintenance Release

**Enhancements**

 - Self host Material Icons Font - PR #550

**Fixes**

 - Adjust Gauge title spacing.

### 2.19.0: Milestone Release

**Enhancements**

 - Let ui_form node accept input to prefill, and add multiline text
 - Let dialog be removed by blank message.

**Fixes**

 - Fix undocumented change to justgage custom sectors api. Issue #547

### 2.18.0: Milestone Release

**Enhancements**

 - Update justgauge to latest (now maintained) version and drop monkeypatch. Issue #535.
 - Add engines node8 to package.json

**Fixes**

 - Stop propagation of swipe when using color picker - Issue #539
 - Handle tab names with multiple spaces in for hide/show - Issue #541
 - Update gulpfile.js to gulp 4 - Issue #542
 - Fix numeric step rounding when changed by ui_control

### 2.17.1: Maintenance Release

**Fixes**

 - Add warning re missing order property in custom widget nodes
 - Fix notifications. Issue #537.

### 2.17.0: Milestone Release

 **Fixes**

  - Better vertical align larger button icons if supplied via label text
  - Fix ui_notification node to not accept raw HTML by default, add option to allow.

### 2.16.3: Maintenance Release

 **Enhancements**

  - If template has height -1 then set it to 0 height (test).
  - Add wrap value feature to numeric node.

  **Fixes**

  - Ensure widgets handle undefined msg parts for labels etc.
  - Fix scrollbar theming inside template.
  - Ensure msg.topic really doesn't exist if not specified, for all ui nodes. Was PR #531
  - Backlevel less package to fix IE11 loading, Issue #530

### 2.16.2: Maintenance Release

**Enhancements**

 - Ui-control can be set to only report connect events, or change tab events.

**Fixes**

 - Stop slider sending twice (after fixing endstop issue below). Issue #527
 - Fix Theme colour swatch size.

### 2.16.1: Maintenance Release

**Fixes**

 - Fix toast to show border correctly and better timing. Issue #525
 - Stop colour picker sending on page refresh. Issue #514
 - Fix layout tool group locations. PR #526
 - Fix slider not sending if past end of widget.

### 2.16.0: Milestone Release

**Enhancements**

 - Add Dashboard Layout tool - Major contribution - Thanks @KazuhiroItoh - PR #482
 - Add ui.isDark() returns true/false if overall theme is dark or light, so the widget could switch appropriately. (can already use getTheme() to get actual colors if needs be.)

 **Fixes**

  - Make spacer transparent so background is really the background.
  - Fix text_input to only send duplicates if enter key hit multiple times and not on loss of focus. Issue #513
  - Fix color-picker to not emit on tab change, and fix background overlay. Issue #514
  - Fix IE11 loading issue #515 (reversion)
  - Improve embedded node-red dashboard full path resolve - Issue #517
  - Let ui-form input be full width on IE11 - Issue #524

### 2.15.5: Maintenance Release

 **Enhancements**

  - Add compression middleware by default to speed up loading. Thanks @zyrorl

**Fixes**

 - Fix legend to keep items hidden when new data arrives. Issue #507
 - Re-re-fix switch to not show correct icon despite passthru, and toggle output correctly. Issue #506
 - Make Dialog and Toast be more consistent
 - Fix odd gauge behaviour when in donut mode
 - Fix UI redraw (not redrawing when changing tabs). PR #508
 - Fix vertical slider in only on release mode
 - Let webfont loader be async to not delay page load when offline, and fail silently
 - Fix Datepicker to honour Site date format
 - Tweak passthrough option wording to try to match what actually happens
 - Fix text-input to only send one message when using tab key to move fields

### 2.15.4: Maintenance Release

**Enhancements**

 - Add CSS variable names for main theme colours to make user customisations easier

**Fixes**

 - Re-fix switch to not visibly switch when set to show input not output. Issue #506
 - Fix colour swatch widths in ui_chart and ui_gauge.

### 2.15.3: Maintenance Release

**Enhancements**

 - Let ui_template use full screen editor (when used with NR 1.0)

**Fixes**

 - Fix slider css so numbers stay visible when in "on release only" mode
 - Fix switch to show correct state for late connecting clients. Issue #497
 - Fix button to show correct state for late connecting clients. Issue #499
 - Fix sidenav to ensure colour picker is behind it. Part of issue #492
 - Better contrast for sidebar menu buttons to work across themes. Issue #500
 - Revert colour picker to its default design with colour + lightness, add square option, and fix cursor. Issue #502
 - Fix slider discrete mode to align better, blend theme better and not hide thumb. Issue #503
 - Fix button to return to original colour on loss of focus. Issue #504

### 2.15.2: Maintenance Release

**Fixes**

 - Fix legend being visible when it should not be. Issue #494
 - Fix ui_text_input time mode to accept and passthrough input correctly. Issue #495
 - Fix theme to better handle new ui_list node switch styles.

### 2.15.1: Maintenance Release

 **Fixes**

  - Fix built in fa-icons font paths

### 2.15.0: Milestone Release

**Enhancements**

 - Allow ui_chart to have many more options set by control message, see [config-fields.md](config-fields.md)
 - Allow `ui.middleware` in settings.js to specify middleware for use with dashboard endpoint. See [PR #209](https://github.com/node-red/node-red-dashboard/pull/209/) for example usage.

**Fixes**

 - Ensure `msg.enabled` applies to all themes. Issue #481
 - Ensure theme applies to popup dialog alerts also.
 - Ensure slider only sends on mouse up when in that mode. Issue #490

### 2.14.0: Milestone Release

**Enhancements**

 - Allow Tabs to be hidden or disabled dynamically from a ui_control msg.
 - Finally remove deprecated second output from ui_chart node.
 - Allow ui_form to be submitted with empty fields (if they are not required)

**Fixes**

 - Don't try to close non-existent menu at start (logging issue only) - Issue #470
 - Add startsWith polyfill for IE11
 - Ensure active sidebar menu item is highlighted - Issue #472
 - Sanitise display of html input - Issue #473
 - Respect msg.socketid to return msg back to selected session when using ui_template
 - Allow dropdown to have 0 pre-configured values, by removing validation.

### 2.13.2: Maintenance Release

**Fixes**

 - Revert change that broke gauge pointer colours

### 2.13.1: Maintenance Release

**Fixes**

 - Fix ui_template to return correct sessionid to each browser.
 - Fix line chart xAxis hover to use same time format as main axis
 - Fix chart colours to have more than 9 colours just in case - Issue #465
 - Remove circular ref in menu that caused problems with 0.20 beta
 - Let ui_text node send data onBlur when in wait for key mode
 - Update Angular dependency to 1.7.6 - Issue #462
 - Add X-UA-Compatible tag to help to get IE-11 to behave
 - Fix css to use numerics not incorrect name - Issue #469

### 2.13.0: Milestone Release

**Enhancements**

 - Add ability to hide and/or disable tabs manually - PR #456

**Fixes**

 - Fix up ui_text toString mishandling error - Issue #459
 - Add some undo capability to ordering of widgets - Issue #461

### 2.12.2: Maintenance Release

**Fixes**

 - Revert change to button and switch typed inputs - Issue #455
 - Fix handling of {{msg.property}} handling for labels

### 2.12.1: Maintenance Release

**Fixes**

 - Ensure spacer actually gets created with no users

### 2.12.0: Milestone Release

**Enhancements**

 - Introduce concept of spacer nodes in groups to allow more widget layout options

**Fixes**

 - Set order value correctly for newly added ui nodes
 - Let ui_text node handle buffers without mangling to utf8
 - Fix ui_template info odd/even example to work again (after theme changes)
 - Ensure colour picker retains old value on multiple reloads when in dynamic mode - Issue #452
 - Fix missing page titles (mea culpa) - Issue #453

### 2.11.0: Milestone Release

**Enhancements**

 - Let side menu be locked open via site config tab - Issue #446
 - Let audio playback node show status in editor for debug

**Fixes**

 - Fix button background CSS so it can be over-ridden - Issue #444

### 2.10.1: Maintenance Release

**Enhancements**

 - Let slider only send on mouse release (discrete mode)

**Fixes**

 - Stop background path css escape for gauge
 - Fix radar chart so it picks up theme - Issue #443

### 2.10.0: Milestone Release

**Enhancements**

 - Add PR to allow pluggable widgets. PR #427
   - see https://github.com/node-red/node-red-dashboard/wiki/Creating-New-Dashboard-Widgets
 - Let users use 100% Angular theme if desired.
 - Add footer div with id nr-dashboard-footer to make targeting easier.
 - Add Japanese translations for ui_control node. PR #439

**Fixes**

 - Add polyfill for IE11 Object.assign. Issue #402
 - Tweak colour picker to default to solid colours
 - Fix up ng-click colours in list. Issue #433

### 2.9.8: Maintenance Release

**Fixes**

 - Tidy up dashboard widget list if widget moved then renamed. Issue #426
 - Let numeric widget handle angular filters again for value. Issue #428

### 2.9.7: Maintenance Release

**Enhancements**

 - Let link specify existing tab. Issue #420
 - Let bar charts specify legend if required. Issue #423
 - Add more links to lists of icons available.

**Fixes**

 - Ensure old forms Submit/Cancel buttons still display a value.
 - Let internal form elements scale more appropriately with grid size. Issue #416
 - Adjust slider timing to try to better smooth output

### 2.9.6: Maintenance Release

**Fixes**

 - Update socket.io to remove audit vulnerability. Issue #411

### 2.9.5: Maintenance Release

**Fixes**

 - Remove colour from button when in template in no style mode. Issue #400
 - Fix format support for numeric widget. Issue #401
 - Fix min-width of dropdown label field. Issue #405
 - Let blank value field in gauge NOT display the value text (default to payload). Issue #406
 - Let form buttons have changeable text. Issue #408

### 2.9.4: Maintenance Release

**Fixes**

 - Let text input node handle floating point input when in numeric mode. Issue #391
 - Fix incorrect scoping of colour palettes in charts. Issue #396
 - Docs updates re some of the ui_control to make groups show/hide.

### 2.9.3: Maintenance Release

**Fixes**

 - Revert change to sessionStorage - better fix for Issue #386, unfix Issue #384

### 2.9.2: Maintenance Release

**Fixes**

 - Let dropdown edit config, scale more sensibly on slide out.
 - Change to sessionStorage to mitigate httpAuth issue. Issue #384
 - Ensure groups are restored rather than completely disappeared on refresh. Issue #386
 - Let bar charts also auto scale negative values. Issue #387
 - Use rounded line joins on charts to reduce spiky-ness.
 - Ensure numeric input matches theme (now that it is editable)
 - Fix Gauge so {{ format }} works again.

### 2.9.1: Maintenance Release

**Fixes**

- Let dashboard work if localstorage not available. PR #383
- Let numeric field also be editable
- Clean up gauge value (to be more as previously). Issue #385

### 2.9.0: Milestone Release

**Enhancements**

 - Allow groups to be hidden and made visible via ui_control {group:{hide:["tab_name_group_name_with_underscores"],show:["another_group"],focus:true}}
 - Allow `readOnly:true` in settings.js `ui` section to disable all input to dashboard.
 You can still click/type but nothing gets sent to backend.
 - Add "No theme in ui_template" option to site options to allow regular angular theme through. Issue #379
 - Add option to remove hue slider from color-picker

 **Fixes**

 - Monkeypatch fix for Justgage negative numbers. Issue #113
 - Ensure toast is a string.
 - Clean up require of tinycolor2. Issue #367
 - Allow numeric input in form to accept floating point numbers. Issue #368
 - Fix small wrinkle in reset of head elements on reload
 - Fix Use of object assign for IE11. Issue #372
 - Fix button background colour for IE11. Issue #373
 - Let Gauge display invalid value as text, and set pointer to minimum value rather than 0
 - Fix date picker width to stop css overrides. Issue #378
 - Try to resolve blurred charts. Issues #302 and #380

### 2.8.2: Maintenance Release

**Enhancements**

  - Let Gauge units be specified by msg {{property}}

**Fixes**

 - Better fix for numeric field widths. Issue #344
 - Fix some theme <-> library consistency issues
 - Clean up old line chart data from other topics after 60s. Issue #342 and #360

### 2.8.1: Maintenance Release

**Enhancements**

 - Let Gauge widget accept {{payload.foo.bar}} style property input

**Fixes**

 - Fix references to FontAwesome to pin to version 4.7.0 icons
 - Give numeric field a width so buttons don't wobble (so much). Issue #344
 - Let gauge change labels more dynamically
 - ensure dateFormat defaults to something valid

### 2.8.0: Milestone Release

**Enhancements**

 - Allow groups to be collapsed (extra option in group config) - PR #333 Issue #73 and #177
 - Add a bit more status to switch, slider, numeric and dropdown - Issue #335
 - Add vertical slider capability if height > width
 - Add scope.theme to ui_template scope to allow users to pick up default colours
 - Add scope watch example to ui_template info panel

**Fixes**

 - Fix text time input format to report in milliseconds from local midnight
 - Fix change tab event to report correctly when switching to tab 0
 - Fix template editor minimum height so always visible
 - Fix sanitise notification html input, but allow basic markup.

### 2.7.0: Milestone Release

**Enhancements**

 - Add initial manifest.json capability for Android add to home screen
 - Add weather-icons-lite font - may finally close #165
 - Let boolean false values also create gaps in charts (as well as null)
 - Add status to switch widget (and slider, numeric and dropdown) - Issue #314
 - Add "welcome" page to blank dashboard - Issue #318
 - Add i18n for base pages (thanks Nishiyama-san)- PR #315

**Fixes**

 - Fix tab to send data from text entry field - Issue #307
 - Fix colour picker hex output/passthrough - Issue #308
 - Ensure there is a base tab to switch to at start - Issue #310
 - Constrain changetab event when starting up with blank dashboard
 - Update ui-masonry to fix layouts - PR #312
 - Fix path join for icon link to dashboard - Issue #319

### 2.6.2: Maintenance Release

**Fixes**

 - Fix problem with partial deploy - Issue #279
 - Remove `msg.` option from Button as makes no sense without node context - Issue #301
 - Better handling of empty data series in chart data

**Enhancements**

 - Add time option to text input widget.
 - Let colour picker optionally send outputs as they change - Issue #299

### 2.6.1: Maintenance Release

**Fixes**

 - Fix "connection lost" on initial load - Issue #298

### 2.6.0: Milestone Release

**Enhancements**

 - Let widgets have properties set by `msg.ui_control` object - see config-fields.md - Issue #235
 - Let charts lines have gaps by sending null as payload.

 **Fixes**

 - Fix TTS to pick correct voice at start  - Issue #291
 - Fix TTS to try to select similar voice across different browsers - Issue #292
 - Fix chart colours to re-initialise correctly on refresh - Issue #296

### 2.5.1: Maintenance Release

**Fixes**

 - Fix chart reference to 0.2.5 to the correct 2.5.0 - Issue #281
 - Fix line chart legend back to top and shrink colour swatch size - Issue #283
 - Fix bar chart colours to be like previous style
 - Fix blank array to clear out old and new style charts
 - Slight chart positioning adjustment

### 2.5.0: Milestone Release

**Enhancements**

 - Let ui_chart use chart.js style data array - faster, better data import/export, allow insert of data with `msg.timestamp`, bar chart supports multiple series using `msg.series` - Issues #261, #224, #144
 - Let chart accept non-timeseries array of data (just y values)
 - Let chart set x-axis labelling to automatic to try to best guess time units
 - Let widget size be specified by typed input as well as drag PR #270
 - Allow button to set colour and background colour via msg properties #275
 - Add browser side locale support for charts and datepicker number and date formatting.

**Fixes**

 - Fix ui_template msg.template lost on reload - Issue #266
 - Fix notification popup displays incorrect topic - Issue #269
 - Let switch label be set my message even if payload same as previously -Issue #274
 - Clean up any extra ui_base nodes that get imported - Issue #273
 - Make sure dropdown doesn't pass through when set not to pass-through - Issue #276

### 2.4.3: Maintenance Release

**Enhancements**

 - Add links to web pages of icons to Tab info
 - Let alerts contain html content - Issue #253
 - Let bar charts use same colour for all bars

 **Fixes**s

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
