(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','rubedoBlocks','ngRoute','snap']);
    var current={
        page:{
            blocks:[]
        },
        site:{

        },
        user:null
    };

    app.config(function($routeProvider,$locationProvider) {
        $routeProvider.when('/:lang/:routeline*?', {
                template: '<ng-include src="pageBodyCtrl.currentBodyTemplate"></ng-include>',
                controller:'PageBodyController',
                controllerAs: "pageBodyCtrl"
            }).otherwise({
                templateUrl:'/components/webtales/rubedo-frontoffice/templates/404.html'
        });
        $locationProvider.html5Mode(true);
    });

    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService','RubedoAuthService','RubedoFieldTemplateResolver','snapRemote', function(RubedoBlockTemplateResolver,RubedoImageUrlService,RubedoAuthService,RubedoFieldTemplateResolver,snapRemote){
        //set context and page-wide services
        var me=this;
        me.snapOpts={
          disable:'right',
          tapToClose:false
        };
        snapRemote.getSnapper().then(function(snapper) {
            snapper.disable();
        });
        me.current=current;
        me.blockTemplateResolver=RubedoBlockTemplateResolver;
        me.fieldTemplateResolver=RubedoFieldTemplateResolver;
        me.imageUrl=RubedoImageUrlService;
        me.fieldEditMode=false;
        //attempt to restore identity using persisted auth
        if (RubedoAuthService.getPersistedTokens().refreshToken){
            RubedoAuthService.refreshToken().then(
                function(response){
                    me.current.user=response.data.token.user;
                    if (me.current.user.rights.canEdit){
//                        snapRemote.getSnapper().then(function(snapper) {
//                            //snapper.enable();
//                        });
                    }
                }
            );
        }
        me.toggleAdminPanel=function(){
            snapRemote.toggle("left");
        };

        me.enterEditMode=function(){
            me.fieldEditMode=true;
            console.log("entered edit mode");
        };
    }]);

    app.controller("PageBodyController",['RubedoPagesService',function(RubedoPagesService){
        var me=this;
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            if (response.data.success){
                current.page=angular.copy(response.data.page);
                current.site=angular.copy(response.data.site);
                me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/defaultPageBody.html';
            }
        },function(response){
            if (response.status==404){
                current.page={
                    text:"404",
                    blocks:[]
                };
                me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/404.html';
            }
            // @TODO handle other error codes or use generic error template
        });

    }]);

})();