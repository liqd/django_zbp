'use strict';

angular.module('app.shared.directives',[])

.directive('sharedNav', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/js/app/shared/directives/nav.html'
    };
})

.directive('ortsteilDirective', [ 'PlacesService', function(PlacesService) {
    return {
        restrict: 'A',
        repace: true,
        scope: {
        	ortsteil: '=',
        	updateOrtsteil: '&'
        },
        template: '<a data-ng-click="showOrtsteil();" href="">{{ name }}</a>',
        link: function (scope) {
        	PlacesService.getOrtsteil(scope.ortsteil).then(function () {
        		scope.name = PlacesService.ortsteile_polygons[scope.ortsteil].properties.name;
        	});

        	scope.showOrtsteil = function () {
        		PlacesService.currentOrtsteil = scope.ortsteil;
        		PlacesService.currentOrtsteilName = scope.name;
        		scope.updateOrtsteil();
        	}
        }
    };
}]);