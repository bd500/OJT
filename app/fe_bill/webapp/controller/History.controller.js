sap.ui.define(
    ["sap/ui/core/mvc/Controller", "../model/models"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models) {
        "use strict";

        return Controller.extend("febill.controller.SideMenu", {
            onInit: async function () {
                var oModel = await models.getHistory();
                var oView = this.getView();
                oView.setModel(oModel, "history");
            },
        });
    }
);
