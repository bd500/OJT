sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
    "use strict";

    const toTime = (date) => {
        const oDate = new Date(date);
        const oDateFormat = DateFormat.getDateInstance({
            pattern: "MMM dd, yyyy, hh:mm:ss a",
        });
        return oDateFormat.format(oDate);
    };
    return {
        formatDate(date) {
            return toTime(date);
        },
        formatLastDate(history) {
            if (history.length === 0) return "No information";

            // const oDateFormat = DateFormat.getDateInstance({
            //     pattern: "MMM dd, yyyy, hh:mm:ss a",
            // });
            // const oDate = new Date(history[history.length - 1].date);
            // return oDateFormat.format(oDate);
            return toTime(history[history.length - 1].date);
        },
        formatItemChange(sItem) {
            return sItem > 0 ? "Success" : "Warning";
        },
        formatQuantity(quantity) {
            return quantity === 0
                ? "Error"
                : quantity <= 10
                ? "Warning"
                : "Information";
        },
        formatBillStatus(sStatus) {
            return sStatus === "PAID"
                ? "Success"
                : sStatus === "UNPAID"
                ? "Warning"
                : "Error";
        },
        formatHistoryNote(sNote) {
            let status;
            switch (sNote) {
                case "CANCEL":
                    status = "Error";
                    break;
                case "NEW":
                    status = "Information";
                    break;
                case "IMPORT":
                    status = "Indication07";
                    break;
                case "UPDATE":
                    status = "Indication01";
                    break;
                default:
                    status = "Success";
                    break;
            }
            return status;
        },
        formatAddress(info) {
            return `${info.address}, ${info.city}, ${info.country}`;
        },
    };
});
