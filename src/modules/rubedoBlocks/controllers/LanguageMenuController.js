angular.module("rubedoBlocks").lazy.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', '$route', '$location',
    function ($scope, RubedoPagesService,RubedoModuleConfigService, $route, $location) {
        var me = this;
        var config = $scope.blockConfig;
        me.languages = $scope.rubedo.current.site.languages;
        me.currentLang = $scope.rubedo.current.site.languages[$route.current.params.lang];
        me.mode = config.displayAs == "select";
        me.showFlags = config.showFlags;
        me.isDisabled =  function(lang){
            return me.currentLang.lang == lang;
        };
        if(!config.showCurrentLanguage){
            delete me.languages[$route.current.params.lang];
        }
        me.getFlagUrl = function(flagCode){
            return '/assets/flags/16/'+flagCode+'.png';
        };
        me.changeLang = function (lang) {
            if(lang != me.currentLang.lang){
                RubedoModuleConfigService.changeLang(lang);
                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                    if (response.data.success){
                        $location.path(response.data.url);
                    }
                });
            }
        };
    }]);