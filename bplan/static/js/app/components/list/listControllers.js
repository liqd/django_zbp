'use strict';

angular.module('app.list.controllers',[])


.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.Math = window.Math;
    $scope.places = PlacesService;
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.list = [];

    if($scope.places.bplan_points){
        $scope.list = $scope.places.bplan_points.features;
    }
    else {
        PlacesService.initBplaene({}, $scope.places.bplan_points.features).then(function () {
            $scope.list = $scope.places.bplan_points.features;
        });
    }

    $scope.nextPage = function () {
    	$scope.currentPage = $scope.currentPage +1;
    };

    $scope.previousPage = function () {
    	$scope.currentPage = $scope.currentPage -1;
    };

    $scope.$on('filter:updated', function(event,data) {
        $scope.list = [];
        _.forEach($scope.places.bplan_points.features, function(value, key){
            if($scope.places.filters[value.properties.status]){
                $scope.list.push(value);
            }
        })
        $scope.currentPage = 0;

    });

}])

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});