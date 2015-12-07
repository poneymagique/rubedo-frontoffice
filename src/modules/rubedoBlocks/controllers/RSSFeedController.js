angular.module("rubedoBlocks").lazy.controller("RSSFeedController",['$scope','$http',function($scope,$http){
    var me = this;
    var config = $scope.blockConfig;
    var items=config.items&&config.items!="" ? config.items : 6;
    if(config.feedUrl&&config.feedUrl!=""){
        $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+items+'&callback=JSON_CALLBACK&q=' + encodeURIComponent(config.feedUrl)).then(
            function(response){
                me.feed=response.data.responseData.feed;
                angular.forEach(me.feed.entries,function(entry){
                    if (entry.publishedDate){
                        entry.publishedDate=new Date(entry.publishedDate);
                    }
                });
            }
        );
    }
}]);