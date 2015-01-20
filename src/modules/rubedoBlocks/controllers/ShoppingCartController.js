angular.module("rubedoBlocks").lazy.controller("ShoppingCartController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService){
    var me = this;
    var config = $scope.blockConfig;
    console.log(config);
    me.blockId=($scope.block.id);
    me.cartIsEmpty=true;
    me.detailedCart={};
    me.displayCart=function(){
        RubedoShoppingCartService.getCart({includeDetail:true}).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart){
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
    me.displayCart();
    $scope.$on("shoppingCartUpdated",function(event,args){
        if (args&&args.emitter!=me.blockId){
            me.displayCart();
        }
    });

}]);