angular.module("rubedoBlocks").lazy.controller("AuthenticationController",["$scope","RubedoAuthService","snapRemote","RubedoPagesService",function($scope,RubedoAuthService,snapRemote,RubedoPagesService){
    var me=this;
    me.blockConfig=$scope.blockConfig;
    if (me.blockConfig&&me.blockConfig.profilePage&&mongoIdRegex.test(me.blockConfig.profilePage)){
        RubedoPagesService.getPageById(me.blockConfig.profilePage).then(function(response){
            if (response.data.success){
                me.profilePageUrl=response.data.url;
            }
        });
    }
    me.credentials={ };
    me.authError=null;
    me.rememberMe=false;
    me.showModal=function(){
        angular.element('#rubedoAuthModal').appendTo('body').modal('show');
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