using {
    managed,
    cuid,
} from '@sap/cds/common';

namespace mydb;

entity ItemHistory : cuid {
    item     : Association to Items;
    //  on item.inventory = $self;
    date     : Timestamp @cds.on.insert: $now;
    quantity : Integer;
}

entity Items : cuid {
    name    : String;
    price   : Double;
    stock   : Integer;
    bill    : Composition of many BillItems
                  on bill.item = $self;
    history : Composition of many ItemHistory
                  on history.item = $self
}

entity Bills : cuid {
    customer  : String;
    exporter  : String;
    createdAt : Timestamp @cds.on.insert: $now;
    items     : Composition of many BillItems
                    on items.bill = $self;
    total     : Double;
}

entity BillItems {
    key bill     : Association to Bills;
    key item     : Association to Items;
        quantity : Integer
}
