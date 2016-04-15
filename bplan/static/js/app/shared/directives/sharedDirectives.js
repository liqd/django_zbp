'use strict';

angular.module('app.shared.directives',[])

.directive('nav', function() {
    return {
        restrict: 'E',
        templateUrl: '/static/js/app/shared/directives/nav.html'
    };
});