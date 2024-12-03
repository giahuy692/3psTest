import { Component, OnInit, HostListener, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { Ps_AuthService } from 'src/app/p-lib';
import { ModuleDataItem, MenuDataItem } from '../../dto/menu-data-item.dto';
import { ModuleDataAdmin } from '../../p-sitemaps/menu.data-admin';
import { DTOLSCompany } from '../../dto/DTOLSCompany.dto';
import { LayoutAPIService } from '../../services/layout-api.service';
import DTOSYSModule from '../../dto/DTOSYSModule.dto';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';
import { HriQuizSessionService } from 'src/app/p-app/p-hri/shared/services/hri-quiz-session.service';
import { DTOExam } from 'src/app/p-app/p-hri/shared/dto/DTOExam.dto';

@Component({
  selector: 'app-header-portal',
  templateUrl: './header-portal.component.html',
  styleUrls: ['./header-portal.component.scss']
})
export class HeaderPortalComponent implements OnInit, AfterContentInit {
  isGoBack: boolean = false;
  isMenuOpen: boolean = true;
  portalData: ModuleDataItem 
  idCompany: number = 0;

  windowSize: number = 0;
  curHref : string = ''
  isShow: boolean = true;
  //object
  currentModule = new ModuleDataItem()
  currentAPIModule = new DTOSYSModule()
  //list
  moduleList: Array<ModuleDataItem> = []
  allowModuleList: Array<ModuleDataItem> = []
  apiModuleList: Array<DTOSYSModule> = []

  companyDropdownList: Array<DTOLSCompany> = [];
  allowCompanyDropdownList: Array<DTOLSCompany> = [];
  userDropdownList: Array<MenuDataItem> = [];
  currentMenu: MenuDataItem;
  // Unsubscribe
  arrUnsubscribe: Subscription[] = [];
  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public activatedRoute: ActivatedRoute,
    public apiService: LayoutAPIService,
    public auth: Ps_AuthService,
    public layoutService: LayoutService, private cdr: ChangeDetectorRef,
    public quizSessionService: HriQuizSessionService) 
  {
    let a = this.layoutService.drawerAutoCollapse.subscribe(v => this.isMenuOpen = v)
    this.layoutService.drawerState.next(this.isMenuOpen);
    this.checkWindowSize();
    this.allowModuleList = ModuleDataAdmin;

    menuService.subscribeToNavigationEvents();
    this.arrUnsubscribe.push(a)
    //-------------------------------\\
    // let that = this;
    // that.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd),
    //   map(() => this.activatedRoute),
    //   map(route => {
    //     while (route.firstChild) {
    //       route = route.firstChild;
    //     }
    //     return route;
    //   }),
    //   filter(route => {
    //     return route.outlet === 'primary';
    //   }),
    // ).subscribe(route => {
    //   route.data.subscribe(
    //     () => {
    //       var company = route.snapshot.params.idCompany
    //       if (Ps_UtilObjectService.hasValue(company) && company > 0) {
    //         that.idCompany = route.snapshot.params.idCompany;
    //       }
    //     }
    //   );
    // });
  }

  ngOnInit(): void {
    // this.getLocalStorageModule(); // cũ
    this.menuService.setLocalStorageModule();
    //--------------------------------------------\\
    // this.moduleList = this.onLoadModule();
    this.moduleList = this.menuService.onLoadModule(); 
    // this.getLocalStorageCompanyList(); // cũ
    this.menuService.getLocalStorageCompanyList();
    this.menuService.currentMenu$.subscribe(v => this.currentMenu = v);
    let b = this.quizSessionService.ExamSession$.subscribe((x: DTOExam) => {
      if (x && x.StatusID !== 2) {
        this.isGoBack = true
      } else {
        this.isGoBack = false;
      }
    })
    this.checkRouting();

    let x = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkRouting();
      }
    });
    this.arrUnsubscribe.push(b,x)
  }


  ngAfterContentInit(): void {
    this.checkWindowSize();
    this.cdr.detectChanges();
    
  }

  checkRouting(){
    this.curHref = window.location.href
    this.windowSize = window.innerWidth;
    // Nếu đang ở trong bài thi thì kiểm tra kích thước màn hình ( Nếu là điện thoại thì ẩn header )
    if(this.curHref.includes('portal001-exam-detail') && this.windowSize <= 771 ){
      this.isShow = false;
    } else {
      this.isShow = true;
    }
  }

  openSidebar() {
    this.isMenuOpen = !this.isMenuOpen
    this.layoutService.drawerState.next(this.isMenuOpen);
  }

  loadData(){
    this.menuService.breadcrumbDataChanged.emit()
  }

  // loadPageBreadcrumb(){
  //   console.log('object');
  //   console.log(this.currentMenu);
  // }

  // getLocalStorageModule() {
  //   var module = localStorage.getItem('Module');
  //   var pur = this.allowModuleList.find(s => s.Code.includes('portal'))
  //   this.currentModule = Ps_UtilObjectService.hasValue(pur) ? pur : Ps_UtilObjectService.hasListValue(this.allowModuleList) ? this.allowModuleList[0] : this.currentModule

  //   if (Ps_UtilObjectService.hasValueString(module) && module != undefined) {
  //     var cacheModule = this.allowModuleList.findIndex(s => s.Code.includes(module))

  //     if (cacheModule > -1) {
  //       this.currentModule = this.allowModuleList[cacheModule]
  //     }
  //   }
  //   this.currentAPIModule = this.apiModuleList.find(s => s.ModuleID.includes(this.currentModule.Code))
  //   localStorage.setItem('Module', Ps_UtilObjectService.hasValueString(this.currentModule.Code) ? this.currentModule.Code : '')
  //   localStorage.setItem('ModuleAPI', JSON.stringify(Ps_UtilObjectService.hasValue(this.currentAPIModule) ? this.currentAPIModule : new DTOSYSModule()))
  // }
  //#region Lấy dữ liệu
  // onLoadModule() {
  //   return ModuleDataAdmin;
  // }

  //#endregion

  //#region xử lý phần company
  // getLocalStorageCompanyList() {
  //   var compList = localStorage.getItem('GetCompany')

  //   if (Ps_UtilObjectService.hasValueString(compList)) {
  //     this.companyDropdownList = JSON.parse(compList)
  //     this.getLocalStorageCompany()
  //   } else {
  //     this.p_GetCompany()
  //   }
  // }
  // getLocalStorageCompany() {
  //   var company = localStorage.getItem('Company');
  //   var companyInt = parseInt(company)

  //   if (Ps_UtilObjectService.hasValueString(company) && typeof (companyInt) === 'number' && companyInt > 0) {
  //     DTOConfig.cache.companyid = company
  //     this.idCompany = companyInt
  //   }
  //   else {
  //     DTOConfig.cache.companyid = this.companyDropdownList[0].Code.toString()
  //     this.idCompany = this.companyDropdownList[0].Code
  //   }
  //   localStorage.setItem('Company', DTOConfig.cache.companyid);
  //   //update url without refreshing
  //   var asd = this.router.url.split('/')
  //   asd.splice(asd.length - 1, 1, DTOConfig.cache.companyid)
  //   window.history.replaceState({ idCompany: this.idCompany }, '', '#' + asd.join('/'))
  //   //
  //   this.getLocalStorageModuleList()
  // }
  // p_GetCompany() {
  //   let that = this

  //   let a =  that.apiService.GetCompany().subscribe(res => {
  //     if (res != null) {
  //       that.companyDropdownList = res;
  //       localStorage.setItem('GetCompany', JSON.stringify(that.companyDropdownList))
  //       that.getLocalStorageCompany()
  //     }
  //   });
  //   this.arrUnsubscribe.push(a);
    
  // }
  // getLocalStorageModuleList() {
  //   var molList = localStorage.getItem('GetModule')

  //   if (Ps_UtilObjectService.hasValueString(molList)) {
  //     this.apiModuleList = JSON.parse(molList)
  //     this.getAllowModule()
  //   } else {
  //     this.p_GetModule()
  //   }
  // }
  //#endregion

  //#region handle Module
  // getAllowModule() {
  //   this.allowModuleList = [];

  //   orderBy(this.apiModuleList, [{ field: 'OrderBy', dir: 'asc' }]).forEach((a) => {
  //     this.moduleList.forEach((b) => {
  //       if (
  //         Ps_UtilObjectService.hasListValue(a.ListFunctions) ||
  //         Ps_UtilObjectService.hasListValue(a.ListGroup)
  //       )
  //         if (a.ModuleID == b.Code) {
  //           this.allowModuleList.push(b);
  //         }
  //     });
  //   });

  //   this.getLocalStorageModule()
  //   this.menuService.activeModule(this.currentModule)
  // }
  // p_GetModule() {
  //   let that = this

  //   let a =  that.apiService.GetModule()
  //     .subscribe(res => {
  //       if (res != null) {
  //         that.apiModuleList = res;
  //         localStorage.setItem('GetModule', JSON.stringify(that.apiModuleList))
  //         that.getAllowModule()
  //       }
  //     })
  //     this.arrUnsubscribe.push(a);
  // }
  //#endregion


  
  //#region Lăng nghe sự thay đổi về kích thước của màn hình.
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
    this.checkRouting();
  }


  checkWindowSize() {
    const screenWidth = window.innerWidth;
  
    if (screenWidth <= 768) {
      this.isMenuOpen = false;
    } else {
      this.isMenuOpen = true;
    }
    this.layoutService.drawerState.next(this.isMenuOpen);
  }
  //#endregion

  // Handle click quay về ERP
  goToEERP(){
    this.menuService.switchToLayout('erp');
  }
  
  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }
}