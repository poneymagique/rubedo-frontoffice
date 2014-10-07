angular.module("rubedoBlocks").lazy.controller("VideoController",["$scope","RubedoMediaService","RubedoImageUrlService",function($scope,RubedoMediaService,RubedoImageUrlService){
    var me=this;
    var config = $scope.blockConfig;
    var mediaId=config.videoFile;
    me.displayMedia=function(){
        if (me.media&&me.media.originalFileId){
            me.jwSettings={
                width:"100%",
                controls:config.videoControls ? config.videoControls : false,
                autostart:config.videoAutoPlay,
                repeat:config.videoLoop,
                file:me.media.url
            };
            if (config.videoWidth){
                me.jwSettings.width=config.videoWidth;
            }
            if (config.videoHeight){
                me.jwSettings.height=config.videoHeight;
            }
            if (config.videoPoster){
                me.jwSettings.image=RubedoImageUrlService.getUrlByMediaId(config.videoPoster,{});
            }
            setTimeout(function(){jwplayer("video"+me.media.originalFileId).setup(me.jwSettings);}, 200);
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