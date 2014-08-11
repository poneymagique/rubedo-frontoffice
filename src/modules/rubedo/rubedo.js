(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','rubedoBlocks','ngRoute']);
    var currentPage={
        blocks:[]
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

    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService',function(RubedoBlockTemplateResolver,RubedoImageUrlService){
        this.currentPage=currentPage;
        this.blockTemplateResolver=RubedoBlockTemplateResolver;
        this.imageUrl=RubedoImageUrlService;
    }]);

    app.controller("PageBodyController",['RubedoPagesService',function(RubedoPagesService){
        var me=this;
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            if (response.success){
                currentPage.title=response.page.text;
                currentPage.blocks=response.page.blocks;
                me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/defaultPageBody.html';
            } else {
                currentPage.title="404";
                currentPage.blocks=[];
                me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/404.html';
            }
        });

    }]);


})();