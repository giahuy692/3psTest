import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ModuleDataItem, MenuDataItem } from '../dto/menu-data-item.dto';
import DTOSYSModule, { DTOSYSFunction } from '../dto/DTOSYSModule.dto';
import { DTOPermission } from '../dto/DTOPermission';
import { FilterDescriptor, orderBy, State } from '@progress/kendo-data-query';
import { Ps_AuthService, Ps_UtilObjectService, DTOConfig } from 'src/app/p-lib';
import { DTOLSCompany } from '../dto/DTOLSCompany.dto';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LayoutAPIService } from './layout-api.service';
import { ModuleDataAdmin } from '../p-sitemaps/menu.data-admin';
import { filter, map, takeUntil } from 'rxjs/operators';
import { UserDropdownData } from '../p-sitemaps/user.dropdown.data';
import { LayoutPortalComponent } from '../layout-portal/layout-portal.component';
import { DeveloperAPIService } from '../../p-developer/shared/services/developer-api.service';
import { DTOModuleAPI } from '../../p-developer/shared/dto/DTOAPI';
import { EnumMarketing } from 'src/app/p-lib/enum/marketing.enum';
import { EnumEcommerce } from 'src/app/p-lib/enum/ecommerce.enum';
import { EnumConfig } from 'src/app/p-lib/enum/config.enum';
import { EnumDeveloper } from 'src/app/p-lib/enum/developer.enum';
import { EnumHR } from 'src/app/p-lib/enum/hr.enum';
import { EnumLayout } from 'src/app/p-lib/enum/layout.enum';
import { EnumLGT } from 'src/app/p-lib/enum/lgt.enum';
import { EnumPurchase } from 'src/app/p-lib/enum/purchase.enum';
import { EnumWebHachi } from 'src/app/p-lib/enum/webhachi.enum';
import { EnumSales } from 'src/app/p-lib/enum/sales.enum';
import { EnumDashboard } from 'src/app/p-lib/enum/dashboard.enum';


@Injectable({
  providedIn: 'root',
})
export class PS_HelperMenuService implements OnDestroy {
  // Menu
  private _menuData$: BehaviorSubject<any>;
  currentAPIMenu: DTOSYSFunction | DTOSYSModule;
  currentMenu = new MenuDataItem();
  public currentMenu$ = new BehaviorSubject<MenuDataItem>(new MenuDataItem());
  currentSubMenu = new MenuDataItem();
  public currentSubMenu$ = new BehaviorSubject<MenuDataItem>(new MenuDataItem());
  AllowMenu: ModuleDataItem;
  //menu list
  listMenu: Array<MenuDataItem> = [];
  allowedListMenu: Array<MenuDataItem> = [];
  public allowedListMenu$: BehaviorSubject<MenuDataItem[]>;
  currentAPIModule = new DTOSYSModule();
  // Module
  moduleList: Array<ModuleDataItem> = [];
  allowModuleList: Array<ModuleDataItem> = [];
  currentModule = new ModuleDataItem();
  currentModule$ = new BehaviorSubject<ModuleDataItem>(new ModuleDataItem());
  public allowModuleList$ = new BehaviorSubject<Array<ModuleDataItem>>([]);
  private _activeModule$: BehaviorSubject<any>;
  // ModuleAPI
  apiModuleList: Array<DTOSYSModule> = [];
  private _activeModuleAPI: BehaviorSubject<any>;
  // Permission
  currentPermission: DTOPermission;
  private permission: BehaviorSubject<any>;
  // Company
  idCompany: number = 0;
  allowCompanyDropdownList: Array<DTOLSCompany> = [];
  companyDropdownList: Array<DTOLSCompany> = [];
  public idCompany$: BehaviorSubject<number>;
  public companyDropdownList$ = new BehaviorSubject<Array<DTOLSCompany>>([]);
  //user
  userDropdownList: Array<MenuDataItem> = [];
  public userDropdownList$ = new BehaviorSubject<Array<MenuDataItem>>([]);
  breadcrumbDataChanged: EventEmitter<any> = new EventEmitter<any>(); // hàm chuyền data cho breadcrum của portal

  // Biến tạm lưu trử module portal
  modulePortal = {
    "ListGroup": [],
    "ListFunctions": [
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 3071,
        "ModuleID": 35,
        "Vietnamese": "Kiểm tra năng lực",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 1,
        "Hotkey": null,
        "TypeData": 1,
        "DLLPackage": "portal001-exam-list",
        "ImageSetting": "spell-check",
        "Icon": "spell-check",
        "PermissionConf": null
      },
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 4196,
        "ModuleID": 35,
        "Vietnamese": "Phiếu lương",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 2,
        "Hotkey": null,
        "TypeData": 2,
        "DLLPackage": "portal003-paycheck-detail",
        "ImageSetting": "dollar",
        "Icon": "dollar",
        "PermissionConf": null
      },
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 4207,
        "ModuleID": 35,
        "Vietnamese": "Tra cứu chính sách",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 5,
        "Hotkey": null,
        "TypeData": 1,
        "DLLPackage": "portal002-news-list",
        "ImageSetting": "circle-info",
        "Icon": "circle-info",
        "PermissionConf": null
      }
    ],
    "ListAPI": null,
    "Company": 0,
    "Code": 35,
    "ProductID": 1,
    "ModuleID": "portal",
    "Vietnamese": "Portal cá nhân",
    "English": "Portal cá nhân",
    "Japanese": "Portal cá nhân",
    "Chinese": "Portal cá nhân",
    "OrderBy": 9,
    "GroupID": null,
    "IsVisible": true,
    "TypeData": 1,
    "ImageSetting": "tasks",
    "Icon": "tasks"
  }

  ModuleApiPortal = {
    "ListGroup": [],
    "ListFunctions": [
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 3071,
        "ModuleID": 35,
        "Vietnamese": "Kiểm tra năng lực",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 1,
        "Hotkey": null,
        "TypeData": 1,
        "DLLPackage": "portal001-exam-list",
        "ImageSetting": "spell-check",
        "Icon": "spell-check",
        "PermissionConf": null
      },
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 4196,
        "ModuleID": 35,
        "Vietnamese": "Phiếu lương",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 2,
        "Hotkey": null,
        "TypeData": 2,
        "DLLPackage": "portal003-paycheck-detail",
        "ImageSetting": "dollar",
        "Icon": "dollar",
        "PermissionConf": null
      },
      {
        "ListAction": null,
        "ListDataPermission": null,
        "ModuleName": null,
        "Breadcrumb": null,
        "ListSubFunction": null,
        "Code": 4207,
        "ModuleID": 35,
        "Vietnamese": "Tra cứu chính sách",
        "English": null,
        "Japanese": null,
        "Chinese": null,
        "OrderBy": 5,
        "Hotkey": null,
        "TypeData": 1,
        "DLLPackage": "portal002-news-list",
        "ImageSetting": "circle-info",
        "Icon": "circle-info",
        "PermissionConf": null
      }
    ],
    "ListAPI": null,
    "Company": 0,
    "Code": 35,
    "ProductID": 1,
    "ModuleID": "portal",
    "Vietnamese": "Portal cá nhân",
    "English": "Portal cá nhân",
    "Japanese": "Portal cá nhân",
    "Chinese": "Portal cá nhân",
    "OrderBy": 9,
    "GroupID": null,
    "IsVisible": true,
    "TypeData": 1,
    "ImageSetting": "tasks",
    "Icon": "tasks"
  }

  // subscriptions
  private subscriptions: Subscription[] = [];
  ngUnsubscribe = new Subject<void>();

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public apiService: LayoutAPIService,
    public auth: Ps_AuthService,
    public devAPIService: DeveloperAPIService,
  ) {
    this._menuData$ = new BehaviorSubject(null);
    this._activeModule$ = new BehaviorSubject(null);
    this._activeModuleAPI = new BehaviorSubject(null);
    this.permission = new BehaviorSubject(null);
    this.permissionAPI$ = new BehaviorSubject(null);
    this.allowedListMenu$ = new BehaviorSubject(null);
    this.allowModuleList$ = new BehaviorSubject(null);
    this.companyDropdownList$ = new BehaviorSubject(null);
    this.idCompany$ = new BehaviorSubject(null);
    this.currentModule$ = new BehaviorSubject(null);
    this.currentSubMenu$ = new BehaviorSubject(null);
    this.currentMenu$ = new BehaviorSubject(null);
    this.userDropdownList$ = new BehaviorSubject(null);
    this.allowModuleList = this.onLoadModule();
    this.moduleList = this.onLoadModule();
    this.allowModuleList$.next(this.allowModuleList);
  }

  //permission
  public changePermission() {
    return this.permission.asObservable();
  }
  public activePermission(perms: DTOPermission) {
    return this.permission.next(perms);
  }

  // permission API
  private permissionAPI$: BehaviorSubject<any>;
  public activePermissionAPI(api: any) {
    return this.permissionAPI$.next(api);
  }

  public changePermissionAPI() {
    return this.permissionAPI$.asObservable();
  }
  //menu
  public changeMenuData() {
    return this._menuData$.asObservable();
  }
  public activeMenu(module: MenuDataItem) {
    if (module.Code.includes('portal'))
      this.auth.logout(EnumLayout.URLPortal)

    return this._menuData$.next(module);
  }
  //modulec+
  public changeModuleData() {
    return this._activeModule$.asObservable();
  }
  public activeModule(module: ModuleDataItem) {
    return this._activeModule$.next(module);
  }
  //module API
  public changeModuleAPIData() {
    return this._activeModuleAPI.asObservable();
  }
  public activeModuleAPI(module: DTOSYSModule) {
    return this._activeModuleAPI.next(module);
  }

  // Listen navigation Event
  subscribeToNavigationEvents(): Subscription {
    return this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => {
          return route.outlet === 'primary';
        })
      )
      .subscribe((route) => {
        var a = route.data.subscribe(() => {
          if (Ps_UtilObjectService.hasValue(route.snapshot.params.idCompany) && route.snapshot.params.idCompany > 0) {
            this.idCompany = route.snapshot.params.idCompany;
            this.idCompany$.next(this.idCompany);
            if (route.snapshot.routeConfig?.component === LayoutPortalComponent) {
              this.switchToLayout('erp');
            }
          }
        });
        this.subscriptions.push(a);
      });
  }

  //allow menu dưa trên sitemap và response của api GetModule
  GetAllowMenu(listMenu: MenuDataItem[], currentAPIModule: DTOSYSModule) {
    let allowedListMenu: MenuDataItem[] = [];
    if (Ps_UtilObjectService.hasValue(listMenu)) {
      if (
        Ps_UtilObjectService.hasValue(currentAPIModule.ListGroup) &&
        currentAPIModule.ListGroup.length > 0
      ) {
        currentAPIModule.ListGroup.forEach((a) => {
          listMenu
            .filter((s) => s.Type == 'group')
            .forEach((b) => {
              if (Ps_UtilObjectService.hasListValue(a.ListFunctions))
                if (a.ModuleID === b.Code) {
                  b.Name = a.Vietnamese; //lấy theo tên và icon menu group của api
                  b.Icon = a.Icon;
                  b.OrderBy = a.OrderBy;
                  b.ID = a.Code
                  //xử lý list function
                  var spliceIndexArr = [];

                  b.LstChild.forEach((bf, i) => {
                    var afi = a.ListFunctions.find(
                      (af) => af.DLLPackage == bf.Code
                    );

                    if (Ps_UtilObjectService.hasValue(afi)) {
                      //lấy theo tên và icon menu function của api
                      bf.Name = afi.Vietnamese;
                      bf.Icon = afi.Icon;
                      bf.OrderBy = afi.OrderBy;
                    } else spliceIndexArr.push(i);
                  });

                  spliceIndexArr
                    .sort((a, b) => {
                      return b - a;
                    })
                    .forEach((s) => {
                      b.LstChild.splice(s, 1);
                    });

                  allowedListMenu.push(b);
                }
            });
        });
      }

      if (
        Ps_UtilObjectService.hasValue(currentAPIModule.ListFunctions) &&
        currentAPIModule.ListFunctions.length > 0
      ) {
        currentAPIModule.ListFunctions.forEach((a) => {
          listMenu
            .filter((s) => s.Type == 'function')
            .forEach((b) => {
              if (a.DLLPackage == b.Code) {
                b.Name = a.Vietnamese; //lấy theo tên và icon menu function của api
                b.Icon = a.Icon;
                b.OrderBy = a.OrderBy
                allowedListMenu.push(b);
              }
            });
        });
      }
      allowedListMenu = orderBy(allowedListMenu, [{ field: 'OrderBy', dir: 'asc' }]);
      return allowedListMenu;
    }

    return [];
  }

  initializeMenuLogic() {
    let that = this;
    if (DTOConfig.Authen.isLogin) {
      that.userDropdownList = that.onLoadUserDropdown();
      this.userDropdownList$.next(this.userDropdownList);
      // this.getLocalStoragePermission();

      let a = that.changeModuleData().subscribe((item: ModuleDataItem) => {
        if (Ps_UtilObjectService.hasValue(item)) {
          that.listMenu = item.ListMenu;
          that.getLocalStorageModule();
          that.getAllowMenu();
        }
      });

      var menu = new MenuDataItem();

      let b = that.changeMenuData()
        .subscribe((item: MenuDataItem) => {
          if (Ps_UtilObjectService.hasValue(item)) {
            menu = item;
            that.GetPermission(menu);
          }
        });

      let c = that.changePermission().subscribe((item: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(item)) {
          localStorage.setItem('URL', menu.Link); 1
          if (Ps_UtilObjectService.hasValueString(menu.Link))
            that.router.navigate([menu.Link, DTOConfig.cache.companyid]);
        }
      });

      this.subscriptions.push(a, b, c);
    } else this.auth.logout();

    if (this.allowedListMenu.length > 0 && this.allowedListMenu[0].Link.includes('portal')) {
      const currentURLMenu = localStorage.getItem('Menu'); // lấy menu đang được active bởi người dùng 
      if (Ps_UtilObjectService.hasValueString(currentURLMenu)) {
        this.allowedListMenu.forEach(item => {
          item['selected'] = (item.Code === currentURLMenu);
        });
      } else {
        (this.allowedListMenu[0] as any).selected = true; // Mặc định item menu đầu tiên trong sidebar sẽ được active ở portal
      }
    }
  }

  // Get Local Storage Permission
  getLocalStoragePermission() {
    var cachePms = localStorage.getItem('Permission');
    if (Ps_UtilObjectService.hasValueString(cachePms)) {
      this.currentPermission = JSON.parse(cachePms);
      DTOConfig.cache.dataPermission = JSON.stringify(
        this.currentPermission.DataPermission
      );
      this.activePermission(this.currentPermission);
    } else {
      this.GetPermission();
    }
  }

  // Get Permission
  GetPermission(menu: MenuDataItem = this.currentMenu) {
    let that = this;
    if (
      Ps_UtilObjectService.hasValueString(menu.Code) &&
      Ps_UtilObjectService.hasValueString(menu.Link) &&
      menu.Type != 'group'
    ) {
      let a = that.apiService
        .GetPermissionDLL(
          this.currentMenu.Type == 'group'
            ? that.currentSubMenu.Code
            : that.currentMenu.Code
        )
        .subscribe(
          (res) => {
            if (res != null) {
              that.currentPermission = res;
              DTOConfig.cache.dataPermission = JSON.stringify(
                that.currentPermission.DataPermission
              );
              localStorage.setItem(
                'Permission',
                JSON.stringify(that.currentPermission)
              );
              that.activePermission(that.currentPermission);
            }
          },
          (err) => {
            that.activePermission(new DTOPermission());
          }
        );
      this.subscriptions.push(a);
    }
  }

  // Get Local Storage Module
  getLocalStorageModule() {
    var module = localStorage.getItem('ModuleAPI');

    if (Ps_UtilObjectService.hasValue(module) && module != undefined) {
      this.currentAPIModule = JSON.parse(module);
    }
  }
  // Get Allow Menu
  getAllowMenu() {
    let that = this;

    if (Ps_UtilObjectService.hasValue(that.listMenu)) {
      that.allowedListMenu = [];

      that.allowedListMenu = this.GetAllowMenu(
        that.listMenu,
        that.currentAPIModule
      );

      this.GetAllowAPIList()

      if (that.allowedListMenu.length > 0) {
        orderBy(that.allowedListMenu, [{ field: 'OrderBy', dir: 'asc' }]);

        that.allowedListMenu.forEach((s) => {
          s.LstChild = orderBy(s.LstChild, [{ field: 'OrderBy', dir: 'asc' }]);
        });

        this.getLocalStorageMenu();
        var cacheURL = localStorage.getItem('URL');

        if (that.currentMenu.Type == 'group') {
          var cacheURLSubMenu = this.currentSubMenu.LstChild.find(
            (s) => s.Link == cacheURL
          );

          if (cacheURLSubMenu != undefined) {
            this.router.navigate([
              cacheURLSubMenu.Link,
              DTOConfig.cache.companyid,
            ]);
          } else {
            this.activeMenu(this.currentSubMenu);
          }
        } else {
          var cacheURLMenu = this.currentMenu.LstChild.find(
            (s) => s.Link == cacheURL
          );

          if (cacheURLMenu != undefined) {
            this.router.navigate([
              cacheURLMenu.Link,
              DTOConfig.cache.companyid,
            ]);
          } else {
            this.activeMenu(this.currentMenu);
          }
        }

        if (this.currentModule.Code != "portal") {
          that.allowedListMenu.push({
            Name: 'Thu nhỏ Menu', Code: 'arrow-chevron-left', Type: 'btn', Actived: true, LstChild: []
          })
        }
        this.allowedListMenu$.next(that.allowedListMenu);
      }
    }
  }

  // Get Local Storage Menu
  getLocalStorageMenu() {
    var menu = localStorage.getItem('Menu');

    if (Ps_UtilObjectService.hasListValue(this.allowedListMenu))
      this.currentMenu = this.allowedListMenu[0];
    this.currentMenu$.next(this.currentMenu);

    if (Ps_UtilObjectService.hasValueString(menu)) {
      var cacheMenu = this.allowedListMenu.findIndex(
        (s) => s.Code.includes(menu) || s.Link.includes(menu)
      );

      if (cacheMenu > -1) {
        this.currentMenu = this.allowedListMenu[cacheMenu];
        this.currentMenu$.next(this.currentMenu);
      }
    }

    if (this.currentMenu.Type == 'group') {
      // this.currentMenuExpanded = true
      this.currentMenu.Actived = true;
      var subMenu = localStorage.getItem('SubMenu');

      if (Ps_UtilObjectService.hasListValue(this.currentMenu.LstChild))
        this.currentSubMenu = this.currentMenu.LstChild[0];
      this.currentSubMenu$.next(this.currentSubMenu)

      if (Ps_UtilObjectService.hasValueString(subMenu)) {
        var cacheSubMenu = this.currentMenu.LstChild.findIndex(
          (s) => s.Code.includes(subMenu) || s.Link.includes(subMenu)
        );

        if (cacheSubMenu > -1)
          this.currentSubMenu = this.currentMenu.LstChild[cacheSubMenu];
        this.currentSubMenu$.next(this.currentSubMenu)
      }
      localStorage.setItem('SubMenu', this.currentSubMenu.Code);
    } else localStorage.removeItem('SubMenu');
    localStorage.setItem('Menu', this.currentMenu.Code);
  }

  // header
  getLocalStorageCompanyList() {
    var compList = localStorage.getItem('GetCompany')

    if (Ps_UtilObjectService.hasValueString(compList)) {
      this.companyDropdownList = JSON.parse(compList)
      this.getLocalStorageCompany()
    } else {
      this.GetCompany()
    }
    this.companyDropdownList$.next(this.companyDropdownList);
  }

  getLocalStorageCompany() {
    var company = localStorage.getItem('Company');
    var companyInt = parseInt(company)

    if (Ps_UtilObjectService.hasValueString(company) && typeof (companyInt) === 'number' && companyInt > 0) {
      DTOConfig.cache.companyid = company
      this.idCompany = companyInt
    }
    else {
      DTOConfig.cache.companyid = this.companyDropdownList[0].Code.toString()
      this.idCompany = this.companyDropdownList[0].Code
    }
    localStorage.setItem('Company', DTOConfig.cache.companyid);
    //update url without refreshing
    var asd = this.router.url.split('/')
    asd.splice(asd.length - 1, 1, DTOConfig.cache.companyid)
    window.history.replaceState({ idCompany: this.idCompany }, '', '#' + asd.join('/'))
    //
    this.getLocalStorageModuleList()
    this.idCompany$.next(this.idCompany);
  }

  GetCompany() {
    let that = this

    let a = that.apiService.GetCompany().subscribe(res => {
      if (res != null) {
        that.companyDropdownList = res;
        localStorage.setItem('GetCompany', JSON.stringify(that.companyDropdownList))
        that.getLocalStorageCompany()
        this.companyDropdownList$.next(this.companyDropdownList);
      }
    });
    this.subscriptions.push(a);
  }

  getLocalStorageModuleList() {
    var molList = localStorage.getItem('GetModule')

    if (Ps_UtilObjectService.hasValueString(molList)) {
      this.apiModuleList = JSON.parse(molList);
      this.getAllowModule();
    } else {
      this.GetModule()
    }
  }

  GetModule() {
    let that = this

    let a = that.apiService.GetModule()
      .subscribe(res => {
        if (res != null) {
          that.apiModuleList = res;
          //#region mặc định portal
          that.apiModuleList = that.apiModuleList.filter(v => v.ModuleID != "portal")
          that.apiModuleList.push(this.modulePortal)
          //#endregion
          localStorage.setItem('GetModule', JSON.stringify(that.apiModuleList))
          that.getAllowModule();
        }
      })
    this.subscriptions.push(a);
  }

  //allow module dưa trên sitemap và response của api GetModule
  getAllowModule() {
    this.allowModuleList = [];

    orderBy(this.apiModuleList, [{ field: 'OrderBy', dir: 'asc' }]).forEach((a) => {
      this.moduleList.forEach((b) => {
        if (
          Ps_UtilObjectService.hasListValue(a.ListFunctions) ||
          Ps_UtilObjectService.hasListValue(a.ListGroup)
        )
          if (a.ModuleID == b.Code) {
            b.OrderBy = a.OrderBy
            b.ID = a.Code

            b.ListMenu.forEach(bb => {
              a.ListGroup.forEach(aa => {
                if (aa.ModuleID == bb.Code) {
                  bb.OrderBy = aa.OrderBy
                  bb.ID = aa.Code
                }
              })
            })
            this.allowModuleList.push(b);
          }
      });
    });
    this.allowModuleList = orderBy(this.allowModuleList, [{ field: 'OrderBy', dir: 'asc' }]);
    this.allowModuleList$.next(this.allowModuleList);
    this.setLocalStorageModule()
    this.activeModule(this.currentModule)
  }

  listAPITree: DTOModuleAPI[] = []

  GetAllowAPIList() {
    var state: State = {}
    state.filter = { logic: 'or', filters: [] }

    this.allowModuleList.forEach(parentModule => {
      var pFilter: FilterDescriptor = { field: 'Code', operator: 'eq', value: parentModule.ID }
      state.filter.filters.push(pFilter)

      parentModule.ListMenu.filter(f => f.Type == 'group').forEach(childModule => {
        var cFilter: FilterDescriptor = { field: 'Code', operator: 'eq', value: childModule.ID }
        state.filter.filters.push(cFilter)
      })
    });

    this.devAPIService.GetListModuleAPITree(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listAPITree = res.ObjectReturn
        // // this.rootData = res.ObjectReturn
        // this.currentModuleForm = res.ObjectReturn
        // if (isHandle == false) {
        //   this.currentModule = res.ObjectReturn[0]
        // }

        // this.loadData();
        this.bindAPIToEnum()
      } else {
        // this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      // this.loading = false;
    }, (error) => {
      // this.loading = false;
      // this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  bindAPIToEnum() {
    // Khởi tạo đối tượng lưu trữ cấu hình API
    let apiConfig: any = {}

    // Duyệt qua từng module trong danh sách API
    this.listAPITree.forEach(module => {
      // Tạo một đối tượng mới cho mỗi ModuleID nếu chưa tồn tại
      apiConfig[module.ModuleID] = apiConfig[module.ModuleID] ?? {}

      // Lặp qua danh sách API và lưu trữ URL
      module.ListAPI.forEach(api => {
        apiConfig[module.ModuleID][api.APIID] = api.ServerURL + '/' + api.URL
      })

      // Duyệt qua từng nhóm trong module để thêm API
      module.ListGroup.forEach(group => {
        group.ListAPI.forEach(api => {
          apiConfig[module.ModuleID][api.APIID] = api.ServerURL + '/' + api.URL
        })
      })
    })

    // Chuyển đổi cấu hình API để định dạng tên
    apiConfig = this.transformApiConfig(apiConfig)
    // Gán các API vào các biến tương ứng 
    let marketing = apiConfig.mar
    let ecommerce = apiConfig.ecommerce
    let config = apiConfig.config
    let lgt = apiConfig.log
    let purchase = apiConfig.pur
    let sales = apiConfig.sales
    let dashboard = apiConfig.dashboard
    let org = apiConfig.org
    let hr = apiConfig.hri

    let layout = apiConfig.layout
    let developer = apiConfig.dev
    let webhachi = apiConfig.webhachi

    // Gán giá trị API cho các enum
    Object.assign(EnumMarketing, marketing);
    Object.assign(EnumEcommerce, ecommerce);
    Object.assign(EnumConfig, config);
    Object.assign(EnumHR, hr);
    Object.assign(EnumHR, org);
    Object.assign(EnumLGT, lgt);
    Object.assign(EnumPurchase, purchase);
    Object.assign(EnumSales, sales);
    Object.assign(EnumDashboard, dashboard);
    Object.assign(EnumWebHachi, webhachi);
    Object.assign(EnumLayout, layout);
    Object.assign(EnumDeveloper, developer);

    // console.log(apiConfig);

    // Kích hoạt quyền truy cập API
    this.activePermissionAPI(apiConfig);
    // Lấy quyền từ Local Storage
    this.getLocalStoragePermission()
  }

  // Phương thức này chuyển đổi định dạng tên API thành tên mà hệ thông có thể dùng để call api
  transformApiConfig(apiData) {
    const transformedData = {};

    // Lặp qua các module trong apiData
    for (const module in apiData) {
      // Khởi tạo đối tượng cho mỗi module
      transformedData[module] = {};

      // Lặp qua các API trong từng module
      for (const api in apiData[module]) {
        // Tách tên API từ chuỗi module.apiName
        const apiName = api.split('.').pop(); // Lấy phần sau dấu chấm
        transformedData[module][apiName] = apiData[module][api]; // Gán link tương ứng
      }
    }

    return transformedData;
  }

  setLocalStorageModule() {
    var module = localStorage.getItem('Module');
    //Dashboard làm module default
    var moduleDefault = this.allowModuleList.find(s => s.Code.includes('dashboard'))
    // var moduleDefault = this.allowModuleList.find(s => s.Code !== 'portal')
    this.currentModule = Ps_UtilObjectService.hasValue(moduleDefault) ? moduleDefault : Ps_UtilObjectService.hasListValue(this.allowModuleList) ? this.allowModuleList[0] : this.currentModule

    if (Ps_UtilObjectService.hasValueString(module) && module != undefined) {
      var cacheModule = this.allowModuleList.findIndex(s => s.Code.includes(module))

      if (cacheModule > -1) {
        this.currentModule = this.allowModuleList[cacheModule]
      }
    }
    this.currentAPIModule = this.apiModuleList.find(s => s.ModuleID.includes(this.currentModule.Code))
    localStorage.setItem('Module', Ps_UtilObjectService.hasValueString(this.currentModule.Code) ? this.currentModule.Code : '')
    localStorage.setItem('ModuleAPI', JSON.stringify(Ps_UtilObjectService.hasValue(this.currentAPIModule) ? this.currentAPIModule : new DTOSYSModule()))
    this.currentModule$.next(this.currentModule);
  }
  // Get data menu.data-admin
  onLoadModule() {
    return ModuleDataAdmin;
  }
  onLoadUserDropdown() {
    return UserDropdownData;
  }

  selectedModule(item: ModuleDataItem) {
    this.currentModule = item
    this.currentAPIModule = this.apiModuleList.find(s => s.ModuleID.includes(item.Code))
    localStorage.setItem('Module', Ps_UtilObjectService.hasValueString(item.Code) ? item.Code : '')
    localStorage.setItem('ModuleAPI', JSON.stringify(Ps_UtilObjectService.hasValue(this.currentAPIModule) ? this.currentAPIModule : new DTOSYSModule()))

    this.activeModule(item)
    this.currentModule$.next(this.currentModule);
  }

  selectedMenu(item: MenuDataItem, parent?: MenuDataItem) {
    item.Actived = true;

    if (Ps_UtilObjectService.hasValue(parent)) {
      if (this.currentMenu.LstChild.findIndex(s => s.Code == item.Code) > -1) {
        this.currentSubMenu = item;
        this.currentSubMenu$.next(this.currentSubMenu);
        localStorage.setItem('SubMenu', this.currentSubMenu.Code);
      }
      else {
        parent.Actived = true
        // this.currentMenu = item
        this.currentMenu = parent;
        this.currentSubMenu = item;
        this.currentMenu$.next(this.currentMenu);
        this.currentSubMenu$.next(this.currentSubMenu);
        // this.currentMenuExpanded = false
        localStorage.setItem('SubMenu', this.currentSubMenu.Code);
        // localStorage.removeItem('SubMenu')
      }
    }
    else {
      this.currentMenu = item;
      this.currentSubMenu = new MenuDataItem();
      localStorage.removeItem('SubMenu');
      this.currentMenu$.next(this.currentMenu);
      this.currentSubMenu$.next(this.currentSubMenu);
    }

    localStorage.setItem('Menu', this.currentMenu.Code);
    this.activeMenu(item);
  }

  switchToLayout(layoutName: string): void {
    let module: any;
    switch (layoutName) {
      case 'erp':
        module = this.allowModuleList.filter(s => s.Code !== "portal");
        this.switchModule(module[0]);
        break;
      case 'portal':
        this.switchModule(this.onLoadModule().filter(v => v.Code == 'portal')[0]);
        break;
    }
  }

  switchModule(moduleName: ModuleDataItem): void {
    if (Ps_UtilObjectService.hasValue(moduleName)) {
      this.selectedModule(moduleName);
    }
  }

  unsubscribe() {
    this.subscriptions.forEach((sub) => sub?.unsubscribe());
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubscribe()
  }
}