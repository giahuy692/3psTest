import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA, } from '@angular/core';
import { PMarketingRoutingModule } from './p-marketing-routing.module';
import { Mar001BannerComponent } from './pages/mar001-banner/mar001-banner.component';
import { PMarketingComponent } from './p-marketing.component';
import { Mar001DiscountProductComponent } from './pages/mar001-discount-product/mar001-discount-product.component';
import { PLayoutModule } from '../p-layout/p-layout.module';
import { MarGroupbannerWebpageComponent } from './shared/components/mar-groupbanner-webpage/mar-groupbanner-webpage.component';
import { Mar001DiscountDetailComponent } from './pages/mar001-discount-detail/mar001-discount-detail.component';
import { Mar001ReportComponent } from './pages/mar001-report/mar001-report.component';
import { Mar002DiscountComboComponent } from './pages/mar002-discount-combo/mar002-discount-combo.component';
import { Mar002DiscountComboDetailComponent } from './pages/mar002-discount-combo-detail/mar002-discount-combo-detail.component';
import { Mar001ReportImportComponent } from './pages/mar001-report-import/mar001-report-import.component';
import { Mar003NewsProductComponent } from './pages/mar003-news-product/mar003-news-product.component';
import { Mar003NewsProductDetailComponent } from './pages/mar003-news-product-detail/mar003-news-product-detail.component';
import { Mar004CouponListComponent } from './pages/mar004-coupon-list/mar004-coupon-list.component';
import { Mar004CouponDetailComponent } from './pages/mar004-coupon-detail/mar004-coupon-detail.component';
import { Mar006BestpriceListComponent } from './pages/mar006-bestprice-list/mar006-bestprice-list.component';
import { Mar007SpecialProductListComponent } from './pages/mar007-special-product-list/mar007-special-product-list.component';
import { Mar008AlbumListComponent } from './pages/mar008-album-list/mar008-album-list.component';
import { Mar008AlbumDetailComponent } from './pages/mar008-album-detail/mar008-album-detail.component';
import { Mar009BannerListComponent } from './pages/mar009-banner-list/mar009-banner-list.component';
import { Mar009BannerDetailComponent } from './pages/mar009-banner-detail/mar009-banner-detail.component';
import { Mar010PostListComponent } from './pages/mar010-post-list/mar010-post-list.component';
import { Mar010PostDetailComponent } from './pages/mar010-post-detail/mar010-post-detail.component';
import { Mar011NewsListComponent } from './pages/mar011-news-list/mar011-news-list.component';
import { Mar011NewsDetailComponent } from './pages/mar011-news-detail/mar011-news-detail.component';
import { Mar012PolicyListComponent } from './pages/mar012-policy-list/mar012-policy-list.component';
import { Mar012PolicyDetailComponent } from './pages/mar012-policy-detail/mar012-policy-detail.component';
import { Mar013IntroduceListComponent } from './pages/mar013-introduce-list/mar013-introduce-list.component';
import { Mar013IntroduceDetailComponent } from './pages/mar013-introduce-detail/mar013-introduce-detail.component';
import { Mar014StoreSystemListComponent } from './pages/mar014-store-system-list/mar014-store-system-list.component';
import { Mar015CommonQuestionsListComponent } from './pages/mar015-common-questions-list/mar015-common-questions-list.component';
import { Mar015CommonQuestionsDetailComponent } from './pages/mar015-common-questions-detail/mar015-common-questions-detail.component';
import { Mar005CouponGroupComponent } from './pages/mar005-coupon-group/mar005-coupon-group.component';
import { Mar016HashtagDetailComponent } from './pages/mar016-hashtag-detail/mar016-hashtag-detail.component';
import { Mar016HashtagListComponent } from './pages/mar016-hashtag-list/mar016-hashtag-list.component';
import { Mar017CategoryWebComponent } from './pages/mar017-category-web/mar017-category-web.component';
import { Mar018MetatagComponent } from './pages/mar018-metatag/mar018-metatag.component';
import { Mar018SearchKeywordComponent } from './pages/mar018-search-keyword/mar018-search-keyword.component';
import { Mar019DiscountHamperComponent } from './pages/mar019-discount-hamper/mar019-discount-hamper.component';
import { Mar019DiscountHamperDetailComponent } from './pages/mar019-discount-hamper-detail/mar019-discount-hamper-detail.component';
import { MarPromotionInforComponent } from './shared/components/mar-discount-infor/mar-promotion-infor.component';
import { MarConditionApplyComponent } from './shared/components/mar-condition-apply/mar-condition-apply.component';

@NgModule({
  declarations: [
    PMarketingComponent,
    Mar001BannerComponent,
    MarPromotionInforComponent,
    MarConditionApplyComponent,  
    MarGroupbannerWebpageComponent,
    Mar001DiscountProductComponent,
    Mar001DiscountDetailComponent,
    Mar002DiscountComboComponent,
    Mar002DiscountComboDetailComponent,
    Mar003NewsProductComponent,
    Mar003NewsProductDetailComponent,
    Mar001ReportComponent,
    Mar001ReportImportComponent,
    Mar004CouponListComponent,
    Mar004CouponDetailComponent,
    Mar006BestpriceListComponent,
    Mar007SpecialProductListComponent,
    Mar008AlbumListComponent,
    Mar008AlbumDetailComponent,
    Mar009BannerListComponent,
    Mar009BannerDetailComponent,
    Mar010PostListComponent,
    Mar010PostDetailComponent,
    Mar011NewsListComponent,
    Mar011NewsDetailComponent,
    Mar012PolicyListComponent,
    Mar012PolicyDetailComponent,
    Mar013IntroduceListComponent,
    Mar013IntroduceDetailComponent,
    Mar014StoreSystemListComponent,
    Mar015CommonQuestionsListComponent,
    Mar015CommonQuestionsDetailComponent,
    Mar005CouponGroupComponent,
    Mar016HashtagDetailComponent,
    Mar016HashtagListComponent,
    Mar017CategoryWebComponent,
    Mar018MetatagComponent,
    Mar018SearchKeywordComponent,
    Mar019DiscountHamperComponent,
    Mar019DiscountHamperDetailComponent,
  ],
  imports: [
    PLayoutModule,
    PMarketingRoutingModule,
   ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class PMarketingModule { }
