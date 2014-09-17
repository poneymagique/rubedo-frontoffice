/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess', 'lrInfiniteScroll','rubedoFields','snap']);

    var blocksConfig = {
        image:"/components/webtales/rubedo-frontoffice/templates/blocks/image.html",
        blockNotFound:"/components/webtales/rubedo-frontoffice/templates/blocks/blockNotFound.html",
        navigation:"/components/webtales/rubedo-frontoffice/templates/blocks/navigation.html",
        verticalNavigation:"/components/webtales/rubedo-frontoffice/templates/blocks/verticalNavigation.html",
        contentList:"/components/webtales/rubedo-frontoffice/templates/blocks/contentList.html",
        authentication:"/components/webtales/rubedo-frontoffice/templates/blocks/authentication.html",
        simpleText:"/components/webtales/rubedo-frontoffice/templates/blocks/simpleText.html",
        richText:"/components/webtales/rubedo-frontoffice/templates/blocks/richText.html",
        contentDetail:"/components/webtales/rubedo-frontoffice/templates/blocks/contentDetail.html",
        calendar:"/components/webtales/rubedo-frontoffice/templates/blocks/calendar.html",
        development:"/components/webtales/rubedo-frontoffice/templates/blocks/development.html",
        customTemplate:"/components/webtales/rubedo-frontoffice/templates/blocks/customTemplate.html",
        carrousel:"/components/webtales/rubedo-frontoffice/templates/blocks/carousel.html",
        imageGallery:"/components/webtales/rubedo-frontoffice/templates/blocks/gallery.html",
        damList:"/components/webtales/rubedo-frontoffice/templates/blocks/mediaList.html",
        searchResults:"/components/webtales/rubedo-frontoffice/templates/blocks/searchResults.html",
        userProfile:"/components/webtales/rubedo-frontoffice/templates/blocks/userProfile.html",
        externalMedia:"/components/webtales/rubedo-frontoffice/templates/blocks/externalMedia.html",
        searchForm:"/components/webtales/rubedo-frontoffice/templates/blocks/searchForm.html",
        breadcrumb:"/components/webtales/rubedo-frontoffice/templates/blocks/breadcrumb.html",
        languageMenu:"/components/webtales/rubedo-frontoffice/templates/blocks/languageMenu.html",
        directory:"/components/webtales/rubedo-frontoffice/templates/blocks/directory.html",
        audio:"/components/webtales/rubedo-frontoffice/templates/blocks/audio.html",
        video:"/components/webtales/rubedo-frontoffice/templates/blocks/video.html",
        siteMap:"/components/webtales/rubedo-frontoffice/templates/blocks/siteMap.html",
        twitter:"/components/webtales/rubedo-frontoffice/templates/blocks/twitter.html",
        geoSearchResults:"/components/webtales/rubedo-frontoffice/templates/blocks/geoSearchResults.html",
        addThis:"/components/webtales/rubedo-frontoffice/templates/blocks/addThisShare.html",
        resource:"/components/webtales/rubedo-frontoffice/templates/blocks/mediaDownload.html",
        addThisFollow:"/components/webtales/rubedo-frontoffice/templates/blocks/addThisFollow.html",
        signUp:"/components/webtales/rubedo-frontoffice/templates/blocks/signUp.html"
    };

    var responsiveClasses = {
        phone:"xs",
        tablet:"sm",
        desktop:"md",
        largeDesktop:"lg"
    };

    mongoIdRegex = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

    module.factory('RubedoBlockTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplate=function(bType,bConfig){
            if (bConfig.customTemplate){
                return (blocksConfig.customTemplate);
            } else if (bType=="navigation"&&bConfig.style&&bConfig.style=="Vertical") {
                return (blocksConfig.verticalNavigation);
            } else if (blocksConfig[bType]){
                return (blocksConfig[bType]);
            } else {
                return (blocksConfig.blockNotFound);
            }
        };
        return serviceInstance;
    });

    module.factory('RubedoPageComponents', function() {
        var serviceInstance={};
        serviceInstance.getRowTemplate=function(customTemplate){
            if (customTemplate){
                return("/components/webtales/rubedo-frontoffice/templates/customRow.html");
            }  else {
                return("/components/webtales/rubedo-frontoffice/templates/row.html");
            }
        };
        serviceInstance.getColumnTemplate=function(customTemplate){
            if (customTemplate){
                return("/components/webtales/rubedo-frontoffice/templates/customColumn.html");
            }  else {
                return("/components/webtales/rubedo-frontoffice/templates/column.html");
            }
        };
        serviceInstance.getColumnClass=function(span,offset,stackThreshold){
            if (!stackThreshold){
                stackThreshold="sm"
            }
            return ("col-"+stackThreshold+"-"+span+" col-"+stackThreshold+"-offset-"+offset);
        };
        serviceInstance.resolveResponsiveClass=function(responsiveConfig){
            var hiddenArray=[ ];
            angular.forEach(responsiveConfig,function(value,key){
                if (value===false){
                    hiddenArray.push("hidden-"+responsiveClasses[key]);
                }
            });
            return (hiddenArray.join(" "));
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
    module.controller("MenuController",['$scope','$location','RubedoMenuService','RubedoPagesService',function($scope,$location,RubedoMenuService,RubedoPagesService){
        var me=this;
        me.menu={};
        me.currentRouteleine=$location.path();
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        me.searchEnabled = (config.useSearchEngine && config.searchPage);
        if (config.rootPage){
            pageId=config.rootPage;
        }
        me.onSubmit = function(){
            var paramQuery = me.query?'?query='+me.query:'';
            RubedoPagesService.getPageById(config.searchPage).then(function(response){
                if (response.data.success){
                    $location.url(response.data.url+paramQuery);
                }
            });
        };
        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);

    module.controller("ContentListController",['$scope','$compile','RubedoContentsService',function($scope,$compile,RubedoContentsService){
        var me = this;
        me.contentList=[];
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        me.contentHeight = config.summaryHeight?config.summaryHeight:80;
        me.start = config.resultsSkip?config.resultsSkip:0;
        me.limit = config.pageSize?config.pageSize:12;
        var options = {
            start: me.start,
            limit: me.limit
        };
        if(config.singlePage){
            options.detailPageId = config.singlePage;
        }
        me.showPaginator = config.showPager && !config.infiniteScroll;
        me.changePageAction = function(){
            options.start = me.start;
            me.getContents(config.query, pageId, siteId, options);
        };
        if (config.infiniteScroll){
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
        }
        me.getContents = function (queryId, pageId, siteId, options, add, reloadPager){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
                if (response.data.success){
                    me.count = response.data.count;
                    if (add){
                        angular.forEach(response.data.contents,function(newContent){
                            me.contentList.push(newContent);
                        });
                    } else {
                        me.contentList=response.data.contents;
                    }
                }
            });
        };
        $scope.loadMoreContents = function(){
            if (options['start'] + options['limit'] < me.count){
                options['start'] += options['limit'];
                me.getContents(config.query, pageId, siteId, options, true);
            }
        };
        me.getContents(config.query, pageId, siteId, options, false, true);
    }]);

    module.directive("paginator",["$timeout",function($timeout){
        return {
            restrict: 'E',
            templateUrl: "/components/webtales/rubedo-frontoffice/templates/paginator.html",
            scope:{
                start: '=',
                limit: '=',
                count: '=',
                changePageAction: '&'
            },

            controller: function($scope, $timeout){
                var me = this;
                me.showPager = false;
                $scope.$watch('count',function(){
                    me.actualPage = 1;
                    me.nbPages = Math.ceil(($scope.count - $scope.start)/$scope.limit);
                    me.showPager = me.nbPages > 1;
                });
                var resultsSkip = $scope.start;
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
                        $scope.start = (value * $scope.limit);
                        if (resultsSkip)
                            $scope.start += resultsSkip;
                        $timeout($scope.changePageAction);
                    }
                };
            },
            controllerAs: 'paginatorCtrl'
        }
    }]);

    module.controller("CarouselController",["$scope","RubedoContentsService",function($scope,RubedoContentsService){
        var me=this;
        me.contents=[];
        var blockConfig=$scope.blockConfig;
        var queryOptions={
            start: !angular.element.isEmptyObject(blockConfig.resultsSkip) ? blockConfig.resultsSkip : 0,
            limit: !angular.element.isEmptyObject(blockConfig.pageSize) ? blockConfig.pageSize : 6
        };
        var pageId=$scope.rubedo.current.page.id;
        var siteId=$scope.rubedo.current.site.id;
        me.getContents=function(){
            RubedoContentsService.getContents(blockConfig.query,pageId,siteId, queryOptions).then(
                function(response){
                    if (response.data.success){
                        me.contents=response.data.contents;
                        setTimeout(function(){me.initCarousel();},100);
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
                navigation: blockConfig.showNavigation,
                autoPlay: blockConfig.autoPlay,
                stopOnHover: blockConfig.stopOnHover,
                paginationNumbers:blockConfig.showPagingNumbers,
                navigationText: ['<span class="glyphicon glyphicon-chevron-left"></span>','<span class="glyphicon glyphicon-chevron-right"></span>'],
                lazyLoad:true
            };
            angular.element(targetElSelector).owlCarousel(owlOptions);
        };
        me.getImageOptions=function(){
            return({
                height:blockConfig.imageHeight,
                width:blockConfig.imageWidth ? blockConfig.imageWidth : angular.element("#block"+$scope.block.id).width(),
                mode:blockConfig.imageResizeMode
            });
        };
        if (blockConfig.query){
            me.getContents();
        }
    }]);


    module.controller("AuthenticationController",["$scope","RubedoAuthService","snapRemote","RubedoPagesService",function($scope,RubedoAuthService,snapRemote,RubedoPagesService){
        var me=this;
        me.blockConfig=$scope.blockConfig;
        if (me.blockConfig&&me.blockConfig.profilePage&&mongoIdRegex.test(me.blockConfig.profilePage)){
            RubedoPagesService.getPageById(me.blockConfig.profilePage).then(function(response){
                if (response.data.success){
                    me.profilePageUrl=response.data.url;
                }
            });
        }
        me.credentials={ };
        me.authError=null;
        me.rememberMe=false;
        me.authenticate=function(){
            me.authError=null;
            if ((!me.credentials.login)||(!me.credentials.password)){
                me.authError="Please fill in all required fields."
            } else {
                RubedoAuthService.generateToken(me.credentials,me.rememberMe).then(
                    function(response){
                        window.location.reload();
                    },
                    function(response){
                        me.authError=response.data.message;
                    }
                );
            }
        };
        me.logOut=function(){
            RubedoAuthService.clearPersistedTokens();
            window.location.reload();
        }
    }]);

    module.controller("RichTextController",["$scope","$sce","RubedoContentsService",function($scope, $sce,RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
        $scope.fieldInputMode=false;
        $scope.$watch('rubedo.fieldEditMode', function(newValue) {
            $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;

        });
        me.getContentById = function (contentId){
            RubedoContentsService.getContentById(contentId).then(
                function(response){
                    if(response.data.success){
                        me.content=response.data.content;
                        $scope.fieldEntity=angular.copy(me.content.fields);
                        $scope.fieldLanguage=me.content.locale;
                    }
                }
            )
        };
        if (config.contentId){
            me.getContentById(config.contentId);
        }
        me.revertChanges=function(){
            $scope.fieldEntity=angular.copy(me.content.fields);
        };
        me.registerEditChanges=function(){
            $scope.rubedo.registerEditCtrl(me);
        };
        me.persistChanges=function(){
            var payload=angular.copy(me.content);
            payload.fields=angular.copy($scope.fieldEntity);
            delete (payload.type);
            RubedoContentsService.updateContent(payload).then(
                function(response){
                    $scope.rubedo.addNotification("success","Content updated.");
                },
                function(response){
                    $scope.rubedo.addNotification("error","Content update error.");
                }
            );
        };
        $scope.registerFieldEditChanges=me.registerEditChanges;
    }]);

    module.controller("ContentDetailController",["$scope","RubedoContentsService",function($scope, RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
        $scope.fieldInputMode=false;
        $scope.$watch('rubedo.fieldEditMode', function(newValue) {
            $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;

        });
        me.getContentById = function (contentId){
            RubedoContentsService.getContentById(contentId).then(
                function(response){
                    if(response.data.success){
                        me.content=response.data.content;
                        $scope.fieldEntity=angular.copy(me.content.fields);
                        $scope.fieldLanguage=me.content.locale;
                        //use only default template for now
                        me.content.type.fields.unshift({
                            cType:"title",
                            config:{
                                name:"text",
                                fieldLabel:"Title",
                                allowBlank:false
                            }
                        });
                        $scope.rubedo.current.breadcrumb.push({title:response.data.content.text});
                        me.detailTemplate='/components/webtales/rubedo-frontoffice/templates/blocks/contentDetail/default.html';
                    }
                }
            );
        };
        if (config.contentId){
            me.getContentById(config.contentId);
        }
        me.revertChanges=function(){
            $scope.fieldEntity=angular.copy(me.content.fields);
        };
        me.registerEditChanges=function(){
            $scope.rubedo.registerEditCtrl(me);
        };
        me.persistChanges=function(){
            var payload=angular.copy(me.content);
            payload.fields=angular.copy($scope.fieldEntity);
            delete (payload.type);
            RubedoContentsService.updateContent(payload).then(
                function(response){
                    $scope.rubedo.addNotification("success","Content updated.");
                },
                function(response){
                    $scope.rubedo.addNotification("error","Content update error.");
                }
            );
        };
        $scope.registerFieldEditChanges=me.registerEditChanges;
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
            limit: 1000,
            'fields[]':['text',config['date'],config['endDate'],'summary','image']
        };
        me.getContents = function (queryId, pageId, siteId, options, cb){
            RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
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
                        angular.forEach(me.contents,function(content){
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

    module.controller("MediaListController",["$scope","$compile","RubedoSearchService",function($scope,$compile,RubedoSearchService){
        var me = this;
        var config = $scope.blockConfig;
        me.media = [];
        me.start = 0;
        me.limit = config.pagesize?config.pagesize:12;
        var options = {
            start: me.start,
            limit: me.limit,
            constrainToSite: config.constrainToSite,
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id,
            predefinedFacets: config.facets
        };
        me.changePageAction = function(){
            options.start = me.start;
            me.getMedia(options);
        };

        me.getMedia = function(options){
            RubedoSearchService.getMediaById(options).then(function(response){
                if(response.data.success){
                    me.count = response.data.count;
                    me.media = response.data.results.data;
                }
            });
        };

        me.getMedia(options);
    }]);

    module.controller("SearchResultsController",["$scope","$location","$routeParams","$compile","RubedoSearchService",
        function($scope,$location,$routeParams,$compile,RubedoSearchService){
            var me = this;
            var config = $scope.blockConfig;
            me.data = [];
            me.facets = [];
            me.activeFacets = [];
            me.start = 0;
            me.limit = $routeParams.limit?$routeParams.limit:10;
            me.orderBy = $routeParams.orderby?$routeParams.orderby:"_score";
            var resolveOrderBy = {
                '_score': 'relevance',
                'lastUpdateTime': 'date',
                'authorName': 'author',
                'text': 'title'
            };
            me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:"relevance";
            me.template = "/components/webtales/rubedo-frontoffice/templates/blocks/searchResults/"+config.displayMode+".html";
            var predefinedFacets = config.predefinedFacets==""?{}:JSON.parse(config.predefinedFacets);
            var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','query'];
            var defaultOptions = {
                start: me.start,
                limit: me.limit,
                constrainToSite: config.constrainToSite,
                predefinedFacets: config.predefinedFacets,
                displayMode: config.displayMode,
                displayedFacets: config.displayedFacets,
                orderby: me.orderBy,
                pageId: $scope.rubedo.current.page.id,
                siteId: $scope.rubedo.current.site.id
            };
            if (config.singlePage){
                defaultOptions.detailPageId = config.singlePage;
            }
            if(config.profilePage){
                defaultOptions.profilePageId = config.profilePage;
            }
            var options = angular.copy(defaultOptions);
            var parseQueryParamsToOptions = function(){
                angular.forEach($location.search(), function(queryParam, key){
                    if(typeof queryParam !== "boolean"){
                        if(key == 'taxonomies'){
                            options[key] = JSON.parse(queryParam);
                        } else {
                            if(key == 'query'){
                                me.query = queryParam;
                            }
                            options[key] = queryParam;
                        }
                    }
                });
            };
            if(predefinedFacets.query) {
                me.query = options.query = predefinedFacets.query;
                $location.search('query',me.query);
            }
            $scope.$on('$routeUpdate', function(scope, next, current) {
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                options.orderBy = me.orderBy;
                parseQueryParamsToOptions();
                me.searchByQuery(options, true);
            });
            me.checked = function(term){
                var checked = false;
                angular.forEach(me.activeTerms,function(activeTerm){
                    checked = activeTerm.term==term;
                });
                return checked;
            };
            me.disabled = function(term){
                var disabled = false;
                angular.forEach(me.notRemovableTerms,function(notRemovableTerm){
                    disabled = notRemovableTerm.term == term;
                });
            };
            me.changePageAction = function(){
                options.start = me.start;
                me.searchByQuery(options);
            };
            me.onSubmit = function(){
                me.start = 0;
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                options.query = me.query;
                options.orderBy = me.orderBy;
                $location.search('query',me.query);
            };
            me.changeOrderBy = function(orderBy){
                if(me.orderBy != orderBy){
                    me.orderBy = orderBy;
                    me.displayOrderBy = resolveOrderBy[orderBy];
                    me.start = 0;
                    $location.search('orderby',me.orderBy);
                }
            };
            me.changeLimit = function(limit){
                if(me.limit != limit){
                    me.limit = limit;
                    me.start = 0;
                    $location.search('limit',me.limit);
                }
            };
            me.target = function(data){
                var res = '';
                if (data.objectType == 'dam'){
                    res = '_blank';
                }
                return res;
            };
            me.clickOnFacets =  function(facetId,term){
                var del = false;
                angular.forEach(me.activeTerms,function(activeTerm){
                    if(!del){
                        del = (activeTerm.term==term && activeTerm.facetId==facetId);
                    }
                });
                if(del){
                    if(facetsId.indexOf(facetId)==-1){
                        options.taxonomies[facetId].splice(options.taxonomies[facetId].indexOf(term),1);
                        if(options.taxonomies[facetId].length == 0){
                            delete options.taxonomies[facetId];
                        }
                        if(Object.keys(options['taxonomies']).length == 0){
                            $location.search('taxonomies',null);
                        } else {
                            $location.search('taxonomies',JSON.stringify(options.taxonomies));
                        }
                    } else if (facetId == 'query') {
                        $location.search('query',null);
                        delete options.query;
                    } else if(facetId == 'lastupdatetime') {
                        delete options[facetId];
                        $location.search(facetId,null);
                    } else {
                        if(angular.isArray(options[facetId+'[]'])){
                            options[facetId+'[]'].splice(options[facetId+'[]'].indexOf(term),1);
                        } else {
                            delete options[facetId+'[]'];
                        }
                        if(!options[facetId+'[]'] || options[facetId+'[]'].length == 0){
                            $location.search(facetId+'[]',null)
                        } else {
                            $location.search(facetId+'[]',options[facetId+'[]']);
                        }
                    }
                } else {
                    if(facetsId.indexOf(facetId)==-1){
                        if(!options.taxonomies){
                            options.taxonomies = {};
                        }
                        if(!options.taxonomies[facetId]){
                            options.taxonomies[facetId] = [];
                        }
                        options.taxonomies[facetId].push(term);
                        $location.search('taxonomies',JSON.stringify(options.taxonomies));
                    } else if(facetId == 'lastupdatetime') {
                        options[facetId] = term;
                        $location.search(facetId,options[facetId]);
                    } else {
                        if(!options[facetId+'[]']){
                            options[facetId+'[]'] = [];
                        }
                        options[facetId+'[]'].push(term);
                        $location.search(facetId+'[]',options[facetId+'[]']);
                    }
                }
                me.start = 0;
                options.start = me.start;
            };

            me.searchByQuery = function(options){
                RubedoSearchService.searchByQuery(options).then(function(response){
                    if(response.data.success){
                        me.query = response.data.results.query;
                        me.count = response.data.count;
                        me.data =  response.data.results.data;
                        me.facets = response.data.results.facets;
                        me.notRemovableTerms = [];
                        me.activeTerms = [];
                        var previousFacetId;
                        angular.forEach(response.data.results.activeFacets,function(activeFacet){
                            if(activeFacet.id != 'navigation'){
                                angular.forEach(activeFacet.terms,function(term){
                                    var newTerm = {};
                                    newTerm.term = term.term;
                                    newTerm.label = term.label;
                                    newTerm.facetId = activeFacet.id;
                                    if(previousFacetId == activeFacet.id){
                                        newTerm.operator =' '+(activeFacet.operator)+' ';
                                    } else if (previousFacetId && me.notRemovableTerms.length != 0){
                                        newTerm.operator = ', ';
                                    }
                                    if(predefinedFacets.hasOwnProperty(activeFacet.id) && predefinedFacets[activeFacet.id]==term.term){
                                        me.notRemovableTerms.push(newTerm);
                                    } else {
                                        me.activeTerms.push(newTerm);
                                    }
                                    previousFacetId = activeFacet.id;
                                });
                            }
                        });
                    }
                })
            };
            parseQueryParamsToOptions();
            me.searchByQuery(options);
        }]);

    module.controller("UserProfileController",["$scope","RubedoUsersService","$route",function($scope, RubedoUsersService, $route){
        var me = this;
        var config = $scope.blockConfig;
        $scope.fieldEditMode=false;
        me.canEdit=false;
        me.getUserById = function (userId){
            RubedoUsersService.getUserById(userId).then(
                function(response){
                    if(response.data.success){
                        me.user=response.data.user;
                        me.hasChanges=false;
                        $scope.fieldEntity=angular.copy(me.user.fields);
                        $scope.fieldLanguage=$route.current.params.lang;
                        me.canEdit=!me.user.readOnly;
                        //use only default template for now
                        me.user.type.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"email",
                                fieldLabel:"E-mail",
                                allowBlank:false,
                                vtype:"email"
                            }
                        });
                        me.user.type.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"name",
                                fieldLabel:"Name",
                                allowBlank:false
                            }
                        });
                        me.detailTemplate='/components/webtales/rubedo-frontoffice/templates/blocks/userDetail/default.html';
                    }
                }
            );
        };
        if ($scope.rubedo.current.user&&$scope.rubedo.current.user.id){
            me.getUserById($scope.rubedo.current.user.id);
        }
        me.revertChanges=function(){
            $scope.fieldEditMode=false;
            $scope.fieldEntity=angular.copy(me.user.fields);
            me.hasChanges=false;
        };
        me.registerEditChanges=function(){
            me.hasChanges=true;
        };
        me.persistChanges=function(){
            var payload=angular.copy(me.user);
            payload.fields=angular.copy($scope.fieldEntity);
            delete (payload.type);
            RubedoUsersService.updateUser(payload).then(
                function(response){
                    console.log(response);
                },
                function(response){
                    console.log(response);
                }
            );
        };
        me.enterEditMode=function(){
            $scope.fieldEditMode=true;
        };
        me.cancelEditMode=function(){
            $scope.fieldEditMode=false;
        };
        $scope.registerFieldEditChanges=me.registerEditChanges;
    }]);

    module.controller("ExternalMediaController",['$scope','$http','$sce',function($scope,$http,$sce){
        var me=this;
        var config=$scope.blockConfig;
        if ((config)&&(config.url)){
            var url = "http://iframe.ly/api/oembed?callback=JSON_CALLBACK&url="+encodeURIComponent(config.url);
            $http.jsonp(url).success(function(response){
                me.html=$sce.trustAsHtml(response.html);
            });


        }
    }]);

    module.controller("SearchFormController",['$scope','$location','RubedoPagesService',function($scope, $location, RubedoPagesService){
        var me = this;
        var config = $scope.blockConfig;
        me.placeholder = config.placeholder;
        me.onSubmit = function(){
            var paramQuery = me.query?'?query='+me.query:'';
            RubedoPagesService.getPageById(config.searchPage).then(function(response){
                if (response.data.success){
                    $location.url(response.data.url+paramQuery);
                }
            });
        };
    }]);

    module.controller("BreadcrumbController",['$scope',function($scope){
    }]);

    module.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', '$route', '$location',
        function ($scope, RubedoPagesService,RubedoModuleConfigService, $route, $location) {
            var me = this;
            var config = $scope.blockConfig;
            me.languages = $scope.rubedo.current.site.languages;
            me.currentLang = $scope.rubedo.current.site.languages[$route.current.params.lang];
            me.mode = config.displayAs == "select";
            me.isDisabled =  function(lang){
                return me.currentLang.lang == lang;
            };
            if(!config.showCurrentLanguage){
                delete me.languages[$route.current.params.lang];
            }
            me.getFlagUrl = function(flagCode){
                return '/assets/flags/16/'+flagCode+'.png';
            };
            me.changeLang = function (lang) {
                if(lang != me.currentLang.lang){
                    RubedoModuleConfigService.changeLang(lang);
                    RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                        if (response.data.success){
                            $location.path(response.data.url);
                        }
                    });
                }
            };
        }]);

    module.controller('DirectoryController',["$scope","$location","$routeParams","RubedoSearchService",
        function($scope,$location,$routeParams,RubedoSearchService){
            var me = this;
            var config = $scope.blockConfig;
            me.data = [];
            me.facets = [];
            me.activeFacets = [];
            me.start = 0;
            me.limit = $routeParams.limit?$routeParams.limit:10;
            me.orderBy = $routeParams.orderby?$routeParams.orderby:"_score";
            var resolveOrderBy = {
                '_score': 'relevance',
                'lastUpdateTime': 'date',
                'authorName': 'author',
                'text': 'title'
            };
            me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:"relevance";
            me.template = "/components/webtales/rubedo-frontoffice/templates/blocks/directory/"+config.userDisplayMode+".html";
            me.activateSearch = config.activateSearch;
            me.alphabeticIndex =  config.alphabeticIndex;
            var predefinedFacets = config.predefinedFacets==""?{}:JSON.parse(config.predefinedFacets);
            var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','query'];
            var defaultOptions = {
                start: me.start,
                limit: me.limit,
                constrainToSite: config.constrainToSite,
                predefinedFacets: config.predefinedFacets,
                displayMode: config.displayMode,
                displayedFacets: config.displayedFacets,
                orderby: me.orderBy,
                pageId: $scope.rubedo.current.page.id,
                siteId: $scope.rubedo.current.site.id
            };
            if (config.profilePage){
                defaultOptions.profilePageId = config.profilePage;
            }
            var options = angular.copy(defaultOptions);
            var parseQueryParamsToOptions = function(){
                angular.forEach($location.search(), function(queryParam, key){
                    if(typeof queryParam !== "boolean"){
                        if(key == 'taxonomies'){
                            options[key] = JSON.parse(queryParam);
                        } else {
                            if(key == 'query'){
                                me.query = queryParam;
                            }
                            options[key] = queryParam;
                        }
                    }
                });
            };
            if(predefinedFacets.query) {
                me.query = options.query = predefinedFacets.query;
                $location.search('query',me.query);
            }
            $scope.$on('$routeUpdate', function(scope, next, current) {
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                options.orderBy = me.orderBy;
                parseQueryParamsToOptions();
                me.searchByQuery(options, true);
            });
            me.disabled = function(term){
                var disabled = false;
                angular.forEach(me.notRemovableTerms,function(notRemovableTerm){
                    disabled = notRemovableTerm.term == term;
                });
            };
            me.changePageAction = function(){
                options.start = me.start;
                me.searchByQuery(options);
            };
            me.onSubmit = function(){
                me.start = 0;
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                options.query = me.query;
                options.orderBy = me.orderBy;
                $location.search('query',me.query);
            };
            me.changeOrderBy = function(orderBy){
                if(me.orderBy != orderBy){
                    me.orderBy = orderBy;
                    me.displayOrderBy = resolveOrderBy[orderBy];
                    me.start = 0;
                    $location.search('orderby',me.orderBy);
                }
            };
            me.changeLimit = function(limit){
                if(me.limit != limit){
                    me.limit = limit;
                    me.start = 0;
                    $location.search('limit',me.limit);
                }
            };
            me.clickOnFacets =  function(facetId,term){
                var del = false;
                angular.forEach(me.activeTerms,function(activeTerm){
                    if(!del){
                        del = (activeTerm.term==term && activeTerm.facetId==facetId);
                    }
                });
                if(del){
                    if(facetsId.indexOf(facetId)==-1){
                        options.taxonomies[facetId].splice(options.taxonomies[facetId].indexOf(term),1);
                        if(options.taxonomies[facetId].length == 0){
                            delete options.taxonomies[facetId];
                        }
                        if(Object.keys(options['taxonomies']).length == 0){
                            $location.search('taxonomies',null);
                        } else {
                            $location.search('taxonomies',JSON.stringify(options.taxonomies));
                        }
                    } else if (facetId == 'query') {
                        $location.search('query',null);
                        delete options.query;
                    } else if(facetId == 'lastupdatetime') {
                        delete options[facetId];
                        $location.search(facetId,null);
                    } else {
                        if(angular.isArray(options[facetId+'[]'])){
                            options[facetId+'[]'].splice(options[facetId+'[]'].indexOf(term),1);
                        } else {
                            delete options[facetId+'[]'];
                        }
                        if(!options[facetId+'[]'] || options[facetId+'[]'].length == 0){
                            $location.search(facetId+'[]',null)
                        } else {
                            $location.search(facetId+'[]',options[facetId+'[]']);
                        }
                    }
                } else {
                    if(facetsId.indexOf(facetId)==-1){
                        if(!options.taxonomies){
                            options.taxonomies = {};
                        }
                        if(!options.taxonomies[facetId]){
                            options.taxonomies[facetId] = [];
                        }
                        options.taxonomies[facetId].push(term);
                        $location.search('taxonomies',JSON.stringify(options.taxonomies));
                    } else if(facetId == 'lastupdatetime') {
                        options[facetId] = term;
                        $location.search(facetId,options[facetId]);
                    } else {
                        if(!options[facetId+'[]']){
                            options[facetId+'[]'] = [];
                        }
                        options[facetId+'[]'].push(term);
                        $location.search(facetId+'[]',options[facetId+'[]']);
                    }
                }
                me.start = 0;
                options.start = me.start;
            };

            me.searchByQuery = function(options){
                RubedoSearchService.searchUsers(options).then(function(response){
                    if(response.data.success){
                        me.query = response.data.results.query;
                        me.count = response.data.count;
                        me.data =  response.data.results.data;
                        me.facets = [];
                        angular.forEach(response.data.results.facets,function(facet){
                            if(facet.id == 'userName'){
                                me.alphabet = facet;
                            } else {
                                me.facets.push(facet);
                            }
                        });
                        me.notRemovableTerms = [];
                        me.activeTerms = [];
                        var previousFacetId;
                        response.data.results.activeFacets.forEach(function(activeFacet){
                            if(activeFacet.id != 'navigation'){
                                activeFacet.terms.forEach(function(term){
                                    var newTerm = {};
                                    newTerm.term = term.term;
                                    newTerm.label = term.label;
                                    newTerm.facetId = activeFacet.id;
                                    if(previousFacetId == activeFacet.id){
                                        newTerm.operator =' '+(activeFacet.operator)+' ';
                                    } else if (previousFacetId && me.notRemovableTerms.length != 0){
                                        newTerm.operator = ', ';
                                    }
                                    if(predefinedFacets.hasOwnProperty(activeFacet.id) && predefinedFacets[activeFacet.id]==term.term){
                                        me.notRemovableTerms.push(newTerm);
                                    } else {
                                        me.activeTerms.push(newTerm);
                                    }
                                    previousFacetId = activeFacet.id;
                                });
                            }
                        });
                    }
                })
            };
            parseQueryParamsToOptions();
            me.searchByQuery(options);
        }]);

    module.controller("AudioController",["$scope","RubedoMediaService",function($scope,RubedoMediaService){
        var me=this;
        var config = $scope.blockConfig;
        var mediaId=config.audioFile;
        me.displayMedia=function(){
            if (me.media&&me.media.originalFileId){
                me.jwSettings={
                    primary:"flash",
                    height:40,
                    width:"100%",
                    controls:config.audioControls ? config.audioControls : false,
                    autostart:config.audioPlay,
                    repeat:config.audioLoop,
                    file:me.media.url
                };
                setTimeout(function(){jwplayer("audio"+me.media.originalFileId).setup(me.jwSettings);}, 200);
            }
        };
        if (mediaId){
            RubedoMediaService.getMediaById(mediaId).then(
                function(response){
                    if (response.data.success){
                        me.media=response.data.media;
                        me.displayMedia();
                    }
                }
            );
        }
    }]);

    module.controller("VideoController",["$scope","RubedoMediaService","RubedoImageUrlService",function($scope,RubedoMediaService,RubedoImageUrlService){
        var me=this;
        var config = $scope.blockConfig;
        var mediaId=config.videoFile;
        me.displayMedia=function(){
            if (me.media&&me.media.originalFileId){
                me.jwSettings={
                    width:"100%",
                    controls:config.videoControls ? config.videoControls : false,
                    autostart:config.videoAutoPlay,
                    repeat:config.videoLoop,
                    file:me.media.url
                };
                if (config.videoWidth){
                    me.jwSettings.width=config.videoWidth;
                }
                if (config.videoHeight){
                    me.jwSettings.height=config.videoHeight;
                }
                if (config.videoPoster){
                    me.jwSettings.image=RubedoImageUrlService.getUrlByMediaId(config.videoPoster,{});
                }
                setTimeout(function(){jwplayer("video"+me.media.originalFileId).setup(me.jwSettings);}, 200);
            }
        };
        if (mediaId){
            RubedoMediaService.getMediaById(mediaId).then(
                function(response){
                    if (response.data.success){
                        me.media=response.data.media;
                        me.displayMedia();
                    }
                }
            );
        }
    }]);

    module.controller("SiteMapController",['$scope','$location','RubedoMenuService',function($scope,$location,RubedoMenuService){
        var me=this;
        me.menu={};
        me.currentRouteline=$location.path();
        var config=$scope.blockConfig;
        var pageId=$scope.rubedo.current.page.id;
        me.hidePages = true;
        me.hideChildPages = true;
        me.showPagesClick = function(pageType){
            if(pageType == 'pages'){
                me.hidePages = !me.hidePages;
            } else {
                me.hideChildPages = !me.hideChildPages;
            }
        };
        if(config.displayLevel == 2){
            me.hidePages = false;
        } else if (config.displayLevel > 2){
            me.hidePages = false;
            me.hideChildPages = false;
        }
        RubedoMenuService.getMenu(config.rootPage, 5).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
            } else {
                me.menu={};
            }
        });
    }]);

    module.controller('TwitterController',['$scope',function($scope){
        var me = this;
        var config = $scope.blockConfig;
        angular.forEach(config, function(value, key){
            me[key] = value;
        });
        me.chrome = '';
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

    module.controller("GeoSearchResultsController",["$scope","$location","$routeParams","$compile","RubedoSearchService",
        function($scope,$location,$routeParams,$compile,RubedoSearchService){
            var me = this;
            var config = $scope.blockConfig;
            console.log(config);
            me.data = [];
            me.facets = [];
            me.activeFacets = [];
            me.activateSearch=config.activateSearch;
            me.start = 0;
            me.limit = config.pageSize ? config.pageSize : 5000;
            me.map={
                center:{
                    latitude:48.8567,
                    longitude:2.3508
                },
                zoom:config.zoom ? config.zoom : 14
            };
            me.geocoder = new google.maps.Geocoder();
            //clustering options
            me.clusterOptions={
                batchSize : 20000,
                averageCenter : false,
                gridSize : 60,
                batchSizeIE : 20000
            };
            //set initial map center
            if (config.useLocation&&navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position) {
                    me.map.center={
                        latitude:position.coords.latitude,
                        longitude:position.coords.longitude
                    };
                }, function() {
                    //handle geoloc error
                });
            } else if (config.centerAddress){
                me.geocoder.geocode({
                    'address' : config.centerAddress
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        me.map.center={
                            latitude:results[0].geometry.location.lat(),
                            longitude:results[0].geometry.location.lng()
                        };

                    }
                });

            } else if (config.centerLatitude && config.centerLongitude){
                me.map.center={
                    latitude:config.centerLatitude,
                    longitude:config.centerLongitude
                };
            }
            //map control object recieves several control methods upon map render
            me.mapControl={ };
            //map events
            me.mapEvents = {
                "bounds_changed": function (map) {
                    clearTimeout(me.mapTimer);
                    me.mapTimer = setTimeout(function() {
                        me.searchByQuery(options);
                    }, 300);
                }
            };
            //marker events and timer
            me.mapTimer = null;
            me.markerEvents = {
                click: function (gMarker, eventName, model) {
                    console.log(model);
                }
            };
            if (config.activateSearch){
                if (!config.displayMode){
                    config.displayMode="default";
                }
                me.template = "/components/webtales/rubedo-frontoffice/templates/blocks/geoSearchResults/"+config.displayMode+".html";
            } else {
                me.template = "/components/webtales/rubedo-frontoffice/templates/blocks/geoSearchResults/map.html";
            }
            var predefinedFacets = config.predefinedFacets==""?{}:JSON.parse(config.predefinedFacets);
            var facetsId = ['objectType','type','damType','userType','author','userName','lastUpdateTime','query'];
            var defaultOptions = {
                start: me.start,
                limit: me.limit,
                constrainToSite: config.constrainToSite,
                predefinedFacets: config.predefinedFacets,
                displayMode: config.displayMode,
                displayedFacets: config.displayedFacets,
                pageId: $scope.rubedo.current.page.id,
                siteId: $scope.rubedo.current.site.id
            };
            if (config.singlePage){
                defaultOptions.detailPageId = config.singlePage;
            }
            var options = angular.copy(defaultOptions);
            var parseQueryParamsToOptions = function(){
                angular.forEach($location.search(), function(queryParam, key){
                    if(typeof queryParam !== "boolean"){
                        if(key == 'taxonomies'){
                            options[key] = JSON.parse(queryParam);
                        } else {
                            if(key == 'query'){
                                me.query = queryParam;
                            }
                            options[key] = queryParam;
                        }
                    }
                });
            };
            if(predefinedFacets.query) {
                me.query = options.query = predefinedFacets.query;
                $location.search('query',me.query);
            }
            $scope.$on('$routeUpdate', function(scope, next, current) {
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                parseQueryParamsToOptions();
                me.searchByQuery(options, true);
            });
            me.checked = function(term){
                var checked = false;
                angular.forEach(me.activeTerms,function(activeTerm){
                    checked = activeTerm.term==term;
                });
                return checked;
            };
            me.disabled = function(term){
                var disabled = false;
                angular.forEach(me.notRemovableTerms,function(notRemovableTerm){
                    disabled = notRemovableTerm.term == term;
                });
            };
            me.onSubmit = function(){
                me.start = 0;
                options = angular.copy(defaultOptions);
                options.start = me.start;
                options.limit = me.limit;
                options.query = me.query;
                $location.search('query',me.query);
            };
            me.clickOnFacets =  function(facetId,term){
                var del = false;
                angular.forEach(me.activeTerms,function(activeTerm){
                    if(!del){
                        del = (activeTerm.term==term && activeTerm.facetId==facetId);
                    }
                });
                if(del){
                    if(facetsId.indexOf(facetId)==-1){
                        options.taxonomies[facetId].splice(options.taxonomies[facetId].indexOf(term),1);
                        if(options.taxonomies[facetId].length == 0){
                            delete options.taxonomies[facetId];
                        }
                        if(Object.keys(options['taxonomies']).length == 0){
                            $location.search('taxonomies',null);
                        } else {
                            $location.search('taxonomies',JSON.stringify(options.taxonomies));
                        }
                    } else if (facetId == 'query') {
                        $location.search('query',null);
                        delete options.query;
                    } else {
                        if(angular.isArray(options[facetId+'[]'])){
                            options[facetId+'[]'].splice(options[facetId+'[]'].indexOf(term),1);
                        } else {
                            delete options[facetId+'[]'];
                        }
                        if(!options[facetId+'[]'] || options[facetId+'[]'].length == 0){
                            $location.search(facetId+'[]',null)
                        } else {
                            $location.search(facetId+'[]',options[facetId+'[]']);
                        }
                    }
                } else {
                    if(facetsId.indexOf(facetId)==-1){
                        if(!options.taxonomies){
                            options.taxonomies = {};
                        }
                        if(!options.taxonomies[facetId]){
                            options.taxonomies[facetId] = [];
                        }
                        options.taxonomies[facetId].push(term);
                        $location.search('taxonomies',JSON.stringify(options.taxonomies));
                    } else {
                        if(!options[facetId+'[]']){
                            options[facetId+'[]'] = [];
                        }
                        options[facetId+'[]'].push(term);
                        $location.search(facetId+'[]',options[facetId+'[]']);
                    }
                }
                me.start = 0;
                options.start = me.start;
            };
            me.preprocessData=function(data){
                var refinedData=[ ];
                angular.forEach(data,function(item){
//                    if (item['fields.position.location.coordinates']&&item['fields.position.location.coordinates'][0]){
//                        var coords=item['fields.position.location.coordinates'][0].split(",");
//                        if (coords[0]&&coords[1]){
//                            refinedData.push({
//                                coordinates:{
//                                    latitude:coords[0],
//                                    longitude:coords[1]
//                                },
//                                id:item.id,
//                                objectType:item.objectType,
//                                title:item.title,
//                                summary:item.summary,
//                                type:item.type,
//                                author:item.authorName,
//                                markerOptions:{
//                                    title:item.title
//                                }
//                            });
//                        }
//                    }
                    refinedData.push({
                        id:item.key,
                        coordinates:{
                            latitude:item.medlat,
                            longitude:item.medlon
                        },
                        markerOptions:{
                                }
                    });
                });
                return refinedData;
            };
            me.searchByQuery = function(options){
                var bounds=me.mapControl.getGMap().getBounds();
                options.inflat=bounds.getSouthWest().lat();
                options.suplat=bounds.getNorthEast().lat();
                options.inflon=bounds.getSouthWest().lng();
                options.suplon=bounds.getNorthEast().lng();
                RubedoSearchService.searchGeo(options).then(function(response){
                    if(response.data.success){
                        me.query = response.data.results.query;
                        me.count = response.data.count;
                        me.data =  me.preprocessData(response.data.results.Aggregations.buckets);
                        me.facets = response.data.results.facets;
                        me.notRemovableTerms = [];
                        me.activeTerms = [];
                        var previousFacetId;
                        angular.forEach(response.data.results.activeFacets,function(activeFacet){
                            if(activeFacet.id != 'navigation'){
                                angular.forEach(activeFacet.terms,function(term){
                                    var newTerm = {};
                                    newTerm.term = term.term;
                                    newTerm.label = term.label;
                                    newTerm.facetId = activeFacet.id;
                                    if(previousFacetId == activeFacet.id){
                                        newTerm.operator =' '+(activeFacet.operator)+' ';
                                    } else if (previousFacetId && me.notRemovableTerms.length != 0){
                                        newTerm.operator = ', ';
                                    }
                                    if(predefinedFacets.hasOwnProperty(activeFacet.id) && predefinedFacets[activeFacet.id]==term.term){
                                        me.notRemovableTerms.push(newTerm);
                                    } else {
                                        me.activeTerms.push(newTerm);
                                    }
                                    previousFacetId = activeFacet.id;
                                });
                            }
                        });
                    }
                })
            };
            parseQueryParamsToOptions();
        }]);

    module.controller('AddThisShareController',['$scope',function($scope){
        var me = this;
        var config = $scope.blockConfig;
        me.like = config.like == 1;
        me.disposition = config.disposition;
        me.class = 'addthis_toolbox';
        if(me.like){
            if(config.disposition == 'Horizontal'){
                me.class += ' addthis_default_style';
            } else {
                me.class += ' addthis_floating_style addthis_counter_style addthis-pos';
            }
        } else {
            if(config.disposition == 'Horizontal'){
                me.class += ' addthis_default_style';
                if(config.small == 1){
                    me.class += ' addthis_32x32_style'
                }
            } else {
                me.class += ' addthis_floating_style';
                if(config.small == 0){
                    me.class += ' addthis_16x16_style addthis-pos';
                } else {
                    me.class += ' addthis_32x32_style addthis-pos'
                }
            }
        }
        me.loadAddThis = function(){
            addthis.toolbox('.addthis_toolbox');

        };
    }]);

    module.controller('MediaDownloadController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
        var me = this;
        var config = $scope.blockConfig;
        RubedoMediaService.getMediaById(config.documentId).then(function(response){
            if(response.data.success){
                me.media =  response.data.media;
            }
        });
    }]);

    module.controller('AddThisFollowController',['$scope',function($scope){
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

    module.controller('SignUpController',['$scope','RubedoUserTypesService', function($scope, RubedoUserTypesService){
        var me = this;
        var config = $scope.blockConfig;
        me.inputFields=[ ];
        $scope.fieldEntity={ };
        $scope.fieldInputMode=true;
        console.log(config);
        if (config.userType){
            RubedoUserTypesService.getUserTypeById(config.userType).then(
                function(response){
                    if (response.data.success){
                        me.userType=response.data.userType;
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"email",
                                fieldLabel:"E-mail",
                                allowBlank:false,
                                vtype:"email"
                            }
                        });
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"name",
                                fieldLabel:"Name",
                                allowBlank:false
                            }
                        });
                        me.inputFields=me.userType.fields;
                    }
                }
            );
        }
    }]);

})();
