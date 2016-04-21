'use strict';

angular.module('app.list.directives',[])

.directive('listitem', [ 'PlacesService', function(PlacesService) {
    return {
        restrict: 'E',
        scope: {
            status: '=',
            pk: '='
        },
        templateUrl: '/static/js/app/components/list/listitem.html',
        link: function(scope) {
        	PlacesService.getBplanDetail(scope.pk).then(function(data){
        		scope.bplan = data;
        	});

        }
    };
}]);