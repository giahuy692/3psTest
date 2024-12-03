import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, distinct } from '@progress/kendo-data-query';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { MatSidenav } from '@angular/material/sidenav';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOAlbum, DTOAlbumDetail } from '../../shared/dto/DTOAlbum.dto';
import DTOListProp_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOListProp_ObjReturn.dto';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarAlbumAPIService } from '../../shared/services/mar-album-api.service';
import { LogAPIService } from 'src/app/p-app/p-log/shared/services/log-api.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { MarNewsProductAPIService } from '../../shared/services/marnewsproduct-api.service';
import { EditorComponent } from '@progress/kendo-angular-editor';

@Component({
  selector: 'app-mar008-album-detail',
  templateUrl: './mar008-album-detail.component.html',
  styleUrls: ['./mar008-album-detail.component.scss']
})
export class Mar008AlbumDetailComponent implements OnInit, OnDestroy {
  loading = false
  isLockAll = false
  isFilterActive = true
  isAdd = true
  isAddDetail = true
  //dialog
  deleteDialogOpened = false
  deleteManyDialogOpened = false
  importDialogOpened = false
  excelValid = true;
  //num
  curLanguage = 1
  total = 0
  //date
  today = new Date()
  EffDate: Date = null
  //object
  album = new DTOAlbum()
  listDetail: DTOAlbumDetail[] = []
  deleteList: DTOAlbumDetail[] = []
  albumDetail = new DTOAlbumDetail()
  //dropdown
  typeDropdownList: DTOAlbum[] = []
  typeDropdown = new DTOAlbum()
  //string
  contextIndex = 1
  context = ["chủ đề", "Sản phẩm"]
  contextName = [this.album.SummaryVN, this.albumDetail.ProductName]
  //search box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterProductName: FilterDescriptor = {
    field: "ProductName", operator: "contains", value: null
  }
  filterBarcode: FilterDescriptor = {
    field: "Barcode", operator: "contains", value: null
  }
  filterPosCode: FilterDescriptor = {
    field: "PosCode", operator: "contains", value: null
  }
  //AlbumID
  filterAlbumID: FilterDescriptor = {
    field: 'AlbumID', operator: 'eq', value: this.album.Code
  }
  //grid sản phẩm
  pageSize = 25
  pageSizes = [this.pageSize]

  gridDSView = new Subject<any>();
  gridDSState: State = {
    skip: 0, take: this.pageSize,
    filter: {
      logic: 'and',
      filters: [this.filterAlbumID]
    }
  }
  //code  
  filterCode: FilterDescriptor = {
    field: 'Code', operator: 'neq', value: this.album.Code
  }
  filterIsSpecial: FilterDescriptor = {
    field: "IsSpecial", operator: "eq", value: 0
  }
  //NoOfSKU & NoOfChilds
  filterNoOfSKU_NoOfChilds: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterNoOfChilds: FilterDescriptor = {
    field: "NoOfChilds", operator: "neq", value: 0
  }
  filterNoOfSKU: FilterDescriptor = {
    field: "NoOfSKU", operator: "eq", value: 0
  }
  //grid dropdown
  gridState: State = {
    skip: 0,
    filter: {
      logic: 'and',
      filters: [this.filterCode]
    }
  }
  //form
  allowActionDropdown = ['edit', 'delete']
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  //CALLBACK
  //folder & file
  GetFolderCallback: Function
  pickFileCallback: Function
  uploadEventHandlerCallback: Function
  //rowItem action dropdown
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //grid data change
  onPageChangeCallback: Function
  onSortChangeCallback: Function
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
  //Element
  @ViewChild('drawer') drawer: MatSidenav;
  @ViewChild('myeditor') myeditor: EditorComponent;
  //permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //
  changePermission_sst: Subscription
  getCacheAlbumDetail_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcelAlbum_sst: Subscription

  GetAlbum_sst: Subscription
  GetListAlbum_sst: Subscription
  GetListAlbumDetails_sst: Subscription
  GetAlbumDetailsByBarcode_sst: Subscription

  UpdateAlbum_sst: Subscription
  UpdateAlbumStatus_sst: Subscription
  UpdateAlbumDetails_sst: Subscription

  DeleteAlbum_sst: Subscription
  DeleteAlbumDetails_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public service: MarketingService,
    public apiService: MarAlbumAPIService,
    public apiServiceLog: LogAPIService,
    public apiServiceNews: MarNewsProductAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,

    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this

    //cache
    this.changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.getCache()
      }
    })

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {        
        this.getCache()
      }
    })

    //load
    this.loadForm()
    this.loadSearchForm()
    //CALLBACK
    //file
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
    //grid data    
    this.onPageChangeCallback = this.pageChange.bind(this)
    this.onSortChangeCallback = this.sortChange.bind(this)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    //select
    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectCallback = this.selectChange.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
  }
  //load  
  getCache() {
    this.getCacheAlbumDetail_sst = this.service.getCacheAlbumDetail().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.album = res
        this.isAdd = this.album.Code == 0
      }
      else {
        this.isAdd = this.service.isAdd
      }
      this.GetListAlbum()

      if (!this.isAdd || this.album.Code != 0) {
        this.GetAlbum()
        this.loadFilter()
        this.GetListAlbumDetails()
      }
    })
  }
  //Kendo FORM
  loadForm() {
    this.form = new UntypedFormGroup({
      'Barcode': new UntypedFormControl(this.albumDetail.Barcode, Validators.required),
    })
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  //KENDO GRID
  loadFilter() {
    this.pageSizes = [...this.service.pageSizes]
    this.filterAlbumID.value = this.album.Code

    this.gridDSState = {
      take: this.pageSize,
      filter: {
        logic: 'and',
        filters: [this.filterAlbumID]
      }
    }
    this.filterSearchBox.filters = []
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterProductName.value))
      this.filterSearchBox.filters.push(this.filterProductName)

    if (Ps_UtilObjectService.hasValueString(this.filterBarcode.value))
      this.filterSearchBox.filters.push(this.filterBarcode)

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
      this.filterSearchBox.filters.push(this.filterPosCode)

    if (this.filterSearchBox.filters.length > 0)
      this.gridDSState.filter.filters.push(this.filterSearchBox)
  }
  //paging
  pageChange(event: PageChangeEvent) {
    this.gridDSState.skip = event.skip;
    this.gridDSState.take = this.pageSize = event.take
    this.GetListAlbumDetails()
  }
  sortChange(event: SortDescriptor[]) {
    this.gridDSState.sort = event
    this.GetListAlbumDetails()
  }
  //API  
  GetAlbum() {
    this.loading = true;

    this.GetAlbum_sst = this.apiService.GetAlbum(this.album.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.album = res.ObjectReturn;
        this.checkProp()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  GetListAlbum() {
    this.loading = true;
    this.filterNoOfSKU_NoOfChilds.filters = [this.filterNoOfSKU, this.filterNoOfChilds]
    this.gridState.filter.filters = [this.filterCode, this.filterIsSpecial, this.filterNoOfSKU_NoOfChilds]
    this.gridState.take = 25

    this.GetListAlbum_sst = this.apiService.GetListAlbum(this.gridState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.typeDropdownList = res.ObjectReturn.Data;
        this.checkDropdown()
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  //update
  UpdateAlbum(prop: string[], item: DTOAlbum = this.album) {
    this.loading = true;
    var ctx = (this.isAdd ? "Tạo mới" : "Cập nhật") + " chủ đề"

    if (prop.findIndex(s => s == "SummaryVN") == -1)
      prop.push('SummaryVN')

    if (prop.findIndex(s => s == "SummaryJP") == -1)
      prop.push('SummaryJP')

    if (prop.findIndex(s => s == "SummaryEN") == -1)
      prop.push('SummaryEN')

    this.UpdateAlbum_sst = this.apiService.UpdateAlbum(item, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.album = res.ObjectReturn
        this.checkProp()
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
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
  UpdateAlbumStatus(statusID: number, item: DTOAlbum[] = [this.album]) {
    this.loading = true;
    var ctx = "Cập nhật tình trạng chủ đề"

    this.UpdateAlbumStatus_sst = this.apiService.UpdateAlbumStatus(item, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.ObjectReturn != 0) {
          this.album = res.ObjectReturn
          this.checkProp()
        } else
          this.GetAlbum()

        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
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
  //
  DeleteAlbum() {
    this.loading = true;
    var ctx = "Xóa chủ đề"

    this.DeleteAlbum_sst = this.apiService.DeleteAlbum([this.album]).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.deleteDialogOpened = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.createNew()
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
  //promotion detail
  GetListAlbumDetails() {
    this.loading = true;

    this.GetListAlbumDetails_sst = this.apiService.GetListAlbumDetails(this.gridDSState).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDetail = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridDSView.next({ data: this.listDetail, total: this.total });
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  GetAlbumDetailsByBarcode() {
    this.loading = true;
    var ctx = "Tìm sản phẩm"

    this.GetAlbumDetailsByBarcode_sst = this.apiService.GetAlbumDetailsByBarcode(this.album.Code, this.albumDetail.Barcode).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.albumDetail = res.ObjectReturn;
        this.loadForm()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
    });
  }
  UpdateAlbumDetails(detail: any[] = [this.albumDetail]) {
    this.loading = true;
    this.isAddDetail = this.albumDetail.Code == 0
    var ctx = (this.isAddDetail ? "Thêm" : "Cập nhật") + " Sản phẩm"
    this.albumDetail.AlbumID = this.album.Code

    this.UpdateAlbumDetails_sst = this.apiService.UpdateAlbumDetails(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isAdd = false
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        let arr = res.ObjectReturn as DTOAlbumDetail[]

        arr.forEach(s => {
          if (this.isAddDetail) {
            this.total++
            this.listDetail.push(s)
          }
          else {
            var i = this.listDetail.findIndex(f => f.Code == s.Code)

            if (i > -1)
              this.listDetail.splice(i, 1, s)
          }
        })

        this.gridDSView.next({ data: this.listDetail, total: this.total });
        this.isAddDetail = false

        if (this.drawer.opened)
          this.closeForm()
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
  DeleteAlbumDetail(detail: any[] = [this.albumDetail]) {
    this.loading = true;
    var ctx = "Xóa Sản phẩm"
    this.albumDetail.AlbumID = this.album.Code

    this.DeleteAlbumDetails_sst = this.apiService.DeleteAlbumDetails(detail).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogOpened = false
        this.deleteManyDialogOpened = false
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()

        detail.forEach(s => {
          var i = this.listDetail.findIndex(f => f.Code == s.Code)

          if (i > -1) {
            this.total--
            this.listDetail.splice(i, 1)
          }
        })
        this.gridDSView.next({ data: this.listDetail, total: this.total });
        if (this.drawer.opened)
          this.closeForm()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListAlbum()
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
    var getfileName = "AlbumnTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.GetTemplate_sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        // this.layoutService.onError(`${ctx} thất bại`)
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, f => {
      // this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.ImportExcelAlbum_sst = this.apiServiceLog.ImportExcelAlbum(file, 0, this.album.Code).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListAlbumDetails()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        const arr = res.ObjectReturn as DTOListProp_ObjReturn[]
        let importComponent = this.layoutService.getImportDialogComponent()
        //set key để map list data vả list property
        // importComponent.rowKey = 'Barcode'
        //list data để hiện lên popup
        // importComponent.errorRows = arr.map(s => s.ObjReturn)
        //list property để báo lỗi bằng css
        // importComponent.errorCellsOfRow = arr.map(s => ({
        //   ListProperties: s.ListProperties, RowKey: (s.ObjReturn as DTOAlbumDetail).Barcode
        // }))

        // importComponent.diCustomGridRef.autoFitColumns()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        importComponent.importGridDSView.next({ data: arr, total: arr.length })
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
  }
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceNews.GetFolderWithFile(childPath, 10)
  }
  //CLICK EVENT
  //header1
  updatePromotionStatus(statusID: number) {
    var newPro = { ...this.album }
    newPro.StatusID = statusID
    //check trước khi áp dụng
    if (newPro.StatusID == 1 || newPro.StatusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(newPro.AlbumNameVN))
        this.layoutService.onError('Vui lòng nhập Tên chủ đề')
      else if (!Ps_UtilObjectService.hasValueString(newPro.SummaryVN))
        this.layoutService.onError('Vui lòng nhập Mô tả chủ đề')
      else if (!Ps_UtilObjectService.hasValue(newPro.ParentID) && newPro.ParentID > 0)
        this.layoutService.onError('Vui lòng nhập Phân nhóm')
      else if (!Ps_UtilObjectService.hasValueString(newPro.ImgSetting))
        this.layoutService.onError('Vui lòng chọn Hình ảnh')

      else if (this.listDetail.length == 0)
        this.layoutService.onError('Vui lòng Thêm Sản phẩm Đổi giá')
      else
        this.UpdateAlbumStatus(statusID, [newPro])
    }
    else
      this.UpdateAlbumStatus(statusID, [newPro])
  }
  createNew() {
    //object
    this.album = new DTOAlbum()
    this.albumDetail = new DTOAlbumDetail()
    //array
    this.listDetail = []
    this.gridDSView.next({ data: [], total: 0 })
    //bool
    this.isLockAll = false
    this.isFilterActive = true
    this.isAdd = true
    this.isAddDetail = true
    //num
    this.total = 0
    //date
    this.today = new Date()
    this.EffDate = null
  }
  //header
  downloadExcel() {
    this.p_DownloadExcel()
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  onAdd() {
    this.isAddDetail = true;
    this.clearForm()
    this.drawer.open();
  }
  //body
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  onDropdownlistClick(e, dropdownName: string) {
    if (dropdownName == 'ParentID') {
      this.typeDropdown = e
      this.album.ParentID = this.typeDropdown.Code
      this.album.ParentName = this.typeDropdown.AlbumNameVN
      this.UpdateAlbum(['ParentID', 'ParentName'], this.album)
    }
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery

    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterProductName.value = searchQuery
      this.filterBarcode.value = searchQuery
      this.filterPosCode.value = searchQuery
    } else {
      this.filterProductName.value = null
      this.filterBarcode.value = null
      this.filterPosCode.value = null
    }

    this.loadFilter();
    this.GetListAlbumDetails()
  }
  onEdit(obj: DTOAlbumDetail) {
    this.isAddDetail = false
    this.albumDetail = { ...obj }
    this.loadForm()
    this.drawer.open();
  }
  onDelete() {
    this.contextIndex = 0
    this.contextName[this.contextIndex] = this.album.AlbumNameVN
    this.deleteDialogOpened = true
  }
  onDeleteDetail(obj: DTOAlbumDetail = this.albumDetail) {
    this.contextIndex = 1
    this.albumDetail = { ...obj };
    this.contextName[this.contextIndex] = this.albumDetail.ProductName
    this.deleteDialogOpened = true
  }
  //FORM button
  onSubmit(): void {
    this.form.markAllAsTouched()

    if (this.form.valid) {
      var val: DTOAlbumDetail = this.form.getRawValue()
      // this.albumDetail.StatusID = val.StatusID
      this.UpdateAlbumDetails()
    }
    else
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
  }
  clearForm() {
    this.form.reset()
    this.albumDetail = new DTOAlbumDetail()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //POPUP
  //action dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: DTOAlbumDetail) {
    // var item: DTOAlbumDetail = dataItem
    // var statusID = item.StatusID;

    moreActionDropdown.forEach((s) => {
      if (s.Code == "eye" || s.Link == 'detail') {
        s.Actived = this.album.StatusID == 2 || this.album.StatusID == 3
      }
      else if (s.Code == 'pencil' || s.Link == 'edit') {
        s.Actived = this.album.StatusID != 2 && this.album.StatusID != 3
      }
      else if (s.Code == "trash" || s.Link == 'delete') {
        s.Actived = this.album.StatusID != 2 && this.album.StatusID != 3
        s.Name = "Xóa sản phẩm"
      }
    })
  }
  onActionDropdownClick(menu: MenuDataItem, item: DTOAlbumDetail) {
    if (item.Code > 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.onDeleteDetail(item)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil'
        || menu.Code == "eye" || menu.Link == 'detail') {
        this.onEdit(item)
      }
    }
  }
  //selection 
  getSelectionPopup(selectedList: DTOAlbumDetail[]) {
    var moreActionDropdown = new Array<MenuDataItem>()

    if (!this.isLockAll && this.album.StatusID != 2 && this.album.StatusID != 3)
      moreActionDropdown.push({
        Name: "Xóa sản phẩm", Type: "delete",
        Code: "trash", Link: "delete", Actived: true
      })

    return moreActionDropdown
  }
  onSelectedPopupBtnClick(btnType: string, list: DTOAlbumDetail[], value: any) {
    if (list.length > 0) {
      if (btnType == "delete" && !this.isLockAll) {
        // if (this.album.StatusID == 0) {
        this.onDeleteMany()
        this.deleteList = []

        list.forEach(s => {
          // if (s.StatusID == 2)
          this.deleteList.push(s)
        })
        // }
      }
    }
  }
  selectChange(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }
  //DIALOG button
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  delete() {
    if (this.contextIndex == 0)
      this.DeleteAlbum()
    else if (this.contextIndex == 1)
      this.DeleteAlbumDetail()
  }
  //delete many
  onDeleteMany() {
    this.deleteManyDialogOpened = true
  }
  deleteMany() {
    this.DeleteAlbumDetail(this.deleteList)
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false
  }
  //AUTORUN
  checkProp() {
    this.isLockAll = //this.album.StatusID == 2 || this.album.StatusID == 3 || 
      (this.album.StatusID != 0 && this.album.StatusID != 4 && this.isAllowedToCreate)//khóa khi gửi, duyệt, ngưng nếu ko có quyền duyệt
      || ((this.album.StatusID == 0 || this.album.StatusID == 4) && this.isAllowedToVerify)//khóa khi tạo, trả nếu có quyền duyệt

    this.selectable.enabled = this.album.StatusID != 2 && this.album.StatusID != 3
    this.checkDropdown()
  }
  checkDropdown() {
    this.typeDropdown = this.typeDropdownList.find(s => s.Code == this.album.ParentID)
  }
  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }
  pickFile(e: DTOCFFile, width, height) {
    this.album.ImgSetting = e?.PathFile.replace('~', '')
    this.UpdateAlbum(['ImgSetting'])
    this.layoutService.setFolderDialog(false)
  }
  onTextboxLoseFocus(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        case 'Barcode':
          if (this.drawer.opened && Ps_UtilObjectService.hasValueString(this.albumDetail.Barcode))
            this.GetAlbumDetailsByBarcode()
          break
        default:
          this.UpdateAlbum([prop])
          break
      }
    }
  }
  onEditorValueChange(val) {
    switch (this.curLanguage) {
      case 1:
        this.album.SummaryVN = val
        break;
      case 2:
        this.album.SummaryJP = val
        break;
      default:
        this.album.SummaryEN = val
        break;
    }
  }
  saveWebContent() {
    this.UpdateAlbum(['SummaryVN', 'SummaryEN', 'SummaryJP'])
  }
  onDatepickerChange(prop: string, item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.album[prop] = this[prop]
      this.UpdateAlbum([prop])
    }
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  ngOnDestroy(): void {
    this.changePermission_sst?.unsubscribe()
    this.getCacheAlbumDetail_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelAlbum_sst?.unsubscribe()

    this.GetAlbum_sst?.unsubscribe()
    this.GetListAlbum_sst?.unsubscribe()
    this.GetListAlbumDetails_sst?.unsubscribe()
    this.GetAlbumDetailsByBarcode_sst?.unsubscribe()

    this.UpdateAlbum_sst?.unsubscribe()
    this.UpdateAlbumStatus_sst?.unsubscribe()
    this.UpdateAlbumDetails_sst?.unsubscribe()

    this.DeleteAlbum_sst?.unsubscribe()
    this.DeleteAlbumDetails_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
