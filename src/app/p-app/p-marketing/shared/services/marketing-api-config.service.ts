import { Injectable } from '@angular/core';
import { ApiMethodType, DTOAPI, DTOConfig } from 'src/app/p-lib';
import { EnumMarketing } from 'src/app/p-lib/enum/marketing.enum';
import { Ps_URL_Service } from 'src/app/p-lib/utilities/url.service';

@Injectable({
  providedIn: 'root',
})
export class MarketingApiConfigService {
  // urlService = new Ps_URL_Service(DTOConfig.appInfo.apimar);

  constructor() { }

  getAPIList() {
    return {
      //Banner
      GetListBanner: new DTOAPI({
        method: ApiMethodType.post,
        // url: DTOConfig.appInfo.apimar + "webadmin/GetListBanner"
        url: EnumMarketing.GetListBanner,
      }),
      GetBanner: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBanner,
      }),
      UpdateBanner: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateBanner,
      }),
      UpdateBannerStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateBannerStatus,
      }),
      DeleteBanner: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteBanner,
      }),
      //GroupBanner
      GetListGroupBanner: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListGroupBanner,
      }),
      GetGroupBanner: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetGroupBanner,
      }),
      //Folder Banner
      GetBannerFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBannerFolder,
      }),
      GetBannerFolderDrill: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBannerFolderDrill,
      }),
      GetBannerFolderWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBannerFolderWithFile,
      }),
      GetBannerFolderDrillWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBannerFolderDrillWithFile,
      }),
      // CreateBannerFolder: new DTOAPI({
      // 	method: ApiMethodType.post,
      // 	url: EnumMarketing.CreateBannerFolder
      // }),
      // RenameBannerFolder: new DTOAPI({
      // 	method: ApiMethodType.post,
      // 	url: EnumMarketing.RenameBannerFolder
      // }),
      // DeleteBannerFolder: new DTOAPI({
      // 	method: ApiMethodType.post,
      // 	url: EnumMarketing.DeleteBannerFolder
      // }),
      CreateFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.CreateFolder,
      }),
      RenameFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.RenameFolder,
      }),
      DeleteFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteFolder,
      }),
      //File Banner
      // UploadBanner: new DTOAPI({
      // 	method: ApiMethodType.post,
      // 	url: EnumMarketing.UploadBanner
      // }),
      UploadFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UploadFile,
      }),
      RenameFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.RenameFile,
      }),
      DeleteFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteFile,
      }),
      //Webpage
      GetListWebpage: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListWebpage,
      }),
      //promotion
      GetListPromotion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPromotion,
      }),
      GetPromotionByCode: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionByCode,
      }),
      GetListPromotionType: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPromotionType,
      }),
      GetPromotionListGroupOfCard: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionListGroupOfCard,
      }),
      GetPromotionDayOfWeek: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionDayOfWeek,
      }),
      GetPromotionWareHouse: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionWareHouse,
      }),
      //update promotion
      UpdatePromotion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotion,
      }),
      UpdatePromotionStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionStatus,
      }),
      DeletePromotion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeletePromotion,
      }),
      UpdatePromotionWH: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionWH,
      }),
      UpdatePromotionListOfCard: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionListOfCard,
      }),
      UpdatePromotionDayOfWeek: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionDayOfWeek,
      }),
      //detail promotion
      GetListPromotionDetail: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPromotionDetail,
      }),
      GetPromotionProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionProduct,
      }),
      GetComboProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetComboProduct,
      }),
      UpdatePromotionDetail: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionDetail,
      }),
      DeletePromotionDetail: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeletePromotionDetail,
      }),
      ExportListPromotionDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ExportListPromotionDetails,
      }),
      //combo
      GetListPromotionCombo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPromotionCombo,
      }),
      GetPromotionCombo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionCombo,
      }),
      UpdatePromotionCombo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionCombo,
      }),
      DeletePromotionCombo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeletePromotionCombo,
      }),
      DeleteCombo: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCombo,
      }),
      ImportExcelListComboGiftset: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelListComboGiftset,
      }),
      ImportExcelComboGiftsetProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelComboGiftsetProduct,
      }),
      //promotion inv
      GetPromotionInv: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionInv,
      }),
      UpdatePromotionInv: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePromotionInv,
      }),
      DeletePromotionInv: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeletePromotionInv,
      }),
      //folder promotion
      GetPromotionFolder: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionFolder,
      }),
      GetPromotionFolderDrill: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionFolderDrill,
      }),
      GetPromotionFolderWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionFolderWithFile,
      }),
      GetPromotionFolderDrillWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPromotionFolderDrillWithFile,
      }),
      ImportExcelPromotionDetail: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelPromotionDetail,
      }),
      ImportExcelPromotionHamper: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelPromotionHamper,
      }),
      // Hamper
      GetListHamper: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListHamper,
      }),
      GetHamperByBarcode: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetHamperByBarcode,
      }),
      ExportHamperPromotionReport: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ExportHamperPromotionReport,
      }),
      //news product
      GetListWebContent: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListWebContent,
      }),
      GetWebContent: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetWebContent,
      }),
      GetWebContentByCode: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetWebContentByCode,
      }),
      UpdateWebContent: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateWebContent,
      }),
      UpdateWebContentStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateWebContentStatus,
      }),
      DeleteWebContent: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteWebContent,
      }),
      GetNewsFolderDrillWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetFolderDrillWithFile,
      }),
      GetFolderWithFile: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetFolderWithFile,
      }),
      //coupon policy
      GetListCouponIssued: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCouponIssued,
        // url: DTOConfig.appInfo.apierp + "coupon/GetListCouponIssued"
      }),
      GetCouponIssuedByCode: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCouponIssuedByCode,
        // url: DTOConfig.appInfo.apierp + "coupon/GetCouponIssuedByCode"
      }),
      UpdateCouponIssued: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssued,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssued"
      }),
      UpdateCouponIssuedStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssuedStatus,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssuedStatus"
      }),
      UpdateCouponStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponStatus,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponStatus"
      }),
      DeleteCouponIssued: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCouponIssued,
        // url: DTOConfig.appInfo.apierp + "coupon/DeleteCouponIssued"
      }),
      GetCouponIssuedWareHouse: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCouponIssuedWareHouse,
        // url: DTOConfig.appInfo.apierp + "coupon/GetCouponIssuedWareHouse"
      }),
      UpdateCouponIssuedWH: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssuedWH,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssuedWH"
      }),
      GetListCouponIssuedMembership: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCouponIssuedMembership,
        // url: DTOConfig.appInfo.apierp + "coupon/GetListCouponIssuedMembership"
      }),
      GetCouponIssuedMembership: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCouponIssuedMembership,
        // url: DTOConfig.appInfo.apierp + "coupon/GetCouponIssuedMembership"
      }),
      GetMembershipByPhone: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetMembershipByPhone,
        // url: DTOConfig.appInfo.apierp + "coupon/GetMembershipByPhone"
      }),
      UpdateCouponIssuedMembership: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssuedMembership,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssuedMembership"
      }),
      DeleteCouponIssuedMembership: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCouponIssuedMembership,
        // url: DTOConfig.appInfo.apierp + "coupon/DeleteCouponIssuedMembership"
      }),
      GetListCouponIssuedProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCouponIssuedProduct,
        // url: DTOConfig.appInfo.apierp + "coupon/GetListCouponIssuedProduct"
      }),
      GetCouponIssuedProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCouponIssuedProduct,
        // url: DTOConfig.appInfo.apierp + "coupon/GetCouponIssuedProduct"
      }),
      UpdateCouponIssuedProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssuedProduct,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssuedProduct"
      }),
      DeleteCouponIssuedProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCouponIssuedProduct,
        // url: DTOConfig.appInfo.apierp + "coupon/DeleteCouponIssuedProduct"
      }),
      UpdateCouponIssuedRounting: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponIssuedRounting,
        // url: DTOConfig.appInfo.apierp + "coupon/UpdateCouponIssuedRounting"
      }),
      DeleteCouponIssuedRounting: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCouponIssuedRounting,
        // url: DTOConfig.appInfo.apierp + "coupon/DeleteCouponIssuedRounting"
      }),
      GetListCoupon: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCoupon,
        // url: DTOConfig.appInfo.apierp + "coupon/GetListCoupon"
      }),
      ImportExcelCouponIssueMembership: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelCouponIssueMembership,
        // url: DTOConfig.appInfo.apierp + "coupon/ImportExcelCouponIssueMembership"
      }),
      ImportExcelCouponIssueProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelCouponIssueProduct,
        // url: DTOConfig.appInfo.apierp + "coupon/ImportExcelCouponIssueProduct"
      }),
      ExportListCoupon: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ExportListCoupon,
        // url: DTOConfig.appInfo.apierp + "coupon/ExportListCoupon"//todo cái này không có trong PERP_ERP/coupon
      }),
      //Conf Product
      UpdateProductBestPriceByID: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateProductBestPriceByID,
      }),
      DeleteProductBestPriceByID: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteProductBestPriceByID,
      }),
      UpdateProductSpecialByID: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateProductSpecialByID,
      }),
      DeleteProductSpecialByID: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteProductSpecialByID,
      }),
      //album
      GetListAlbum: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListAlbum,
      }),
      GetAlbum: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetAlbum,
      }),
      UpdateAlbum: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateAlbum,
      }),
      UpdateAlbumStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateAlbumStatus,
      }),
      DeleteAlbum: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteAlbum,
      }),
      GetListAlbumDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListAlbumDetails,
      }),
      GetAlbumDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetAlbumDetails,
      }),
      GetAlbumDetailsByBarcode: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetAlbumDetailsByBarcode,
      }),
      UpdateAlbumDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateAlbumDetails,
      }),
      DeleteAlbumDetails: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteAlbumDetails,
      }),
      //Post APi
      GetListBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListBlog,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListBlog"
      }),
      GetBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetBlog,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetBlog"
      }),
      UpdateBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateBlog,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateBlog"
      }),
      UpdateBlogStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateBlogStatus,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateBlogStatus"
      }),
      UpdateBlogCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateBlogCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateBlogCategory"
      }),
      DeleteBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteBlog,
        // url: DTOConfig.appInfo.apierp + "webadmin/DeleteBlog"
      }),
      GetListBlogCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListBlogCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListBlogCategory"
      }),
      // News API
      GetListNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListNews,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListNews"
      }),
      GetNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetNews,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetNews"
      }),
      UpdateNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateNews,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateNews"
      }),
      UpdateCMSNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCMSNews,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateNews"
      }),
      UpdateNewsStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateNewsStatus,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateNewsStatus"
      }),
      UpdateNewsCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateNewsCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateNewsCategory"
      }),
      DeleteNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteNews,
        // url: DTOConfig.appInfo.apierp + "webadmin/DeleteNews"
      }),
      GetListNewsCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListNewsCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListNewsCategory"
      }),
      GetListCMSNews: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCMSNews,
      }),
      GetListCMSNewsCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCMSNewsCategory,
      }),

      GetCMSNews : new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCMSNews ,
      }),

      // Policy API
      GetListPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPolicy,
      }),
      GetPolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetPolicy,
      }),
      UpdatePolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePolicy,
      }),
      UpdatePolicyStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePolicyStatus,
      }),
      UpdatePolicyCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdatePolicyCategory,
      }),

      DeletePolicy: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeletePolicy,
      }),
      GetListPolicyCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListPolicyCategory,
      }),
      // Introduce API
      GetListIntroduce: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListIntroduce,
      }),
      GetIntroduce: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetIntroduce,
      }),
      UpdateIntroduce: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateIntroduce,
      }),
      UpdateIntroduceStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateIntroduceStatus,
      }),
      UpdateIntroduceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateIntroduceCategory,
      }),
      DeleteIntroduce: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteIntroduce,
      }),
      GetListIntroduceCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListIntroduceCategory,
      }),
      // Store API
      GetListStore: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListStore,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListStore"
      }),
      GetListProvince: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListProvince,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListProvince"
      }),
      GetListCountry: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCountry,
      }),
      GetStore: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetStore,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetStore"
      }),
      UpdateStore: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateStore,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateStore"
      }),
      DeleteStore: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteStore,
        // url: DTOConfig.appInfo.apierp + "webadmin/DeleteStore"
      }),
      // Question API
      GetListQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListQuestion,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListQuestion"
      }),
      GetQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetQuestion,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetQuestion"
      }),
      UpdateQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateQuestion,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateQuestion"
      }),
      UpdateQuestionStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateQuestionStatus,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateQuestionStatus"
      }),
      UpdateQuestionCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateQuestionCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/UpdateQuestionCategory"
      }),
      DeleteQuestion: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteQuestion,
        // url: DTOConfig.appInfo.apierp + "webadmin/DeleteQuestion"
      }),
      GetListQuestionCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListQuestionCategory,
        // url: DTOConfig.appInfo.apierp + "webadmin/GetListQuestionCategory"
      }),
      // CouponGroup API
      GetListCouponGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListCouponGroup,
      }),
      GetCouponGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetCouponGroup,
      }),
      UpdateCouponGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateCouponGroup,
      }),
      DeleteCouponGroup: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteCouponGroup,
      }),
      // Hashtag API
      GetListHashtag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListHashTag,
      }),
      GetHashtag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetHashtag,
      }),
      GetHashtagProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetHashtagProduct,
      }),
      GetHashtagBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetHashtagBlog,
      }),
      UpdateHashtagStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateHashTagStatus,
      }),
      UpdateHashtag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateHashtag,
      }),
      DeleteHashtag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteHashtag,
      }),
      ImportExcelBlog: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelBlog,
      }),
      ImportExcelHashtag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelHashtag,
      }),
      ImportExcelHashtagProduct: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelHashtagProduct,
      }),

      //CategoryWeb
      GetListGroupWebTree: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListGroupWebTree,
      }),
      GetListGroupWeb: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListGroupWeb,
      }),
      GetGroupWeb: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetGroupWeb,
      }),
      UpdateGroupWeb: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateGroupWeb
      }),
      DeleteGroupWeb: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteGroupWeb
      }),
      ImportExcelGroupWeb: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.ImportExcelGroupWeb
      }),

      //MetaTag
      UpdateProductMetaTag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateProductMetaTag,
      }),
      UpdateNewsMetaTag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateNewsMetaTag,
      }),
      UpdateProductMetaTagStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateProductMetaTagStatus,
      }),
      UpdateNewsMetaTagStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateNewsMetaTagStatus,
      }),


      // SearchKeyword API
      GetListSearchKeyword: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListSearchKeyword,
      }),
      GetSearchKeyword: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetSearchKeyword
      }),
      UpdateSearchKeyword: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateSearchKeyword
      }),
      UpdateStatusSearchKeyword: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateStatusSearchKeyword
      }),
      DeleteSearchKeyword: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.DeleteSearchKeyword
      }),
      GetListMetaTagCategory: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListMetaTagCategory
      }),

      GetListMetaTag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.GetListMetaTag
      }),

      UpdateMetaTag: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateMetaTag
      }),

      UpdateMetaTagStatus: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.UpdateMetaTagStatus
      }),
      CropProductImage: new DTOAPI({
        method: ApiMethodType.post,
        url: EnumMarketing.CropProductImage
      }),
    };
  }
}
