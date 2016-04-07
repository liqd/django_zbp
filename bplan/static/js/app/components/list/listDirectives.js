'use strict';

angular.module('app.list.directives',[])

.directive('listitem', function() {
    return {
        restrict: 'E',
        scope: {
            status: '=',
            bplan: '=',
        },
        templateUrl: '/static/js/app/components/list/listitem.html',
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
        }
    };
});