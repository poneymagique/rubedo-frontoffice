angular.module("rubedoBlocks").lazy.controller("CheckoutController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService){
    var me = this;
    var config = $scope.blockConfig;
    if (config.tCPage){
        RubedoPagesService.getPageById(config.tCPage).then(function(response){
            if (response.data.success){
                me.tCPageUrl=response.data.url;
            }
        });
    }
    me.blockId=($scope.block.id);
    me.cartIsEmpty=true;
    me.detailedCart={};
    me.getCart=function(){
        RubedoShoppingCartService.getCart({includeDetail:true}).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart&&response.data.shoppingCart.detailedCart.totalItems>0){
                        me.detailedCart=response.data.shoppingCart.detailedCart;
                        me.cartIsEmpty=false;
                    } else  {
                        me.cartIsEmpty=true;
                        me.detailedCart={};
                    }
                }
            }
        );
    };
    me.getCart();
    $scope.$on("shoppingCartUpdated",function(event,args){
        if (args&&args.emitter!=me.blockId){
            me.getCart();
        }
    });

}]);