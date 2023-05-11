'use strict';

angular.module('app.shared.directives', [])

.directive('sharedNav', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/html/app/shared/directives/nav.html',
        link: function(scope) {

            scope.toggleDropdown = function(event) {
                var element = $(event.currentTarget);
                var siblingElement = $(element.nextElementSibling);
                if(element.hasClass('show')) {
                    element.removeClass('show');
                    siblingElement.removeClass('show');
                } else {
                    element.addClass('show');
                    siblingElement.addClass('show');
                }
            }
        }
    };
})

.directive('ortsteilDirective', ['PlacesService', function(PlacesService) {
    return {
        restrict: 'A',
        replace: false,
        scope: {
            ortsteil: '=',
            updateOrtsteil: '&'
        },
        template: '<a data-ng-click="showOrtsteil();" href="">{{ name }}</a>',
        link: function(scope) {
            PlacesService.getOrtsteil(scope.ortsteil).then(function() {
                scope.name = PlacesService.ortsteile_polygons[scope.ortsteil].properties.name;
            });

            scope.showOrtsteil = function() {
                PlacesService.currentOrtsteil = scope.ortsteil;
                PlacesService.currentOrtsteilName = scope.name;
                scope.updateOrtsteil();
            };
        }
    };
}]);
