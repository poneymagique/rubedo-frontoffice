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
        "textfield":"/components/webtales/rubedo-frontoffice/templates/fields/text.html",
        "Ext.form.field.Text":"/components/webtales/rubedo-frontoffice/templates/fields/text.html",
        "CKEField":"/components/webtales/rubedo-frontoffice/templates/fields/richText.html",
        "Rubedo.view.CKEField":"/components/webtales/rubedo-frontoffice/templates/fields/richText.html",
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
        if ($scope.fieldEntity[$scope.field.config.name]){
            me.html=$sce.trustAsHtml(jQuery.htmlClean($scope.fieldEntity[$scope.field.config.name], {
                allowedAttributes:[["style"]],
                format: true
            }));
        }
    }]);

})();