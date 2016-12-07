'use strict';

angular.module('app.shared.controllers.viewController', [])

.controller('ViewController', ['$scope', '$timeout', '$rootScope', 'PlacesService', function($scope, $timeout, $rootScope, PlacesService) {
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
        if(type === 'map'){
            $rootScope.$broadcast('type:switchedtoMap');
        }
        else {
            $rootScope.$broadcast('type:switchedtoList');
        }
    };

    $scope.updateFilter = function() {
        $rootScope.$broadcast('filter:updated');
    };

    $scope.updateOrtsteil = function() {
        $scope.places.reset();
        resetSearchResults();
        $scope.searchstring = '';
        var slug = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil].properties.slug;
        $scope.places.initBplaene({
            'ortsteil': slug
        }, $scope.places.bplan_points.features).then(function() {
            $rootScope.$broadcast('ortsteil:updated');
        });
    };

    $scope.resetOrtsteil = function() {
        $scope.places.reset();
        resetSearchResults();
        $scope.searchstring = '';
        $scope.places.currentOrtsteilName = "Alle Ortsteile";
        $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function() {
            $rootScope.$broadcast('ortsteil:reset');
        });
    };

    $scope.getDataForSearch = function() {
        $scope.places.getCoordintesForAdress($scope.searchstring).then(function(result) {
            $scope.noHouseNumber = $scope.searchstring.length > 0 && !$scope.searchstring.match(/\w+\ \d+\D?/g);
            $scope.addressSearchResult = result.features;

            $scope.places.getBplaeneForSearch($scope.searchstring).then(function(result) {
                $scope.bplanSearchResult = result.features;

                $scope.searchResultCount = $scope.addressSearchResult.length + $scope.bplanSearchResult.length;
                var addresses = $scope.addressSearchResult.length;
                var bplaene = $scope.bplanSearchResult.length;

                if (addresses === 1 && bplaene === 0) {
                    $scope.chooseAddress($scope.addressSearchResult[0]);
                }

                if (addresses === 0 && bplaene === 1) {
                    $scope.chooseBplan($scope.bplanSearchResult[0]);
                }
            });
        });
    };

    var resetSearchResults = function() {
        $scope.addressSearchResult = undefined;
        $scope.bplanSearchResult = undefined;
        $scope.searchResultCount = undefined;
    }

    $scope.resetSearch = function() {
        resetSearchResults();
        $scope.searchstring = '';
        $scope.places.currentAddress = undefined;
        $scope.places.currentBplan = undefined;
        $scope.places.reset();
        $scope.places.initBplaene({}, $scope.places.bplan_points.features).then(function(){
            $rootScope.$broadcast('search:reseted');
        });
    };

    $scope.chooseAddress = function(address) {
        resetSearchResults();
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
        $timeout(function() {
            if ($scope.searchstring === '') {
                $scope.resetSearch();
            }
        }, 10);
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