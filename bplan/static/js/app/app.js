var app = angular.module('app',[]);

app.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};

    places.initMap = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/bezirke/',
            params: {slug: area}
        }).then(function successCallback(response) {
            console.log(response);
            places.district = response.data;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });

        return deferred.promise;
    };

    places.initBplaene = function () {
        var deferred = $q.defer();
        params = {};

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        $http({
            method: 'GET',
            url: '/api/bplaene/',
            params: params
        }).then(function successCallback(response) {
            places.bplaene = response.data;
            deferred.resolve();
        }, function errorCallback(response) {
            console.log(response);
        });
         return deferred.promise;
    };

    return places;
}]);

app.controller('MapController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.places = PlacesService;

    $scope.createMap = function(){
        map = L.map('map');
            //L.tileLayer('http://maps.berlinonline.de/tile/bdemarker/{z}/{x}/{y}.png', {
            L.tileLayer('http://tiles.codefor.de/bbs-berlin/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(map);

        var style = {
            'color': '#808080',
            'weight': 2,
            'opacity': 1,
            'fillOpacity': 0
        };

        districtLayer = L.geoJson($scope.places.district).addTo(map);
        districtLayer.setStyle(style);
        map.fitBounds(districtLayer);
        currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
    };

    PlacesService.initMap().then( function() {

        $scope.createMap();

        var markers = L.markerClusterGroup({
                    disableClusteringAtZoom: 14,
                });

        PlacesService.initBplaene().then(function () {
                var cluster = $scope.places.bplaene;

                var geojsonMarkerOptions = {
                    radius: 8,
                    fillColor: "#00A6DE",
                    weight: 0,
                    opacity: 0,
                    fillOpacity: 1
                };
                var geojson = L.geoJson(cluster, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }
                });
                markers.addLayer(geojson);
                markers.on('click', function (marker) {
                    if(angular.isUndefined(marker.layer.polygon)){

                        var style = {
                            'color': '#00A6DE',
                            'weight': 0.5,
                            'opacity': 1,
                            'fillOpacity': 0.3
                        };

                        var content = marker.layer.feature.properties;
                        var polygon = L.geoJson(content.multipolygon).addTo(map).bringToBack();
                        polygon.setStyle(style);
                        marker.layer.polygon = polygon;
                    }
                    else {
                        map.removeLayer(marker.layer.polygon);
                        delete marker.layer.polygon;
                }
            });
            markers.addTo(map);
        }, function errorCallback(response) {
            console.log(response);
        });
    });
}]);

app.controller('ListController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.places = PlacesService;



}]);

app.controller('ViewController',['$scope', 'PlacesService',function($scope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';

    $scope.setView = function(type) {
        $scope.currentView = type;
    }
}]);

