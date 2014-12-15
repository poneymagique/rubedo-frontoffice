angular.module("rubedoBlocks").lazy.controller("SiteMapController",['$scope','$location','RubedoMenuService',function($scope,$location,RubedoMenuService){
    var me=this;
    var config=$scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var hiddenPages = {};

    var calculatePagesDiplay = function(pages, level) {
        angular.forEach(pages, function(value) {
            if(value.pages) {
                if(level < config.displayLevel) {
                    hiddenPages[value.id] = false;
                } else {
                    hiddenPages[value.id] = true;
                }

                calculatePagesDiplay(value.pages, level+1);
            }
        });
    };

    if(config.rootPage){
        $scope.menu=[];
        me.currentRouteline=$location.path();

        // get all pages for the menu
        RubedoMenuService.getMenu(config.rootPage, 5).then(function(response){
            if (response.data.success){
                $scope.menu=response.data.menu;

                if($scope.menu.pages) {
                    // hide home page children's if the display level is 0
                    if(config.displayLevel == 0) {
                        hiddenPages[$scope.menu.id] = true;
                    } else {
                        hiddenPages[$scope.menu.id] = false;
                    }

                    // calculate for all pages with children if they have to display them
                    calculatePagesDiplay($scope.menu.pages, 1);
                }
            } else {
                $scope.menu=[];
            }
        });

        // allow to change the "show" status of a page
        me.setPageDisplay = function(pageId){
            if(hiddenPages[pageId] == true) {
                hiddenPages[pageId] = false;
            } else {
                hiddenPages[pageId] = true;
            }
        };

        // allow to get the "show" status of a page
        me.getPageDisplay = function(pageId){
            return  hiddenPages[pageId];
        }
    }
}]);