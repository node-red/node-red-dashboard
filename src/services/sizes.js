var sizes = {
    sx: 50, // width of <1> grid square
    sy: 50, // height of <1> grid square
    cx: 7, // gap between components
    cy: 7, // gap between components
    gx: 7, // gap between groups
    gy: 7, // gap between groups
    px: 7, // padding of group's cards
    py: 7  // padding of group's cards
};

sizes.columns = function (group) {
    return parseInt(group.header.config.width);
};

if (window.innerWidth < 350) {
    sizes.sx = sizes.sy = 45;
}

angular.module('ui').value('uiSizes', sizes);
