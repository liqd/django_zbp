'use strict';

angular.module('app.shared.services.places', [])

.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};
    places.area = area;

    places.status_aul = {};
    places.status_aul.type = 'FeatureCollection';
    places.status_aul.features = [];

    places.status_bbg = {};
    places.status_bbg.type = 'FeatureCollection';
    places.status_bbg.features = [];

    places.status_festg = {};
    places.status_festg.type = 'FeatureCollection';
    places.status_festg.features = [];

    places.status_imVerfahren = {};
    places.status_imVerfahren.type = 'FeatureCollection';
    places.status_imVerfahren.features = [];

    places.simple_list = {};
    places.currentFilters = {};

    // loads polygon of district
    places.initMap = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bezirke/',
            params: {slug: area}
        }).then(function successCallback(response) {
            places.district = response.data;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });

        return deferred.promise;
    };

    var getNextPage = function(url, params, target, deferred) {

        $http({
            method: 'GET',
            url: url,
            params: params
        }).then(function successCallback(response) {
            var count = response.data.count;
            var next = response.data.next;
            var previous = response.data.previous;
            var features = response.data.features;
            if(count > 0 ){
                for ( var i = 0; i < features.length; i++) {
                    target.features.push(features[i]);
                }
            }
            if(next) {
                getNextPage(next, params, target, deferred);
            } else {
                deferred.resolve();
            }
        });
    }

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

    places.initListBplaene = function (target, url) {
        var deferred = $q.defer();
        var params = places.currentFilters

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        $http({
            method: 'GET',
            url: url,
            params: places.currentFilters
        }).then(function successCallback(response) {
            target.data = response.data;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });
         return deferred.promise;
    };
    return places;

}]);