angular.module("rubedoBlocks").lazy.controller('MailingListUnsuscribeController',['$scope','RubedoMailingListService',function($scope,RubedoMailingListService){
    var me = this;
    me.onSubmit = function(){
        if(me.email){
            var options = {
                mailingLists:'all',
                email: me.email
            };
            RubedoMailingListService.unsubscribeToMailingLists(options).then(function(response){
                if(response.data.success){
                    me.email = '';
                    $scope.notification = {
                        type: 'success',
                        text: 'You have successfully unsubscribed to all newsletters'
                    };
                } else {
                    $scope.notification = {
                        type: 'error',
                        text: 'The unsubscribe process failed'
                    };
                }
            },function(){
                $scope.notification = {
                    type: 'error',
                    text: 'The unsubscribe process failed'
                };
            });
        } else {
            $scope.notification = {
                type: 'error',
                text: 'Email is required'
            };
        }
    }
}]);