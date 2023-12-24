sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("febill.controller.SideMenu", {
            onInit: function () {},
            onItemSelect: function (oEvent) {
                const path = oEvent.getParameters().item.getKey();
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo(path);
                console.log(path);
            },
        });
    }
);
