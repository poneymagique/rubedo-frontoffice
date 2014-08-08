/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess']);

    var blocksConfig = {
        image:"/components/webtales/rubedo-frontoffice/templates/blocks/imageBlock.html",
        blockNotFound:"/components/webtales/rubedo-frontoffice/templates/blocks/blockNotFound.html",
        navigation:"/components/webtales/rubedo-frontoffice/templates/blocks/navigation.html"
    };

    module.factory('RubedoBlockTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplateByBType=function(bType){
            if (blocksConfig[bType]){
                return (blocksConfig[bType]);
            } else {
                return (blocksConfig.blockNotFound);
            }
        };
        return serviceInstance;
    });

    //generic block directive
    module.directive("rubedoBlock",function(){
        return {
            restrict:"E",
            templateUrl:"/components/webtales/rubedo-frontoffice/templates/rubedoBlock.html"
        };
    });

})();