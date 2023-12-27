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
                // const hb = i.getItems();
                // const quantity = parseInt(hb[1].getValue());
                // const price = hb[2].getText();
                // res += price * quantity;
                const total = parseFloat(i.getItems()[3].getText());
                res += total;
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
                if (dialog === "detailsDialog")
                    this.getView().byId("vbEditItems").destroyItems();
            },
            onAddNewDialog: async function () {
                const txtCustomer = this.byId("txtCustomer").getValue();
                const txtExporter = this.byId("txtExporter").getValue();
                const vbItems = this.byId("vbItems").getItems();
                const selStatus = this.byId("selStatus").getSelectedKey();
                const txtAddress = this.byId("txtAddress").getText();
                // let total = 0;
                const subtotal = this.byId("createSubTotal").getText();
                try {
                    const buyItems = vbItems.map((i) => {
                        const hb = i.getItems();
                        const item_ID = hb[0].getSelectedKey(); //id is uid
                        // const item_ID = parseInt(hb[0].getSelectedKey()); //id is integer
                        const quantity = parseInt(hb[1].getValue());
                        if (quantity <= 0)
                            throw new Error("Quantity can not be 0 or less");
                        return { item_ID, quantity };
                    });

                    const data = {
                        customer: txtCustomer,
                        exporter: txtExporter,
                        items: buyItems,
                        total: parseFloat(subtotal),
                        status: selStatus,
                        // address: txtAddress
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
                const hbClone = hbItem.clone();
                vbItems.addItem(hbClone);

                const lbSubTotal = this.byId("createSubTotal");
                let subtotal = parseFloat(lbSubTotal.getText());

                // const ipQuantity = hbItem.getItems()[1].getItems()[0];
                // const quantity = ipQuantity.getValue();
                const quantity = hbClone.getItems()[1].getValue();
                // const txtUnitPrice = hbItem.getItems()[2].getItems()[0];
                // const unitPrice = parseFloat(txtUnitPrice.getText());
                const unitPrice = parseFloat(hbClone.getItems()[2].getText());
                const txtTotal = hbClone.getItems()[3];
                txtTotal.setText(unitPrice * quantity);

                subtotal += quantity * unitPrice;
                lbSubTotal.setText(subtotal);
            },
            onRemoveItem: function (oEvent) {
                const child = oEvent.getSource();
                const hbItem = child.getParent().getParent();
                const vbItems = this.byId("vbItems");

                const lbTotal = this.byId("createSubTotal");
                let subtotal = parseFloat(lbTotal.getText());

                const total = hbItem.getItems()[3].getText();
                subtotal -= total;
                lbTotal.setText(subtotal);

                // vbItems.removeItem(parent);
                vbItems.removeItem(hbItem);
            },
            onChooseAddItem: function (oEvent) {
                const oModel = oEvent.getSource().getModel("items");
                const key = oEvent.getParameters().selectedItem.getKey();
                const oData = oModel.getData().value;
                const selItem = oData.find((x) => x.ID === key);
                const hbox = oEvent.getSource().getParent();
                // hbox.getItems()[2].setText(`${selItem.price}`);
                const txtUnitPrice = hbox.getItems()[2];
                txtUnitPrice.setText(selItem.price);

                const quantity = hbox.getItems()[1].getValue();
                hbox.getItems()[3].setText(quantity * selItem.price);
                // const total = calTotal(hbox.getParent().getItems());
                const subtotal = calTotal(hbox.getParent().getItems());
                this.byId("createSubTotal").setText(subtotal);
            },
            onInputQuantity: function (oEvent) {
                const vbItems = this.byId("vbItems").getItems();
                let lbTotal = this.byId("createSubTotal");
                const quantity = oEvent.getParameters().value;

                const hbItem = oEvent.getSource().getParent();
                const unitPrice = hbItem.getItems()[2].getText();
                hbItem.getItems()[3].setText(unitPrice * quantity);
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
                dialog.setTitle(`Details ID: ${selId}`);
                dialog.open();
                this.byId("editId").setText(selId);
                this.byId("editCustomer").setValue(selCustomer);
                this.byId("editExporter").setValue(selExporter);
                this.byId("editDate").setValue(selDate);
                this.byId("editTotal").setText(`$${selTotal}`);
                this.byId("editStatus").setText(selStatus);

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
                        width: "82px",
                    });

                    const newTotal = new sap.m.Text({
                        text: oData.price * i.quantity,
                    });

                    container.addItem(newItem);
                    container.addItem(newQuanitty);
                    container.addItem(newPrice);
                    container.addItem(newTotal);
                    vbItems.addItem(container);
                }
            },
            onCancelOrder: async function (oEvent) {
                const oModel = oEvent.getSource().getModel("bills");
                const cells = oEvent
                    .getSource()
                    .getParent()
                    .getParent()
                    .getCells();
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
                const id = this.getView().byId("editId").getText();
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
            onRefresh: async function (oEvent) {
                const oBillsModel = await models.getBills();
                this.getView().setModel(oBillsModel, "bills");
            },
            onDownload: async function (oEvent) {
                const cells = oEvent
                    .getSource()
                    .getParent()
                    .getParent()
                    .getCells();
            },
        });
    }
);
