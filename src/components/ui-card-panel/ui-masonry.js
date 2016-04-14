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
		var sum = 0, c = 0;
		while (sum < availableWidth && c < (children.length)) {
			// how many groups can fit into one row/screen width?
			sum += getPxWidth(children[c]);
			c++;
		}
        var firstRow = Math.max(1, Math.min(children.length, (sum > availableWidth) ? (c-1) : c));
		var groupsWidth = 0;
        for (var i=0; i<firstRow; i++) {
			groupsWidth += getPxWidth(children[i]);
		}
		groupsWidth += (sizes.px * (children.length - 1)); // add gap between groups
        var leftPadding = Math.max(0, (availableWidth - groupsWidth) / 2);
		leftPadding = (getMaxWidth(children) + leftPadding > availableWidth) ? sizes.px : leftPadding;
        var maxy = 0;
        children.each(function (c) {
            var child = $(this);
            var x = 0, y = sizes.gy;
            for (var j = 0; j < maxy; j++) {
				if (j === maxy - 1) {
					x = 0;
					y = j;
					break;
				}
				var openX = getPxXOffset(children, c, j); // for the given y, what's the next available x-coordinate?
				if ( openX >= 0 && (openX + getPxWidth(child)) <= availableWidth - 2 * leftPadding) {
					y += j;
					x = openX
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

	function getPxWidth (group) {
		var cols = parseInt(angular.element(group).scope().group.header.config.width); // the number of columns defined for this group/child
		return (cols * sizes.sx) + (sizes.px * 2) + ((cols - 1) * sizes.gx); // the width in px of this group/child
	}

	function getPxXOffset (children, index, y) {
		var x = 0;
		for (var c = 0; c < index; c++) {
			var child = $(children[c]);
			// only offset the x if it can't go directly beneath the child
			x += ((child.height() + parseInt(child.css('top'))) > y) ? (child.width() + sizes.px) : 0;// + sizes.px) : 0;
		}
		return x;
	}

	function getMaxWidth(children) {
		var max = 0;
		children.each(function(i, c) {
			var width = getPxWidth(c);
			max = (width > max) ? width : max;
		});
		return max;
	}
}
