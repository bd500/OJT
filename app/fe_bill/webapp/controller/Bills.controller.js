sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/models",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Sorter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/FilterType",
        "sap/m/Button",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        Controller,
        models,
        JSONModel,
        Sorter,
        Filter,
        FilterOperator,
        FilterType
    ) {
        "use strict";

        return Controller.extend("febill.controller.Bills", {
            onInit: async function () {
                var oBillsModel = await models.getBills();
                var oItemsModel = await models.getItems();
                var oView = this.getView();
                oView.setModel(oBillsModel, "bills");
                oView.setModel(oItemsModel, "items");
            },
            onAddNewBill: function () {
                if (!this.oAddBillDialog) {
                    this.oAddBillDialog = this.loadFragment({
                        name: "febill.view.fragments.CreateBill",
                    });
                }
                this.oAddBillDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onCloseDialog: function (oEvent, dialog) {
                // const dialog = oEvent.getSource().data("dialog");
                this.byId(dialog).close();
            },
            onAddNewDialog: async function () {
                const txtCustomer = this.byId("txtCustomer").getValue();
                const txtExporter = this.byId("txtExporter").getValue();
                const vbItems = this.byId("vbItems").getItems();
                let total = 0;

                const buyItems = vbItems.map((i) => {
                    const hb = i.getItems();
                    // const item_ID = hb[0].getSelectedKey() //id is uid
                    const item_ID = parseInt(hb[0].getSelectedKey()); //id is integer
                    const quantity = parseInt(hb[1].getValue());
                    const price = hb[0].data(item_ID + ""); //only accept string as key
                    total += price * quantity;
                    return { item_ID, quantity };
                });

                const data = {
                    ID: 15,
                    customer: txtCustomer,
                    exporter: txtExporter,
                    items: buyItems,
                    total: total,
                };
                /**
                 *
                 * @param {Array} listItems
                 * @private
                 * @description: Validate if the the list contains duplicate items
                 */
                const validateDuplicateItem = (listItems) => {
                    const hasDuplicate = listItems.some(
                        (val, i) => listItems.indexOf(val) !== i
                    );
                    if (hasDuplicate)
                        throw new Error("The list contains duplicate item");
                };

                try {
                    validateDuplicateItem(data.items);
                    console.log(data);
                    const res = await fetch("/bills/Bills", {
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
                    this.byId("addBillDialog").close();
                } catch (error) {
                    console.log(error.message);
                    new sap.m.MessageBox.error(error.message);
                }
            },
            onAppendItem: function () {
                const vbItems = this.byId("vbItems");
                const hbItem = this.byId("hbItem");
                vbItems.addItem(hbItem.clone());

                console.log(vbItems.getItems());
            },
            onRemoveItem: function (oEvent) {
                const child = oEvent.getSource();
                const parent = child.getParent();
                const vbItems = this.byId("vbItems");
                vbItems.removeItem(parent);

                // parent.destroy(); //fix bug: cannot add an new item after remove all items
            },
            onChooseAddItem: function (oEvent) {
                const oModel = oEvent.getSource().getModel("items");
                const key = oEvent.getParameters().selectedItem.getKey();
                // console.log(cbBox.getBinding("items").getModel().getProperty("/value/" + key));
                const selItem = oModel.getProperty(`/value/${key}`);
                const hbox = oEvent.getSource().getParent();
                hbox.getItems()[2].setText(`${selItem.price}`);
            },
            onBillDetails: async function (oEvent) {
                const sPath = oEvent.getSource().getBindingContextPath("bills");
                const oModel = oEvent.getSource().getModel("bills");
                const oItemModel = this.getView().getModel("items");

                const selCustomer = oModel.getProperty(sPath + "/customer");
                const selExporter = oModel.getProperty(sPath + "/exporter");
                const selItems = oModel.getProperty(sPath + "/items");
                const selTotal = oModel.getProperty(sPath + "/total");
                const selDate = oModel.getProperty(sPath + "/createdAt");
                const selId = oModel.getProperty(sPath + "/ID");

                if (!this.oDetailsDialog) {
                    this.oDetailsDialog = this.loadFragment({
                        name: "febill.view.fragments.DetailsBill",
                    });
                }

                const dialog = await this.oDetailsDialog;
                dialog.open();
                this.byId("editId").setValue(selId);
                this.byId("editCustomer").setValue(selCustomer);
                this.byId("editExporter").setValue(selExporter);
                this.byId("editDate").setValue(selDate);
                this.byId("editTotal").setText(`$${selTotal}`);

                const vbItems = this.byId("vbEditItems");
                for (let i of selItems) {
                    const container = new sap.m.HBox({ width: "100%" });
                    const oData = oItemModel.getProperty(`/value/${i.item_ID}`);
                    const newItem = new sap.m.Input({
                        value: oData.name,
                        editable: false,
                        width: "auto",
                    });

                    const newQuanitty = new sap.m.Input({
                        value: i.quantity,
                        editable: false,
                    });
                    const newPrice = new sap.m.Text({
                        text: `$${oData.price}`,
                    });

                    container.addItem(newItem);
                    container.addItem(newQuanitty);
                    container.addItem(newPrice);
                    vbItems.addItem(container);
                }
                console.log(vbItems.getItems()[0].getItems());
            },
            onCancelOrder: async function (oEvent) {
                const oModel = oEvent.getSource().getModel("bills");
                console.log(oModel);
                try {
                    const res = await fetch("/bills/cancelOrder", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });
                    if (!res.ok) {
                        throw new Error(await res.text());
                    }
                    new sap.m.MessageBox.success(
                        "Successfully cancel the bill"
                    );
                    this.byId("addBillDialog").close();
                } catch (error) {
                    new sap.m.MessageBox.error(error.message);
                }
            },
            onUpdateDialog: async function () {
                const id = this.getView().byId("editId").getValue();
                console.log(id);
                try {
                    const res = await fetch("/bills/updateOrderStatus", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id: id }),
                    });
                    if (!res.ok) {
                        throw new Error(await res.text());
                    }
                    new sap.m.MessageBox.success("This bill is now paid");
                    this.byId("addBillDialog").close();
                } catch (error) {
                    new sap.m.MessageBox.error(error.message);
                }
            },
            onBillSearch: function (oEvent) {
                const oView = this.getView();
                const searchKey = oView.byId("search").getValue();
                const oFilter = new Filter(
                    "customer",
                    FilterOperator.Contains,
                    searchKey
                );
                oView
                    .byId("tbBills")
                    .getBinding("items")
                    .filter(oFilter, FilterType.Application);
            },
            onFirstPress: function () {},
            onNextPress: function () {},
            onPrevPress: function () {},
            onLastPress: function () {},
        });
    }
);
