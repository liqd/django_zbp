'use strict';

angular.module('app.list.controllers',[])

.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.places = PlacesService;

    PlacesService.initListBplaene($scope.places.simple_list, '/api/bplaene_simple/').then( function() {
    	$scope.count = $scope.places.simple_list.data.count;
    	$scope.next = $scope.places.simple_list.data.next;
    	$scope.previous = $scope.places.simple_list.data.previous;
    });

    $scope.nextPage = function () {
    	PlacesService.initListBplaene($scope.places.simple_list, $scope.next).then( function() {
	    	$scope.count = $scope.places.simple_list.data.count;
	    	$scope.next = $scope.places.simple_list.data.next;
	    	$scope.previous = $scope.places.simple_list.data.previous;
    	});
    };

    $scope.previousPage = function () {
    	PlacesService.initListBplaene($scope.places.simple_list, $scope.previous).then( function() {
	    	$scope.count = $scope.places.simple_list.data.count;
	    	$scope.next = $scope.places.simple_list.data.next;
	    	$scope.previous = $scope.places.simple_list.data.previous;
    	});
    };

}]);