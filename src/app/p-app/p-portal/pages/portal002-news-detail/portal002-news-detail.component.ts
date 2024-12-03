import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import DTOMANews_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { MarNewsAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-news-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
@Component({
  selector: 'app-portal002-news-detail',
  templateUrl: './portal002-news-detail.component.html',
  styleUrls: ['./portal002-news-detail.component.scss']
})
export class Portal002NewsDetailComponent {

  dataNew = new DTOMANews_ObjReturn()

  ngOnInit() {
    this.getCache()
  }

  constructor(private apiMarketing: MarNewsAPIService, 
    private helperService: PS_HelperMenuService, 
    private sanitizer: DomSanitizer,
    private layout: LayoutService) {

  }

  getCache() {
    this.dataNew = JSON.parse(localStorage.getItem('newInfo'))
    //this.APIGetNew()
  }

  // APIGetNew() {
  //   this.apiMarketing.GetNews(this.dataNew.Code).subscribe((res: any) => {
  //     this.dataNew = res.ObjectReturn
  //   })
  // }

  menuState: boolean = false;
  onNavigate() {
    this.menuState = !this.menuState;
    this.layout.drawerState.next(this.menuState);
    // var parent = ModuleDataAdmin.find((s) => s.Code.includes('portal'));
    // this.helperService.activeMenu(parent);
  }

  // Hàm by pass content HTML cho bài viết
  getSafeContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.dataNew.ContentVN ? this.dataNew.ContentVN : '')
  }

  onReturn() {
    window.history.back()
  }
}
