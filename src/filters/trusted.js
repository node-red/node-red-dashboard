/* global angular */
angular.module('ui').filter('trusted', ['$sce', function($sce) {
    return function(html) {
        return $sce.trustAsHtml(html)
    };
}]);
