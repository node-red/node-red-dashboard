angular.module('ui').filter('chartGetRange', function() {
	return function(value) {                   
		var min = d3.min(value, function (a) { return d3.min(a.values, function(b){return b[1];}); });
		var max = d3.max(value, function (a) { return d3.max(a.values, function(b){return b[1];}); });
		return [Math.floor(min), Math.ceil(max)];
	};
});