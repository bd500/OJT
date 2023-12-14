const cds = require("@sap/cds");

// const db = await cds.connect.to("db")
const { Bills, Items, BillItems } = cds.entities;

module.exports = cds.service.impl(async function () {
    const getCurrentStock = async (id) => {
        const res = await SELECT.from(BillItems)
            .columns((b) => {
                b.bill_id, b.item.stock;
            })
            .where({ bill_id: id });
        return res;
    };

    this.before("SAVE", "Bills", async (req) => {
        const items_data = req.data.items;
        const items_id = items_data.ID;
        const items = await SELECT.from(Items).where`ID = any (${items_id})`;
        for (var item of items) {
            const check = items_data.find((e) => e.ID === item.ID);
            if (check.stock < item.quantity)
                req.error(
                    400,
                    `Not enough stock for ${check.name}`,
                    "quantity"
                );
        }
    });
    this.after("SAVE", "Bills", async (req) => {});
    this.before("GET", "Bills", async () => {
        // const res = await SELECT.from(BillItems)
        //     .columns()
        //     .where({ bill_ID: 1 });
        // const res = await this.send({
        //     event: "getCurrentStock",
        //     data: 1,
        // });

        console.log(await getCurrentStock(1));
        // console.log(res);
    });
});
