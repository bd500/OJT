using {
    managed,
    Currency,
} from '@sap/cds/common';

namespace mydb;

entity Customers {
    key ID       : Integer;
        name     : String(25);
        invoices : Association to many Invoices
                       on invoices.customer = $self;
}

entity Users {
    key ID       : Integer;
        name     : String(25);
        username : String(25);
        password : String(25);
        invoices : Association to many Invoices
                       on invoices.created_by = $self
}

entity Invoices {
    key ID          : Integer;
        customer : Association to Customers;
        total       : Double;
        currency    : Currency;
        items       : Composition of many InvoiceItems
                          on items.invoice = $self;
        created_by  : Association to Users; //@cds.on.insert: $Managers;
        created_at  : Timestamp @cds.on.insert: $now;
}

entity Products {
    key ID          : Integer;
        name        : String;
        price       : Double;
        currency    : Currency;
        stock       : Integer;
        created_at  : Timestamp;
        modified_at : Timestamp;
        invoices    : Composition of many InvoiceItems
                          on invoices.item = $self
}

entity InvoiceItems {
    key invoice  : Association to Invoices;
    key item     : Association to Products;
        quantity : Integer;
}
