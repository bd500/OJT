sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
    "use strict";

    return {
        formatDate(date) {
            const oDateFormat = DateFormat.getDateInstance({
                pattern: "MMM dd, yyyy, hh:mm:ss a",
            });
            const oDate = new Date(date);
            return oDateFormat.format(oDate);
        },
        formatLastDate(history) {
            // return history[history.length - 1];
            console.log(history);
        },
        formatItemChange(sItem) {
            return sItem > 0 ? "Success" : "Warning";
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
                case "Import":
                    status = "Indication07";
                    break;
                default:
                    status = "Success";
                    break;
            }
            return status;
        },
    };
});
