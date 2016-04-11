'use strict';

angular.module('app.map.controllers',[])

.controller('MapController',['$scope', '$window', 'PlacesService',function($scope, $window, PlacesService) {
    $scope.places = PlacesService;

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

    var addGeojson = function(markers, map, cluster) {

        $scope.geojson = L.geoJson(cluster, {
            pointToLayer: function (feature, latlng) {
                switch (feature.properties.status) {
                    case 'aul': return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: '#28d582',
                        weight: 0,
                        opacity: 0,
                        fillOpacity: 1
                    });
                    case 'bbg': return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: '#ff8a2c',
                        weight: 0,
                        opacity: 0,
                        fillOpacity: 1
                    });
                    case 'festg': return L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: '#47c6dd',
                        weight: 0,
                        opacity: 0,
                        fillOpacity: 1
                    });
                    case 'imVerfahren': return L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: '#e72323',
                        weight: 0,
                        opacity: 0,
                        fillOpacity: 1
                    });
                }
            },
            filter: function(feature, layer) {
                var status = feature.properties.status;
                return $scope.places.filters[status];
            }
        });
        markers.addLayer($scope.geojson);
        markers.on('click', function (marker) {
                if(angular.isUndefined(marker.layer.polygon)){
                    var content = marker.layer.feature.properties;
                    var polygon = L.geoJson(content.multipolygon).addTo(map).bringToBack();
                    switch (content.status) {
                        case 'aul':
                            var polygonstyle = {
                                'color': '#28d582',
                                'weight': 0.5,
                                'opacity': 1,
                                'fillOpacity': 0.3
                            };
                            polygon.setStyle(polygonstyle);
                            break;
                        case 'bbg':
                            var polygonstyle = {
                                'color': '#ff8a2c',
                                'weight': 0.5,
                                'opacity': 1,
                                'fillOpacity': 0.3
                            };
                            polygon.setStyle(polygonstyle);
                            break;
                        case 'festg':
                            var polygonstyle = {
                                'color': '#47c6dd',
                                'weight': 0.5,
                                'opacity': 1,
                                'fillOpacity': 0.3
                            };
                            polygon.setStyle(polygonstyle);
                            break;
                        case 'imVerfahren':
                            var polygonstyle = {
                                'color': '#e72323',
                                'weight': 0.5,
                                'opacity': 1,
                                'fillOpacity': 0.3
                            };
                            polygon.setStyle(polygonstyle);
                            break;
                    }
                    marker.layer.polygon = polygon;
                }
                else {
                    map.removeLayer(marker.layer.polygon);
                    delete marker.layer.polygon;
            }
        });

    }

    PlacesService.initMap().then( function() {

        $scope.map = createMap();

        $scope.markers = L.markerClusterGroup({
            disableClusteringAtZoom: 14,
        });
        $scope.markers.addTo($scope.map);

        PlacesService.initMapBplaene({}, $scope.places.map_markers.features).then(function () {
            addGeojson($scope.markers, $scope.map, $scope.places.map_markers);
        });
    });

    $scope.$on('filter:updated', function(event,data) {
        $scope.markers.clearLayers();
        addGeojson($scope.markers, $scope.map, $scope.places.map_markers);
   });

}]);

