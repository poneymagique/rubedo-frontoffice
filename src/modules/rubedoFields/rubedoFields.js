/**
 * Module that manages fields for display and edit
 */
(function(){
    var module = angular.module('rubedoFields',[]);

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

})();