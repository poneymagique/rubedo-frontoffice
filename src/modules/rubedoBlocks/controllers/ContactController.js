angular.module("rubedoBlocks").lazy.controller('ContactController',['$scope','RubedoContactService','RubedoMailingListService',function($scope,RubedoContactService,RubedoMailingListService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
    if (config.mailingListId){
        me.showForm=true;
        if (angular.isArray(config.mailingListId)){
            me.mailingListId=config.mailingListId[0];
            if (config.mailingListId.length>1){
                me.mailingLists=[];
                RubedoMailingListService.getAllMailingList().then(function(response){
                    if(response.data.success){
                        angular.forEach(config.mailingListId, function(mailing){
                            var newMailing = {};
                            angular.forEach(response.data.mailinglists, function(mailingInfo){
                                if(mailingInfo.id == mailing){
                                    newMailing.id = mailing;
                                    newMailing.name = mailingInfo.name;
                                    me.mailingLists.push(newMailing);
                                }
                            });
                        });
                    }
                });

            }
        } else {
            me.mailingListId=config.mailingListId;
        }
    }

    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            mailingListId:me.mailingListId,
            from:contactSnap.email,
            subject:contactSnap.subject
        };
        delete (contactSnap.email);
        delete (contactSnap.subject);
        payload.fields=contactSnap;
        RubedoContactService.sendContact(payload).then(
            function(response){
                if (response.data.success){
                    me.contactData={ };
                    me.showConfirmMessage=true;
                    $scope.rubedo.sendGaEvent('/form/', 'contact');
                } else {
                    me.contactError=response.data.message;
                }
            },
            function(response){
                me.contactError=response.data.message;
            }
        );
    };
}]);
