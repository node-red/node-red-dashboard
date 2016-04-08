/* global angular */
angular.module('ui').directive('uiMasonry', ['$window',
    function($window) {
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
    var colWidth = sizes.columns * sizes.sx + sizes.px * 2 + (sizes.columns - 1) * sizes.gx;
    ctrl.init = function (rootElement) {
        root = rootElement;
        root.addClass('masonry-container');
    };

    var refreshInProgress = false;
    ctrl.refreshLayout = function() {
        if (refreshInProgress) return;
        refreshInProgress = true;
        $timeout(function() {
            refreshSizes();
            refreshInProgress = false;
        }, 0);
    };

    function refreshSizes() {
        var children = root.children();
        var availableWidth = root.width();
        var columns = Math.max(1, Math.min(children.length, Math.floor(availableWidth / colWidth)));
        var leftPadding = Math.max(0, (availableWidth - columns * colWidth) / 2);
        var lasty = [];
        for (var i=0; i<columns; i++) lasty.push(sizes.gy*2);
        var maxy = 0;
        children.each(function () {
            var col = 0;
            var y = undefined;
            for (var i=0;i<columns;i++) {
                if (typeof y === 'undefined' || lasty[i] < y) {
                    y = lasty[i];
                    col = i;
                }
            }
            var x = col * colWidth;

            var child = $(this);
            child.css({
                left: leftPadding + x,
                top: y
            });
            child.addClass('visible');
            lasty[col] = y + child.height() + sizes.gy;
            maxy = Math.max(maxy, lasty[col]);
        });
        root.css('min-height', maxy + sizes.gy);
    }
}
