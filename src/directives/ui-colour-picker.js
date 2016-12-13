/* global angular */
angular.module('ui').directive('colorPickerInputWrapper',
    function () {
        return {
            restrict: 'C',
            link: function(scope, element, attrs) {
                if (scope.AngularColorPickerController.options.pickerOnly) {
                    element.hide();
                }
            }
        }
    });
