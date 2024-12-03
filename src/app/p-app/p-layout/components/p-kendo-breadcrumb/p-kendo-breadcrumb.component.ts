import { Component, OnInit, Output, EventEmitter,OnDestroy,HostListener, Input} from '@angular/core';
import { BreadCrumbItem } from '@progress/kendo-angular-navigation';
import { MenuDataItem } from '../../dto/menu-data-item.dto';
import { ModuleDataItem } from '../../dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { Router,ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { HriQuizSessionService } from 'src/app/p-app/p-hri/shared/services/hri-quiz-session.service';
import { DTOExam } from 'src/app/p-app/p-hri/shared/dto/DTOExam.dto';
import { takeUntil } from 'rxjs/operators';

/**
 * Component Breadcrumb dùng thư viện Kendo UI.
 *
 * @remarks
 * Đây là một Component dùng lấy Name trong sitemaps để hiển thị ra breadcrumb nếu có lstChild.
 *
 * @example
 * <app-p-kendo-breadcrumb></app-p-kendo-breadcrumb>
 *
 * @export
 * @class PKendoBreadcrumbComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-p-kendo-breadcrumb',
  templateUrl: './p-kendo-breadcrumb.component.html',
  styleUrls: ['./p-kendo-breadcrumb.component.scss']
})
export class PKendoBreadcrumbComponent implements OnInit,OnDestroy {
  subArr: Subscription[] = [] 
  /**
   * Mảng các items trong breadcrumb.
   *
   * @type {BreadCrumbItem[]}
   */
  items: any[] = [];

  /**
   * Mảng các menu dữ liệu.
   *
   * @type {Array<MenuDataItem>}
   */
  listMenu: Array<MenuDataItem> = [];
  /**
   * Mảng các menu dữ liệu được phép.
   *
   * @type {Array<MenuDataItem>}
   */
  itemListMenu: MenuDataItem;


  /**
   * URL được lưu trong cache.
   *
   * @type {(string | null)}
   */
  cacheURL = localStorage.getItem('URL');

  /**
   * Menu được lưu trong cache.
   *
   * @type {(string | null)}
   */
  Menu = localStorage.getItem('Menu');

  /**
   * SubMenu được lưu trong cache.
   *
   * @type {(string | null)}
   */
  SubMenu = localStorage.getItem('SubMenu');

  Module = localStorage.getItem('Module');
  /**
   * URL đã chỉnh sửa để so sánh.
   *
   * @type {string}
   */
  modifiedUrl = this.router.url.replace('/1', ''); //company - hachi

  modifiedUrlBase = this.router.url.replace('/4', ''); //enterprise

  examSession = new DTOExam();
  
  @Input() disabled: boolean = false

  /**
   * Sự kiện EventEmitter loadData.
   *
   * @type {EventEmitter<string>}
   */
  @Output() loadData: EventEmitter<string> = new EventEmitter();

  isFirstItemClickable: boolean = false;
  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(
    public menuService: PS_HelperMenuService,
    public router: Router,
    public route: ActivatedRoute,
    public hriSessionService: HriQuizSessionService,
  ) {}

  ngOnInit(): void {
    this.getModuleDataBreadCrumb();
    this.getMenuData();
    //#region disabled component nếu như GetListModuleAPITree pending
    this.disabled = true
    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.disabled = false
      }
    })
  }

  //Xử lý việc click vào nút trên trình duyệt
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.items = [];
    var session = JSON.parse(localStorage.getItem('ExamSession'));
    if(this.itemListMenu.Link !== this.modifiedUrl && Ps_UtilObjectService.hasValue(session)){
        this.itemListMenu = this.listMenu[0];
        this.getModuleDataBreadCrumb();
        this.isFirstItemClickable = false;
    }
    else{
      this.getMenuData();
      this.isFirstItemClickable = true;
    }
  }
  

//get List Menu
  getModuleDataBreadCrumb() {
    var sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (Ps_UtilObjectService.hasValue(item)) {
        this.listMenu = item.ListMenu;
        this.getMenuBreadCrumb();
      }
    });
    this.subArr.push(sst)
  }
  

  //get change Menu data
  getMenuData() {
    var sst = this.menuService.changeMenuData().subscribe((item: MenuDataItem) => {
      if (Ps_UtilObjectService.hasValue(item)) {
        this.itemListMenu = item
        this.getMenuBreadCrumb();
        // console.log(this.itemListMenu)
        var ser_sst = this.hriSessionService.ExamSession$.subscribe(s => {
          if(Ps_UtilObjectService.hasValue(s)){
            this.examSession = s
          }
        })
        this.subArr.push(ser_sst)
        // var session = JSON.parse(localStorage.getItem('ExamSession'));
        //Css để cursor khi cho phép back
        if(this.itemListMenu.Type == 'function' && this.itemListMenu.Code != this.Menu && this.itemListMenu.Code != this.SubMenu && Ps_UtilObjectService.hasValue(this.examSession)){
          if(this.examSession.Code == null || this.examSession.QuizSession == null || this.examSession.StatusID == 2){
          this.isFirstItemClickable = true;
          }
        }
        else{
          this.isFirstItemClickable = false;
        }
      }
    })
    this.subArr.push(sst)
  }



 

  //Xử lý click trở lại trang và emit loadData cho các page để load lại api
  onItemClick(item){
    // Xử lí theo type là function
    this.listMenu.filter(s => s.Type == 'function').find(z => {
      // var session = JSON.parse(localStorage.getItem('ExamSession'))
      if(z.Code == this.Menu && z.Link !== this.itemListMenu.Link && z.Name == item.text && Ps_UtilObjectService.hasValue(this.examSession)){
        // console.log(this.examSession)
        if(this.examSession.Code == null || this.examSession.QuizSession == null || this.examSession.StatusID == 2 || this.examSession.StatusID == 0){
          this.backPage(item.Code);
        }
        else if(item.disable){
          this.backPage(item.Code);
        }
      }

      if (Ps_UtilObjectService.hasValue(z.LstChild) && z.LstChild.length > 0){
          z.LstChild.find(v => {
              if(v.Link == this.itemListMenu.Link && v.Name == item.text ||
                Ps_UtilObjectService.hasValue(this.examSession) && this.examSession.QuizSessionName == item.text){
                  // console.log(item)
                  this.loadData.emit();
              }
          })
      }
    })

  
    
    this.listMenu.filter(s => s.Type == 'group').find(z => {
      if (Ps_UtilObjectService.hasListValue(z.LstChild)){
        if(z.Code == this.Menu){
          z.LstChild.find(v => {
            if (Ps_UtilObjectService.hasListValue(v.LstChild)){
                if(v.Code === this.SubMenu ){
                  if(this.SubMenu == 'hri015-exam-report' && this.cacheURL == '/hri/hri014-exam-monitor' && this.modifiedUrl == '/hri/hri014-exam-monitor'){
                    if(item.text == 'Xem bài làm'){
                          this.loadData.emit();
                    }
                  }
                  
                    this.handleItemClick(item,v)
                 
                }
            }
            //Trường hợp nếu không có lstChild
            else{
              if(item.text == v.Name && !Ps_UtilObjectService.hasValueString(item.Code) && (v.Link == this.modifiedUrl || v.Link == this.cacheURL|| v.Link == this.modifiedUrlBase) ){
                this.loadData.emit();
              }
            }
          })
      }
      }
    })  
  }


   //xử lý binding của dataModule
  getMenuBreadCrumb() {
      this.items = []
      //check nếu reload page thì gán lại item *
      if (!Ps_UtilObjectService.hasValue(this.itemListMenu?.Link)) {
         this.listMenu.find(s =>{
          this.itemListMenu = s
          if(Ps_UtilObjectService.hasListValue(s.LstChild)){
            this.itemListMenu = s.LstChild[0]
          }
         })
      }

      //vẽ breadcrumb với type của sitemap là function
      this.listMenu.filter(s => s.Type == 'function').find(z => {
        // console.log(z)
        if(z.Code == this.Menu){
          this.items.push({text: z.Name,Code: z.Code})

          // if(this.Module !== 'portal'){
          //   this.items.push({text: z.Name,})
          // }else{
          //   var sst = this.menuService.currentMenu$.subscribe(s => {
          //     this.items.push({text: s.Name})
          //    })
          //    this.subArr.push(sst)
          // }

          if(Ps_UtilObjectService.hasListValue(z.LstChild)){
          z.LstChild.find(c => {
            //tìm item khớp với menuData và so sánh để truyền name vào breadcrumb[]
              if(Ps_UtilObjectService.hasListValue(c) && Ps_UtilObjectService.hasValue(this.itemListMenu.Link)){
                if(c.Link == this.itemListMenu.Link || c.Link == this.modifiedUrl){
                  //xử lý với portal vì item push vào không cố định - nếu có item được truyền qua
                  this.items.push({text: c.Name, Code:c.Code})
                  // if(this.Module !== 'portal'){
                  //   this.items.push({text: c.Name})
                  // }
                  // // console.log(this.items)
                  // if(Ps_UtilObjectService.hasValue(this.examSession) && this.examSession.Code != 0){
                  //     this.items.push({text: this.examSession.QuizSessionName,})
                  // }
                  // else{               
                  //   // không có item thì lấy từ localStorage - trường hợp lỗi hoặc reload
                  //   var session = JSON.parse(localStorage.getItem('ExamSession'));
                  //   if(Ps_UtilObjectService.hasValue(session) && c.Link == this.modifiedUrl){
                  //     this.items.push({text: session.QuizSessionName,})
                  //   }
                  // }
                }
                else{
                  if(Ps_UtilObjectService.hasListValue(c.LstChild)){
                    // this.items.push({text: c.Name,disabled:true})
                    c.LstChild.find(v => {
                      if(v.Link == this.itemListMenu.Link){
                        this.items.push({text: v.Name,Code: v.Code})
                      }
                    })
                  }
                }
              }
          })
        }
      }
    })
    
//vẽ breadcrumb với type của sitemap là group
    this.listMenu.filter(s => s.Type == 'group').find(z => {
      // console.log(z)
      if(z.Code == this.Menu){
          z.LstChild.find(c => {
            //tìm item khớp với LStorage và so sánh để truyền name vào breadcrumb[]
              if(c.Code == this.SubMenu){
                //cấp 1
                this.items.push({text: z.Name, Code: z.Code})
                if(Ps_UtilObjectService.hasListValue(c.LstChild)){
                  //Cấp 2
                  if(c.Link == this.cacheURL || c.Link == this.modifiedUrl)
                    this.items.push({ text: c.Name, Code: c.Code});
                  else
                    this.buildBreadCrumb(c,[])
      
                    //Trường hợp component dùng chung và thuộc parent khác - xem bài làm (Sai cấu trúc menuData)*
                  if(this.SubMenu == 'hri015-exam-report' && this.cacheURL == '/hri/hri014-exam-monitor' && this.modifiedUrl == '/hri/hri014-exam-monitor'){
                      this.items.push({text: c.Name,disabled:true,Code: c.Code})
                      c.LstChild.find(s => {
                        if(s.Code == 'hri015-exam-report-detail' || s.Link == '/hri/hri015-exam-report-detail'){
                          this.items.push({text: s.Name,disabled:true, Code: s.Code})
                        }
                        if(this.itemListMenu.Link == this.cacheURL || this.itemListMenu.Link == this.modifiedUrl){
                            this.items.push({text: this.itemListMenu.Name})
                            const uniqueItems = this.items.filter((item, index, self) =>
                            index === self.findIndex((t) => t.text === item.text));
                            if(Ps_UtilObjectService.hasListValue(uniqueItems)){
                                this.items = uniqueItems
                            }
                        }
                      })
                    }
                }
                //push khi không có cấp con
                else{
                  if(c.Link == this.cacheURL){
                    this.items.push({ text: c.Name});
                  }
                }
              }
          });
         
        }
    });
}



//hàm build breadcrumb
buildBreadCrumb(node, path = []) {
  if(Ps_UtilObjectService.hasListValue(node.LstChild)){
    node.LstChild.forEach(child => {
      let newPath = path.concat({text: node.Name, disabled: true, Code: node.Code});
      if(child.Link == this.modifiedUrl || child.Link == this.modifiedUrlBase){
        this.items.push(...newPath, {text: child.Name, Code: child.Code});
      }
      // Gọi hàm đệ quy cho từng phần tử con
      this.buildBreadCrumb(child, newPath);
    })
  }
}

// xử lí click item trên breadcrumb
 handleItemClick(item, node) {
  if(item.text === node.Name){
    if(node.Link === this.cacheURL || node.Link == this.modifiedUrl || node.Link == this.modifiedUrlBase){
      if(item.Code === node.Code){
        this.loadData.emit()
      }
    }
    else{
      if(item.Code === node.Code){
        this.backPage(item.Code);
      }
    }
  }
  

  if(Ps_UtilObjectService.hasListValue(node.LstChild)){
    node.LstChild.forEach(childNode => {
      this.handleItemClick(item, childNode);
    });
  }

}

//Đệ quy tìm code để cho activeMenu
searchMenuData(dataList, targetCode) {
  for (const item of dataList) {
    if (item.Code === targetCode) {
      return item;
    }

    if (Ps_UtilObjectService.hasListValue(item.LstChild)) {
      const foundItem = this.searchMenuData(item.LstChild, targetCode);
      if (foundItem) {
        return foundItem;
      }
    }
  }
  return null;
}

//Trở lại trang 
backPage(CodePage:string) {
    var parent = this.listMenu.find(f => f.Code == this.Menu)
    if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)){
      var detail = this.searchMenuData(parent.LstChild,CodePage)
      this.menuService.activeMenu(detail)
    }
    if(Ps_UtilObjectService.hasValue(parent) && parent.Type == 'function'){
      this.menuService.activeMenu(parent)
    }
    
}
    
ngOnDestroy(): void {
  this.subArr.map( s => {
    s?.unsubscribe();
  });
}
}

