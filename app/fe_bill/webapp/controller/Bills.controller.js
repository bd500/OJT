sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/models",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Sorter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/FilterType",
        "../model/formatter",
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
        FilterType,
        formatter
    ) {
        "use strict";

        /**
         *
         * @param {*} items
         * @returns {number}
         * @description calculate the total price when a combo box item or quantity is entered
         */
        const calTotal = (items) => {
            let res = 0;
            items.map((i) => {
                const hb = i.getItems();
                const quantity = parseInt(hb[1].getValue());
                const price = hb[2].getText();
                res += price * quantity;
            });
            return res;
        };

        /**
         *
         * @param {number} total
         * @param {object} item
         * @returns {number}
         * @description cacculate the total price when clicking on the add or remove item button
         */
        const calItemChanged = (total, item) => {
            console.log("when item change");
        };

        return Controller.extend("febill.controller.Bills", {
            formatter: formatter,
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
                this.byId(dialog).close();
            },
            onAddNewDialog: async function () {
                const txtCustomer = this.byId("txtCustomer").getValue();
                const txtExporter = this.byId("txtExporter").getValue();
                const vbItems = this.byId("vbItems").getItems();
                let total = 0;

                const buyItems = vbItems.map((i) => {
                    const hb = i.getItems();
                    const item_ID = hb[0].getSelectedKey(); //id is uid
                    // const item_ID = parseInt(hb[0].getSelectedKey()); //id is integer
                    const quantity = parseInt(hb[1].getValue());
                    // const price = hb[0].data(item_ID + ""); //only accept string as key
                    const price = hb[2].getText();
                    total += price * quantity;
                    return { item_ID, quantity };
                });

                const data = {
                    customer: txtCustomer,
                    exporter: txtExporter,
                    items: buyItems,
                    total: total,
                    status: "UNPAID",
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

                    // this.getView().getModel("bills").refresh(true)
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

                const lbTotal = this.byId("createTotal");
                let total = parseFloat(lbTotal.getText());

                const quantity = hbItem.getItems()[1].getValue();
                const price = parseFloat(hbItem.getItems()[2].getText());
                total += quantity * price;
                lbTotal.setText(total);
            },
            onRemoveItem: function (oEvent) {
                const child = oEvent.getSource();
                const parent = child.getParent();
                const vbItems = this.byId("vbItems");

                const lbTotal = this.byId("createTotal");
                let total = parseFloat(lbTotal.getText());

                const quantity = parent.getItems()[1].getValue();
                const price = parent.getItems()[2].getText();
                total -= quantity * price;
                lbTotal.setText(total);

                vbItems.removeItem(parent);
            },
            onChooseAddItem: function (oEvent) {
                const oModel = oEvent.getSource().getModel("items");
                const key = oEvent.getParameters().selectedItem.getKey();
                const oData = oModel.getData().value;
                const selItem = oData.find((x) => x.ID === key);
                const hbox = oEvent.getSource().getParent();
                hbox.getItems()[2].setText(`${selItem.price}`);

                const total = calTotal(hbox.getParent().getItems());
                this.byId("createTotal").setText(total);
            },
            onInputQuantity: function (oEvent) {
                const vbItems = this.byId("vbItems").getItems();
                let lbTotal = this.byId("createTotal");
                let total = calTotal(vbItems);

                lbTotal.setText(total);
            },
            onBillDetails: async function (oEvent) {
                const sPath = oEvent.getSource().getBindingContextPath("bills");
                const oModel = oEvent.getSource().getModel("bills");
                const oItemModel = this.getView().getModel("items");
                const oItemData = oItemModel.getData().value;

                const selCustomer = oModel.getProperty(sPath + "/customer");
                const selExporter = oModel.getProperty(sPath + "/exporter");
                const selItems = oModel.getProperty(sPath + "/items");
                const selTotal = oModel.getProperty(sPath + "/total");
                const selDate = oModel.getProperty(sPath + "/createdAt");
                const selId = oModel.getProperty(sPath + "/ID");
                const selStatus = oModel.getProperty(sPath + "/status");

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

                const btnUpdate = this.byId("btnUpdate");
                selStatus === "PAID"
                    ? btnUpdate.setEnabled(false)
                    : selStatus === "CANCEL"
                    ? btnUpdate.setEnabled(false)
                    : btnUpdate.setEnabled(true);

                const vbItems = this.byId("vbEditItems");
                for (let i of selItems) {
                    const container = new sap.m.HBox({ width: "100%" });
                    const oData = oItemData.find((e) => e.ID === i.item_ID);

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
            },
            onCancelOrder: async function (oEvent) {
                const oModel = oEvent.getSource().getModel("bills");
                const cells = oEvent.getSource().getParent().getCells();
                const data = { id: cells[0].getTitle(), status: "CANCEL" };
                try {
                    const res = await fetch("/bills/updateOrderStatus", {
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
                } catch (error) {
                    new sap.m.MessageBox.error(error.message);
                }
            },
            onUpdateDialog: async function () {
                const id = this.getView().byId("editId").getValue();
                try {
                    const res = await fetch("/bills/updateOrderStatus", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id: id, status: "PAID" }),
                    });
                    if (!res.ok) {
                        throw new Error(await res.text());
                    }
                    new sap.m.MessageBox.success("This bill is now paid");
                    this.byId("detailsDialog").close();
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
