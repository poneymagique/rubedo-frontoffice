angular.module("rubedoBlocks").lazy.controller("AuthenticationController",["$scope","RubedoAuthService","snapRemote","RubedoPagesService","$location",function($scope,RubedoAuthService,snapRemote,RubedoPagesService,$location){
    var me=this;
    me.blockConfig=$scope.blockConfig;
    if (me.blockConfig&&me.blockConfig.profilePage&&mongoIdRegex.test(me.blockConfig.profilePage)){
        RubedoPagesService.getPageById(me.blockConfig.profilePage).then(function(response){
            if (response.data.success){
                me.profilePageUrl=response.data.url;
            }
        });
    }
    var requestParams = $location.search();
    if (requestParams.recoverEmail && requestParams.token){
        setTimeout(function(){angular.element('#rubedoChangePwdModal').appendTo('body').modal('show')},200);
    }
    me.credentials={ };
    me.authError=null;
    me.rememberMe=false;
    me.showModal=function(){
        angular.element('#rubedoAuthModal').appendTo('body').modal('show');
    };
    me.recoverPwdModal=function(){
        angular.element('#rubedoAuthModal').appendTo('body').modal('hide');
        angular.element('#rubedoRecoverPwdModal').appendTo('body').modal('show');
    };
    me.changePassword = function(){
        if(me.newPassword != me.newConfirmPassword){
            $scope.notification = {
                type: 'error',
                text: 'Passwords do not match.'
            };
        } else {
            var options = {
                token: requestParams.token,
                password: me.newPassword,
                email: requestParams.recoverEmail
            };
            RubedoAuthService.changePassword(options).then(
                function(response){
                    if(response.data.success){
                        $scope.notification = {
                            type: 'success',
                            text: $scope.rubedo.translate("Blocks.UserProfile.Success.PasswordChanged")
                        };
                        $location.search('recoverEmail',null);
                        $location.search('token',null);
                    }
                    me.recoverUserEmail = '';
                },function(response){
                    console.log(response);
                    $scope.notification = {
                        type: 'error',
                        text: $scope.rubedo.translate("Blocks.SignUp.emailConfirmError.userUpdateFailed")+" "+(response.data.message?' : '+response.data.message:'')
                    };
                }
            )
        }
    };
    me.recoverPassword = function(){
        var options = {
            email: me.recoverUserEmail,
            siteId: $scope.rubedo.current.site.id
        };
        RubedoAuthService.recoverPassword(options).then(
            function(response){
                if(response.data.success){
                    $scope.notification = {
                        type: 'success',
                        text: 'Email sent'
                    };
                }
                me.recoverUserEmail = '';
            },function(response){
                console.log(response);
                $scope.notification = {
                    type: 'error',
                    text: 'Email not sent'+(response.data.message?' : '+response.data.message:'')
                };
            }
        )
    };
    me.authenticate=function(){
        me.authError=null;
        if ((!me.credentials.login)||(!me.credentials.password)){
            me.authError="Please fill in all required fields."
        } else {
            RubedoAuthService.generateToken(me.credentials,me.rememberMe).then(
                function(response){
                    window.location.reload();
                },
                function(response){
                    me.authError=response.data.message;
                }
            );
        }
    };
    me.logOut=function(){
        RubedoAuthService.clearPersistedTokens();
        window.location.reload();
    }
}]);