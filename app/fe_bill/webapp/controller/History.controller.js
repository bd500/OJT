sap.ui.define(
    ["sap/ui/core/mvc/Controller", "../model/models", "../model/formatter"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, formatter) {
        "use strict";

        return Controller.extend("febill.controller.SideMenu", {
            formatter,
            onInit: async function () {
                var oModel = await models.getHistory();
                this.getView().setModel(oModel, "history");
                console.log(oModel);
            },
        });
    }
);
