'use strict';

angular.module('app.map.directives', [])

.directive('popup', function() {
    return {
        restrict: 'E',
        scope: {
            bplan: '=',
            closepopup: '=',
            resetsearch: '='
        },
        templateUrl: '/static/html/app/components/map/popup.html',
        link: function(scope) {

            scope.closePopup = function() {
                scope.closepopup();
                scope.resetsearch();
            };
        }
    };
});
