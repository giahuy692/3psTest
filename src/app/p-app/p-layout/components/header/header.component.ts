import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { Ps_AuthService, Ps_UtilObjectService, DTOConfig } from 'src/app/p-lib';
import { ModuleDataItem, MenuDataItem } from '../../dto/menu-data-item.dto';
import { DTOLSCompany } from '../../dto/DTOLSCompany.dto';
import { LayoutAPIService } from '../../services/layout-api.service';
import { UserDropdownData } from '../../p-sitemaps/user.dropdown.data';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';
import { EnumLayout } from 'src/app/p-lib/enum/layout.enum';
import { ModuleDataAdmin } from '../../p-sitemaps/menu.data-admin';
import { MessagingService } from '../../services/messaging.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showUser: boolean = false
  showCompany: boolean = false
  idCompany: number = 0;
  //object
  currentModule = new ModuleDataItem()
  // currentAPIModule = new DTOSYSModule()
  //list
  // moduleList: Array<ModuleDataItem> = []
  allowModuleList: Array<ModuleDataItem> = []
  // apiModuleList: Array<DTOSYSModule> = []

  companyDropdownList: Array<DTOLSCompany> = [];
  // allowCompanyDropdownList: Array<DTOLSCompany> = [];
  userDropdownList: Array<MenuDataItem> = []

  notiAnchor: ElementRef<any>
  isExpandNotifi: boolean = false

  subArr: Subscription[] = []
  //element
  @ViewChild('userAnchor') userAnchor;
  @ViewChild('companyAnchor') companyAnchor;

  constructor(
    public router: Router,
    public menuService: PS_HelperMenuService,
    public activatedRoute: ActivatedRoute,
    public apiService: LayoutAPIService,
    public auth: Ps_AuthService,
    public layoutService: LayoutService,
    private messagingService: MessagingService) {
    // let that = this;

    // var sst = that.router.events.pipe(
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
    //   var sst2 = route.data.subscribe(
    //     () => {
    //       var company = route.snapshot.params.idCompany
    //       if (Ps_UtilObjectService.hasValue(company) && company > 0) {
    //         that.idCompany = route.snapshot.params.idCompany;

    //         // if (that.listMenu.length > 0) {
    //         // that.p_CheckActiveMenuParent();
    //         // }
    //       }
    //     }
    //   );
    //   that.subArr.push(sst2)
    // });
    // that.subArr.push(sst)
    menuService.subscribeToNavigationEvents();
  }
  message: any;
  ngOnInit(): void {
    this.userDropdownList = this.onLoadUserDropdown()
    // this.moduleList = this.menuService.onLoadModule();
    // this.getLocalStorageCompanyList()
    this.menuService.getLocalStorageCompanyList();
    let a = this.menuService.idCompany$.subscribe(v => { this.idCompany = v })
    let b = this.menuService.companyDropdownList$.subscribe(v => this.companyDropdownList = v)
    let c = this.menuService.allowModuleList$.subscribe(v => this.allowModuleList = v);
    let d = this.menuService.currentModule$.subscribe(v => { this.currentModule = v });
    let g = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        //#region firebase
        navigator.serviceWorker.getRegistration("../../../../firebase-messaging-sw.js")
          .then((registration) => {
            if (registration) {
              // Nếu Service Worker đã được đăng ký
              console.log('Service Worker already registered:', registration);
              this.messagingService.checkPermissionsAndGuide(registration);
            } else {
              // Nếu chưa có Service Worker, đăng ký mới
              console.log('No Service Worker found. Registering a new one...');
              navigator.serviceWorker.register("../../../../firebase-messaging-sw.js")
                .then((newRegistration) => {
                  console.log('New Service Worker registered:', newRegistration);
                  this.messagingService.checkPermissionsAndGuide(newRegistration); // Sử dụng Service Worker mới đăng ký
                })
                .catch((err) => {
                  console.error('Failed to register new Service Worker:', err);
                });
            }
          })
          .catch((err) => {
            // Xử lý lỗi khi kiểm tra Service Worker
            console.error('Error while checking Service Worker registration:', err);

            // Đăng ký mới nếu kiểm tra thất bại
            navigator.serviceWorker.register("../../../../firebase-messaging-sw.js")
              .then((newRegistration) => {
                console.log('Fallback: New Service Worker registered:', newRegistration);
                this.messagingService.checkPermissionsAndGuide(newRegistration);
              })
              .catch((err) => {
                console.error('Fallback: Failed to register Service Worker:', err);
              });
          });

        //#endregion
        // this.subArr.push(f)
      }
    });
    this.subArr.push(a, b, c, d, g)
    
  }
  ngOnDestroy(): void {
    this.subArr.map(s => s?.unsubscribe())
    this.menuService.unsubscribe();
  }
  //load client-side data
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
  // getLocalStorageModuleList() {
  //   var molList = localStorage.getItem('GetModule')

  //   if (Ps_UtilObjectService.hasValueString(molList)) {
  //     this.apiModuleList = JSON.parse(molList)
  //     this.getAllowModule()
  //   } else {
  //     this.p_GetModule()
  //   }
  // }
  // getLocalStorageModule() {
  //   var module = localStorage.getItem('Module');
  //   //Dashboard làm module default
  //   var pur = this.allowModuleList.find(s => s.Code.includes('dashboard'))
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
  // onLoadModule() {
  //   return ModuleDataAdmin;
  // }
  onLoadUserDropdown() {
    return UserDropdownData
  }
  //api
  // p_GetCompany() {
  //   let that = this

  //   let sst = that.apiService.GetCompany().subscribe(res => {
  //     if (res != null) {
  //       that.companyDropdownList = res;
  //       localStorage.setItem('GetCompany', JSON.stringify(that.companyDropdownList))
  //       that.getLocalStorageCompany()
  //     }
  //   });
  //   that.subArr.push(sst)
  // }
  // p_GetModule() {
  //   let that = this

  //   let sst = that.apiService.GetModule()//.pipe()
  //     .subscribe(res => {
  //       if (res != null) {
  //         that.apiModuleList = res;
  //         localStorage.setItem('GetModule', JSON.stringify(that.apiModuleList))
  //         that.getAllowModule()
  //       }
  //     })
  //   that.subArr.push(sst)
  // }
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
  isLogoVisible() {
    return Ps_UtilObjectService.hasValue(this.getCompanyLogoSrc())
  }
  getCompanyLogoSrc() {
    var company = this.companyDropdownList.find(s => s.Code == this.idCompany)
    return company != undefined ? company.URLLogo : ''
  }
  //click event
  onClick(item: ModuleDataItem) {
    this.menuService.selectedModule(item);
  }
  toggleUserPopup() {
    this.showUser = !this.showUser
  }
  toggleCompanyPopup() {
    this.showCompany = !this.showCompany
  }
  openSearchProductPopup() {
    this.layoutService.setSearchProductDialog(true)
  }
  openChangePasswordPopup() {
    this.layoutService.setChangePasswordDialog(true)
  }
  onClickUserDropdown(e: MenuDataItem) {
    switch (e.Link) {
      case "gotoportal":
        // let module = this.allowModuleList.find(s => s.Code === "portal");
        // this.onClick(module);
        // this.menuService.switchToLayout('portal');
        window.open(EnumLayout.URLPortal, '_blank'); // Code chuyển sang portal server portal mới.
        break
      case "changepassword":
        this.openChangePasswordPopup()
        break
      case "logout":
        this.auth.logout()
        break
      default:
        break
    }
    this.showUser = false
  }
  onClickCompanyDropdown(e: DTOLSCompany) {
    this.idCompany = e.Code
    DTOConfig.cache.companyid = e.Code.toString()
    localStorage.setItem('Company', e.Code.toString());
    localStorage.removeItem('GetModule')
    location.reload()
  }
  //AUTORUN
  isItemActive(item) {
    return Ps_UtilObjectService.hasValue(this.currentModule) && Ps_UtilObjectService.hasValue(item) ? this.currentModule.Code == item.Code : false
  }
  //giấu action list khi user click chỗ khác
  @HostListener('document:click', ['$event'])
  clickout(event) {

    if (!this.userAnchor.nativeElement.contains(event.target)
      && this.showUser == true) {
      this.showUser = false
    }
    if (!this.companyAnchor.nativeElement.contains(event.target)
      && this.showCompany == true) {
      this.showCompany = false
    }
  }
}