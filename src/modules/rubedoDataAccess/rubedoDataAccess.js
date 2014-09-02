/**
 * Module providing data access services
 */
(function(){
    var module = angular.module('rubedoDataAccess', ['ngCookies']);

    //global config
    var config = {
        baseUrl:'/api/v1'
    };
    //handle fingerprinting
    if (typeof(Fingerprint)!="undefined"){
        config.fingerprint=new Fingerprint({canvas: true}).get();
    }


    //add params to all requests
    module.config(function($httpProvider ){
        $httpProvider.interceptors.push(function(){
            return {
              'request':function(outboundConfig){
                  if (!outboundConfig.params){
                      outboundConfig.params={};
                  }
                  if (config.accessToken){
                      outboundConfig.params.access_token=config.accessToken;
                  }
                  if (config.lang){
                      outboundConfig.params.lang =  config.lang;
                  }
                  if (config.fingerprint){
                      outboundConfig.params.fingerprint =  config.fingerprint;
                  }
                  return outboundConfig;

              }
            };
        });
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



    //service providing page json from current route
    module.factory('RubedoPagesService', ['$location','$route','$http',function($location,$route,$http) {
        var serviceInstance={};
        serviceInstance.getPageByCurrentRoute=function(){
            config.lang = $route.current.params.lang;
            return ($http.get(config.baseUrl+"/pages",{
                params:{
                    site:$location.host(),
                    route:$route.current.params.routeline
                }
            }));
        };
        return serviceInstance;
    }]);

    //service providing menu structure using root page id, level and language
    module.factory('RubedoMenuService', ['$route','$http',function($route,$http) {
        var serviceInstance={};
        serviceInstance.getMenu=function(pageId,menuLevel){
            return ($http.get(config.baseUrl+"/menu",{
                params:{
                    pageId:pageId,
                    menuLocale:$route.current.params.lang,
                    menuLevel:menuLevel
                }
            }));
        };
        return serviceInstance;
    }]);

    //service providing image urls
    module.factory('RubedoImageUrlService', function() {
        var serviceInstance={};
        serviceInstance.getUrlByMediaId=function(mediaId,options){
            var url="/dam?media-id="+mediaId+"&";
            if (options){
                url=url+auxObjectToQueryString(options);
            }
            return(url);
        };

        serviceInstance.getThumbnailUrlByMediaId = function(mediaId){
            var url="/dam/get-thumbnail?media-id="+mediaId;
            return(url);
        };
        return serviceInstance;
    });

    //service providing access to contents
    module.factory('RubedoContentsService', ['$route','$http', function($route,$http){
        var serviceInstance={};
        serviceInstance.getContents=function(queryId,pageId,siteId,options){
            var params = {
                queryId: queryId,
                    pageId: pageId,
                    siteId: siteId
            };
            if (options){
                angular.extend(params,options);
            }
            return ($http.get(config.baseUrl+"/contents", {
                params: params
            }));
        };
        serviceInstance.getContentById = function(contentId){
          return ($http.get(config.baseUrl+"/contents/"+contentId));
        };
        serviceInstance.updateContent=function(content){
            return ($http({
                url:config.baseUrl+"/contents/"+content.id,
                method:"PATCH",
                data : {
                    content:content
                }
            }));

        };
        return serviceInstance;
    }]);

    // authentication service
    module.factory('RubedoAuthService',['$http','$cookies',function($http,$cookies){
        var serviceInstance={};
        serviceInstance.persistTokens=function(accessToken,refreshToken){
            $cookies.accessToken=accessToken;
            $cookies.refreshToken=refreshToken;
            config.accessToken=accessToken;
        };
        serviceInstance.clearPersistedTokens=function(){
            delete($cookies.accessToken);
            delete($cookies.refreshToken);
            delete(config.accessToken);
        };
        serviceInstance.getPersistedTokens=function(){
            return {
                accessToken:$cookies.accessToken,
                refreshToken:$cookies.refreshToken
            };
        };
        serviceInstance.generateToken=function(credentials){
            return ($http({
                url:config.baseUrl+"/auth/oauth2/generate",
                method:"POST",
                headers :{
                    "Authorization":"Basic "+btoa(credentials.login+":" +credentials.password)
                },
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success){
                        serviceInstance.persistTokens(dataObj.token.access_token,dataObj.token.refresh_token);
                    }
                    return(dataObj);
                }
            }));
        };
        serviceInstance.refreshToken=function(){
            return ($http({
                url:config.baseUrl+"/auth/oauth2/refresh",
                method:"POST",
                params:{
                    "refresh_token":serviceInstance.getPersistedTokens().refreshToken
                },
                transformResponse:function(data,headerGetter){
                    var dataObj=angular.fromJson(data);
                    if (dataObj.success){
                        serviceInstance.persistTokens(dataObj.token.access_token,dataObj.token.refresh_token);
                    } else {
                        serviceInstance.clearPersistedTokens();
                    }
                    return(dataObj);
                }
            }));
        };
        return serviceInstance;
    }]);

    //service providing research using ElasticSearch
    module.factory('RubedoSearchService',['$http',function($http){
        var serviceInstance = {};

        //Global Research
        serviceInstance.searchByQuery = function(options){
            return ($http.get(config.baseUrl+"/search", {
                params: options
            }));
        };
        //Media Research
        serviceInstance.getMediaById = function(options){
            return ($http.get(config.baseUrl+"/media/search", {
                params: options
            }));
        };
        return serviceInstance;
    }]);

})();