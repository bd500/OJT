sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
    "use strict";

    return BaseController.extend("febill.controller.App", {
        onInit: function () {},
        onItemSelect: function (oEvent) {
            const path = oEvent.getParameters().item.getKey();

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(path);
            // this.byId("pageContainer").to(this.getView().createId(path));
            console.log(path);
        },
    });
});
