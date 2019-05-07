/* global JustGage */
/* global angular */
angular.module('ui').directive('uiGauge', [ '$timeout', '$interpolate',
    function ($timeout, $interpolate) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'components/ui-gauge/ui-gauge.html',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    var gauge, bgnd, fgnd, unreg, unregtype;
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
                        // Wave type gauge
                        if (scope.$eval('me.item.gtype') === 'wave') {
                            document.getElementById("gauge_"+scope.$eval('$id')).innerHTML = '<svg id="gauge'+scope.$eval("$id")+'" style="width:100%; height:100%;"></svg>';
                            unregtype = scope.$watchGroup(['me.item.min','me.item.max','me.item.units','me.item.waveoptions','me.item.options'], function() {
                                if (unreg) { unreg(); }
                                var gaugeConfig = liquidFillGaugeDefaultSettings();
                                gaugeConfig.minValue = scope.$eval('me.item.min');
                                gaugeConfig.maxValue = scope.$eval('me.item.max');
                                gaugeConfig.units = scope.$eval('me.item.units');
                                gaugeConfig.textVertPosition = 0.33;
                                gaugeConfig.waveHeight = 0.09;
                                //gaugeConfig.waveAnimateTime = 10000;
                                gaugeConfig.waveRise = false;
                                gaugeConfig.waveCount = 2;
                                gaugeConfig.displayPercent = false;
                                var opts = scope.$eval('me.item.waveoptions');
                                gaugeConfig.circleColor = opts.circleColor[theme];
                                gaugeConfig.waveColor = opts.waveColor[theme];
                                gaugeConfig.textColor = opts.textColor[theme];
                                gaugeConfig.waveTextColor = opts.waveTextColor[theme];
                                if (gaugeConfig.circleColor === undefined) { gaugeConfig.circleColor = bgnd; }
                                if (gaugeConfig.waveColor === undefined) { gaugeConfig.waveColor = bgnd; }
                                if (gaugeConfig.textColor === undefined) { gaugeConfig.textColor = fgnd; }
                                if (gaugeConfig.waveTextColor === undefined) { gaugeConfig.waveTextColor = fgnd; }

                                if (scope.$eval('me.item.options') !== null) {
                                    //Object.assign(gaugeConfig, scope.$eval('me.item.options'));
                                    Object.keys(scope.$eval('me.item.options')).forEach(function(key) {
                                        gaugeConfig[key] = scope.$eval('me.item.options')[key];
                                    });
                                }
                                gauge = loadLiquidFillGauge("gauge"+scope.$eval('$id'), scope.$eval('me.item.value'), gaugeConfig);
                                unreg = scope.$watch('me.item.value', function(newValue) {
                                    gauge.update(newValue);
                                });
                            });
                        }
                        // Justgage type gauges
                        else {
                            unregtype = scope.$watchGroup(['me.item.min','me.item.max','me.item.seg1','me.item.seg2','me.item.colors','me.item.reverse','me.item.options'], function() {
                                if (unreg) { unreg(); }
                                document.getElementById("gauge_"+scope.$eval('$id')).innerHTML = "";
                                var gaugeOptions = {
                                    id: 'gauge_' + scope.$eval('$id'),
                                    value: scope.$eval('me.item.value'),
                                    min: scope.$eval('me.item.min'),
                                    max: scope.$eval('me.item.max'),
                                    reverse: scope.$eval('me.item.reverse'),
                                    hideMinMax: scope.$eval('me.item.hideMinMax'),
                                    levelColors: (scope.$eval('me.item.reverse')) ? scope.$eval('me.item.colors').reverse() : scope.$eval('me.item.colors'),
                                    valueMinFontSize: 12,
                                    minLabelMinFontSize: 8,
                                    labelMinFontSize: 8,
                                    titleFontFamily: "inherit",
                                    valueFontFamily: "inherit",
                                    //title: scope.$eval('me.item.title'),
                                    label: scope.$eval('me.item.units'),
                                    pointer: true,
                                    relativeGaugeSize: true,
                                    textRenderer: function(v) {
                                        return scope.$eval('me.item.getText()') || "";
                                    }
                                }
                                if (scope.$eval('me.item.gtype') === 'donut') {
                                    gaugeOptions.donut = true;
                                    //gaugeOptions.donutStartAngle = 270;
                                    gaugeOptions.pointer = false;
                                }

                                if (gaugeOptions.gaugeWidthScale === undefined) { delete gaugeOptions.gaugeWidthScale; }
                                if (gaugeOptions.gaugeColor === undefined) { gaugeOptions.gaugeColor = "rgba(127,127,127,0.5)"; }
                                if (gaugeOptions.pointerOptions === undefined) { gaugeOptions.pointerOptions = {color:tgnd}; }

                                if (scope.$eval('me.item.gtype') === 'compass') {
                                    gaugeOptions.donut = true;
                                    gaugeOptions.gaugeWidthScale = 0.2;
                                    gaugeOptions.pointer = true;
                                    gaugeOptions.refreshAnimationTime = 5;
                                    // gaugeOptions.pointerOptions = {toplength:12, bottomlength:12, bottomwidth:5, color:scope.$eval('me.item.gageoptions.compassColor')};
                                    gaugeOptions.pointerOptions = {toplength:12, bottomlength:12, bottomwidth:5, color:undefined};
                                    gaugeOptions.gaugeColor = scope.$eval('me.item.gageoptions.compassColor[theme]');
                                    gaugeOptions.levelColors = [scope.$eval('me.item.gageoptions.compassColor[theme]')];
                                    if (gaugeOptions.gaugeColor === undefined) { gaugeOptions.gaugeColor = fgnd; }
                                    if (gaugeOptions.pointerOptions.color === undefined) { gaugeOptions.pointerOptions.color = fgnd; }
                                }
                                else {
                                    var seg1 = scope.$eval('me.item.seg1');
                                    var seg2 = scope.$eval('me.item.seg2');
                                    if ((!isNaN(parseFloat(seg1))) && (!isNaN(parseFloat(seg2)))) {
                                        var colors = scope.$eval('me.item.colors');
                                        gaugeOptions.customSectors = [
                                            { color : colors[0], lo : gaugeOptions.min, hi : seg1 },
                                            { color : colors[1], lo : seg1, hi : seg2 },
                                            { color : colors[2], lo : seg2, hi : gaugeOptions.max }
                                        ]
                                        gaugeOptions.levelColorsGradient = false;
                                    }
                                }
                                if (scope.$eval('me.item.options') !== null) {
                                    //Object.assign(gaugeOptions, scope.$eval('me.item.options'));
                                    Object.keys(scope.$eval('me.item.options')).forEach(function(key) {
                                        gaugeOptions[key] = scope.$eval('me.item.options')[key];
                                    });
                                }

                                gauge = new JustGage(gaugeOptions);
                                gauge.refreshLabel = function(label) { var obj = this; if (label && (typeof label == "string")) { obj.txtLabel.attr({ "text":label }); }}

                                var oldUnits = "";
                                unreg = scope.$watch('me.item.value', function(newValue) {
                                    if (typeof newValue === "object") {
                                        newValue = scope.$eval('me.item.getText()');
                                    }
                                    if (isNaN(newValue = parseFloat(newValue))) {
                                        newValue = gaugeOptions.min;
                                    }
                                    if (scope.$eval('me.item.getUnits()') !== oldUnits) {
                                        oldUnits = scope.$eval('me.item.getUnits()');
                                        gaugeOptions.label = oldUnits;
                                        gauge.refreshLabel(oldUnits);
                                    }
                                    // if (scope.$eval('me.item.gtype') === 'compass') {
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
