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
    }
]);

MasonryController.$inject = ['uiSizes', '$timeout'];

function blockSort(b1,b2) {
    if (b1.y < b2.y) {
        return -1;
    }
    if (b1.y > b2.y) {
        return 1;
    }
    return (b1.x - b2.x)
}

function intersectBlock(r1, r2) {
    // left .x
    // top .y
    // right x + w
    // bottom y + h
    // !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top)
    return ! ( r2.x > r1.x || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
}

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
        }, 10);
    };

    function refreshSizes() {
        var children = root.children();
        var availableWidth = root.width() - (sizes.gx*2);
        var maxy = 0;
        var maxx = 0;

        // blocks is an array of potential locations for groups to be placed
        var blocks = [{x:0,y:sizes.gy,w:availableWidth,h:Infinity,used:false}];
        var assignedBlocks = [];
        var blockCache = {};
        blockCache["0:"+(sizes.gy)] = blocks[0];
        var blockCacheKey;
        children.each(function(c) {
            var child = $(this);
            var cw = child.width();
            var ch = child.height();
            var j;
            var added = false;
            // For this group, find the best fit block to place it in
            for (var i=0; i<blocks.length; i++) {
                var b = blocks[i];
                // Ignore blocks that have already been assigned, or that are too small
                if (!b.used && cw <= b.w && ch <= b.h) {
                    var clear = true;
                    // If this group is placed in this block (b), check it won't overlap any
                    // existing occupied blocks
                    for (j=0; j<assignedBlocks.length; j++) {
                        var b2 = assignedBlocks[j];
                        if (intersectBlock(b, b2)) {
                            blockCacheKey = b.x+":"+(b2.y+b2.h+sizes.gy);
                            if (!blockCache[blockCacheKey]) {
                                blocks.push({
                                    x:b.x,
                                    y:b2.y+b2.h+sizes.gy,
                                    w:b.w,
                                    h:b.h,
                                    used:false
                                });
                                blockCache[blockCacheKey] = blocks[blocks.length-1];
                                blocks.sort(blockSort);
                            }
                            clear = false;
                            break;
                        }
                    }
                    if (!clear) {
                        continue;
                    }
                    // This block is suitable for use, so place the group in it
                    b.used = true;
                    b.group = child;
                    b.assigned = true;
                    assignedBlocks.push(b);
                    added = true;
                    // Add new candidate blocks to the right and below the group
                    clear = true;
                    var rightBlock = {
                        x:b.x+cw+sizes.gx,
                        y:b.y,
                        w:b.w - sizes.gx - cw,
                        h:b.h,
                        used:false
                    };
                    blockCacheKey = (b.x+cw+sizes.gx)+":"+b.y;
                    if (!blockCache[blockCacheKey]) {
                        // Check the candidate block on the right doesn't overlap anything
                        for (j=0; j<assignedBlocks.length; j++) {
                            var b3 = assignedBlocks[j];
                            if (b3 !== b && b3.x <= rightBlock.x && b3.x+b3.w >= rightBlock.x && b3.y <= rightBlock.y && b3.y+b3.h >= rightBlock.y) {
                                clear = false;
                                break;
                            }
                        }
                        if (clear) {
                            blockCache[blockCacheKey] = rightBlock;
                            blocks.push(rightBlock);

                        }
                    }

                    // block below definitely clear
                    blockCacheKey = b.x+":"+(b.y+ch+sizes.gy);
                    if (!blockCache[blockCacheKey]) {
                        blocks.push({
                            x:b.x,
                            y:b.y+ch+sizes.gy,
                            w:b.w,
                            h:b.h,
                            used:false
                        });
                        blockCache[blockCacheKey] = blocks[blocks.length-1];
                    }
                    b.w = cw;
                    b.h = ch;
                    break;
                }
            }
            if (!added) {
                // Find the bottom
                assignedBlocks.forEach(function(b) {
                    maxy = Math.max(maxy,b.y+b.h);
                });
                var bottomBlock;
                bottomBlock = blockCache["0:"+(maxy+sizes.gy)];
                if (!bottomBlock) {
                    bottomBlock = {x:0, y: maxy+sizes.gy}
                    blockCache["0:"+(maxy+sizes.gy)] = bottomBlock;
                }
                bottomBlock.used = true;
                bottomBlock.group = child;
                bottomBlock.assigned = true;
                bottomBlock.w = cw;
                bottomBlock.h = ch;
                blocks.push(bottomBlock);
                assignedBlocks.push(bottomBlock);

                blockCacheKey = "0:"+(bottomBlock.y+ch+sizes.gy);
                if (!blockCache[blockCacheKey]) {
                    blocks.push({
                        x:0,y:bottomBlock.y+ch+sizes.gy,w:availableWidth,h:Infinity
                    });
                    blockCache[blockCacheKey] = blocks[blocks.length-1];
                }
            }
            // Resort the blocks to ensure they are ordered top to bottom
            blocks.sort(blockSort);
            // console.table(blocks);
        });
        assignedBlocks.forEach(function(b) {
            maxx = Math.max(maxx,b.x+b.w);
            maxy = Math.max(maxy,b.y+b.h);
        });
        var leftPadding = Math.max(0,sizes.gx+(availableWidth - maxx)/2);
        assignedBlocks.forEach(function(b) {
            b.group.css({
                left: leftPadding + b.x,
                top: b.y
            }).addClass('visible');
        });
        root.css('min-height', maxy + sizes.gy + 3);
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
            var top = parseInt(c.css('top'));
            if (c.height() + top >= y) {
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
