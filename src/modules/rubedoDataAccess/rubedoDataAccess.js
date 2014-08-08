/**
 * Module providing data access services
 */
(function(){
    var module = angular.module('rubedoDataAccess', ['restangular']);

    //global Restangular config
    module.config(function(RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1');
    });

    //auxiliary functions
    auxObjectToQueryString=function(obj){
        var queryString=[];
        for (var prop in obj){
            if ((obj.hasOwnProperty(prop))&&(obj[prop])&&(obj[prop]!="")){
                queryString.push(encodeURIComponent(prop)+"="+encodeURIComponent(obj[prop]));
            }
        }
        return (queryString.join("&"));
    };



    //serives providing page json from current route
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

    //service providing image urls
    module.factory('RubedoImageUrlService', ["Restangular",function(Restangular) {
        var serviceInstance={};
        serviceInstance.getUrlByMediaId=function(mediaId,options){
            var url="/dam?media-id="+mediaId+"&";
            if (!_.isEmpty(options)){
                url=url+auxObjectToQueryString(options);
            }
            return(url);
        };
        return serviceInstance;
    }]);

})();