'use strict';

angular.module('app.map.controllers', [])

.controller('MapController', ['$scope', '$rootScope', '$window', '$timeout', 'PlacesService', function($scope, $rootScope, $window, $timeout, PlacesService) {
    $scope.places = PlacesService;

    $scope.polygons = {};
    $scope.polygons.aul = {};
    $scope.polygons.bbg = {};
    $scope.polygons.festg = {};
    $scope.polygons.imVerfahren = {};

    $scope.popupopen = false;

    $scope.currentOrtsteil = {};
    $scope.currentItem = {};
    $scope.currentPolygon = {};
    $scope.currentMarker = {};

    $scope.markers = L.markerClusterGroup({
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        maxClusterRadius: 150,
        disableClusteringAtZoom: 15,
        polygonOptions: {
            fillColor: '#1b2557',
            color: '#1b2557',
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.2
        }
    });

    var DISTRICTSTYLE = {
        'color': '#808080',
        'weight': 2,
        'opacity': 1,
        'fillOpacity': 0
    };

    var ORTSTEILSTYLE = {
        'color': '#808080',
        'weight': 6,
        'opacity': 1,
        'fillOpacity': 0
    };

    var RedIcon = L.Icon.Default.extend({
        options: {
                iconUrl: '/static/img/marker-icon-2.png'
        }
    });
    var icon = new RedIcon();

    var resetPolygons = function() {
        $scope.polygons = {};
        $scope.polygons.aul = {};
        $scope.polygons.bbg = {};
        $scope.polygons.festg = {};
        $scope.polygons.imVerfahren = {};
    };

    var getZoomLevelForMarkers = function() {
        if(area) {
            return 14;
        }
        else {
            return 16;
        }
    };

    var getZoomLevelForPolygons = function() {
        return getZoomLevelForMarkers() + 1
    };

    var getMaxRadius = function() {
        if(area) {
            return 100;
        }
        else {
            return 150;
        }
    }

    var getColorForStatus = function(status) {
        if(status == 'aul') {
            return '#28d582';
        } else if (status == 'bbg') {
            return '#ff8a2c';
        } else if (status == 'festg') {
            return '#47c6dd';
        } else if (status == 'imVerfahren') {
            return '#e72323';
        } else {
            console.log('Not a known status');
        }
    };

    var getSizeForStatus = function(status) {
        if (status == 'aul') {
            return 25;
        } else if (status == 'bbg') {
            return 25;
        } else if (status == 'festg') {
            return 20;
        } else if (status == 'imVerfahren') {
            return 20;
        } else {
            console.log('Not a known status');
        }
    };

    // This function is called once after the data is loaded initially (creates the map)
    var createMap = function() {
        var map = $window.L.map('map');
        L.tileLayer('https://maps.berlinonline.de/tile/osmbright_bde/{z}/{x}/{y}.png', {
        	attribution: 'Geoportal Berlin/Bebauungspläne, Geltungsbereiche',
        	maxZoom: 19
        }).addTo(map);
        $scope.districtLayer = L.geoJson($scope.places.district).addTo(map);
        $scope.districtLayer.setStyle(DISTRICTSTYLE);
        map.fitBounds($scope.districtLayer);
        var currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
        map.on('zoomend', function (e){
            getMultipolygons();
        });
        map.on('dragend', function (e){
            getMultipolygons();
        });
        return map;
    };

    var updatePolygonAfterBplanChange = function(marker, multipolygon){
        $scope.map.removeLayer($scope.currentPolygon);
        multipolygon.addTo($scope.map).bringToBack();
        $scope.currentPolygon = multipolygon;
        $scope.places.getBplanDetail(marker.pk).then(function(data) {
            $scope.currentItem = data;
        });
        $scope.currentMarker = marker;
        $scope.popupopen = true;
        setTimeout(function() {
            $scope.map.invalidateSize();
            $scope.map.setView($scope.currentMarker._latlng);
        }, 100);

    };

    var createMarker = function(feature) {
        var status = feature.properties.status;
        var lon = feature.geometry.coordinates[0];
        var lat = feature.geometry.coordinates[1];
        var pk = feature.properties.pk;
        var color = getColorForStatus(status);
        var size = getSizeForStatus(status);
        var cssIcon = L.divIcon({
            className: 'custom-marker-' + status,
            html: '<div><div></div></div>',
            iconSize: [size, size]
        });
        var marker = L.marker(L.latLng(lat, lon), {
            icon: cssIcon
        });
        var style = {
            'color': color,
            'weight': 0.5,
            'opacity': 1,
            'fillOpacity': 0.5
        };
        marker.pk = pk;
        marker.on('click', function(e) {
            updatePolygonAfterBplanChange(this, this.multipolygon);
        });
        marker.on('mouseover', function(e) {
            if (!this.multipolygon) {
                $scope.places.getBplanMultipolygon(this.pk).then(function(data) {
                    var multipolygon = L.geoJson(data);
                    multipolygon.setStyle(style);
                    e.target.multipolygon = multipolygon;
                });
            }
        });
        $scope.markers.addLayer(marker);
        return marker;

    };

    // This function is called each time the data is updated (creates the markers)
    var addGeojson = function(cluster) {
        _.forEach(cluster, function(feature) {
            var status = feature.properties.status;
            if ($scope.places.filters[status]) {
                createMarker(feature);
            };
        });
    };

    // this function is called each time the data is updated (shows polygons on zoomlevel)
    var getMultipolygons = function() {
        if ($scope.map.getZoom() >= getZoomLevelForPolygons()) {
            var boundingbox = $scope.map.getBounds();
            var lat1 = boundingbox._northEast.lat;
            var lng1 = boundingbox._northEast.lng;
            var lat2 = boundingbox._southWest.lat;
            var lng2 = boundingbox._southWest.lng;
            var params = {
                'in_bbox': lng1 + ',' + lat1 + ',' + lng2 + ',' + lat2
            };
            $scope.places.getBplanMultipolygonList(params).then(function(result) {
                _.forEach(result.features, function(value) {
                    var pk = value.properties.pk;
                    var status = value.properties.status;
                    if (!$scope.polygons[status][pk]) {
                        var style = {
                            'color': getColorForStatus(status),
                            'weight': 0.5,
                            'opacity': 1,
                            'fillOpacity': 0.2
                        };
                        var multipolygon = L.geoJson(value);
                        multipolygon.setStyle(style);
                        $scope.polygons[status][pk] = multipolygon;
                        if ($scope.places.filters[status]) {
                            multipolygon.addTo($scope.map).bringToBack();
                        }
                    } else {
                        if ($scope.places.filters[status]) {
                            if (!$scope.map.hasLayer($scope.polygons[status][pk])) {
                                $scope.polygons[status][pk].addTo($scope.map).bringToBack();
                            }
                        }
                    }
                });
            });
        }
    };

    // resets data after update
    var resetAfterDataUpdate = function() {
        $scope.markers.clearLayers();
        _.forEach($scope.polygons, function(value1) {
            _.forEach(value1, function(value) {
                $scope.map.removeLayer(value);
            });
        });
        resetPolygons();
        addGeojson($scope.places.bplan_points.features);
    };

    $scope.closePopup = function() {
        $scope.popupopen = false;
        $scope.currentItem = {};
        $scope.currentMarker = {};
        setTimeout(function() {
            $scope.map.invalidateSize({
                pan: false
            });
            getMultipolygons();
            $scope.map.removeLayer($scope.currentPolygon);
        }, 200);
    };

    $scope.$on('data:loaded', function() {
        $scope.places.initMap().then(function() {
            $scope.map = createMap();

            $scope.markers = L.markerClusterGroup({
                chunkedLoading: true,
                removeOutsideVisibleBounds: true,
                disableClusteringAtZoom: getZoomLevelForMarkers(),
                spiderfyOnMaxZoom: false,
                maxClusterRadius: getMaxRadius(),
                polygonOptions: {
                    fillColor: '#1b2557',
                    color: '#1b2557',
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.2
                }
            });
            addGeojson($scope.places.bplan_points.features);
            $scope.markers.addTo($scope.map);
        });
    });

    $scope.$on('filter:updated', function() {
        $scope.markers.clearLayers();

        addGeojson($scope.places.bplan_points.features);
        if($scope.map.getZoom() >= getZoomLevelForPolygons()){
            _.forEach($scope.polygons, function(value, key){
                if(!$scope.places.filters[key]){
                    _.forEach(value, function(value, key) {

                        $scope.map.removeLayer(value);
                    });
                } else {
                    _.forEach(value1, function(value) {
                        if (!$scope.map.hasLayer(value)) {
                            value.addTo($scope.map).bringToBack();
                        }
                    });
                }
            });
        }
        $scope.popupopen = false;
        if ($scope.currentView == 'map') {
            setTimeout(function() {
                $scope.map.invalidateSize({
                    pan: false
                });
                $scope.map.removeLayer($scope.currentPolygon);
            }, 200);
        }
    });

    $scope.$on('ortsteil:updated', function() {
        $scope.closePopup();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        $scope.address_marker = undefined;
        resetAfterDataUpdate();
        $scope.map.removeLayer($scope.currentOrtsteil);
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.currentOrtsteil = L.geoJson(ortsteil).addTo($scope.map).bringToBack();
        $scope.currentOrtsteil.setStyle(ORTSTEILSTYLE);
        $scope.map.fitBounds($scope.currentOrtsteil);
        getMultipolygons();
    });

    $scope.$on('ortsteil:reset', function() {
        $scope.closePopup();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        $scope.address_marker = undefined;
        resetAfterDataUpdate();
        $scope.map.removeLayer($scope.currentOrtsteil);
        $scope.map.fitBounds($scope.districtLayer);
    });

    $scope.$on('address:updated', function() {
        resetAfterDataUpdate();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        var coordinates = $scope.places.currentAddress.geometry.coordinates;
        $scope.address_marker = L.marker(L.latLng(coordinates[1], coordinates[0]), {icon: icon});
        $scope.address_marker.addTo($scope.map);
        if ($scope.markers.getLayers().length > 0) {
            $scope.map.fitBounds($scope.markers.getBounds());
        }
        $scope.map.setView($scope.address_marker.getLatLng());
        getMultipolygons();
    });

    $scope.$on('bplan:updated', function() {
        var pk = $scope.places.currentBplan.properties.pk;
        var status = $scope.places.currentBplan.properties.status;
        var layers = $scope.markers.getLayers();
        var marker = undefined;
        var color = getColorForStatus(status);

        var style = {
            'color': color,
            'weight': 0.5,
            'opacity': 1,
            'fillOpacity': 0.5
        };

        _.forEach(layers, function(value) {
            if(value.pk == pk){
                marker = value;
                return false;
            }
        });

        if(angular.isUndefined(marker)){
            marker = createMarker($scope.places.currentBplan);
        }
        $scope.places.getBplanMultipolygon(pk).then(function(data) {
            var multipolygon = L.geoJson(data);
            multipolygon.setStyle(style);
            marker.multipolygon = multipolygon;
            $scope.map.fitBounds(multipolygon);
            updatePolygonAfterBplanChange(marker, multipolygon);
        });
    });

    $scope.$on('search:reseted', function() {
        $scope.closePopup();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        $scope.address_marker = undefined;
        resetAfterDataUpdate();
    });

    $scope.$on('type:switchedtoMap', function(){
        setTimeout(function() {
            $scope.map.invalidateSize({
                pan: true
            });
            getMultipolygons();
        }, 100);
    });
}]);