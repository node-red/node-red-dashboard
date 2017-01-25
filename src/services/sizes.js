var sizes = {
    sx: 48, // width of <1> grid square
    sy: 48, // height of <1> grid square
    gx: 6, // gap between groups
    gy: 6, // gap between groups
    cx: 6, // gap between components
    cy: 6, // gap between components
    px: 0, // padding of group's cards
    py: 0  // padding of group's cards
};

sizes.columns = function (group) {
    return parseInt(group.header.config.width);
};

if (window.innerWidth < 350) {
    sizes.sx = sizes.sy = 42;
}

angular.module('ui').value('uiSizes', sizes);
