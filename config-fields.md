
The following configuration properties of nodes can be set by using a `msg.ui_control` property.
Multiple properties of the node can be set at the same time. eg `{ "min":10, "max":50 }`

Note: It is still recommended that nodes are configured via the editor in order to preset the default values.

|widget                 |property           |type
|---                    |---                |---
|ui_button              |color              |string
|                       |bgcolor            |string
|                       |icon               |string
|                       |format             |string
|ui_chart               |look               |string
|                       |legend             |boolean
|                       |interpolate        |string
|                       |nodata             |string
|                       |ymin               |string
|                       |ymax               |string
|                       |dot                |boolean
|                       |xformat            |string
|                       |cutout             |number
|                       |colors             |object
|                       |useOneColor        |boolean
|ui_colour_picker       |format             |string
|                       |showPicker         |boolean
|                       |showSwatch         |boolean
|                       |showValue          |boolean
|                       |showAlpha          |boolean
|                       |showLightness      |boolean
|ui_dropdown            |place              |string
|                       |options            |array
|ui_gauge               |gtype              |string
|                       |min                |number
|                       |max                |number
|                       |seg1               |number
|                       |seg2               |number
|                       |colors             |array
|                       |options            |object
|ui_numeric             |format             |string
|                       |min                |number
|                       |max                |number
|                       |step               |number
|ui_slider              |min                |number
|                       |max                |number
|                       |step               |number
|ui_switch              |onicon             |string
|                       |officon            |string
|                       |oncolor            |string
|                       |offcolor           |string
|ui_template            |format             |string
|                       |templateScope      |string
|ui_text                |format             |string
|                       |layout             |string
|ui_text_input          |mode               |string
|                       |delay              |number
