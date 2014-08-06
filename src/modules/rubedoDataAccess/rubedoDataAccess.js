/**
 * Module providing data access services
 */
(function(){
    var module = angular.module('rubedoDataAccess', ['restangular']);

    //global Restangular config
    module.config(function(RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1');
    });

    //serives returning restangular objects
    module.factory('RubedoPagesService', ['$location','$route','Restangular',function($location,$route,Restangular) {
        var serviceInstance={};
        serviceInstance.getPageByCurrentRoute=function(){
            var element=Restangular.one("pages");
            return (element.get({
                site:$location.host(),
                route:$route.current.params.routeline,
                lang:$route.current.params.lang
            }));
        };
        return serviceInstance;
    }]);

})();