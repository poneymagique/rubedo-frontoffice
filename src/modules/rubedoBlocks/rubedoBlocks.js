/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess', 'lrInfiniteScroll','rubedoFields','snap']);

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
        carrousel:"/components/webtales/rubedo-frontoffice/templates/blocks/carousel.html",
        imageGallery:"/components/webtales/rubedo-frontoffice/templates/blocks/gallery.html",
        damList:"/components/webtales/rubedo-frontoffice/templates/blocks/mediaList.html",
        searchResults:"/components/webtales/rubedo-frontoffice/templates/blocks/searchResults.html",
        userProfile:"/components/webtales/rubedo-frontoffice/templates/blocks/userProfile.html",
        externalMedia:"/components/webtales/rubedo-frontoffice/templates/blocks/externalMedia.html",
        searchForm:"/components/webtales/rubedo-frontoffice/templates/blocks/searchForm.html",
        breadcrumb:"/components/webtales/rubedo-frontoffice/templates/blocks/breadcrumb.html",
        languageMenu:"/components/webtales/rubedo-frontoffice/templates/blocks/languageMenu.html",
        directory:"/components/webtales/rubedo-frontoffice/templates/blocks/directory.html"

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
                        angular.element("#rubedoAuthModal").modal('hide');
                        $scope.rubedo.current.user=response.data.token.user;
                        if (response.data.token.user.rights.canEdit){
//                            snapRemote.getSnapper().then(function(snapper) {
//                                snapper.enable();
//                            });
                        }
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
            $scope.rubedo.fieldEditMode=false;
            snapRemote.close();
//            snapRemote.getSnapper().then(function(snapper) {
//                snapper.disable();
//            });
        }
    }]);

    module.controller("RichTextController",["$scope","$sce","RubedoContentsService",function($scope, $sce,RubedoContentsService){
        var me = this;
        var config = $scope.blockConfig;
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
            var facetsId = ['objectType','type','damType','userType','author','userName','lastUpdateTime','query'];
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
                me.activeTerms.forEach(function(activeTerm){
                    checked = activeTerm.term==term;
                });
                return checked;
            };
            me.disabled = function(term){
                var disabled = false;
                me.notRemovableTerms.forEach(function(notRemovableTerm){
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
                me.activeTerms.forEach(function(activeTerm){
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
        me.template = "/components/webtales/rubedo-frontoffice/templates/blocks/searchResults/"+config.displayMode+".html";
        var predefinedFacets = config.predefinedFacets==""?{}:JSON.parse(config.predefinedFacets);
        var facetsId = ['objectType','type','damType','userType','author','userName','lastUpdateTime','query'];
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
            me.activeTerms.forEach(function(activeTerm){
                checked = activeTerm.term==term;
            });
            return checked;
        };
        me.disabled = function(term){
            var disabled = false;
            me.notRemovableTerms.forEach(function(notRemovableTerm){
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
            me.activeTerms.forEach(function(activeTerm){
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

        me.searchByQuery = function(options){
            RubedoSearchService.searchUsers(options).then(function(response){
                if(response.data.success){
                    me.query = response.data.results.query;
                    me.count = response.data.count;
                    me.data =  response.data.results.data;
                    me.facets = [];
                    response.data.results.facets.forEach(function(facet){
                        if(facet.id == 'userName'){
                            me.alphabet = facet;
                        } else {
                            me.facets.push(facet);
                        }
                    });
                    console.log(response.data.results.facets);
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

})();
