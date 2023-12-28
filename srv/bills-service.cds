using mydb from '../db/schema';

@(path: '/bills')
service BillsManagement {

    entity Bills       as projection on mydb.Bills;
    entity ItemHistory as projection on mydb.ItemHistory;
    entity Items       as projection on mydb.Items;
    entity BillItems   as projection on mydb.BillItems;
    function searchItemsByName(searchTerm : String)          returns array of Items;
    action   cancelOrder(id : String)                        returns Integer;
    action   updateOrderStatus(id : String, status : String) returns Integer;
    action   importStock(id : String, num : Integer)         returns Integer;
    action   generatePdf(bill : Bills)                       returns LargeBinary;
}
