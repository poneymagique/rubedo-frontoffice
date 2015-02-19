    angular.module("rubedoBlocks").lazy.controller("CategoryController",['$scope','$location','RubedoMenuService','RubedoPagesService',function($scope,$location,RubedoMenuService,RubedoPagesService){
        var me=this;
        me.menu={};
        me.currentRouteline=$location.path();
        var config=$scope.blockConfig;
        me.nbOfColumns= config.nbOfColumns ? config.nbOfColumns : 1;
        me.colClass="col-lg-"+12/me.nbOfColumns;
        me.imageHeight= config.imageHeight ? config.imageHeight : null;
        me.imageWidth= config.imageWidth ? config.imageWidth : null;
        me.imageStyle={};
        if (me.imageHeight){
            me.imageStyle['height']=me.imageHeight+"px";
            me.imageStyle['overflow']="hidden";
        }
        if (me.nbOfColumns>1){
            me.colClass=me.colClass+" col-md-"+12/(me.nbOfColumns+1);
        }
        if (config.rootPage){
            var pageId=config.rootPage;
        } else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
            var pageId=$scope.rubedo.current.page.parentId;
        } else {
            var pageId=$scope.rubedo.current.page.id;
        }
        me.menuLevel=config.showLevel2Categories ? 2 : 1;
        RubedoMenuService.getMenu(pageId, me.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);