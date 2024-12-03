import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Mar001BannerComponent } from './pages/mar001-banner/mar001-banner.component';
import { PMarketingComponent } from './p-marketing.component';
import { Mar001DiscountProductComponent } from './pages/mar001-discount-product/mar001-discount-product.component';
import { Mar001DiscountDetailComponent } from './pages/mar001-discount-detail/mar001-discount-detail.component';
import { Mar001ReportComponent } from './pages/mar001-report/mar001-report.component';
import { Mar002DiscountComboComponent } from './pages/mar002-discount-combo/mar002-discount-combo.component';
import { Mar002DiscountComboDetailComponent } from './pages/mar002-discount-combo-detail/mar002-discount-combo-detail.component';
import { Mar001ReportImportComponent } from './pages/mar001-report-import/mar001-report-import.component';
import { Mar003NewsProductComponent } from './pages/mar003-news-product/mar003-news-product.component';
import { Mar003NewsProductDetailComponent } from './pages/mar003-news-product-detail/mar003-news-product-detail.component';
import { Mar004CouponListComponent } from './pages/mar004-coupon-list/mar004-coupon-list.component';
import { Mar004CouponDetailComponent } from './pages/mar004-coupon-detail/mar004-coupon-detail.component';
import { Mar005CouponGroupComponent } from './pages/mar005-coupon-group/mar005-coupon-group.component';
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
import { Mar015CommonQuestionsDetailComponent } from './pages/mar015-common-questions-detail/mar015-common-questions-detail.component';
import { Mar015CommonQuestionsListComponent } from './pages/mar015-common-questions-list/mar015-common-questions-list.component';
import { Mar016HashtagListComponent } from './pages/mar016-hashtag-list/mar016-hashtag-list.component';
import { Mar016HashtagDetailComponent } from './pages/mar016-hashtag-detail/mar016-hashtag-detail.component';
import { Mar017CategoryWebComponent } from './pages/mar017-category-web/mar017-category-web.component';
import { Mar018SearchKeywordComponent } from './pages/mar018-search-keyword/mar018-search-keyword.component';
import { Mar018MetatagComponent } from './pages/mar018-metatag/mar018-metatag.component';
import { Mar019DiscountHamperComponent } from './pages/mar019-discount-hamper/mar019-discount-hamper.component';
import { Mar019DiscountHamperDetailComponent } from './pages/mar019-discount-hamper-detail/mar019-discount-hamper-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PMarketingComponent,
    children: [
      {
        path: '',
        component: PMarketingComponent,
      },
      {
        path: 'mar001-banner/:idCompany',
        component: Mar001BannerComponent,
      },
      {
        path: 'mar001-discount-product/:idCompany',
        component: Mar001DiscountProductComponent,
      },
      {
        path: 'mar001-discount-detail/:idCompany',
        component: Mar001DiscountDetailComponent,
      },
      {
        path: 'mar002-discount-combo/:idCompany',
        component: Mar002DiscountComboComponent,
      },
      {
        path: 'mar002-discount-combo-detail/:idCompany',
        component: Mar002DiscountComboDetailComponent,
      },
      {
        path: 'mar003-news-product/:idCompany',
        component: Mar003NewsProductComponent,
      },
      {
        path: 'mar003-news-product-detail/:idCompany',
        component: Mar003NewsProductDetailComponent,
      },
      {
        path: 'mar001-report/:idCompany',
        component: Mar001ReportComponent,
      },
      {
        path: 'mar001-report-import/:idCompany',
        component: Mar001ReportImportComponent,
      },
      {
        path: 'mar004-coupon-list/:idCompany',
        component: Mar004CouponListComponent,
      },
      {
        path: 'mar004-coupon-detail/:idCompany',
        component: Mar004CouponDetailComponent,
      },
      {
        path: 'mar005-coupon-group/:idCompany',
        component: Mar005CouponGroupComponent,
      },
      {
        path: 'mar006-bestprice-list/:idCompany',
        component: Mar006BestpriceListComponent,
      },
      {
        path: 'mar007-special-product-list/:idCompany',
        component: Mar007SpecialProductListComponent,
      },
      {
        path: 'mar008-album-list/:idCompany',
        component: Mar008AlbumListComponent,
      },
      {
        path: 'mar008-album-detail/:idCompany',
        component: Mar008AlbumDetailComponent,
      },
      {
        path: 'mar009-banner-list/:idCompany',
        component: Mar009BannerListComponent,
      },
      {
        path: 'mar009-banner-detail/:idCompany',
        component: Mar009BannerDetailComponent,
      },
      {
        path: 'mar010-post-list/:idCompany',
        component: Mar010PostListComponent,
      },
      {
        path: 'mar010-post-detail/:idCompany',
        component: Mar010PostDetailComponent,
      },
      {
        path: 'mar011-news-list/:idCompany',
        component: Mar011NewsListComponent,
      },
      {
        path: 'mar011-news-detail/:idCompany',
        component: Mar011NewsDetailComponent,
      },
      {
        path: 'mar012-policy-list/:idCompany',
        component: Mar012PolicyListComponent,
      },
      {
        path: 'mar012-policy-detail/:idCompany',
        component: Mar012PolicyDetailComponent,
      },
      {
        path: 'mar013-introduce-list/:idCompany',
        component: Mar013IntroduceListComponent,
      },
      {
        path: 'mar013-introduce-detail/:idCompany',
        component: Mar013IntroduceDetailComponent,
      },
      {
        path: 'mar014-store-system-list/:idCompany',
        component: Mar014StoreSystemListComponent,
      },
      {
        path: 'mar015-common-questions-list/:idCompany',
        component: Mar015CommonQuestionsListComponent,
      },
      {
        path: 'mar015-common-questions-detail/:idCompany',
        component: Mar015CommonQuestionsDetailComponent,
      },
      {
        path: 'mar016-hashtag-list/:idCompany',
        component: Mar016HashtagListComponent,
      },
      {
        path: 'mar016-hashtag-detail/:idCompany',
        component: Mar016HashtagDetailComponent,
      },
      {
        path: 'mar017-category-web/:idCompany',
        component: Mar017CategoryWebComponent,
      },
      {
        path: "mar018-metatag/:idCompany",
        component: Mar018MetatagComponent,
      },
      {
        path: "mar018-search-keyword/:idCompany",
        component: Mar018SearchKeywordComponent,
      },
      {
        path: "mar019-discount-hamper/:idCompany",
        component: Mar019DiscountHamperComponent,
      },
      {
        path: "mar019-discount-hamper-detail/:idCompany",
        component: Mar019DiscountHamperDetailComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PMarketingRoutingModule {}
