import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MenuDataItem, ModuleDataItem } from '../../dto/menu-data-item.dto';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Ps_UtilObjectService, Ps_AuthService, DTOConfig } from 'src/app/p-lib';
import { DrawerSelectEvent } from '@progress/kendo-angular-layout';
import { DTOPermission } from '../../dto/DTOPermission';
import { LayoutAPIService } from '../../services/layout-api.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  // currentMenuExpanded: boolean = false
  idCompany: number = 0;
  count: number = 0
  //permission
  permission = new DTOPermission()
  subArr: Subscription[] = []
  //menu
  // currentAPIMenu: DTOSYSFunction | DTOSYSModule
  currentMenu = new MenuDataItem()
  currentSubMenu = new MenuDataItem()
  //menu list
  // listMenu: Array<MenuDataItem> = [];
  allowedListMenu: Array<MenuDataItem> = [];
  //
  // currentAPIModule = new DTOSYSModule()
  // userDropdownList: Array<MenuDataItem> = [];
  //drawer
  drawerMode: string = 'push'
  drawerExpanded: boolean = true
  drawerMini: boolean = true
  @ViewChild('drawer') drawer;

  constructor(public menuService: PS_HelperMenuService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public auth: Ps_AuthService,
    public apiService: LayoutAPIService,
    library: FaIconLibrary,) {

    // let that = this;
    // Add multiple icons to the library
    library.addIconPacks(fas);

    // let sst = that.router.events.pipe(
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
    //   let sst2 = route.data.subscribe(
    //     () => {
    //       if (Ps_UtilObjectService.hasValue(route.snapshot.params.idCompany)) {
    //         that.idCompany = route.snapshot.params.idCompany;

    //         // if (that.listMenu.length > 0) {
    //         // that.p_CheckActiveMenu();
    //         // }
    //       }
    //     }
    //   )
    //   that.subArr.push(sst2)
    // });
    // that.subArr.push(sst)
    menuService.subscribeToNavigationEvents();
  }
  ngOnInit(): void {
    let that = this;
    that.onResize();

    // if (DTOConfig.Authen.isLogin) {
    //   that.userDropdownList = that.onLoadUserDropdown()
    //   this.getLocalStoragePermission()

    //   let sst = that.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
    //     if (Ps_UtilObjectService.hasValue(item)) {
    //       that.listMenu = item.ListMenu
    //       that.getLocalStorageModule()
    //       that.getAllowMenu()
    //     }
    //   })
    //   that.subArr.push(sst)

    //   var menu = new MenuDataItem()

    //   let sst1 = that.menuService.changeMenuData().subscribe((item: MenuDataItem) => {
    //     if (Ps_UtilObjectService.hasValue(item)) {
    //       menu = item
    //       that.p_GetPermission(menu)
    //     }
    //   })
    //   that.subArr.push(sst1)

    //   let sst2 = that.menuService.changePermission().subscribe((item: DTOPermission) => {
    //     if (Ps_UtilObjectService.hasValue(item)) {
    //       localStorage.setItem('URL', menu.Link)
    //       if (Ps_UtilObjectService.hasValueString(menu.Link))
    //         that.router.navigate([menu.Link, DTOConfig.cache.companyid]);
    //     }
    //   })
    //   that.subArr.push(sst2)
    // }
    // else
    //   this.auth.logout()
    this.menuService.initializeMenuLogic();
    // let a = this.menuService.userDropdownList$.subscribe(v => this.userDropdownList = v);
    let b = this.menuService.allowedListMenu$.subscribe(v => this.allowedListMenu =  v);
    let c = this.menuService.currentMenu$.subscribe(v => this.currentMenu = v);
    let d = this.menuService.currentSubMenu$.subscribe(v => this.currentSubMenu = v);
    this.subArr.push(b,c,d)
  }
  ngOnDestroy(): void {
    this.subArr.map(s => s?.unsubscribe())
    this.menuService.unsubscribe();
  }
  // load client-side data  
  // getLocalStorageModule() {
  //   var module = localStorage.getItem('ModuleAPI')

  //   if (Ps_UtilObjectService.hasValue(module) && module != undefined) {
  //     this.currentAPIModule = JSON.parse(module)
  //   }
  // }
  // getLocalStorageMenu() {
  //   var menu = localStorage.getItem('Menu');

  //   if (Ps_UtilObjectService.hasListValue(this.allowedListMenu))
  //     this.currentMenu = this.allowedListMenu[0]

  //   if (Ps_UtilObjectService.hasValueString(menu)) {
  //     var cacheMenu = this.allowedListMenu.findIndex(s =>
  //       s.Code.includes(menu) || s.Link.includes(menu))

  //     if (cacheMenu > -1)
  //       this.currentMenu = this.allowedListMenu[cacheMenu]
  //   }

  //   if (this.currentMenu.Type == 'group') {
  //     // this.currentMenuExpanded = true
  //     this.currentMenu.Actived = true
  //     var subMenu = localStorage.getItem('SubMenu');

  //     if (Ps_UtilObjectService.hasListValue(this.currentMenu.LstChild))
  //       this.currentSubMenu = this.currentMenu.LstChild[0]

  //     if (Ps_UtilObjectService.hasValueString(subMenu)) {
  //       var cacheSubMenu = this.currentMenu.LstChild.findIndex(s =>
  //         s.Code.includes(subMenu) || s.Link.includes(subMenu))

  //       if (cacheSubMenu > -1)
  //         this.currentSubMenu = this.currentMenu.LstChild[cacheSubMenu]
  //     }
  //     localStorage.setItem('SubMenu', this.currentSubMenu.Code)
  //   } else
  //     localStorage.removeItem('SubMenu')

  //   localStorage.setItem('Menu', this.currentMenu.Code)
  // }
  // getLocalStoragePermission() {
  //   var cachePms = localStorage.getItem('Permission')

  //   if (Ps_UtilObjectService.hasValueString(cachePms)) {
  //     this.permission = JSON.parse(cachePms)
  //     DTOConfig.cache.dataPermission = JSON.stringify(this.permission.DataPermission)
  //     this.menuService.activePermission(this.permission)
  //   } else {
  //     this.p_GetPermission()
  //   }
  // }
  // onLoadUserDropdown() {
  //   return UserDropdownData
  // }
  // onLoadModule() {
  //   return ModuleDataAdmin;
  // }
  // getAllowMenu() {
  //   let that = this

  //   if (Ps_UtilObjectService.hasValue(that.listMenu)) {
  //     that.allowedListMenu = []

  //     that.allowedListMenu = this.menuService.GetAllowMenu(that.listMenu, that.currentAPIModule);

  //     if (that.allowedListMenu.length > 0) {
  //       orderBy(that.allowedListMenu, [{ field: 'OrderBy', dir: 'asc' }])

  //       that.allowedListMenu.forEach(s => {
  //         s.LstChild = orderBy(s.LstChild, [{ field: 'OrderBy', dir: 'asc' }])
  //       })

  //       this.getLocalStorageMenu()
  //       var cacheURL = localStorage.getItem('URL')

  //       if (that.currentMenu.Type == 'group') {
  //         var cacheURLSubMenu = this.currentSubMenu.LstChild.find(s => s.Link == cacheURL)

  //         if (cacheURLSubMenu != undefined) {
  //           this.router.navigate([cacheURLSubMenu.Link, DTOConfig.cache.companyid])
  //         }
  //         else {
  //           this.menuService.activeMenu(this.currentSubMenu)
  //         }
  //       } else {
  //         var cacheURLMenu = this.currentMenu.LstChild.find(s => s.Link == cacheURL)

  //         if (cacheURLMenu != undefined) {
  //           this.router.navigate([cacheURLMenu.Link, DTOConfig.cache.companyid])
  //         }
  //         else {
  //           this.menuService.activeMenu(this.currentMenu)
  //         }
  //       }
  //     }


  //     // var dash = that.listMenu.find(b => b.Name == 'Dashboard')
  //     // dash.Actived = true
  //     // that.allowedListMenu.push(dash)

  //     that.allowedListMenu.push({
  //       Name: 'Thu nhỏ Menu', Code: 'arrow-chevron-left', Type: 'btn', Actived: true, LstChild: []
  //     })
  //   }
  // }
  //API
  // p_GetPermission(menu: MenuDataItem = this.currentMenu) {
  //   let that = this
  //   if (Ps_UtilObjectService.hasValueString(menu.Code) && Ps_UtilObjectService.hasValueString(menu.Link) && menu.Type != 'group') {
  //     let sst = that.apiService.GetPermissionDLL(this.currentMenu.Type == 'group' ?
  //       that.currentSubMenu.Code : that.currentMenu.Code).subscribe(res => {
  //         if (res != null) {
  //           that.permission = res;
  //           DTOConfig.cache.dataPermission = JSON.stringify(that.permission.DataPermission)
  //           localStorage.setItem('Permission', JSON.stringify(that.permission));
  //           that.menuService.activePermission(that.permission)
  //         }
  //       }, err => {
  //         that.menuService.activePermission(new DTOPermission())
  //       });
  //     that.subArr.push(sst)
  //   }
  // }
  // click event
  onMenuClick(item: MenuDataItem, parent?: MenuDataItem) {
    // item.Actived = true

    // if (Ps_UtilObjectService.hasValue(parent)) {
    //   if (this.currentMenu.LstChild.findIndex(s => s.Code == item.Code) > -1) {
    //     this.currentSubMenu = item
    //     localStorage.setItem('SubMenu', this.currentSubMenu.Code)
    //   }
    //   else {
    //     parent.Actived = true
    //     // this.currentMenu = item
    //     this.currentMenu = parent
    //     this.currentSubMenu = item
    //     // this.currentMenuExpanded = false
    //     localStorage.setItem('SubMenu', this.currentSubMenu.Code)
    //     // localStorage.removeItem('SubMenu')
    //   }
    // }
    // else {
    //   this.currentMenu = item
    //   this.currentSubMenu = new MenuDataItem()
    //   localStorage.removeItem('SubMenu')
    // }

    // localStorage.setItem('Menu', this.currentMenu.Code)
    // this.menuService.activeMenu(item)
    this.menuService.selectedMenu(item, parent);
  }
  onMenuClickToggle(item: MenuDataItem) {
    item.Actived = !item.Actived
    // if (this.currentMenu.Code == item.Code) {
    //   // this.currentMenu.Actived = !this.currentMenu.Actived
    //   // this.currentMenuExpanded = !this.currentMenuExpanded
    // }
    // else {
    //   this.currentMenu = item
    //   // this.currentMenu.Actived = true
    //   // this.currentMenuExpanded = true
    // }
  }
  toggleDrawer() {
    this.drawer.toggle()
  }
  onClickListMenuUser(e: MenuDataItem) {
    let that = this
    switch (e.Link) {
      case "onClickPortal":
        var item = this.menuService.onLoadModule().find(f => f.Code == "hri").ListMenu
          .find(f => f.Name.toLowerCase().includes("phiếu lương"))

        that.router.navigate([item.Link, DTOConfig.cache.companyid]);
        break
      case "onClickChangePassword":
        break
      case "onClickLogout":
        this.auth.logout()
        break
      default:
        break
    }
  }
  onSelect(ev: DrawerSelectEvent): void {
    ev.preventDefault();// disable auto-close sidebar
  }
  //auto run
  isCurrentMenuExpanded(item: ModuleDataItem) {
    return this.currentMenu.Code == item.Code && item.Actived ? //this.currentMenuExpanded ?
      'initial' : 'none'
  }
  menuItemIsActive(menuItem: MenuDataItem) {
    return Ps_UtilObjectService.hasValue(this.currentSubMenu) ?
      menuItem.Code == this.currentSubMenu.Code : false
  }
  //giấu sidebar khi mới load nếu dùng phone
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 688) {
      this.drawerMode = 'overlay'
      //mới load
      if (this.count == 0) {
        this.drawerExpanded = false
      }
      this.count++
    } else {
      this.drawerMode = 'push'
    }
  }
}