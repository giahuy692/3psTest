import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { DTOChannelGroup } from '../../shared/dto/DTOChannelGroup.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import DTOChannel, { DTOChannelProduct, DTOChannelOnsite } from '../../shared/dto/DTOChannel.dto';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { EcomChannelAPIService } from '../../shared/services/ecom-channel-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import * as $ from 'jquery';
import { TreeItem } from '@progress/kendo-angular-treeview';

@Component({
  selector: 'app-ecom012-product-channel',
  templateUrl: './ecom012-product-channel.component.html',
  styleUrls: ['./ecom012-product-channel.component.scss']
})
export class Ecom012ProductChannelComponent implements OnInit , OnDestroy{

  @ViewChild('rowMoreActionPopup') rowMoreActionPopup;
  @ViewChild('drawerRight') public DrawerRightComponent: DrawerComponent;
  @ViewChild('imageContainer') imageContainer: ElementRef;

  //#region variable status
    dangSoanthao_checked: boolean = true
    guiDuyet_checked: boolean = true
    daDuyet_checked: boolean = false
    ngungApDung_checked: boolean = false

    IsEditChannel: boolean = false
    Onsite: boolean = false
    IsGroupEdit: boolean = false
  //#endregion

  //#region variable Permistion
    isToanQuyen: boolean = false
    isFilterActive: boolean = true
    isAllowedToCreate: boolean = false
    isAllowedToVerify: boolean = false
  //#endregion

  //#region variable action
    loading: boolean = false
    loadingList: boolean = false
    justLoaded: boolean = true
    reLoadPage: boolean = false

    isAdd: boolean = false
    isLock: boolean = false
    isFirstCall: boolean = true
    expandedRight: boolean = false
    isautoCollapse: boolean = false
    errorOccurred: any = {};

    popupShow: boolean = false
    showCheckbox: boolean = true
    excelValid: boolean = true

    isExpandListOnSite: boolean = false
    isExpandListGroupChannel: boolean = false
    isExpandListChannelStates: {[key: number]: boolean}  = {}
    isDisableStates: {[key: number]: boolean}  = {}
    isExpandListChannel: boolean = true
    isExpandListOrderChannel: boolean = true

    selectedRowitemDialogOpened: boolean = false
    openedDialog: boolean = false
    isChangeGroup: boolean = false
  //#endregion

  //#region variable number
    typeView: number = 1 //1: tất cả, 2: nhóm kênh, 3: kênh
    countGroupChannel: number = 0
    countChannel: number = 0
    countImage: number = 0
    currentAnchorIndex: number = -1
    valueDepth: number = 2
    countOnsite: number = 0
    TypeDelete: number = 1
    overflowCount: number = 0
    minQty: number = 1
    maxQty: number = 1
  //#endregion
  
  //#region variable string
    KeyWord: string =''
    ListTreeTextField: string[] = ['ListGroup', 'ListChannel']
    type: string = 'down'
    ProductBarcode: string = ''
  //#endregion
  
  //#region Object
    ChannelProduct: DTOChannelProduct = new DTOChannelProduct()
    ChannelGroup: DTOChannelGroup = new DTOChannelGroup()
    currentRowItem = new Object()
    curChannelGroup: any =  { Code: null, ChannelGroupName: 'Không lựa chọn' , ChannelGroupID: "", ImageSetting: "", ChannelName: ""}
    channel: any
    curChangeGroup: DTOChannelGroup = new DTOChannelGroup()
    defaultChangeGroup: DTOChannelGroup = new DTOChannelGroup()
    ItemSelectedPopup = new DTOChannelProduct();
    defaultChannel: any = { Code: null, ChannelGroupName: 'Không lựa chọn' , ChannelGroupID: "", ImageSetting: "", ChannelName: ""};
    PopupDetetel: {title: string, content: string, type: number, data?: any} = {
      title: 'XÓA SẢN PHẨM?',
      content: 'Bạn chắc chắn muốn xóa sản phẩm khỏi kênh kinh doanh',
      type: 2,
    }
  //#endregion
  
  //#region Array
    actionPerm: DTOActionPermission[] = []
    moreActionDropdown: MenuDataItem[] = []

    listChannelData: DTOChannelGroup[] = []
    listProductChannelAllGroupData: DTOChannelProduct[] = []

    listProductChannelGroupData: DTOChannelGroup[] = []
    listProductChannelData: DTOChannelGroup[] = []

    listGroupChannel: DTOChannelGroup[] = []
    ListDisplayGroupChannel: DTOChannelGroup[] = []
    ListGroupChannelIsApproved: DTOChannelGroup[] = []
    ListGroupChannelIsApproveddisplay: DTOChannelGroup[] = []
    ListGroupChannelUpdate: DTOChannelGroup[] = []


    ChannaelData: DTOChannelGroup[] =[]
    ChannaelDataFilter: DTOChannelGroup[] =[]

    listImageChannel: string[]= []
    listConditionOnsiteChannel: string[]= []
    ineligibleListOnsite: DTOChannelOnsite[] = []
    arrBtnStatus: { text: string, class: string, code: string, link?: any, type?: string }[] = [];
    arrBtnOtion: { text: string, class: string, code: string, link?: any, type?: string }[] = [];
  //#endregion

  //#region component Grid
    gridView = new Subject<any>();
    pageSize = 25
    pageSizes = [this.pageSize]
    allowActionDropdown = []
    skip = 0;
    sortBy: SortDescriptor = {
      field: 'Code',
      dir: 'asc'
    }
    gridState: State = {
      take: this.pageSize,
      sort: [this.sortBy],
      filter: { filters: [], logic: 'and' },
      skip: this.skip
    }
    filterStatus: CompositeFilterDescriptor = {
      logic: "or",
      filters: []
    }
    filterStatus2: CompositeFilterDescriptor = {
      logic: "and",
      filters: []
    }
    filterSearchBox: CompositeFilterDescriptor = {
      logic: 'or',
      filters: [],
    }
    filterDropdownTree: CompositeFilterDescriptor = {
      logic: 'or',
      filters: [],
    }
    filterStatus_ChuaduDieuKien: FilterDescriptor = { field: "IsRightToOnsite", operator: "eq", value: true }
    filterDrafting: FilterDescriptor = {field: "StatusID", operator: "eq", value: 0 }
    filterApproved: FilterDescriptor = { field: "StatusID", operator: "eq", value: 2 }
    filterSuspended: FilterDescriptor = { field: "StatusID", operator: "eq", value: 3 }
    filterSent: FilterDescriptor = {field: "StatusID", operator: "eq", value: 1 }
    filterReturned: FilterDescriptor = {field: "StatusID", operator: "eq", value: 4 }
    filterStatus_dieuChinh: FilterDescriptor = { field: "IsEdit", operator: "eq", value: true }
    filterDropdownTreeContent: FilterDescriptor 
    tempSearch: any;
    //select
    selectable: SelectableSettings = {
      enabled: true,
      mode: 'multiple',
      drag: false,
      checkboxOnly: true,
    }

    total = 0
  //#endregion
    
  //#region CallBack Function
    uploadEventHandlerCallback: Function
    onActionDropdownClickCallback: Function
    getActionDropdownCallback: Function
    onPageChangeCallback: Function
    onFilterChangeCallback: Function
    getSelectionPopupCallback: Function
    onSelectCallback: Function
    onSelectedPopupBtnCallback: Function
  //#endregion
    
    Unsubscribe = new Subject<void>();
  
  
  constructor(
    public menuService: PS_HelperMenuService,
    public domSanititizer: DomSanitizer,
    private APIService: EcomChannelAPIService,
    public layoutService: LayoutService,
    public layoutAPIService: LayoutAPIService,
    private cd: ChangeDetectorRef
  ){ 
  }
  
  ngOnInit(): void {
    let that = this

    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) =>{
      if(Ps_UtilObjectService.hasListValue(res) && this.justLoaded){
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        
        // this.onGetCache()
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.onGetCache()
			}
		})
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //callback
    this.onPageChangeCallback = this.onPageChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }

  Compeonentdropdownlist: any;
  ngAfterViewInit() {
    var that = this;
    $(document).ready(function () {
      $('.k-grid-content').scroll(function () {
        if (that.Compeonentdropdownlist != undefined) {
          that.Compeonentdropdownlist.toggle(false);
        }
      })
    })

    this.cd.detectChanges();
  }

  customCompare(a, b) {
    // Nếu width và height của a và b khác nhau
    if (a.width !== b.width || a.height !== b.height) {
      // Sắp xếp a sau b
      return 1;
  } 
  // Nếu width và height của a và b đều bằng nhau
  else {
      // Sắp xếp a trước b
      return -1;
  }
  }

  //#region GET DATA API

    // Lấy dữ liệu tùy theo giao diện
    onGetData(){
      this.onLoadFilter()
      if(this.typeView == 1){
        this.APIGetListProductChannelGroup()
      }
      if(this.typeView == 2){
        this.showCheckbox = true
        this.APIGetListProductChannelGroup(this.curChannelGroup.Code)
      } 
      if(this.typeView == 3){
        this.showCheckbox = false
        this.APIGetListProductChannelGroup(this.curChannelGroup.ParentID , this.curChannelGroup.Code)
      }
    }
  
    // Lấy dữ liệu từ cache
    onGetCache(){
      // lấy danh sách dropdowntree
      if(!Ps_UtilObjectService.hasListValue(this.listChannelData) || this.reLoadPage){
        this.APIGetListChannelGroupTwoLevel()
        this.reLoadPage = false
      }
      // gán giá trị mạc dịnh cho dropdowntree
      this.curChannelGroup = this.defaultChannel
      // lấy thông tin từ cache nhóm kênh và kênh 
      const groupChannelres = JSON.parse(localStorage.getItem('ecom_groupChannel_detail'))
      const channelres = JSON.parse(localStorage.getItem('ecom_channel_detail'))

      if (Ps_UtilObjectService.hasValue(groupChannelres) && this.isFirstCall) {
        this.CheckTypeView(groupChannelres, 'ecom_groupChannel_detail')
      } 
      else if (Ps_UtilObjectService.hasValue(channelres) && this.isFirstCall) {
        this.CheckTypeView(channelres, 'ecom_channel_detail')
      } 
      else{
        this.typeView = 1
      }
      // lấy dữ liệu thông tin sản phẩm
      this.onGetData()
    }

    // kiểm tra cache và bilding dữ liệu lên dropdown tree và xóa cache
    CheckTypeView(data: any, key: string){
      if (Ps_UtilObjectService.hasValue(data) && this.isFirstCall) {
        if(key == 'ecom_groupChannel_detail'){
          this.typeView = 2
        } else{
          this.typeView = 3
        }
        this.isFirstCall = false
        this.curChannelGroup = data
        localStorage.removeItem(key)
      }
    }

    getImageWidth(imageUrl: string): number {
      const img = new Image();
      img.src = imageUrl;
      return img.width;
    }

    // API lấy danh sách sản phẩm của nhóm kênh
    APIGetListProductChannelGroup(ChannelGroup?: number, Channel?: number){
      this.loadingList = true
      this.APIService.GetListProductChannelGroup(this.KeyWord, this.gridState,ChannelGroup,Channel).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listProductChannelGroupData = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total;
          this.gridView.next({data: this.listProductChannelGroupData, total: this.total})
          if (this.typeView === 2) {
            this.listProductChannelGroupData.forEach(product => {
              if (!!product.IsOutDistributedStock === false) {
                product.IsOutDistributedStock = false;
              }
              // Tạo một mảng mới để lưu trữ các đối tượng được tái cấu trúc của ListIcon
              const newListIcon = [];
              // Tạo một mảng để lưu trữ các đối tượng có width === height
              const equalDimensions = [];
              // Lặp qua các phần tử trong ListIcon của sản phẩm
              product.ListIcon.forEach(imgURL => {
                  // Tạo một đối tượng mới img để tải hình ảnh giả
                  const img = document.createElement('img');
                  img.src = imgURL;
                  img.onload = () => {
                      // Kiểm tra nếu width === height
                      if (img.width === img.height) {
                          // Push vào đầu danh sách
                          equalDimensions.unshift({ imgURL: imgURL, width: img.width, height: img.height });
                      } else {
                          // Push vào cuối danh sách
                          newListIcon.push({ imgURL: imgURL, width: img.width, height: img.height });
                      }
                      // Kiểm tra nếu đã xử lý xong tất cả các hình ảnh
                      if (equalDimensions.length + newListIcon.length === product.ListIcon.length) {
                          // Ghép hai mảng lại với nhau
                          const finalListIcon = equalDimensions.concat(newListIcon);
                          // Cập nhật trường ListIcon của sản phẩm với mảng mới đã sắp xếp
                          product.ListIcon = finalListIcon;
                      }
                  };
                });
            });

            // console.log('listProductChannelGroupData',this.listProductChannelGroupData);
          }
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm: ${res.ErrorString}`) }
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách sản phẩm:  ${err}`)
      });
    }

    // API lấy danh sách tree nhóm kênh
    APIGetListChannelGroupTwoLevel() {
      const ctx = 'nhóm kênh hoặc kênh bán hàng'
      this.loading = true
      this.APIService.GetListChannelGroupTwoLevel().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loading = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listChannelData = res.ObjectReturn;
          this.listChannelData.unshift(this.defaultChannel); // Thêm item mặc định
          this.ChannaelData = this.listChannelData.slice();
          this.ChannaelDataFilter = this.ChannaelData
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`) }
      }, 
      (err) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
      })
    }

    // API lấy sản phẩm
    APIGetChannelGroupProduct(Product ?: number , Barcode ?: string, ChannelGroup?: number, Channel?: number){
      this.loadingList = true

      this.APIService.GetChannelGroupProduct(Product, Barcode, ChannelGroup, Channel).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.ChannelProduct = res.ObjectReturn
          this.minQty = this.ChannelProduct.MinQty
          this.maxQty = this.ChannelProduct.MaxQty

          if(this.isAdd){
            this.isExpandListOnSite = true
            this.isExpandListGroupChannel = true
            this.APIGetListChannelGroupProduct(null, ChannelGroup)

          } else {
            this.APIGetListChannelGroupProduct(this.ChannelProduct.Product, ChannelGroup)
          }
        }
        else { 
          this.ChannelProduct = new DTOChannelProduct()
          this.ChannelProduct.Product = null
          this.ChannelProduct.Barcode = this.ProductBarcode
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm: ${res.ErrorString}`) 
        }
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy sản phẩm:  ${err}`)
      });
    }

    // API lấy danh sách nhóm kênh cho drawer
    APIGetListChannelGroupProduct(Product: number, ChannelGroup: number){
      this.loadingList = true
      this.countChannel = 0

      this.APIService.GetListChannelGroupProduct(Product ,ChannelGroup).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listGroupChannel = res.ObjectReturn
          if(Ps_UtilObjectService.hasListValue(this.listGroupChannel)){
            this.ListDisplayGroupChannel = JSON.parse(JSON.stringify(this.listGroupChannel))
            this.ListDisplayGroupChannel.forEach(e => {
              this.isExpandListChannelStates[e.ChannelGroup] = e.IsApproved == true
            });
            this.countChannel = this.ListDisplayGroupChannel[0].ListChannel.length
          }
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhóm kênh kinh doanh: ${res.ErrorString}`) }
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhóm kênh kinh doanh:  ${err}`)
      });
    }

    // API Cập nhật tình trạng
    APIUpdateStatusChannelGroupProduct(ListProdct: DTOChannelProduct[], StatusID: number){
      this.loadingList = true

      this.APIService.UpdateStatusChannelGroupProduct(ListProdct, StatusID).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Cập nhật tình trạng thành công`)
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi cập nhập tình trạng: ${res.ErrorString}`) }
        this.onGetData()
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhập tình trạng:  ${err}`)
      });
    }
  
    // API Cập nhật thông tin kênh sản phẩm
    APIUpdateChannelGroupProduct(ChannelGroup: DTOChannelGroup[]){
      this.loadingList = true

      this.APIService.UpdateChannelGroupProduct(ChannelGroup).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${this.isAdd == true ? 'Tạo mới' : 'Cập nhật'} kênh kinh doanh cho sản phẩm thành công`)
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAdd == true ? 'tạo mới' : 'cập nhật'} kênh kinh doanh cho sản phẩm: ${res.ErrorString}`) }
        this.onGetData()
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${this.isAdd == true ? 'tạo mới' : 'cập nhật'} kênh kinh doanh cho sản phẩm:  ${err}`)
      });
    }
  
    // API xóa sản phẩm
    APIDeleteChannelGroupProduct(item: DTOChannelProduct[]){
      this.loadingList = true

      this.APIService.DeleteChannelGroupProduct(item).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Xóa nhóm kênh thành công!`);
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi xóa sản phẩm : ${res.ErrorString}`) ;}
        this.onGetData()
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa sản phẩm:  ${err}`)
        this.onGetData()
      });

    }

    // API ImportExecel
    p_ImportExcel(file) {
      this.loadingList = true
      var ctx = "Import Excel"
  
      this.APIService.ImportChannelGroupProduct(file).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        this.loadingList = false;
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.layoutService.setImportDialogMode(1)
          this.layoutService.setImportDialog(false)
          this.onLoadPage()
          this.layoutService.getImportDialogComponent().inputBtnDisplay()
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
      }, (err) => {
        this.loadingList = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      })
    }
  
      // API DownLoad Template
      APIGetTemplate() {
        var ctx = "Tải Excel Template"
        var getfilename = "ChannelGroupProductTemplate.xlsx"
        this.layoutService.onInfo(`Đang xử lý ${ctx}`)

        this.layoutAPIService.GetTemplate(getfilename).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
          if (res != null) {
            Ps_UtilObjectService.getFile(res)
            this.layoutService.onSuccess(`${ctx} thành công`)
          } else {
            this.layoutService.onError(`${ctx} thất bại`)
          }
        }, f => {
          this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
          this.loadingList = false;
        });
      }
  
    //-------------------#endregion--------------------//
  
    //-------------------#region Logic-------------------//
    getResImg(str: string, imageKey: string) {
      let a = Ps_UtilObjectService.removeImgRes(str);
      if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
      else {
        return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
      }
    }
  
    handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }
  
    getResHachi(str: string) {
      let a = Ps_UtilObjectService.removeImgRes(str);
      return Ps_UtilObjectService.getImgResHachi(a);
    }
  
    // Format danh sach dieu kien onsite 
    formatListOnsite(ListOnSite: DTOChannelOnsite[]){
      let arr1 = []
      ListOnSite.filter(item =>{
        if(!item.Choose){
          arr1.push(item)
        }
      })
      if(Ps_UtilObjectService.hasListValue(arr1)){
        this.countOnsite = arr1.length
      }
      return arr1
    }
    

    countList(listItem: DTOChannelOnsite[]){
      if(Ps_UtilObjectService.hasListValue(listItem)){
        const item = listItem.findIndex(s =>s.Choose == false)
        if(item == -1){
          this.countOnsite = 0
        } else{
          this.countOnsite = this.formatListOnsite(listItem).length
        }
      }
      return this.countOnsite
    }

    countListGroupChannel(listItem: DTOChannelGroup[]){
      let arr1= []
      if(Ps_UtilObjectService.hasListValue(listItem)){
        const item = listItem.findIndex(s =>s.IsApproved == true)
        if(item == -1){
          this.countGroupChannel = 0
        } else{
          listItem.filter(item =>{
            if(item.IsApproved){
              arr1.push(item)
            }
          })
          this.countGroupChannel = arr1.length
        }
      }
      return this.countGroupChannel
    }

    // vẽ vị trị hiện popup của dropdown 
    cssPositionPopup(){
      $(document).ready(function () {
        const pageHeight = $('.app-ecom012-channel-product').height();
        const popupHeight = $('.k-animation-container:has(.fmDropdown)').height();
        const positionBtn = $('.selectedPopup .k-button').offset().top;
        if (pageHeight - positionBtn < popupHeight) {
          if (popupHeight > 120) {
            $('.app-ecom012-channel-product .list-tool .k-animation-container').css({
              left: 'auto',
              top: positionBtn - 92,
              right: 58
            });
          } else {
            $('.app-ecom012-channel-product .list-tool .k-animation-container').css({
              left: 'auto',
              top: positionBtn - 61,
              right: 58
            });
          }
        } else if (pageHeight - positionBtn >= popupHeight) {
          $('.app-ecom012-channel-product .list-tool .k-animation-container').css({
            right: 58,
            left: 'auto',
            top: positionBtn
          });
  
        }
      })
    }

    // hiện thị nút ở danh sách con
    displayStatusBtn(channel: DTOChannel) {
        this.arrBtnStatus = [];
        // item có tình trạng đang soạn thảo và trả về
        if((this.isAllowedToCreate || this.isToanQuyen) && (channel.StatusID == 0 || channel.StatusID == 4)){
          this.arrBtnStatus.push(
            { text: 'Chỉnh sửa', class: 'k-button btnSua', code: 'pencil', link: 0, type: "edit" },
            { text: 'Gửi duyệt', class: 'k-button btnGui', code: 'redo', link: 1, type: "Send"}
          );
          if(channel.StatusID == 0){
            this.arrBtnStatus.push(
              { text: 'Xóa', class: 'k-button btnxoa', code: 'trash', link: 2, type: "delete" },
            );
          }
        } 
        // item có tình trạng gửi duyệt
        if((this.isAllowedToVerify || this.isToanQuyen) && (channel.StatusID == 1)){
          this.arrBtnStatus.push(
            { text: 'Chỉnh sửa', class: 'k-button btnSua', code: 'pencil', link: 0, type: "edit" },
            { text: 'Duyệt áp dụng', class: 'k-button btnDuyet', code: 'check-outline', link: 2, type: "Approve" },
            { text: 'Trả về', class: 'k-button btnTraVe', code: 'undo', link: 4, type: "return" },
          );
        } 

        // item có tình trạng duyệt
        if((this.isAllowedToVerify || this.isToanQuyen) && (channel.StatusID == 2)){
          this.arrBtnStatus.push(
            { text: 'Chỉnh sửa', class: 'k-button btnSua', code: 'pencil', link: 0, type: "edit" },
            { text: 'Ngưng áp dụng', class: 'k-button btnngưng', code: 'minus-outline', link: 3, type: "stop" },
          );
        }
        // item có tình trạng ngưng
        if((this.isAllowedToVerify || this.isToanQuyen) && (channel.StatusID == 3)){
          this.arrBtnStatus.push(
            { text: 'Chỉnh sửa', class: 'k-button btnSua', code: 'pencil', link: 0, type: "edit" },
            { text: 'Duyệt áp dụng', class: 'k-button btnDuyet', code: 'check-outline', link: 2, type: "Approve" },
            { text: 'Trả về', class: 'k-button btnTraVe', code: 'undo', link: 4, type: "return" },
          );
        }
        
      return this.arrBtnStatus       
    }

    //hiện thị nút dropdown
    displayOtionBtn(channel: DTOChannelProduct){
      this.cssPositionPopup();
        this.arrBtnOtion = [];
        var DangSoan = channel.ListGroup.findIndex(s => s.StatusID == 0)
        var GuiDuyet = channel.ListGroup.findIndex(s => s.StatusID == 1)
        var Duyet = channel.ListGroup.findIndex(s => s.StatusID == 2)
        var Ngung = channel.ListGroup.findIndex(s => s.StatusID == 3)
        var TraVe = channel.ListGroup.findIndex(s => s.StatusID == 4)

        this.arrBtnOtion.push(
          { text: 'Chỉnh sửa', class: 'k-button btnSua', code: 'pencil', link: 0, type: "edit" },
        )  

        if((DangSoan != -1 || TraVe != -1) && (this.isToanQuyen || this.isAllowedToCreate)){
          this.arrBtnOtion.push(
            { text: 'Gửi duyệt', class: 'k-button btnGui', code: 'redo', link: 1, type: "Send"},
          )        
        }  
        if((GuiDuyet != -1 || Ngung != -1) && (this.isToanQuyen || this.isAllowedToVerify)){
          this.arrBtnOtion.push(
            { text: 'Duyệt áp dụng', class: 'k-button btnDuyet', code: 'check-outline', link: 2, type: "Approve" },
            { text: 'Trả về', class: 'k-button btnTraVe', code: 'undo', link: 4, type: "return" }
          )
        }  

        if(Duyet != -1 && (this.isToanQuyen || this.isAllowedToVerify)){
          this.arrBtnOtion.push(
            { text: 'Ngưng áp dụng', class: 'k-button btnngưng', code: 'minus-outline', link: 3, type: "stop" },
          )
        }

        if(DangSoan != -1 && (this.isToanQuyen || this.isAllowedToCreate)){
          this.arrBtnOtion.push(
            { text: 'Xóa', class: 'k-button btnxoa', code: 'trash', link: 2, type: "delete" },
          )
        }

        this.ItemSelectedPopup = channel;
        return this.arrBtnOtion
    }

    // hiện nút tình trạng drawer
    displayActionBtn(item: DTOChannel){
      if(item.StatusID == 2 && !item.IsMove){
        return 'minus-outline'
      } 
      else if(item.StatusID == 3){
        return 'check-outline'
      } 
      else if(item.FromGroup != null) {
        return 'trash'
      }
    }

    ChecklistImage(listImage){
      if(Ps_UtilObjectService.hasListValue(listImage) && listImage.length > 4){
        this.countImage = listImage.length - 4
        this.listImageChannel = listImage.slice(0, 4);
        return true;
      } else{
        this.listImageChannel = listImage
      }
      return false;
    }

    // load filter
    onLoadFilter(){
      this.pageSizes = [...this.layoutService.pageSizes]
      this.gridState.take = this.pageSize
      this.gridState.filter.filters = []
      this.filterStatus.filters = []
      this.filterStatus2.filters = []

      if(this.typeView != 1){
        if (this.dangSoanthao_checked) {
          this.filterStatus.filters.push(this.filterDrafting);
          this.filterStatus.filters.push(this.filterReturned);
        }
    
        if (this.daDuyet_checked) {
          this.filterStatus.filters.push(this.filterApproved);
        }
    
        if (this.ngungApDung_checked) {
          this.filterStatus.filters.push(this.filterSuspended);
        }
    
        if(this.guiDuyet_checked){
          this.filterStatus.filters.push(this.filterSent);
        }
      }

      if(this.Onsite){
        this.filterStatus_ChuaduDieuKien.value = false
      } else{
        this.filterStatus_ChuaduDieuKien.value = true
      }
      this.filterStatus2.filters.push(this.filterStatus_ChuaduDieuKien)

      //-- && (this.IsEditChannel || this.IsGroupEdit)
      if(this.typeView !== 1){
        if(this.IsEditChannel || this.IsGroupEdit) {
          this.filterStatus_dieuChinh.value = true
        } else {
          this.filterStatus_dieuChinh.value = false
        }
        this.filterStatus2.filters.push(this.filterStatus_dieuChinh)
      }

      if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
        if (Ps_UtilObjectService.hasValueString(this.tempSearch[0].value)) {
          this.gridState.filter.filters.push(this.filterSearchBox);
        }
      }

      if (this.filterStatus2.filters.length > 0){
        this.gridState.filter.filters.push(this.filterStatus2)
      }

      if (this.filterStatus.filters.length > 0){
        this.gridState.filter.filters.push(this.filterStatus)
      }

      if(Ps_UtilObjectService.hasListValue(this.filterDropdownTree.filters)){
        this.gridState.filter.filters.push(this.filterDropdownTree)
      }
    }

    fetchChildren = (Channel: any): Observable<any[]> => {
      const childrenData = [];

      this.ListTreeTextField.forEach(field => {
        if (Channel[field] && Array.isArray(Channel[field])) {
          childrenData.push(...Channel[field]);
        }
      });
      
      return of(childrenData);
    };

    hasChildren = (Channel: object): boolean => {
      let hasChild = false;
  
      // Lặp qua danh sách trường dữ liệu con và kiểm tra xem chúng có tồn tại hay không
      this.ListTreeTextField.forEach(field => {
        if (Channel[field] && (Ps_UtilObjectService.hasListValue(Channel[field]))) {
          hasChild = true;
        }
      });
  
      return hasChild;
    };

    open(){
      $(document).ready(function() {
        // Tìm tất cả các phần tử có class 'k-treeview-leaf'
        $('.k-treeview-leaf').each(function() {
            // Kiểm tra xem có phần tử con nào có class 'itemdiasble' hay không
            if ($(this).find('.itemdiasble').length > 0) {
                // Nếu có, thêm class 'k-disabled' vào phần tử 'k-treeview-leaf'
                $(this).addClass('k-disabled');
            }
        });
      });
    }

    search(items: any[], term: string): any[] {
      this.open()
      return items.reduce((acc, item) => {
        if(item.hasOwnProperty('ChannelGroupID') || item.hasOwnProperty('ChannelGroupName')){
          if (this.contains(item.ChannelGroupID, term) || this.contains(item.ChannelGroupName, term)) {
            acc.push(item);
          } else if(Ps_UtilObjectService.hasListValue(item.ListGroup) || Ps_UtilObjectService.hasListValue(item.ListChannel)){
            let newItemGroups
            if(Ps_UtilObjectService.hasListValue(item.ListGroup)){
              newItemGroups = this.search(item.ListGroup, term)
            }
            if(Ps_UtilObjectService.hasListValue(item.ListChannel)){
              newItemGroups = this.search(item.ListChannel, term)
            }
            if (newItemGroups.length > 0 ) {
              acc.push({ ChannelGroupName: item.ChannelGroupName, ChannelGroupID: item.ChannelGroupID, ListGroup: newItemGroups, TypeData: item.TypeData });
            }
          }
        }
        else if(item.hasOwnProperty('ChannelName')){
          if (this.contains(item.ChannelName, term)) {
            acc.push(item);
          }
        }
        
        return acc;
      }, []);
    }


    contains(text: string, term: string): boolean {
      return text.toLowerCase().indexOf((term || "").toLowerCase()) >= 0;
    }
  
    //-------------------#endregion----------------------//
  
    //-------------------#region header-1-------------------//
    onLoadPage(){
      // lấy dữ liệu mới 
      this.onGetData()
    }

    onImportExcel(){
      this.layoutService.setImportDialog(true)
      this.layoutService.setExcelValid(this.excelValid)
    }
  
    onDownloadExcel(){
      this.APIGetTemplate()
    }
  
    selectedBtnChange(e, strCheck: string){
      this[strCheck] = e
      this.onGetData()
    }

    //#region dropdowntree
      /**
   * The field that holds the keys of the expanded nodes.
   */
    public expandedNodes: number[] = [];

    /**
     * A function that checks whether a given node index exists in the expanded keys collection.
     * If the item ID can be found, the node is marked as expanded.
     */
    public isNodeExpanded = (node: any): boolean => {
      return this.expandedNodes.indexOf(node.Code) !== -1;
    };

    /**
     * A `nodeCollapse` event handler that will remove the node data item ID
     * from the collection, collapsing its children.
     */
    public handleCollapse(args: TreeItem): void {
      this.expandedNodes = this.expandedNodes.filter(
        (id) => id !== args.dataItem.Code
      );
    }

    /**
     * An `nodeExpand` event handler that will add the node data item ID
     * to the collection, expanding the its children.
     */
    public handleExpand(args: TreeItem): void {
      this.expandedNodes = this.expandedNodes.concat(args.dataItem.Code);
    }
  
    onCheckboxClick(strCheck: string, e?: DTOChannelGroup){
      if(strCheck == 'IsApproved'){// nếu là duyệt nhóm kênh vào sản phẩm
        e.IsApproved = !e.IsApproved
        // chuyển trạng thái IsApproved của nhóm kênh
        if(!e.IsApproved){
          this.countGroupChannel = this.countGroupChannel - 1
          // hủy tất các chuyển "từ" và "tới" của nhóm kênh không được chọn 
          e.ListChannel.forEach(item =>{
            if(Ps_UtilObjectService.hasValue(item.ToGroup) || Ps_UtilObjectService.hasValue(item.FromGroup)){
              this.DeleteChanel(item)
            } else{
              item.StatusID = 2
              item.StatusName = 'Duyệt áp dụng'
            }
          })
        } else {
          this.countGroupChannel = this.countGroupChannel + 1
        }
        this.isExpandListChannelStates[e.ChannelGroup] = e.IsApproved
        this.ListDisplayGroupChannel.map(channelGroup => {
          if (channelGroup.Code === e.Code) {
            return {
              ...channelGroup,
              IsApproved: e.IsApproved 
            };
          } else {
            return channelGroup;
          }
        });
      } else{
        this[strCheck] = !this[strCheck]
        this.gridState.skip = 0
        this.onGetData()
      }
    }

    //#endregion
  
    uploadEventHandler(e: File){
      this.p_ImportExcel(e)
    }

    // Hàm xử lý mở drawer
    onOpenDrawer(isAdd: boolean){
      this.isAdd = isAdd
      this.isExpandListOnSite = true; // Expand Điều kiện onsite
      this.isExpandListGroupChannel = true; // Expand Nhóm kênh kinh doanh
      this.isExpandListChannel = true;
      if(this.isAdd){
        this.ChannelProduct = new DTOChannelProduct()
        this.ChannelProduct.Product = null
        this.onCheckPermistion()
      } else{
        if(this.countList(this.ChannelProduct.ListOnSite) > 0){
          this.isExpandListOnSite = true
        }   
        if(this.typeView == 2){
          this.APIGetChannelGroupProduct(this.ChannelProduct.Product, null ,this.curChannelGroup.Code)
        } else if(this.typeView == 3){
          this.APIGetChannelGroupProduct(this.ChannelProduct.Product, null , this.curChannelGroup.ParentID , this.curChannelGroup.Code )
        } else{
          this.APIGetChannelGroupProduct(this.ChannelProduct.Product, null )
        }
      }
     
      this.DrawerRightComponent.toggle()
    }

    // Hàm xử lý khi đóng drawer
    onCloseDrawer(){
      this.ListGroupChannelIsApproved =[]
      this.isLock = false
      this.countGroupChannel = 0
      this.countOnsite = 0
      this.isExpandListChannel = false
      this.isExpandListOnSite = false
      this.isExpandListGroupChannel = false
      this.DrawerRightComponent.toggle()
    }
    //-------------------#endregion-------------------------//
  

    //-------------------#region header-2-------------------//

    onHandleSearch(event: any){
      if (event.filters && event.filters.length > 0){
        if (event.filters[0].value === '') {
          this.gridState.skip = 0
          this.onGetData()
        }
        else if (Ps_UtilObjectService.hasValueString(event)) {
          this.filterSearchBox.filters = event.filters;
          this.tempSearch = event.filters;
          this.gridState.skip = 0
          this.onGetData()
        }
      }
    }
  
    onResetFilter(){
      this.gridState.skip = 0
      this.KeyWord = ""
      this.typeView = 1
      this.Onsite = false
      this.IsEditChannel = false
      this.curChannelGroup = this.defaultChannel
      this.filterDropdownTree.filters = []
      this.onGetData()
    }


    /**
     * Hàm xử lý chọn item trong dropdownlist Nhóm kênh hoặc kênh
     * @param Channel nhóm kênh
     * kendo-dropdowntree khi dùng clearButton thì (valueChange) sẽ chạy dup 2 lần
     * dùng  biến cờ callOneTimeDropdownlist để giải quyết lý do này
    */
    callOneTimeDropdownlist: number = 0;
    handleSelectedCurrentChannel(Channel: DTOChannelGroup){
      // console.log(this.curChannelGroup);
      this.filterDropdownTree.filters = []
      this.curChannelGroup = Channel
      // this.Onsite = false
      this.IsEditChannel = false
      this.IsGroupEdit = false

      if(Ps_UtilObjectService.hasValue(this.curChannelGroup)){
        this.callOneTimeDropdownlist = 1
        if(this.curChannelGroup.hasOwnProperty('TypeData')){
          this.typeView = 2
        } else if(this.curChannelGroup.Code != null) {
          this.typeView = 3
        } else{
          this.typeView = 1
        }
      } else{
        this.callOneTimeDropdownlist += 1
        this.callOneTimeDropdownlist = this.callOneTimeDropdownlist > 2 ? 1 : this.callOneTimeDropdownlist
        this.typeView = 1
        this.curChannelGroup = this.listChannelData[0]
      }

      if (this.callOneTimeDropdownlist == 1) { 
        this.onGetData()
      }
    }

    handleFiltertree(value){
      this.ChannaelDataFilter = this.search(this.ChannaelData, value);
    }
    //-------------------#endregion-------------------------//

    //-------------------#region Grid-------------------//

    onCheckPermistion(){
      const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
      const canVerify = this.isAllowedToVerify || this.isToanQuyen;
      const statusID = this.ChannelProduct.StatusID;
        
      // Kiểm tra điều kiện "Chỉnh sửa"
      if (canCreateOrAdmin && (statusID === 0 || statusID === 4 ) || canVerify && statusID === 1) {
        this.isLock = false; // Cho phép chỉnh sửa
      } else {
        this.isLock = true; // Bị disabled
      }
    }

     // Toggle drodown khi nhấn nút more ở cột cuối ds
      /**
     * Hàm xử lý xóa nhóm kênh hoặc kênh
     * @param type type = 1 là nhóm kênh (xóa một nhóm kênh) | type = 2 (sản phẩn có) danh sách nhóm kênh (Xóa nhiều nhóm kênh)
     * @param data type = 1 truyền datachilde là dữ liệu của 1 kênh | type = 2 truyền dataitem  là dữ liệu của sản phẩm
     * Đối tượng truyền vào có IsApproved = false những nhóm đang soạn sẽ bị xóa, những nhóm khác đang soạn sẽ bị ngừng
     * @param datachilde
     */
     HandleActionDropdownList(action: any, dataItem?: any, type?: number, datachild?: any){
      this.ChannelProduct = dataItem
      switch (action.type){
        case "seen":
          this.onCheckPermistion()
        case "edit": 
          this.onCheckPermistion
          if(Ps_UtilObjectService.hasListValue(this.ChannelProduct.ListGroup)){
            this.ChannelProduct.ListGroup.forEach(item =>{
              if(item.IsApproved){
                this.countGroupChannel = this.countGroupChannel + 1
              }
            })
          }
          this.onOpenDrawer(false)
        break;
        case "Send":
          if(type == 1){
            this.APIUpdateStatusChannelGroupProduct([datachild], action.link)  
          } else {
            if(Ps_UtilObjectService.hasListValue(this.ChannelProduct.ListGroup) && (this.isAllowedToCreate || this.isToanQuyen)){
              var dataUpdate = this.ChannelProduct.ListGroup.filter(v => v.StatusID == 0 || v.StatusID == 4)
              // console.log(dataUpdate);
              this.APIUpdateStatusChannelGroupProduct(dataUpdate, action.link)  
            }
            // let arrSend = [] 
            // this.ChannelProduct.ListGroup.forEach(s => {
            //   if (s.StatusID == 0 || s.StatusID == 4) {
            //     arrSend.push(s)
            //   }
            // })
            // this.APIUpdateStatusChannelGroupProduct(arrSend, action.link)  
          }
        break;
        case "Approve": 
          if(type == 1){
            this.APIUpdateStatusChannelGroupProduct([datachild], action.link)  
          } else{
            if(Ps_UtilObjectService.hasListValue(this.ChannelProduct.ListGroup) && (this.isAllowedToCreate || this.isToanQuyen)){
              var dataUpdate = this.ChannelProduct.ListGroup.filter(v => v.StatusID == 1 || v.StatusID == 3)
              this.APIUpdateStatusChannelGroupProduct(dataUpdate, action.link)  
            }
          //   let arrApprove = [] 
          //   this.ChannelProduct.ListGroup.forEach(s => {
          //     if (s.StatusID == 1 || s.StatusID == 3 ) {
          //       arrApprove.push(s)
          //     }
          //   })
          //  this.APIUpdateStatusChannelGroupProduct(arrApprove, action.link)
          }
        break;
        case "return": 
          if(type == 1){
            this.APIUpdateStatusChannelGroupProduct([datachild], action.link)  
          } else{
            if(Ps_UtilObjectService.hasListValue(this.ChannelProduct.ListGroup) && (this.isAllowedToCreate || this.isToanQuyen)){
              var dataUpdate = this.ChannelProduct.ListGroup.filter(v => v.StatusID == 3)
              this.APIUpdateStatusChannelGroupProduct(dataUpdate, action.link)  
            }
            // let arrReturn = [] 
            // this.ChannelProduct.ListGroup.forEach(s => {
            //   if (s.StatusID == 3) {
            //     arrReturn.push(s)
            //   }
            // })
            // this.APIUpdateStatusChannelGroupProduct(arrReturn, action.link)  
          }
        break;
        case "stop": 
          if(type == 1){
            this.APIUpdateStatusChannelGroupProduct([datachild], action.link)  
          } else{
            if(Ps_UtilObjectService.hasListValue(this.ChannelProduct.ListGroup) && (this.isAllowedToCreate || this.isToanQuyen)){
              var dataUpdate = this.ChannelProduct.ListGroup.filter(v => v.StatusID == 2)
              this.APIUpdateStatusChannelGroupProduct(dataUpdate, action.link)  
            }
            // let arrStop = [] 
            // this.ChannelProduct.ListGroup.forEach(s => {
            //   if (s.StatusID == 2) {
            //     arrStop.push(s)
            //   }
            // })
            // this.APIUpdateStatusChannelGroupProduct(arrStop, action.link)  
          }
        break;
        case "delete": 
          let listUpdate = []
          let title: string[]= []
          // Nếu nhưng xóa nhiều thì phải lọc những item có StatusID = 0 
          // vì dropdownlist của sản phẩm là tập hợp các action của các nhóm kênh nó chứa
          

          // Nếu xóa một nhóm kênh thì được lọc tình trạng nhóm kênh có StatusID == 0
          if(type == 1){
            if(Ps_UtilObjectService.hasValue(datachild)){
              datachild.Product = dataItem.Product
              datachild.IsApproved = false;
              listUpdate = [datachild]
              // In hoa tên Group để thông báo cho người dùng biết khi xóa các item đang soạn
              title.push( `${datachild.ChannelGroupName.toUpperCase()}`)
            } 
          } 

          if(type == 2 && Ps_UtilObjectService.hasListValue(dataItem.ListGroup)){
            dataItem.ListGroup.forEach(i =>{
              if(i.StatusID == 0){
                i.Product = dataItem.Product;
                i.IsApproved = false;
                listUpdate.push(i)  
              }
            })
            title = listUpdate.map(tit => tit.ChannelGroupName.toUpperCase());
          }
          this.PopupDetetel = {
            title: 'NGƯNG ÁP DỤNG NHÓM KÊNH?',
            // content: `Bạn chắc chắn muốn ngưng áp dụng ${title} khỏi sản phẩm sản phẩm`,
            content:`<div>Bạn chắc chắn muốn ngưng áp dụng</div><div class="font-weight-bold text-danger">${title}</div> khỏi sản phẩm sản phẩm <span><strong>${this.ChannelProduct.ProductName}</strong></span>`,
            type: type,
            data: listUpdate
          }
          // let listUpdate = []
          // if(Ps_UtilObjectService.hasListValue(data.ListGroup)){
          //   data.ListGroup.forEach(i =>{
          //     if(i.StatusID == 0){
          //       listUpdate.push(i)  
          //     }
          //   })
          // }
          // if(type == 1){
          //   let title: string[]= []

          //   // In hoa tên Group để thông báo cho người dùng biết khi xóa các item đang soạn
          //   if(Ps_UtilObjectService.hasValue(datachilde)){
          //     title.push( `${datachilde.ChannelGroupName.toUpperCase()}`)
          //   } 

          //   this.PopupDetetel = {
          //     title: 'NGƯNG ÁP DỤNG NHÓM KÊNH?',
          //     content: `Bạn chắc chắn muốn ngưng áp dụng ${title} khỏi sản phẩm sản phẩm`,
          //     type: type,
          //     data: listUpdate
          //   }
          // } 
          // else {
          //   this.PopupDetetel = {
          //     title: 'XÓA SẢN PHẨM?',
          //     content: 'Bạn chắc chắn muốn xóa sản phẩm khỏi kênh kinh doanh',
          //     type: type
          //   }
          // }
          this.openedDialog = true
        break;
      }

     }
     closeDropDownList(value: DTOChannelProduct) {
      if (this.ItemSelectedPopup.Code == value.Code) {
        this.ItemSelectedPopup = new DTOChannelProduct();
      }
    }
  
    onPageChange(event: PageChangeEvent){
      this.gridState.skip = event.skip;
      this.gridState.take = this.pageSize = event.take
      this.onGetData()
    }
  
    getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
      this.ChannelProduct= { ...dataItem }
      var statusID = this.ChannelProduct.ListGroup[0].StatusID;
      moreActionDropdown = []
        
      if(this.typeView == 2){
        moreActionDropdown.push({
          Name: 'Chỉnh sửa',
          Code: 'pencil',
          Type: 'edit',
          Actived: true,
        });

        if ((statusID === 0 || statusID == 4)  && (this.isToanQuyen || this.isAllowedToCreate)){
          moreActionDropdown.push({
            Type: 'StatusID',
            Name: 'Gửi duyệt',
            Code: 'redo',
            Link: '1',
            Actived: true,
            LstChild: [],
          });
        }

        if ((statusID === 1 || statusID == 3)  && (this.isToanQuyen || this.isAllowedToVerify)){
          moreActionDropdown.push({
            Type: 'StatusID',
            Name: 'Phê duyệt',
            Code: 'check-outline',
            Link: '2',
            Actived: true,
            LstChild: [],
          });
          moreActionDropdown.push({
            Type: 'StatusID',
            Name: 'Trả về',
            Code: 'undo',
            Link: '4',
            Actived: true,
            LstChild: [],
          });
        }

        if ((statusID === 2 )  && (this.isToanQuyen || this.isAllowedToVerify)){
          moreActionDropdown.push({
            Name: 'Ngưng áp dụng',
            Type: 'StatusID',
            Code: 'minus-outline',
            Link: '3',
            Actived: true,
            LstChild: [],
          });
        }

        if ((statusID === 0 )  && (this.isToanQuyen || this.isAllowedToCreate)){
          moreActionDropdown.push({
            Name: `Xóa `,
            Type: 'delete',
            Code: 'trash',
            Link: 'delete',
            Actived: true,
            LstChild: [],
          });
        }
      } else{
        moreActionDropdown.push({
          Name: 'Xem chi tiết',
          Code: 'eye',
          Type: 'seen',
          Actived: true,
        });
      }


      return moreActionDropdown
    }
  
    onActionDropdownClick(menu: MenuDataItem, item: any){
      if (item.Code > 0) {
        if (menu.Type == 'StatusID') {
          const startus = parseInt(menu.Link)
          this.APIUpdateStatusChannelGroupProduct(item.ListGroup, startus)
        } 
        else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
          this.ChannelProduct = { ...item }
          // if(menu.Code == "eye"){
            this.onCheckPermistion()
          // }
          this.onOpenDrawer(false)
        } 
        else if(menu.Type == 'delete'){
          this.openedDialog = true
        }
      }
    }
  
    getSelectionPopup(selectedList: any[]){
      this.isFilterActive = !this.isFilterActive
      var moreActionDropdown = new Array<MenuDataItem>()
  
      var DangSoan = selectedList.findIndex(s => s.StatusID == 0)
  
      if (DangSoan != -1 && (this.isToanQuyen || this.isAllowedToCreate)){
        moreActionDropdown.push({
          Type: "StatusID", Name: "Gửi duyệt", Code: "redo", Link: "1",
          Actived: true, LstChild: []
        },)
        moreActionDropdown.push({
          Type: "Delete", Name: "Xóa", Code: "trash", Link: "0",
          Actived: true, LstChild: []
        })
      }
       
      var GuiDuyet = selectedList.findIndex(s => s.StatusID == 1)
      var Ngung = selectedList.findIndex(s => s.StatusID == 3)

      if ((GuiDuyet != -1 || Ngung != -1) && (this.isToanQuyen || this.isAllowedToVerify)) {
        moreActionDropdown.push({
          Type: "StatusID", Name: "Duyệt áp dụng", Code: "check-outline", Link: "2", Actived: true, LstChild: []
        })
      
        moreActionDropdown.push({
          Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
        })
      }

      var Duyet = selectedList.findIndex(s => s.StatusID == 2)

      if (Duyet != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
        moreActionDropdown.push({
          Type: "StatusID", Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
        })
      }
      return moreActionDropdown
    }
  
    selectChange(isSelectedRowitemDialogVisible){
      this.isFilterActive = !isSelectedRowitemDialogVisible
    }
  
    onSelectedPopupBtnClick(btnType: string, list: any[], value: any){
      if(Ps_UtilObjectService.hasListValue(list)){
        if(btnType == 'StatusID'){
          if(value == 0 || value == '0'){
            let arrSend = [] 
            list.forEach(s => {
              if (s.StatusID == 0) {
                arrSend.push(s)
              }
            })
            this.UpdateList(arrSend,  1)
          }
          if(value == 1 || value == '1' || value == 4 || value == '4'){
            let arrApprove = [] 
            list.forEach(s => {
              if (s.StatusID == 1 || s.StatusID == 3 ) {
                arrApprove.push(s)
              }
            })
            this.UpdateList(arrApprove,  2)
          }
          if(value == 2 || value == '2'){
            let arrStop = [] 
            list.forEach(s => {
              if (s.StatusID == 2) {
                arrStop.push(s)
              }
            })
            this.UpdateList(arrStop, 3)
          }
          if(value == 3 || value == '3'){
            let arrReturn = [] 
            list.forEach(s => {
              if (s.StatusID == 3) {
                arrReturn.push(s)
              }
            })
            this.UpdateList(arrReturn, 4)
          }
      
        }
        if(btnType == 'Delete'){
          let listDelete = []
          list.forEach(s => {
            if (s.StatusID == 0 ) {
              listDelete.push(s)
            }
          })
          let listUpdate = []
          if(Ps_UtilObjectService.hasListValue(listDelete)){
            listDelete.forEach(i =>{
              if(Ps_UtilObjectService.hasListValue(i.ListGroup)){
                i.ListGroup.forEach(i =>{
                  if(i.StatusID == 0){
                    listUpdate.push(i)  
                  }
                })
              }
            })
          }
    
          this.PopupDetetel = {
            title: 'NGƯNG ÁP DỤNG NHÓM KÊNH?',
            content: `Bạn chắc chắn muốn ngưng áp dụng ${this.curChannelGroup.ChannelGroupName} khỏi ${listUpdate.length} sản phẩm sản phẩm `,
            type: 1,
            data: listUpdate
          }

          this.openedDialog = true
        }
      }
     
    }

    UpdateList(list, status ){
      
      // console.log(list)
      let listUpdate = []
          if(Ps_UtilObjectService.hasListValue(list)){
            list.forEach(i =>{
              if(Ps_UtilObjectService.hasListValue(i.ListGroup)){
                i.ListGroup.forEach(i =>{
                  if(i.StatusID == status){
                    listUpdate.push(i)  
                  }
                })
              }
            })
          }

       
    }

    //-------------------#endregion---------------------//

  
    // 
    onSubmit(){
      this.ListGroupChannelUpdate = []

      // lọc danh sách các item thay đổi 
      this.ListGroupChannelUpdate = this.ListDisplayGroupChannel.filter(changedItem => {
        // Tìm mục trong danh sách ban đầu có cùng ChannelGroup với mục đã thay đổi
        const originalItem = this.listGroupChannel.find(originalItem => originalItem.ChannelGroup === changedItem.ChannelGroup);
        
        // kiểm tra nhóm kênh có được áp dụng hay không
        if(changedItem.IsApproved != originalItem.IsApproved){
          return true;
        }

        // So sánh ListChannel của hai mục
        if (originalItem && originalItem.ListChannel && changedItem.ListChannel) {
          const originalChannels = originalItem.ListChannel.filter(channel => channel.IsMove || channel.StatusID);
          const changedChannels = changedItem.ListChannel.filter(channel => channel.IsMove || channel.StatusID);

          // Nếu danh sách các kênh khác nhau, mục này đã được thay đổi
          if (JSON.stringify(originalChannels) !== JSON.stringify(changedChannels)) {
            return true;
          }
        }
        return false;
      });
      

      // trường hợp tạo mới
      if(this.isAdd){
        // gán mã sản phẩm vào từng nhóm kênh
        this.ListGroupChannelUpdate.forEach(item =>{
          item.Product = this.ChannelProduct.Product
        })

        // tạo mới view 2 
        if(this.typeView == 2 && !Ps_UtilObjectService.hasListValue(this.ListGroupChannelUpdate)){
          this.ListGroupChannelUpdate = this.ListDisplayGroupChannel
          this.ListGroupChannelUpdate[0].IsApproved = true
          this.ListGroupChannelUpdate[0].Product = this.ChannelProduct.Product
        }
        // kiểm tra dữ liệu khi tao mới 
        if(!Ps_UtilObjectService.hasValueString(this.ChannelProduct.Barcode)){
          this.layoutService.onWarning('Vui lòng nhập mã sản phẩm!!!')
        } else if(!Ps_UtilObjectService.hasListValue(this.ListGroupChannelUpdate)){
          this.layoutService.onWarning('Vui lòng chọn nhóm kênh kinh doanh!!!')
        } else{
          this.APIUpdateChannelGroupProduct(this.ListGroupChannelUpdate)
          this.onCloseDrawer()
          this.isAdd = false
        }
      } else{
        if(this.typeView == 2 && !Ps_UtilObjectService.hasListValue(this.ListGroupChannelUpdate)){
          this.ListGroupChannelUpdate = this.ListDisplayGroupChannel
          if((this.minQty != this.ChannelProduct.MinQty || this.maxQty != this.ChannelProduct.MaxQty) ){
            this.ListGroupChannelUpdate[0].Product = this.ChannelProduct.Product
            this.ListGroupChannelUpdate[0].MinQty = this.minQty
            this.ListGroupChannelUpdate[0].MaxQty = this.maxQty
            this.ListGroupChannelUpdate[0]['Quanity'] = this.maxQty
          }
        }
        // 
        this.APIUpdateChannelGroupProduct(this.ListGroupChannelUpdate)
        this.onCloseDrawer()
      }
    }

    onCloseDialog(){
      this.openedDialog = false
    }


    /**
     * Hàm xử lý xóa nhóm kênh hoặc kênh
     * @param type type = 1 là nhóm kênh (xóa một nhóm kênh) | type = 2 (sản phẩn có) danh sách nhóm kênh (Xóa nhiều nhóm kênh)
     * @param data type = 1 truyền datachilde là dữ liệu của 1 kênh | type = 2 truyền dataitem  là dữ liệu của sản phẩm
     * Đối tượng truyền vào có IsApproved = false những nhóm đang soạn sẽ bị xóa, những nhóm khác đang soạn sẽ bị ngừng
     */
    onDeleteDialog(type: number, data: any){
      // Nếu xóa một nhóm kênh
      this.APIUpdateChannelGroupProduct(data)
      this.openedDialog = false


      // if(type == 1){
      //   if(Ps_UtilObjectService.hasListValue (data)){
      //     data.forEach(da =>{
      //       da.IsApproved = false
      //       da.Product = this.ChannelProduct.Product
      //     })
      //     this.APIUpdateChannelGroupProduct(data)
      //   } else{
      //     data.IsApproved = false
      //     data.Product = this.ChannelProduct.Product
      //     this.APIUpdateChannelGroupProduct(data)
      //   }
      // } else{
      //   this.APIUpdateChannelGroupProduct(this.ChannelProduct)
      // }
      // this.openedDialog = false


    }

    onGetProduct(){
      this.ProductBarcode = this.ChannelProduct.Barcode
      if(this.typeView == 2){
        this.APIGetChannelGroupProduct( null, this.ChannelProduct.Barcode ,this.curChannelGroup.Code)
      } else if(this.typeView == 3){
        this.APIGetChannelGroupProduct( null, this.ChannelProduct.Barcode, this.curChannelGroup.ParentID ,this.curChannelGroup.Code)
      } else{
        this.APIGetChannelGroupProduct(null, this.ChannelProduct.Barcode)
      }
    }

    onTransDrawer(type: string){
      this[type] = !this[type]
    }

    toggleChildren(index: number){
      this.isExpandListChannelStates[index] = !this.isExpandListChannelStates[index]
    }

    onUpdate(){
      // tạo một kênh mới
      let newChannel = new DTOChannel()
      // tìm nhóm gốc 
      let curGroup = this.ListGroupChannelIsApproved.find(d => d.ChannelGroup === this.channel.ParentID)
      // thêm thông tin cho kênh mới ở nhóm được chuyển (ParentID,FromGroup,IsMove)
      newChannel = {
        ...this.channel,
        IsMove: true,
        FromGroup: curGroup.ChannelGroupID,
        StatusID: 2,
        StatusName: "Duyệt áp dụng"
      }
      // cập nhật thông tin mới cho kênh ở nhóm gốc (IsMove, ToGroup, chuyển tình trạng)
      curGroup.ListChannel.forEach(item =>{
        if(item.Code == this.channel.Code){
          item.IsMove = true
          item.ToGroup = this.curChangeGroup.ChannelGroupID
          item.StatusID = 3
          item.StatusName = 'Ngưng áp dụng'
        }
      })
      // thêm kênh mới vào nhóm được chuyển đến
      this.curChangeGroup.ListChannel.push(newChannel)
      // ẩn popup
      this.isChangeGroup = false
    
    }

    onClose(){
      this.isChangeGroup = false
    }

    onChangeChannel(item: any){
      this.ListGroupChannelIsApproved = []
      this.ListGroupChannelIsApproveddisplay = []
      this.channel = item
      if(this.countListGroupChannel(this.ListDisplayGroupChannel) <= 1 && this.typeView == 1){
        this.layoutService.onWarning('Vui lòng chọn thêm 1 nhóm kênh nữa để có thể chuyển kênh')
      } else {
        this.ListDisplayGroupChannel.forEach(GroupChannel =>{
          // danh sách kên được duyệt
          if(GroupChannel.IsApproved){
            this.ListGroupChannelIsApproved.push(GroupChannel)
          }
          // danh sách hiện thị kênh được duyệt và khác kênh dược chọn đển chuyển
          if(GroupChannel.IsApproved && (GroupChannel.ChannelGroup != this.channel.ParentID)){
            this.ListGroupChannelIsApproveddisplay.push(GroupChannel)
          }
        })
        this.defaultChangeGroup = this.ListGroupChannelIsApproveddisplay[0]
        this.curChangeGroup = this.ListGroupChannelIsApproveddisplay[0]
        if(this.typeView == 1){
          this.isChangeGroup = true
        } else{
          // xoa channel được chuyển từ ListOtherChannel
          this.ListDisplayGroupChannel[0].ListOtherChannel = this.ListDisplayGroupChannel[0].ListOtherChannel.filter(chan => chan.Code !== item.Code )
          // thêm channel mới được chuyển và ListChannel
          let newChannel = new DTOChannel()
          newChannel = {
            ...this.channel,
            FromGroup : this.channel.ChannelGroupID,
            StatusID: 2,
            StatusName: "Duyệt áp dụng",
            IsMove : true,
          }
          this.ListDisplayGroupChannel[0].ListChannel.push(newChannel)
          this.countChannel = this.countChannel + 1
        }
      }
    }

     // Hàm cập nhật tính trạng của kênh trước khi cập nhật
    onChangeChannelStatus(item: DTOChannel){ //thay đổi tình trạng kênh
      if(item.StatusID == 2) {
        item.StatusID = 3
        item.StatusName = 'Ngưng áp dụng'  
      } else if(item.StatusID == 3){
        item.StatusID = 2
        item.StatusName = 'Duyệt áp dụng'  
      } 
      this.DeleteChanel(item)
      this.onUpdateListGroupChannel(item)
    }

    // Hàm xử lý data duyệt, xóa kênh trong nhóm kênh
    DeleteChanel(item: any){
      if(Ps_UtilObjectService.hasValueString(item.FromGroup) && this.typeView == 1){
        // chuyển tình trạng item được chuyển đi "tới"
        this.ListDisplayGroupChannel.forEach(c =>{
          if(c.ChannelGroupID == item.FromGroup){
            c.ListChannel.forEach(chan =>{
              if(chan.Code == item.Code){
                chan.IsMove = false
                chan.StatusID = 2
                chan.StatusName = 'Duyệt áp dụng'
                chan.ToGroup = null
              }
            })
          }
          if(c.ChannelGroup !== item.ParentID){
            //xóa item được chuyển vào "từ"
            c.ListChannel = c.ListChannel.filter(chan => chan.Code !== item.Code )
          }
        })

      } else {
        // xóa item "từ"
        this.ListDisplayGroupChannel.forEach(c =>{
          if(c.ChannelGroupID == item.ToGroup){
            c.ListChannel = c.ListChannel.filter(chan => chan.FromGroup === null )
          }
        })
        // chuyển tình trạng item "tới"
        // item.StatusID = 2;
        item.IsMove = false
        item.ToGroup = null
        // item.StatusName = 'Duyệt áp dụng'
      }
      if(this.typeView == 2 && Ps_UtilObjectService.hasValueString(item.FromGroup)){
        this.countChannel = this.countChannel - 1
        this.ListDisplayGroupChannel[0].ListChannel = this.ListDisplayGroupChannel[0].ListChannel.filter(chan => chan.Code !== item.Code )
        item.IsMove = false
        item.ChannelGroupID = item.FromGroup
        item.FromGroup = null
        this.ListDisplayGroupChannel[0].ListOtherChannel.push(item)
        // this.ListDisplayGroupChannel[0].ListOtherChannel = this.ListDisplayGroupChannel[0].ListOtherChannel.push(chan => chan.Code !== item.Code )
      }
    }

    onUpdateListGroupChannel(e: DTOChannel){
      this.ListDisplayGroupChannel.map(channelGroup => {
        if (channelGroup.Code === e.ParentID) {
          return {
            ...channelGroup,
            ListChannel: {...e}
          };
        } else {
          return channelGroup;
        }
      });
    } 
    
  
    ngOnDestroy(): void {
      this.Unsubscribe.next();
      this.Unsubscribe.complete();
    }
}
