'use strict';

angular.module('app.map.controllers',[])

.controller('MapController',['$scope', '$rootScope', '$window', '$timeout','PlacesService',function($scope, $rootScope, $window, $timeout, PlacesService) {
    $scope.places = PlacesService;
    $scope.polygons = {};
    $scope.polygons.aul = [];
    $scope.polygons.bbg = [];
    $scope.polygons.festg = [];
    $scope.polygons.imVerfahren = [];

    $scope.popupopen = false;

    $scope.currentItem = {};
    $scope.currentPolygon = {};
    $scope.currentMarker = {};

    var DISTRICTSTYLE = {
        'color': '#808080',
        'weight': 2,
        'opacity': 1,
        'fillOpacity': 0
    }

    var createMap = function(){
        var map = $window.L.map('map');
        L.tileLayer('http://tiles.codefor.de/bbs-berlin/{z}/{x}/{y}.png', {
        	attribution: 'Map data &copy;',
        	maxZoom: 18
        }).addTo(map);
        var districtLayer = L.geoJson($scope.places.district).addTo(map);
        districtLayer.setStyle(DISTRICTSTYLE);
        map.fitBounds(districtLayer);
        var currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
        return map;
    };

    var getColorForStaus = function(status) {
        if(status == 'aul') {
            return '#28d582';
        }
        else if(status == 'bbg') {
            return '#ff8a2c';
        }
        else if(status == 'festg') {
            return '#47c6dd';
        }
        else if(status == 'imVerfahren') {
            return '#e72323';
        }
        else {
            console.log('Not a known status');
        }
    }

    var getRadiusForStaus = function(status) {
        if(status == 'aul') {
            return 8;
        }
        else if(status == 'bbg') {
            return 8;
        }
        else if(status == 'festg') {
            return 4;
        }
        else if(status == 'imVerfahren') {
            return 4;
        }
        else {
            console.log('Not a known status');
        }
    }

    var addGeojson = function(markers, map, cluster) {

        _.forEach(cluster.features, function(feature){
            var status = feature.properties.status;
            var lon = feature.geometry.coordinates[0];
            var lat = feature.geometry.coordinates[1];
            var multipolygon = feature.properties.multipolygon;
            var properties = feature.properties;
            var color = getColorForStaus(status);
            var radius = getRadiusForStaus(status);
            if($scope.places.filters[status]) {
                var marker = L.circleMarker(L.latLng(lat, lon), {
                    radius: radius,
                    fillColor: color,
                    weight: 0,
                    opacity: 0,
                    fillOpacity: 1
                    }
                );
                var style = {
                    'color': color,
                    'weight': 0.5,
                    'opacity': 1,
                    'fillOpacity': 0.3
                }
                var polygon = L.geoJson(multipolygon);
                polygon.setStyle(style);
                marker.multipolygon = polygon;
                marker.properties = properties;
                marker.on('click', function (e) {
                    map.removeLayer($scope.currentPolygon);
                    this.multipolygon.addTo(map).bringToBack();
                    $scope.currentItem = this.properties;
                    $scope.currentPolygon = this.multipolygon;
                    $scope.currentMarker = this;
                    $timeout(function() {
                        $scope.popupopen = true;
                        setTimeout(function(){
                            map.invalidateSize();
                            map.setView($scope.currentMarker._latlng);
                        }, 100);
                    })
                });
                markers.addLayer(marker);
            }
        })
    }

    PlacesService.initMap().then( function() {

        $scope.map = createMap();

        $scope.markers = L.markerClusterGroup({
            chunkedLoading: true,
            disableClusteringAtZoom: 14,
            polygonOptions: {
                fillColor: '#1b2557',
                color: '#1b2557',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.5
            }
        });
        $scope.markers.addTo($scope.map);
        PlacesService.initMapBplaene({}, $scope.places.map_markers.features).then(function () {
            addGeojson($scope.markers, $scope.map, $scope.places.map_markers);
        });
    });

    $scope.$on('filter:updated', function(event,data) {
        $scope.markers.clearLayers();
        addGeojson($scope.markers, $scope.map, $scope.places.map_markers);
        $scope.popupopen = false;
        setTimeout(function(){
            $scope.map.invalidateSize({
                pan:false
            });
            $scope.map.removeLayer($scope.currentPolygon);
        }, 200);
   });

    $scope.closePopup = function() {
        $scope.popupopen = false;
        setTimeout(function(){
            $scope.map.invalidateSize({
                pan:false
            });
            $scope.map.removeLayer($scope.currentPolygon);
        }, 200);
    }

}]);

