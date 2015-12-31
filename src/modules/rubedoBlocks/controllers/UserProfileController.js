angular.module("rubedoBlocks").lazy.controller("UserProfileController",["$scope","RubedoUsersService","$route","$location","RubedoMailingListService",function($scope, RubedoUsersService, $route,$location,RubedoMailingListService){
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
    $scope.fieldInputMode=false;
    me.canEdit=false;
    me.getUserById = function (userId){
        RubedoUsersService.getUserById(userId).then(
            function(response){
                if(response.data.success){
                    me.user=response.data.user;
                    me.initMl();
                    me.hasChanges=false;
                    $scope.fieldEntity=angular.copy(me.user.fields);
                    $scope.fieldLanguage=$route.current.params.lang;
                    $scope.userPhotoUrl=me.user.photoUrl;
                    me.canEdit=!me.user.readOnly;
                    $scope.fieldIdPrefix="userProfile"+me.user.type.type;
                    me.user.type.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"email",
                            fieldLabel:$scope.rubedo.translate("Label.Email", "Email"),
                            allowBlank:false,
                            vtype:"email"
                        }
                    });
                    me.user.type.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"name",
                            fieldLabel:$scope.rubedo.translate("Label.Name", "Name"),
                            allowBlank:false
                        }
                    });
                    me.user.type.fields.unshift({
                        cType:"userPhoto",
                        config:{
                            name:"photo",
                            fieldLabel:"Photo"
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
                }
            }
        );
    };
    var queryParams=$location.search();
    if (queryParams.userprofile&&mongoIdRegex.test(queryParams.userprofile)){
        me.getUserById(queryParams.userprofile);
    } else if ($scope.rubedo.current.user&&$scope.rubedo.current.user.id){
        me.getUserById($scope.rubedo.current.user.id);
    }
    me.revertChanges=function(){
        $scope.fieldInputMode=false;
        $scope.fieldEntity=angular.copy(me.user.fields);
        me.hasChanges=false;
        me.initMl();

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
                if (config.mailingListId){
                    var mailingListsSuscribe=[];
                    var mailingListsUnSuscribe=[];
                    angular.forEach(me.mailingLists, function(mailingList){
                        if(mailingList.checked){
                            mailingListsSuscribe.push(mailingList.id);
                        } else {
                            mailingListsUnSuscribe.push(mailingList.id);

                        }
                    });
                    if (mailingListsSuscribe.length>0){
                        var options = {
                            mailingLists: mailingListsSuscribe,
                            email: me.user.fields.email
                        };
                        RubedoMailingListService.subscribeToMailingLists(options).then(
                            function(response2){

                            },function(response2){

                            }
                        );
                    }
                    if (mailingListsUnSuscribe.length>0){
                        var options2 = {
                            mailingLists: mailingListsUnSuscribe,
                            email: me.user.fields.email
                        };
                        RubedoMailingListService.unsubscribeToMailingLists(options2).then(
                            function(response2){

                            },function(response2){

                            }
                        );
                    }
                }

                $scope.fieldInputMode=false;
                $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success", "Success !"),$scope.rubedo.translate("Blocks.UserProfile.Success.UserUpdated", "Profile updated."));
            },
            function(response){
                $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.error", "Error !"),$scope.rubedo.translate("Blocks.UserProfile.Error.UserNotUpdated", "Profile update error."));
            }
        );
    };
    me.enterEditMode=function(){
        $scope.fieldInputMode=true;
        me.hasChanges=true;
    };
    me.cancelEditMode=function(){
        $scope.fieldInputMode=false;
    };
    $scope.registerFieldEditChanges=me.registerEditChanges;
    $scope.updatePhotoUrl=function(photoUrl){
        $scope.userPhotoUrl=photoUrl;
        me.user.photoUrl=photoUrl;
    };
    me.mailingLists={};
    me.initMl = function() {
        if(config.mailingListId) {
            RubedoMailingListService.getAllMailingList().then(function(response){
                if(response.data.success){
                    angular.forEach(config.mailingListId, function(mailing){
                        var newMailing = {};
                        angular.forEach(response.data.mailinglists, function(mailingInfo){
                            if(mailingInfo.id == mailing){
                                newMailing.id = mailing;
                                newMailing.name = mailingInfo.name;
                                newMailing.checked = me.user.mailingLists && me.user.mailingLists[mailing] && me.user.mailingLists[mailing].status;
                                me.mailingLists[mailing] = newMailing;
                            }
                        });
                    });
                }
            });
        }
    }
}]);