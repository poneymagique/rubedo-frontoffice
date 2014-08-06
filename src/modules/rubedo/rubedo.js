(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','ngRoute']);
    var currentPage={
        title:"Rubedo",
        blocks:[]
    };


    app.config(function($routeProvider,$locationProvider) {
        $routeProvider.when('/:lang/:routeline*', {
                template: '<rubedo-page-body></rubedo-page-body>'
            });
        $locationProvider.html5Mode(true);
    });

    app.controller("PageController",function($scope){
        $scope.$on("$locationChangeSuccess",function(event){event.preventDefault();});
        this.currentPage=currentPage;
    });

    app.directive("rubedoPageBody",['RubedoPagesService',function(RubedoPagesService){
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            currentPage.title=response.page.text;
            currentPage.blocks=response.page.blocks;
        });
        return{
            restrict:"E",
            template:'<div class="container"><h3>Resolved to default page template</h3><p>Current page : </p><pre>{{pageCtrl.currentPage}}</pre></div>'
        };

    }]);

})();