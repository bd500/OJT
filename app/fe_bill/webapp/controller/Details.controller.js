sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("ns.items.controller.Details", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter
                    .getRoute("Details")
                    .attachPatternMatched(this._onRouteMatched, this);

                this.getView().setModel(new JSONModel(), "detailsModel");
            },

            _onRouteMatched: function (oEvent) {
                var itemId = oEvent.getParameter("arguments").itemId;
                console.log("item id: " + itemId);
                this._loadItemDetails(itemId);
            },

            _loadItemDetails: async function (itemId) {
                try {
                    const response = await fetch(`/bills/Items(${itemId})/history?$expand=*`);
                    const data = await response.json();

                    if (data && data.value && data.value.length >= 1) {
                        data.value.sort((a, b) => new Date(b.date) - new Date(a.date));

                        // Format the dates
                        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' };
                        data.value.forEach(item => {
                            const formattedDate = new Date(item.date).toLocaleString('en-US', options);
                            item.dateFormatted = formattedDate.replace(/[,]/g, ''); // Remove the comma
                        });
                    }

                    this.getView().getModel("detailsModel").setData(data);

                    // Explicitly update the bindings
                    this.getView().getModel("detailsModel").updateBindings();

                    console.log(this.getView().getModel("detailsModel"));
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            },

        });
    }
);
