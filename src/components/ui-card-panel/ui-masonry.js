/* global angular */
angular.module('ui').directive('uiMasonry', ['$window',
    function ($window) {
        return {
            restrict: 'A',
            controller: MasonryController,
            link: function (scope, element, attrs, controller) {
                controller.init(element);
                angular.element($window).on('resize', function () {
                    controller.refreshLayout();
                });
            }
        };
    }]);

MasonryController.$inject = ['uiSizes', '$timeout'];

function MasonryController(sizes, $timeout) {
    var ctrl = this;
    var root;
    var firstRow;
    ctrl.init = function (rootElement) {
        root = rootElement;
        root.addClass('masonry-container');
    };

    var refreshInProgress = false;
    ctrl.refreshLayout = function () {
        if (refreshInProgress) { return; }
        refreshInProgress = true;
        $timeout(function () {
            refreshSizes();
            refreshInProgress = false;
        }, 0);
    };

    function refreshSizes() {
        var children = root.children();
        var availableWidth = root.width();
        var sum = 0;
        var c = 0;
        while (sum < availableWidth && c < (children.length)) {
            // how many groups can fit into one row/screen width?
            sum += getPxWidth(children[c]);
            sum += sizes.gx;
            c++;
        }
        sum -= sizes.gx;

        firstRow = Math.max(1, Math.min(children.length, (sum > availableWidth) ? (c - 1) : c));

        var groupsWidth = 0;
        for (var i = 0; i < firstRow; i++) {
            groupsWidth += getPxWidth(children[i]);
        }
        groupsWidth += (sizes.gx * (firstRow - 1)); // add gap between groups
        var leftPadding = Math.max(0, (availableWidth - groupsWidth) / 2);
        leftPadding = (getMaxWidth(children) + leftPadding > availableWidth) ? sizes.px : leftPadding;

        var maxy = 0;
        children.each(function (c) {
            var child = $(this);
            var x = 0, y = sizes.gy;
            for (var j = 0; j < maxy; j++) {
                if (j === maxy - 1) {
                    // place the group on a new row
                    x = 0;
                    y = j;
                    break;
                }
                var maxx = availableWidth - 2 * leftPadding;
                var openX = getPxXOffset(children, c, maxx, j); // for the given y, <j>, what's the next available x-coordinate?
                if (openX >= 0 && (openX + getPxWidth(child)) <= maxx) {
                    y += j;
                    x = openX;
                    break;
                }
            }
            child.css({
                left: leftPadding + x,
                top: y
            });
            child.addClass('visible');
            maxy = Math.max(maxy, y + child.height() + sizes.gy);
        });
        root.css('min-height', maxy + sizes.gy);
    }

    function getPxWidth(group) {
        var cols = parseInt(angular.element(group).scope().group.header.config.width); // the number of columns defined for this group/child
        return (cols * sizes.sx) + (sizes.px * 2) + ((cols - 1) * sizes.gx); // the width in px of this group/child
    }

    // calculate the next available x-coordinate in the x-axis for a given y for <child>
    function getPxXOffset(children, maxindex, maxx, y) {
        var x = 0;
        var child = $(children[maxindex]);
        // index === the number of children before current child
        for (var i = 0; i < maxindex; i++) {
            var c = $(children[i]);
            // if the child exists at the same <y>
            if (c.height() + parseInt(c.css('top')) > y) {
                // and space is not available
                if ((x + c.width() + sizes.gx) > parseInt(c.css('left'))) {
                    x += c.width() + sizes.gx;
                }
                else if (parseInt(c.css('left')) > (c.width() + sizes.gx)) {
                    if (firstRow >= (maxindex+1)) { x += c.width() + sizes.gx; }
                }
            }
        }
        return x;
    }

    function getMaxWidth(children) {
        var max = 0;
        children.each(function (i, c) {
            var width = getPxWidth(c);
            max = (width > max) ? width : max;
        });
        return max;
    }
}
