'use strict';

angular.module('app.shared.controllers.viewController',[])

.controller('ViewController',['$scope', '$rootScope', 'PlacesService',function($scope, $rootScope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';

    $scope.setView = function(type) {
        $scope.currentView = type;
    }

    $scope.updateFilter = function() {
    	$rootScope.$broadcast('filter:updated');
    }

}]);