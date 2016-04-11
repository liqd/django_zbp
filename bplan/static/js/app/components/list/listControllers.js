'use strict';

angular.module('app.list.controllers',[])


.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.places = PlacesService;
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.list = [];

    PlacesService.initListBplaene({}, $scope.places.simple_list).then(function () {
        $scope.list = $scope.places.simple_list;
    });

    $scope.nextPage = function () {
    	$scope.currentPage = $scope.currentPage +1;
    };

    $scope.previousPage = function () {
    	$scope.currentPage = $scope.currentPage -1;
    };

    $scope.$on('filter:updated', function(event,data) {
        $scope.list = [];
        _.forEach($scope.places.simple_list, function(value, key){
            if($scope.places.filters[value.status]){
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