export default class DTOCouponPolicy {
    Code: number = 0
    CouponNameVN: string = ''
    SummaryVN: string = ''
    DescriptionVN: string = ''
    Prefix: string = ''
    StartDate: Date
    EndDate: Date
    StatusID: number = 0
    StatusName: string = 'Tạo mới'
    TypeOfVoucher: number
    TypeOfVoucherName: string = ''
    TotalStore: number = 0
    VoucherAmount: number = 1
    NoOfAllowed: number = 1
    NoOfRelease: number = 1
    TypeData: number
    WHName: string = ''
    PeriodDay: number
}

export class DTODetailCouponPolicy extends DTOCouponPolicy {
    SerialNo: string = ''
    Surfix: string = ''
    CouponNameEN: string = ''
    CouponNameJP: string = ''
    SummaryEN: string = ''
    SummaryJP: string = ''
    DescriptionEN: string = ''
    DescriptionJP: string = ''
    NotificationVN: string = ''
    SMSContent: string = ''
    AppContent: string = ''
    AppTitle: string = ''
    MinOfOrder: number = 0
    MaxValue: number = 0
    WHCode: number
    NoInTransaction: number = 1
    AppObjType: number = 0
    IsRadio: boolean//ti lệ %
    IsPublic: boolean = true
    NoOfReleaseForAll: boolean = false//
    IsAllRouting: boolean = true
    IdentifiedMember: boolean = false
    IsSale: boolean = false
    IsSMSSending: boolean = false
    IsAppSending: boolean = false
    IsCartNoification: boolean = false
    SMSSendDate: Date
    AppSendDate: Date
    UnitPrice: number = 0
    IsAutoNo: boolean = false
    AutoNoRange: number = 1
    TypeOfDistribution: number = 0
    ListRouting: DTOCounponRounting[] = []
}

export class DTOCouponWarehouse {
    Code: number = 0
    VoucherIssue: number
    WH: number
    WHName: string
    IsDelete: boolean = false
    IsSelected: boolean = false

    constructor(wh: number, WHName: string, IsSelected: boolean, VoucherIssue?: number) {
        this.WH = wh
        this.WHName = WHName
        this.IsSelected = IsSelected
        this.VoucherIssue = VoucherIssue
    }
}

export class DTOCouponMembership {
    Code: number = 0
    VoucherIssue: number//VoucherIssue
    StatusID: number = 0
    StatusName: string = ''
    MembershipID: number
    MembershipNo: string
    FullName: string
    CellPhone: string
}

export class DTOCouponProduct {
    Code: number = 0
    VoucherIssue: number = 0
    ProductID: number = 0
    MinQty: number = 1
    MaxQty: number = 0
    ProductName: string = ''
    Barcode: string = ''
    ImageSetting: string = ''
}

export class DTOCounponRounting {
    Code: number = 0
    VoucherIssue: number = 0
    Province: number
    District?: number
    ProvinceName: string = ''
    DistrictName: string = ''
    IsSelected: boolean = false
}

export class DTOCoupon {
    Code: number
    VoucherIssue: number
    TypeOfVoucher: number
    StatusID: number
    NoOfRelease: number
    NoOfUsed: number
    NoOfAllowed: number
    NoInTransaction: number
    MinOfOrder: number
    VoucherAmount: number
    MaxValue: number
    PeriodDay: number
    MembershipID: number
    ProductID: number
    MinQty: number
    MaxQty: number
    TypeData: number
    VoucherNo: string
    SerialNo: string
    ActiveBy: string
    CouponNameVN: string
    CouponNameEN: string
    CouponNameJP: string
    SummaryVN: string
    SummaryEN: string
    SummaryJP: string
    DescriptionVN: string
    DescriptionEN: string
    DescriptionJP: string
    IsRadio: boolean
    IsPublic: boolean = true
    IdentifiedMember: boolean
    StartDate: Date
    EndDate: Date
    ActiveDate: Date
    TypeOfDistribution: number = 0
}