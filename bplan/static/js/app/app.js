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
            L.tileLayer('http://maps.berlinonline.de/tile/bdemarker/{z}/{x}/{y}.png', {
            //L.tileLayer('http://tiles.codefor.de/bbs-berlin/{z}/{x}/{y}.png', {
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

        $http({
            method: 'GET',
            url: '/api/bplaene/',
            params: {bezirk__slug: area}
        }).then(function successCallback(response) {
                cluster = response.data;
                var markers = L.markerClusterGroup();
            var geojson = L.geoJson(cluster);
            markers.addLayer(geojson);
            markers.addTo(map);
        }, function errorCallback(response) {
            console.log(response);
        });

        //$scope.createClusterLayer();

        /*angular.forEach(PlacesService.data, function (v,k){
            v.id = k;
            var marker = L.marker([v.geometry.coordinates[1], v.geometry.coordinates[0]]);
            var popup = L.popup().setContent('<b>' + v.properties.adresse + '</b>');
            marker.itemkey = k;
            marker.popup = popup;
            marker.bindPopup(marker.popup);

            marker.on('click', function (e) {
                $timeout(function() {
                    $scope.places.activeItem = $scope.places.data[e.target.itemkey];
                    var string = $scope.places.activeItem.properties.bezirke[0] +e.target.itemkey;
                    var element = angular.element('#' + string);
                    var scrollContainer = angular.element('#scroll-container');
                    scrollContainer.scrollToElement(element, 10, 300);
                })
            });

            marker.on('dblclick', function (e){
                if(angular.isUndefined($scope.places.proposalItem)){
                    $scope.places.proposalItem = $scope.places.data[e.target.itemkey];
                }
                else{
                   $($scope.places.proposalItem.marker._icon).removeClass("highlighted");
                   $scope.places.proposalItem = $scope.places.data[e.target.itemkey];
                }
                $scope.$parent.showProposal($scope.places.data[e.target.itemkey]);
                $scope.$parent.$apply();
                $(marker._icon).addClass("highlighted");
                marker.openPopup();
                var location = new L.LatLng(marker._latlng.lat, marker._latlng.lng);
                map.panTo(location);
            });

            v.marker = marker;
            marker.data = v;
            //markers.addLayer(marker);

            for(var i = 0; i<$scope.places.districtClusters.length; i++){
                if($scope.places.districtClusters[i].name === v.properties.bezirke[0]){
                    $scope.places.districtClusters[i].markers.addLayer(marker);
                    $scope.places.districtClusters[i].count = $scope.places.districtClusters[i].count + 1;
                    $scope.places.districtClusters[i].data.push(v);
                }
            }
        });*/

        //$scope.createDistrictLayer();
    });
}]);

