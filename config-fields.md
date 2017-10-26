
## UI Widget configuration via msg.ui_control

The following configuration properties of ui widget nodes can be set by using a `msg.ui_control` property on a msg.
Multiple properties of the node can be set at the same time. eg `{ "min":10, "max":50 }`

**Note**: It is still recommended that nodes are configured via the editor in order to preset the default values.

|widget                 |property           |type       | notes / example
|---                    |---                |---        |---
|ui_button              |color              |string     | not needed
|                       |bgcolor            |string     | not needed
|                       |icon               |string     | on refresh
|                       |format             |string     | not needed
|ui_chart               |look               |string     |"line","bar","horizontalBar","pie","polar-area","radar"
|                       |legend             |boolean    |&nbsp;
|                       |interpolate        |string     |"linear","step","bezier"
|                       |nodata             |string     |&nbsp;
|                       |ymin               |number     |&nbsp;
|                       |ymax               |number     |&nbsp;
|                       |dot                |boolean    |&nbsp;
|                       |xformat            |string     |"HH:mm:ss"
|                       |cutout             |number     |&nbsp;
|                       |colors             |object     | n/a
|                       |useOneColor        |boolean    | n/a
|                       |spanGaps           |boolean    | n/a
|                       |animation          |string     | (Note 1), {duration:1000, easing:"easeInOutSine"}
|ui_colour_picker       |format             |string     | on refresh
|                       |showPicker         |boolean    | on refresh
|                       |showSwatch         |boolean    | on refresh
|                       |showValue          |boolean    | on refresh
|                       |showAlpha          |boolean    | on refresh
|                       |showLightness      |boolean    | on refresh
|ui_dropdown            |place              |string     |"placeholder text"
|                       |options            |array      |[{"label":"foo","value":"0","type":"str"}]
|ui_gauge               |gtype              |string     |"gage", "donut", "compass", "wave"
|                       |min                |number     |&nbsp;
|                       |seg1               |number     |segment 1 limit
|                       |seg2               |number     |segment 2 limit
|                       |max                |number     |&nbsp;
|                       |colors             |array      |["blue","#00ff00","#f00"]
|                       |options            |object     |(see Note 2 below)
|ui_numeric             |min                |number     |&nbsp;
|                       |max                |number     |&nbsp;
|                       |step               |number     |&nbsp;
|                       |format             |string     |"{{value}}"
|ui_slider              |min                |number     |&nbsp;
|                       |max                |number     |&nbsp;
|                       |step               |number     |&nbsp;
|ui_switch              |onicon             |string     | all or nothing
|                       |officon            |string     | all or nothing
|                       |oncolor            |string     | all or nothing
|                       |offcolor           |string     | all or nothing
|ui_template            |format             |string     | the script
|                       |templateScope      |string     | "local" or "global"
|ui_text                |format             |string     |"{{value}}"
|                       |layout             |string     | "row-left", "row-right", etc
|ui_text_input          |mode               |string     | "text", "email", "password", "color"
|                       |delay              |number     |&nbsp;

**Notes**:

 1. See http://easings.net/ for examples of easings for chart animation.

 2. The gauge options can accept any of the [Justgage parameters](https://github.com/toorshia/justgage/blob/master/justgage.js#L42) for example:

         {"options":{"pointer":false,"gaugeWidthScale":1.5}}
         {"options":{"pointer":true,"gaugeWidthScale":0.4,"reverse":true}}

Likewise the Wave type gauge can accept [liquidfillgauge config](http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6) options for example:

        {options:{circleColor:"#FF7777", textColor:"#FF4444", waveTextColor:"#FFAAAA", waveColor:"#FFDDDD", circleThickness:0.3, textVertPosition:0.2, waveHeight:0.05, waveCount:8}}
