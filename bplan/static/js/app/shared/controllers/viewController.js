'use strict';

angular.module('app.shared.controllers.viewController',[])

.controller('ViewController',['$scope', '$rootScope', 'PlacesService',function($scope, $rootScope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';
    $scope.address = '';
    $scope.addressSearchResult = undefined;


    $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function () {
        $rootScope.$broadcast('data:loaded');
    });

    $scope.setView = function(type) {
        $scope.currentView = type;
    }

    $scope.updateFilter = function() {
    	$rootScope.$broadcast('filter:updated');
    };

    $scope.updateOrtsteil = function() {
        $scope.places.reset();
        var slug = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil].properties.slug;
        $scope.places.initBplaene({'ortsteil': slug}, $scope.places.bplan_points.features).then(function () {
            $rootScope.$broadcast('ortsteil:updated');
        });
    };

    $scope.resetOrtsteil = function() {
        $scope.places.reset();
        $scope.places.currentOrtsteilName = "Alle Ortsteile"
        $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function () {
            $rootScope.$broadcast('ortsteil:reset');
        });
    };

    $scope.getAddress = function() {
        $scope.places.getCoordintesForAdress($scope.address).then(function(result) {
            $scope.addressSearchResult = result.features;
            if($scope.addressSearchResult.length === 1){
                $scope.chooseAddress($scope.addressSearchResult[0]);
            }
        })
    };

    $scope.resetAddress = function() {
        $scope.addressSearchResult = undefined;
        $scope.address = '';
        $scope.places.currentAddress = "";
        $rootScope.$broadcast('address:reseted');
    };

    $scope.chooseAddress = function(address){
        $scope.addressSearchResult = undefined;
        $scope.places.currentAddress = address;
        $rootScope.$broadcast('address:updated');
    };

    $scope.removeTagOnBackspace = function() {
        if($scope.address == ''){
            $scope.addressSearchResult = undefined;
            $rootScope.$broadcast('address:reseted');
        }
    };

}])

.filter('status', function() {
    return function(status) {
        if(status == 'aul'){
            return "Öffentliche Auslegung";
        }
        else if(status == 'bbg'){
        	return "Frühzeitige Öffentlichkeitsbeteiligung";
        }
        else if(status == 'imVerfahren'){
            return "im Verfahren";
        }
        else if(status == 'festg'){
            return "Festgesetzt";
        }
        else {
        	return '';
        }
    }
});