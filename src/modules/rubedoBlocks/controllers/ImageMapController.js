angular.module("rubedoBlocks").lazy.controller('ImageMapController',['$scope','$element','RubedoMediaService',function($scope,$element,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    if(config.image){
        RubedoMediaService.getMediaById(config.image).then(function(response){
            if(response.data.success){
                me.image =  response.data.media;
            }
        });
        me.prefix = config.image+'map';
    }
    if(config.map){
        var map = angular.fromJson(config.map);
        angular.forEach(map, function(mapElement, key){
            if(mapElement.type == 'polygon'){
                map[key]['type'] = 'poly';
            }
            if(mapElement.type == 'rect'){
                map[key]['params']['x1'] = mapElement.params.x + mapElement.params.width;
                map[key]['params']['y1'] = mapElement.params.y + mapElement.params.height;
                map[key]['coords'] = mapElement.params.x+','+mapElement.params.y+','+map[key]['params']['x1']+','+map[key]['params']['y1'];
            } else {
                map[key]['coords'] = '';
                angular.forEach(mapElement.params,function(value){
                    map[key]['coords'] += value+',';
                });
            }
        });
        me.map = map;
        $element.find('img[usemap]').rwdImageMaps();
    }

}]);