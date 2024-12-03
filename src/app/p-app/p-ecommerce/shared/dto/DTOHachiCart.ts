
export default class DTOItemCart2 {//todo merge với product.dto
    Barcode: string
    ReceivedBy: string
    ReceivedByIsOrderBy: boolean
    IsVAT: boolean
    IsHachi24: boolean
    IsMoreThanStock: boolean
    IsPromotionVIP: boolean
    IsStock: boolean
    IsGift: boolean
    VATAddress: string
    VATCode: string
    VATCompany: string
    VATEmail: string
    Cellphone: string
    Address: string
    FullAddress: string
    UserID: string
    BankID: number
    DeliveryID: number
    BasePrice: number = 0
    CartID: number
    Province: number
    District: number
    Ward: number
    ComboQty: number = 1
    DeliveryHachi24h: boolean
    ImageSetting: string
    ModelName: string
    OrderQuantity: number = 1
    ProductID: number
    ProductName: string
    Alias: string
    OrderBy: string
    OrderEmail: string
    OrderPhone: string
    ShippedQuantity: number = 0
    StatusID: number = 1
    StaffID: number = 0
    TypeData: number = 0
    UnitPrice: number = 0
    TotalAmount: number = 0
    PolicyMembership: number = 0
    DiscountMembership: number = 0
    CouponPaid: number = 0
    FreeShippingImage: string
    ShippingFee: number
    ShippingDiscount: number
    Payment: number
    PaymentID: number
    PaymentMethod: string
    HasCoupon: boolean
    ListCoupon: DTOItemCart_Coupon2[]
    ListCouponSelected: DTOItemCart_Coupon2[]
    ListGift: DTOItemCart_Gift2[]
    ListItem: DTOItemCart2[]
    ListModels: DTOItemCart_Model2[]
    ModelID: any
    CartDelivery: number
    PromotionDetailID: any
    RefID: any
    RefName: any
    RefNo: any
    Remark: any
    Code: number = 0
    OrderNo: string = ''
    MembershipID: any
    StepDate: Date
    Step: number = 1
    IsAppliedHachi24: boolean = false

    constructor() {
        this.IsVAT = false
        this.HasCoupon = false
    }
}

export class DTOItemCart_Model2 {
    ID: number;
    ModelName: string;
    ImageSetting: string;
    IsChoose: boolean
}
export class DTOItemCart_Gift2 {
    ID: number;
    ImageSetting: string;
    ImageThumb: string;
    ProductName: string;
    ItemID: number;
    IsChoose: boolean;
    Quantity: number
    GiftTitle: string
    Alias: string
}
export class DTOItemCart_Coupon2 {
    ID: number;
    Code: number;
    CouponID: number;
    CouponCode: string;
    CouponName: string;
    Description: string;
    IsChoose: boolean
    ExpiredDate: Date
    CouponAmount: number
    TypeData: number
    CartID: number
    CartDetailID: number
    ProductID: number
}

export class DTOItemCartGifts {
    ID: number
    Code: string
    Gift: string
    Summary: string
    Content: string
    ImageThumb: string
    ImageLarge: string
    StartDate: Date
    EndDate: Date
    SaleAmount: number
    MinAmount: number
    RemainAmount: number
    ProductID: number
    IsCart: boolean
    OrderNo: string = ''
    ImageSetting: string
    ProductName: string
    OrderDate: Date
    GiftLevels: DTOGiftLevel[]
    Alias: string
}

export class DTOGiftLevel {
    ID: number
    MinLevel: number
    MaxLevel: number
    GiftItems: DTOItemCart_Gift2[]
}

export class DTOCartCombo extends DTOItemCart2 {
    ID: number
    UnitPrice: number
    VIPPrice: number
    TypeData: number
    Barcode: string
    ProductName: string
    ImageSetting: string
    IsBestPrice: boolean
}

// export class DTOItemCart_Coupon2_CartAmount {
//     Coupon: DTOItemCart_Coupon2
//     CartAmount: number
// }

export class DTOCoupon_Cart_CartCoupon {
    SelectedCoupon: DTOItemCart_Coupon2
    Cart: DTOItemCart2
    CartCoupon: DTOItemCart_Coupon2[]
    SelectedCartDetail: DTOItemCart2
}

export class DTOCart_Properties {
    Cart: DTOItemCart2
    Properties: string[]
}


export class DTOTypeOfTransportation {
    Code: number
    Name: string
    Description: string
    Fee: number
}

export class DTOPayment {
    ID: number;
    // PaymentNameVN: string;
    // PaymentNameEN: string;
    // PaymentNameJP: string;
    // DescriptionVN: string;
    // DescriptionEN: string;
    // DescriptionJP: string;
    Description: string
    PaymentName: string
    SortOrder: number;
    ImageSetting1: string;
    ListBank: DTOBank[]
}

export class DTOPaymentCart {
    Cart: DTOItemCart2
    CartDetails: DTOItemCart2[]
    CartCoupon: DTOItemCart_Coupon2[]
    ListCoupon: DTOItemCart_Coupon2[]
    CartCombo: DTOCartCombo[]
    CartNoti: UserNotiDTO[]
    TotalItemQuantity: number
    TypeOfTransportation: DTOTypeOfTransportation[]

    constructor() {
        this.Cart = new DTOItemCart2()
        this.CartDetails = new Array<DTOItemCart2>()
        this.CartCoupon = new Array<DTOItemCart_Coupon2>()
        this.ListCoupon = new Array<DTOItemCart_Coupon2>()
        this.CartCombo = new Array<DTOCartCombo>()
        this.CartNoti = new Array<UserNotiDTO>()
        this.TotalItemQuantity = 0
        this.TypeOfTransportation = new Array<DTOTypeOfTransportation>()
    }
}

export class DTOBank {
    ID: number;
    // BankNameVN: string;
    // BankNameEN: string;
    // BankNameJP: string;
    // DescriptionVN: string;
    // DescriptionEN: string;
    // DescriptionJP: string;
    BankName: string
    Description: string
    ImageSetting1: string;
    SortOrder: number;
}

export class UserNotiDTO {
    ID: number
    NotificationDate: Date
    Notification: string
    Alias: string
    TypeData: number
}

export class DeliveryDTO {
    ID: number
    UserID: string
    Cellphone: string;
    ReceivedBy: string;
    Address: string;
    Province: number;
    District: number;
    Ward: number;
    IsDefault: boolean;
    DistrictName?: string
    FullAddress?: string
    IsChoose: boolean;
    ProvinceName?: string
    WardName?: string
}

export class ProvinceDTO {
    // Code: string;
    Code: number = 0;
    // ID: number;
    OrderBy: number;
    ProvinceName: string
    // ProvinceEN: string;
    // ProvinceJP: string;
    // ProvinceVN: string;

    constructor(Code?: number, ProvinceName?: string) {
        this.Code = Code
        this.ProvinceName = ProvinceName
    }
}

export class DistrictDTO {
    // Code: string;
    Code: number = 0;
    DistrictName: string
    // DistrictEN: string;
    // DistrictJP: string;
    // DistrictVN: string;
    // ID: number;
    OrderBy: number;
    ProvinceCode: string;
    ProvinceID: number;
    ProvinceName: string
    // ProvinceEN: string;
    // ProvinceJP: string;
    // ProvinceVN: string;

    constructor(Code?: number, DistrictName?: string) {
        this.Code = Code
        this.DistrictName = DistrictName
    }
}

export class WardDTO {
    // Code: string;
    Code: number = 0;
    DistrictCode: string;
    DistrictID: number//4    
    DistrictName: string
    // DistrictEN: string;
    // DistrictJP: string;
    // DistrictVN: string;
    // ID: number;
    OrderBy: number;
    WardName: string
    // WardEN: string;
    // WardJP: string;
    // WardVN: string;

    constructor(Code?: number, WardName?: string) {
        this.Code = Code
        this.WardName = WardName
    }
}

export class CardHistoryDTO {
    ID: number;
    StartPoint: number = 0;
    CurrentPoint: number = 0;
    CurrentDiscount: number = 0;
    IsSN: boolean
    CardNo: string;
    FirstName: string;
    LastName: string;
    Cellphone: string;
    Email: string;
    DayBirth: number
    MonthBirth: number
    YearBirth: number
    Gender: number
    FullName: string
    userID: string
    // CurrentDiscount: number;
    // Active: boolean
    // IsUse: boolean
    // Homephone: string;
    // UserID: string;
    // Birthday: Date
}