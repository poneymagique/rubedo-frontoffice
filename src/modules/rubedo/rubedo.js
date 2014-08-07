(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','ngRoute']);
    var currentPage={
        blocks:[]
    };


    app.config(function($routeProvider,$locationProvider) {
        $routeProvider.when('/:lang/:routeline*', {
                template: '<ng-include src="pageBodyCtrl.currentBodyTemplate"></ng-include>',
                controller:'PageBodyController',
                controllerAs: "pageBodyCtrl"
            });
        $locationProvider.html5Mode(true);

    });

    app.controller("PageController",function(){
        this.currentPage=currentPage;

    });

    app.controller("PageBodyController",['RubedoPagesService',function(RubedoPagesService){
        var me=this;
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            currentPage.title=response.page.text;
            currentPage.blocks=response.page.blocks;
            me.currentBodyTemplate='/components/webtales/rubedo-frontoffice/templates/defaultPageBody.html';
        });

    }]);


})();