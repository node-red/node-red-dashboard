var sizes = {
    sx: 48, // width of <1> grid square
    sy: 48, // height of <1> grid square
    gx: 6, // gap between groups - group spacing
    gy: 6, // gap between groups
    cx: 6, // gap between components - widget spacing
    cy: 6, // gap between components
    px: 0, // padding of group's cards - group padding
    py: 0  // padding of group's cards
};

if (window.innerWidth < 350) {
    sizes.sx = 42;
    sizes.sy = 42;
}

sizes.setSizes = function(s) {
    sizes.sx = s.sx;
    sizes.sy = s.sy;
    sizes.gx = s.gx;
    sizes.gy = s.gy;
    sizes.cx = s.cx;
    sizes.cy = s.cy;
    sizes.px = s.px;
    sizes.py = s.py;
}

sizes.columns = function (group) {
    return parseInt(group.header.config.width);
}

angular.module('ui').value('uiSizes', sizes);
