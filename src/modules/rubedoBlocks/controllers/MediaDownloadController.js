angular.module("rubedoBlocks").lazy.controller('MediaDownloadController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    RubedoMediaService.getMediaById(config.documentId).then(function(response){
        if(response.data.success){
            me.media =  response.data.media;
        }
    });
}]);