import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import DTOSynProvince from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import { EcomSynCartAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-syncart-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOMAStore } from '../../shared/dto/DTOMAStore.dto';
import { MarStoreSystemAPIService } from '../../shared/services/mar-store-system-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar014-store-system-list',
  templateUrl: './mar014-store-system-list.component.html',
  styleUrls: ['./mar014-store-system-list.component.scss']
})
export class Mar014StoreSystemListComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  // load data
  isLoading: boolean = false;
  justLoaded: boolean = true;

  onSortChangeCallback: Function;
  onPageChangeCallback: Function;

  total = 0
  pageSize = 50
  pageSizes = [this.pageSize]
  //
  // Dialog
  isAdd: boolean = false
  isLockAll: boolean = false
  //
  // Permission
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;

  actionPerm: DTOActionPermission[]
  //
  // Files
  pickFileCallback: Function;
  getFolderCallback: Function;
  //
  // Filters, Search Form, Sort
  isFilterActive: boolean = true;
  searchForm: UntypedFormGroup;
  gridView = new Subject<any>();

  gridState: State = { take: this.pageSize, filter: { filters: [], logic: 'and' } };
  sortBy: SortDescriptor[] = [{ field: 'Code', dir: 'asc' }];

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  filterSearchBox: CompositeFilterDescriptor = { logic: "or", filters: [] }

  filterShortName: FilterDescriptor = { field: "ShortName", operator: "contains", value: null }
  filterWHName: FilterDescriptor = { field: "WHName", operator: "contains", value: null }
  filterWHCode: FilterDescriptor = { field: "WHCode", operator: "contains", value: null }
  filterAddress: FilterDescriptor = { field: "Address", operator: "contains", value: null }
  filterPhone: FilterDescriptor = { field: "Phone", operator: "contains", value: null }
  //
  // Store
  form: UntypedFormGroup;
  Store: DTOMAStore = new DTOMAStore();
  listStore: DTOMAStore[];
  //
  // Province
  listProvince: DTOSynProvince[] = []
  currentProvince = new DTOSynProvince()
  defaultProvince = new DTOSynProvince(null, ' -- chọn -- ')
  //
  // Remove
  deleteDialogOpened: boolean = false;
  deleteManyDialogOpened: boolean = false;

  deleteList: DTOMAStore[] = []
  //
  // Selects
  allowActionDropdown = ['delete']

  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function

  onSelectCallback: Function;
  onSelectedPopupBtnCallback: Function;
  getSelectionPopupCallback: Function;
  //
  // subscription
  changePermission_sst: Subscription;
  changeModuleData_sst: Subscription;

  getListStore_sst: Subscription;
  getListProvince_sst: Subscription;

  updateStore_sst: Subscription;
  deleteStore_sst: Subscription;

  StoreCategory_sst: Subscription;
  changePermissionAPI: Subscription
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public apiService: MarStoreSystemAPIService,
    public apiSynService: EcomSynCartAPIService,
    public apiServiceStore: MarNewsProductAPIService
  ) { }

  ngOnInit(): void {
    let that = this;
    ;
    this.loadForm()
    this.loadSearchForm()
    // Sorts
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.onSortChange.bind(this);
    //
    this.changePermission_sst = this.menuService.changePermission()
      .subscribe(
        (res: DTOPermission) => {
          if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
            that.justLoaded = false
            that.actionPerm = distinct(res.ActionPermission, "ActionType")

            that.isMaster = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
            that.isCreator = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
            that.isApprover = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

            this.selectable.enabled = this.isMaster || this.isCreator
            // that.getData()
          }
        }
      )

      this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          that.getData()
        }
      })
    // Files
    this.pickFileCallback = this.pickFile.bind(this);
    this.getFolderCallback = this.getFolder.bind(this);
    //
    // Callback
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
  }
  //Kendo FORM
  loadForm() {
    this.getListProvince()
    this.getProvinceFromOrder()

    this.form = new UntypedFormGroup({
      'Code': new UntypedFormControl(this.Store.Code),
      'ShortName': new UntypedFormControl(this.Store.ShortName, Validators.required),
      'WHName': new UntypedFormControl(this.Store.WHName, Validators.required),
      'WHCode': new UntypedFormControl(this.Store.WHCode, Validators.required),
      'Address': new UntypedFormControl(this.Store.Address, Validators.required),
      'Phone': new UntypedFormControl(this.Store.Phone, Validators.required),
      'Fax': new UntypedFormControl(this.Store.Fax),//, Validators.required
      'Province': new UntypedFormControl(this.currentProvince, Validators.required),
      'ImageMap': new UntypedFormControl(this.Store.ImageMap),//, Validators.required
    })
  }

  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  getData() {
    this.loadFilter();
    this.getListStore()
  }
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = this.sortBy
    this.gridState.filter.filters = []
    this.filterSearchBox.filters = []
    //
    if (Ps_UtilObjectService.hasValueString(this.filterShortName.value))
      this.filterSearchBox.filters.push(this.filterShortName)

    if (Ps_UtilObjectService.hasValueString(this.filterWHName.value))
      this.filterSearchBox.filters.push(this.filterWHName)

    if (Ps_UtilObjectService.hasValueString(this.filterWHCode.value))
      this.filterSearchBox.filters.push(this.filterWHCode)
    //
    if (Ps_UtilObjectService.hasValueString(this.filterAddress.value))
      this.filterSearchBox.filters.push(this.filterAddress)

    if (Ps_UtilObjectService.hasValueString(this.filterPhone.value))
      this.filterSearchBox.filters.push(this.filterPhone)
    //  
    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  resetFilter() {
    this.searchForm.get('SearchQuery').setValue(null)
    this.search()
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterShortName.value = searchQuery
      this.filterWHName.value = searchQuery
      this.filterWHCode.value = searchQuery
      this.filterAddress.value = searchQuery
      this.filterPhone.value = searchQuery
    } else {
      this.filterShortName.value = null
      this.filterWHName.value = null
      this.filterWHCode.value = null
      this.filterAddress.value = null
      this.filterPhone.value = null
    }

    this.loadFilter();
    this.getListStore()
  }
  // Response Get
  getListStore() {
    this.isLoading = true;
    var ctx = 'Danh sách cửa hàng';

    this.getListStore_sst = this.apiService.GetListStore(this.gridState)
      .subscribe(
        res => {
          if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.total = res.ObjectReturn.Total
            this.listStore = res.ObjectReturn.Data;

            this.gridView.next({ data: this.listStore, total: this.total });
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

          this.isLoading = false;
        }, () => {
          this.isLoading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
        }
      );
  }
  getListProvince() {
    this.isLoading = true;

    this.getListProvince_sst = this.apiSynService.GetProvinces().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listProvince = res.ObjectReturn;
        this.listProvince.unshift(this.defaultProvince)

        if (!this.isAdd)
          this.getProvinceFromOrder()
      }
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }
  getProvinceFromOrder() {
    var province = this.listProvince.find(s => s.Code == this.Store.Province)
    this.currentProvince = province != undefined ? province : { ...this.defaultProvince }
  }
  //
  // Response Update
  onUpdateStore(item: DTOMAStore, prop?: string[]) {
    this.isLoading = true;
    var ctx = (this.isAdd ? 'Thêm' : 'Cập nhật') + ' hệ thống cửa hàng'

    item.ImageMap = Ps_UtilObjectService.getImgResHachi(item.ImageMap)

    this.updateStore_sst = this.apiService.UpdateStore(item, prop)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.isAdd = false
          this.Store = res.ObjectReturn
          this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
          this.closeForm()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

        this.getListStore()
        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
        this.getListStore()
      })
  }
  onDeleteStore(item: DTOMAStore[]) {
    this.isLoading = true;
    var ctx = 'cửa hàng';

    this.deleteStore_sst = this.apiService.DeleteStore(item).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.closeForm()
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`Đã xóa thành công ${ctx}`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)

      this.getListStore()
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi xóa ' + ctx)
      this.getListStore()
    })
  }
  //
  // Load data
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.getListStore()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.getListStore();
  }
  //
  // Save data
  onDropdownValueChange(ev, prop: string) {
    this.Store.Province = ev.ID
  }
  onUpdate() {//close: boolean
    this.form.markAllAsTouched();
    var item = this.form.getRawValue()

    if (this.form.status == 'INVALID') {
      if (!Ps_UtilObjectService.hasValueString(item.ShortName))
        this.layoutService.onError("Vui lòng nhập Tên cửa hàng")
      else if (!Ps_UtilObjectService.hasValueString(item.WHName))
        this.layoutService.onError("Vui lòng nhập Tên ngắn")
      else if (!Ps_UtilObjectService.hasValueString(item.WHCode))
        this.layoutService.onError("Vui lòng nhập Tên viết tắt")
      else if (!Ps_UtilObjectService.hasValueString(item.Address))
        this.layoutService.onError("Vui lòng nhập Địa chỉ cửa hàng")
      else if (!Ps_UtilObjectService.hasValueString(item.Phone))
        this.layoutService.onError("Vui lòng nhập Số điện thoại cửa hàng")
      else if (!Ps_UtilObjectService.hasValueString(item.Fax))
        this.layoutService.onError("Vui lòng nhập Số fax cửa hàng")
      else if (!Ps_UtilObjectService.hasValue(item.Province) || !(item.Province.Code > 0))
        this.layoutService.onError("Vui lòng chọn Tỉnh/Thành")
      else if (!Ps_UtilObjectService.hasValueString(item.ImageMap))
        this.layoutService.onError("Vui lòng chọn Hình chụp bản đồ")
    } else {
      var newStore: DTOMAStore = { ...item }
      newStore.Province = item.Province.Code
      newStore.VNProvince = item.Province.ProvinceName

      this.onUpdateStore(newStore, ['ShortName', 'WHName', 'WHCode', 'Phone', 'Fax', 'Address', 'Province', 'ImageMap'])
    }
  }
  //
  clearForm() {
    this.Store = new DTOMAStore()
    this.form.reset()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //
  // Delete
  onDeleteSelected() {
    this.onDeleteStore(this.deleteList)
    this.deleteManyDialogOpened = false
  }
  //
  // Files Upload
  getFolder(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceStore.GetFolderWithFile(childPath, 8)
  }
  pickFile(e: DTOCFFile) {
    this.form.controls.ImageMap.setValue(e?.PathFile)
    this.layoutService.setFolderDialog(false)
  }
  onUploadFile() {
    this.layoutService.folderDialogOpened = true;
  }
  onRemoveFile() {
    this.Store.ImageMap = null
    // this.onUpdateStore(this.Store, ['ImageMap'])
  }
  //UPLOAD ảnh
  onValueChangeImg(e) {
    if (!Ps_UtilObjectService.hasValueString(e)) {
      this.Store.ImageMap = null
    }
  }
  //
  checkValue(str: string) {
    return Ps_UtilObjectService.hasValueString(str)
  }
  // Select, Dropdown
  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.value == -1;
  }
  onAdd(isAdd: boolean) {
    this.isAdd = isAdd

    if (this.isAdd) {
      this.Store = new DTOMAStore()
      this.clearForm()
    }
    else
      this.loadForm()

    this.drawer.open();
  }
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMAStore) {
    this.Store = { ...dataItem }

    moreActionDropdown.forEach((s) => {
      if (s.Code == 'pencil' || s.Link == 'edit') {
        s.Actived = this.isMaster || this.isCreator
      }
      else if (s.Code == 'trash' || s.Link == 'remove') {
        s.Actived = this.isMaster || this.isCreator
      }
    })

    return moreActionDropdown
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOMAStore) {
    if (item.Code > 0) {
      this.Store = { ...item }

      if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.onAdd(false)
      }
      else if (menu.Code == "trash" || menu.Link == 'remove') {
        this.deleteDialogOpened = true
      }
    }
  }
  getSelectionPopup(selectedList: DTOMAStore[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if ((this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Name: "Xóa cửa hàng", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (btnType == "delete") {//Xóa
      this.deleteManyDialogOpened = true
      this.deleteList = []

      list.forEach(s => {
        this.deleteList.push(s)
      })
    }
  }
  //
  getRes(str) {
    return Ps_UtilObjectService.getImgResHachi(str);
  }

  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.getListStore_sst?.unsubscribe()
    this.getListProvince_sst?.unsubscribe()

    this.deleteStore_sst?.unsubscribe()
    this.updateStore_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
