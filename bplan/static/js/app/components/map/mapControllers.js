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

    var resetPolygons = function() {
        $scope.polygons = {};
        $scope.polygons.aul = {};
        $scope.polygons.bbg = {};
        $scope.polygons.festg = {};
        $scope.polygons.imVerfahren = {};
    };

    var getColorForStaus = function(status) {
        if (status == 'aul') {
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

    var getSizeForStaus = function(status) {
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
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(map);
        $scope.districtLayer = L.geoJson($scope.places.district).addTo(map);
        $scope.districtLayer.setStyle(DISTRICTSTYLE);
        map.fitBounds($scope.districtLayer);
        var currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
        map.on('zoomend', function() {
            if (map.getZoom() < 16) {
                _.forEach($scope.polygons, function(value1) {
                    _.forEach(value1, function(value2) {
                        $scope.map.removeLayer(value2);
                    });
                });
            } else {
                getMultipolygons();
            }
        });
        map.on('dragend', function() {
            if (map.getZoom() >= 16) {
                getMultipolygons();
            }
        });
        return map;
    };

    // This function is called each time the data is updated (creates the markers)
    var addGeojson = function(markers, map, cluster) {
        _.forEach(cluster.features, function(feature) {
            var status = feature.properties.status;
            var lon = feature.geometry.coordinates[0];
            var lat = feature.geometry.coordinates[1];
            var pk = feature.properties.pk;
            var color = getColorForStaus(status);
            var size = getSizeForStaus(status);
            if ($scope.places.filters[status]) {
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
                marker.on('click', function() {
                    map.removeLayer($scope.currentPolygon);
                    this.multipolygon.addTo(map).bringToBack();
                    $scope.currentPolygon = this.multipolygon;
                    $scope.places.getBplanDetail(this.pk).then(function(data) {
                        $scope.currentItem = data;
                    });
                    $scope.currentMarker = this;
                    $timeout(function() {
                        $scope.popupopen = true;
                        setTimeout(function() {
                            map.invalidateSize();
                            map.setView($scope.currentMarker._latlng);
                        }, 100);
                    });
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
                markers.addLayer(marker);
            }
        });
    };

    // this function is called each time the data is updated (shows polygons on zoomlevel)
    var getMultipolygons = function() {
        if ($scope.map.getZoom() >= 16) {
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
                            'color': getColorForStaus(status),
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
        addGeojson($scope.markers, $scope.map, $scope.places.bplan_points);
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
            $scope.markers.addTo($scope.map);
            addGeojson($scope.markers, $scope.map, $scope.places.bplan_points);
        });
    });

    $scope.$on('filter:updated', function() {
        $scope.markers.clearLayers();
        addGeojson($scope.markers, $scope.map, $scope.places.bplan_points);
        if ($scope.map.getZoom() >= 16) {
            _.forEach($scope.polygons, function(value1, key) {
                if (!$scope.places.filters[key]) {
                    _.forEach(value1, function(value) {
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
        resetAfterDataUpdate();
        $scope.map.removeLayer($scope.currentOrtsteil);
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.currentOrtsteil = L.geoJson(ortsteil).addTo($scope.map).bringToBack();
        $scope.currentOrtsteil.setStyle(ORTSTEILSTYLE);
        $scope.map.fitBounds($scope.currentOrtsteil);
    });

    $scope.$on('ortsteil:reset', function() {
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
        $scope.address_marker = L.marker(L.latLng(coordinates[1], coordinates[0]));
        $scope.address_marker.addTo($scope.map);
        $scope.map.setView($scope.address_marker.getLatLng());
        getMultipolygons();

    });

    $scope.$on('address:reseted', function() {
        resetAfterDataUpdate();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        $scope.address_marker = undefined;
        getMultipolygons();
    });

}]);