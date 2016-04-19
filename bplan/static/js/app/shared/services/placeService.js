'use strict';

angular.module('app.shared.services.places', [])

.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};
    places.area = area;

    places.map_markers = {};
    places.map_markers.type = 'FeatureCollection';
    places.map_markers.features = [];

    places.simple_list = [];
    places.ortsteile_polygons = {};
    places.currentOrtsteil = "";
    places.currentOrtsteilName = "Alle Ortsteile";

    places.filters = {
        aul : true,
        bbg : true,
        festg : true,
        imVerfahren : true
    }

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

            if(data.type === 'FeatureCollection'){
                var list = data.features;
            }
            else{
                var list = data.results;
            }

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
    }

    // Gets the data for the map
    places.initMapBplaene = function (filter, target) {
        var deferred = $q.defer();
        var params = filter;

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        getNextPage('/api/bplaene/', params, target, deferred);
        return deferred.promise;
    };

    // Get the data for the list
    places.initListBplaene = function (filter, target) {
        var deferred = $q.defer();
        var params = filter;

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        getNextPage('/api/bplaene_simple/', params, target, deferred);
        return deferred.promise;
    };

    return places;

}]);