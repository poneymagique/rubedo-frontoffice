/**
 * Module that manages fields for display and edit
 */
(function(){
    var module = angular.module('rubedoFields',['xeditable','checklist-model']);

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
        var myValue=$scope.fieldEntity[$scope.field.config.name];
        if (myValue){
            me.html=$sce.trustAsHtml(jQuery.htmlClean(myValue, {
                allowedAttributes:[["style"]],
                format: true
            }));
        }
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
        items.forEach(function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.options=itemsObj;
    }]);

    module.controller("CheckboxGroupController",['$scope',function($scope){
        var me=this;
        var items=$scope.field.config.items;
        var itemsObj={};
        items.forEach(function(item){
            itemsObj[item.inputValue]=item.boxLabel;
        });
        me.displayValue=function(value){
          var result=[];
          value.forEach(function(item){
              result.push(itemsObj[item]);
          });
         return result.join(", ");
        };
    }]);

})();