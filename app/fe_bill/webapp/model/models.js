sap.ui.define(
    ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     *
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     *
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            getBills: async function () {
                const billsList = await fetch(
                    `/bills/Bills?$expand=*&$orderby=createdAt%20desc`,
                    {
                        method: "GET",
                    }
                );
                const oModel = new JSONModel(await billsList.json());
                return oModel;
            },

            getItems: async function () {
                const itemsList = await fetch(`/bills/Items`, {
                    method: "GET",
                });
                const oModel = new JSONModel(await itemsList.json());
                return oModel;
            },
            getHistory: async function () {
                const historyList = await fetch(
                    `/bills/ItemHistory?$expand=*&$orderby=date%20desc`,
                    {
                        method: "GET",
                    }
                );
                const oModel = new JSONModel(await historyList.json());
                return oModel;
            },
        };
    }
);
