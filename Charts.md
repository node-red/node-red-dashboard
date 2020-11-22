# Node-RED-Dashboard Charts

## Live data

To display live data just wire up an input with a `msg.payload` that contains a number.


### Line charts

To display two or more lines on the same chart then each `msg` must also contain `topic`
property that identifies which data series it belongs to - for example:

    {topic:"temperature", payload:22}
    {topic:"humidity", payload:66}

Each series will be represented by a different colour.
Alternatively you can use the property `series` instead of `topic` if you prefer.

It is possible to create "gaps" in line charts by sending either a null or boolean false as the payload.

You can also insert extra data points by specifying the `timestamp` property. This must be in
either epoch time (in miliseconds, not seconds), or ISO8601 format.

    {topic:"temperature", payload:22, timestamp:1520527095000}

### Bar, and other charts

If you want all the bars to be the same colour, then use the `label` property instead.

    {label:"indoor temperature", payload:22}
    {label:"outdoor temperature", payload:15}

You can have both a label and series property if you want.

## Stored data

To display a complete chart in one go - for example from a set of points retrieved from a database,
the data must be supplied in the form of an array, that holds an object that has `series`,`labels`, and `data` arrays.
This is broadly the same as the raw format used by the angular chart.js library.

You will need to process your data into this structure in order to render it correctly.

### Line charts

For line charts an example is given below

    [{
    "series": ["A", "B", "C"],
    "data": [
        [{ "x": 1504029632890, "y": 5 },
         { "x": 1504029636001, "y": 4 },
         { "x": 1504029638656, "y": 2 }
        ],
        [{ "x": 1504029633514, "y": 6 },
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
        "data": [ [5,6,9,10], [3,8,5,10], [6,7,2,10] ],
        "labels": [ "Jan", "Feb", "Mar", "Apr" ]
    }]

### Bar and Pie charts

for bars of different colours

    [{
        "series": [ "X", "Y", "Z"],
        "data": [ [5], [3], [6] ],
        "labels": [ "Jan" ]
    }]

for bars of the same colour, set the flag `Use first colour for all bars` in the
node configuration, and set labels for each column

    [{
        "series": [ "X" ],
        "data": [ [5,6,9] ],
        "labels": [ "Jan", "Feb", "Mar" ]
    }]

and these can be mixed - you can have series and labels defined...

    [{
        "series": ["X", "Y", "Z" ],
        "data": [ [5,6,9,10], [3,8,5,11], [6,7,2,12] ],
        "labels": [ "Jan", "Feb", "Mar", "Apr" ]
    }]

## Example

Here is an example you can import demonstrating many of these formats and capabilities

    [{"id":"1c24be99.3dc2f1","type":"function","z":"df030567.d1ff38","name":"","func":"var m={};\nm.labels = [\"January\", \"February\", \"March\", \"April\", \"May\", \"June\", \"July\"];\nm.series = ['Series A', 'Series B', 'Series C'];\nm.data = [\n    [65, 59, 80, 81, 56, 55, 40],\n    [28, 48, 40, 19, 86, 27, 90],\n    [38, 28, 20, 49, 45, 60, 20]\n  ];\nreturn {payload:[m]};","outputs":1,"noerr":0,"x":290,"y":360,"wires":[["80476e4d.6f64a","f4e610a1.1c381","fe515729.789e58","3c681829.4ff7d8"]]},{"id":"80476e4d.6f64a","type":"ui_chart","z":"df030567.d1ff38","name":"","group":"89749fb7.87f01","order":1,"width":0,"height":0,"label":"line chart","chartType":"line","legend":"false","xformat":"auto","interpolate":"linear","nodata":"No Data","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":0,"useOneColor":false,"colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":560,"y":100,"wires":[[],[]]},{"id":"2583d993.df9cb6","type":"function","z":"df030567.d1ff38","name":"","func":"var chart = [{\n    \"series\":[\"A\",\"B\",\"C\"],\n    \"data\":[[{\"x\":1504029632890,\"y\":5},{\"x\":1504029636001,\"y\":4},{\"x\":1504029638656,\"y\":2}],[{\"x\":1504029633514,\"y\":6},{\"x\":1504029636622,\"y\":7},{\"x\":1504029639539,\"y\":6}],[{\"x\":1504029634400,\"y\":7},{\"x\":1504029637959,\"y\":9},{\"x\":1504029640317,\"y\":7}]],\n    \"labels\":[\"\"]\n}];\nmsg.payload = chart;\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":200,"wires":[["80476e4d.6f64a"]]},{"id":"c4af128e.0eb42","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":1,"width":0,"height":0,"passthru":false,"label":"Time Line 1","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":150,"y":200,"wires":[["2583d993.df9cb6"]]},{"id":"f4e610a1.1c381","type":"ui_chart","z":"df030567.d1ff38","name":"","group":"89749fb7.87f01","order":2,"width":0,"height":0,"label":"bar chart","chartType":"bar","legend":"false","xformat":"HH:mm:ss","interpolate":"linear","nodata":"No Data","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":0,"colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":560,"y":160,"wires":[[],[]]},{"id":"ed9dcc7d.422ad","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":5,"width":0,"height":0,"passthru":false,"label":"array","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":130,"y":360,"wires":[["1c24be99.3dc2f1"]]},{"id":"fc7b7968.33bb08","type":"random","z":"df030567.d1ff38","name":"","low":"1","high":"10000000","inte":"true","x":320,"y":560,"wires":[["80476e4d.6f64a"]]},{"id":"12b813b5.e358bc","type":"inject","z":"df030567.d1ff38","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":150,"y":560,"wires":[["fc7b7968.33bb08"]]},{"id":"c6549407.0c1348","type":"function","z":"df030567.d1ff38","name":"","func":"var m={};\nm.labels = [10,20,30,40,50,60,70];\nm.series = ['Series A', 'Series B', 'Series C', 'Series D'];\nm.data = [\n    [65, 59, 80, 81, 56, 55, 40],\n    [28, 48, 40, 19, 86, 27, 90],\n    [38, 28, 20, 49, 45, 60, 20],\n    [58, 18, 40, 29, 15, 30, 60]\n  ];\nreturn {payload:[m]};","outputs":1,"noerr":0,"x":290,"y":400,"wires":[["80476e4d.6f64a","f4e610a1.1c381","fe515729.789e58","3c681829.4ff7d8"]]},{"id":"27cc2706.421b18","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":6,"width":0,"height":0,"passthru":false,"label":"array2","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":130,"y":400,"wires":[["c6549407.0c1348"]]},{"id":"7bcd06e3.5cbab8","type":"function","z":"df030567.d1ff38","name":"","func":"var chart = [{\n    \"series\":[\"A\",\"B\",\"C\"],\n        \"data\":[[{\"x\":1,\"y\":5},{\"x\":2,\"y\":4},{\"x\":3,\"y\":2}],[{\"x\":4,\"y\":6},{\"x\":5,\"y\":7},{\"x\":6,\"y\":6}],[{\"x\":7,\"y\":7},{\"x\":8,\"y\":9},{\"x\":9,\"y\":7}]],\n    \"labels\":[\"\"]\n}];\nmsg.payload = chart;\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":240,"wires":[["80476e4d.6f64a"]]},{"id":"219123f5.f1d76c","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":2,"width":0,"height":0,"passthru":false,"label":"Time Line 2","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":150,"y":240,"wires":[["7bcd06e3.5cbab8"]]},{"id":"22caebb3.7cfe94","type":"function","z":"df030567.d1ff38","name":"","func":"var m = {};\nm.labels = [\"Download\", \"In-Store\", \"Mail-Order\"];\nm.data = [[300, 500, 100]];\nm.series = [\"Sales\"];\nreturn {payload:[m],topic:msg.topic};","outputs":1,"noerr":0,"x":310,"y":600,"wires":[["3c681829.4ff7d8","f4e610a1.1c381","80476e4d.6f64a","f5108a61.91a6b8","c7f5183f.012728","fe515729.789e58"]]},{"id":"3c681829.4ff7d8","type":"ui_chart","z":"df030567.d1ff38","name":"pie chart","group":"89749fb7.87f01","order":3,"width":0,"height":0,"label":"pie chart","chartType":"pie","legend":"true","xformat":"HH:mm:ss","interpolate":"linear","nodata":"","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":"30","useOneColor":false,"colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":600,"y":340,"wires":[[],[]]},{"id":"7d0f50b6.398f3","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":10,"width":0,"height":0,"passthru":false,"label":"array for pie","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"Pie 4 T","x":150,"y":600,"wires":[["22caebb3.7cfe94"]]},{"id":"bf37d8d7.9bd558","type":"function","z":"df030567.d1ff38","name":"","func":"var chart = [{\n    \"series\":[\"A\",\"B\",\"C\"],\n        \"data\":[[{\"x\":1000000,\"y\":5},{\"x\":2000000,\"y\":4},{\"x\":3000000,\"y\":2}],[{\"x\":4000000,\"y\":6},{\"x\":5000000,\"y\":7},{\"x\":6000000,\"y\":6}],[{\"x\":7000000,\"y\":7},{\"x\":8000000,\"y\":9},{\"x\":9000000,\"y\":7}]],\n    \"labels\":[\"\"]\n}];\nmsg.payload = chart;\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":280,"wires":[["80476e4d.6f64a"]]},{"id":"e897b370.e8548","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":3,"width":0,"height":0,"passthru":false,"label":"Time Line 3","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":150,"y":280,"wires":[["bf37d8d7.9bd558"]]},{"id":"f6963e44.a328f","type":"function","z":"df030567.d1ff38","name":"","func":"var chart = [{\n    \"series\":[\"A\",\"B\",\"C\"],\n        \"data\":[[{\"x\":1000000000,\"y\":5},{\"x\":2000000000,\"y\":4},{\"x\":3000000000,\"y\":2}],[{\"x\":4000000000,\"y\":6},{\"x\":5000000000,\"y\":7},{\"x\":6000000000,\"y\":6}],[{\"x\":7000000000,\"y\":7},{\"x\":8000000000,\"y\":9},{\"x\":9000000000,\"y\":7}]],\n    \"labels\":[\"\"]\n}];\nmsg.payload = chart;\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":320,"wires":[["80476e4d.6f64a"]]},{"id":"9462d11a.374a1","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":4,"width":0,"height":0,"passthru":false,"label":"Time Line 4","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":150,"y":320,"wires":[["f6963e44.a328f"]]},{"id":"62668961.a49728","type":"function","z":"df030567.d1ff38","name":"","func":"var m={\n    \"series\":[\"X\",\"Y\",\"Z\"],\n    \"data\":[[5,6,9],[3,8,5],[6,7,2]],\n    \"labels\":[\"Jan\",\"Feb\",\"Mar\"]\n};\nreturn {payload:[m]};","outputs":1,"noerr":0,"x":290,"y":520,"wires":[["80476e4d.6f64a","f4e610a1.1c381","3c681829.4ff7d8","f5108a61.91a6b8","c7f5183f.012728","fe515729.789e58"]]},{"id":"b4c7442f.5481b8","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":9,"width":0,"height":0,"passthru":false,"label":"array3c","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":140,"y":520,"wires":[["62668961.a49728"]]},{"id":"da3771b3.5a321","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":11,"width":0,"height":0,"passthru":false,"label":"array 2 for pie","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"Pie Hole","x":160,"y":640,"wires":[["2b9c546c.58865c"]]},{"id":"2b9c546c.58865c","type":"function","z":"df030567.d1ff38","name":"","func":"var m = {};\nm.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];\nm.data = [[28, 48, 40, 19, 86, 27, 90]];\nm.series = ['Series A'];\nreturn {payload:[m],topic:msg.topic};","outputs":1,"noerr":0,"x":310,"y":640,"wires":[["3c681829.4ff7d8","f4e610a1.1c381","c7f5183f.012728","f5108a61.91a6b8","80476e4d.6f64a","fe515729.789e58"]]},{"id":"c0d6a942.dc82f8","type":"function","z":"df030567.d1ff38","name":"topic","func":"var m = [\n    {topic:\"X\", payload:22},\n    {topic:\"Y\", payload:66},\n    {topic:\"Z\", payload:42}\n    ];\nreturn [m];","outputs":1,"noerr":0,"x":290,"y":160,"wires":[["f4e610a1.1c381","3c681829.4ff7d8","80476e4d.6f64a","fe515729.789e58"]]},{"id":"b8f011ee.6b874","type":"inject","z":"df030567.d1ff38","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":140,"y":160,"wires":[["c0d6a942.dc82f8"]]},{"id":"23311ede.673912","type":"function","z":"df030567.d1ff38","name":"label","func":"var m = [\n    {label:\"A\", payload:22},\n    {label:\"B\", payload:66},\n    {label:\"C\", payload:42},\n    ];\nreturn [m];","outputs":1,"noerr":0,"x":290,"y":120,"wires":[["f4e610a1.1c381","3c681829.4ff7d8","80476e4d.6f64a","fe515729.789e58"]]},{"id":"564d1920.d756d8","type":"inject","z":"df030567.d1ff38","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":140,"y":120,"wires":[["23311ede.673912"]]},{"id":"437e7323.02763c","type":"function","z":"df030567.d1ff38","name":"","func":"var m={\n    \"series\":[\"X\",\"Y\",\"Z\"],\n    \"data\":[[5],[3],[6]],\n    \"labels\":[\"Jan\"]\n};\nreturn {payload:[m]};","outputs":1,"noerr":0,"x":290,"y":440,"wires":[["f4e610a1.1c381","f5108a61.91a6b8","c7f5183f.012728","80476e4d.6f64a","fe515729.789e58","3c681829.4ff7d8"]]},{"id":"e741cd13.7e8da","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":7,"width":0,"height":0,"passthru":false,"label":"array3a","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":140,"y":440,"wires":[["437e7323.02763c"]]},{"id":"10291d1f.0a5d13","type":"function","z":"df030567.d1ff38","name":"","func":"var m={\n    \"series\":[\"X\"],\n    \"data\":[[5,3,6]],\n    \"labels\":[\"Jan\",\"Feb\",\"Mar\"]\n};\nreturn {payload:[m]};","outputs":1,"noerr":0,"x":290,"y":480,"wires":[["f4e610a1.1c381","80476e4d.6f64a","c7f5183f.012728","f5108a61.91a6b8","fe515729.789e58","3c681829.4ff7d8"]]},{"id":"be38d116.6de45","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":8,"width":0,"height":0,"passthru":false,"label":"array3b","color":"","bgcolor":"","icon":"","payload":"","payloadType":"str","topic":"","x":140,"y":480,"wires":[["10291d1f.0a5d13"]]},{"id":"fe515729.789e58","type":"ui_chart","z":"df030567.d1ff38","name":"","group":"4e7edda4.417004","order":2,"width":0,"height":0,"label":"horizontal bar","chartType":"horizontalBar","legend":"false","xformat":"HH:mm:ss","interpolate":"linear","nodata":"","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":"30","colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":580,"y":220,"wires":[[],[]]},{"id":"f5108a61.91a6b8","type":"ui_chart","z":"df030567.d1ff38","name":"","group":"4e7edda4.417004","order":3,"width":0,"height":0,"label":"polar chart","chartType":"polar-area","legend":"false","xformat":"HH:mm:ss","interpolate":"linear","nodata":"","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":"30","colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":610,"y":460,"wires":[[],[]]},{"id":"c7f5183f.012728","type":"ui_chart","z":"df030567.d1ff38","name":"","group":"4e7edda4.417004","order":4,"width":0,"height":0,"label":"radar chart","chartType":"radar","legend":"false","xformat":"HH:mm:ss","interpolate":"linear","nodata":"","dot":false,"ymin":"","ymax":"","removeOlder":1,"removeOlderPoints":"","removeOlderUnit":"3600","cutout":"30","colors":["#1f77b4","#aec7e8","#ff7f0e","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5"],"useOldStyle":false,"x":610,"y":520,"wires":[[],[]]},{"id":"71de4fb7.df017","type":"function","z":"df030567.d1ff38","name":"label","func":"var m = [\n    {label:\"A\", payload:22, series:\"X\"},\n    {label:\"B\", payload:66, series:\"X\"},\n    {label:\"C\", payload:42, series:\"X\"},\n    {label:\"A\", payload:33, series:\"Y\"},\n    {label:\"B\", payload:72, series:\"Y\"},\n    {label:\"C\", payload:12, series:\"Y\"},\n    {label:\"A\", payload:44, series:\"Z\"},\n    {label:\"B\", payload:32, series:\"Z\"},\n    {label:\"C\", payload:80, series:\"Z\"}\n    ];\nreturn [m];","outputs":1,"noerr":0,"x":290,"y":80,"wires":[["3c681829.4ff7d8","f4e610a1.1c381","80476e4d.6f64a","fe515729.789e58"]]},{"id":"c2d23159.73b39","type":"inject","z":"df030567.d1ff38","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":140,"y":80,"wires":[["71de4fb7.df017"]]},{"id":"29cd8a13.ecade6","type":"ui_button","z":"df030567.d1ff38","name":"","group":"ab397e95.29ebe","order":11,"width":0,"height":0,"passthru":false,"label":"Clear All","color":"","bgcolor":"","icon":"","payload":"[]","payloadType":"json","topic":"","x":280,"y":40,"wires":[["c7f5183f.012728","f5108a61.91a6b8","3c681829.4ff7d8","fe515729.789e58","f4e610a1.1c381","80476e4d.6f64a"]]},{"id":"89749fb7.87f01","type":"ui_group","z":"","name":"Charts","tab":"d7901f40.2659d","order":2,"disp":false,"width":"6"},{"id":"ab397e95.29ebe","type":"ui_group","z":"","name":"Inputs","tab":"d7901f40.2659d","order":1,"disp":false,"width":"6"},{"id":"4e7edda4.417004","type":"ui_group","z":"","name":"Group 3","tab":"d7901f40.2659d","order":3,"disp":false,"width":"6"},{"id":"d7901f40.2659d","type":"ui_tab","z":"","name":"Charts","icon":"dashboard","order":2}]
