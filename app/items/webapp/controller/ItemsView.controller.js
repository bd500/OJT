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

                    const data = {
                        name: itemName,
                        price: parseFloat(itemPrice),
                        stock: parseInt(itemStock, 10)
                    };

                    const response = await fetch("/bills/Items", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });

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
            onUpdateCancel: function () {
                if (this.oUpdateDialog) {
                    this.oUpdateDialog.close();
                }
            },

            onUpdateDialog: async function (oEvent) {
                this.oUpdateDialog = this.byId("updateDialog");

                if (!this.oUpdateDialog) {
                    try {
                        // If the dialog doesn't exist, create it asynchronously
                        console.log("Creating dialog...");
                        this.oUpdateDialog = await sap.ui.xmlfragment({
                            fragmentName: "ns.items.view.UpdateDialog",
                            controller: this
                        });
                        this.getView().addDependent(this.oUpdateDialog);
                        console.log("Dialog created.");
                    } catch (error) {
                        console.error("Error creating dialog:", error);
                        return; // Stop execution if an error occurs during dialog creation
                    }
                }

                var oItem = oEvent.getSource().getBindingContext().getObject();

                // Set the existing data to the dialog fields
                this.oUpdateDialog.getContent().forEach(function (control) {
                    var controlId = control.getId();
                    var propertyName = controlId.replace("update", "").toLowerCase();
                    console.log('item: ' + propertyName);

                    // Check the type of the control
                    if (control instanceof sap.m.Input) {
                        // Assuming it's an Input control, set the value property
                        control.setValue(oItem[propertyName]);
                    } else if (control instanceof sap.m.Text) {
                        // Assuming it's a Text control, set the text property
                        control.setText(oItem[propertyName]);
                    }
                    // Add more conditions if you have other types of controls
                });

                // Open the dialog
                console.log("Dialog before opening:", this.oUpdateDialog);
                this.oUpdateDialog.open();
            },




            onUpdateSave: async function () {
                var oUpdateDialog = this.byId("updateDialog");

                // Close the dialog
                if (oUpdateDialog) {
                    oUpdateDialog.close();
                }

                var oItem = this._getUpdatedItem();
                try {
                    const responseHistory = await fetch(`/bills/Items/${oItem.ID}`, {
                        method: 'PATCH',  // You might need to adjust this based on your backend API
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: oItem.name,
                            price: parseFloat(oItem.price),
                            stock: parseInt(oItem.stock),  // Assuming stock is the quantity to update
                        }),
                    });

                    if (responseHistory.ok) {
                        // Successful update of ItemHistory
                        console.log('ItemHistory updated successfully');
                    } else {
                        const errorText = await responseHistory.text();
                        console.error("Error updating ItemHistory: " + errorText);
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    alert("An unexpected error occurred while updating ItemHistory.");
                }
            },

            _getUpdatedItem: function () {
                var oUpdateDialog = this.byId("updateDialog");

                var oItem = oUpdateDialog.getContent().reduce(function (acc, control) {
                    var controlId = control.getId();
                    var propertyName = controlId.replace("update", "").toLowerCase();

                    if (control instanceof sap.m.Input) {
                        acc[propertyName] = control.getValue();
                    } else if (control instanceof sap.m.Text) {
                        acc[propertyName] = control.getText();
                    }

                    return acc;
                }, {});
                    
                return oItem;
            },

        });
    });
