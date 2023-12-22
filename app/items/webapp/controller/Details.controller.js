sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ns.items.controller.Details", {
        onInit: function () {
            // Get the router and attach the route matched event
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Details").attachPatternMatched(this._onRouteMatched, this);

            // Create a JSON model for binding
            this.getView().setModel(new JSONModel(), "detailsModel");
        },

        _onRouteMatched: function (oEvent) {
            // Get the item ID from the route
            var itemId = oEvent.getParameter("arguments").itemId;
            console.log('item id: ' + itemId);
            // Fetch data for the specified item ID and bind to the view
            this._loadItemDetails(itemId);
        },

        _loadItemDetails: async function (itemId) {
            try {
                // Fetch item details using the Fetch API
                const response = await fetch(`/bills/Items/${itemId}`);
                const data = await response.json();
                console.log('resdata: ' + data.ID);

                // Update the JSON model with the fetched data
                this.getView().getModel("detailsModel").setData(data);
                console.log(this.getView().getModel("detailsModel"));
            } catch (error) {
                // Handle fetch error
                console.error('Fetch error:', error);
            }
        }
    });
});
