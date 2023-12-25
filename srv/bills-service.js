const cds = require("@sap/cds");

const { Bills, Items, ItemHistory } = cds.entities;
// const { OrderStatus } = require("#cds-models/mydb");

module.exports = cds.service.impl(async function () {
    this.before("POST", "Bills", async (req) => {
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
    this.after("POST", "Bills", async (res, req) => {
        const historyList = res.items.map((i) => {
            return {
                item_ID: i.item_ID,
                quantity: i.quantity * -1,
                note: "SELL",
            };
        });
        await INSERT(historyList).into(ItemHistory);
        for (let i of res.items) {
            let quantity = i.quantity;

            await UPDATE(Items)
                .set({
                    stock: { "-=": quantity },
                    // lastUpdate: date,
                })
                .where({ ID: i.item_ID });
        }
    });

    const validateQuantity = (items) => {
        for (let i of items) if (i.quantity < 0) return false;
    };

    this.on("cancelOrder", async (req) => {
        // console.log(OrderStatus.PAID);\
        //Update bill status
        await UPDATE(Bills)
            .set({ status: "CANCEL" })
            .where({ ID: req.data.id });
        const items = await SELECT(Bills)
            .columns((c) => {
                c.items.item_ID, c.items.quantity, c.ID;
            })
            .where({ ID: req.data.id });
        for (let i of items) {
            //Update current stock for item
            await UPDATE(Items)
                .set({ stock: { "+=": i.quantity } })
                .where({ ID: i.item_ID });
            //Create a history about the cancelation
            await INSERT({
                item_ID: i.item_ID,
                quantity: i.quantity,
                note: "CANCEL A BILL",
            });
        }
        console.log(items);
    });

    this.on("updateOrderStatus", async (req) => {
        await UPDATE(Bills).set({ status: "PAID" }).where({ ID: req.data.id });
    });

    // --------------------------------------------------
    this.before(["POST"], "Items", async (req) => {
        const itemName = req.data.name;
        const itemStock = req.data.stock;
        const itemPrice = req.data.price;

        const existingItem = await cds
            .transaction(req)
            .run(SELECT.from(Items).where({ name: itemName }));

        if (existingItem.length > 0) {
            req.reject(
                400,
                `An item with the name ${itemName} already exists.`
            );
        }

        if (itemStock <= 0) {
            req.reject(400, `Stock cannot be equal or smaller than 0`);
        }
        if (itemPrice <= 0) {
            req.reject(400, `Price cannot be equal or smaller than 0`);
        }
    });
    // add item
    this.after(["POST"], "Items", async (res) => {
        const date = new Date().toISOString();

        // Perform deep insert
        // await INSERT.into(Items).entries(res);
        await INSERT.into(ItemHistory).entries({
            item_ID: res.ID,
            date: date,
            quantity: res.stock,
            note: 'Add Item'
        });
        return res;
    });
    // ----------------------------------------------------
    // update item
    this.before(["PATCH", "PUT"], "Items", async (req) => {
        const itemStock = req.data.stock;
        const itemPrice = req.data.price;

        const items = await SELECT.one.from(Items)
            .where({
                ID: req.data.ID,
            });

        req.data.stock += items.stock;

        if (itemStock <= 0) {
            req.reject(400, `Stock cannot be equal or smaller than 0`);
        }
        if (itemPrice <= 0) {
            req.reject(400, `Price cannot be equal or smaller than 0`);
        }
    });

    this.after(["PATCH", "PUT"], "Items", async (res) => {
        const date = new Date().toISOString();

        const latestItemHistory = await SELECT.from(ItemHistory)
            .where({ item_ID: res.ID })
            .orderBy({ date: "desc" })
            .limit(1);

        console.log("last quantity: " + latestItemHistory[0].quantity);
        console.log("stock: " + res.stock);
        const currentQuantity = res.stock - latestItemHistory[0].quantity;

        await INSERT.into(ItemHistory).entries({
            item_ID: res.ID,
            date: date,
            quantity: currentQuantity,
            note: 'Update Item Info'
        });
        return res;
    });
});
