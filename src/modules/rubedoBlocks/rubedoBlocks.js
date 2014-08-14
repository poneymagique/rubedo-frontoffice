/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess']);

    var blocksConfig = {
        image:"/components/webtales/rubedo-frontoffice/templates/blocks/imageBlock.html",
        blockNotFound:"/components/webtales/rubedo-frontoffice/templates/blocks/blockNotFound.html",
        navigation:"/components/webtales/rubedo-frontoffice/templates/blocks/navigation.html",
        contentList:"/components/webtales/rubedo-frontoffice/templates/blocks/contentList.html",
        authentication:"/components/webtales/rubedo-frontoffice/templates/blocks/authentication.html"
    };

    module.factory('RubedoBlockTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplateByBType=function(bType){
            if (blocksConfig[bType]){
                return (blocksConfig[bType]);
            } else {
                return (blocksConfig.blockNotFound);
            }
        };
        return serviceInstance;
    });

    //generic block directive
    module.directive("rubedoBlock",function(){
        return {
            restrict:"E",
            templateUrl:"/components/webtales/rubedo-frontoffice/templates/rubedoBlock.html"
        };
    });

    //block controllers start here
    module.controller("MenuController",['$scope','$location','RubedoMenuService',function($scope,$location,RubedoMenuService){
        var me=this;
        me.menu={};
        me.currentRouteleine=$location.path();
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        if (config.rootPage){
            pageId=config.rootPage;
        }
        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);

    module.controller("ContentListController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
        var me = this;
        me.contentList=[];
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        var resultsSkip = config.resultsSkip?config.resultsSkip:0;
        me.actualPage = 1;
        var options = {
            start: config.resultsSkip?config.resultsSkip:0,
            limit: config.pageSize?config.pageSize:6
        };
        me.getContents = function (queryId, pageId, siteId, options){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
                if (response.data.success){
                    me.nbPages = Math.ceil((response.data.count - (resultsSkip?resultsSkip:0))/options['limit']);
                    me.showPager = config.showPager && me.nbPages > 1;
                    me.contentList=response.data.contents;
                }
            });
        };
        me.showActive = function(value){
            return value == me.actualPage;
        };
        me.getPagesNumber = function (index){
            var res;
            if (me.actualPage < 6 || (me.nbPages <= 9? me.nbPages : 9) < 9){
                res = index+1;
            } else if (me.actualPage + 4 >= me.nbPages) {
                res = me.nbPages - (8 - index);
            } else {
                res = me.actualPage + (index - 4);
            }
            return res;
        };
        me.getIteration = function(num){
            return new Array(num <= 9? num : 9);
        };
        me.changePage = function(value){
            if (me.actualPage != value + 1){
                if (value == 'prev'){
                    me.actualPage -= 1;
                    value = me.actualPage -1;
                } else if (value == 'next'){
                    me.actualPage += 1;
                    value = me.actualPage -1;
                } else {
                    me.actualPage = value + 1;
                }
                options['start'] = (value * options['limit']);
                if (resultsSkip)
                    options['start'] += resultsSkip;
                me.getContents(config.query, pageId, siteId, options);
            }
        };

        me.getContents(config.query, pageId, siteId, options);
    }]);

    module.controller("AuthenticationController",["$scope","RubedoAuthService",function($scope,RubedoAuthService){
        var me=this;
        me.blockConfig=$scope.blockConfig;
        me.credentials={ };
        me.authError=null;
        me.authenticate=function(){
            console.log(me.credentials);
            me.authError=null;
            if ((!me.credentials.login)||(!me.credentials.password)){
                me.authError="Please fill in all required fields."
            } else {
                RubedoAuthService.generateToken(me.credentials).then(
                    function(response){console.log(response);},
                    function(response){console.log(response);}
                );
            }
        };
    }]);
})();
