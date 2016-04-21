'use strict';

angular.module('app.list.controllers',[])


.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.Math = window.Math;
    $scope.places = PlacesService;
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.list = [];

    var updateList = function () {
        $scope.list = [];
        _.forEach($scope.places.bplan_points.features, function(value, key){
            if($scope.places.filters[value.properties.status]){
                $scope.list.push(value);
            }
        })
        $scope.currentPage = 0;
    }

    $scope.$on('data:loaded', function(event,data){
        $scope.list = $scope.places.bplan_points.features;
    });

    $scope.nextPage = function () {
    	$scope.currentPage = $scope.currentPage +1;
    };

    $scope.previousPage = function () {
    	$scope.currentPage = $scope.currentPage -1;
    };

    $scope.$on('filter:updated', function(event,data) {
        updateList();
    });

    $scope.$on('ortsteil:updated', function(event,data) {
        updateList();
    });

    $scope.$on('ortsteil:reset', function(event,data) {
        updateList();
    });

}])

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});