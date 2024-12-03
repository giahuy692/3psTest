import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, OnDestroy } from '@angular/core';
import { DTOMAWebPage } from '../../dto/DTOMAWebPage.dto';
import { DTOMABannerGroup } from '../../dto/DTOMABannerGroup.dto';
import { MarBannerAPIService } from '../../services/marbanner-api.service';
import { MarketingService } from '../../services/marketing.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';


@Component({
  selector: 'app-mar-groupbanner-webpage',
  templateUrl: './mar-groupbanner-webpage.component.html',
  styleUrls: ['./mar-groupbanner-webpage.component.scss']
})
export class MarGroupbannerWebpageComponent implements OnInit, OnDestroy {
  isWebpageDialogOpened: boolean = false
  loading = false
  @Input() groupBanner: DTOMABannerGroup = new DTOMABannerGroup()
  //
  listWebpage: DTOMAWebPage[] = []
  listWebpageGroupBanner: DTOMAWebPage[] = []
  listWebpageCodeGroupBanner: number[] = []
  //
  GetGroupBanner_sst: Subscription
  GetListWebpage_sst: Subscription
  getWebpageDialogPopup_sst: Subscription

  constructor(private cdr: ChangeDetectorRef,
    public marApiService: MarBannerAPIService,
    public marService: MarketingService,
    public layoutService: LayoutService,
    
  ) { }

  ngOnInit(): void {
    

    this.getWebpageDialogPopup_sst = this.marService.getWebpageDialogPopup().subscribe(res => {
      this.isWebpageDialogOpened = res

      if (this.isWebpageDialogOpened) {
        this.p_GetListWebpage()

        if (Ps_UtilObjectService.hasValue(this.groupBanner?.Code))
          this.p_GetGroupBanner()
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (this.isWebpageDialogOpened) {
    //   this.p_GetListWebpage()

    //   if (Ps_UtilObjectService.hasValue(this.groupBanner?.Code))
    //     this.p_GetGroupBanner()
    // }
  }
  //API
  p_GetGroupBanner() {
    this.loading = true;
    var ctx = 'Lấy thông tin Chi tiết Phân nhóm Banner'

    this.GetGroupBanner_sst = this.marApiService.GetGroupBanner(this.groupBanner.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.groupBanner = res.ObjectReturn;
        this.listWebpageCodeGroupBanner = this.groupBanner.ListWebPage
        this.checkActiveWebpage()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_GetListWebpage() {
    this.loading = true;
    var ctx = 'Lấy danh sách Webpage hiển thị Banner'

    this.GetListWebpage_sst = this.marApiService.GetListWebpage().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listWebpage = res.ObjectReturn
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //CLICK
  closeWebpageDialog() {
    this.isWebpageDialogOpened = false
    this.marService.setWebpageDialogPopup(false)
  }
  //AUTORUN
  webpageDialogDisplay() {
    return this.isWebpageDialogOpened ? 'flex' : "none"
  }
  checkActiveWebpage() {
    this.listWebpageCodeGroupBanner.forEach(i => {
      var wp = this.listWebpage.find(w => w.Code == i)

      if (wp != undefined) {
        wp.Active = true;
      }
    })
  }
  ngOnDestroy(): void {
    this.GetGroupBanner_sst?.unsubscribe()
    this.GetListWebpage_sst?.unsubscribe()
    this.getWebpageDialogPopup_sst?.unsubscribe()
  }
}
