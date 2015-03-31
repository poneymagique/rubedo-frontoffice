angular.module("rubedoBlocks").lazy.controller("ContentContributionController",["$scope","RubedoContentsService","RubedoContentTypesService","$location",function($scope,RubedoContentsService,RubedoContentTypesService,$location){
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
    if($location.search()["content-edit"]){
        RubedoContentsService.getContentById($location.search()["content-edit"]).then(
            function(ecResponse){
                if (ecResponse.data.success){
                    me.existingContent=ecResponse.data.content;
                    var initialValues=angular.copy(me.existingContent.fields);
                    initialValues.taxonomy=angular.copy(me.existingContent.taxonomy);
                    $scope.fieldEntity=angular.copy(initialValues);
                    me.updateMode=true;
                    me.loadContentType(me.existingContent.type.id);
                }
            }
        );
    } else if (config.contentType&&config.contentType!=""){
        me.loadContentType(config.contentType);
    }
    me.submitNewContent=function(){
        if(me.contentType&&me.submitStatus){
            me.createError=null;
            var formData=angular.copy($scope.fieldEntity);
            if (me.updateMode){
                var payload=angular.copy(me.existingContent);
                delete (payload.type);
                payload.status=me.submitStatus;
                payload.taxonomy=formData.taxonomy;
                delete (formData.taxonomy);
                payload.fields=formData;
                RubedoContentsService.updateContent(payload).then(
                    function(response){
                        if (response.data.success){
                            me.existingContent.version = response.data.version;
                            $scope.rubedo.addNotification("success","Success","Content updated.");
                        } else {
                            $scope.rubedo.addNotification("danger","Error","Content update error.");
                        }

                    },
                    function(response){
                        $scope.rubedo.addNotification("danger","Error","Content update error.");
                    }
                );

            } else {
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
        }
    };
}]);