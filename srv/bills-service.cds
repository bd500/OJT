using mydb from '../db/schema';

@(path: '/bills')
service BillsManagement {

    entity Bills       as projection on mydb.Bills;
    entity ItemHistory as projection on mydb.ItemHistory;
    entity Items       as projection on mydb.Items;
    entity BillItems   as projection on mydb.BillItems;
    action updateOrderStatus(id : String, status : String) returns Integer;
    action cancelOrder(id : String)                        returns Integer;
}
