sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
    "use strict";

    return BaseController.extend("febill.controller.App", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this);
        },
        onItemSelect: function (oEvent) {
            const path = oEvent.getParameters().item.getKey();

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(path);
            // console.log(path);
        },
        onRoutePatternMatched: function (oEvent) {
            const sRouteName = oEvent.getParameters("name");
            const oSideNav = this.byId("sideNav");
            oSideNav.setSelectedKey(sRouteName.name);
        },
    });
});
