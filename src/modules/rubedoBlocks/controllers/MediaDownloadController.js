angular.module("rubedoBlocks").lazy.controller('MediaDownloadController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    var options = {
        mediaId: config.documentId,
        contentId: config.introduction
    };
    RubedoMediaService.getMediaById(options).then(function(response){
        if(response.data.success){
            me.media =  response.data.media;
            me.intro = response.data.intro.content;
        }
    });
}]);