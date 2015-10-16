(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','rubedoBlocks','ngRoute','snap'])
        .config(function($locationProvider) {
            $locationProvider.html5Mode(true);
            $locationProvider.hashPrefix('!');
        });

    var themePath="/theme/"+window.rubedoConfig.siteTheme;

    var current={
        page:{
            blocks:[]
        },
        site:{

        },
        user:null
    };

    app.config(function($routeProvider,$locationProvider,$controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
        $routeProvider.when('/:lang/:routeline*?', {
                template: '<ng-include src="pageBodyCtrl.currentBodyTemplate"></ng-include>',
                controller:'PageBodyController',
                controllerAs: "pageBodyCtrl",
                reloadOnSearch: false
            }).otherwise({
                templateUrl:themePath+'/templates/404.html'
        });
        $locationProvider.html5Mode(true);

    });


    app.factory('UXUserService',["RubedoModuleConfigService",function(RubedoModuleConfigService){
        var serviceInstance = {};
        serviceInstance.ISCONNECTED=function(){
            return(current.user ? true : false);
        };
        serviceInstance.FINGERPRINT=function(){
            return(RubedoModuleConfigService.getConfig().fingerprint);
        };
        serviceInstance.emailRegex= /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        serviceInstance.ISEMAILVALID=function(){
            if (!current.user){
                return false;
            }
            return(serviceInstance.emailRegex.test(current.user.email));
        };
        serviceInstance.SUBSCRIBEDTO=function(mailingList){
            return current.user&&current.user.mailingLists&&current.user.mailingLists[mailingList]&&current.user.mailingLists[mailingList].status ? true : false;
        };
        serviceInstance.ISGEOLOCATED=function(){
            return navigator.geolocation ? true : false;
        };
        return serviceInstance;
    }]);

    app.factory('UXPageService',["RubedoFingerprintDataService",function(RubedoFingerprintDataService){
        var serviceInstance = {};
        serviceInstance.angReferrer=false;
        serviceInstance.lastPageLoad=Date.now() / 1000 | 0;
        serviceInstance.resetPageLoad=function(){
            serviceInstance.lastPageLoad=Date.now() / 1000 | 0;
        };
        serviceInstance.TIMEONPAGE=function(){
            var newTS=Date.now() / 1000 | 0;
            return (newTS-serviceInstance.lastPageLoad);
        };
        serviceInstance.setAngReferrer=function(newReferrer){
            serviceInstance.angReferrer=newReferrer;
        };
        serviceInstance.REFERRER=function(){
            if (serviceInstance.angReferrer) {
                return(serviceInstance.angReferrer);
            } else if (document.referrer&&document.referrer!=""){
                return(document.referrer);
            } else {
                return false
            }

        };

        return serviceInstance;
    }]);

    app.factory('UXSessionService',['ipCookie',function(ipCookie){
        var serviceInstance = {};
        serviceInstance.DURATION=function(){
            var existingTS=ipCookie("sessionStartTS");
            if (!existingTS){
                return false;
            }
            var newTS=Date.now() / 1000 | 0;
            return (newTS-existingTS);
        };
        return serviceInstance;
    }]);

    app.factory('UXCore',['RubedoFingerprintDataService',function(RubedoFingerprintDataService){
        var serviceInstance = {};
        var SET=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"set",var2);
        };
        var INC=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"inc",var2);
        };
        var DEC=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"dec",var2);
        };
        serviceInstance.evaluateCondition=function(condition){
            return(eval(condition));
        };
        serviceInstance.executeAction=function(action){
            var replaceArray={
                'PAGE.NBVIEWS':"'pages."+current.page.id+".nbViews'"
            };
            angular.forEach(replaceArray, function(value, key) {
                var regex = new RegExp(key, "g");
                action = action.replace(regex, value);
            });
            eval(action);
        };
        serviceInstance.parse=function(instruction){
            serviceInstance.fingerprintData=RubedoFingerprintDataService.getFingerprintData();
            if(instruction.indexOf("IF")>-1&&instruction.indexOf("THEN")>-1){
                var splittedInstruction=instruction.replace("IF","").split("THEN");
                if(serviceInstance.evaluateCondition(splittedInstruction[0])){
                    serviceInstance.executeAction(splittedInstruction[1]);
                }
            }
        };
        return serviceInstance;
    }]);

    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService','RubedoAuthService','RubedoFieldTemplateResolver','snapRemote','RubedoPageComponents','RubedoTranslationsService','$scope','RubedoClickStreamService','$rootScope','UXUserService','UXPageService','UXSessionService',
        function(RubedoBlockTemplateResolver,RubedoImageUrlService,RubedoAuthService,RubedoFieldTemplateResolver,snapRemote, RubedoPageComponents, RubedoTranslationsService,$scope,RubedoClickStreamService,$rootScope,UXUserService,UXPageService,UXSessionService){
        var me=this;
        //break nav on non-page routes
        $scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
            if (newLoc.indexOf("file?file-id") > -1||newLoc.indexOf("dam?media-id") > -1){
                event.preventDefault();
                window.location.href=newLoc;
            } else if (newLoc.indexOf("#") > -1){
                event.preventDefault();
                var target=angular.element("[name='"+newLoc.split("#")[1]+"']");
                if (target&&target.length>0){
                    angular.element("body,html").animate({scrollTop: target.offset().top}, "slow");
                } else {
                    window.location.href=newLoc.slice(0,newLoc.indexOf("#"));
                }
            } else {
                if (window._gaq) {
                    window._gaq.push(['_trackPageview', newLoc]);
                }
                if (currentLoc&&currentLoc!=""&&currentLoc!=newLoc){
                    UXPageService.setAngReferrer(currentLoc);
                }
                UXPageService.resetPageLoad();

            }
        });
        //set context and page-wide services
        me.adminBtnIconClass="glyphicon glyphicon-arrow-right";
        me.snapOpts={
          disable:'right',
          tapToClose:false
        };


        snapRemote.getSnapper().then(function(snapper) {
            snapper.disable();
            snapper.on('open', function() {
                me.adminBtnIconClass="glyphicon glyphicon-arrow-left";
                angular.element(".rubedo-admin-drawer").show();
            });

            snapper.on('close', function() {
                me.adminBtnIconClass="glyphicon glyphicon-arrow-right";
                angular.element(".rubedo-admin-drawer").hide();
            });
        });
        me.translations={ };
        RubedoTranslationsService.getTranslations().then(
            function(response){
                if (response.data.success){
                    me.translations=response.data.translations;
                }
            }
        );
        me.translate=function(transKey,fallbackString,toReplaceArray,toReplaceWithArray){
            var stringToReturn="";
            if (me.translations[transKey]){
                stringToReturn=me.translations[transKey];
            } else {
                stringToReturn=fallbackString;
            }
            if (toReplaceArray&&toReplaceWithArray&&angular.isArray(toReplaceArray)&&angular.isArray(toReplaceWithArray)){
                angular.forEach(toReplaceArray, function(value, key) {
                    stringToReturn=stringToReturn.replace(value,toReplaceWithArray[key]);
                });
            }
            return(stringToReturn);
        };
        me.themePath=themePath;
        me.adminInterfaceViewPath=themePath+"/templates/admin/menuViews/home.html";
        me.changeAdminInterfaceView=function(viewName){
            me.adminInterfaceViewPath=themePath+"/templates/admin/menuViews/"+viewName+".html";
        };
        me.logOut=function(){
            RubedoAuthService.clearPersistedTokens();
            window.location.reload();
        };
        me.current=current;
        me.blockTemplateResolver=RubedoBlockTemplateResolver;
        me.fieldTemplateResolver=RubedoFieldTemplateResolver;
        me.componentsService=RubedoPageComponents;
        me.imageUrl=RubedoImageUrlService;
        me.registeredEditCtrls=[ ];
        me.fieldEditMode=false;
        me.refreshAuth=function(forceRefresh){
            var curentTokens=RubedoAuthService.getPersistedTokens();
            if (curentTokens.refreshToken&&(!curentTokens.accessToken||forceRefresh)){
                RubedoAuthService.refreshToken().then(
                    function(response){
                        me.current.user=response.data.currentUser;
                    }
                );
            } else if (curentTokens.refreshToken&&curentTokens.accessToken){
                RubedoAuthService.getAuthStatus().then(
                    function(response){
                        me.current.user=response.data.currentUser;
                    },function(response){
                        me.refreshAuth(true);
                    }
                );
            }
        };

        me.refreshAuth(false);
        setInterval(function () {me.refreshAuth(false);}, 60000);
        me.addNotification=function(type,title,text,timeout){
            angular.element.toaster({ priority : type, title : title, message : text, settings:{timeout:timeout}});
        };
        me.toggleAdminPanel=function(){
            snapRemote.toggle("left");
        };
        me.enterEditMode=function(){
            me.fieldEditMode=true;
            me.toggleAdminPanel();
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
            me.setPageTitle=function(newTitle){
                me.current.page.title=newTitle;
            };
            me.setPageDescription=function(newDescription){
                me.current.page.description=newDescription;
            };

            $scope.$on("ClickStreamEvent",function(event,args){
                if (typeof(Fingerprint2)!="undefined"&&args&&args.csEvent){
                    RubedoClickStreamService.logEvent(args.csEvent,args.csEventArgs);
                }
            });

            me.fireCSEvent=function(event,args){
                $rootScope.$broadcast("ClickStreamEvent",{csEvent:event,csEventArgs:args});
            };

            USER=UXUserService;
            $scope.USER=USER;

            PAGE=UXPageService;
            $scope.PAGE=PAGE;

            SESSION=UXSessionService;
            $scope.SESSION=SESSION;
    }]);

    app.controller("PageBodyController",['RubedoPagesService', 'RubedoModuleConfigService','$scope','RubedoBlockDependencyResolver','$rootScope','UXCore',function(RubedoPagesService, RubedoModuleConfigService,$scope,RubedoBlockDependencyResolver,$rootScope,UXCore){
        var me=this;
        if ($scope.rubedo.fieldEditMode){
            $scope.rubedo.revertChanges();
        }
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            if (response.data.success){
                var newPage=angular.copy(response.data.page);
                newPage.pageProperties=angular.copy(response.data.mask.pageProperties);
                newPage.mainColumnId=angular.copy(response.data.mask.mainColumnId);
                if(newPage.keywords){
                    angular.forEach(newPage.keywords, function(keyword){
                       newPage.metaKeywords = newPage.metaKeywords?newPage.metaKeywords+','+keyword:keyword;
                    });
                } else if (response.data.site.keywords){
                    angular.forEach(response.data.site.keywords, function(keyword){
                        newPage.metaKeywords = newPage.metaKeywords?newPage.metaKeywords+','+keyword:keyword;
                    });
                }
                if (!newPage.description&&response.data.site.description){
                    newPage.description=response.data.site.description;
                }
                if (!newPage.title&&response.data.site.title){
                    newPage.title=response.data.site.title;
                }
                if(newPage.noIndex || newPage.noFollow){
                    newPage.metaRobots = (newPage.noIndex?'noindex':'') + (newPage.noFollow?',nofollow':'');
                }
                newPage.metaAuthor = response.data.site.author?response.data.site.author:'Rubedo by Webtales';
                current.page=newPage;
                current.site=angular.copy(response.data.site);
                current.breadcrumb=angular.copy(response.data.breadcrumb);
                if (response.data.site.locStrategy == 'fallback'){
                    RubedoModuleConfigService.addFallbackLang(response.data.site.defaultLanguage);
                }

                var usedblockTypes=angular.copy(response.data.blockTypes);
                var dependencies=RubedoBlockDependencyResolver.getDependencies(usedblockTypes);
                if (dependencies.length>0){
                    $script(dependencies, function() {
                        if (newPage.pageProperties.customTemplate){
                            me.currentBodyTemplate=themePath+'/templates/customPageBody.html';
                        } else {
                            me.currentBodyTemplate=themePath+'/templates/defaultPageBody.html';
                        }
                        $scope.$apply();
                    });
                } else {
                    if (newPage.pageProperties.customTemplate){
                        me.currentBodyTemplate=themePath+'/templates/customPageBody.html';
                    } else {
                        me.currentBodyTemplate=themePath+'/templates/defaultPageBody.html';
                    }
                }
                //UX
                //UXCore.parse("IF USER.FINGERPRINT() THEN INC(PAGE.NBVIEWS)");
                //Page load
                $rootScope.$broadcast("ClickStreamEvent",{csEvent:"pageView",csEventArgs:{
                    pageId:newPage.id,
                    siteId:response.data.site.id,
                    pageTaxo:newPage.taxonomy
                }});

            }
        },function(response){
            if (response.status==404){
                current.page={
                    text:"404",
                    blocks:[]
                };
                me.currentBodyTemplate=themePath+'/templates/404.html';
            }
            // @TODO handle other error codes or use generic error template
        });

    }]);

    app.directive("rubedoNotification",function(){
        return {
            restrict:"E",
            templateUrl:themePath+"/templates/notification.html"
        };
    });

})();
