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
        me.registeredEditCtrls=[ ];
        me.fieldEditMode=false;
        me.notifications=[ ];
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

    app.directive("rubedoNotification",function(){
        return {
            restrict:"E",
            templateUrl:"/components/webtales/rubedo-frontoffice/templates/notification.html"
        };
    });

})();