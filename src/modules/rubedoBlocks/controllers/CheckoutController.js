angular.module("rubedoBlocks").lazy.controller("CheckoutController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService","RubedoUserTypesService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService,RubedoUserTypesService){
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
    me.cartIsEmpty=false;
    me.detailedCart={};
    me.getCart=function(){
        RubedoShoppingCartService.getCart({includeDetail:true}).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart&&response.data.shoppingCart.detailedCart.totalItems>0){
                        me.detailedCart=response.data.shoppingCart.detailedCart;
                        me.cartIsEmpty=false;
                        me.initializeCheckout();
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
        if (newStage!=me.currentStage){
            angular.element("#checkoutStage"+me.currentStage).collapse("hide");
            angular.element("#checkoutStage"+newStage).collapse("show");
            me.currentStage=newStage;
        }
    };
    me.parseUserType=function(userType){
        me.userType=userType;
        $scope.fieldIdPrefix="signUp"+"_"+me.userType.type;
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"confirmPassword",
                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.confirmPassword"),
                allowBlank:false,
                vtype:"password"
            }
        });
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"password",
                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.password"),
                allowBlank:false,
                vtype:"password"
            }
        });
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"email",
                fieldLabel:$scope.rubedo.translate("Label.Email"),
                allowBlank:false,
                vtype:"email"
            }
        });
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"name",
                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.name"),
                allowBlank:false
            }
        });
        me.inputFields=me.userType.fields;
    };
    me.initializeCheckout=function(){
        $scope.fieldIdPrefix="checkout";
        $scope.fieldEntity={ };
        $scope.fieldInputMode=true;
        me.stage2Error=null;
        if (!$scope.rubedo.current.user){
            me.setCurrentStage(1);
            if (config.userType){
                RubedoUserTypesService.getUserTypeById(config.userType).then(
                    function(response){
                        if (response.data.success){
                            me.parseUserType(response.data.userType);
                        }
                    }
                );
            }
        }
    }

}]);