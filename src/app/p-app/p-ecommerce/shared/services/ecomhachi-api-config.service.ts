//#region [begin using]
import { Injectable } from '@angular/core';
import { ApiMethodType, DTOConfig } from 'src/app/p-lib';
import { EnumWebHachi } from 'src/app/p-lib/enum/webhachi.enum';
//#endregion [end using]

@Injectable({
    providedIn: 'root'
})
export class EcomHachiApiConfigService {
    constructor() { }

    //#region [begin coding]
    //#endregion [end coding]

    getAPIList() {
        return {
            //#region cart
            GetCurrentCart: {
                url: EnumWebHachi.GetCurrentCart,
                method: ApiMethodType.post,
            },
            UpdateCart: {
                url: EnumWebHachi.UpdateCart,
                method: ApiMethodType.post,
            },
            //#endregion	
            //#region prod			
            CheckProductStock: {
                url: EnumWebHachi.CheckProductStock,
                method: ApiMethodType.post,
            },
            DeleteCartDetail: {
                url: EnumWebHachi.DeleteCartDetail,
                method: ApiMethodType.post,
            },
            AddCart: {
                url: EnumWebHachi.AddCart,
                method: ApiMethodType.post,
            },
            //#endregion
            //#region coupon			
            AddCoupon: {
                url: EnumWebHachi.AddCoupon,
                method: ApiMethodType.post,
            },
            DeleteCoupon: {
                url: EnumWebHachi.DeleteCoupon,
                method: ApiMethodType.post,
            },
            //#endregion
            //#region payment			
            GetPayments: {
                url: EnumWebHachi.GetPayments,
                method: ApiMethodType.post,
            },
            PaymentCart: {
                url: EnumWebHachi.PaymentCart,
                method: ApiMethodType.post,
            },
            GetOrderGifts: {
                url: EnumWebHachi.GetOrderGifts,
                method: ApiMethodType.post,
            },
            UpdateCartGift: {
                url: EnumWebHachi.UpdateCartGift,
                method: ApiMethodType.post,
            },
            GetProvinces: {
                url: EnumWebHachi.GetProvinces,
                method: ApiMethodType.post,
            },
            GetDistricts: {
                url: EnumWebHachi.GetDistricts,
                method: ApiMethodType.post,
            },
            GetWards: {
                url: EnumWebHachi.GetWards,
                method: ApiMethodType.post,
            },
            ChangeCartDelivery: {
                url: EnumWebHachi.ChangeCartDelivery,
                method: ApiMethodType.post,
            },
            //#region delivery
            ProfileGetAllDelivery: {
                url: EnumWebHachi.GetAllDelivery,
                method: ApiMethodType.post,
            },
            ProfileRemoveDelivery: {
                url: EnumWebHachi.RemoveDelivery,
                method: ApiMethodType.post,
            },
            ProfileUpdateDelivery: {
                url: EnumWebHachi.UpdateDelivery,
                method: ApiMethodType.post,
            },
            ProfileGetDelivery: {
                url: EnumWebHachi.GetDelivery,//
                method: ApiMethodType.post,
            },
            //#endregion
            //#endregion
            GetListProduct: {
                url: EnumWebHachi.GetListProduct,
                method: ApiMethodType.post,
            },
            GetProductByBarcode: {
                url: EnumWebHachi.GetProductByBarcode,
                method: ApiMethodType.post,
            },
            //Syn Generate Cart
            GetListGenOrder: {
                url: EnumWebHachi.GetListGenOrder,
                method: ApiMethodType.post
            },
            DeleteGenOrder: {
                url: EnumWebHachi.DeleteGenOrder,
                method: ApiMethodType.post
            },
            AssignCartStaff: {
                url: EnumWebHachi.AssignCartStaff,
                method: ApiMethodType.post
            },
            SynOrder: {
                url: EnumWebHachi.SynOrder,
                method: ApiMethodType.post
            },
            GetCardByStaff: {
                url: EnumWebHachi.GetCardByStaff,
                method: ApiMethodType.post
            },
            getuserbyphone: {
                url: EnumWebHachi.getuserbyphone,
                method: ApiMethodType.post
            },
        };
    }
}