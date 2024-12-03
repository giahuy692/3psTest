import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject, Subscription } from 'rxjs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOExportReport } from 'src/app/p-app/p-purchase/shared/dto/DTOPurReport';
import DTOSYSModule, { DTOSYSFunction } from 'src/app/p-app/p-layout/dto/DTOSYSModule.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { EcomService } from '../../shared/services/ecom.service';
import { EcomAPIService } from '../../shared/services/ecom-api.service';
import { DTODeadLink } from '../../shared/dto/DTODeadLink';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-ecom005-dead-link',
  templateUrl: './ecom005-dead-link.component.html',
  styleUrls: ['./ecom005-dead-link.component.scss']
})
export class Ecom005DeadLinkComponent implements OnInit, OnDestroy {
  loading = false
  isAdd = true
  excelValid = true;
  isFilterActive = true
  sanPham_checked = false
  baiViet_checked = true
  //dialog
  deleteDialogOpened = false
  //
  functionID = 0
  total = 0
  //object
  curDeadLink = new DTODeadLink()
  exportReport = new DTOExportReport()
  //list
  listDeadLink: DTODeadLink[] = []
  listDeleteDeadLink: DTODeadLink[] = []
  //grid
  gridDSView = new Subject<any>()
  gridDSState: State
  pageSize = 20
  pageSizes = [this.pageSize]
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
  allowActionDropdown = ['edit', 'delete']
  ////filter
  ///header1
  filterTypeOfDeadLink: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterTypeOfDeadLink_SanPham: FilterDescriptor = {
    field: "TypeOfDeadLink", operator: "eq", value: 1
  }
  filterTypeOfDeadLink_BaiViet: FilterDescriptor = {
    field: "TypeOfDeadLink", operator: "eq", value: 0
  }
  //header2
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterDescription: FilterDescriptor = {
    field: "Description", operator: "contains", value: null
  }
  filterNewLink: FilterDescriptor = {
    field: "NewLink", operator: "contains", value: null
  }
  filterOldLink: FilterDescriptor = {
    field: "OldLink", operator: "contains", value: null
  }
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  //callback  
  onPageChangeCallback: Function
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  uploadEventHandlerCallback: Function
  //SUB
  ImportDeadLink_sst: Subscription
  GetTemplate_sst: Subscription
  GetListDeadLink_sst: Subscription
  UpdateDeadLink_sst: Subscription
  DeleteDeadLink_sst: Subscription
  changePermissionAPI: Subscription

  constructor(
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: EcomService,
    public menuService: PS_HelperMenuService,
    public apiService: EcomAPIService,) { }

  ngOnInit(): void {
    this.getLocalStorageModule()
    this.loadSearchForm()
    this.loadForm()
    //
    this.loadFilter()
    // this.GetListDeadLink()
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListDeadLink()
			}
		})
    //callback
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  ngOnDestroy(): void {
    this.ImportDeadLink_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.GetListDeadLink_sst?.unsubscribe()
    this.UpdateDeadLink_sst?.unsubscribe()
    this.DeleteDeadLink_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
  //load
  getLocalStorageModule() {
    var moduleApiCache: string = localStorage.getItem('ModuleAPI')
    var moduleApi = new DTOSYSModule()
    var functionApi = new DTOSYSFunction()

    if (Ps_UtilObjectService.hasValueString(moduleApiCache)) {
      moduleApi = JSON.parse(moduleApiCache)
      functionApi = moduleApi.ListFunctions.find(s => s.DLLPackage.toLowerCase().includes('-report'))
      this.functionID = functionApi?.Code
    }
  }
  //api
  GetListDeadLink() {
    if (this.functionID != 0) {
      this.loading = true

      this.GetListDeadLink_sst = this.apiService.GetListDeadLink(this.gridDSState).subscribe(res => {
        if (res != null && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.listDeadLink = res.ObjectReturn.Data
          this.total = res.ObjectReturn.Total
          this.gridDSView.next({ data: this.listDeadLink, total: this.total });
        }
        this.loading = false
      }, () => {
        this.loading = false
      })
    }
  }
  UpdateDeadLink(deadlink: DTODeadLink = this.curDeadLink) {
    this.loading = true;
    var ctx = (this.isAdd ? "Thêm mới" : "Cập nhật") + " đường dẫn"

    this.UpdateDeadLink_sst = this.apiService.UpdateDeadLink(deadlink).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (this.isAdd || deadlink.Code == 0) {
          if (this.sanPham_checked && deadlink.TypeOfDeadLink == 1)
            this.listDeadLink.push(res.ObjectReturn)
          else if (this.baiViet_checked && deadlink.TypeOfDeadLink == 0)
            this.listDeadLink.push(res.ObjectReturn)

          this.total++
          this.gridDSView.next({ data: this.listDeadLink, total: this.total });
        }
        else {
          let index = this.listDeadLink.findIndex(s => s.Code == deadlink.Code)

          if (index > -1) {
            this.listDeadLink[index] = deadlink
            this.gridDSView.next({ data: this.listDeadLink, total: this.total });
          }
        }

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.isAdd = false
        this.drawer.close()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  DeleteDeadLink(deadlinks: DTODeadLink[] = this.listDeleteDeadLink) {
    this.loading = true;
    var ctx = "Hủy mapping link"

    this.DeleteDeadLink_sst = this.apiService.DeleteDeadLink(deadlinks).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        deadlinks.forEach(deadlink => {
          let index = this.listDeadLink.findIndex(s => s.Code == deadlink.Code)

          if (index > -1) {
            this.listDeadLink.splice(index, 1)
            this.total--
          }
        });

        this.listDeleteDeadLink = []
        this.gridDSView.next({ data: this.listDeadLink, total: this.total });
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //file
  p_DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "DeadlinkTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.ImportDeadLink_sst = this.apiService.ImportDeadLink(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListDeadLink()
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
  }
  //grid  
  loadFilter() {
    this.gridDSState = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState.sort = null
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []
    this.filterTypeOfDeadLink.filters = []
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterDescription.value))
      this.filterSearchBox.filters.push(this.filterDescription)

    if (Ps_UtilObjectService.hasValueString(this.filterNewLink.value))
      this.filterSearchBox.filters.push(this.filterNewLink)

    if (Ps_UtilObjectService.hasValueString(this.filterOldLink.value))
      this.filterSearchBox.filters.push(this.filterOldLink)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
    //checkbox header 1
    if (this.sanPham_checked)
      this.filterTypeOfDeadLink.filters.push(this.filterTypeOfDeadLink_SanPham)

    if (this.baiViet_checked)
      this.filterTypeOfDeadLink.filters.push(this.filterTypeOfDeadLink_BaiViet)

    if (this.filterTypeOfDeadLink.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterTypeOfDeadLink)
  }
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListDeadLink()
  }
  //kendo form
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadForm() {
    this.form = new UntypedFormGroup({
      'Code': new UntypedFormControl(this.curDeadLink.Code, Validators.required),
      'Description': new UntypedFormControl(this.curDeadLink.Description, Validators.required),
      'NewLink': new UntypedFormControl(this.curDeadLink.NewLink, Validators.required),
      'OldLink': new UntypedFormControl(this.curDeadLink.OldLink, Validators.required),
      'TypeOfDeadLink': new UntypedFormControl(this.curDeadLink.TypeOfDeadLink, Validators.required),
    })
  }
  //action dropdown popup
  getActionDropdown(moreActionDropdown: MenuDataItem[]) {
    moreActionDropdown = [{
      Name: 'Xuất ra Excel', Code: 'excel', Actived: true, Link: 'excel'
    }]
    return moreActionDropdown
  }
  //CLICK EVENT
  //header 1  
  selectedBtnChange(e, str) {
    if (str == 'sanPham_btn') {
      this.sanPham_checked = e
    } else if (str == 'baiViet_btn') {
      this.baiViet_checked = e
    }
    this.loadFilter()
    this.GetListDeadLink()
  }
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  //
  onAdd() {
    this.isAdd = true;
    this.clearForm()
    this.curDeadLink = new DTODeadLink()
    this.loadForm()
    this.drawer.open();
  }
  onEdit(obj: DTODeadLink) {
    this.isAdd = false
    this.curDeadLink = { ...obj }
    this.loadForm()
    this.drawer.open();
  }
  //header 2
  resetFilter() {
    //header1
    this.sanPham_checked = false
    this.baiViet_checked = true
    //header2
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterDescription.value = null
    this.filterNewLink.value = null
    this.filterOldLink.value = null
    //
    this.loadFilter()
    this.GetListDeadLink()
  }
  search() {
    var val = this.searchForm.value
    var que = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(que)) {
      this.filterDescription.value = que;
      this.filterNewLink.value = que;
      this.filterOldLink.value = que;
    } else {
      this.filterDescription.value = null;
      this.filterNewLink.value = null;
      this.filterOldLink.value = null;
    }

    this.loadFilter();
    this.GetListDeadLink()
  }
  //form
  onSubmit(): void {
    this.form.markAllAsTouched()

    if (this.form.valid) {
      var val: DTODeadLink = this.form.getRawValue()
      this.UpdateDeadLink(val)
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearForm() {
    this.curDeadLink = new DTODeadLink()
    this.form.reset()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //selection 
  getSelectionPopup(selectedList: DTODeadLink[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    moreActionDropdown.push({
      Name: "Hủy mapping link", Type: "delete",
      Code: "trash", Link: "delete", Actived: true
    })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTODeadLink[], value: any) {
    if (list.length > 0) {
      if (btnType == "delete") {
        this.listDeleteDeadLink = []

        list.forEach(s => {
          this.listDeleteDeadLink.push(s)
        })

        if (this.listDeleteDeadLink.length > 0)
          this.DeleteDeadLink()
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //popup
  onActionDropdownClick(menu: MenuDataItem, item: DTODeadLink) {
    if (menu.Link == 'edit' || menu.Code == 'pencil') {
      this.onEdit(item)
    }
    else if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.curDeadLink = item;
      this.listDeleteDeadLink = [this.curDeadLink]
      this.deleteDialogOpened = true
    }
  }
  //dialog
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    this.DeleteDeadLink()
  }
  //    
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
}
