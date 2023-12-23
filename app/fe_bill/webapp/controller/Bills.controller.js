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
                console.log(oBillsModel.getData());
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
                    ID: 96,
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
                const validateDuplicateItem = (listItems) => {};

                try {
                    validateDuplicateItem(data);
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
                console.log(hbox.getItems()[2].setText(selItem.price));
            },
            onBillDetails: async function (oEvent) {
                const sPath = oEvent.getSource().getBindingContextPath("bills");
                const oModel = oEvent.getSource().getModel("bills");

                const selCustomer = oModel.getProperty(sPath + "/customer");
                const selExporter = oModel.getProperty(sPath + "/exporter");
                const selItems = oModel.getProperty(sPath + "/items");
                const selTotal = oModel.getProperty(sPath + "/total");
                const selDate = oModel.getProperty(sPath + "/createdAt");

                console.log(selItems);

                if (!this.oDetailsDialog) {
                    this.oDetailsDialog = this.loadFragment({
                        name: "febill.view.fragments.DetailsBill",
                    });
                }

                const dialog = await this.oDetailsDialog;
                dialog.open();
                this.byId("editCustomer").setValue(selCustomer);
                this.byId("editExporter").setValue(selExporter);
                this.byId("editDate").setValue(selDate);
                this.byId("editTotal").setText(selTotal);

                const vbItems = this.byId("vbEditItems");
                const hbItems = vbItems.getItems()[0];
                for (let i of selItems) {
                    const cbItem = hbItems.getItems()[0];
                    const txtQuantity = hbItems.getItems()[1];
                    const txtPrice = hbItems.getItems()[2];

                    const test = new sap.m.HBox({ width: "100%" });
                    const newItem = new sap.m.ComboBox({});
                    const newQuanitty = new sap.m.Input({
                        value: txtQuantity.getValue(),
                    });
                    const newPrice = new sap.m.Text({
                        text: txtPrice.getText(),
                    });
                    const newButton = new sap.m.Button({
                        type: "Reject",
                        icon: "sap-icon://less",
                        press: ".onRemoveEditItem",
                    });

                    cbItem.setSelectedKey(i.item_ID);
                    txtQuantity.setValue(i.quantity);
                    txtPrice.setText(120000);
                    test.addItem(newQuanitty);
                    test.addItem(newPrice);
                    console.log(txtQuantity);
                    vbItems.addItem(test);
                }
                console.log(vbItems.getItems()[0].getItems());
            },
            onAppendEditItem: function () {},
            onRemoveEditItem: function () {},
            onSaveDialog: async function () {},
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
