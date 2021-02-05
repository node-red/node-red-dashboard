/* global angular JustGage loadLiquidFillGauge liquidFillGaugeDefaultSettings */
angular.module('ui').directive('uiGauge', [ '$timeout', '$interpolate',
    function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/ui-gauge/ui-gauge.html',
            link: function(scope) {
                $timeout(function() {
                    var gauge, bgnd, fgnd, tgnd, unreg, unregtype;
                    var theme = scope.$eval('main.selectedTab.theme.name') || "theme-light";
                    var themeState = scope.$eval('main.selectedTab.theme.themeState');
                    if (themeState) {
                        bgnd = themeState["widget-borderColor"].value;
                        fgnd = themeState['widget-backgroundColor'].value;
                        tgnd = themeState['widget-textColor'].value;
                    }
                    //Backwards compatability for background and foreground
                    if (!bgnd || !fgnd) {
                        if (theme === 'theme-dark') {
                            bgnd = "#097479";
                            fgnd = "#eeeeee";
                            tgnd = "#eeeeee";
                        }
                        else {
                            bgnd = "#0094CE";
                            fgnd = "#111111";
                            tgnd = "#111111";
                        }
                    }

                    scope.$watch('me.item.gtype', function() {
                        if (unregtype) { unregtype(); }
                        var item = scope.$eval('me.item');
                        var id = scope.$eval('$id');
                        // Wave type gauge
                        if (item.gtype === 'wave') {
                            document.getElementById("gauge_"+id).innerHTML = '<svg id="gauge'+id+'" style="width:100%; height:100%;"></svg>';
                            unregtype = scope.$watchGroup(['me.item.min','me.item.max','me.item.units','me.item.waveoptions','me.item.options'], function() {
                                if (unreg) { unreg(); }
                                var gaugeConfig = liquidFillGaugeDefaultSettings();
                                gaugeConfig.minValue = item.min;
                                gaugeConfig.maxValue = item.max;
                                gaugeConfig.units = item.units;
                                gaugeConfig.textVertPosition = 0.33;
                                gaugeConfig.waveHeight = 0.09;
                                //gaugeConfig.waveAnimateTime = 10000;
                                gaugeConfig.waveRise = false;
                                gaugeConfig.waveCount = 2;
                                gaugeConfig.displayPercent = false;
                                var opts = item.waveoptions;
                                gaugeConfig.circleColor = opts.circleColor[theme];
                                gaugeConfig.waveColor = opts.waveColor[theme];
                                gaugeConfig.textColor = opts.textColor[theme];
                                gaugeConfig.waveTextColor = opts.waveTextColor[theme];
                                if (gaugeConfig.circleColor === undefined) { gaugeConfig.circleColor = bgnd; }
                                if (gaugeConfig.waveColor === undefined) { gaugeConfig.waveColor = bgnd; }
                                if (gaugeConfig.textColor === undefined) { gaugeConfig.textColor = fgnd; }
                                if (gaugeConfig.waveTextColor === undefined) { gaugeConfig.waveTextColor = fgnd; }
                                if (item.options !== null) {
                                    //Object.assign(gaugeConfig, item.options'));
                                    Object.keys(item.options).forEach(function(key) {
                                        gaugeConfig[key] = item.options[key];
                                    });
                                }
                                gauge = loadLiquidFillGauge("gauge"+id, item.value, gaugeConfig);
                                unreg = scope.$watch('me.item.value', function(newValue) {
                                    newValue = item.getText();
                                    if (isNaN(newValue) || newValue === "") { newValue = gaugeConfig.minValue; }
                                    gauge.update(newValue);
                                });
                            });
                        }
                        // Justgage type gauges
                        else {
                            unregtype = scope.$watchGroup(['me.item.min','me.item.max','me.item.seg1','me.item.seg2','me.item.colors','me.item.reverse','me.item.options'], function() {
                                if (unreg) { unreg(); }
                                document.getElementById("gauge_"+id).innerHTML = "";
                                var gaugeOptions = {
                                    id: 'gauge_' + id,
                                    value: item.value,
                                    min: item.min,
                                    max: item.max,
                                    reverse: item.reverse,
                                    hideMinMax: item.hideMinMax,
                                    levelColors: (item.reverse) ? item.colors.reverse() : item.colors,
                                    valueMinFontSize: 12,
                                    minLabelMinFontSize: 8,
                                    labelMinFontSize: 8,
                                    titleFontFamily: "inherit",
                                    valueFontFamily: "inherit",
                                    //title: item.title'),
                                    label: item.units,
                                    pointer: true,
                                    relativeGaugeSize: false,
                                    textRenderer: function() {
                                        return item.getText() || "";
                                    }
                                }
                                if (item.gtype === 'donut') {
                                    gaugeOptions.donut = true;
                                    //gaugeOptions.donutStartAngle = 270;
                                    gaugeOptions.pointer = false;
                                }

                                if (gaugeOptions.gaugeWidthScale === undefined) { delete gaugeOptions.gaugeWidthScale; }
                                if (gaugeOptions.gaugeColor === undefined) { gaugeOptions.gaugeColor = "rgba(127,127,127,0.5)"; }
                                if (gaugeOptions.pointerOptions === undefined) { gaugeOptions.pointerOptions = {color:tgnd}; }

                                if (item.gtype === 'compass') {
                                    gaugeOptions.donut = true;
                                    gaugeOptions.gaugeWidthScale = 0.3;
                                    gaugeOptions.pointer = true;
                                    gaugeOptions.refreshAnimationTime = 5;
                                    // gaugeOptions.pointerOptions = {toplength:12, bottomlength:12, bottomwidth:5, color:item.gageoptions.compassColor')};
                                    gaugeOptions.pointerOptions = {toplength:12, bottomlength:16, bottomwidth:8, color:undefined};
                                    gaugeOptions.gaugeColor = item.gageoptions.compassColor[theme];
                                    gaugeOptions.levelColors = [item.gageoptions.compassColor[theme]];
                                    if (gaugeOptions.gaugeColor === undefined) { gaugeOptions.gaugeColor = fgnd; }
                                    if (gaugeOptions.pointerOptions.color === undefined) { gaugeOptions.pointerOptions.color = fgnd; }
                                }
                                else {
                                    var seg1 = item.seg1;
                                    var seg2 = item.seg2;
                                    if ((!isNaN(parseFloat(seg1))) && (!isNaN(parseFloat(seg2)))) {
                                        var colors = item.colors;
                                        gaugeOptions.customSectors = {percents:false, ranges:[
                                            { color : colors[0], lo : gaugeOptions.min, hi : seg1 },
                                            { color : colors[1], lo : seg1, hi : seg2 },
                                            { color : colors[2], lo : seg2, hi : gaugeOptions.max }
                                        ]}
                                        gaugeOptions.noGradient = true;
                                    }
                                }
                                gaugeOptions.valueFontColor = item.gageoptions.valueFontColor[theme];
                                gaugeOptions.labelFontColor = item.gageoptions.valueFontColor[theme];
                                if (item.options !== null) {
                                    //Object.assign(gaugeOptions, item.options'));
                                    Object.keys(item.options).forEach(function(key) {
                                        gaugeOptions[key] = item.options[key];
                                    });
                                }

                                gauge = new JustGage(gaugeOptions);
                                gauge.refreshLabel = function(label) { var obj = this; if (label && (typeof label == "string")) { obj.txtLabel.attr({ "text":label }); }}

                                var oldUnits = "";
                                unreg = scope.$watch('me.item.value', function(newValue) {
                                    if (typeof newValue === "object") {
                                        newValue = item.getText();
                                    }
                                    if (isNaN(newValue = parseFloat(newValue))) {
                                        newValue = gaugeOptions.min;
                                    }
                                    if (item.getUnits() !== oldUnits) {
                                        oldUnits = item.getUnits();
                                        gaugeOptions.label = oldUnits;
                                        gauge.refreshLabel(oldUnits);
                                    }
                                    // if (item.gtype') === 'compass') {
                                    //     var r = gaugeOptions.max - gaugeOptions.min;
                                    //     newValue = (newValue + r) % r;
                                    // }
                                    gauge.refresh(newValue);
                                });
                            });
                        }
                    });
                }, 0);
            }
        }
    }]);
