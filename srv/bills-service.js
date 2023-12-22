const cds = require("@sap/cds");
const { equal } = require("assert");
const { redirect } = require("express/lib/response");

const { Bills, Items, ItemHistory } = cds.entities;

module.exports = cds.service.impl(async function () {
    this.before(["POST", "PUT"], "Bills", async (req) => {
        const itemsId = req.data.items.map((e) => e.item_ID);
        if (validateQuantity(itemsId))
            req.reject(400, "Quantity cannot be negative", "quantity");

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
        return myItemsMap;
    });
    this.after(["POST", "PUT"], "Bills", async (res, req) => {
        const date = new Date().toISOString();

        const historyList = res.items.map((i) => {
            return { item_ID: i.item_ID, quantity: i.quantity, note: "SELL" };
        });
        await INSERT(historyList).into(ItemHistory);
        for (let i of res.items) {
            let quantity = i.quantity;

            // if(req.method !== "POST"){
            //     quantity =
            // }
            await UPDATE(Items)
                .set({
                    stock: { "-=": quantity },
                    lastUpdate: date,
                })
                .where({ ID: i.item_ID });
        }
    });

    const validateQuantity = (items) => {
        for (let i of items) if (i.quantity < 0) return false;
    };


    this.on('READ', 'Items', async (req) => {
        const searchTerm = 'Shoes';

        const searchResults = await
            SELECT(Items)

        return searchResults;
    });
    // --------------------------------------------------
    // add item
    this.after(["POST"], "Items", async (res) => {
        const date = new Date().toISOString();


        // Perform deep insert
        // await INSERT.into(Items).entries(res);
        await INSERT.into(ItemHistory).entries({
            item_ID: res.ID,  // Assuming 'cuid' is the primary key of Items
            date: date,
            quantity: res.stock
        });
        return res;
    });
    // ----------------------------------------------------
    // update item
    this.after(["PATCH", "PUT"], "Items", async (res) => {
        const date = new Date().toISOString();
        await UPDATE(ItemHistory)
            .set({
                quantity: { "+=": res.stock },
                date: date,
            })
            .where({ item_ID: res.ID });
        return res;
    });



});
