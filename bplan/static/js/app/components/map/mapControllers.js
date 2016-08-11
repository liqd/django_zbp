'use strict';

angular.module('app.map.controllers',[])

.controller('MapController',['$scope', '$rootScope', '$window', '$timeout','PlacesService',function($scope, $rootScope, $window, $timeout, PlacesService) {
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

    var getColorForStaus = function(status) {
        if(status == 'aul') {
            return '#28d582';
        }
        else if(status == 'bbg') {
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
    }

    var getSizeForStaus = function(status) {
        if(status == 'aul') {
            return 25;
        }
        else if(status == 'bbg') {
            return 25;
        }
        else if(status == 'festg') {
            return 20;
        }
        else if(status == 'imVerfahren') {
            return 20;
        }
        else {
            console.log('Not a known status');
        }
    }

    var getMultipolygons = function () {
        var boundingbox = $scope.map.getBounds();
        var lat1 = boundingbox._northEast.lat;
        var lng1 = boundingbox._northEast.lng;
        var lat2 = boundingbox._southWest.lat;
        var lng2 = boundingbox._southWest.lng;
        var params =
            {
                'in_bbox': lng1 + ',' + lat1 + ',' + lng2 + ',' + lat2,

            }
        $scope.places.getBplanMultipolygonList(params).then(function (result ){
            _.forEach(result.features, function(value, key){
                var pk = value.properties.pk;
                var status = value.properties.status;
                if(!$scope.polygons[status][pk]){
                    var style = {
                        'color': getColorForStaus(status),
                        'weight': 0.5,
                        'opacity': 1,
                        'fillOpacity': 0.2
                    }
                    var multipolygon = L.geoJson(value);
                    multipolygon.setStyle(style);
                    $scope.polygons[status][pk] = multipolygon;
                    if($scope.places.filters[status]){
                        multipolygon.addTo($scope.map).bringToBack();
                    }
                }
                else {
                    if($scope.places.filters[status]){
                        if(!$scope.map.hasLayer($scope.polygons[status][pk])){
                            $scope.polygons[status][pk]. addTo($scope.map).bringToBack();
                        }
                    }
                }
            })
        })
    }

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

    var createMap = function(){
        var map = $window.L.map('map');
        L.tileLayer('https://maps.berlinonline.de/tile/osmbright_bde/{z}/{x}/{y}.png', {
        	attribution: 'Geoportal Berlin/Bebauungspläne, Geltungsbereiche',
        	maxZoom: 19
        }).addTo(map);

        $scope.districtMarkers = L.layerGroup()

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

        map.fitBounds($scope.districtLayer);
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
            if(map.getZoom() >= getZoomLevelForPolygons()){
                getMultipolygons();
            }
        });
        return map;
    };

    var createMarker = function(feature) {
        var status = feature.properties.status;
        var lon = feature.geometry.coordinates[0];
        var lat = feature.geometry.coordinates[1];
        var pk = feature.properties.pk;
        var color = getColorForStaus(status);
        var size = getSizeForStaus(status);
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
                $scope.map.removeLayer($scope.currentPolygon);
                this.multipolygon.addTo($scope.map).bringToBack();
                $scope.currentPolygon = this.multipolygon;
                $scope.places.getBplanDetail(this.pk).then(function(data){
                    $scope.currentItem = data;
                });
                $scope.currentMarker = this;
                $timeout(function() {
                    $scope.popupopen = true;
                    setTimeout(function(){
                        $scope.map.invalidateSize();
                        $scope.map.setView($scope.currentMarker._latlng);
                    }, 100);
                })
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
        setTimeout(function(){
            $scope.map.invalidateSize({
                pan:false
            });
            $scope.map.removeLayer($scope.currentPolygon);
        }, 200);
    }

    $scope.$on('data:loaded', function(event,data){

        $scope.places.initMap().then( function() {
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
                    })
                }
                else {
                    _.forEach(value, function(value, key) {
                        if(!$scope.map.hasLayer(value)){
                            value.addTo($scope.map).bringToBack();;
                        }
                    })
                }
            })
        }
        $scope.popupopen = false;
        if($scope.currentView == 'map'){
            setTimeout(function(){
                $scope.map.invalidateSize({
                    pan:false
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

    $scope.$on('ortsteil:updated', function(event,data) {
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            clustergroup.clearLayers();
        })
        _.forEach($scope.polygons, function(value, key){
            _.forEach(value, function(value, key) {
                $scope.map.removeLayer(value);
            })
        })
        resetPolygons();
        addGeojson($scope.places.bplan_points.features, 0);
        var ortsteil = $scope.places.ortsteile_polygons[$scope.places.currentOrtsteil];
        $scope.map.removeLayer($scope.currentOrtsteil);
        $scope.currentOrtsteil = L.geoJson(ortsteil).addTo($scope.map).bringToBack();
        $scope.currentOrtsteil.setStyle(ORTSTEILSTYLE);
        $scope.map.fitBounds($scope.currentOrtsteil);
        if($scope.map.getZoom >= getZoomLevelForPolygons()){
            getMultipolygons;
        }
    });

    $scope.$on('ortsteil:reset', function(event,data) {
        $scope.map.removeLayer($scope.currentOrtsteil);
        _.forEach($scope.bplansPerDistrict, function(clustergroup) {
            clustergroup.clearLayers();
        })
        addGeojson($scope.places.bplan_points.features, 0);
        $scope.map.fitBounds($scope.districtLayer);
    });

}]);

