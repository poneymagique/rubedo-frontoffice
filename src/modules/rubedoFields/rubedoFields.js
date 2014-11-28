/**
 * Module that manages fields for display and edit
 */
(function(){
    var moduleDependencies=['rubedoDataAccess','xeditable','checklist-model','ckeditor'];
    if (typeof(google)!="undefined"){
        moduleDependencies.push('google-maps');
    }
    var module = angular.module('rubedoFields',moduleDependencies);

    module.run(function(editableOptions ) {
        editableOptions.theme = 'bs3';
    });

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
    
    fieldsConfig={
        "textarea":"/templates/fields/textarea.html",
        "textareafield":"/templates/fields/textarea.html",
        "Ext.form.field.TextArea":"/templates/fields/textarea.html",
        "title":"/templates/fields/title.html",
        "datefield":"/templates/fields/date.html",
        "Ext.form.field.Date":"/templates/fields/date.html",
        "Ext.form.field.Time":"/templates/fields/time.html",
        "timefield":"/templates/fields/time.html",
        "Ext.form.field.Number":"/templates/fields/number.html",
        "numberfield":"/templates/fields/number.html",
        "slider":"/templates/fields/slider.html",
        "Ext.slider.Single":"/templates/fields/slider.html",
        "textfield":"/templates/fields/text.html",
        "Ext.form.field.Text":"/templates/fields/text.html",
        "CKEField":"/templates/fields/richText.html",
        "Rubedo.view.CKEField":"/templates/fields/richText.html",
        "externalMediaField":"/templates/fields/externalMedia.html",
        "Rubedo.view.externalMediaField":"/templates/fields/externalMedia.html",
        "radiogroup":"/templates/fields/radioGroup.html",
        "Ext.form.RadioGroup":"/templates/fields/radioGroup.html",
        "checkboxgroup":"/templates/fields/checkboxGroup.html",
        "Ext.form.CheckboxGroup":"/templates/fields/checkboxGroup.html",
        "combobox":"/templates/fields/combobox.html",
        "Ext.form.field.ComboBox":"/templates/fields/combobox.html",
        "localiserField":"/templates/fields/localiser.html",
        "Rubedo.view.localiserField":"/templates/fields/localiser.html",
        "treepicker":"/templates/fields/pageLink.html",
        "Ext.ux.TreePicker":"/templates/fields/pageLink.html",
        "checkboxfield":"/templates/fields/checkbox.html",
        "Ext.form.field.Checkbox":"/templates/fields/checkbox.html",
        "ImagePickerField":"/templates/fields/media.html",
        "Rubedo.view.ImagePickerField":"/templates/fields/media.html",
        "userPhoto":"/templates/fields/userPhoto.html",
        "fieldNotFound":"/templates/fields/fieldNotFound.html"
    };

    inputFieldsConfig={
        "textfield":"/templates/inputFields/text.html",
        "Ext.form.field.Text":"/templates/inputFields/text.html",
        "Ext.form.field.Number":"/templates/inputFields/number.html",
        "numberfield":"/templates/inputFields/number.html",
        "textarea":"/templates/inputFields/textarea.html",
        "textareafield":"/templates/inputFields/textarea.html",
        "Ext.form.field.TextArea":"/templates/inputFields/textarea.html",
        "CKEField":"/templates/inputFields/richText.html",
        "Rubedo.view.CKEField":"/templates/inputFields/richText.html",
        "checkboxfield":"/templates/inputFields/checkbox.html",
        "Ext.form.field.Checkbox":"/templates/inputFields/checkbox.html",
        "combobox":"/templates/inputFields/combobox.html",
        "Ext.form.field.ComboBox":"/templates/inputFields/combobox.html",
        "radiogroup":"/templates/inputFields/radioGroup.html",
        "Ext.form.RadioGroup":"/templates/inputFields/radioGroup.html"
    };

    //service for resolving field templates
    module.factory('RubedoFieldTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplateByType=function(type){
            if (fieldsConfig[type]){
                return (themePath+fieldsConfig[type]);
            } else {
                return (themePath+fieldsConfig.fieldNotFound);
            }
        };
        serviceInstance.getInputTemplateByType=function(type){
            if (inputFieldsConfig[type]){
                return (themePath+inputFieldsConfig[type]);
            } else {
                return null;
            }
        };
        return serviceInstance;
    });

    //generic field directive
    module.directive("rubedoField",function(){
        return {
            restrict:"E",
            scope:true,
            templateUrl:themePath+"/templates/rubedoField.html",
            link: function ( scope, element, attrs ) {
                var el;
                attrs.$observe( 'field', function ( field ) {
                    if ( angular.isDefined( field ) ) {
                        scope.field=angular.fromJson(field);
                    }
                });
            }

        };
    });

    module.directive('rubedoPageLink',["RubedoPagesService",function (RubedoPagesService) {
            return {
                link: function (scope, element, attrs) {
                    RubedoPagesService.getPageById(attrs.rubedoPageLink).then(function(response){
                        if (response.data.success){
                            attrs.$set("href",response.data.url);
                        }
                    });


                }
            };
        }]);
    //field controllers
    module.controller("RTEFieldController",['$scope','$sce',function($scope,$sce){
        var me=this;
        var CKEMode=$scope.field.config.CKETBConfig;
        var myTBConfig=[
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo',"Source"  ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
            '/',
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
            { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
            '/',
            { name: 'colors', items: [ 'TextColor', '-','BGColor' ] },
            { name: 'tools', items: [ 'Maximize', '-','ShowBlocks' ] },
            { name: 'links', items: [ 'Link', "Rubedolink", 'Unlink','-','Anchor' ] },
            { name: 'insert', items: [ 'Image',  '-', 'Table', 'HorizontalRule', 'SpecialChar', 'PageBreak' ] }
        ];
        if (CKEMode=="Standard"){
            myTBConfig=[
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                { name: 'colors', items: [ 'TextColor','BGColor','-', 'Scayt' ] },
                '/',
                { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
                { name: 'insert', items: [ 'Image',  '-', 'Table', 'SpecialChar', 'PageBreak', 'Link', "Rubedolink", 'Unlink'] },
                { name: 'managing', items: [ 'Maximize','-','Undo', 'Redo', "Source"  ] }
            ];
        } else if (CKEMode=="Basic"){
            myTBConfig=[
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline','Strike', '-', 'RemoveFormat' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-',  'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock','-','Image']},
                { name: 'colors', items: [ 'TextColor','BGColor' ,'-', 'Scayt'] },
                { name: 'styles', items: [ 'Font', 'FontSize' ] }
            ];
        }
        $scope.editorOptions={
            toolbar:  myTBConfig,
            allowedContent:true,
            language:$scope.fieldLanguage,
            extraPlugins:'rubedolink',
            filebrowserImageBrowseUrl:"/backoffice/ext-finder?type=Image",
            filebrowserImageUploadUrl:null
        };
        me.isCKEReady=false;
        $scope.setCKEIsReady=function( ){
            setTimeout(function(){me.isCKEReady=true;},200);

        };
        if (!$scope.fieldInputMode){
            $scope.$watch("fieldEntity."+$scope.field.config.name, function(newValue) {
                if(!$scope.fieldEditMode){
                    if (!newValue){
                        newValue="";
                    }

                    me.html=jQuery.htmlClean(newValue, {
                        allowedAttributes:[["style"],["rubedo-page-link"]],
                        format: true
                    });

                } else if ($scope.fieldEditMode&&!me.html){
                    if (!newValue){
                        newValue="";
                    }
                    me.html=$sce.trustAsHtml(jQuery.htmlClean(newValue, {
                        allowedAttributes:[["style"],["rubedo-page-link"]],
                        format: true
                    }));
                }
                if ($scope.fieldEditMode&&me.isCKEReady){
                    $scope.registerFieldEditChanges();
                }
            });
        }
    }]);

    module.controller("ExternalMediaFieldController",['$scope','$http','$sce',function($scope,$http,$sce){
        var me=this;
        var myValue=$scope.fieldEntity[$scope.field.config.name];
        if ((myValue)&&(myValue.url)){
            var url = "http://iframe.ly/api/oembed?callback=JSON_CALLBACK&url="+encodeURIComponent(myValue.url);
            if ($scope.rubedo.current.site.iframelyKey){
                url=url+"&api_key="+$scope.rubedo.current.site.iframelyKey;
            }
            $http.jsonp(url).success(function(response){
                    me.html=$sce.trustAsHtml(response.html);
                });


        }
    }]);

    module.controller("RadioGroupController",['$scope',function($scope){
        var me=this;
        var items=$scope.field.config.items;
        var itemsObj={};
        angular.forEach(items,function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.options=itemsObj;
    }]);

    module.controller("CheckboxGroupController",['$scope',function($scope){
        var me=this;
        var items=$scope.field.config.items;
        var itemsObj={};
        if (!angular.isArray($scope.fieldEntity[$scope.field.config.name][$scope.field.config.name])){
            $scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]];
            $scope.$watch('fieldEntity.'+$scope.field.config.name+'.'+$scope.field.config.name,function(changedValue){
                if (!angular.isArray($scope.fieldEntity[$scope.field.config.name][$scope.field.config.name])){
                    $scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name][$scope.field.config.name]];
                }
            });
        }
        angular.forEach(items,function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.displayValue=function(value){
          var result=[];
          angular.forEach(value,function(item){
              result.push(itemsObj[item]);
          });
         return result.join(", ");
        };
    }]);

    module.controller("ComboboxController",['$scope',function($scope){
        var me=this;
        if (!$scope.field.store){
            $scope.field.store=$scope.field.config.store;
        }
        var items=$scope.field.store.data;
        var itemsObj={};
        if (!angular.isArray($scope.fieldEntity[$scope.field.config.name])&&$scope.field.config.multiSelect){
            $scope.fieldEntity[$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name]];
            $scope.$watch('fieldEntity.'+$scope.field.config.name,function(changedValue){
                if (!angular.isArray($scope.fieldEntity[$scope.field.config.name])){
                    $scope.fieldEntity[$scope.field.config.name]=[$scope.fieldEntity[$scope.field.config.name]];
                }
            });
        }
        angular.forEach(items,function(item){
            itemsObj[item.valeur]=item.nom;
        });
        me.displayValue=function(value){
            if ($scope.field.config.multiSelect){
                var result=[];
                angular.forEach(value,function(item){
                    result.push(itemsObj[item]);
                });
                return result.join(", ");
            } else {
                return itemsObj[value];
            }
        };
    }]);

    module.controller("LocaliserFieldController",["$scope",function($scope){
        var me=this;
        me.map={
            center:{
                latitude:48.8567,
                longitude:2.3508
            },
            zoom:4
        };
        $scope.$watch("fieldEntity."+$scope.field.config.name, function(newValue){
            if (newValue.lat&&newValue.lon){
                me.map.center={
                    latitude:newValue.lat,
                    longitude:newValue.lon
                };
                me.map.zoom=14;
                me.positionMarker={
                    coords:{
                        latitude:newValue.lat,
                        longitude:newValue.lon
                    }
                };
                if (newValue.address){
                    me.positionMarker.label=newValue.address;
                }
            } else {
                me.positionMarker=null;
            }
        });
    }]);

    module.controller("PageLinkController",["$scope","RubedoPagesService",function($scope,RubedoPagesService){
        var me=this;
        var pageId=$scope.fieldEntity[$scope.field.config.name];
        if (pageId){
            RubedoPagesService.getPageById(pageId).then(
                function(response){
                    if (response.data.success){
                        me.pageUrl=response.data.url;
                        me.pageTitle=response.data.title;
                    }
                }
            );
        }
    }]);

    module.controller("MediaFieldController",["$scope","RubedoMediaService",function($scope,RubedoMediaService){
        var me=this;
        var mediaId=$scope.fieldEntity[$scope.field.config.name];
        me.displayMedia=function(){
            if (me.media&&me.media.originalFileId){
                switch(me.media.mainFileType) {
                    case "Image":
                        me.fileTypeTemplate=themePath+"/templates/fields/media/image.html";
                        break;
                    case "Document":
                        me.fileTypeTemplate=themePath+"/templates/fields/media/document.html";
                        break;
                    case "Audio":
                        me.jwSettings={
                            primary:"flash",
                            height:40,
                            width:"100%",
                            file:me.media.url
                        };
                        me.fileTypeTemplate=themePath+"/templates/fields/media/audio.html";
                        setTimeout(function(){jwplayer("audio"+me.media.originalFileId).setup(me.jwSettings);}, 200);
                        break;
                    case "video":
                        me.jwSettings={
                            file:me.media.url
                        };
                        me.fileTypeTemplate=themePath+"/templates/fields/media/video.html";
                        setTimeout(function(){jwplayer("video"+me.media.originalFileId).setup(me.jwSettings);}, 200);
                        break;
                    default:
                        me.fileTypeTemplate=themePath+"/templates/fields/media/fieldNotFound.html";
                }
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

    module.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    module.controller("UserPhotoFieldController",["$scope","RubedoUsersService",function($scope,RubedoUsersService){
        var me=this;
        me.submitPhoto=function(){
            if (me.photoFile){
                RubedoUsersService.changeUserPhoto($scope.rubedo.current.user.id, me.photoFile).then(
                    function(response){
                        if (response.data.success){
                            $scope.userPhotoUrl=response.data.photoUrl;
                        } else {
                            console.log(response);
                        }
                    },
                    function(response){
                        console.log(response);
                    }
                );
            }

        }

    }]);

})();