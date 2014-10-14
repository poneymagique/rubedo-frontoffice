angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService",function($scope, RubedoContentsService){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.fieldInputMode=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;

    });
    me.getFieldByName=function(name){
        var field=null;
        angular.forEach(me.content.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field;
    };

    me.getContentById = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };
        RubedoContentsService.getContentById(contentId, options).then(
            function(response){
                if(response.data.success){
                    $scope.rubedo.current.page.contentCanonicalUrl = response.data.content.canonicalUrl;
                    me.content=response.data.content;
                    $scope.fieldEntity=angular.copy(me.content.fields);
                    $scope.fieldLanguage=me.content.locale;
                    me.content.type.fields.unshift({
                        cType:"title",
                        config:{
                            name:"text",
                            fieldLabel:"Title",
                            allowBlank:false
                        }
                    });
                    $scope.rubedo.current.breadcrumb.push({title:response.data.content.text});
                    if (me.content.type.activateDisqus&&$scope.rubedo.current.site.disqusKey){
                        me.activateDisqus=true;
                        me.disqusShortname=$scope.rubedo.current.site.disqusKey;
                        me.disqusIdentifier=me.content.id;
                        me.disqusUrl=window.location.href;
                        me.disqusTitle=me.content.text;
                    }
                    me.customLayout=null;
                    if (angular.isArray(me.content.type.layouts)){
                        angular.forEach(me.content.type.layouts,function(layout){
                            if (layout.active&&layout.site==$scope.rubedo.current.site.id){
                                me.customLayout=layout;
                            }
                        });
                    }
                    if (me.customLayout&&me.customLayout.customTemplate){
                        me.detailTemplate=themePath+'/templates/blocks/contentDetail/customTemplate.html';
                    } else if (me.customLayout){
                        me.detailTemplate=themePath+'/templates/blocks/contentDetail/customLayout.html';
                    } else {
                        me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
                    }
                }
            }
        );
    };
    if (config.contentId){
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
                $scope.rubedo.addNotification("success","Success","Content updated.");
            },
            function(response){
                $scope.rubedo.addNotification("error","Error","Content update error.");
            }
        );
    };
    $scope.registerFieldEditChanges=me.registerEditChanges;
}]);