import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { MenuDataItem, ModuleDataItem } from '../../dto/menu-data-item.dto';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Ps_AuthService,
  DTOStaff,
  DTOToken,
  Ps_UtilObjectService,
} from 'src/app/p-lib';
import { DTOPermission } from '../../dto/DTOPermission';
import { LayoutAPIService } from '../../services/layout-api.service';
import DTOSYSModule, { DTOSYSFunction } from '../../dto/DTOSYSModule.dto';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subject, Subscription } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { DTOEmployeeDetail } from 'src/app/p-app/p-hri/shared/dto/DTOEmployee.dto';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';

@Component({
  selector: 'app-menu-portal',
  templateUrl: './menu-portal.component.html',
  styleUrls: ['./menu-portal.component.scss'],
})
export class MenuPortalComponent implements OnInit, AfterViewInit {
  // Company
  idCompany: number = 0;
  //permission
  permission = new DTOPermission();
  //menu
  currentAPIMenu: DTOSYSFunction | DTOSYSModule;
  currentMenu = new MenuDataItem();
  currentSubMenu = new MenuDataItem();
  //menu list
  listMenu: Array<MenuDataItem> = [];
  allowedListMenu: Array<MenuDataItem> = [];
  currentAPIModule = new DTOSYSModule();
  userDropdownList: Array<MenuDataItem> = [];

  AllowMenu: ModuleDataItem;
  moduleList: Array<ModuleDataItem> = [];
  allowModuleList: Array<ModuleDataItem> = [];
  apiModuleList: Array<DTOSYSModule> = [];
  currentModule = new ModuleDataItem();
  DisableMenu = false;
  // Unsubscribe
  arrUnsubscribe: Subscription[] = [];
  // Drawer
  public expanded = true;
  autoCollapse = false;
  //#endregion
  company: number;
  dataDropdownbutton = [
    {
      id: 1,
      text: 'Đổi mật mẩu',
      icon: 'lock',
    },
    {
      id: 2,
      text: 'Đăng xuất',
      icon: 'logout',
    },
  ];

  popupDisable: boolean = false;

  token: DTOToken;
  InfoUser:DTOEmployeeDetail = new DTOEmployeeDetail();
  loginUser: DTOStaff = new DTOStaff();
  Unsubscribe = new Subject<void>();
  //#endregion
  
  constructor(
    public menuService: PS_HelperMenuService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public auth: Ps_AuthService,
    public apiService: LayoutAPIService,
    library: FaIconLibrary,
    private layoutService: LayoutService,
    private cdr: ChangeDetectorRef,
    private apiServiceStaff: StaffApiService,
  ) {
    // Add multiple icons to the library
    library.addIconPacks(fas);
    
    // let that = this;
    // let x = that.router.events
    //   .pipe(
    //     filter((event) => event instanceof NavigationEnd),
    //     map(() => this.activatedRoute),
    //     map((route) => {
    //       while (route.firstChild) {
    //         route = route.firstChild;
    //       }
    //       return route;
    //     }),
    //     filter((route) => {
    //       return route.outlet === 'primary';
    //     })
    //   )
    //   .subscribe((route) => {
    //     route.data.subscribe(() => {
    //       if (Ps_UtilObjectService.hasValue(route.snapshot.params.idCompany)) {
    //         // that.idCompany = route.snapshot.params.idCompany;
    //         menuService.idCompany = route.snapshot.params.idCompany;
    //       }
    //     });
    //   });

    // this.arrUnsubscribe.push(x);
    menuService.subscribeToNavigationEvents();
  }

  ngOnInit(): void {
    let x = this.layoutService.drawerState.subscribe(
      (v) => (this.expanded = v)
    ); // Lăng nghe expanded của header
    this.menuService.initializeMenuLogic();
    let a = this.menuService.allowedListMenu$.subscribe(v => {
      if(Ps_UtilObjectService.hasValue(v) && Ps_UtilObjectService.hasListValue(v)){
        this.allowedListMenu = v; 
        
        const itemCodeToMove = "portal002-news-list";
  
        // Kiểm tra xem item đã tồn tại trong mảng chưa
        const existingItemIndex = this.allowedListMenu.findIndex(item => item.Code === itemCodeToMove);
  
        if (existingItemIndex !== -1) {
          // Nếu tồn tại, loại bỏ khỏi mảng
          const removedItem = this.allowedListMenu.splice(existingItemIndex, 1)[0];
  
          // Thêm lại item vào cuối mảng
          this.allowedListMenu.push(removedItem);
        }
      }
    });

    // let b = this.quizSessionService.ExamSession$.subscribe((x: DTOExam) => {
    //   if (x && x.StatusID !== 2) {
    //     this.allowedListMenu.forEach(obj => {
    //       (obj as any).disabled = true;
    //       this.popupDisable = true;
    //     });
    //   } else {
    //     this.allowedListMenu.forEach(obj => {
    //       delete (obj as any).disabled;
    //       this.popupDisable = false;
    //     });
    //   }
    // })

    // let that = this;
    // if (DTOConfig.Authen.isLogin) {
    //   this.getLocalStoragePermission();

    //   let a = that.menuService
    //     .changeModuleData()
    //     .subscribe((item: ModuleDataItem) => {
    //       if (Ps_UtilObjectService.hasValue(item)) {
    //         that.listMenu = item.ListMenu;
    //         that.getLocalStorageModule();
    //         that.getAllowMenu();
    //       }
    //     });

    //   var menu = new MenuDataItem();

    //   let b = that.menuService
    //     .changeMenuData()
    //     .subscribe((item: MenuDataItem) => {
    //       if (Ps_UtilObjectService.hasValue(item)) {
    //         menu = item;
    //         that.p_GetPermission(menu);
    //       }
    //     });

    //   let c = that.menuService
    //     .changePermission()
    //     .subscribe((item: DTOPermission) => {
    //       if (Ps_UtilObjectService.hasValue(item)) {
    //         localStorage.setItem('URL', menu.Link);
    //         if (Ps_UtilObjectService.hasValueString(menu.Link))
    //           that.router.navigate([menu.Link, DTOConfig.cache.companyid]);
    //       }
    //     });

    //   this.arrUnsubscribe.push(a, b, c);
    // } else this.auth.logout();

    // if (this.allowedListMenu.length > 0) {
    //   (this.allowedListMenu[0] as any).selected = true; // Mặc định item menu đầu tiên trong sidebar sẽ được active
    // }

    this.arrUnsubscribe.push(x, a);
  }

  ngAfterViewInit(): void {
    let a = this.auth.getCacheUserInfo().subscribe((v) => {
      this.loginUser = v;
      this.APIGetEmployee(this.loginUser.staffID)
    });
    this.checkWindowSize();
    this.cdr.detectChanges();
    this.arrUnsubscribe.push(a);
  }


  //#region Permission
  // getLocalStoragePermission() {
  //   var cachePms = localStorage.getItem('Permission');
  //   if (Ps_UtilObjectService.hasValueString(cachePms)) {
  //     this.permission = JSON.parse(cachePms);
  //     DTOConfig.cache.dataPermission = JSON.stringify(
  //       this.permission.DataPermission
  //     );
  //     this.menuService.activePermission(this.permission);
  //   } else {
  //     this.p_GetPermission();
  //   }
  // }
  // p_GetPermission(menu: MenuDataItem = this.currentMenu) {
  //   let that = this;
  //   if (
  //     Ps_UtilObjectService.hasValueString(menu.Code) &&
  //     Ps_UtilObjectService.hasValueString(menu.Link) &&
  //     menu.Type != 'group'
  //   ) {
  //     let a = that.apiService
  //       .GetPermissionDLL(
  //         this.currentMenu.Type == 'group'
  //           ? that.currentSubMenu.Code
  //           : that.currentMenu.Code
  //       )
  //       .subscribe(
  //         (res) => {
  //           if (res != null) {
  //             that.permission = res;
  //             DTOConfig.cache.dataPermission = JSON.stringify(
  //               that.permission.DataPermission
  //             );
  //             localStorage.setItem(
  //               'Permission',
  //               JSON.stringify(that.permission)
  //             );
  //             that.menuService.activePermission(that.permission);
  //           }
  //         },
  //         (err) => {
  //           that.menuService.activePermission(new DTOPermission());
  //         }
  //       );
  //     this.arrUnsubscribe.push(a);
  //   }
  // }
  //#endregion

  //#region Module
  // getLocalStorageModule() {
  //   var module = localStorage.getItem('ModuleAPI');

  //   if (Ps_UtilObjectService.hasValue(module) && module != undefined) {
  //     this.currentAPIModule = JSON.parse(module);
  //   }
  // }
  // getAllowMenu() {
  //   let that = this;

  //   if (Ps_UtilObjectService.hasValue(that.listMenu)) {
  //     that.allowedListMenu = [];

  //     that.allowedListMenu = this.menuService.GetAllowMenu(
  //       that.listMenu,
  //       that.currentAPIModule
  //     );

  //     if (that.allowedListMenu.length > 0) {
  //       orderBy(that.allowedListMenu, [{ field: 'OrderBy', dir: 'asc' }]);

  //       that.allowedListMenu.forEach((s) => {
  //         s.LstChild = orderBy(s.LstChild, [{ field: 'OrderBy', dir: 'asc' }]);
  //       });

  //       this.getLocalStorageMenu();
  //       var cacheURL = localStorage.getItem('URL');

  //       if (that.currentMenu.Type == 'group') {
  //         var cacheURLSubMenu = this.currentSubMenu.LstChild.find(
  //           (s) => s.Link == cacheURL
  //         );

  //         if (cacheURLSubMenu != undefined) {
  //           this.router.navigate([
  //             cacheURLSubMenu.Link,
  //             DTOConfig.cache.companyid,
  //           ]);
  //         } else {
  //           this.menuService.activeMenu(this.currentSubMenu);
  //         }
  //       } else {
  //         var cacheURLMenu = this.currentMenu.LstChild.find(
  //           (s) => s.Link == cacheURL
  //         );

  //         if (cacheURLMenu != undefined) {
  //           this.router.navigate([
  //             cacheURLMenu.Link,
  //             DTOConfig.cache.companyid,
  //           ]);
  //         } else {
  //           this.menuService.activeMenu(this.currentMenu);
  //         }
  //       }
  //     }
  //   }
  // }
  //#endregion

  //#region menu
  // getLocalStorageMenu() {
  //   var menu = localStorage.getItem('Menu');

  //   if (Ps_UtilObjectService.hasListValue(this.allowedListMenu))
  //     this.currentMenu = this.allowedListMenu[0];

  //   if (Ps_UtilObjectService.hasValueString(menu)) {
  //     var cacheMenu = this.allowedListMenu.findIndex(
  //       (s) => s.Code.includes(menu) || s.Link.includes(menu)
  //     );

  //     if (cacheMenu > -1) this.currentMenu = this.allowedListMenu[cacheMenu];
  //   }

  //   if (this.currentMenu.Type == 'group') {
  //     // this.currentMenuExpanded = true
  //     this.currentMenu.Actived = true;
  //     var subMenu = localStorage.getItem('SubMenu');

  //     if (Ps_UtilObjectService.hasListValue(this.currentMenu.LstChild))
  //       this.currentSubMenu = this.currentMenu.LstChild[0];

  //     if (Ps_UtilObjectService.hasValueString(subMenu)) {
  //       var cacheSubMenu = this.currentMenu.LstChild.findIndex(
  //         (s) => s.Code.includes(subMenu) || s.Link.includes(subMenu)
  //       );

  //       if (cacheSubMenu > -1)
  //         this.currentSubMenu = this.currentMenu.LstChild[cacheSubMenu];
  //     }
  //     localStorage.setItem('SubMenu', this.currentSubMenu.Code);
  //   } else localStorage.removeItem('SubMenu');
  //   localStorage.setItem('Menu', this.currentMenu.Code);
  // }
  //#endregion

  // onLoadModule() {
  //   return ModuleDataAdmin;
  // }


  onClickMenu(item: any) {
    this.menuService.selectedMenu(item);
    // this.menuService.activeMenu(item);
  }


  //#region Lăng nghe sự thay đổi về kích thước của màn hình.
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  checkWindowSize() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 768) {
      this.autoCollapse = true;
    } else {
      this.autoCollapse = false;
    }
  }
  //#endregion

  public onExpandChange(e: boolean): void {
    this.layoutService.drawerAutoCollapse.next(e);
  }

  openChangePasswordPopup() {
    this.layoutService.setChangePasswordDialog(true)
  }

  selectionChangeUser(event: any){
    switch (event.id) {
      case 1:
        this.openChangePasswordPopup();
        break;
      case 2:
        this.auth.logout()
        break;
    }
  }

  // API lấy thông tin nhân sự
  APIGetEmployee(Code: number) {
    this.apiServiceStaff.GetEmployeeInfo(Code).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.InfoUser = res.ObjectReturn
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự:  ${res.ErrorString}`);
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${error}`);
    })
  }

  ngOnDestroy(): void {
    // this.arrUnsubscribe.forEach((s) => {
    //   s?.unsubscribe();
    // });
    this.menuService.unsubscribe();
  }
}