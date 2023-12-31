sap.ui.define(
    ["sap/ui/core/mvc/Controller", "../model/formatter", "../model/models"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, models) {
        "use strict";

        return Controller.extend("ns.items.controller.ItemsView", {
            formatter: formatter,
            onInit: async function () {
                const oItemsModel = await models.getItems();
                console.log(oItemsModel);
                this.getView().setModel(oItemsModel, "items");
            },
            onPress: function (oEvent) {
                var oSelectedItem = oEvent
                    .getSource()
                    .getBindingContext("items")
                    .getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Details", {
                    itemId: oSelectedItem.ID,
                });
            },
            // --------------- search
            onSearch: function (oEvent) {},

            // create ----------------------------------------------------
            onOpenAddDialog: function () {
                this.getView().byId("OpenDialog").open();
            },
            onCancelDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },

            onCreate: async function () {
                try {
                    const itemName = this.byId("idItemName").getValue();
                    const itemPrice = this.byId("idPrice").getValue();
                    const itemStock = this.byId("idStock").getValue();
                    const unitStock = this.byId("addItemUnit").getValue();

                    const data = {
                        name: itemName,
                        price: parseFloat(itemPrice),
                        stock: parseInt(itemStock, 10),
                        unit: unitStock,
                    };

                    const response = await fetch("/bills/Items", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        new sap.m.MessageToast.show("Item added successfully!");
                        this.refreshTable();
                        this.onRefresh();
                    } else {
                        const errorText = await response.text();
                        new sap.m.MessageToast.show(
                            "Error adding new item: " + errorText
                        );
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("An unexpected error occurred.");
                }
                this.getView().byId("OpenDialog").close();
            },

            // delete -------------------------------------------
            onDeleteConfirmation: function (oEvent) {
                var that = this;

                var oItem = oEvent.getSource().getBindingContext().getObject();

                sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                    MessageBox.confirm(
                        "Are you sure you want to delete this item?",
                        {
                            title: "Confirm Deletion",
                            actions: [
                                MessageBox.Action.OK,
                                MessageBox.Action.CANCEL,
                            ],
                            onClose: function (oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    that.onDelete(oItem);
                                }
                            },
                        }
                    );
                });
            },

            onDelete: async function (oItem) {
                try {
                    const response = await fetch(`/bills/Items/${oItem.ID}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        new sap.m.MessageToast.show(
                            "Item deleted successfully"
                        );
                        this.refreshTable();
                        this.onRefresh();
                    } else {
                        console.error(
                            `Error deleting item: ${response.status} - ${response.statusText}`
                        );
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
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
                        console.log("Creating dialog...");
                        this.oUpdateDialog = await sap.ui.xmlfragment({
                            fragmentName: "ns.items.view.UpdateDialog",
                            controller: this,
                        });
                        this.getView().addDependent(this.oUpdateDialog);
                        console.log("Dialog created.");
                    } catch (error) {
                        console.error("Error creating dialog:", error);
                        return;
                    }
                }

                // Directly access the values from the selected item
                var oSelectedItem = oEvent
                    .getSource()
                    .getBindingContext("items")
                    .getObject();

                // Set the values to the dialog input fields
                this.byId("updateItemID").setValue(oSelectedItem.ID);
                this.byId("updateItemName").setValue(oSelectedItem.name);
                this.byId("updateItemPrice").setValue(oSelectedItem.price);
                this.byId("updateItemStock").setValue(oSelectedItem.stock);
                this.byId("updateItemUnit").setValue(oSelectedItem.unit);

                this.oUpdateDialog.open();
            },

            onUpdateSave: async function () {
                var oUpdateDialog = this.byId("updateDialog");

                if (oUpdateDialog) {
                    oUpdateDialog.close();
                }

                // Directly access the values from the input fields
                var oItem = {
                    ID: this.byId("updateItemID").getValue(), // Assuming ID doesn't change
                    name: this.byId("updateItemName").getValue(),
                    price: parseFloat(this.byId("updateItemPrice").getValue()),
                    stock: parseInt(this.byId("updateItemStock").getValue()),
                    unit: this.byId("updateItemUnit").getValue(),
                };

                try {
                    const responseHistory = await fetch(
                        `/bills/Items/${oItem.ID}`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: oItem.name,
                                price: oItem.price,
                                stock: oItem.stock,
                                unit: oItem.unit,
                            }),
                        }
                    );

                    if (responseHistory.ok) {
                        new sap.m.MessageToast.show(
                            "Item has been successfully updated!"
                        );
                        this.refreshTable();
                        this.onRefresh();
                    } else {
                        const errorText = await responseHistory.text();
                        console.error(
                            "Error updating ItemHistory: " + errorText
                        );
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                    alert(
                        "An unexpected error occurred while updating ItemHistory."
                    );
                }
            },
            onImportDialog: async function () {
                if (!this.oImportDialog) {
                    this.oImportDialog = this.loadFragment({
                        name: "febill.view.fragments.Import",
                    });
                }
                this.oImportDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onChooseImport: function (oEvent) {
                const id = oEvent.getParameters().selectedItem.getKey();
                const data = this.getView().getModel("items").getData();
                const selItem = data.value.find((e) => e.ID === id);
                this.byId("lbCurrentStock").setText(selItem.stock);
            },
            onImportStock: async function () {
                const id = this.byId("cbItems").getSelectedKey();
                const num = this.byId("inStock").getValue();
                const data = {
                    id: id,
                    num: num,
                };
                console.log(data);

                try {
                    const res = await fetch("/bills/importStock", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                        throw new Error(await res.text());
                    }
                    new sap.m.MessageBox.success("Success");
                    this.onRefresh();

                    // this.getView().getModel("bills").refresh(true)
                    this.byId("importDialog").close();
                } catch (error) {
                    new sap.m.MessageBox.error(error.message);
                }
            },
            onRefresh: async function () {
                const oBillsModel = await models.getItems();
                this.getView().setModel(oBillsModel, "items");
            },
        });
    }
);
