/* global angular */
/* global $ */
angular.module('ui').controller('uiCardPanelController', ['uiSizes', '$timeout', '$scope',
    function(sizes, $timeout, $scope) {
        var ctrl = this;
        ctrl.width = (sizes.columns($scope.group) * sizes.sx) + (sizes.px * 2) + ((sizes.columns($scope.group) - 1) * sizes.cx);
        var defaultWidth = sizes.columns($scope.group);
        var defaultHeight = 0;

        var root;
        ctrl.init = function (rootElement) {
            root = rootElement;
        };

        var refreshInProgress = false;
        ctrl.refreshLayout = function(done) {
            if (refreshInProgress) {
                return;
            }
            refreshInProgress = true;
            $timeout(function() {
                refreshSizes();
                refreshInProgress = false;
                if (done) { done(); }
            }, 25);
        };

        var rows;
        function refreshSizes() {
            rows = [];
            root.children().each(function () {
                var child = $(this);
                var size = child.find('[ui-card-size]:first').attr('ui-card-size') || child.attr('ui-card-size');
                var result = size.split('x');
                var width = Math.max(1, Math.min(sizes.columns($scope.group), result ? parseInt(result[0]) || defaultWidth : defaultWidth));
                var height = Math.max(1, result ? parseInt(result[1]) || defaultHeight : defaultHeight);
                if ((parseInt(result[1]) == 0) && (child.attr('ui-template') !== undefined)) { /*is template node*/
                    // template node will size the height based upon it's content
                    // - child.height() defaults to calculating based on width of group
                    var ch = child.height() * parseInt($scope.group.header.config.width)/width;
                    if (!ch || (ch <= 0)) { // if height is 0 or undefined
                        ch = 0;
                        var t = (child[0].innerHTML).toLowerCase();
                        if (t.indexOf('<div') !== -1) { ch = 1; }
                        if (t.indexOf('<p') !== -1) { ch = 1; }
                        if (t.indexOf('<span') !== -1) { ch = 1; }
                        if (t.indexOf('<b') !== -1) { ch = 1; }
                        if (t.indexOf('<h') !== -1) { ch = 1; }
                        if (t.indexOf('<f') !== -1) { ch = 1; }
                    }
                    height = Math.ceil(ch / (sizes.cy + sizes.sy));
                }
                if ((parseInt(result[1]) < 0) && (child.attr('ui-template') !== undefined)) {
                    height = 0;
                }

                var position = getNextPosition(width, height);
                child.css({
                    left: position.left,
                    top: position.top,
                    width: sizes.sx * width + sizes.cx * (width-1),
                    height: sizes.sy * height + sizes.cy * (height-1)
                });
                if (height !== 0) {
                    child.addClass('visible');
                }
            });
            ctrl.height = rows.length ?
                sizes.py * 2 + rows.length * sizes.sy + (rows.length - 1) * sizes.cy :
                0;
        }

        function getNextPosition(width, height) {
            var pos = getFreeAndOccupy(width, height);
            return {
                top: sizes.py + pos.y * sizes.sy + pos.y * sizes.cy,
                left: sizes.px + pos.x * sizes.sx + pos.x * sizes.cx
            };
        }

        function getFreeAndOccupy(width, height) {
            var maxx = sizes.columns($scope.group) - width;
            for (var y=0; y<1000; y++) {
                for (var x=0; x<=maxx; x++) {
                    if (isFree(x, y, width, height)) {
                        occupy(x,y,width,height);
                        return {x:x, y:y};
                    }
                }
            }
        }

        function occupy(x, y, width, height) {
            for (var dy=0; dy<height; dy++) {
                var row = rows[y+dy];
                if (!row) {
                    rows[y+dy] = row = new Array(sizes.columns($scope.group));
                }
                for (var dx=0; dx<width; dx++) {
                    row[x+dx] = true;
                }
            }
        }

        function isFree(x, y, width, height) {
            for (var dy=0; dy<height; dy++) {
                var row = rows[y+dy];
                if (!row) {
                    break;
                }
                for (var dx=0; dx<width; dx++) {
                    if (row[x+dx]) {
                        return false;
                    }
                }
            }
            return true;
        }
    }]);
