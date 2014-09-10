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
                controllerAs: "pageBodyCtrl",
                reloadOnSearch: false
            }).otherwise({
                templateUrl:'/components/webtales/rubedo-frontoffice/templates/404.html'
        });
        $locationProvider.html5Mode(true);

    });

    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService','RubedoAuthService','RubedoFieldTemplateResolver','snapRemote','RubedoPageComponents', function(RubedoBlockTemplateResolver,RubedoImageUrlService,RubedoAuthService,RubedoFieldTemplateResolver,snapRemote, RubedoPageComponents){
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
        me.componentsService=RubedoPageComponents;
        me.imageUrl=RubedoImageUrlService;
        me.registeredEditCtrls=[ ];
        me.fieldEditMode=false;
        me.notifications=[ ];
        me.refreshAuth=function(forceRefresh){
            var curentTokens=RubedoAuthService.getPersistedTokens();
            if (curentTokens.refreshToken&&(!curentTokens.accessToken||forceRefresh)){
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
        };

        me.refreshAuth(true);
        setInterval(function () {me.refreshAuth(false);}, 300000);
        me.clearNotifications=function(){
            me.notifications=[ ];
        };
        me.addNotification=function(type,text){
            me.notifications.push({
                type:type,
                text:text
            });
        };
        me.hasNotifications=function(){
            if (angular.element.isEmptyObject(me.notifications)){
                return false;
            } else {
                return true;
            }
        };
        me.toggleAdminPanel=function(){
            snapRemote.toggle("left");
        };
        me.enterEditMode=function(){
            me.fieldEditMode=true;
        };
        me.revertChanges=function(){
            me.fieldEditMode=false;
            angular.forEach(me.registeredEditCtrls,function(ctrlRef){
                ctrlRef.revertChanges();
            });
            me.registeredEditCtrls=[];
        };
        me.persistChanges=function(){
            me.fieldEditMode=false;
            angular.forEach(me.registeredEditCtrls,function(ctrlRef){
                ctrlRef.persistChanges();
            });
            me.registeredEditCtrls=[];
        };
        me.registerEditCtrl=function(ctrlRef){
            if (angular.element.inArray(ctrlRef,me.registeredEditCtrls)){
                me.registeredEditCtrls.push(ctrlRef);
            }
        };

    }]);

    app.controller("PageBodyController",['RubedoPagesService', 'RubedoModuleConfigService',function(RubedoPagesService, RubedoModuleConfigService){
        var me=this;
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            if (response.data.success){
                var newPage=angular.copy(response.data.page);
                newPage.pageProperties=angular.copy(response.data.mask.pageProperties);
                newPage.mainColumnId=angular.copy(response.data.mask.mainColumnId);
                current.page=newPage;
                current.site=angular.copy(response.data.site);
                current.breadcrumb=angular.copy(response.data.breadcrumb);
                if (response.data.site.locStrategy == 'fallback'){
                    RubedoModuleConfigService.addFallbackLang(response.data.site.defaultLanguage);
                }
                if (newPage.pageProperties.customTemplate){
                    me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/customPageBody.html';
                } else {
                    me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/defaultPageBody.html';
                }
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

    app.directive("rubedoNotification",function(){
        return {
            restrict:"E",
            templateUrl:"/components/webtales/rubedo-frontoffice/templates/notification.html"
        };
    });

})();