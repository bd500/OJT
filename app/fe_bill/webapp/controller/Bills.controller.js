sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/models",
        "sap/ui/model/json/JSONModel",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel) {
        "use strict";

        return Controller.extend("febill.controller.Bills", {
            onInit: async function () {
                var oModel = new JSONModel(await models.getBills());
                var oView = this.getView();
                console.log(oModel);
                oView.setModel(oModel.value, "bills");
            },
        });
    }
);
