angular.module("rubedoBlocks").lazy.controller("SiteMapController",['$scope','$location','RubedoMenuService',function($scope,$location,RubedoMenuService){
    var me=this;
    var config=$scope.blockConfig;
    if(config.rootPage){
        me.menu={};
        me.currentRouteline=$location.path();
        var pageId=$scope.rubedo.current.page.id;
        me.hidePages = true;
        me.hideChildPages = true;
        me.showPagesClick = function(pageType){
            if(pageType == 'pages'){
                me.hidePages = !me.hidePages;
            } else {
                me.hideChildPages = !me.hideChildPages;
            }
        };
        if(config.displayLevel == 2){
            me.hidePages = false;
        } else if (config.displayLevel > 2){
            me.hidePages = false;
            me.hideChildPages = false;
        }
        RubedoMenuService.getMenu(config.rootPage, 5).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }
}]);