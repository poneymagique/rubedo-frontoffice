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
                        text: $scope.rubedo.translate("Blocks.SignUp.unsubscribeOk.unsubscribeSuccess")
                    };
                    $scope.rubedo.sendGaEvent('/form/', 'unsubscribe newsletter');
                } else {
                    $scope.notification = {
                        type: 'error',
                        text: $scope.rubedo.translate("Blocks.UserProfile.Error.EmailNotValid")
                    };
                }
            },function(){
                $scope.notification = {
                    type: 'error',
                    text: $scope.rubedo.translate("Blocks.SignUp.emailConfirmError.userUpdateFailed")
                };
            });
        } else {
            $scope.notification = {
                type: 'error',
                text: $scope.rubedo.translate("Blocks.UserProfile.Error.EmailNotValid")
            };
        }
    }
}]);
