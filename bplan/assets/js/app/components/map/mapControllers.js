'use strict';

angular.module('app.map.controllers', [])

.controller('MapController', ['$scope', '$rootScope', '$window', '$timeout', 'PlacesService', function($scope, $rootScope, $window, $timeout, PlacesService) {
    $scope.places = PlacesService;

    $scope.baseurl = map_baseurl;
    $scope.attribution = map_attribution;
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

    var DISTRICTSTYLE = {
        'color': '#a8a8a8',
        'weight': 1,
        'opacity': 1,
        'fillOpacity': 0
    };

    var ORTSTEILSTYLE = {
        'color': '#a8a8a8',
        'weight': 3,
        'opacity': 1,
        'fillOpacity': 0
    };

    var RedIcon = L.Icon.Default.extend({
        options: {
                iconUrl: '/static/images/marker-icon-2.png'
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
            return 15;
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
        }
        else if(status == 'festg') {
            return '#e72323';
        }
        else if(status == 'imVerfahren') {
            return '#47c6dd';
        }
        else {
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

    var createDistrictMarker = function(point, count, name) {
        var lon = point[0];
        var lat = point[1];
        var icon = L.divIcon({
            html:'<div><span>'+ count +'</span></div>',
            className: 'leaflet-marker-icon marker-cluster marker-cluster-medium',
            iconSize:[40, 40]
        });
        var marker = L.marker([lat,lon],{icon:icon});

        var string = count == 1 ? 'Bebauungsplan' : 'Bebauungspläne';
        marker.bindPopup(count + ' ' + string + ' in' + '<br>'+ name, {closeButton: false, offset: L.point(0, -20)});
        marker.on('mouseover', function (e) {
            this.openPopup();
        });
        marker.on('mouseout', function (e) {
            this.closePopup();
        });
        marker.on('click', function(e) {
            $scope.map.zoomIn();
        });
        $scope.districtMarkers.addLayer(marker);
    }

    // This function is called once after the data is loaded initially (creates the map)
    var createMap = function(){

        var map = $window.L.map('map', {
            maxZoom: 19
        });
        var maplibreMap = L.maplibreGL({
            style: $scope.baseurl,
            maxZoom: 19,
        }).addTo(map)

        map.attributionControl.setPrefix($scope.attribution);

        $scope.districtMarkers = L.layerGroup();

        $scope.districtLayer = L.geoJson($scope.places.district, {
            onEachFeature : function(feature, layer) {
                var count = feature.properties.bplan_count;
                var districtName = feature.properties.name;
                var point = feature.properties.point;
                layer.on('click', function(e){
                    $scope.map.zoomIn();
                })
                createDistrictMarker(point, count, districtName);
            }
        }).addTo(map);
        $scope.districtLayer.setStyle(DISTRICTSTYLE);

        if(!area) {
            $scope.districtMarkers.addTo(map);
        }

        map.fitBounds($scope.districtLayer.getBounds());
        var currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
        map.on('zoomend', function (e){
            var currentZoom = map.getZoom();
            if(currentZoom > map.getMinZoom()) {
                if(!area){
                    map.removeLayer($scope.districtMarkers);
                    _.forEach($scope.bplansPerDistrict, function(clustergroup) {
                        clustergroup.addTo($scope.map);
                    })
                }
                if(currentZoom >= getZoomLevelForPolygons()) {
                    getMultipolygons();
                }
                else{
                    _.forEach($scope.polygons, function(value, key){
                        _.forEach(value, function(value, key) {
                            $scope.map.removeLayer(value);
                        })
                    })
                }
            }
            if(currentZoom == map.getMinZoom() && !area) {
                 _.forEach($scope.bplansPerDistrict, function(clustergroup) {
                        map.removeLayer(clustergroup);
                    })
                $scope.districtMarkers.addTo(map);
            }
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
        $timeout(function() {
            $scope.popupopen = true;
            setTimeout(function(){
                $scope.map.invalidateSize();
                $scope.map.setView($scope.currentMarker._latlng);
                setTimeout(function(){
                    $scope.map.fitBounds($scope.currentPolygon.getBounds());
                }, 200);
            }, 100);
        })

    };

    var createMarker = function(feature) {
        var status = feature.properties.status;
        var lon = feature.geometry.coordinates[0];
        var lat = feature.geometry.coordinates[1];
        var pk = feature.properties.pk;
        var color = getColorForStatus(status);
        var size = getSizeForStatus(status);
        if($scope.places.filters[status]) {
            var cssIcon = L.divIcon({
                className: 'custom-marker-' + status,
                html:'<div><div></div></div>',
                iconSize: [size,size]
            });
            var marker = L.marker(L.latLng(lat, lon), {icon: cssIcon});

            var style = {
                'color': color,
                'weight': 0.5,
                'opacity': 1,
                'fillOpacity': 0.5
            }

            marker.pk = pk;
            marker.on('click', function (e) {

                updatePolygonAfterBplanChange(this, this.multipolygon);
            });
            marker.on('mouseover', function (e) {
                if(!this.multipolygon){
                    $scope.places.getBplanMultipolygon(this.pk).then(function(data){
                        var multipolygon = L.geoJson(data);
                        multipolygon.setStyle(style);
                        e.target.multipolygon = multipolygon;
                    });
                }
            });
            return marker;
        }
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
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            clustergroup.clearLayers();
        });
        _.forEach($scope.polygons, function(value1) {
            _.forEach(value1, function(value) {
                $scope.map.removeLayer(value);
            });
        });
        resetPolygons();
        addGeojson($scope.places.bplan_points.features);
    };

    var addGeojson = function(features, index) {
        _.forEach(features, function(feature, index) {
            var marker = createMarker(feature);
            var district = feature.properties.bezirk;
            if(!$scope.bplansPerDistrict[district]){
                $scope.bplansPerDistrict[district] = L.markerClusterGroup({
                    chunkedLoading: true,
                    removeOutsideVisibleBounds: true,
                    disableClusteringAtZoom: getZoomLevelForMarkers(),
                    spiderfyOnMaxZoom: false,
                    maxClusterRadius: getMaxRadius(),
                    showCoverageOnHover: false
                });
            }
            if(marker) {
                $scope.bplansPerDistrict[district].addLayer(marker);
            }
        });
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
            $scope.bplansPerDistrict = {}
            addGeojson($scope.places.bplan_points.features, 0);
            if(area){
                _.forEach($scope.bplansPerDistrict, function(clustergroup) {
                    clustergroup.addTo($scope.map);
                })
            }

        });
    });

    $scope.$on('filter:updated', function(event,data) {
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            clustergroup.clearLayers();
        })
        addGeojson($scope.places.bplan_points.features, 0);
        if($scope.map.getZoom() >= getZoomLevelForPolygons()){
            _.forEach($scope.polygons, function(value, key){
                if(!$scope.places.filters[key]){
                    _.forEach(value, function(value, key) {

                        $scope.map.removeLayer(value);
                    });
                } else {
                    _.forEach(value, function(value1) {
                        if (!$scope.map.hasLayer(value1)) {
                            value1.addTo($scope.map).bringToBack();
                        }
                    });
                }
            });
        }
        $scope.popupopen = false;
        if($scope.currentView == 'map') {
            setTimeout(function() {
                $scope.map.invalidateSize({
                    pan: false
                });
                $scope.map.removeLayer($scope.currentPolygon);
            }, 200);
        }
        $scope.districtMarkers.clearLayers();
        L.geoJson($scope.places.district, {
            onEachFeature : function(feature, layer) {
                var count = 0
                if($scope.places.filters['aul']){
                    count = count + feature.properties.bplan_aul_count
                }
                if($scope.places.filters['bbg']){
                    count = count + feature.properties.bplan_bbg_count
                }
                if($scope.places.filters['festg']){
                    count = count + feature.properties.bplan_festgesetzt_count
                }
                if($scope.places.filters['imVerfahren']){
                    count = count + feature.properties.bplan_imVerfahren_count
                }
                var districtName = feature.properties.name;
                var point = feature.properties.point;
                createDistrictMarker(point, count, districtName);
            }
        })
    });

    $scope.$on('ortsteil:updated', function() {
        $scope.closePopup();
        if (!angular.isUndefined($scope.address_marker)) {
            $scope.map.removeLayer($scope.address_marker);
        }
        $scope.address_marker = undefined;
        resetAfterDataUpdate();
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.map.removeLayer($scope.currentOrtsteil);
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.currentOrtsteil = L.geoJson(ortsteil).addTo($scope.map).bringToBack();
        $scope.currentOrtsteil.setStyle(ORTSTEILSTYLE);
        $scope.map.fitBounds($scope.currentOrtsteil);
        if($scope.map.getZoom >= getZoomLevelForPolygons()){
            getMultipolygons();
        }
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
        var count = 0;
        var layers = [];
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            var clusterlayers = clustergroup.getLayers();
            count = count + clusterlayers.length;
            layers = layers.concat(clusterlayers);
        });
        var group = new L.featureGroup(layers);
        if (count > 0) {
            $scope.map.fitBounds(group.getBounds());
        }
        $scope.map.setView($scope.address_marker.getLatLng());
        getMultipolygons();
    });

    $scope.$on('bplan:updated', function() {
        var pk = $scope.places.currentBplan.properties.pk;
        var status = $scope.places.currentBplan.properties.status;
        var layers = [];
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            layers = layers.concat(clustergroup.getLayers());
        });
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
            $scope.map.fitBounds(multipolygon.getBounds());
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
