'use strict';

angular.module('app.shared.services.places', [])

.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};
    places.status_aul = {};
    places.status_bbg = {};
    places.status_festg = {};

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

    places.initBplaene = function (filter, target) {
        var deferred = $q.defer();
        var params = filter;

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        $http({
            method: 'GET',
            url: '/api/bplaene/',
            params: params
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