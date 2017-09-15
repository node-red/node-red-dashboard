# Node-RED-Dashboard Charts

### Live data

To display live data just wire up an input with a `msg.payload` that contains a number.

To display two or more lines on the same chart then each `msg` must also contain `topic`
property that identifies which data series it belongs to - for example:

    {topic:"temperature", payload:22}
    {topic:"humidity", payload:66}

Each series will be represented by a different colour.

For bar charts - if you want all the bars to be the same colour, then use the `label`
property instead of `topic`.

    {label:"indoor temperature", payload:22}
    {label:"outdoor temperature", payload:15}

### Stored data

To display a complete chart in one go - for example from a set of points retrieved from a database,
the data must be supplied in the form of an array, that holds an object that has `series`,`labels`, and 'data' arrays.
This is broadly the same as the raw chart.js format.

You will need to process your data into this structure in order to render it correctly.

#### Line charts

For line charts an example is given below

    [{
    "series": ["A", "B", "C"],
    "data": [
        [{ "x": 1504029632890, "y": 5 },
         { "x": 1504029636001, "y": 4 },
         { "x": 1504029638656, "y": 2 }
        ],
        [{ "x": 154029633514, "y": 6 },
         { "x": 1504029636622, "y": 7 },
         { "x": 1504029639539, "y": 6 }
        ],
        [{ "x": 1504029634400, "y": 7 },
         { "x": 1504029637959, "y": 7 },
         { "x": 1504029640317, "y": 7 }
        ]
    ],
    "labels": [""]
    }]

For non-timeseries data - for example data in labelled categories, rather than use x and y,
the format should be as follows:

    [{
        "series": ["X", "Y", "Z" ],
        "data": [ [5,6,9], [3,8,5], [6,7,2] ],
        "labels": [ "Jan", "Feb", "Mar" ]
    }]

#### Bar charts

for bars of different colours

    [{
        "series": [ "X", "Y", "Z"],
        "data": [ [9], [3], [7] ],
        "labels": [ "Jan" ]
    }]

for bars of the same colour

    [{
        "series": [ "X" ],
        "data": [ [5,6,9] ],
        "labels": [ "Jan", "Feb", "Mar" ]
    }]

and these can be mixed - you can have series and labels defined...

    [{
        "series": ["X", "Y", "Z" ],
        "data": [ [5,6,9], [3,8,5], [6,7,2] ],
        "labels": [ "Jan", "Feb", "Mar" ]
    }]
