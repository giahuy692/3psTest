import { MenuDataItem } from "../dto/menu-data-item.dto";

export const GridDropdownData: Array<MenuDataItem> = [
    {
        Name: "Xem chi tiết",
        Code: "eye",
        Link: "detail",
        Actived: false,
        LstChild: []
    }, {
        Name: "Chỉnh sửa",
        Code: "pencil",
        Link: "edit",
        Actived: false,
        LstChild: []
    }, {
        Name: "In",
        Code: "print",
        Link: "print",
        Actived: false,
        LstChild: []
    }, {
        Name: "Xóa",
        Code: "trash",
        Link: "delete",
        Actived: false,
        LstChild: []
    },
]