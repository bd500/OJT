sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/MessageBox",
    "sap/m/Button",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Dialog, Button, MessageBox) {
        "use strict";

        return Controller.extend("ns.items.controller.ItemsView", {
            onInit: function () {
            },
            onPress: function (oEvent) {
                var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // Navigate to details view and pass the item ID
                oRouter.navTo("Details", {
                    itemId: oSelectedItem.ID
                });
            },
            // --------------- search
            onSearch: function (oEvent) {
                // get the search value
            },

            // create ----------------------------------------------------
            onOpenAddDialog: function () {
                this.getView().byId("OpenDialog").open();
            },
            onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            onCreate: async function () {
                try {
                    // Get data from input fields
                    const itemName = this.byId("idItemName").getValue();
                    const itemPrice = this.byId("idPrice").getValue();
                    const itemStock = this.byId("idStock").getValue();

                    // Prepare data for the request
                    const data = {
                        name: itemName,
                        price: parseFloat(itemPrice),
                        stock: parseInt(itemStock, 10)
                    };

                    // Fetch API POST request
                    const response = await fetch("/bills/Items", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json", // Make sure to set the content type
                        },
                        body: JSON.stringify(data), // Convert data to JSON format
                    });

                    // Check if the request was successful (status code 2xx)
                    if (response.ok) {
                        // Item created successfully
                        new sap.m.MessageToast.show("Item added successfully!");
                        // Refresh the table data
                        this.refreshTable();
                    } else {
                        // Handle error
                        const errorText = await response.text();
                        alert("Error adding item: " + errorText);
                    }
                } catch (error) {
                    // Handle any unexpected errors
                    console.error("Error:", error);
                    alert("An unexpected error occurred.");
                }
                this.getView().byId("OpenDialog").close();
            },

            // delete -------------------------------------------
            onDeleteConfirmation: function (oEvent) {
                var that = this;

                // Get the selected item
                var oItem = oEvent.getSource().getBindingContext().getObject();

                // Ensure that MessageBox is loaded before using it
                sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                    MessageBox.confirm("Are you sure you want to delete this item?", {
                        title: "Confirm Deletion",
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                // User clicked OK, perform deletion logic
                                that.onDelete(oItem);
                            }
                        }
                    });
                });
            },


            onDelete: async function (oItem) {
                try {
                    const response = await fetch(`/bills/Items/${oItem.ID}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            // Add any other headers if needed
                        },
                    });

                    if (response.ok) {
                        // Successful deletion
                        // Update your UI or perform any other actions as needed
                        new sap.m.MessageToast.show('Item deleted successfully');
                        // Refresh the table data
                        this.refreshTable();
                    } else {
                        // Handle error
                        console.error(`Error deleting item: ${response.status} - ${response.statusText}`);
                    }
                } catch (error) {
                    // Handle fetch error
                    console.error('Fetch error:', error);
                }
            },

            // Function to refresh the table data
            refreshTable: function () {
                var oTable = this.byId("table");
                oTable.getBinding("items").refresh();
            },
            // update ------------------------------------------

        });
    });
