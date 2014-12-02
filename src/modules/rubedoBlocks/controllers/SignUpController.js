angular.module("rubedoBlocks").lazy.controller('SignUpController',['$scope','RubedoUserTypesService','RubedoUsersService', '$location','RubedoMailingListService', function($scope, RubedoUserTypesService, RubedoUsersService, $location, RubedoMailingListService){
    var me = this;
    var config = $scope.blockConfig;
    me.inputFields=[ ];
    me.mailingLists = {};
    me.prefix = "mailingLists_"+$scope.block.id;
    $scope.fieldIdPrefix="signUp";
    $scope.fieldEntity={ };
    $scope.fieldInputMode=true;
    me.signupError=null;
    me.submit=function(){
        me.signupError=null;
        if (config.collectPassword&&$scope.fieldEntity.confirmPassword!=$scope.fieldEntity.password){
            me.signupError="Passwords do not match.";
            return;
        }
        var fields=angular.copy($scope.fieldEntity);
        delete (fields.confirmPassword);
        fields.login=fields.email;
        RubedoUsersService.createUser(fields,config.userType).then(
            function(response){
                if (response.data.success){
                    me.showForm=false;
                    if (me.userType.signUpType=="open"){
                        me.confirmMessage="Blocks.SignUp.done.created";
                        me.confirmMessageDefault="Account created.";
                    } else if (me.userType.signUpType=="moderated"){
                        me.confirmMessage="Blocks.SignUp.moderated.created";
                        me.confirmMessageDefault="Account created. You will be able to log in as soon as an administrator validates your account.";
                    } else if (me.userType.signUpType=="emailConfirmation"){
                        me.confirmMessage="Blocks.SignUp.confirmEmail.emailSent";
                        me.confirmMessageDefault="A confirmation email has been sent to the provided address.";
                    }
                    if (config.mailingListId){
                        var options = {
                            mailingLists: config.mailingListId,
                            email: response.data.user.data.email
                        };
                        RubedoMailingListService.subscribeToMailingLists(options).then(function(response){
                        },function(response){
                        });
                    }
                } else {
                    me.signupError=response.data.message;
                }
            },
            function(response){
                me.signupError=response.data.message;
            }
        );
    };
    var queryParams=$location.search();
    if (queryParams.confirmingEmail&&queryParams.userId&&queryParams.signupTime){
        RubedoUsersService.confirmUserEmail(queryParams.userId,queryParams.signupTime).then(
            function(response){
                if (response.data.success){
                    me.confirmMessage="Blocks.SignUp.emailConfirmed.activated";
                    me.confirmMessageDefault="Account activated.";
                } else {
                    me.emailConfirmError=response.data.message;
                }
            },
            function(response){
                me.emailConfirmError=response.data.message;
            }
        );
    } else if (config.userType){
        RubedoUserTypesService.getUserTypeById(config.userType).then(
            function(response){
                if (response.data.success){
                    me.showForm=true;
                    me.userType=response.data.userType;
                    $scope.fieldIdPrefix="signUp"+"_"+me.userType.type;
                    if (config.collectPassword){
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"confirmPassword",
                                fieldLabel:"Confirm password",
                                allowBlank:false,
                                vtype:"password"
                            }
                        });
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"password",
                                fieldLabel:"Password",
                                allowBlank:false,
                                vtype:"password"
                            }
                        });
                    }
                    me.userType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"email",
                            fieldLabel:"E-mail",
                            allowBlank:false,
                            vtype:"email"
                        }
                    });
                    me.userType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"name",
                            fieldLabel:"Name",
                            allowBlank:false
                        }
                    });
                    me.inputFields=me.userType.fields;
                }
            }
        );
    }
    RubedoMailingListService.getAllMailingList().then(function(response){
        if(response.data.success){
            me.userType = response.data.userType;
            $scope.fieldIdPrefix=me.prefix+me.userType.type;
            angular.forEach(config.mailingListId, function(mailing){
                var newMailing = {};
                angular.forEach(response.data.mailinglists, function(mailingInfo){
                    if(mailingInfo.id == mailing){
                        newMailing.id = mailing;
                        newMailing.name = mailingInfo.name;
                        newMailing.checked = false;
                        me.mailingLists[mailing] = newMailing;
                    }
                });
            });
        }
    });
}]);