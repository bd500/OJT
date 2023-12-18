using {
    managed,
    Currency,
} from '@sap/cds/common';

namespace mydb;

// entity Managers {
//     key ID       : Integer;
//         name     : String;
//         username : String;
//         password : String;
// inventories : Association to Inventories
//                   on inventories.manager = $self;
// }

entity ItemHistory : managed {
    key ID         : Integer;
        item       : Association to Items;
        //  on item.inventory = $self;
        importDate : Timestamp;
        quantity   : Integer
}

entity Items {
    key ID         : Integer;
        name       : String;
        price      : Double;
        stock      : Integer;
        lastUpdate : Timestamp;
        bill       : Composition of many BillItems
                         on bill.item = $self;
        history    : Composition of many ItemHistory
                         on history.item = $self
}

entity Bills {
    key ID        : Integer;
        customer  : String;
        exporter  : String;
        createdAt : Timestamp;
        items     : Composition of many BillItems
                        on items.bill = $self;
        total     : Double;
}

entity BillItems {
    key bill     : Association to Bills;
    key item     : Association to Items;
        quantity : Integer
}
