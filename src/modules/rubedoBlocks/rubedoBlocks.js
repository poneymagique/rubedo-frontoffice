/**
 * Module that manages blocks
 */
(function(){
    var module = angular.module('rubedoBlocks',['rubedoDataAccess', 'lrInfiniteScroll','rubedoFields','snap']);


    module.config(function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
        module.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
    });

    var themePath="/theme/"+window.rubedoConfig.siteTheme;

    var blocksConfig = {
        "image": {
            "template": "/templates/blocks/image.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ImageController.js"]
        },
        "blockNotFound": {
            "template": "/templates/blocks/blockNotFound.html"
        },
        "navigation": {
            "template": "/templates/blocks/navigation.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MenuController.js"]
        },
        "verticalNavigation": {
            "template": "/templates/blocks/verticalNavigation.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MenuController.js"]
        },
        "contentList": {
            "template": "/templates/blocks/contentList.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ContentListController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"]
        },
        "authentication": {
            "template": "/templates/blocks/authentication.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/AuthenticationController.js"]
        },
        "simpleText": {
            "template": "/templates/blocks/simpleText.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/RichTextController.js"]
        },
        "richText": {
            "template": "/templates/blocks/richText.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/RichTextController.js"]
        },
        "contentDetail": {
            "template": "/templates/blocks/contentDetail.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ContentDetailController.js","/src/modules/rubedoBlocks/directives/DisqusDirective.js"]
        },
        "calendar": {
            "template": "/templates/blocks/calendar.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/CalendarController.js"],
            "externalDependencies":['/components/jquery/fullCalendar/lib/moment.min.js','/components/jquery/fullCalendar/lib/jquery-ui.custom.min.js','/components/jquery/fullCalendar/fullcalendar.min.js','/components/jquery/fullCalendar/lang/en-gb.js','/components/jquery/fullCalendar/lang/fr.js']
        },
        "development": {
            "template": "/templates/blocks/development.html"
        },
        "customTemplate": {
            "template": "/templates/blocks/customTemplate.html"
        },
        "carrousel": {
            "template": "/templates/blocks/carousel.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/CarouselController.js"],
            "externalDependencies":['/components/OwlFonk/OwlCarousel/owl-carousel/owl.carousel.min.js']
        },
        "imageGallery": {
            "template": "/templates/blocks/gallery.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/GalleryController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"]
        },
        "damList": {
            "template": "/templates/blocks/mediaList.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MediaListController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"]
        },
        "searchResults": {
            "template": "/templates/blocks/searchResults.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/SearchResultsController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"]
        },
        "userProfile": {
            "template": "/templates/blocks/userProfile.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/UserProfileController.js"]
        },
        "externalMedia": {
            "template": "/templates/blocks/externalMedia.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ExternalMediaController.js"]
        },
        "searchForm": {
            "template": "/templates/blocks/searchForm.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/SearchFormController.js"]
        },
        "breadcrumb": {
            "template": "/templates/blocks/breadcrumb.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/BreadcrumbController.js"]
        },
        "languageMenu": {
            "template": "/templates/blocks/languageMenu.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/LanguageMenuController.js"]
        },
        "directory": {
            "template": "/templates/blocks/directory.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/DirectoryController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"]
        },
        "audio": {
            "template": "/templates/blocks/audio.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/AudioController.js"]
        },
        "video": {
            "template": "/templates/blocks/video.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/VideoController.js"]
        },
        "siteMap": {
            "template": "/templates/blocks/siteMap.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/SiteMapController.js"]
        },
        "twitter": {
            "template": "/templates/blocks/twitter.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/TwitterController.js"]
        },
        "geoSearchResults": {
            "template": "/templates/blocks/geoSearchResults.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/GeoSearchResultsController.js"]
        },
        "addThis": {
            "template": "/templates/blocks/addThisShare.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/AddThisShareController.js"],
            "externalDependencies":['//s7.addthis.com/js/300/addthis_widget.js']
        },
        "resource": {
            "template": "/templates/blocks/mediaDownload.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/RichTextController.js","/src/modules/rubedoBlocks/controllers/MediaDowloadController.js"]
        },
        "addThisFollow": {
            "template": "/templates/blocks/addThisFollow.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/AddThisFollowController.js"],
            "externalDependencies":['//s7.addthis.com/js/300/addthis_widget.js']
        },
        "signUp": {
            "template": "/templates/blocks/signUp.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/RichTextController.js","/src/modules/rubedoBlocks/controllers/SignUpController.js"]
        },
        "imageMap": {
            "template": "/templates/blocks/imageMap.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ImageMapController.js"],
            "externalDependencies":['/components/stowball/jQuery-rwdImageMaps/jquery.rwdImageMaps.min.js']
        },
        "contact": {
            "template": "/templates/blocks/contact.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ContactController.js"]
        },
        "protectedResource": {
            "template": "/templates/blocks/mediaProtectedDownload.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/RichTextController.js","/src/modules/rubedoBlocks/controllers/MediaProtectedDownloadController.js"]
        },
        "mailingList": {
            "template": "/templates/blocks/mailingListSuscribe.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MailingListSubscribeController.js"]
        },
        "unsubscribe": {
            "template": "/templates/blocks/mailingListUnsuscribe.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MailingListUnsubscribeController.js"]
        },
        "d3Script": {
            "template": "/templates/blocks/d3Script.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/D3ScriptController.js"],
            "externalDependencies":['/components/mbostock/d3/d3.min.js']
        }
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
                return (themePath+blocksConfig.customTemplate.template);
            } else if (bType=="navigation"&&bConfig.style&&bConfig.style=="Vertical") {
                return (themePath+blocksConfig.verticalNavigation.template);
            } else if (blocksConfig[bType]){
                return (themePath+blocksConfig[bType].template);
            } else {
                return (themePath+blocksConfig.blockNotFound.template);
            }
        };
        return serviceInstance;
    });

    module.factory('RubedoBlockDependencyResolver', function() {
        var serviceInstance={};
        serviceInstance.getDependencies=function(bTypeArray){
            var dependenciesArray=[ ];
            angular.forEach(bTypeArray,function(bType){
                if (blocksConfig[bType]){
                    if (blocksConfig[bType].externalDependencies){
                        angular.forEach(blocksConfig[bType].externalDependencies,function(dependency){
                            if (dependenciesArray.indexOf(dependency)<0){
                                dependenciesArray.push(dependency);
                            }
                        });
                    }
                    if (blocksConfig[bType].internalDependencies){
                        angular.forEach(blocksConfig[bType].internalDependencies,function(dependency){
                            var dependencyPath=themePath+dependency;
                            if (dependenciesArray.indexOf(dependencyPath)<0){
                                dependenciesArray.push(dependencyPath);
                            }
                        });
                    }
                }
            });
            return (dependenciesArray);
        };
        return serviceInstance;
    });

    module.factory('RubedoPageComponents', function() {
        var serviceInstance={};
        serviceInstance.getRowTemplate=function(customTemplate){
            if (customTemplate){
                return(themePath+"/templates/customRow.html");
            }  else {
                return(themePath+"/templates/row.html");
            }
        };
        serviceInstance.getColumnTemplate=function(customTemplate){
            if (customTemplate){
                return(themePath+"/templates/customColumn.html");
            }  else {
                return(themePath+"/templates/column.html");
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
            templateUrl:themePath+"/templates/rubedoBlock.html"
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

    module.directive('showtab',
        function () {
            return {
                link: function (scope, element, attrs) {
                    element.click(function(e) {
                        e.preventDefault();
                        $(element).tab('show');
                    });
                }
            };
        });

})();