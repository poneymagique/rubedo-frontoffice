    angular.module("rubedoBlocks").lazy.controller("MegaMenuController",['$scope','$location','RubedoMenuService','RubedoPagesService','RubedoContentsService',function($scope,$location,RubedoMenuService,RubedoPagesService,RubedoContentsService){
        var me=this;
        me.menu={};
        me.currentRouteline=$location.path();
        var config=$scope.blockConfig;
        me.searchEnabled = (config.useSearchEngine && config.searchPage);
        me.contentWidth = config.contentWidth;
        if (config.rootPage){
            var pageId=config.rootPage;
        } else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
            var pageId=$scope.rubedo.current.page.parentId;
        } else {
            var pageId=$scope.rubedo.current.page.id;
        }
        me.onSubmit = function(){
            var paramQuery = me.query?'?query='+me.query:'';
            RubedoPagesService.getPageById(config.searchPage).then(function(response){
                if (response.data.success){
                    $location.url(response.data.url+paramQuery);
                }
            });
        };
        
        $scope.$watch('rubedo.fieldEditMode', function(newValue) {
            $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;

        });
        me.getContentById = function (contentId){
            if(config.fromFront){
                me.content = config.content;
                $scope.fieldEntity=angular.copy(me.content.fields);
                $scope.fieldLanguage=me.content.locale;
            } else {
                var options = {
                    siteId: $scope.rubedo.current.site.id,
                    pageId: $scope.rubedo.current.page.id
                };
                RubedoContentsService.getContentById(contentId).then(
                    function(response){
                        if(response.data.success){
                            me.content=response.data.content;
                            $scope.fieldEntity=angular.copy(me.content.fields);
                            $scope.fieldLanguage=me.content.locale;
                        }
                    }
                )
            }
        };
        if (config.contentId || config.content){
            me.getContentById(config.contentId);
        }
        me.revertChanges=function(){
            $scope.fieldEntity=angular.copy(me.content.fields);
        };
        me.registerEditChanges=function(){
            $scope.rubedo.registerEditCtrl(me);
        };
        me.persistChanges=function(){
            var payload=angular.copy(me.content);
            payload.fields=angular.copy($scope.fieldEntity);
            delete (payload.type);
            RubedoContentsService.updateContent(payload).then(
                function(response){
                    if (response.data.success){
                        me.content.version = response.data.version;
                        $scope.rubedo.addNotification("success","Success","Content updated.");
                    } else {
                        $scope.rubedo.addNotification("danger","Error","Content update error.");
                    }
                },
                function(response){
                    $scope.rubedo.addNotification("danger","Error","Content update error.");
                }
            );
        };
        $scope.registerFieldEditChanges=me.registerEditChanges;
        
        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);