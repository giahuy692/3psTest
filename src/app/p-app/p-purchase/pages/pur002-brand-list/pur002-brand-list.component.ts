import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PurBrandAPIService } from '../../shared/services/pur-brand-api.service';
import { DTOBrand } from '../../shared/dto/DTOBrand.dto';
import { PurService } from '../../shared/services/pur.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-pur002-brand-list',
  templateUrl: './pur002-brand-list.component.html',
  styleUrls: ['./pur002-brand-list.component.scss']
})
export class Pur002BrandListComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  isFilterActive = true

  deleteDialogOpened = false
  deleteManyDialogOpened = false
  mergeDialogOpened = false
  confirmMergeDialogOpened = false

  total = 0
  //object
  brand = new DTOBrand()
  listBrand: DTOBrand[] = []
  deleteList: DTOBrand[] = []
  mergeList: DTOBrand[] = []
  //header1
  dangSoanThao = true
  daDuyet = false
  ngungHienThi = false
  //header
  searchForm: UntypedFormGroup
  mergeForm: UntypedFormGroup
  //grid
  allowActionDropdown = ['delete']
  //GRID
  //prod
  pageSize = 25
  pageSizes = [this.pageSize]

  gridView = new Subject<any>();
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  //
  sortBy: SortDescriptor = {
    field: 'NoOfSKU', dir: 'desc'
  }
  //header1
  filterStatusID: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterDangSoanThao: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterDaDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterNgungHienThi: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  filterTraLai: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //search prod
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterVNBrand: FilterDescriptor = {
    field: "VNBrand", operator: "contains", value: null
  }
  filterEBrand: FilterDescriptor = {
    field: "EBrand", operator: "contains", value: null
  }
  filterJBrand: FilterDescriptor = {
    field: "JBrand", operator: "contains", value: null
  }
  //
  filterVNSummary: FilterDescriptor = {
    field: "VNSummary", operator: "contains", value: null
  }
  filterENSummary: FilterDescriptor = {
    field: "ENSummary", operator: "contains", value: null
  }
  filterJPSummary: FilterDescriptor = {
    field: "JPSummary", operator: "contains", value: null
  }
  //CALLBACK
  //rowItem action dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
  onFilterChangeCallback: Function
  //grid select
  getSelectionPopupCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  //select
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  GetListBrand_sst: Subscription
  UpdateBrandStatus_sst: Subscription
  MergeBrand_sst: Subscription
  DeleteBrand_sst: Subscription
  changeModuleData_sst: Subscription
  changePermission_sst: Subscription
  changePermissionAPI: Subscription

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: PurService,
    public apiService: PurBrandAPIService,
    public domSanititizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    let that = this
    
    this.loadFilter()
    this.loadSearchForm()
    this.loadMergeForm()

    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // that.GetListBrand()
      }
    })
    
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListBrand()
      }
    })

    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //dropdown
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadMergeForm() {
    this.mergeForm = new UntypedFormGroup({
      'brand_radio': new UntypedFormControl('', Validators.required),
    })
    this.mergeForm.markAllAsTouched()
  }
  //filter
  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.sort = [this.sortBy]
    this.gridState.filter.filters = []
    this.filterSearchBox.filters = []
    this.filterStatusID.filters = []
    //checkbox header 1 status id
    if (this.dangSoanThao) {
      this.filterStatusID.filters.push(this.filterDangSoanThao)
      this.filterStatusID.filters.push(this.filterTraLai)
    }

    if (this.daDuyet)
      this.filterStatusID.filters.push(this.filterDaDuyet)

    if (this.ngungHienThi)
      this.filterStatusID.filters.push(this.filterNgungHienThi)

    if (this.filterStatusID.filters.length > 0)
      this.gridState.filter.filters.push(this.filterStatusID)
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterVNBrand.value))
      this.filterSearchBox.filters.push(this.filterVNBrand)

    if (Ps_UtilObjectService.hasValueString(this.filterEBrand.value))
      this.filterSearchBox.filters.push(this.filterEBrand)

    if (Ps_UtilObjectService.hasValueString(this.filterJBrand.value))
      this.filterSearchBox.filters.push(this.filterJBrand)
    //
    if (Ps_UtilObjectService.hasValueString(this.filterVNSummary.value))
      this.filterSearchBox.filters.push(this.filterVNSummary)

    if (Ps_UtilObjectService.hasValueString(this.filterENSummary.value))
      this.filterSearchBox.filters.push(this.filterENSummary)

    if (Ps_UtilObjectService.hasValueString(this.filterJPSummary.value))
      this.filterSearchBox.filters.push(this.filterJPSummary)

    if (this.filterSearchBox.filters.length > 0)
      this.gridState.filter.filters.push(this.filterSearchBox)
  }
  //API
  GetListBrand() {
    this.loading = true;
    var ctx = 'Danh sách Thương hiệu'

    this.GetListBrand_sst = this.apiService.GetListBrand(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listBrand = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listBrand, total: this.total });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
    });
  }
  UpdateBrandStatus(items = [this.brand], statusID: number = this.brand.StatusID) {
    this.loading = true;
    var ctx = 'Cập nhật tình trạng'

    this.UpdateBrandStatus_sst = this.apiService.UpdateBrandStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListBrand()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  MergeBrand(selectItem: DTOBrand, items: DTOBrand[] = this.mergeList) {
    this.loading = true;
    var ctx = 'Merge thương hiệu'

    this.MergeBrand_sst = this.apiService.MergeBrand(items, selectItem).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.mergeDialogOpened = false
        this.confirmMergeDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListBrand()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  DeleteBrand(items = [this.brand]) {
    this.loading = true;
    var ctx = 'Xóa thương hiệu'

    this.DeleteBrand_sst = this.apiService.DeleteBrand(items).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        items.forEach(s => {
          var ex = this.listBrand.findIndex(f => f.Code == s.Code)

          if (ex != -1)
            this.listBrand.splice(ex, 1)
        })
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListBrand()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    });
  }
  ///KENDO GRID
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListBrand()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridState.sort = event
    this.GetListBrand()
  }
  //DROPDOWN popup
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem) {
    this.brand = { ...dataItem }
    var statusID = this.brand.StatusID;
    //tìm dynamic action UpdateOrderType, 
    //nếu có thì splice 1 (remove), ko thì splice 0 (insert)
    var deleteCount = moreActionDropdown.findIndex(s =>
      s.Code == 'check-outline' || s.Code == 'minus-outline') == -1 ? 0 : 1;

    var deleteCount2 = moreActionDropdown.findIndex(s =>
      s.Code == 'undo') == -1 ? 0 : 1;
    //ALBUM ko có bước Gửi duyệt
    if (statusID == 0 || statusID == 4) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2",
          Actived: this.isToanQuyen || this.isAllowedToVerify, LstChild: []
        })
      moreActionDropdown.splice(3, deleteCount2)
    }
    else if (statusID == 2) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3",
          Actived: this.isToanQuyen || this.isAllowedToVerify, LstChild: []
        })
      moreActionDropdown.splice(3, deleteCount2)
    }
    else if (statusID == 3) {
      moreActionDropdown.splice(2, deleteCount,
        {
          Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2",
          Actived: this.isToanQuyen || this.isAllowedToVerify, LstChild: []
        })
      moreActionDropdown.splice(3, deleteCount2,
        {
          Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4",
          Actived: this.isToanQuyen || this.isAllowedToVerify, LstChild: []
        })
    }
    //ALBUM cho phép EDIT sau khi Duyệt
    moreActionDropdown.forEach((s) => {
      if (s.Code == "eye" || s.Link == 'detail') {
        s.Actived = (statusID != 0 && statusID != 4 && this.isAllowedToCreate)
          || ((statusID == 0 || statusID == 4) && this.isAllowedToVerify)
      }
      else if (s.Code == 'pencil' || s.Link == 'edit') {
        s.Actived = ((statusID == 1 || statusID == 2) && (this.isToanQuyen || this.isAllowedToVerify))
          || ((statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate))
      }
      else if (s.Code == "trash" || s.Link == 'delete') {
        s.Actived = (statusID == 0 || statusID == 4) && (this.isToanQuyen || this.isAllowedToCreate)
        s.Name = "Xóa thương hiệu"
      }
    })
  }
  onActionDropdownClick(menu: MenuDataItem, item) {
    if (item.Code > 0) {
      this.brand = { ...item }

      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDelete()
      }
      else if (menu.Type == 'StatusID') {
        this.brand.StatusID = parseInt(menu.Link)
        this.UpdateBrandStatus()
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.brand = { ...item }
        this.openDetail(false)
      }
    }
  }
  //selection
  getSelectionPopup(selectedList: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    var canDuyet_canXoa = selectedList.findIndex(s => s.StatusID == 0 || s.StatusID == 4)

    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Phê duyệt", Code: "check-outline", Link: "2", Actived: true, LstChild: []
      })
    }

    var canNgung = selectedList.findIndex(s => s.StatusID == 2)

    if (canNgung != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Ngưng hiển thị", Code: "minus-outline", Link: "3", Actived: true, LstChild: []
      })
    }

    var canTra = selectedList.findIndex(s => s.StatusID == 3)

    if (canTra != -1 && (this.isToanQuyen || this.isAllowedToVerify)) {
      moreActionDropdown.push({
        Type: "StatusID", Name: "Trả về", Code: "undo", Link: "4", Actived: true, LstChild: []
      })
    }

    if (canDuyet_canXoa != -1 && (this.isToanQuyen || this.isAllowedToCreate)) {
      moreActionDropdown.push({
        Name: "Xóa thương hiệu", Type: 'delete',
        Code: "trash", Link: "delete", Actived: true, LstChild: []
      })
    }

    moreActionDropdown.push({
      Type: "merge", Name: "Merge thương hiệu", Code: "hyperlink", Link: "0", Actived: true, LstChild: []
    })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == "StatusID") {
        // if (value == 1 || value == '1')//Gửi duyệt
        //   list.forEach(s => {
        //     if (s.StatusID == 0) {
        //       s.StatusID = 1
        //       this.UpdateBrandStatus(s)
        //     }
        //   })
        // else 
        if (value == 2 || value == '2')//Phê duyệt
          list.forEach(s => {
            if (s.StatusID == 0 || s.StatusID == 3 || s.StatusID == 4) {
              s.StatusID = 2
              this.UpdateBrandStatus(s)
            }
          })
        else if (value == 4 || value == '4')//Trả về
          list.forEach(s => {
            if (s.StatusID == 3 || s.StatusID == 1) {
              s.StatusID = 4
              this.UpdateBrandStatus(s)
            }
          })
        else if (value == 3 || value == '3')//Ngưng hiển thị
          list.forEach(s => {
            if (s.StatusID == 2) {
              s.StatusID = 3
              this.UpdateBrandStatus(s)
            }
          })
      }
      else if (btnType == "delete") {//Xóa
        this.onDeleteMany()
        this.deleteList = []

        list.forEach(s => {
          if (s.StatusID == 0 || s.StatusID == 4)
            this.deleteList.push(s)
        })
      }
      else if (btnType == "merge") {//Merge
        this.mergeDialogOpened = true
        this.mergeList = []

        list.forEach(s => {
          this.mergeList.push(s)
        })
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //CLICK EVENT  
  //header 1
  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e

    this.loadFilter()
    this.GetListBrand()
  }
  openDetail(isAdd: boolean) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      if (isAdd) {
        var prom = new DTOBrand()
        this.service.setCacheBrandDetail(prom)
      } else
        this.service.setCacheBrandDetail(this.brand)
      //policy
      var parent = item.ListMenu.find(f => f.Code.includes('pur-policy')
        || f.Link.includes('pur-policy'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('brand-list')
          || f.Link.includes('brand-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('brand-detail')
            || f.Link.includes('brand-detail'))

          this.menuService.activeMenu(detail2)
        }
      }
    })
  }
  //header
  resetFilter() {
    //header
    this.searchForm.get('SearchQuery').setValue(null)
    //prod
    this.filterVNBrand.value = null
    this.filterEBrand.value = null
    this.filterJBrand.value = null

    this.filterVNSummary.value = null
    this.filterENSummary.value = null
    this.filterJPSummary.value = null

    this.loadFilter()
    this.GetListBrand()
  }
  //
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterVNBrand.value = searchQuery
      this.filterEBrand.value = searchQuery
      this.filterJBrand.value = searchQuery
      this.filterVNSummary.value = searchQuery
      this.filterENSummary.value = searchQuery
      this.filterJPSummary.value = searchQuery
    } else {
      this.filterVNBrand.value = null
      this.filterEBrand.value = null
      this.filterJBrand.value = null
      this.filterVNSummary.value = null
      this.filterENSummary.value = null
      this.filterJPSummary.value = null
    }

    this.loadFilter();
    this.GetListBrand()
  }
  //delete
  onDelete() {
    this.deleteDialogOpened = true
  }
  delete() {
    if (this.brand.Code > 0)
      this.DeleteBrand()
  }
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteBrand(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //merge
  closeMergeDialog() {
    this.mergeDialogOpened = false
  }
  closeConfirmMergeDialog() {
    this.confirmMergeDialogOpened = false
  }
  mergeBrand() {
    this.confirmMergeDialogOpened = true
  }
  confirmMerge() {
    var val = this.mergeForm.value
    var index = val.brand_radio
    var item = this.mergeList[index]

    this.MergeBrand(item, this.mergeList.filter(s => s.Code != item.Code))
  }
  // AUTO RUN
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }

  errorOccurred: boolean = false;
  getRes(str: string) {
    let a  = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred) {
      return this.getResHachi(a);
    } else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a  = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError() {
    // Thực hiện xử lý lỗi bằng cách hiển thị ảnh từ getResHachi
    this.errorOccurred = true; // Đánh dấu rằng đã xảy ra lỗi để tránh lặp lại việc xử lý khi gặp lỗi nhiều lần
  }
  ngOnDestroy(): void {
    this.GetListBrand_sst?.unsubscribe()
    this.UpdateBrandStatus_sst?.unsubscribe()
    this.MergeBrand_sst?.unsubscribe()
    this.DeleteBrand_sst?.unsubscribe()
    this.changeModuleData_sst?.unsubscribe()
    this.changePermission_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
