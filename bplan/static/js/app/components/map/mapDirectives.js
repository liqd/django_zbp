'use strict';

angular.module('app.map.directives',[])

.directive('popup', function() {
    return {
        restrict: 'E',
        scope: {
            status: '=',
            bplan: '=',
            closepopup: '='
        },
        templateUrl: '/static/js/app/components/map/popup.html',
        link: function(scope) {

            if(scope.status == 'aul'){
                scope.status_text = "Öffentliche Auslegung";
            }
            if(scope.status == 'bbg'){
                scope.status_text = "Frühzeitige Öffentlichkeitsbeteiligung";
            }
            if(scope.status == 'imVerfahren'){
                scope.status_text = "im Verfahren";
            }
            if(scope.status == 'festg'){
                scope.status_text = "Festgesetzt";
            }

            scope.closePopup = function() {
                scope.closepopup();
            }
        }
    };
});