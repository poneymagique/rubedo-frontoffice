angular.module("rubedoBlocks").lazy.controller("ContentContributionController",["$scope","RubedoContentsService","RubedoContentTypesService",function($scope,RubedoContentsService,RubedoContentTypesService){
    var me=this;
    var config = $scope.blockConfig;
    $scope.fieldInputMode=true;
    $scope.fieldEntity={
        taxonomy:{}
    };
    var options={
        includeTaxonomy:true
    };
    me.submitStatus=null;
    me.loadContentType=function(ctId){
        RubedoContentTypesService.findById(ctId,options).then(
            function(response){
                if(response.data.success){
                    me.contentType=response.data.contentType;
                    $scope.fieldIdPrefix="contentContribution"+me.contentType.type;
                    me.contentType.fields.unshift({
                        cType:"textarea",
                        config:{
                            name:"summary",
                            fieldLabel:"Summary",
                            allowBlank:true
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
                    $scope.vocabularies=me.contentType.completeVocabularies;
                }
            }
        );
    };
    if (config.contentType&&config.contentType!=""){
        me.loadContentType(config.contentType);
    }
    me.submitNewContent=function(){
        if(me.contentType&&me.submitStatus){
            me.createError=null;
            var formData=angular.copy($scope.fieldEntity);
            var payLoad={
                status:me.submitStatus,
                typeId:me.contentType.id,
                taxonomy:formData.taxonomy
            };
            delete (formData.taxonomy);
            payLoad.fields=formData;
            RubedoContentsService.createNewContent(payLoad).then(
                function(createResponse){
                    if (createResponse.data.success){
                        $scope.rubedo.addNotification("success","Success","Content created.");
                        $scope.fieldEntity={
                            taxonomy:{}
                        };
                    }else{
                        $scope.rubedo.addNotification("danger","Error","Content creation error.");
                        me.createError={
                            type:"error",
                            text:createResponse.data.message
                        };
                    }
                },
                function(createResponse){
                    $scope.rubedo.addNotification("danger","Error","Content creation error.");
                    me.createError={
                        type:"error",
                        text:createResponse.data.message
                    };
                }
            );
        }
    };
}]);