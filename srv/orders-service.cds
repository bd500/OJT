using mydb from '../db/schema';

@(path: '/invoices')
service InvoiceManagement {

    entity Invoices     as projection on mydb.Invoices;
    entity InvoiceItems as projection on mydb.InvoiceItems;

}
