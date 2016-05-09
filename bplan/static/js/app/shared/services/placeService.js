'use strict';

angular.module('app.shared.services.places', [])

.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};
    places.area = area;

    places.bplan_points = {};
    places.bplan_points.type = 'FeatureCollection';
    places.bplan_points.features = [];

    places.ortsteile_polygons = {};
    places.currentOrtsteil = "";
    places.currentOrtsteilName = "Alle Ortsteile";

    places.currentAddress = {};

    places.reset = function () {
        places.bplan_points = {};
        places.bplan_points.type = 'FeatureCollection';
        places.bplan_points.features = [];
    };

    places.filters = {
        aul : true,
        bbg : true,
        festg : true,
        imVerfahren : true
    };

    // loads polygon of district
    places.initMap = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bezirke/',
            params: {slug: area}
        }).then(function successCallback(response) {
            places.district = response.data;
            places.ortsteile = places.district.features[0].properties.ortsteile;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });

        return deferred.promise;
    };

    places.getOrtsteil = function (url) {
        var deferred = $q.defer();
        if(angular.isUndefined(places.ortsteile_polygons[url])){
            $http({
                method: 'GET',
                url: url
                }).then(function successCallback(response) {
                    places.ortsteile_polygons[url] = response.data;
                    deferred.resolve();
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    places.getBplanDetail = function (pk) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bplaene_data/' + pk
            }).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                console.log(response);
            });
        return deferred.promise;
    };

    places.getBplanMultipolygon = function (pk) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bplaene_multipolygon/' + pk
            }).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                console.log(response);
            });
        return deferred.promise;
    };

    places.getBplanMultipolygonList = function (params) {
        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        if(places.currentOrtsteilName!='Alle Ortsteile'){
            var ortsteil_slug = places.ortsteile_polygons[places.currentOrtsteil].properties.slug;
            params.ortsteil = ortsteil_slug;
        }
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bplaene_multipolygon/',
            'params' : params
            }).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                console.log(response);
            });
        return deferred.promise;
    };

    places.getCoordintesForAdress = function (address){

        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/api/addresses/',
            params: {'address': address}
            }).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response){
                deferred.resolve(response.data);

            });

        return deferred.promise;
    };

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

            if(count > 0) {
                _.forEach(list, function(value, key){
                    target.push(value);
                })
            }
            if(next) {
                getNextPage(next, {}, target, deferred);
            } else {
                deferred.resolve();
            }
        });
    };

    // Gets the data points for the app
    places.initBplaene = function (filter, target, markers) {
        var deferred = $q.defer();
        var params = filter;

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        getNextPage('/api/bplaene_point/', params, target, deferred);
        return deferred.promise;
    };

    return places;

}]);