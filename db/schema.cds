using {
    managed,
    Currency,
} from '@sap/cds/common';

namespace mydb;

entity Managers : managed {
    key ID          : Integer;
        name        : String;
        inventories : Association to Inventories
                          on inventories.manager = $self;
}

entity Inventories : managed {
    key ID      : Integer;
        name    : String;
        manager : Association to Managers;
        items   : Association to Items
                      on items.inventory = $self;
}

entity Items {
    key ID         : Integer;
        name       : String;
        price      : Double;
        quantity   : Integer;
        recentDate : Date;
        inventory  : Association to Inventories;
}

entity Bills {
    key ID       : Integer;
        datatime : DateTime;
        customer : String;
        exporter : String;
        items    : Composition of many BillItems
                       on items.bill = $self;
}

entity BillItems {
    key bill  : Association to Bills;
    key items : Association to Items;
}
