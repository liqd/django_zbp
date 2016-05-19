var app = angular.module('app',[
	'angular-loading-bar',
	'ngAnimate',
    'app.shared.services.places',
    'app.map.controllers',
    'app.list.controllers',
    'app.shared.controllers.viewController',
    'app.list.directives',
    'app.map.directives',
    'app.shared.directives'
])
.constant('API_END_POINTS', {
    'bezirke' : '/api/bezirke/',
    'bplan_data' : '/api/bplan/data/',
    'bplan_multipolygon' : '/api/bplan/multipolygons/',
    'bplan_point' : '/api/bplan/points/',
    'bplan' : '/api/bplan/',
    'addresses' : '/api/addresses/',
})
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
	cfpLoadingBarProvider.includeSpinner = false;
}]);





