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

    var addGeojson = function(color, radius, markers, map, cluster) {

        var polygonstyle = {
                'color': color,
                'weight': 0.5,
                'opacity': 1,
                'fillOpacity': 0.3
            }

        var markerOptions = {
                radius: radius,
                fillColor: color,
                weight: 0,
                opacity: 0,
                fillOpacity: 1
            };

        var geojson = L.geoJson(cluster, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, markerOptions);
            }
        });
        markers.addLayer(geojson);
        markers.on('click', function (marker) {
                if(angular.isUndefined(marker.layer.polygon)){
                    var content = marker.layer.feature.properties;
                    var polygon = L.geoJson(content.multipolygon).addTo(map).bringToBack();
                    polygon.setStyle(polygonstyle);
                    marker.layer.polygon = polygon;
                }
                else {
                    map.removeLayer(marker.layer.polygon);
                    delete marker.layer.polygon;
            }
        });

    }

    PlacesService.initMap().then( function() {

        var map = createMap();

        var markers_aul = L.markerClusterGroup({
            disableClusteringAtZoom: 10,
        });
        markers_aul.addTo(map);

        var markers_bbg = L.markerClusterGroup({
            disableClusteringAtZoom: 10,
        });
        markers_bbg.addTo(map);

        var markers_festg = L.markerClusterGroup({
            disableClusteringAtZoom: 14,
            animate: true,
            animateAddingMarkers: true
        });
        markers_festg.addTo(map);

        var markers_imVerfahren = L.markerClusterGroup({
            disableClusteringAtZoom: 14,
            animate: true,
            animateAddingMarkers: true
        });
        markers_imVerfahren.addTo(map);

        PlacesService.initMapBplaene({'status':'aul'}, $scope.places.status_aul).then(function () {
            var status_aul = $scope.places.status_aul;
            addGeojson('#28d582', 8, markers_aul, map, status_aul);

            PlacesService.initMapBplaene({'status':'bbg'}, $scope.places.status_bbg).then(function () {
                var status_bbg = $scope.places.status_bbg;
                addGeojson('#ff8a2c', 8, markers_bbg, map, status_bbg);

                PlacesService.initMapBplaene({'status':'imVerfahren'}, $scope.places.status_imVerfahren).then(function () {
                    var status_imVerfahren = $scope.places.status_imVerfahren;
                    addGeojson('#e72323', 4, markers_imVerfahren, map, status_imVerfahren);

                    PlacesService.initMapBplaene({'festg':'True'}, $scope.places.status_festg).then(function () {
                        var status_festg = $scope.places.status_festg;
                        addGeojson('#47c6dd', 4, markers_festg, map, status_festg);
                    });
                });
            });
        });
    });

}]);

