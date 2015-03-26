angular.module("rubedoBlocks").lazy.controller("ContentContributionController",["$scope","RubedoContentsService","RubedoContentTypesService",function($scope,RubedoContentsService,RubedoContentTypesService){
    var me=this;
    var config = $scope.blockConfig;
    $scope.fieldInputMode=true;
    $scope.fieldEntity={};
    me.loadContentType=function(ctId){
        RubedoContentTypesService.findById(ctId).then(
            function(response){
                if(response.data.success){
                    console.log(response);
                    me.contentType=response.data.contentType;
                    $scope.fieldIdPrefix="contentContribution"+me.contentType.type;
                    me.contentType.fields.unshift({
                        cType:"textarea",
                        config:{
                            name:"summary",
                            fieldLabel:"Summary",
                            allowBlank:false
                        }
                    });
                    me.contentType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"text",
                            fieldLabel:"Title",
                            allowBlank:false
                        }
                    });
                    $scope.fields=me.contentType.fields;
                }
            }
        );
    };
    if (config.contentType&&config.contentType!=""){
        me.loadContentType(config.contentType);
    }
}]);