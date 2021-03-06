'use strict';

angular.module('app.shared.services.places', [])

.factory('PlacesService', ['$http', '$q', '$window', 'API_END_POINTS', function($http, $q, $window, API_END_POINTS) {

    var places = {};
    places.area = area;

    places.bplan_points = {};
    places.bplan_points.type = 'FeatureCollection';
    places.bplan_points.features = [];

    places.ortsteile_polygons = {};
    places.currentOrtsteil = "";
    places.currentOrtsteilName = "Alle Ortsteile";

    places.currentAddress = undefined;
    places.currentBplan = undefined;

    places.reset = function() {
        places.bplan_points = {};
        places.bplan_points.type = 'FeatureCollection';
        places.bplan_points.features = [];
    };

    places.filters = {
        aul: true,
        bbg: true,
        festg: true,
        imVerfahren: true
    };

    // loads polygon of district
    places.initMap = function() {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: API_END_POINTS.bezirke,
            params: {
                slug: area,
                afs_behoer: afs_behoer
            }
        }).then(function successCallback(response) {
            places.district = response.data;
            places.ortsteile = places.district.features[0].properties.ortsteile;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });

        return deferred.promise;
    };

    places.getOrtsteil = function(url) {
        var deferred = $q.defer();
        if (angular.isUndefined(places.ortsteile_polygons[url])) {
            $http({
                method: 'GET',
                url: url
            }).then(function successCallback(response) {
                places.ortsteile_polygons[url] = response.data;
                deferred.resolve();
            }, function errorCallback(response) {
                console.log(response);
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    places.getBplanDetail = function(pk) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: API_END_POINTS.bplan_data + pk
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log(response);
        });
        return deferred.promise;
    };

    places.getBplanMultipolygon = function(pk) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: API_END_POINTS.bplan_multipolygon + pk
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log(response);
        });
        return deferred.promise;
    };

    places.getBplanMultipolygonList = function(params) {
        if (afs_behoer) {
            params.afs_behoer = afs_behoer;
        }
        if (area) {
            params.bezirk__slug = area;
        }
        if (places.currentOrtsteilName != 'Alle Ortsteile') {
            var ortsteil_slug = places.ortsteile_polygons[places.currentOrtsteil].properties.slug;
            params.ortsteil = ortsteil_slug;
        }
        if (places.currentAddress) {
            var point = places.currentAddress.geometry.coordinates;
            params.dist = 500;
            params.point = point[0] + ',' + point[1];
        }
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: API_END_POINTS.bplan_multipolygon,
            'params': params
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            console.log(response);
        });
        return deferred.promise;
    };

    places.getCoordintesForAdress = function(searchstring) {

        var params = {};
        params.address = searchstring;
        if(afs_behoer) {
            params.afs_behoer = afs_behoer;
        }
        if (area) {
            params.bezirk = area;
        }
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: API_END_POINTS.addresses,
            params: params
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            deferred.resolve(response.data);

        });

        return deferred.promise;
    };

    places.getBplaeneForSearch = function(searchstring) {
        var params = {};
        params.bplan = searchstring;
        if(afs_behoer) {
            params.afs_behoer = afs_behoer;
        }
        if (area) {
            params.bezirk__slug = area;
        }
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: API_END_POINTS.bplan_point,
            params: params
        }).then(function successCallback(response) {
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            deferred.resolve(response.data);

        });

        return deferred.promise;
    }

    // Helpfunction for initMapBplaene and initMapBplaene (loops through paginated data from server)
    var getNextPage = function(url, params, target, deferred) {

        $http({
            method: 'GET',
            url: url,
            params: params
        }).then(function successCallback(response) {
            var count = response.data.count;
            var next = response.data.next;
            var data = response.data;
            var list = data.features;

            if (count > 0) {
                _.forEach(list, function(value) {
                    target.push(value);
                });
            }
            if (next) {
                getNextPage(next, {}, target, deferred);
            } else {
                deferred.resolve();
            }
        });
    };

    // Gets the data points for the app
    places.initBplaene = function(filter, target, markers) {
        var deferred = $q.defer();
        var params = filter;
        if(afs_behoer) {
            params.afs_behoer = afs_behoer;
        }

        if (area) {
            params.bezirk__slug = area;
        }

        if (places.currentAddress) {
            var point = places.currentAddress.geometry.coordinates;
            params.point = point[0] + ',' + point[1];
        }

        getNextPage(API_END_POINTS.bplan_point, params, target, deferred);
        return deferred.promise;
    };

    return places;

}]);