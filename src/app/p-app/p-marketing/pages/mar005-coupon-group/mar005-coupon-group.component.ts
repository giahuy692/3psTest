import { DTOMACouponGroupService } from './../../shared/dto/DTOMACouponGroup.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';

import { Subject, Subscription } from 'rxjs';
import { EcomSynCartAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-syncart-api.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MarCouponGroupAPIService } from '../../shared/services/mar-coupon-group-api.service';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';

@Component({
  selector: 'app-mar005-coupon-group',
  templateUrl: './mar005-coupon-group.component.html',
  styleUrls: ['./mar005-coupon-group.component.scss']
})
export class Mar005CouponGroupComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  // load data
  isLoading: boolean = false;
  justLoaded: boolean = true;

  onSortChangeCallback: Function;
  onPageChangeCallback: Function;

  total = 0
  pageSize = 50
  pageSizes = [this.pageSize]
  listTypeData = [
    {
      Name: "Phiếu mua hàng",
      Value: 2,
      isChecked: true
    },
    {
      Name: "Coupon",
      Value: 1,
      isChecked: false
    }
  ]
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
  sortBy: SortDescriptor[] = [{ field: 'VoucherType', dir: 'asc' }];

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //
  filterTypeData: CompositeFilterDescriptor = { logic: "or", filters: [] }
  filterSearchBox: CompositeFilterDescriptor = { logic: "or", filters: [] }

  filterPrefix: FilterDescriptor = { field: "Prefix", operator: "contains", value: null }
  filterVoucherType: FilterDescriptor = { field: "VoucherType", operator: "contains", value: null }
  //
  // CouponGroup
  form: UntypedFormGroup;
  CouponGroup: DTOMACouponGroupService = new DTOMACouponGroupService();
  listCouponGroup: DTOMACouponGroupService[];

  //
  // ParentCategory
  listAllCouponGroup: DTOMACouponGroupService[] = []
  currentParentCouponGroup = new DTOMACouponGroupService()
  //
  // Remove
  deleteDialogOpened: boolean = false;
  deleteManyDialogOpened: boolean = false;

  deleteList: DTOMACouponGroupService[] = []
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

  getListCouponGroup_sst: Subscription;
  getListAllCouponGroup_sst: Subscription;

  updateCouponGroup_sst: Subscription;
  deleteCouponGroup_sst: Subscription;

  CouponGroupCategory_sst: Subscription;
  changePermissonAPI: Subscription
  //
  constructor(
    public service: MarketingService,
    public menuService: PS_HelperMenuService,
    
    public layoutService: LayoutService,
    public apiService: MarCouponGroupAPIService,
    public apiSynService: EcomSynCartAPIService,
    public apiServiceCouponGroup: MarNewsProductAPIService
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
    //
    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        that.getData()
      }
    })
    // Callback
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    //
  }
  //Kendo FORM
  loadForm() {
    this.form = new UntypedFormGroup({
      'VoucherType': new UntypedFormControl(this.CouponGroup.VoucherType, Validators.required),
      'DefaultAmount': new UntypedFormControl(this.CouponGroup.DefaultAmount),
      'Prefix': new UntypedFormControl(this.CouponGroup.Prefix),
      'ParentPrefix': new UntypedFormControl({ value: this.CouponGroup.ParentPrefix, disabled: true}),
      'Remark': new UntypedFormControl(this.CouponGroup.Remark),
      'ParentID': new UntypedFormControl(this.CouponGroup.ParentID),
      'TypeData': new UntypedFormControl(this.CouponGroup.TypeData),
    })
  }

  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  getData() {
    this.loadFilter();
    this.getListCouponGroup()
  }
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]

    this.gridState.take = this.pageSize
    this.gridState.sort = this.sortBy
    this.gridState.filter.filters = []

    this.filterTypeData.filters = []
    this.filterSearchBox.filters = []

    for (let statusItem of this.listTypeData) {
      if (statusItem.isChecked) {
        this.filterTypeData.filters.push({
          field: "TypeData",
          operator: "eq",
          value: statusItem.Value
        })
      }
    }

    if (this.filterTypeData.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterTypeData)
    }
    // Search
    if (Ps_UtilObjectService.hasValueString(this.filterPrefix.value))
      this.filterSearchBox.filters.push(this.filterPrefix)

    if (Ps_UtilObjectService.hasValueString(this.filterVoucherType.value))
      this.filterSearchBox.filters.push(this.filterVoucherType)

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
      this.filterVoucherType.value = searchQuery
      this.filterPrefix.value = searchQuery
    } else {
      this.filterVoucherType.value = null
      this.filterPrefix.value = null
    }

    this.getData();
  }
  // Response Get
  getListCouponGroup() {
    this.isLoading = true;
    var ctx = 'Danh sách phân nhóm phiếu mua hàng';

    this.getListCouponGroup_sst = this.apiService.GetListCouponGroup(this.gridState)
      .subscribe(
        res => {
          if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.total = res.ObjectReturn.Total
            this.listCouponGroup = res.ObjectReturn.Data;
            this.gridView.next({ data: this.listCouponGroup, total: this.total });
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

          this.isLoading = false;
        }, () => {
          this.isLoading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
        }
      );
  }
  getListAllCouponGroup(state: State) {
    this.isLoading = true;
    var ctx = 'Danh sách tất cả phân nhóm phiếu mua hàng';

    this.getListAllCouponGroup_sst = this.apiService.GetListAllCouponGroup(state)
      .subscribe(
        res => {
          if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.listAllCouponGroup = res.ObjectReturn.Data;
          } else
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

          this.isLoading = false;
        }, () => {
          this.isLoading = false;
          this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
        }
      );
  }
  // Response Update
  onUpdateCouponGroup(item: DTOMACouponGroupService, prop?: string[]) {
    this.isLoading = true;
    var ctx = (this.isAdd ? 'Tạo' : 'Cập nhật') + ' phân nhóm phiếu mua hàng'

    this.updateCouponGroup_sst = this.apiService.UpdateCouponGroup(item, prop)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.isAdd = false
          this.CouponGroup = res.ObjectReturn
          this.layoutService.onSuccess(`Đã cập nhật thành công ${ctx}`)
          this.getListCouponGroup()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi cập nhật ' + ctx)
      }
      )
  }
  onDeleteCouponGroup(item: DTOMACouponGroupService[]) {
    this.isLoading = true;
    var ctx = 'phân nhóm phiếu mua hàng';

    this.deleteCouponGroup_sst = this.apiService.DeleteCouponGroup(item)
      .subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.closeForm()
          this.deleteDialogOpened = false

          this.layoutService.onSuccess(`Đã xóa thành công ${ctx}`)
          this.getListCouponGroup()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)

        this.isLoading = false;
      }, () => {
        this.isLoading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi xóa ' + ctx)
      }
      )
  }
  //
  // Load data
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.getListCouponGroup()
  }
  onSortChange(e: SortDescriptor[]) {
    this.gridState.sort = e;
    this.getListCouponGroup();
  }
  getCouponGroupDropdown(TypeData: number = this.CouponGroup.TypeData) {
    let stateAllCouponGroup = {...this.gridState}
    
    stateAllCouponGroup.filter.filters = [{
      field: "TypeData",
      operator: "eq",
      value: TypeData
    }]

    this.getListAllCouponGroup(stateAllCouponGroup)
    
    this.listAllCouponGroup.forEach(e => {
      if (e.Code == this.CouponGroup.ParentID && Ps_UtilObjectService.hasValue(this.CouponGroup.ParentID)) {
        this.currentParentCouponGroup = e
        
        this.listAllCouponGroup.splice(this.listAllCouponGroup.indexOf(e), 1)
        return
      }
    });
      if (this.currentParentCouponGroup.Code != this.CouponGroup.ParentID || !Ps_UtilObjectService.hasValue(this.CouponGroup.ParentID))
        this.currentParentCouponGroup = new DTOMACouponGroupService(' -- Chọn phân nhóm cha -- ', '')
  }
  getParentVoucherType(parentID) {
    let name: string
    if (parentID != null) {
      this.listCouponGroup.forEach(e => { 
        if (e.Code == parentID)
          name = e.VoucherType
      });

      return name
    }
  }
  //
  // Save data
  onDropdownValueChange(ev, prop: string) {
    this.CouponGroup.ParentID = ev.Code
    this.CouponGroup.ParentPrefix = ev.Prefix
    // this.onUpdateCouponGroup(this.CouponGroup, [prop])
  }
  onUpdate() {//close: boolean
    this.form.markAllAsTouched();
    var item = this.form.value
    
    if (this.form.status == 'INVALID') {
      if (!Ps_UtilObjectService.hasValueString(item.VoucherType))
      this.layoutService.onError("Vui lòng nhập Tên phân nhóm phiếu mua hàng")
      else if (!Ps_UtilObjectService.hasValueString(item.Prefix))
      this.layoutService.onError("Vui lòng nhập tiếp đầu ngữ")
    } else {
      this.onUpdateCouponGroup(this.CouponGroup, Object.keys(this.CouponGroup))
    }
  }
  //
  clearForm() {
    this.CouponGroup = new DTOMACouponGroupService()
    // this.form.reset()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //
  // Delete
  onDeleteSelected() {
    this.onDeleteCouponGroup(this.deleteList)
    this.deleteManyDialogOpened = false
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
      this.getCouponGroupDropdown(2)
      // this.CouponGroup = new DTOMACouponGroupService()
      this.currentParentCouponGroup = new DTOMACouponGroupService(' -- Chọn phân nhóm cha -- ', '')
      this.clearForm()
    }
    else {
      this.getCouponGroupDropdown(2)
      this.loadForm()
    }

    this.drawer.open();
  }
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOMACouponGroupService) {
    this.CouponGroup = { ...dataItem }

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
  onActionDropdownClick(menu: MenuDataItem, item: DTOMACouponGroupService) {
    if (item.Code > 0) {
      this.CouponGroup = { ...item }

      if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.onAdd(false)
      }
      else if (menu.Code == "trash" || menu.Link == 'remove') {
        this.deleteDialogOpened = true
      }
    }
  }
  getSelectionPopup(selectedList: DTOMACouponGroupService[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if ((this.isMaster || this.isCreator))
      moreActionDropdown.push({
        Name: "Xóa phân nhóm", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })

    return moreActionDropdown
  }
  selectedBtnChange(e?: boolean, index?: number) {
    if (e != null || index != null)
      this.listTypeData[index].isChecked = e;

    this.getData()
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
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.getListCouponGroup_sst?.unsubscribe()
    this.getListAllCouponGroup_sst?.unsubscribe()

    this.deleteCouponGroup_sst?.unsubscribe()
    this.updateCouponGroup_sst?.unsubscribe()

    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
