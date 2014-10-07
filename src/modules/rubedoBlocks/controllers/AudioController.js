angular.module("rubedoBlocks").lazy.controller("AudioController",["$scope","RubedoMediaService",function($scope,RubedoMediaService){
    var me=this;
    var config = $scope.blockConfig;
    var mediaId=config.audioFile;
    me.displayMedia=function(){
        if (me.media&&me.media.originalFileId){
            me.jwSettings={
                primary:"flash",
                height:40,
                width:"100%",
                controls:config.audioControls ? config.audioControls : false,
                autostart:config.audioPlay,
                repeat:config.audioLoop,
                file:me.media.url
            };
            setTimeout(function(){jwplayer("audio"+me.media.originalFileId).setup(me.jwSettings);}, 200);
        }
    };
    if (mediaId){
        RubedoMediaService.getMediaById(mediaId).then(
            function(response){
                if (response.data.success){
                    me.media=response.data.media;
                    me.displayMedia();
                }
            }
        );
    }
}]);