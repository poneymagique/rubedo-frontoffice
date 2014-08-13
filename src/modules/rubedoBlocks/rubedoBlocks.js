/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess']);

    var blocksConfig = {
        image:"/components/webtales/rubedo-frontoffice/templates/blocks/imageBlock.html",
        blockNotFound:"/components/webtales/rubedo-frontoffice/templates/blocks/blockNotFound.html",
        navigation:"/components/webtales/rubedo-frontoffice/templates/blocks/navigation.html",
        contentList:"/components/webtales/rubedo-frontoffice/templates/blocks/contentList.html"
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
        me.showPager = config.showPager;
        me.start = config.skip?config.skip:0;
        me.limit = config.limit?config.limit:6;
        me.actualPage = 1;
        var options = {
            start: me.start,
            limit: me.limit
        };
        getContents(config.query, pageId, siteId, options);
        me.getIteration = function(num){
            return new Array(num);
        };
        me.getContents = function(value){
            console.log(value);
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
            getContents(config.query, pageId, siteId, options);
        };
        function getContents (queryId, pageId, siteId, options){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
                if (response.data.success){
                    me.nbPages = Math.ceil(response.data.count/me.limit);
                    me.contentList=response.data.contents;
                }
            });
        }
    }]);

})();