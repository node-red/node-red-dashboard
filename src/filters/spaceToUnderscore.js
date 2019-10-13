/* global angular */
angular.module('ui').filter('spaceToUnderscore', function() {
    return function (input) {
        return input.replace(/ /g,'_');
    };
});

angular.module('ui').filter('underscoreToSpace', function() {
    return function (input) {
        return input.replace(/_/g,' ');
    };
});
