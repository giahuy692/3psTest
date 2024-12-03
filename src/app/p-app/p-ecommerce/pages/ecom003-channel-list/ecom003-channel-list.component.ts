import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import DTOChannel from '../../shared/dto/DTOChannel.dto';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomChannelAPIService } from '../../shared/services/ecom-channel-api.service';
import { DTOChannelGroup } from '../../shared/dto/DTOChannelGroup.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ecom003-channel-list',
  templateUrl: './ecom003-channel-list.component.html',
  styleUrls: ['./ecom003-channel-list.component.scss']
})
export class Ecom003ChannelListComponent implements OnInit, OnDestroy {

  // ========================================================
  //#region Code mới
  channel = new DTOChannel()
  listChannel: DTOChannel[] = []


  //#region FILTER  
  isDrafting: boolean = true;
  isSentApprove: boolean = true;
  isApproved: boolean = false;
  isStop: boolean = false;

  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterDropdown: CompositeFilterDescriptor = { logic: 'or', filters: [] }
  filterIsDrafting: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 0 };
  filterIsSentApprove: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 1 };
  filterIsApproved: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 2 };
  filterIsStop: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 3 };
  filterIsReturn: FilterDescriptor = { field: 'StatusID', operator: 'eq', value: 4 };
  tempSearch: string = '';
  filterDropdownParent: FilterDescriptor = { field: 'ParentID', operator: 'eq', value: 0 }
  //#endregion


  //#region DROPDOWN FILTER  
  listParentChannel: DTOChannelGroup[] = []
  //#endregion


  //#region GRID
  gridView = new Subject<any>();
  isLoading: boolean = false
  pageSize = 25; skip = 0; total = 0
  pageSizes = [this.pageSize]
  sortBy: SortDescriptor = { field: 'Code', dir: 'desc' }
  gridState: State = {
    take: this.pageSize,
    sort: [this.sortBy],
    filter: { filters: [], logic: 'and' },
    skip: this.skip
  }

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  isFilterActive = true
  defaultParent: { Code: number, ChannelGroupName: string } = { Code: null, ChannelGroupName: 'không lựa chọn' };
  listChannelGroup: DTOChannelGroup[] = [];
  listChannelGroupFilter: DTOChannelGroup[] = [];
  DTOChannelGroup: DTOChannelGroup = new DTOChannelGroup();
  //#endregion


  //#region MORE ACTION DRODOWN IN LIST
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  listUpdateChannel: DTOChannel[] = []
  itemChannel: DTOChannel;
  //#endregion


  //#region DATA CHANGE IN LIST
  onPageChangeCallback: Function
  onFilterChangeCallback: Function
  onSortChangeCallback: Function
  //#endregion


  //#region SELECT CHECKBOX - SHOW POPUP ACTION 
  onSelectCallback: Function
  getSelectionPopupCallback: Function
  onSelectedPopupBtnCallback: Function
  //#endregion


  //#region DIALOG CONFIRM
  dataDelete: DTOChannel = new DTOChannel()
  openConfirm: boolean = false;
  listDelete: any[] = []
  //#endregion


  //#region DRAWER
  @ViewChild('Drawer') Drawer: MatDrawer;
  loadingDropdownTree: boolean = false;
  tempImg: string = '';
  pickFileCallback: Function;
  GetFolderCallback: Function;
  formChannel: UntypedFormGroup;
  isAppear: boolean = false;
  isDisabled: boolean = false;
  //#endregion

  //#region UNSUBCRIBE
  Unsubscribe = new Subject<void>
  //#endregion


  //#region PERMISSION
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoaded: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];
  //#endregion



  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public apiService: EcomChannelAPIService,
    public MarServiceAPI: MarNewsProductAPIService,
    public domSanititizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    let that = this

    //grid dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)

    //grid tool page
    this.onPageChangeCallback = this.onPageChange.bind(this)

    //grid select
    this.onSelectCallback = this.selectItem.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)


    // folder get image
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)


    this.loadForm()
    this.formChannel.patchValue({
      ParentID: new DTOChannelGroup()
    })

    // permission  
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && that.justLoaded) {
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.isAllPers = false
        // this.isCanCreate = false
        // this.isCanApproved = true
        // this.onLoadFilter()
        // this.getAPI()

        that.justLoaded = false;
      }
    });

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.onLoadFilter()
        this.getAPI()
			}
		})
  }


  //dùng này để tránh lỗi ng0100
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  getAPI() { //Gọi api
    this.APIGetListChannelNew("", this.gridState);
    this.APIGetListChannelGroupTwoLevel()
  }


  //#region ======== DROPDOWN TREELIST
  ListTreeTextField: string[] = ['ListGroup']
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
  handleFiltertree(value) {
    this.listChannelGroupFilter = this.search(this.listChannelGroup, value);
  }

  search(items: any[], term: string): any[] {
    return items.reduce((acc, item) => {
      if (item.hasOwnProperty('ChannelGroupID') || item.hasOwnProperty('ChannelGroupName')) {
        if (this.contains(item.ChannelGroupID, term) || this.contains(item.ChannelGroupName, term)) {
          acc.push(item);
        } else if (Ps_UtilObjectService.hasListValue(item.ListGroup)) {
          let newItemGroups
          if (Ps_UtilObjectService.hasListValue(item.ListGroup)) {
            newItemGroups = this.search(item.ListGroup, term)
          }
          if (newItemGroups.length > 0) {
            acc.push({ ChannelGroupName: item.ChannelGroupName, ChannelGroupID: item.ChannelGroupID, ListGroup: newItemGroups, TypeData: item.TypeData });
          }
        }
      }
      return acc;
    }, []);
  }
  contains(text: string, term: string): boolean {
    return text.toLowerCase().indexOf((term || "").toLowerCase()) >= 0;
  }
  //#endregion

  //#region ======== BREAD CUM
  reloadData() {
    this.APIGetListChannelNew(this.tempSearch, this.gridState);
    this.APIGetListChannelGroupTwoLevel();
  }
  //#endregion

  //#region ======== GRID
  onPageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.APIGetListChannelNew(this.tempSearch, this.gridState);
  }
  //#endregion


  //#region ======== FILTER 
  // Search
  onSearch(event: string) {
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.tempSearch = event;
    }
    this.gridState.skip = 0;
    this.APIGetListChannelNew(this.tempSearch, this.gridState);
  }

  //Chọn checkbox filter sẽ gọi hàm này
  selectFilter(e: boolean, type: string) {
    this[type] = e;
    this.gridState.skip = 0; //khi lọc sẽ trở về trang 1 của grid
    this.onLoadFilter();
    this.APIGetListChannelNew(this.tempSearch, this.gridState);
  }

  //Reset filter
  @ViewChild('tree') tree: any;

  onResetFilter() {
    this.isDrafting = true;
    this.isSentApprove = true;
    this.isApproved = false;
    this.isStop = false;
    this.tempSearch = "";
    this.gridState.skip = 0;
    this.filterDropdownParent = { field: 'ParentID', operator: 'eq', value: 0 };
    this.defaultParent = { Code: null, ChannelGroupName: 'không lựa chọn' };
    this.tree.reset();

    this.onLoadFilter();
    this.APIGetListChannelNew(this.tempSearch, this.gridState);
  }


  //Dùng khi cần set trạng thái cho cho các filter
  onLoadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes];
    this.gridState.take = this.pageSize;
    this.gridState.filter.filters = [];
    this.filterStatus.filters = [];
    this.filterDropdown.filters = [];

    if (this.isDrafting) //checkbox ĐST 
      this.filterStatus.filters.push(this.filterIsDrafting, this.filterIsReturn);

    if (this.isSentApprove) //checkbox GỬI DUYỆT 
      this.filterStatus.filters.push(this.filterIsSentApprove);

    if (this.isApproved) //checkbox ĐÃ DUYỆT
      this.filterStatus.filters.push(this.filterIsApproved);

    if (this.isStop) //checkbox NGƯNG ÁP DỤNG 
      this.filterStatus.filters.push(this.filterIsStop);


    // filter của dropdown treelist
    if (Ps_UtilObjectService.hasValue(this.filterDropdownParent.value) && this.filterDropdownParent.value > 0) {
      this.filterDropdown.filters.push(this.filterDropdownParent);
    }

    // Đẩy mảng filter của status vào gridState
    if (this.filterStatus.filters.length > 0) this.gridState.filter.filters.push(this.filterStatus);

    if (this.filterDropdown.filters.length > 0) this.gridState.filter.filters.push(this.filterDropdown);

  }
  //#endregion


  //#region ======== DROPDOWN TREELIST 
  //Hàm này của dropdown trên drawerr
  onSelectedDropdownList(e) {
    if (!Ps_UtilObjectService.hasValue(e) || e.Code == null) { //nếu bị undentify thì set default
      this.formChannel.patchValue({
        ParentID: { Code: null, ChannelGroupName: 'không lựa chọn' }
      })
    }
  }


  callOneTime: number = 0;
  // Hàm này của dropdown trên header 2
  onSelectedDropdownListFilter(e) {
    if (!Ps_UtilObjectService.hasValue(e) || e.Code == null) { //nếu bị undentify thì set default
      this.callOneTime += 1
      this.callOneTime = this.callOneTime > 2 ? 1 : this.callOneTime

      e = { Code: null, ChannelGroupName: 'không lựa chọn' };
      this.defaultParent = { Code: null, ChannelGroupName: 'không lựa chọn' };
      this.filterDropdownParent = { field: 'ParentID', operator: 'eq', value: 0 };
    } else if (Ps_UtilObjectService.hasValue(e) && e.Code >= 0) {
      this.callOneTime = 1
      this.defaultParent = { Code: e.Code, ChannelGroupName: e.ChannelGroupName }
      this.filterDropdownParent = { field: 'ParentID', operator: 'eq', value: e.Code };
    }

    if (this.callOneTime == 1) {
      this.gridState.skip = 0; //reset lại page
      this.onLoadFilter();
      this.APIGetListChannelNew(this.tempSearch, this.gridState);
    }
  }
  //#endregion


  //#region ======== DROPDOWN ACTION MORE

  // Hiện các Action trong dropdown
  getActionDropdown(ActionsDropdown: MenuDataItem[], dataItem: DTOChannel) {
    this.isDisabled = true;
    this.itemChannel = dataItem;
    ActionsDropdown = []
    ActionsDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })

    if (this.isCanCreate || this.isAllPers) { //toàn quyền và quyền tạo
      if (dataItem.StatusID == 0 || dataItem.StatusID == 4) { //tình trạng đang soạn / trả về
        ActionsDropdown.shift()
        ActionsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
        this.isDisabled = false;

        ActionsDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
      }

      if (dataItem.StatusID == 0) { //tình trạng đang soạn  
        ActionsDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })
      }
    }

    if (this.isCanApproved || this.isAllPers) {//có quyền duyệt
      if (dataItem.StatusID == 1) { //tình trạng gửi duyệt
        ActionsDropdown.shift()
        ActionsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
        this.isDisabled = false;
      }

      if (dataItem.StatusID == 1 || dataItem.StatusID == 3) { //tình trạng gửi duyệt / ngưng
        ActionsDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })

        ActionsDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },)
      }

      if (dataItem.StatusID == 2) { //tình trạng đã duyệt
        ActionsDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
      }
    }
    return ActionsDropdown
  }

  // Thực hiện các Action hiện trong dropdown
  onActionDropdownClick(menu: MenuDataItem, item: DTOChannel) {
    this.listDelete = [];
    this.dataDelete = item;
    if (item.Code != 0) {
      if (menu.Name == 'Xóa' || menu.Code == 'trash') {
        this.openConfirm = true;
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.onOpenDrawer('update', item)
      }
      else if (menu.Link == 'view' || menu.Code == 'eye') {
        this.onOpenDrawer('update', item)
      }
      else if (menu.Type == 'StatusID') { //chuyển trạng thái
        let dataUpdate = { ...item }
        let statusID = parseInt(menu.Link)
        this.checkFieldRequire(dataUpdate)

        if (Ps_UtilObjectService.hasListValue(this.listUpdateChannel)) {
          this.APIUpdateChannelStatus([dataUpdate], statusID)
        }
      }
    }
  }


  //hàm check trường thiếu và đẩy vào mảng update status
  checkFieldRequire(data: DTOChannel) {
    this.listUpdateChannel = []
    const isAllow = data.StatusID == 2 || data.StatusID == 3 ? false : true;
    if (!Ps_UtilObjectService.hasValueString(data.Brief) && isAllow)
      this.layoutService.onWarning(`Vui lòng nhập Mã Kênh!`)
    else if (!Ps_UtilObjectService.hasValueString(data.ChannelName) && isAllow)
      this.layoutService.onWarning(`Vui lòng kênh bán hàng!`)
    else
      this.listUpdateChannel.push(data)
  }
  //#endregion


  //#region ======== POPUP SELECTION CHECKBOX

  // hàm select checkbox trên list để khi hiện popup chuyển trạng thái thì ẩn search/filter đi
  selectItem(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  // hàm hiện các button trạng thái cho popup checkbox
  getSelectionPopup(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    //tìm item có tình trạng ...
    var canSent = arrItem.findIndex(s => (s.StatusID == 0 || s.StatusID == 4)) //đang soạn/trả về có thể gửi duyệt
    var canAppro = arrItem.findIndex(s => (s.StatusID == 1 || s.StatusID == 3)) //gửi duyệt có thể duyệt 
    var canReturn = arrItem.findIndex(s => (s.StatusID == 1 || s.StatusID == 3)) //gửi duyệt/ngưng có trả về

    var canStop = arrItem.findIndex(s => s.StatusID == 2) // duyệt có thể ngưng
    var canDel = arrItem.findIndex(s => s.StatusID == 0) // đang soạn có thể xóa

    if (canSent != -1 && (this.isAllPers || this.isCanCreate)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true }
      )
    }

    if (canAppro != -1 && (this.isAllPers || this.isCanApproved)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
      )
    }

    if (canReturn != -1 && (this.isAllPers || this.isCanApproved)) {
      moreActionDropdown.push(
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }


    if (canStop != -1 && (this.isAllPers || this.isCanApproved)) {
      moreActionDropdown.push(
        { Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isAllPers || this.isCanCreate)) {
      moreActionDropdown.push(
        { Name: "Xóa", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }
    return moreActionDropdown
  }

  //hàm xử lý action của các button trong popup checkbox
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let arr = []
    let StatusID: number = -1
    if (list.length > 0) {
      if (btnType == "StatusID") {
        if (value == 1 || value == '1') {//Gửi duyệt
          arr = []
          list.forEach(s => { if (s.StatusID == 0 || s.StatusID == 4) arr.push(s); })
          StatusID = 1
        }
        else if (value == 2 || value == '2') {//Phê duyệt
          arr = []
          list.forEach(s => { if (s.StatusID == 1 || s.StatusID == 3) arr.push(s); })
          StatusID = 2
        }
        else if (value == 4 || value == '4') {//Trả về
          arr = []
          list.forEach(s => { if (s.StatusID == 1 || s.StatusID == 3) arr.push(s); })
          StatusID = 4
        }
        else if (value == 3 || value == '3') {//Ngưng hiển thị
          arr = []
          list.forEach(s => { if (s.StatusID == 2) arr.push(s); })
          StatusID = 3
        }

        if (Ps_UtilObjectService.hasListValue(arr)) {
          this.APIUpdateChannelStatus(arr, StatusID)
        }
      }

      if (btnType == "Delete") {//Xóa
        this.openConfirm = true
        this.listDelete = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.listDelete.push(s)
        })
      }
    }
  }
  //#endregion


  //#region ======== FORM
  loadForm() {
    this.formChannel = new UntypedFormGroup({
      'Code': new UntypedFormControl(0, Validators.required),
      'ImageSetting': new UntypedFormControl(""),
      'ChannelName': new UntypedFormControl("", Validators.required),
      'Brief': new UntypedFormControl("", Validators.required),
      'ParentID': new UntypedFormControl(null),
      'ParentName': new UntypedFormControl(""),
      'Department': new UntypedFormControl(""),
      'HighParentName': new UntypedFormControl(""),
      'NumOfGroups': new UntypedFormControl(0),
      'NumOfChannels': new UntypedFormControl(0),
      'Inhouse': new UntypedFormControl(false),
      'IsChild': new UntypedFormControl(false),
      'OrderBy': new UntypedFormControl(1),
      'StatusID': new UntypedFormControl(0),
      'StatusName': new UntypedFormControl(""),
      'FromGroup': new UntypedFormControl(""),
      'ToGroup': new UntypedFormControl(""),
      'InhouseName': new UntypedFormControl(""),
      'NoOfOnsite': new UntypedFormControl(0),
      'NoOfWaiting': new UntypedFormControl(1),
      'Priority': new UntypedFormControl(0),
      'CreatedBy': new UntypedFormControl(""),
      'ApprovedBy': new UntypedFormControl(""),
      'CreateTime': new UntypedFormControl(null),
      'ApprovedTime': new UntypedFormControl(null),
    })
  }
  //#endregion


  //#region ======== DRAWER

  // Hàm mở drawer
  onOpenDrawer(type: string, dataItem?: DTOChannel) {
    this.loadForm();

    if (Ps_UtilObjectService.hasValue(dataItem)) {
      this.formChannel.patchValue(dataItem);
    }

    if (this.formChannel.value.Code == 0) {
      this.isDisabled = false;
      this.APIGetListChannelGroupTwoLevel();
    }

    if (type == 'create') {
      // this.dataDelete = dataItem
    } else if (type == 'update') {
      //có cha thì fill lên dropdown
      if (this.formChannel.value.ParentID !== null) {
        this.formChannel.patchValue({ ParentID: { Code: this.formChannel.value.ParentID } });

        this.APIGetListChannelGroupTwoLevel(this.formChannel.value.ParentID.Code);
      } else {
        this.APIGetListChannelGroupTwoLevel();
      }

      // có hình thì gán vào biến
      if (Ps_UtilObjectService.hasValue(this.formChannel.value.ImageSetting)) {
        this.tempImg = this.formChannel.value.ImageSetting;
      }
    }




    // Nếu tình trạng duyệt và ngưng thì không hiện nút cập nhật
    this.isAppear = this.formChannel.value.StatusID == 2 || this.formChannel.value.StatusID == 3 ? false : true;
    this.formChannel.markAsTouched();
    this.Drawer.open();
  }


  // Hàm submit form
  onSubmitForm() {
    this.formChannel.markAsUntouched()
    this.formChannel.value.ImageSetting = this.tempImg;

    if (this.formChannel.value.ParentID.hasOwnProperty('Code')) {
      this.formChannel.value.ParentID = this.formChannel.value.ParentID.Code;
    }

    if (this.formChannel.valid) {
      if (!Ps_UtilObjectService.hasValueString(this.formChannel.value.ChannelName)) {
        this.layoutService.onWarning(`Vui lòng điền vào kênh bán hàng!`);
      } else if (!Ps_UtilObjectService.hasValueString(this.formChannel.value.Brief)) {
        this.layoutService.onWarning(`Vui lòng điền vào mã kênh!`);
      } else if (!Ps_UtilObjectService.hasValueString(this.formChannel.value.ChannelName) && !Ps_UtilObjectService.hasValueString(this.formChannel.value.Brief)) {
        this.layoutService.onWarning(`Vui lòng điền vào kênh bán hàng và mã kênh!`);
      } else {
        this.APIUpdateChannel(this.formChannel.value);
      }
    }
    else {
      const invalidFields = this.getInvalidFields(this.formChannel.controls);
      const fieldTranslations = {
        'ChannelName': 'kênh bán hàng',
        'Brief': 'mã kênh',
      };
      invalidFields.forEach((field) => {
        const translatedField = fieldTranslations[field] || field;
        this.layoutService.onWarning(`Vui lòng điền vào ${translatedField}!`);
      });
    }
  }

  // Hàm đóng drawer
  onCloseDrawer() {
    this.Drawer.close();
    this.formChannel.reset();
    this.tempImg = '';
  }

  // Đệ qui tìm cha
  findParent(code: any, nodes: any[]): any {
    for (let node of nodes) {
      if (node.Code === code) {
        return node; // tìm thấy cha
      } else if (node.ListGroup && node.ListGroup.length > 0) {
        // nếu có các nút con, tiếp tục tìm kiếm ở cấp dưới
        let foundParent = this.findParent(code, node.ListGroup);
        if (foundParent) {
          return foundParent; // Nếu tìm thấy ở cấp dưới, trả về nút cha
        }
      }
    }
    return null; // Không tìm thấy cha
  }

  //hàm chặn sự kiện enter khi đang mở drawer
  onKeydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }

  // hàm kiểm tra thiếu trường bắt buộc trong form
  getInvalidFields(controls: any): string[] {
    return Object.keys(controls).reduce((invalidFields, key) => {
      if (controls[key].status === "INVALID") {
        invalidFields.push(key);
      }
      return invalidFields;
    }, []);
  }


  //hàm mở folder
  onUploadImg() {
    this.layoutService.folderDialogOpened = true;
  }


  // lấy foler chứa ảnh 
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog()) {
      return this.MarServiceAPI.GetFolderWithFile(childPath, 12);
    }
  }

  getRes(str: string) {
    return Ps_UtilObjectService.getImgRes(str);
  }


  errorOccurred: boolean = false;
  getImgRes(img: string) {
    let a = Ps_UtilObjectService.removeImgRes(img);
    if (this.errorOccurred) {
      return this.getResHachi(a);
    } else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError() {
    this.errorOccurred = true;
  }

  //Hàm xóa hình trong form
  onDelImg() {
    // this.tempImg = "";
    this.openDeleteImg = true;
  }

  //hàm chọn img
  pickFile(e: DTOCFFile, width, height) {
    this.tempImg = e?.PathFile.replace('~', '');
    this.layoutService.setFolderDialog(false);
  }

  //#endregion


  //#region ======== DIALOG CONFIRM
  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      if (Ps_UtilObjectService.hasListValue(this.listDelete)) { //xóa từ popup checkbox
        this.APIDeleteChannel(this.listDelete)
      } else { // xóa từ dropdown action
        this.APIDeleteChannel([this.dataDelete])
      }
      this.openConfirm = false;
    } else {
      this.openConfirm = false;
    }
  }

  openDeleteImg: boolean = false
  onDeleteImg(status: string) {
    if (status == 'yes') {
      this.tempImg = "";
      this.openDeleteImg = false;
    } else {
      this.openDeleteImg = false;
    }
  }
  //#endregion


  //#region ======== OPEND PAGE
  onOpenPage(data?: DTOChannel) {
    event.stopPropagation()
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-channel') || f.Link.includes('/ecommerce/ecom003-channel-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('ecom012-product-channel') || f.Link.includes('/ecommerce/ecom012-product-channel'))
        if (Ps_UtilObjectService.hasValue(detail)) {
          // this.ecomService.setCacheGroupChannel(data)
          localStorage.setItem("ecom_channel_detail", JSON.stringify(data))
        }
        this.menuService.selectedMenu(detail, parent)
      }
    })
  }
  //#endregion


  //#region ======== API

  //Lấy danh sách kênh bán hàng
  APIGetListChannelNew(KeyWord: string = "", Filter: State) {
    var ctx = 'Danh sách kênh bán hàng'
    let data = {
      KeyWord: KeyWord,
      Filter: toDataSourceRequest(Filter)
    };
    this.isLoading = true;
    this.apiService.GetListChannelNew(data).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listChannel = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total
          this.gridView.next({ data: this.listChannel, total: this.total })
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
        }
        this.isLoading = false;
      }, (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}:  ${err}`)
        this.isLoading = false;
      }
    )
  }


  //Lấy danh sách kênh trong phân nhóm
  noChoice: DTOChannelGroup = new DTOChannelGroup();
  APIGetListChannelGroupTwoLevel(ParentID?: any) {
    const ctx = 'nhóm kênh trực thuộc'
    this.isLoading = true
    this.noChoice.Code = null;
    this.noChoice.ChannelGroupName = 'Không lựa chọn'

    this.apiService.GetListChannelGroupTwoLevel().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.listChannelGroup = res.ObjectReturn;
        this.listChannelGroup.unshift(this.noChoice);
        this.listChannelGroupFilter = this.listChannelGroup



        // Lấy ra cấp cha để bind lên dropdown
        if (Ps_UtilObjectService.hasValue(ParentID)) {
          let parent = this.findParent(ParentID, this.listChannelGroup)
          this.formChannel.patchValue({
            ParentID: { Code: parent.Code, ChannelGroupName: `${parent.ChannelGroupID} | ${parent.ChannelGroupName}` }
          })
        }
        else {
          this.formChannel.patchValue({
            ParentID: { Code: null, ChannelGroupName: `không lựa chọn` }
          })
        }
      }
      else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`) }
      this.isLoading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
      this.isLoading = false;
    })
  }


  // Cập nhật kênh bán hàng
  APIUpdateChannel(dataUpdate: DTOChannel) {
    this.isLoading = true;
    var ctx = 'kênh bán hàng'
    const txAdd_Up = dataUpdate.Code === 0 ? 'Thêm mới' : 'Cập nhật'
    this.apiService.ErpUpdateChannel(dataUpdate).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${txAdd_Up} ${ctx} thành công`)
          this.Drawer.close();
          this.tempImg = "";
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${txAdd_Up} ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListChannelNew(this.tempSearch, this.gridState);
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${txAdd_Up} ${ctx}: ${error}`)
        this.isLoading = false;
        this.APIGetListChannelNew(this.tempSearch, this.gridState);
      }
    )
  }



  // Cập nhật tình trạng kênh bán hàng
  APIUpdateChannelStatus(listItem: DTOChannel[], StatusID: number) {
    this.apiService.ErpUpdateChannelStatus(listItem, StatusID).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess('Cập nhật trạng thái kênh thành công!');
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog(); //đóng popup
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái kênh bán hàng: ${res.ErrorString} `);
        }
        this.isLoading = false;
        this.APIGetListChannelNew(this.tempSearch, this.gridState);
      },
      (error) => {
        this.isLoading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái kênh bán hàng: ${error} `);
        this.APIGetListChannelNew(this.tempSearch, this.gridState);
      }
    )
  }


  // Xóa kênh bán hàng
  APIDeleteChannel(dataUpdate: DTOChannel[]) {
    this.isLoading = true;
    var ctx = 'Xóa kênh bán hàng'
    this.apiService.ErpDeleteChannel(dataUpdate).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog(); //đóng popup
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListChannelNew("", this.gridState);
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
        this.isLoading = false;
        this.APIGetListChannelNew("", this.gridState);
      }
    )
  }
  //#endregion


  //#region ========= DESTROY UNSUBCRIBE  
  ngOnDestroy() {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
  //#endregion

  //#endregion




  // ========================================================
  //#region ================== region Code cũ
  // loading = false
  // isAdd = true
  // isFilterActive = true

  // deleteDialogOpened = false
  // deleteManyDialogOpened = false

  // total = 0
  // //object
  // channel = new DTOChannel()
  // listChannel: DTOChannel[] = []
  // deleteList: DTOChannel[] = []
  // //header1
  // dangSoanThao = true
  // daDuyet = true
  // ngungHienThi = false
  // //header
  // searchForm: UntypedFormGroup
  // //grid
  // allowActionDropdown = ['delete']
  // //GRID
  // //prod
  // pageSize = 25
  // pageSizes = [this.pageSize]

  // gridView = new Subject<any>();
  // gridState: State = {
  //   take: this.pageSize,
  //   filter: { filters: [], logic: 'and' },
  // }
  // //
  // sortBy: SortDescriptor = {
  //   field: 'NoOfOnsite', dir: 'desc'
  // }
  // //header1
  // filterStatusID: CompositeFilterDescriptor = {
  //   logic: "or",
  //   filters: []
  // }
  // filterDangSoanThao: FilterDescriptor = {
  //   field: "StatusID", operator: "eq", value: 0
  // }
  // filterDaDuyet: FilterDescriptor = {
  //   field: "StatusID", operator: "eq", value: 2
  // }
  // filterNgungHienThi: FilterDescriptor = {
  //   field: "StatusID", operator: "eq", value: 3
  // }
  // filterTraLai: FilterDescriptor = {
  //   field: "StatusID", operator: "eq", value: 4
  // }
  // //search prod
  // filterSearchBox: CompositeFilterDescriptor = {
  //   logic: "or",
  //   filters: []
  // }
  // filterChannelName: FilterDescriptor = {
  //   field: "ChannelName", operator: "contains", value: null
  // }
  // filterParentName: FilterDescriptor = {
  //   field: "ParentName", operator: "contains", value: null
  // }
  // filterInhouseName: FilterDescriptor = {
  //   field: "InhouseName", operator: "contains", value: null
  // }
  // //Element
  // @ViewChild('drawer') drawer: MatSidenav;
  // //CALLBACK
  // //rowItem action dropdown
  // onActionDropdownClickCallback: Function
  // getActionDropdownCallback: Function
  // //grid data change
  // onPageChangeCallback: Function
  // onSortChangeCallback: Function
  // onFilterChangeCallback: Function
  // //grid select
  // getSelectionPopupCallback: Function
  // onSelectCallback: Function
  // onSelectedPopupBtnCallback: Function
  // //select
  // selectable: SelectableSettings = {
  //   enabled: true,
  //   mode: 'multiple',
  //   drag: false,
  //   checkboxOnly: true,
  // }
  // //permision
  // justLoaded = true
  // actionPerm: DTOActionPermission[] = []

  // isToanQuyen = false
  // isAllowedToCreate = false
  // isAllowedToVerify = false
  // isAllowedToCreateProd = false
  // isAllowedToVerifyProd = false
  // isAllowedToView = false
  // //
  // GetChannelList_sst: Subscription
  // UpdateChannelStatus_sst: Subscription
  // DeleteChannel_sst: Subscription
  // changeModuleData_sst: Subscription
  // changePermission_sst: Subscription

  // constructor(
  //   public menuService: PS_HelperMenuService,
  //   public layoutService: LayoutService,
  //   public layoutApiService: LayoutAPIService,
  //   public service: EcomService,
  //   public apiService: EcomChannelAPIService,
  // ) { }

  // ngOnInit(): void {
  //   let that = this
  //   this.loadFilter()
  //   this.loadSearchForm()

  //   this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
  //     if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
  //       that.justLoaded = false
  //       that.actionPerm = distinct(res.ActionPermission, "ActionType")

  //       that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
  //       that.isAllowedToVerify = that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
  //       //tạm thời dùng chung quyền Tạo
  //       // that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false  

  //       that.isAllowedToCreateProd = that.actionPerm.findIndex(s => s.ActionType == 4) > -1 || false
  //       that.isAllowedToVerifyProd = that.actionPerm.findIndex(s => s.ActionType == 5) > -1 || false
  //       that.isAllowedToView = that.actionPerm.findIndex(s => s.ActionType == 6) > -1 || false

  //       that.GetChannelList()
  //     }
  //   })
  //   //callback
  //   this.onPageChangeCallback = this.pageChange.bind(this)
  //   this.onSortChangeCallback = this.sortChange.bind(this)
  //   //dropdown
  //   this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
  //   this.getActionDropdownCallback = this.getActionDropdown.bind(this)
  //   //select
  //   this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
  //   this.onSelectCallback = this.selectChange.bind(this)
  //   this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  // }
  // //load  
  // loadSearchForm() {
  //   this.searchForm = new UntypedFormGroup({
  //     'SearchQuery': new UntypedFormControl(''),
  //   })
  // }
  // //filter
  // loadFilter() {
  //   this.pageSizes = [...this.layoutService.pageSizes]
  //   this.gridState.take = this.pageSize
  //   this.gridState.sort = [this.sortBy]
  //   this.gridState.filter.filters = []
  //   this.filterSearchBox.filters = []
  //   this.filterStatusID.filters = []
  //   //checkbox header 1 status id
  //   if (this.dangSoanThao) {
  //     this.filterStatusID.filters.push(this.filterDangSoanThao)
  //     this.filterStatusID.filters.push(this.filterTraLai)
  //   }

  //   if (this.daDuyet)
  //     this.filterStatusID.filters.push(this.filterDaDuyet)

  //   if (this.ngungHienThi)
  //     this.filterStatusID.filters.push(this.filterNgungHienThi)

  //   if (this.filterStatusID.filters.length > 0)
  //     this.gridState.filter.filters.push(this.filterStatusID)
  //   //search box
  //   if (Ps_UtilObjectService.hasValueString(this.filterChannelName.value))
  //     this.filterSearchBox.filters.push(this.filterChannelName)

  //   if (Ps_UtilObjectService.hasValueString(this.filterParentName.value))
  //     this.filterSearchBox.filters.push(this.filterParentName)

  //   if (Ps_UtilObjectService.hasValueString(this.filterInhouseName.value))
  //     this.filterSearchBox.filters.push(this.filterInhouseName)

  //   if (this.filterSearchBox.filters.length > 0)
  //     this.gridState.filter.filters.push(this.filterSearchBox)
  // }

  // getImgRes(str: string){
  //   return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str): null
  // }

  // //API
  // GetChannelList() {
  //   this.loading = true;
  //   var ctx = 'Danh sách kênh bán hàng'

  //   this.GetChannelList_sst = this.apiService.GetChannelList(this.gridState).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //       if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && Ps_UtilObjectService.hasValue(res.ObjectReturn.Data)) {
  //         this.listChannel = res.ObjectReturn.Data;
  //         this.total = res.ObjectReturn.Total
  //         this.gridView.next({ data: this.listChannel, total: this.total });
  //       }
  //     } else
  //       this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

  //     this.loading = false;
  //   }, () => {
  //     this.loading = false;
  //     this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
  //   });
  // }
  // UpdateChannelStatus(items: DTOChannel[] = [this.channel], statusID: number = this.channel.StatusID) {
  //   this.loading = true;
  //   var ctx = 'Cập nhật tình trạng'

  //   this.UpdateChannelStatus_sst = this.apiService.UpdateChannelStatus(items, statusID).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //       this.layoutService.onSuccess(`${ctx} thành công`)
  //       this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
  //       this.GetChannelList()
  //     } else
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

  //     this.loading = false;
  //   }, () => {
  //     this.loading = false;
  //     this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
  //   });
  // }
  // DeleteChannel(items: DTOChannel[] = [this.channel]) {
  //   this.loading = true;
  //   var ctx = 'Xóa kênh bán hàng'

  //   this.DeleteChannel_sst = this.apiService.DeleteChannel(items).subscribe(res => {
  //     if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
  //       this.layoutService.onSuccess(`${ctx} thành công`)
  //       this.deleteDialogOpened = false
  //       this.deleteManyDialogOpened = false
  //       this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

  //       items.forEach(s => {
  //         var ex = this.listChannel.findIndex(f => f.Code == s.Code)

  //         if (ex != -1)
  //           this.listChannel.splice(ex, 1)
  //       })
  //     } else {
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
  //       this.GetChannelList()
  //     }
  //     this.loading = false;
  //   }, () => {
  //     this.loading = false;
  //     this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
  //   });
  // }
  // ///KENDO GRID
  // //paging
  // pageChange(event: PageChangeEvent) {
  //   this.gridState.skip = event.skip;
  //   this.gridState.take = this.pageSize = event.take
  //   this.GetChannelList()
  // }
  // sortChange(event: SortDescriptor[]) {
  //   this.gridState.sort = event
  //   this.GetChannelList()
  // }
  // //DROPDOWN popup
  // getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem) {
  //   moreActionDropdown = []
  //   this.channel = { ...dataItem }
  //   var statusID = this.channel.StatusID;
  //   //edit
  //   if ((statusID != 0 && statusID != 4 && this.isAllowedToCreate) ||
  //     ((statusID == 0 || statusID == 4) && this.isAllowedToVerify) || this.isAllowedToView)
  //     moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
  //   else
  //     moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
  //   //Channel ko có bước Gửi duyệt 
  //   if (this.isAllowedToVerify || this.isToanQuyen) {
  //     if (statusID == 0 || statusID == 4) {
  //       moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
  //     }
  //     else if (statusID == 2) {
  //       moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
  //     }
  //     else if (statusID == 3) {
  //       moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
  //       moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
  //     }
  //   }
  //   //delete
  //   if ((statusID == 0 || statusID == 4) && (this.isAllowedToCreate || this.isToanQuyen))
  //     moreActionDropdown.push({ Name: "Xóa kênh", Code: "trash", Type: 'delete', Actived: true })

  //   return moreActionDropdown
  // }
  // onActionDropdownClick(menu: MenuDataItem, item) {
  //   if (item.Code > 0) {
  //     this.channel = { ...item }

  //     if (menu.Link == 'delete' || menu.Code == 'trash') {
  //       this.onDelete()
  //     }
  //     else if (menu.Type == 'StatusID') {
  //       this.UpdateChannelStatus([this.channel], parseInt(menu.Link))
  //     }
  //     else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
  //       this.channel = { ...item }
  //       this.openDetail(false)
  //     }
  //   }
  // }
  // //selection
  // getSelectionPopup(selectedList: any[]) {
  //   var moreActionDropdown = new Array<MenuDataItem>()
  //   //
  //   if (this.isToanQuyen || this.isAllowedToVerify) {
  //     var canDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

  //     if (canDuyet_canXoa != -1) {
  //       moreActionDropdown.push({
  //         Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
  //       })
  //     }
  //     var canNgung = selectedList.findIndex(s => s.StatusID == 2)

  //     if (canNgung != -1) {
  //       moreActionDropdown.push({
  //         Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
  //       })
  //     }
  //     var canTra = selectedList.findIndex(s => s.StatusID == 3)

  //     if (canTra != -1) {
  //       moreActionDropdown.push({
  //         Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
  //       })
  //     }
  //   }
  //   //delete
  //   if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate)) {
  //     moreActionDropdown.push({
  //       Name: "Xóa kênh", Type: 'delete',
  //       Code: "trash", Link: "delete", Actived: true, LstChild: []
  //     })
  //   }

  //   return moreActionDropdown
  // }
  // onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
  //   if (list.length > 0) {
  //     if (btnType == "StatusID") {
  //       var arr: DTOChannel[] = []

  //       if (value == 2 || value == '2')//Phê duyệt
  //         list.forEach(s => {
  //           if (s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4) {
  //             arr.push(s)
  //           }
  //         })
  //       else if (value == 4 || value == '4')//Trả về
  //         list.forEach(s => {
  //           if (s.StatusID == 3) {
  //             arr.push(s)
  //           }
  //         })
  //       else if (value == 3 || value == '3')//Ngưng hiển thị
  //         list.forEach(s => {
  //           if (s.StatusID == 2) {
  //             arr.push(s)
  //           }
  //         })

  //       if (Ps_UtilObjectService.hasListValue(arr))
  //         this.UpdateChannelStatus(arr, value)
  //     }
  //     else if (btnType == "delete") {//Xóa
  //       this.onDeleteMany()
  //       this.deleteList = []

  //       list.forEach(s => {
  //         if (s.StatusID == 0 || s.StatusID == 4)
  //           this.deleteList.push(s)
  //       })
  //     }
  //   }
  // }
  // selectChange(isSelectedRowitemDialogVisible) {
  //   this.isFilterActive = !isSelectedRowitemDialogVisible
  // }
  // //CLICK EVENT  
  // //header 1
  // selectedBtnChange(e, strCheck: string) {
  //   this[strCheck] = e

  //   this.loadFilter()
  //   this.GetChannelList()
  // }
  // openDetail(isAdd: boolean) {
  //   this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
  //     if (isAdd) {
  //       var prom = new DTOChannel()
  //       this.service.setCacheChannelDetail(prom)
  //     } else
  //       this.service.setCacheChannelDetail(this.channel)
  //     //policy
  //     var parent = item.ListMenu.find(f => f.Code.includes('ecom-channel')
  //       || f.Link.includes('ecom-channel'))
  //     //
  //     if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
  //       var detail = parent.LstChild.find(f => f.Code.includes('channel-list')
  //         || f.Link.includes('channel-list'))

  //       if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
  //         var detail2 = detail.LstChild.find(f => f.Code.includes('product-onsite-list')
  //           || f.Link.includes('product-onsite-list'))

  //         this.menuService.activeMenu(detail2)
  //       }
  //     }
  //   })
  // }
  // //header
  // resetFilter() {
  //   this.dangSoanThao = true
  //   this.daDuyet = true
  //   this.ngungHienThi = false
  //   //header
  //   this.searchForm.get('SearchQuery').setValue(null)
  //   //prod
  //   this.filterChannelName.value = null
  //   this.filterParentName.value = null
  //   this.filterInhouseName.value = null

  //   this.loadFilter()
  //   this.GetChannelList()
  // }
  // //
  // search() {
  //   var val = this.searchForm.value
  //   var searchQuery = val.SearchQuery

  //   if (Ps_UtilObjectService.hasValueString(searchQuery)) {
  //     this.filterChannelName.value = searchQuery
  //     this.filterParentName.value = searchQuery
  //     this.filterInhouseName.value = searchQuery
  //   } else {
  //     this.filterChannelName.value = null
  //     this.filterParentName.value = null
  //     this.filterInhouseName.value = null
  //   }

  //   this.loadFilter();
  //   this.GetChannelList()
  // }
  // //delete
  // onDelete() {
  //   this.deleteDialogOpened = true
  //   this.drawer.close()
  // }
  // delete() {
  //   if (this.channel.Code > 0)
  //     this.DeleteChannel()
  // }
  // closeDeleteDialog() {
  //   this.deleteDialogOpened = false
  // }
  // //delete many
  // onDeleteMany() {
  //   this.deleteManyDialogOpened = true
  // }
  // deleteMany() {
  //   this.DeleteChannel(this.deleteList)
  // }
  // closeDeleteManyDialog() {
  //   this.deleteManyDialogOpened = false
  // }
  // // AUTO RUN
  // keydownEnter(e: KeyboardEvent) {
  //   //disable close drawer
  //   e.preventDefault();
  //   e.stopPropagation();
  // }
  // ngOnDestroy(): void {
  //   this.GetChannelList_sst?.unsubscribe()
  //   this.UpdateChannelStatus_sst?.unsubscribe()
  //   this.DeleteChannel_sst?.unsubscribe()
  //   this.changeModuleData_sst?.unsubscribe()
  //   this.changePermission_sst?.unsubscribe()
  // }
  //#endregion Code cũ
}
