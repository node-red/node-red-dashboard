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

#### 2.0.0: Milestone Release

 - First release published to npm!
