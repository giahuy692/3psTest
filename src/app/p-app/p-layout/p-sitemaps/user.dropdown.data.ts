import { MenuDataItem } from "../dto/menu-data-item.dto";

export const UserDropdownData: Array<MenuDataItem> = [
    {
        Name: "Portal Cá Nhân",
        Code: "user",
        Link: "gotoportal",
        Actived: false,
        LstChild: []
    }, {
        Name: "Đổi mật khẩu",
        Code: "lock",
        Link: "changepassword",
        Actived: false,
        LstChild: []
    }, {
        Name: "Đăng xuất",
        Code: "logout",
        Link: "logout",
        Actived: false,
        LstChild: []
    },
]