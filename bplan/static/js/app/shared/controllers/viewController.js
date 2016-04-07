'use strict';

angular.module('app.shared.controllers.viewController',[])

.controller('ViewController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';

    $scope.setView = function(type) {
        $scope.currentView = type;
    }
}]);