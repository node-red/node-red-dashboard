angular.module('ui').filter('chartGetRange', function() {
    return function(value, range) {
        range = [parseFloat(range[0]), parseFloat(range[1])];
        var min = Math.abs(range[0])>=0 ? range[0] : d3.min(value, function (a) { return d3.min(a.values, function(b) {return b[1];}); });
        var max = Math.abs(range[1])>=0 ? range[1] : d3.max(value, function (a) { return d3.max(a.values, function(b) {return b[1];}); });
        return [Math.floor(min), Math.ceil(max)];
    };
});
