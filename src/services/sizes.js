var sizes = {
    sx: 50,
    sy: 50,
    gx: 7,
    gy: 7,
    px: 7,
    py: 0,
    columns: 6
};

if (window.innerWidth < 350)
    sizes.sx = sizes.sy = 45;

angular.module('ui').value('uiSizes', sizes);
