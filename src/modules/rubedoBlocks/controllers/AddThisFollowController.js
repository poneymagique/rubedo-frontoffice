angular.module("rubedoBlocks").lazy.controller('AddThisFollowController',['$scope',function($scope){
    var me = this;
    var config = $scope.blockConfig;
    me.networks = [];
    me.divClass = 'addthis_toolbox';
    if(config.small == 1){
        me.divClass += ' addthis_32x32_style';
    }
    if(config.disposition == 'Horizontal'){
        me.divClass += ' addthis_default_style';
    } else {
        me.divClass += ' addthis_vertical_style';
    }
    me.networkClass = function(network){
        return 'addthis_button_'+network.name+'_follow';
    };
    angular.forEach(config, function(value,key){
        if(key != 'disposition' && key != 'small'){
            var network = {
                name: key,
                id: value
            };
            me.networks.push(network);
        }
    });
    addthis.toolbox('.addthis_toolbox');
}]);