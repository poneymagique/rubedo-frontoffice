/**
 * Module that manages fields for display and edit
 */
(function(){
    var module = angular.module('rubedoFields',[]);

    var fieldsConfig={
        "textarea":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "textareafield":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "Ext.form.field.TextArea":"/components/webtales/rubedo-frontoffice/templates/fields/textarea.html",
        "fieldNotFound":"/components/webtales/rubedo-frontoffice/templates/fields/fieldNotFound.html"
    };

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

})();