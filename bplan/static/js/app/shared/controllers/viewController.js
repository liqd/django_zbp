'use strict';

angular.module('app.shared.controllers.viewController', [])

.controller('ViewController', ['$scope', '$rootScope', 'PlacesService', function($scope, $rootScope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';
    $scope.searchstring = '';
    $scope.addressSearchResult = undefined;
    $scope.bplanSearchResult = undefined;


    $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function() {
        $rootScope.$broadcast('data:loaded');
    });

    $scope.setView = function(type) {
        $scope.currentView = type;
    };

    $scope.updateFilter = function() {
        $rootScope.$broadcast('filter:updated');
    };

    $scope.updateOrtsteil = function() {
        $scope.places.reset();
        var slug = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil].properties.slug;
        $scope.places.initBplaene({
            'ortsteil': slug
        }, $scope.places.bplan_points.features).then(function() {
            $rootScope.$broadcast('ortsteil:updated');
        });
    };

    $scope.resetOrtsteil = function() {
        $scope.places.reset();
        $scope.places.currentOrtsteilName = "Alle Ortsteile";
        $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function() {
            $rootScope.$broadcast('ortsteil:reset');
        });
    };

    $scope.getDataForSearch = function() {
        $scope.places.getCoordintesForAdress($scope.searchstring).then(function(result) {
            $scope.addressSearchResult = result.features;

            $scope.places.getBplaeneForSearch($scope.searchstring).then(function(result) {
                $scope.bplanSearchResult = result.features;

                $scope.searchResultCount = $scope.addressSearchResult.length + $scope.bplanSearchResult.length;

                if ($scope.addressSearchResult.length === 1 && $scope.bplanSearchResult.length == 0) {
                    $scope.chooseAddress($scope.addressSearchResult[0]);
                }

                if ($scope.addressSearchResult.length === 0 && $scope.bplanSearchResult.length == 1) {
                    $scope.chooseBplan($scope.bplanSearchResult[0]);
                }
            });
        });
    };

    $scope.resetSearch = function() {
        $rootScope.$broadcast('search:reseted');
        $scope.addressSearchResult = undefined;
        $scope.bplanSearchResult = undefined;
        $scope.searchResultCount = undefined;
        $scope.searchstring = '';
        $scope.places.currentAddress = undefined;
        $scope.places.reset();
        $scope.places.initBplaene({}, $scope.places.bplan_points.features);
    };

    $scope.chooseAddress = function(address) {
        $scope.addressSearchResult = undefined;
        $scope.bplanSearchResult = undefined;
        $scope.searchResultCount = undefined;
        $scope.places.currentAddress = address;
        $scope.places.reset();
        $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function() {
            $rootScope.$broadcast('address:updated');
        });
    };

    $scope.chooseBplan = function(bplan) {
        $scope.addressSearchResult = undefined;
        $scope.bplanSearchResult = undefined;
        $scope.searchResultCount = undefined;
        $scope.places.currentBplan = bplan;
        $rootScope.$broadcast('bplan:updated');
    };

    $scope.removeTagOnBackspace = function() {
        if ($scope.searchstring === '') {
            $scope.resetSearch();
        }
    };

}])

.filter('status', function() {
    return function(status) {
        if (status == 'aul') {
            return "Öffentliche Auslegung";
        } else if (status == 'bbg') {
            return "Frühzeitige Öffentlichkeitsbeteiligung";
        } else if (status == 'imVerfahren') {
            return "im Verfahren";
        } else if (status == 'festg') {
            return "Festgesetzt";
        } else {
            return '';
        }
    };
});