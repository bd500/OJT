using {
    managed,
    Currency,
} from '@sap/cds/common';

namespace mydb;

entity Customers {
    key ID       : Integer;
        name     : String(25);
        invoices : Association to many Invoices
                       on invoices.customerID = $self;
}

entity Users {
    key ID       : Integer;
        name     : String(25);
        username : String(25);
        password : String(25);
        invoices : Association to many Invoices
                       on invoices.createdBy = $self
}

entity Invoices {
    key ID         : Integer;
        customerID : Association to Customers;
        total      : Double;
        currency   : Currency;
        createdBy  : Association to Users; //@cds.on.insert: $Managers;
        createdAt  : Timestamp @cds.on.insert: $now;
}

entity InvoiceItems {
    key ID        : Integer;
    key invoiceID : Integer;
        quantity  : Integer;
        invoice   : Association to Invoices
                        on invoice.ID = $self.invoiceID;
}

entity Products {
    key ID         : Integer;
        name       : String;
        price      : Double;
        currency   : Currency;
        stock      : Integer;
        createdAt  : Timestamp;
        modifiedAt : Timestamp;
}
