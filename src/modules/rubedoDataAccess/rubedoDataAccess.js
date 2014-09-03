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

    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

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
        serviceInstance.getPageById=function(pageId){
            return ($http.get(config.baseUrl+"/pages/"+pageId));
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
                    "Authorization":"Basic "+Base64.encode(credentials.login+":" +credentials.password)
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