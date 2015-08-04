angular.module("rubedoBlocks").lazy.directive("paginator",["$timeout",function($timeout){
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    return {
        restrict: 'E',
        templateUrl: themePath+"/templates/paginator.html",
        scope:{
            start: '=',
            limit: '=',
            count: '=',
            changePageAction: '&'
        },

        controller: function($scope, $timeout){
            var me = this;
            me.showPager = false;
            $scope.$watch('count',function(){
                me.actualPage = $scope.start/$scope.limit+1;
                me.nbPages = Math.ceil($scope.count/$scope.limit);
                me.showPager = me.nbPages > 1;
            });
            $scope.$watch('start',function(){
                me.actualPage = $scope.start/$scope.limit+1;
                me.nbPages = Math.ceil($scope.count/$scope.limit);
                me.showPager = me.nbPages > 1;
            });
            me.showActive = function(value){
                return value == me.actualPage;
            };
            me.getPagesNumber = function (index){
                var res;
                if (me.actualPage < 6 || (me.nbPages <= 9? me.nbPages : 9) < 9){
                    res = index+1;
                } else if (me.actualPage + 4 >= me.nbPages) {
                    res = me.nbPages - (8 - index);
                } else {
                    res = me.actualPage + (index - 4);
                }
                return res;
            };
            me.getIteration = function(num){
                return new Array(num <= 9? num : 9);
            };
            me.changePage = function(value){
                if (me.actualPage != value + 1){
                    if (value == 'prev'){
                        me.actualPage -= 1;
                        value = me.actualPage -1;
                    } else if (value == 'next'){
                        me.actualPage += 1;
                        value = me.actualPage -1;
                    } else {
                        me.actualPage = value + 1;
                    }
                    $scope.start = (value * $scope.limit);

                    $timeout($scope.changePageAction);
                }
            };
        },
        controllerAs: 'paginatorCtrl'
    }
}]);