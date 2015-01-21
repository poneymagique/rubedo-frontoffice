angular.module("rubedoBlocks").lazy.controller("CheckoutController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService){
    var me = this;
    var config = $scope.blockConfig;
    if (config.signupContentId){
        config.contentId=config.signupContentId;
    }
    config.displayMode="form";
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
                        me.setCurrentStage(1);
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
    me.currentStage=1;
    me.maxStages=6;
    me.getProgress=function(){
        return parseInt(me.currentStage/me.maxStages*100);
    };
    me.setCurrentStage=function(newStage){
        me.currentStage=newStage;
        //angular.element("#checkoutStage"+newStage).collapse({parent:"#checkoutAccordion"});
    };

}]);