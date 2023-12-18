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
        console.log("Method call: ", req.method);
        const itemsId = req.data.items.map((e) => e.item_ID);

        //get the ID and quantity of order items and put it into a map
        const myItemsMap = req.data.items.reduce(
            (map, i) => map.set(i.item_ID, i.quantity),
            new Map()
        );

        const items = await SELECT.from(Items)
            .columns((c) => {
                c.ID, c.name, c.stock;
            })
            .where({
                ID: itemsId,
            });

        for (let item of items) {
            if (item.stock < myItemsMap.get(item.ID))
                req.error(
                    400,
                    `The quantity for ${item.name} exceeds current stock`,
                    "quantity"
                );
        }
    });
    this.on("POST", "Bills", async (req) => {
        console.log("Inside post");
        return req.data;
    });
    this.after("SAVE", "Bills", async (res, req) => {
        console.log(req);
        // const items_id = req.data.items[0].ID;
        // const items = SELECT.from(Items).where({
        //     ID: items_id,
        // });
    });
});
