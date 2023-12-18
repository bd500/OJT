using mydb from '../db/schema';

@(path: '/bills')
service BillsManagement {

    entity Bills      as projection on mydb.Bills;
    entity BillsItems as projection on mydb.BillItems;

    @readonly
    entity Items      as projection on mydb.Items;

}
