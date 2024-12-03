import { DTOPromotionImage } from "src/app/p-app/p-marketing/shared/dto/DTOPromotionProduct.dto";
import { DTODetailConfProduct } from "./DTOConfProduct";

export class DTOHamperRequest extends DTODetailConfProduct {
    StockKeepingUnit: string = ''
    ListProduct: string[] = []
    VNName: string = ''
    VNMaterial: string = ''
    ENName: string = ''
    ENMaterial: string = ''
    JPName: string = ''
    JPMaterial: string = ''
    URLThumbImage: string = ''
    StatusWhole: number = 0;
    VNSpec: string = ''
    Manufacturer: number = 0
    Company: number = 0
    Quantity: number = 0 
    ProductExtensionID: string = ''
    RefVName: string = ''
    COName: string = ''
    InnerCBM: string = ''
    BaseUnitCBM: string = ''
    CartonCBM: string = ''
    PalletCBM: string = ''
    SKU: number = 0
    Warehouse: number = 0
    WarehouseName: string = ''
    Stock: number = 0
    MembershipPrice: number = 0
    BasePrice: number = 0
    PromotionID: number = 0
    PromotionName: string = ''
    CreateExtensionBy: string = ''
    CreateExtensionTime: Date | string = ''
    LastModifiedExtensionBy: string = ''
    LastModifiedExtensionTime: Date | string = ''
    ApprovedBy: string = ''
    ApprovedDate: Date | string = ''
    CreateBy: string = ''
    CreateTime: Date | string = ''
    IsHachi24h: boolean = false
    IsOnlineBuy: boolean = false
    IsStoreBuy: boolean = false
    IsWholeBuy: boolean = false
    IsStaffBuy: boolean = false
    Product: number = 0
    WithoutStores: string = '[]'
    ListImage: DTOPromotionImage[] = []
}


export class DTOConfGroup {
    Code: number = 0
    Company: number = 0
    GroupID: number = null
    GroupName: string = ''
    Level: number = 0
    ParentID: null
    OrderBy: number = 0
    Remark: null
    CreateBy: string = ''
    CreateTime: Date | string
    LastModifiedBy: string = ''
    LastModifiedTime: Date | string
}


export class DTOConfApplyCompany extends DTODetailConfProduct {
    Code: number = null
    Company: number = null
    CompanyName: string = ''
    GroupID: number = null
    GroupID1: number = null
    GroupID2: number = null
    GroupID3: number = null
    GroupID4: number = null
    UnitPrice: number = 0
    BasePrice: number = 0
    Status: number = 0
    StatusName: string = ''
    Currency: number
    CurrencyName: string = ''
}

export class DTOConfHamperProducts extends DTOHamperRequest{
    ParentName: string = ''
    ParentBarcode: string = ''
    ChildPrice: number = 0
    ChildName:string = ''
    ChildBarcode:string = ''
    Parent: number = 0
    Child: number = 0
    ChildQty:number = 0
}