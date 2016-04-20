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

    $scope.currentOrtsteil = {};
    $scope.currentItem = {};
    $scope.currentPolygon = {};
    $scope.currentMarker = {};

    var DISTRICTSTYLE = {
        'color': '#808080',
        'weight': 2,
        'opacity': 1,
        'fillOpacity': 0
    }

    var ORTSTEILSTYLE = {
        'color': '#808080',
        'weight': 1,
        'opacity': 1,
        'fillOpacity': 0.1
    }

    var createMap = function(){
        var map = $window.L.map('map');
        /*L.tileLayer('http://tiles.codefor.de/bbs-berlin/{z}/{x}/{y}.png', {
        	attribution: 'Map data &copy;',
        	maxZoom: 18
        }).addTo(map);*/
        L.tileLayer('http://localhost:8080/berlinOnline/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(map);
        $scope.districtLayer = L.geoJson($scope.places.district).addTo(map);
        $scope.districtLayer.setStyle(DISTRICTSTYLE);
        map.fitBounds($scope.districtLayer);
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
            var pk = feature.properties.pk;
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
                marker.pk = pk;
                marker.on('click', function (e) {
                    map.removeLayer($scope.currentPolygon);
                    this.multipolygon.addTo(map).bringToBack();
                    $scope.currentPolygon = this.multipolygon;
                    $scope.places.getBplanDetail(this.pk).then(function(data){
                        $scope.currentItem = data;
                    });
                    $scope.currentMarker = this;
                    $timeout(function() {
                        $scope.popupopen = true;
                        setTimeout(function(){
                            map.invalidateSize();
                            map.setView($scope.currentMarker._latlng);
                        }, 100);
                    })
                });
                marker.on('mouseover', function (e) {
                    if(!this.multipolygon){
                        $scope.places.getBplanMultipolygon(this.pk).then(function(data){
                            var multipolygon = L.geoJson(data);
                            multipolygon.setStyle(style);
                            e.target.multipolygon = multipolygon;
                            if(!$scope.map.hasLayer(e.target.multipolygon)){
                                e.target.multipolygon.addTo($scope.map).bringToBack();
                            }
                        });
                    }
                    else {
                        if(!$scope.map.hasLayer(this.multipolygon)){
                            this.multipolygon.addTo($scope.map).bringToBack();
                        }
                    }
                });
                marker.on('mouseout', function (e) {
                    if(this != $scope.currentMarker){
                        map.removeLayer(this.multipolygon);
                    }
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
                fillOpacity: 0.2
            }
        });
        $scope.markers.addTo($scope.map);
        PlacesService.initBplaene({}, $scope.places.bplan_points.features).then(function () {
            addGeojson($scope.markers, $scope.map, $scope.places.bplan_points);
        });
    });

    $scope.$on('filter:updated', function(event,data) {
        $scope.markers.clearLayers();
        addGeojson($scope.markers, $scope.map, $scope.places.bplan_points);
        $scope.popupopen = false;
        if($scope.currentView == 'map'){
            setTimeout(function(){
                $scope.map.invalidateSize({
                    pan:false
                });
            $scope.map.removeLayer($scope.currentPolygon);
            }, 200);
        }
    });

    $scope.$on('ortsteil:updated', function(event,data) {
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.map.removeLayer($scope.currentOrtsteil);
        $scope.currentOrtsteil = L.geoJson(ortsteil).addTo($scope.map).bringToBack();
        $scope.currentOrtsteil.setStyle(ORTSTEILSTYLE);
        $scope.map.fitBounds($scope.currentOrtsteil);
    });

    $scope.$on('ortsteil:reset', function(event,data) {
        $scope.map.removeLayer($scope.currentOrtsteil);
    });

    $scope.closePopup = function() {
        $scope.popupopen = false;
        $scope.currentItem = {};
        $scope.currentMarker = {};
        setTimeout(function(){
            $scope.map.invalidateSize({
                pan:false
            });
            $scope.map.removeLayer($scope.currentPolygon);
        }, 200);
    }

}]);

