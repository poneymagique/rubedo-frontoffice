angular.module("rubedoBlocks").lazy.controller('OrderDetailController',['$scope','RubedoOrdersService','$location','RubedoMediaService',function($scope,RubedoOrdersService,$location,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    var orderId=$location.search().order;
    if (orderId){
        RubedoOrdersService.getOrderDetail(orderId).then(
            function(response){
                if (response.data.success){
                    me.order=response.data.order;
                    if (me.order.billDocument){
                        RubedoMediaService.getMediaById(me.order.billDocument,{}).then(
                            function(mediaResponse){
                                if (mediaResponse.data.success){
                                    me.billDocumentUrl=mediaResponse.data.media.url;
                                }
                            }
                        );
                    }
                }
            }
        );
    }

}]);