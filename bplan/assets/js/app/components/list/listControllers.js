'use strict';

angular.module('app.list.controllers', [])


.controller('ListController', ['$scope', 'PlacesService', function($scope, PlacesService) {
    $scope.Math = window.Math;
    $scope.places = PlacesService;
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.list = [];

    var updateList = function() {
        $scope.list = [];
        if (!angular.isUndefined($scope.places.currentBplan)) {
            $scope.list.push($scope.places.currentBplan);
        }
        _.forEach($scope.places.bplan_points.features, function(value) {
            if ($scope.places.filters[value.properties.status]) {
                $scope.list.push(value);
            }
        });
        $scope.currentPage = 0;
    };

    $scope.$on('data:loaded', function() {
        $scope.list = $scope.places.bplan_points.features;
    });

    $scope.nextPage = function() {
        $scope.currentPage = $scope.currentPage + 1;
    };

    $scope.previousPage = function() {
        $scope.currentPage = $scope.currentPage - 1;
    };

    $scope.$on('filter:updated', function() {
        updateList();
    });

    $scope.$on('ortsteil:updated', function() {
        updateList();
    });

    $scope.$on('address:updated', function() {
        updateList();
    });

    $scope.$on('search:reseted', function() {
        updateList();
    });

    $scope.$on('bplan:updated', function() {
        updateList();
    });

}])

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});