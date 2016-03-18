var app = angular.module('app',[]);

app.factory('PlacesService',['$http', '$q', '$window', function($http, $q, $window) {

    var places = {};

    places.init = function () {

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
    return places;
}]);

app.controller('MapController',['$scope', '$http', 'PlacesService',function($scope, $http, PlacesService) {
	$scope.places = PlacesService;

	$scope.createMap = function(){
        map = L.map('map');
            //L.tileLayer('http://maps.berlinonline.de/tile/bdemarker/{z}/{x}/{y}.png', {
            L.tileLayer('http://tiles.codefor.de/bbs-berlin/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy;',
            maxZoom: 18
        }).addTo(map);

        var style = {
            "color": "#808080",
            "weight": 2,
            "opacity": 1,
            "fillOpacity": 0
        };

        districtLayer = L.geoJson($scope.places.district).addTo(map);
        districtLayer.setStyle(style);
		map.fitBounds(districtLayer);
        currentZoom = map.getZoom();
        map.options.minZoom = currentZoom;
    };

	PlacesService.init().then( function() {

        $scope.createMap();

        params = {};

        if(area){
            params.bezirk__slug = area;
            params.afs_behoer = "Bezirksamt";
        }
        /*else {
            params.afs_behoer = "Senat";
        }*/

        $http({
            method: 'GET',
            url: '/api/bplaene/',
            params: params
        }).then(function successCallback(response) {
                cluster = response.data;
                var markers = L.markerClusterGroup({ disableClusteringAtZoom: 14 });
            var geojson = L.geoJson(cluster);
            markers.addLayer(geojson);
            markers.on('click', function (marker) {
                if(angular.isUndefined(marker.layer.polygon)){
                    var content = marker.layer.feature.properties;
                    var polygon = L.geoJson(content.multipolygon).addTo(map);
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

