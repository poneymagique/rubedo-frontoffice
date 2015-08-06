angular.module("rubedoBlocks").lazy.controller('TwitterController',['$scope',function($scope){
    var me = this;
    var config = $scope.blockConfig;
    angular.forEach(config, function(value, key){
        me[key] = value;
    });
    me.chrome = '';
    me.width = (config.width && config.width!= "") ? config.width : 0;
    me.tweetMode = function(mode){
        if(mode == config.mode) {
            return config.account;
        } else {
            return '';
        }
    };
    if(me.options){
        angular.forEach(me.options, function(option, key){
            var res = '';
            switch (option){
                case 'noHeader':
                    res = 'noheader';
                    break;
                case 'noFooter':
                    res = 'noffoter';
                    break;
                case 'noBorder':
                    res = 'noborders';
                    break;
                case 'noScrollBar':
                    res = 'noscrollbar';
                    break;
                case 'transparentBackground':
                    res = 'transparent';
                    break;
            }
            me.chrome += res+' ';
        });
    }
    me.loadTwitter = function(){
        window.twttr = (function (d, s, id) {
            var t, js, fjs = d.getElementsByTagName(s)[0];
            js = d.createElement(s); js.id = id; js.src= "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            return window.twttr || (t = { _e: [], ready: function (f) { t._e.push(f) } });
        }(document, "script", "twitter-wjs"));
    };
    me.loadTwitter();
}]);