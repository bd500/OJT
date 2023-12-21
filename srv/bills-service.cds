using mydb from '../db/schema';

@(path: '/bills')
service BillsManagement {

    entity Bills       as projection on mydb.Bills;
    entity ItemHistory as projection on mydb.ItemHistory;
    entity Items       as projection on mydb.Items;
    function searchItemsByName(searchTerm : String) returns array of Items;
}
