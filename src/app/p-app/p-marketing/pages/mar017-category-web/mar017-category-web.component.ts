import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewChildren, } from '@angular/core';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State, process, filterBy } from '@progress/kendo-data-query';

import { Observable, Subject, Subscription, of, from } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ExpandEvent, SelectionChangeEvent, SelectableSettings, } from '@progress/kendo-angular-treelist';
import { MarCategoryWebAPIService } from '../../shared/services/mar-category-web.service';
import { DTOCategoryWeb } from '../../shared/dto/DTOCategoryWeb.dto';
import { delay, map, switchMap, tap, toArray } from 'rxjs/operators';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarKeywordApiService } from '../../shared/services/mar-keyword-api.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-mar017-category-web',
  templateUrl: './mar017-category-web.component.html',
  styleUrls: ['./mar017-category-web.component.scss'],
})
export class Mar017CategoryWebComponent implements OnInit {
  // Viewchild
  @ViewChild('formDrawer') formDrawer: MatSidenav;
  // @ViewChild('drawerContent') drawerContent: ElementRef;
  @ViewChildren('anchor') anchors;
  @ViewChild('rowMoreActionPopup') rowMoreActionPopup;


  // Permission
  isMaster: boolean = false;
  isCreator: boolean = false;
  isVerifier: boolean = false;
  isViewOnly: boolean = true;
  actionPerm: DTOActionPermission[];

  // bool
  isLockAll: boolean = false;
  justLoaded: boolean = true;
  loading: boolean = false;
  isAdd: boolean = false;
  isPopupDropdownOpen: boolean = false;

  showDeleteDialog: boolean = false;
  isFilterActive: boolean = true;
  popupShow = false;
  excelValid = true;
  isSeen = true

  currentAnchorIndex: number = -1
  topValue: string = 'top'



  //Form language boolean
  language = 0//0 = vietname, 1 = japan, 2 = english

  // Subscription
  subArr: Subscription[] = []
  //Delete Dialog
  deleteGroupWebDialogOpened: boolean = false;
  stopGroupWebDialogOpened: boolean = false;
  expandedRight: boolean = false;
  isautoCollapse: boolean = false;

  //Status declarations
  ListStatus: DTOStatus[] = [];
  ListIconFont: any[] = []//todo api lấy icon

  //////////////////////////////////Variables//////////////////////////////////
  //Treelist item vars
  // listGroupWebTreeList = new Subject<DTOCategoryWeb[]>();
  listGroupWebTreeList: DTOCategoryWeb[] = []
  GroupWebSelectedDTO = new DTOCategoryWeb();
  listGroupWebTreeListFind: DTOCategoryWeb[] = []
  // 
  listTreeList: DTOCategoryWeb[] = []
  //
  private cache: any = new Map();

  expandedIds: number[] = [1, 2];
  selectedTreelistItem: any[] = [];
  maxLevel: number = 3; //phân cấp cuối cùng của phân nhóm
  // MENU DROPDOWN DECLARATION
  menuItemList = [];

  //GRID TREELIST SELECTION AND FILTERS DECLARATIONS
  settings: SelectableSettings = {
    mode: 'row',
    multiple: false,
    drag: false,
    enabled: true,
  };
  // default filter
  levelFilter = { field: 'Level', operator: 'lte', value: 3 }

  gridState: State = {
    filter: {
      filters: [this.levelFilter],
      logic: 'and',
    },
  };

  // Startus filter
  isNew = true
	// isSent = true
	isStoped = false
	isApproved = true
	isReturn = false
  
	filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterNew: FilterDescriptor = { field: 'StatusID', value: '0', operator: 'eq', ignoreCase: true }
	filterStoped: FilterDescriptor = { field: 'StatusID', value: '3', operator: 'eq', ignoreCase: true }
	filterReturn: FilterDescriptor = { field: 'StatusID', value: '4', operator: 'eq', ignoreCase: true }
	filterApprove: FilterDescriptor = { field: 'StatusID', value: '2', operator: 'eq', ignoreCase: true }
	// gridState: State = { filter: { filters: [], logic: 'and' } }

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  // filter item
  filterItemCode: CompositeFilterDescriptor = { logic: "or", filters: [] }

  filterItemDropdown: FilterDescriptor = { field: 'Code', value: '', operator: 'eq', ignoreCase: true }


  //FORM DECLARATIONS
  parentGroup: DTOCategoryWeb[] = [];
  filterParentGroup: DTOCategoryWeb[] = [];

  parentGroupTree: DTOCategoryWeb[] = [];

  defaultParent: DTOCategoryWeb = new DTOCategoryWeb({ Code: null, VNGroupName: 'Không lựa chọn' })
  curParentGroup: DTOCategoryWeb = { ...this.defaultParent }
  @ViewChild('ParentID') ParentIDDropdown;

  webForm: UntypedFormGroup = new UntypedFormGroup({
    VNGroupName: new UntypedFormControl('',),
    ENGroupName: new UntypedFormControl('',),
    JPGroupName: new UntypedFormControl('',),
    IconSmall: new UntypedFormControl(''),
    URLImage1: new UntypedFormControl(''),
    URLImage2: new UntypedFormControl(''),
    AliasVN: new UntypedFormControl(''),
    AliasEN: new UntypedFormControl(null),
    AliasJP: new UntypedFormControl(null),
    StatusName: new UntypedFormControl('Đang soạn thảo'),
    ParentName: new UntypedFormControl(null),
    StatusID: new UntypedFormControl(0),
    UserColumnDefine: new UntypedFormControl(null),
    Code: new UntypedFormControl(0),
    CreateBy: new UntypedFormControl(null),
    CreateTime: new UntypedFormControl(null),
    LastModifiedBy: new UntypedFormControl(null),
    LastModifiedTime: new UntypedFormControl(null),
    ListChilds: new UntypedFormControl([]),
    Company: new UntypedFormControl(1),
    OrderBy: new UntypedFormControl(),
    GroupID: new UntypedFormControl(''),
    ParentID: new UntypedFormControl(null),
    Parent: new UntypedFormControl(this.defaultParent),
    Level: new UntypedFormControl(null),
  });

  mappingGroup: DTOCategoryWeb[] = [];
  mappingGroupTree: DTOCategoryWeb[] = [];

  levelOfForm: number = 3;
  ListChildsLevel4: DTOCategoryWeb[] = [];

  // Folder
  pickFileCallback: Function
  GetFolderCallback: Function
  // import
  uploadEventHandlerCallback: Function


  level1Item: DTOCategoryWeb;
  disableStatus: boolean = false;
  searchData: any;
  constructor(
    private menuService: PS_HelperMenuService,
    private layoutService: LayoutService,
    private marCategoryApiService: MarCategoryWebAPIService,
    private apiService: MarKeywordApiService,
    private layoutAPI: LayoutAPIService,
    private el: ElementRef
  ) { }

  //////////////////////////////////Functions//////////////////////////////////
  ngOnInit(): void {
    let that = this;

    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');

        that.isMaster = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCreator = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isVerifier = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        that.isViewOnly = !that.isMaster && !that.isCreator && !that.isVerifier

        // this.GetData();
      }
    });

    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetData();
      }
    })
    this.subArr.push(sst, changePermissionAPI)
    // Folder
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
  }


  //------------RENDERING HANDLE FUNCTIONS-----------\\
  // Handle binding data on treelist
  // fetchChildren = (dataitem: any): Observable<any[]> => of(this.getItems(dataitem));

  public fetchChildren = (parent?: DTOCategoryWeb): DTOCategoryWeb[] => {
    if (this.cache.get(parent)) {
      return this.cache.get(parent);
    }

    let result;
    const items = parent ? parent.ListChilds : this.listGroupWebTreeList;
    if (this.gridState.filter && this.gridState.filter.filters.length && items) {
      result = filterBy(items, {
        logic: "or",
        filters: [
          this.gridState.filter,
          {
            // matches the current filter or a child matches the filter
            operator: (item: any) => {
              if (item.ListChilds) {
                const children = this.fetchChildren(item);
                return children && children.length;
              }
            },
          },
        ],
      });
    } else {
      result = items;
    }

    this.cache.set(parent, result);

    return result;
  };

  //Kiểm tra có cấp con không
  hasChildren = (item: any): boolean => {
    if (item.hasOwnProperty('ListChilds')) {
      const children = this.fetchChildren(item);
      return children && item.ListChilds.length > 0;
      // return item.ListChilds.length > 0;
    }
  };

  getItems(dataitem: any) {
    let arr: any = [];
    if (dataitem.ListChilds) {
      arr = arr.concat(dataitem.ListChilds);
    }
    return arr;
  }

  isExpanded = (dataItem: any): boolean => {
    return this.expandedIds.indexOf(dataItem.Code) > -1;
  };

  onCollapse(args: ExpandEvent): void {
    this.isPopupDropdownOpen = false;
    this.expandedIds = this.expandedIds.filter(
      (id) => id !== args.dataItem.Code
    );
  }

  onBackdropClick(): void {
    const statusID = this.GroupWebSelectedDTO.StatusID
    if(statusID == 2 || statusID == 3){
      this.formDrawer.close()
    } else {
      this.formDrawer.open()
      console.log('ok')
    }
    console.log(statusID);
  } 

  // đổi màu input
  onCheckStatust(){
    if(this.GroupWebSelectedDTO.StatusID == 2 || this.GroupWebSelectedDTO.StatusID == 3){
      return true
    } else {
      return false
    }
  }

  onExpand(args: ExpandEvent): void {
    this.isPopupDropdownOpen = false;
    this.expandedIds.push(args.dataItem.Code);
  }

  // HANDLE CHANGE ITEM SELECTED
  onChange(e: SelectionChangeEvent) {
    if (e.action == 'select') {
      this.isPopupDropdownOpen = false;
      this.GroupWebSelectedDTO = { ...e.items[0].dataItem };
      this.levelOfForm = this.GroupWebSelectedDTO.Level;
    } else if (e.action == 'remove') {
      this.GroupWebSelectedDTO = new DTOCategoryWeb();
      this.webForm.reset();
    }
  }

  //------------MENU DROPDOWN HANDLE FUNCTIONS---------\\
  // Xử lí lấy danh sách item menu dropdown dựa trên statusID và phân quyền
  getSelectedMenuDropdown(dataItem: DTOCategoryWeb) {

    // const maxLevel = this.maxLevel; //giá trị phân cấp 3
    const itemLevel = dataItem.Level //this.GroupWebSelectedDTO.Level;
    const statusID =  dataItem.StatusID //this.GroupWebSelectedDTO.StatusID;
    let listTreeListLV2:DTOCategoryWeb[] = []


    this.menuItemList = []

    // tìm cấp cha
    this.filterItemDropdown.value = dataItem.Code
    this.onloadData(1)

    // listTreeList[0].ListChilds danh sách cây Cấp 1
    if(Ps_UtilObjectService.hasListValue(this.listTreeList)){
      this.listTreeList[0].ListChilds.forEach(listItem =>{
        if(Ps_UtilObjectService.hasListValue(listItem.ListChilds)){
          listTreeListLV2.push(listItem) // danh sách cây cấp 2
        }
      })
    }

    // cấp 2 của cấp con được chọn
    let ObjectLV2: any
    let ObjectLV3: any

    listTreeListLV2.find(item => {
      if(item.Code === dataItem.ParentID){
        ObjectLV2 = item
      } else {
        ObjectLV3 = item.ListChilds.find(item => item.Code === dataItem.ParentID)
      }
    });


    if((statusID == 0 || statusID == 4) && (this.isMaster || this.isCreator)){
      this.menuItemList.push({ id: 0, iconName: 'pencil', text: 'Chỉnh sửa', isAdd: false })
    } 
    else {
      this.menuItemList.push({ id: 1, iconName: 'eye', text: 'Xem chi tiết', isAdd: false })
    }

    if(this.isMaster || this.isCreator){
      this.menuItemList.push({ id: 2, iconName: 'inherited', text: 'Thêm phân nhóm', isAdd: true })

      if (itemLevel !== 3){
        this.menuItemList.push({ id: 3, iconName: 'inherited', text: 'Thêm phân nhóm con', isAdd: true })
      }
    }
    if(statusID == 3){
      this.menuItemList.push({ id: 6, iconName: 'undo', text: 'Trả về', isAdd: false, StatusID: 4})
    }

    if(statusID == 2){
      if(this.isMaster || this.isVerifier)
      this.menuItemList.push({ id: 5, iconName: 'minus-outline', text: 'Ngưng áp dụng', isAdd: false, StatusID: 3})
    }
    //thêm option chuyển tình trạng vào dropdown
    // cấp 1
    if(itemLevel == 1){
      this.isShowStatus(dataItem)
    }
    // cấp 2
    else if(itemLevel == 2){
      if(this.listTreeList[0].StatusID == 2){
        this.isShowStatus(dataItem)
      }
    }
    // cấp 3
    else if(itemLevel == 3){
      if(Ps_UtilObjectService.hasValue(ObjectLV2)){
        if(ObjectLV2.StatusID == 2){
          this.isShowStatus(dataItem)
        }
      } 
      // cấp 4
      else if(Ps_UtilObjectService.hasValue(ObjectLV3)){
        if(ObjectLV3.StatusID == 2){
          this.isShowStatus(dataItem)
        }
      }
    }
    

    if(!Ps_UtilObjectService.hasListValue(dataItem.ListChilds) && (this.isCreator || this.isMaster) && statusID == 0){
      this.menuItemList.push({ id: 7, iconName: 'trash', text: 'Xóa phân nhóm', isAdd: false})
    }

    this.menuItemList = [...this.menuItemList]
  }

  isShowStatus(item: any){
    if(item.StatusID == 0 || item.StatusID == 4 || item.StatusID == 3){
      if(this.isMaster || this.isVerifier){
        this.menuItemList.push({ id: 4, iconName: 'check-outline', text: 'Phê duyệt', isAdd: false, StatusID: 2})
      }
    }
  }

  //Đóng menu dropdown
  // onCloseMenuDropdown(dataItem: DTOCategoryWeb) {
  //   event.stopPropagation()

  //   if (Ps_UtilObjectService.hasListValue(this.selectedTreelistItem) &&
  //     this.GroupWebSelectedDTO.Code == dataItem.Code || !Ps_UtilObjectService.hasListValue(this.selectedTreelistItem)
  //   ) {
  //     this.isPopupDropdownOpen = false;
  //   }
  // }

  //HANDLE FUNCTIONS OF MENU DROPDOWN
  isPopupVisible() {
    return this.popupShow ? 'visible' : 'hidden'
  }

  getAnchor() {
    if (Ps_UtilObjectService.hasValue(this.anchors) && this.anchors.length > 0) {
      var anchor = this.anchors.toArray()[this.currentAnchorIndex]

      if (Ps_UtilObjectService.hasValue(anchor))
        return anchor
    }
  }
  
  @HostListener('document:click', ['$event'])
  clickout(event) {
    var anchor = this.getAnchor()
    if (Ps_UtilObjectService.hasValue(anchor)) {
      if (!anchor.nativeElement.contains(event.target)
        && this.popupShow == true) {
        this.popupShow = false
      }
    }
  }
  // onOpenMenuDropdown(dataItem) {
  //   event.stopPropagation()

  //   if (this.GroupWebSelectedDTO.Code != dataItem) {
  //     this.isPopupDropdownOpen = true;
  //   }
  //   this.selectedTreelistItem = [{ itemKey: dataItem.Code }];
  //   this.GroupWebSelectedDTO = { ...dataItem };
  //   this.getSelectedMenuDropdown(dataItem);
  // }

  //HANDLE TOGGLE FORM khi nhấn menu dropdown
  onClickMenuDropdownItem(selectedItem: any) {
    if (selectedItem) {
      const id = selectedItem.id;
      const isAddForm = selectedItem.isAdd;
    //   // dùng id để phân biệt là mở form hoặc là chọn xóa phân nhóm
    //   // Xóa phân nhóm có id = 0
      if (id != 7) {

        // Cập nhật tình trạng từ List dropdown
        if(id == 4 || id == 5 || id == 6 ){
          this.GroupWebSelectedDTO.StatusID = selectedItem.StatusID
          this.onAssignSelectedItemToEditForm(true);
        }
        else {
          this.isAdd = isAddForm;
          this.levelOfForm = id;

          if (this.isAdd) {
            this.onAssignSelectedItemToAddForm();
          } else {
            this.onAssignSelectedItemToEditForm(false);
          }
          this.formDrawer.open();
        }
        
      } else {
        this.deleteGroupWebDialogOpened = true;
      }
    }
  }

 

  isItemDisabled(itemArgs: { dataItem: DTOStatus; index: number }) {
    var statusID = itemArgs.dataItem['GroupWeb']?.StatusID
    var ParentID = itemArgs.dataItem['GroupWeb']?.ParentID
    var parentStatusID = itemArgs.dataItem['GroupWebParent']?.StatusID
    var isAdd = itemArgs.dataItem['GroupWeb']?.Code == 0
    var isMaster = itemArgs.dataItem['isMaster']
    var isCreator = itemArgs.dataItem['isCreator']
    var isVerifier = itemArgs.dataItem['isVerifier']


    switch (itemArgs.dataItem.OrderBy) {
      case 0://soạnGroupWeb
        if (statusID > 0)
          return true
        break;
      // case 1://gửi
      //   if ((statusID != 0 && statusID != 4) || (!isCreator && !isMaster))
      //     return true
      //   break;
      case 2://duyệt
        if ((statusID != 0 && statusID != 4 && statusID != 3 && statusID != 2) || (!isVerifier && !isMaster) || isAdd || (parentStatusID != 2 && ParentID != null))
          return true
        break;
      case 3://ngưng
        if ((statusID != 2 && statusID != 3) || (!isVerifier && !isMaster) || isAdd) 
          return true
        break;
      case 4://trả
        if ((statusID != 3 && statusID != 4) || (!isVerifier && !isMaster) || isAdd)
          return true
        break;
    }
   
    return false;
  }
  // --------------- API CALLING FUNCTIONS ----------------\\
  //HANDLE GET DATA
  GetData(type?: number) {
    if(type == 1){
      this.isNew = true;
      // this.isSent = true;
      this.isStoped = false;
      this.isApproved = true;
      this.isReturn = false
      this.selectedTreelistItem = [];     
      this.setFilter(true)
    }
    this.GetListWebTree();
    this.p_GetListStatus();
  }

  //Reset filter of treelist and get data
  filterDropdown(value) {
    this.filterParentGroup = this.parentGroup.filter(
      (s: DTOCategoryWeb) => s.VNGroupName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  //------------SEARCH BAR HANDLE FUNCTIONS---------------\\
  //HANDLE FUNCTION SEARCHING

  setFilter(IsUpdate: boolean){
    if(IsUpdate){
      this.gridState.filter.filters = [this.levelFilter]
    } else{
      this.gridState.filter.filters = [this.levelFilter]
      this.filterStatus.filters = []
      this.filterItemCode.filters = []
  
      //status
      if (this.isNew) this.filterStatus.filters.push(this.filterNew)
      if (this.isApproved) this.filterStatus.filters.push(this.filterApprove)
      if (this.isReturn) this.filterStatus.filters.push(this.filterReturn)
      if (this.isStoped) this.filterStatus.filters.push(this.filterStoped)
      if (this.filterStatus.filters.length > 0) this.gridState.filter.filters.push(this.filterStatus)
  
      // if (this.searchData !== undefined) {
        if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
          if (this.searchData[0].value != ''){
            this.gridState.filter.filters.push(this.filterSearchBox)
          } 
        }
      // }
  
      // itemDropdown
      if(Ps_UtilObjectService.hasValueString(this.filterItemDropdown.value)){
        this.filterItemCode.filters.push(this.filterItemDropdown)
        this.gridState.filter.filters.push(this.filterItemCode)
      }
  
    }
  }
  
  handleSearch(e: any) {//CompositeFilterDescriptor
    if (Ps_UtilObjectService.hasValueString(e)) {
      this.filterSearchBox.filters = e.filters;
      this.searchData = e.filters;
      this.selectedTreelistItem = [];
      this.onloadData(2)
    }
  }

  filterChangeCheckbox(event, strCheck: string){
    if (strCheck === 'isNew') this.filterNew = event
		else if (strCheck === 'isApproved') this.filterApprove = event
		else if (strCheck === 'isStoped') this.filterStoped = event
    else if (strCheck === 'isReturn') this.isReturn = event
    this.onloadData(2)
  }

  // Reset bộ lọc
  resetFilter() {
    this.isNew = true;
		// this.isSent = true;
		this.isStoped = false;
		this.isApproved = true;
    this.isReturn = false
    this.selectedTreelistItem = [];   
    this.onloadData(2)
  }
  // IMPORT/ DOWNLOAD EXCEL
  onDownloadExcel(){
    var ctx = "Download Excel Template"
    var getfilename = "test.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let GetTemplate_sst = this.marCategoryApiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
    this.subArr.push(GetTemplate_sst)
  }

  onImportExcel(){
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  uploadEventHandler(e: File){
    this.p_ImportExcel(e)
  }

  //API
  //GET LIST WEB TREELIST FUNCTION
  GetListWebTree() {
    this.loading = true;
    let ctx = 'Lấy Danh sách phân nhóm'

    let sst = this.marCategoryApiService.GetListWebTree(this.gridState).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0){
        this.listGroupWebTreeList = res.ObjectReturn;
        this.onloadData(2)
      }
      else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`);
      this.loading = false;

    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  // đỗ dữ liệu vào tree List 

  onloadData(type: number){
    this.cache.clear();
    this.setFilter(false)
    if(type == 1){
      this.listTreeList = this.fetchChildren()
    }else{
      this.listGroupWebTreeListFind =  this.fetchChildren()
    }
  }

  //lấy dropdown cấp cha HOẶC multiselect cấp 4  
  GetListGroupWeb(isMappingList: boolean) {
    let that = this
    let param: DTOCategoryWeb

    if (isMappingList) {
      param = new DTOCategoryWeb({
        Code: this.GroupWebSelectedDTO.Code,
        Level: 4,
      })
    } else {
      param = new DTOCategoryWeb({
        Code: this.isAdd ? 0 : this.GroupWebSelectedDTO.Code,
        Level: this.levelOfForm,
      })
    }
    this.loading = true
    let ctx = isMappingList ? 'Lấy danh sách mapping phân nhóm cấp 4' : 'Lấy danh sách phân nhóm cha'

    let sst = this.marCategoryApiService.GetListGroupWeb(param).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (isMappingList) {
          this.mappingGroupTree = res.ObjectReturn
          this.mappingGroup = res.ObjectReturn
          var temp: DTOCategoryWeb[] = res.ObjectReturn
          //chuyển mảng đệ quy 4 cấp thành mảng phẳng
          temp.forEach(s => {
            this.mappingGroup.push(s)

            s.ListChilds.forEach(c => {
              this.mappingGroup.push(c)

              c.ListChilds.forEach(t => {
                this.mappingGroup.push(t)

                t.ListChilds.forEach(f => {
                  this.mappingGroup.push(f)
                })
              })
            })
          })
        } else {
          // this.parentGroup = [...res.ObjectReturn];
          this.parentGroup = []
          this.filterParentGroup = []

          var temp: DTOCategoryWeb[] = res.ObjectReturn
          this.parentGroupTree = res.ObjectReturn
          //chuyển mảng đệ quy 2 cấp thành mảng phẳng
          temp.forEach(s => {
            this.parentGroup.push(s)
            this.filterParentGroup.push(s)

            s.ListChilds.forEach(c => {
              this.parentGroup.push(c)
              this.filterParentGroup.push(c)
            })
          })
          this.parentGroupTree.unshift(that.defaultParent)
          this.onDropdownFilter()
        }
      }
      else {
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`);
      }
      let item: DTOCategoryWeb = this.webForm.getRawValue()
      this.checkProp(this.isAdd ? item : null)
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  GetGroupWeb(groupWeb: DTOCategoryWeb) {
    this.loading = true;
    var ctx = 'Lấy chi tiết Phân nhóm'

    let sst = this.marCategoryApiService.GetGroupWeb(groupWeb).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        groupWeb = res.ObjectReturn
        this.webForm.patchValue(groupWeb);
        this.checkProp(groupWeb)
      }
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error} `);
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  UpdateGroupWeb() {
    const ctx = "Cập nhật Phân nhóm web";
    this.loading = true;

    if (this.levelOfForm === 3) {
      this.webForm.controls['ListChilds'].setValue([...this.ListChildsLevel4])
    }
    const updatedInfo: DTOCategoryWeb = this.webForm.value
    updatedInfo.ListChilds?.map(s => s.ParentID = updatedInfo.Code)

    if (this.isAdd && !Ps_UtilObjectService.hasValueString(updatedInfo.VNGroupName)) {
      this.layoutService.onError('Vui lòng nhập tên phân nhóm');
    }
    else {
      let sst = this.marCategoryApiService.UpdateGroupWeb(updatedInfo).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.stopGroupWebDialogOpened = false
          this.selectedTreelistItem = [];
          this.layoutService.onSuccess(`${ctx} thành công !`);
          this.onResetDeclarations();
          this.setFilter(true)
          this.GetListWebTree();
        } else {
          this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`);
          this.GetListWebTree();
        }
      }, (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi ${err}`);
        this.GetListWebTree();
      }, () => {
        this.loading = false;
      })
      this.subArr.push(sst)
    }
  }

  //DELETE GROUP WEB FUNCTION
  deleteGroupWeb() {
    const selectedGroupWebName = this.GroupWebSelectedDTO.VNGroupName;
    let ctx = 'Xóa phân nhóm web'

    let sst = this.marCategoryApiService.DeleteGroupWeb([this.GroupWebSelectedDTO]).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteGroupWebDialogOpened = false;
        this.selectedTreelistItem = [];
        this.layoutService.onSuccess(`${ctx} "${selectedGroupWebName}" thành công`);
        this.GetListWebTree()
      } else {
        this.layoutService.onError(`${ctx} "${selectedGroupWebName}" thất bại: ${res.ErrorString}`);
        this.GetListWebTree()
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx} "${selectedGroupWebName}": ${err}`);
      this.GetListWebTree()
    }, () => {
      this.loading = false
    })
    this.subArr.push(sst)
  }

  //- Lấy danh sách Status
  p_GetListStatus() {
    this.loading = true;
    var ctx = 'Lấy danh sách Tình trạng'

    let sst = this.layoutAPI.GetListStatus(4).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0)
        this.ListStatus = res.ObjectReturn.filter(status => status.OrderBy !== 1)
      else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error} `);
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  // Import Excel
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcel_sst = this.marCategoryApiService.ImportExcel(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListWebTree()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
    this.subArr.push(ImportExcel_sst)

  }

  validImg(str) {
    return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  }
  getImgRes(url) {
    return Ps_UtilObjectService.getImgRes(url)
  }
  getUrlHachi(url) {
    return Ps_UtilObjectService.getImgResHachi(url)
  }

  //-----------HANDLE FORM FUNCTIONS----------\\
  //Change laguage form
  onChangeLanguage(index) {
    this.language = index
  }

  //hàm lấy các giá trị được chọn trên form
  checkProp(item?: DTOCategoryWeb) {
    var newItem = Ps_UtilObjectService.hasValue(item) ? item : this.GroupWebSelectedDTO
    var temp = this.parentGroup.find(s => s.Code == newItem.ParentID)

    if (Ps_UtilObjectService.hasValue(temp))
      this.curParentGroup = temp
    else
      this.curParentGroup = { ...this.defaultParent }

    let status = newItem.StatusID

    this.isLockAll = (status == 2 || status == 3) || this.isViewOnly
      || ((status == 0 || status == 4) && this.isVerifier && !this.isMaster)
  }

  onDropdownFilter() {
    const contains = (value) => (s: DTOCategoryWeb) =>
      s.VNGroupName?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

    this.ParentIDDropdown?.filterChange.asObservable().pipe(
      switchMap((value) =>
        from([this.parentGroup]).pipe(
          tap(() => (this.loading = true)),
          delay(this.layoutService.typingDelay),
          map((data) => data.filter(contains(value)))
        )
      )
    ).subscribe((x) => {
      this.filterParentGroup = x;
      this.loading = false
    });
  }

  onFilterMultiSelectTree(e) {
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, this.layoutService.typingDelay);
  }

  multiselectvalueChange(e: DTOCategoryWeb[]) {
    this.ListChildsLevel4 = e.filter(s => s.Level == 4)
  }
  //Update status của group web
  onStatusChange(e) {
    if (this.webForm.controls['StatusID'].value == 3)
      this.stopGroupWebDialogOpened = true
  }
  closeStopDialog() {
    this.webForm.controls['StatusID'].setValue(2)
    this.stopGroupWebDialogOpened = false
  }
  stopGroupWeb() {
    this.webForm.controls['StatusID'].setValue(3)
    this.stopGroupWebDialogOpened = false
  }
  //close form and reset value of webForm
  onCloseForm() {
    this.onResetLanguage();
    this.onResetDeclarations()
  }

  //Set all default
  onResetDeclarations() {
    // if (this.GroupWebSelectedDTO.Level !== 3) {
    if (!Ps_UtilObjectService.hasListValue(this.selectedTreelistItem)) {
      this.GroupWebSelectedDTO = new DTOCategoryWeb();
    }
    this.isAdd = false;
    this.isPopupDropdownOpen = false;
    this.formDrawer.close();
    this.webForm.reset();
  }

  // Folder
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }

  pickFile(e: DTOCFFile, width, height) {
    this.webForm.controls['URLImage1'].setValue(Ps_UtilObjectService.removeImgRes(e?.PathFile.replace('~', '')))
    this.layoutService.setFolderDialog(false)
  }
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiService.GetFolderWithFile(childPath, 8)
  }

  deleteImg() {
    this.webForm.controls['URLImage1'].setValue(null)
  }

  //Set tiếng việt là mặc định khi mở lại form
  onResetLanguage() {
    this.language = 0
  }

  //Toggle form khi nhấn nút thêm phân nhóm ở header
  onHandleOpenFormHeaderButton(isChild: boolean) {
    this.isAdd = true;
    //Check là button thêm nhóm hay thêm nhóm con
    if (isChild) {//
      this.levelOfForm = this.GroupWebSelectedDTO.Level + 1;
    } else {
      this.levelOfForm = this.GroupWebSelectedDTO.Level;
    }
    this.onAssignSelectedItemToAddForm();
    this.formDrawer.open()
  }

  // Toggle drodown khi nhấn nút more ở cột cuối ds
  togglePopup(index, item){
    event.stopPropagation()

    // Lấy tham chiếu đến DOM element của popup
    const popupElement = this.el.nativeElement.querySelector('.rowMoreActionPopup');
    const rect = popupElement.getBoundingClientRect();
    const topValue = rect.top;
    // if(topValue >= 550){
    //   this.topValue = 'center'
    // } else {
    //   this.topValue = 'top'
    // }
     
    if (index != this.currentAnchorIndex) {

      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      
      this.popupShow = !this.popupShow

    }

    if (this.popupShow){
      this.GroupWebSelectedDTO = item
      this.onCheckStatust()
      this.getSelectedMenuDropdown(item)
    }


    this.currentAnchorIndex = index
    // this.currentRowItem = item
  }

  //
  onBlurButton(){
    if(Ps_UtilObjectService.hasValueString(this.filterItemDropdown.value)){
      this.filterItemDropdown.value = ''
    }    
    this.onloadData(2)

  }

  //Handle assign parent value for child
  onAssignSelectedItemToAddForm() {
    var newGroupWeb: DTOCategoryWeb = new DTOCategoryWeb()
    // lấy ParentID và ParentName là tên và code của selected item nếu level form > level của selected item
    if (this.levelOfForm > this.GroupWebSelectedDTO.Level) {
      newGroupWeb.ParentName = this.GroupWebSelectedDTO.VNGroupName
      newGroupWeb.ParentID = this.GroupWebSelectedDTO.Code == 0 ? null : this.GroupWebSelectedDTO.Code
    } else if (this.levelOfForm == this.GroupWebSelectedDTO.Level) {
      newGroupWeb.ParentName = this.GroupWebSelectedDTO.ParentName
      newGroupWeb.ParentID = this.GroupWebSelectedDTO.ParentID
    }
    newGroupWeb.Level = this.levelOfForm
    this.webForm.patchValue(newGroupWeb);
    this.checkProp(newGroupWeb)
    this.webForm.controls['Parent'].setValue(this.curParentGroup)
    this.onGetListGroupWebForForm();
  }  
 
  //Gán giá trị của selected item cho form nếu form chỉnh sửa được mở
  onAssignSelectedItemToEditForm(IsUpdateStatus: boolean) {
    var newGroup = { ...this.GroupWebSelectedDTO }
    newGroup.URLImage1 = Ps_UtilObjectService.removeImgRes(newGroup.URLImage1)
    this.webForm.patchValue(newGroup);
    this.checkProp(newGroup)
    this.webForm.controls['Parent'].setValue(this.curParentGroup)
    if(IsUpdateStatus){
      this.UpdateGroupWeb()
    } else {
      this.onGetListGroupWebForForm();
      this.GetGroupWeb(newGroup)  
    }
  }

  onGetListGroupWebForForm() {
    if (!Ps_UtilObjectService.hasValue(this.GroupWebSelectedDTO))
      this.GroupWebSelectedDTO = new DTOCategoryWeb()

    if (this.levelOfForm > 1 && this.levelOfForm <= 3)
      this.GetListGroupWeb(false);

    if (this.levelOfForm == 3)
      this.GetListGroupWeb(true);
    
    var GroupWebParent = new DTOCategoryWeb()
    if(Ps_UtilObjectService.hasValue(this.GroupWebSelectedDTO) && Ps_UtilObjectService.hasListValue(this.listGroupWebTreeListFind)){
      if(Ps_UtilObjectService.hasValue(this.GroupWebSelectedDTO.ParentID)){
         this.listGroupWebTreeListFind.find(s => {
         if(s.Code == this.GroupWebSelectedDTO.ParentID){
            GroupWebParent = s
         }
         else{
            if(Ps_UtilObjectService.hasListValue(s.ListChilds)){
              s.ListChilds.find(c => {
                if(c.Code == this.GroupWebSelectedDTO.ParentID){
                  GroupWebParent = c
                }
              })
            }
         }
        })
      }
    }
    //gán vào item dropdown để truyền qua ItemDisabled Callback
    this.ListStatus.forEach(s => {
      s['GroupWebParent'] = GroupWebParent
      s['GroupWeb'] = this.GroupWebSelectedDTO
      s['isMaster'] = this.isMaster
      s['isCreator'] = this.isCreator
      s['isVerifier'] = this.isVerifier
    })
  }

  ngOnDestroy(): void {
    this.subArr.forEach(s => s?.unsubscribe())
  }
}


