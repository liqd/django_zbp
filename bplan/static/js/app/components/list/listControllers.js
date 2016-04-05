'use strict';

angular.module('app.list.controllers',[])

.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.places = PlacesService;



}]);