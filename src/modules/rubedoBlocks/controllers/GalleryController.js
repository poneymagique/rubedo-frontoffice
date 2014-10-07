angular.module("rubedoBlocks").lazy.controller('GalleryController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    me.start = 0;
    me.limit = config.pageSize?config.pageSize:8;
    me.changePageAction = function(){
        options.start = me.start;
        me.getMedia(options);
    };
    var options = {
        query: config.query,
        start: me.start,
        limit: me.limit,
        pageWorkspace: $scope.rubedo.current.page.workspace,
        imageThumbnailHeight: config.imageThumbnailHeight?config.imageThumbnailHeight:100,
        imageThumbnailWidth: config.imageThumbnailWidth?config.imageThumbnailWidth:100
    };
    me.width = options.imageThumbnailWidth;
    me.getMedia = function(options){
        RubedoMediaService.getMediaByQuery(options).then(function(response){
            if(response.data.success){
                me.count = response.data.count;
                me.images = response.data.media.data;
            }
        });
    };
    me.loadModal = function(index){
        angular.element('#rubedoGalleryDetailModal').appendTo('body').modal('show');
        me.currentIndex = index;
        me.currentImage = me.images[me.currentIndex];
    };
    me.changeImage = function(side){
        if(side == 'left' && me.currentIndex > 0){
            me.currentIndex -= 1;
        } else if(side == 'right' && me.currentIndex < me.images.length - 1) {
            me.currentIndex += 1;
        }
        me.currentImage = me.images[me.currentIndex];
    };
    me.getMedia(options);
}]);