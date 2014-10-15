angular.module("rubedoBlocks").lazy.controller("UserProfileController",["$scope","RubedoUsersService","$route",function($scope, RubedoUsersService, $route){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.getFieldByName=function(name){
        var field=null;
        angular.forEach(me.user.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field;
    };
    $scope.fieldEditMode=false;
    me.canEdit=false;
    me.getUserById = function (userId){
        RubedoUsersService.getUserById(userId).then(
            function(response){
                if(response.data.success){
                    me.user=response.data.user;
                    me.hasChanges=false;
                    $scope.fieldEntity=angular.copy(me.user.fields);
                    $scope.fieldLanguage=$route.current.params.lang;
                    me.canEdit=!me.user.readOnly;
                    //use only default template for now
                    me.user.type.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"email",
                            fieldLabel:"E-mail",
                            allowBlank:false,
                            vtype:"email"
                        }
                    });
                    me.user.type.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"name",
                            fieldLabel:"Name",
                            allowBlank:false
                        }
                    });
                    me.customLayout=null;
                    if (angular.isArray(me.user.type.layouts)){
                        angular.forEach(me.user.type.layouts,function(layout){
                            if (layout.active&&layout.site==$scope.rubedo.current.site.id){
                                me.customLayout=layout;
                            }
                        });
                    }
                    if (me.customLayout&&me.customLayout.customTemplate){
                        me.detailTemplate=themePath+'/templates/blocks/userDetail/customTemplate.html';
                    } else if (me.customLayout){
                        me.detailTemplate=themePath+'/templates/blocks/userDetail/customLayout.html';
                    } else {
                        me.detailTemplate=themePath+'/templates/blocks/userDetail/default.html'
                    }
                    //me.detailTemplate=themePath+'/templates/blocks/userDetail/default.html';
                }
            }
        );
    };
    if ($scope.rubedo.current.user&&$scope.rubedo.current.user.id){
        me.getUserById($scope.rubedo.current.user.id);
    }
    me.revertChanges=function(){
        $scope.fieldEditMode=false;
        $scope.fieldEntity=angular.copy(me.user.fields);
        me.hasChanges=false;
    };
    me.registerEditChanges=function(){
        me.hasChanges=true;
    };
    me.persistChanges=function(){
        var payload=angular.copy(me.user);
        payload.fields=angular.copy($scope.fieldEntity);
        delete (payload.type);
        RubedoUsersService.updateUser(payload).then(
            function(response){
                console.log(response);
            },
            function(response){
                console.log(response);
            }
        );
    };
    me.enterEditMode=function(){
        $scope.fieldEditMode=true;
    };
    me.cancelEditMode=function(){
        $scope.fieldEditMode=false;
    };
    $scope.registerFieldEditChanges=me.registerEditChanges;
}]);