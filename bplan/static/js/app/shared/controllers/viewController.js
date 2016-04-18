'use strict';

angular.module('app.shared.controllers.viewController',[])

.controller('ViewController',['$scope', '$rootScope', 'PlacesService',function($scope, $rootScope, PlacesService) {
    $scope.area = area;
    $scope.places = PlacesService;
    $scope.currentView = 'map';

    $scope.setView = function(type) {
        $scope.currentView = type;
    }

    $scope.updateFilter = function() {
    	$rootScope.$broadcast('filter:updated');
    }

    $scope.updateOrtsteil = function() {
        $rootScope.$broadcast('ortsteil:updated');
    }

    $scope.resetOrtsteil = function() {
        $scope.places.currentOrtsteilName = "Alle Ortsteile"
        $rootScope.$broadcast('ortsteil:reset');
    }

}])

.filter('status', function() {
    return function(status) {
        if(status == 'aul'){
            return "Öffentliche Auslegung";
        }
        else if(status == 'bbg'){
        	return "Frühzeitige Öffentlichkeitsbeteiligung";
        }
        else if(status == 'imVerfahren'){
            return "im Verfahren";
        }
        else if(status == 'festg'){
            return "Festgesetzt";
        }
        else {
        	return '';
        }
    }
});