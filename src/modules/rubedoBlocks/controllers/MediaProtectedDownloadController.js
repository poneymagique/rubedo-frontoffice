angular.module("rubedoBlocks").lazy.controller('MediaProtectedDownloadController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    var options = {
        mediaId: config.documentId,
        introContentId: config.introduction
    };
    RubedoMediaService.getProtectedMediaById(options).then(function(response){
        if(response.data.success){
            me.media = response.data.media;
            me.introduction = response.data.introduction?response.data.introduction : undefined;
        }
    });

    me.postMail = function(){
        if(config.mailingListId && config.documentId){
            options.siteId = $scope.rubedo.current.site.id;
            options.mailingListId = config.mailingListId;
            options.email = me.email;
            RubedoMediaService.postProtectedMediaById(options).then(function(response){
                if(response.data.success){
                    $scope.notification = {
                        type: 'success',
                        text: $scope.rubedo.translate("Blocks.ProtectedRessource.MailSent")
                    };
                } else {
                    $scope.notification = {
                        type: 'error',
                        text: response.data.message&&response.data.message!="" ? response.data.message : $scope.rubedo.translate("Exception104", null, ["%1$s"], [me.email])
                    };
                }
                me.email = '';
            },function(response){
                $scope.notification = {
                    type: 'error',
                    text: response.data.message&&response.data.message!="" ? response.data.message : $scope.rubedo.translate("Exception104", null, ["%1$s"], [me.email])
                };
            });
        }
    };
}]);