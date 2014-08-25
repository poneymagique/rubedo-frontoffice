/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess', 'lrInfiniteScroll','rubedoFields']);

    var blocksConfig = {
        image:"/components/webtales/rubedo-frontoffice/templates/blocks/image.html",
        blockNotFound:"/components/webtales/rubedo-frontoffice/templates/blocks/blockNotFound.html",
        navigation:"/components/webtales/rubedo-frontoffice/templates/blocks/navigation.html",
        contentList:"/components/webtales/rubedo-frontoffice/templates/blocks/contentList.html",
        authentication:"/components/webtales/rubedo-frontoffice/templates/blocks/authentication.html",
        simpleText:"/components/webtales/rubedo-frontoffice/templates/blocks/simpleText.html",
        richText:"/components/webtales/rubedo-frontoffice/templates/blocks/richText.html",
        contentDetail:"/components/webtales/rubedo-frontoffice/templates/blocks/contentDetail.html",
        calendar:"/components/webtales/rubedo-frontoffice/templates/blocks/calendar.html",
        development:"/components/webtales/rubedo-frontoffice/templates/blocks/development.html",
        customTemplate:"/components/webtales/rubedo-frontoffice/templates/blocks/customTemplate.html",
        carrousel:"/components/webtales/rubedo-frontoffice/templates/blocks/carousel.html"
    };

    module.factory('RubedoBlockTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplate=function(bType,bConfig){
            if (!angular.element.isEmptyObject(bConfig.customTemplate)){
                return (blocksConfig.customTemplate);
            } else if (blocksConfig[bType]){
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

    //custom template directive
    module.directive( 'rubedoCustomTemplate',['$compile', function ( $compile ) {
        return {
            scope: true,
            restrict:"E",
            link: function ( scope, element, attrs ) {
                var el;
                attrs.$observe( 'template', function ( tpl ) {
                    if ( angular.isDefined( tpl ) ) {
                        el = $compile( tpl )( scope );
                        element.html("");
                        element.append( el );
                    }
                });
            }
        };
    }]);

    //block controllers start here
    module.controller("MenuController",['$scope','$location','RubedoMenuService',function($scope,$location,RubedoMenuService){
        var me=this;
        me.menu={};
        me.currentRouteleine=$location.path();
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        if (config.rootPage){
            pageId=config.rootPage;
        }
        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);

    module.controller("ContentListController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
        var me = this;
        me.contentList=[];
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        me.prefixId = 'block-'+$scope.block.id+'-infiniteScrollCtrl';
        var resultsSkip = config.resultsSkip?config.resultsSkip:0;
        me.contentHeight = config.summaryHeight?config.summaryHeight:80;

        var options = {
            start: config.resultsSkip?config.resultsSkip:0,
            limit: config.pageSize?config.pageSize:12
        };

        if (config.infiniteScroll){
            var count;
            me.limit = options['limit'];
            me.blockStyle = {
                height: (me.limit * me.contentHeight - me.contentHeight)+'px',
                'overflow-y': 'scroll'
            };
            me.timeThreshold = config['timeThreshold'] ? config['timeThreshold']:200;
            me.scrollThreshold = config['scrollThreshold'] ? config['scrollThreshold']:300;
        } else {
            me.blockStyle = {
                'overflow-y': 'visible'
            };
            me.actualPage = 1;
        }

        me.getContents = function (queryId, pageId, siteId, options, add){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
                if (response.data.success){
                    if (config.infiniteScroll){
                        count = response.data.count;
                    } else {
                        me.nbPages = Math.ceil((response.data.count - (resultsSkip?resultsSkip:0))/options['limit']);
                    }
                    me.showPager = config.showPager && me.nbPages > 1 && !config.infiniteScroll;
                    if (add){
                        response.data.contents.forEach(function(newContent){
                            me.contentList.push(newContent);
                        });
                    } else {
                        me.contentList=response.data.contents;
                    }
                }
            });
        };

        $scope.loadMoreContents = function(){
            if (options['start'] + options['limit'] < count){
                options['start'] += options['limit'];
                me.getContents(config.query, pageId, siteId, options, true);
            }
        };
        me.showActive = function(value){
            return value == me.actualPage;
        };
        me.getPagesNumber = function (index){
            var res;
            if (me.actualPage < 6 || (me.nbPages <= 9? me.nbPages : 9) < 9){
                res = index+1;
            } else if (me.actualPage + 4 >= me.nbPages) {
                res = me.nbPages - (8 - index);
            } else {
                res = me.actualPage + (index - 4);
            }
            return res;
        };
        me.getIteration = function(num){
            return new Array(num <= 9? num : 9);
        };
        me.changePage = function(value){
            if (me.actualPage != value + 1){
                if (value == 'prev'){
                    me.actualPage -= 1;
                    value = me.actualPage -1;
                } else if (value == 'next'){
                    me.actualPage += 1;
                    value = me.actualPage -1;
                } else {
                    me.actualPage = value + 1;
                }
                options['start'] = (value * options['limit']);
                if (resultsSkip)
                    options['start'] += resultsSkip;
                me.getContents(config.query, pageId, siteId, options);
            }
        };

        me.getContents(config.query, pageId, siteId, options);
    }]);

    module.controller("CarouselController",["$scope","RubedoContentsService",function($scope,RubedoContentsService){
        var me=this;
        me.contents=[];
        var blockConfig=$scope.blockConfig;
        console.log(blockConfig);
        var queryOptions={
            start: !angular.element.isEmptyObject(blockConfig.resultsSkip) ? blockConfig.resultsSkip : 0,
            limit: !angular.element.isEmptyObject(blockConfig.pageSize) ? blockConfig.pageSize : 6
        };
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        me.getContents=function(){
            RubedoContentsService.getContents(blockConfig.query,pageId,siteId, queryOptions).then(
                function(response){
                    console.log(response);
                    if (response.data.success){
                        me.contents=response.data.contents;
                        setTimeout(function(){me.initCarousel();},300);
                    }
                }
            );
        };
        me.initCarousel=function(){
            var targetElSelector="#block"+$scope.block.id;
            var owlOptions={
                responsiveBaseWidth:targetElSelector,
                singleItem:true,
                pagination: blockConfig.showPager,
                navigation: blockConfig.showNavigation
            };
            console.log(owlOptions);
            angular.element(targetElSelector).owlCarousel(owlOptions);
        };
        me.getImageOptions=function(){
            return({
                width:angular.element("#block"+$scope.block.id).width(),
                height:blockConfig.imageHeight,
                mode:blockConfig.imageResizeMode
            });
        };
        if (blockConfig.query){
            me.getContents();
        }
    }]);


    module.controller("AuthenticationController",["$scope","RubedoAuthService",function($scope,RubedoAuthService){
        var me=this;
        me.blockConfig=$scope.blockConfig;
        me.credentials={ };
        me.authError=null;
        me.authenticate=function(){
            me.authError=null;
            if ((!me.credentials.login)||(!me.credentials.password)){
                me.authError="Please fill in all required fields."
            } else {
                RubedoAuthService.generateToken(me.credentials).then(
                    function(response){
                        angular.element("#rubedoAuthModal").modal('hide');
                        $scope.rubedo.current.user=response.data.token.user;
                    },
                    function(response){
                        me.authError=response.data.message;
                    }
                );
            }
        };
        me.logOut=function(){
            RubedoAuthService.clearPersistedTokens();
            $scope.rubedo.current.user=null;
        }
    }]);

    module.controller("SimpleTextController",["$scope","RubedoContentsService",function($scope, RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
        me.getContentById = function (contentId){
            RubedoContentsService.getContentById(contentId).then(
                function(response){
                    if(response.data.success){
                        me.body = response.data.content.fields.body;
                    }
                }
            )
        };
        me.getContentById(config.contentId);
    }]);

    module.controller("RichTextController",["$scope","$sce","RubedoContentsService",function($scope, $sce,RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
        me.getContentById = function (contentId){
            RubedoContentsService.getContentById(contentId).then(
                function(response){
                    if(response.data.success){
                        me.body=$sce.trustAsHtml(jQuery.htmlClean(response.data.content.fields.body, {
                            allowedAttributes:[["style"]],
                            format: true
                        }));
                    }
                }
            )
        };
        me.getContentById(config.contentId);
    }]);

    module.controller("ContentDetailController",["$scope","RubedoContentsService",function($scope, RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
        me.getContentById = function (contentId){
            RubedoContentsService.getContentById(contentId).then(
                function(response){
                    if(response.data.success){
                        me.content=response.data.content;
                        $scope.fieldEntity=me.content.fields;
                        $scope.fieldEditMode=false;
                        //use only default template for now
                        me.content.type.fields.unshift({
                            cType:"title",
                            config:{
                                name:"text",
                                fieldLabel:"Title"
                            }
                        });
                        me.detailTemplate='/components/webtales/rubedo-frontoffice/templates/blocks/contentDetail/default.html';
                    }
                }
            )
        };
        if (config.contentId){
            me.getContentById(config.contentId);
        }
    }]);

    module.controller("CalendarController",["$scope","$route","RubedoContentsService",function($scope,$route,RubedoContentsService){
        var me = this;

        var config = $scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        me.contents = [];
        me.calendarId = 'block-'+$scope.block.id+'-calendar';
        var options = {
            dateFieldName: config['date'],
            endDateFieldName: config['endDate'],
            limit: 100,
            'fields[]':['text',config['date'],config['endDate'],'summary','image']
        };
        me.getContents = function (queryId, pageId, siteId, options, cb){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
                me.calendar = angular.element('#'+me.calendarId);
                if (response.data.success){
                    cb(response.data);
                }
            })
        };
        me.init = function(){
            me.calendar = angular.element('#'+me.calendarId);
            me.calendar.fullCalendar({
                lang: $route.current.params.lang,
                weekMode: 'liquid',
                timezone: false,
                viewRender: function(view){
                    options.date = moment(view.start.format()).unix();
                    options.endDate = moment(view.end.format()).unix();
                    me.getContents(config.query, pageId, siteId, options, function(data){
                        me.contents = data.contents;
                        var newEvents = [];
                        me.contents.forEach(function(content){
                            var event = {};
                            event.title = content.fields.text;
                            event.start = moment.unix(content.fields[config['date']]).format('YYYY-MM-DD');
                            event.end = moment.unix(content.fields[config['endDate']]).format('YYYY-MM-DD');
                            newEvents.push(event);
                        });
                        me.calendar.fullCalendar('removeEvents');
                        me.calendar.fullCalendar('addEventSource', newEvents);
                        me.calendar.fullCalendar('refetchEvents');
                    });
                }
            });
        };
    }]);
})();
