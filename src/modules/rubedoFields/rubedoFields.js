/**
 * Module that manages fields for display and edit
 */
(function(){
    var module = angular.module('rubedoFields',['xeditable','checklist-model','ngCkeditor','google-maps']);

    module.run(function(editableOptions ) {
        editableOptions.theme = 'bs3';
    });
    var fieldsConfig={
        "textarea":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "textareafield":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "Ext.form.field.TextArea":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "title":"/components/webtales/rubedo-frontoffice/templates/fields/title.html",
        "datefield":"/components/webtales/rubedo-frontoffice/templates/fields/date.html",
        "Ext.form.field.Date":"/components/webtales/rubedo-frontoffice/templates/fields/date.html",
        "Ext.form.field.Time":"/components/webtales/rubedo-frontoffice/templates/fields/time.html",
        "timefield":"/components/webtales/rubedo-frontoffice/templates/fields/time.html",
        "Ext.form.field.Number":"/components/webtales/rubedo-frontoffice/templates/fields/number.html",
        "numberfield":"/components/webtales/rubedo-frontoffice/templates/fields/number.html",
        "slider":"/components/webtales/rubedo-frontoffice/templates/fields/slider.html",
        "Ext.slider.Single":"/components/webtales/rubedo-frontoffice/templates/fields/slider.html",
        "textfield":"/components/webtales/rubedo-frontoffice/templates/fields/text.html",
        "Ext.form.field.Text":"/components/webtales/rubedo-frontoffice/templates/fields/text.html",
        "CKEField":"/components/webtales/rubedo-frontoffice/templates/fields/richText.html",
        "Rubedo.view.CKEField":"/components/webtales/rubedo-frontoffice/templates/fields/richText.html",
        "externalMediaField":"/components/webtales/rubedo-frontoffice/templates/fields/externalMedia.html",
        "Rubedo.view.externalMediaField":"/components/webtales/rubedo-frontoffice/templates/fields/externalMedia.html",
        "radiogroup":"/components/webtales/rubedo-frontoffice/templates/fields/radioGroup.html",
        "Ext.form.RadioGroup":"/components/webtales/rubedo-frontoffice/templates/fields/radioGroup.html",
        "checkboxgroup":"/components/webtales/rubedo-frontoffice/templates/fields/checkboxGroup.html",
        "Ext.form.CheckboxGroup":"/components/webtales/rubedo-frontoffice/templates/fields/checkboxGroup.html",
        "combobox":"/components/webtales/rubedo-frontoffice/templates/fields/combobox.html",
        "Ext.form.field.ComboBox":"/components/webtales/rubedo-frontoffice/templates/fields/combobox.html",
        "localiserField":"/components/webtales/rubedo-frontoffice/templates/fields/localiserField.html",
        "Rubedo.view.localiserField":"/components/webtales/rubedo-frontoffice/templates/fields/localiserField.html",
        "fieldNotFound":"/components/webtales/rubedo-frontoffice/templates/fields/fieldNotFound.html"
    };

    //service for resolving field templates
    module.factory('RubedoFieldTemplateResolver', function() {
        var serviceInstance={};
        serviceInstance.getTemplateByType=function(type){
            if (fieldsConfig[type]){
                return (fieldsConfig[type]);
            } else {
                return (fieldsConfig.fieldNotFound);
            }
        };
        return serviceInstance;
    });

    //generic field directive
    module.directive("rubedoField",function(){
        return {
            restrict:"E",
            templateUrl:"/components/webtales/rubedo-frontoffice/templates/rubedoField.html"
        };
    });

    //field controllers
    module.controller("RTEFieldController",['$scope','$sce',function($scope,$sce){
        var me=this;
        var CKEMode=$scope.field.config.CKETBConfig;
        var myTBConfig=[
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'NewPage', 'Preview', 'Print', '-', 'Templates' ] },
            { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo',"Source"  ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },


            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},


            { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
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

        $scope.$watch("fieldEntity."+$scope.field.config.name, function(newValue) {
                me.html=$sce.trustAsHtml(jQuery.htmlClean(newValue, {
                    allowedAttributes:[["style"]],
                    format: true
                }));
        });
    }]);

    module.controller("ExternalMediaFieldController",['$scope','$http','$sce',function($scope,$http,$sce){
        var me=this;
        var myValue=$scope.fieldEntity[$scope.field.config.name];
        if ((myValue)&&(myValue.url)){
            var url = "http://iframe.ly/api/oembed?callback=JSON_CALLBACK&url="+encodeURIComponent(myValue.url);
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

})();