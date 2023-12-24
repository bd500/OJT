sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ns.items.controller.Details", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Details").attachPatternMatched(this._onRouteMatched, this);

            this.getView().setModel(new JSONModel(), "detailsModel");
        },

        _onRouteMatched: function (oEvent) {
            var itemId = oEvent.getParameter("arguments").itemId;
            console.log('item id: ' + itemId);
            this._loadItemDetails(itemId);
        },

        _loadItemDetails: async function (itemId) {
            try {
                const response = await fetch(`/bills/Items(${itemId})/history?$expand=*`);
                const data = await response.json();

                this.getView().getModel("detailsModel").setData(data);
                console.log(this.getView().getModel("detailsModel"));
            } catch (error) {
                console.error('Fetch error:', error);
            }
        },

    });
});
