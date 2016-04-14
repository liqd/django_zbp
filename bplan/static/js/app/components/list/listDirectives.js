'use strict';

angular.module('app.list.directives',[])

.directive('listitem', function() {
    return {
        restrict: 'E',
        scope: {
            bplan: '=',
        },
        templateUrl: '/static/js/app/components/list/listitem.html',
    };
});