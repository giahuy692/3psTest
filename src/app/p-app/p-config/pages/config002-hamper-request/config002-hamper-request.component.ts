import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { from, Subject, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigHamperApiService } from '../../shared/services/config-hamper-api.service';
import { DTOHamperRequest } from '../../shared/dto/DTOConfHamperRequest';

@Component({
  selector: 'app-config002-hamper-request',
  templateUrl: './config002-hamper-request.component.html',
  styleUrls: ['./config002-hamper-request.component.scss']
})
export class Config002HamperRequestComponent implements OnInit, OnDestroy {


  //common variable
  dangSoanThao_checked: boolean = true
  guiDuyet_checked: boolean = true
  daDuyet_checked: boolean = false
  NgungApDung_checked: boolean = false
  isFilterActive: boolean = true
  excelValid: boolean = true
  opened: boolean = false

  //object
  Hamper = new DTOHamperRequest()
  ListHamper: DTOHamperRequest[] = []

  // permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  loading: boolean = false
  total: number = 0;
  tempSearch: string;

  //
  placeholder = 'Tìm theo barcode, tên hamper, sản phẩm thuộc hamper'

  //grid
  gridView = new Subject<any>();
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  sortByLastModifiedTime: SortDescriptor = {
    field: 'LastModifiedTime',
    dir: 'desc'
  }
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
    sort: [this.sortByLastModifiedTime]
  }
  //CallBack
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  onPageChangeCallback: Function

  //  
  uploadEventHandlerCallback: Function
  arrUnsubscribe: Subscription[] = [];


  //filter
  //status
  filterStatus: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterStatus_dangSoanThao: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 0
  }
  filterStatus_guiDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 1
  }
  filterStatus_daDuyet: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 2
  }
  filterStatus_Ngung: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 3
  }
  filterStatus_TraVe: FilterDescriptor = {
    field: "StatusID", operator: "eq", value: 4
  }
  //search Box
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };

  constructor(
    public menuService: PS_HelperMenuService,
    public apiService: ConfigHamperApiService,
    public layoutService: LayoutService,
  ) { }


  ngOnInit(): void {
    let that = this

    let ChangePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        
        this.loadFilter()
        // this.GetListHamperRequest()
      }
    })
    
    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListHamperRequest()
      }
    })

    this.arrUnsubscribe.push(ChangePermission_sst, changePermissionAPI)
    this.onPageChangeCallback = this.pageChange.bind(this)
    //dropdown
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
  }

  //Api
  GetListHamperRequest() {
    this.loading = true;

    let GetListHamperRequest_sst = this.apiService.GetListHamperRequest(this.gridState, null, this.tempSearch).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListHamper = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total;
        this.gridView.next({ data: this.ListHamper, total: this.total })
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi : ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi kết nối với máy chủ: ${error} `)
    })
    this.arrUnsubscribe.push(GetListHamperRequest_sst)

  }

  UpdateHamperStatus(items: DTOHamperRequest[] = [this.Hamper], statusID = this.Hamper.StatusID) {
    this.loading = true
    var ctx = 'Cập nhật tình trạng'

    let UpdateHamperRecommendedStatus_sst = this.apiService.UpdateProductStatus(items, statusID).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.GetListHamperRequest()
      } else{
        this.GetListHamperRequest()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }

      this.loading = false;
    }, () => {
      this.loading = false;
      this.GetListHamperRequest()
      this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
    }
    )
    this.arrUnsubscribe.push(UpdateHamperRecommendedStatus_sst)
  }

  DeleteHamperRequest(code: number) {
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi xóa Hamper`
    let DeleteHamper = this.apiService.DeleteHamperRequest(code).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess('Xóa Hamper thành công');
        this.loading = false;
      } else
        this.layoutService.onError(`${ctx}: Hamper này đã được áp dụng vào công ty!`)
      this.GetListHamperRequest()
    },
      (error) => {
        this.layoutService.onError(`${ctx}: ${error}`);
        this.GetListHamperRequest()
        this.loading = false;
      }
    );
    this.arrUnsubscribe.push(DeleteHamper);
  }

  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcel_sst = this.apiService.ImportExcel(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListHamperRequest()
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
    this.arrUnsubscribe.push(ImportExcel_sst)

  }

  //end Api

  loadFilter() {
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize
    this.gridState.filter.filters = []

    this.filterStatus.filters = []

    //status
    if (this.dangSoanThao_checked) {
      this.filterStatus.filters.push(this.filterStatus_dangSoanThao)
      this.filterStatus.filters.push(this.filterStatus_TraVe)
    }

    if (this.guiDuyet_checked) {
      this.filterStatus.filters.push(this.filterStatus_guiDuyet)
    }

    if (this.daDuyet_checked) {
      this.filterStatus.filters.push(this.filterStatus_daDuyet)
    }

    if (this.NgungApDung_checked) {
      this.filterStatus.filters.push(this.filterStatus_Ngung)
    }

    if (this.filterStatus.filters.length > 0) {
      this.gridState.filter.filters.push(this.filterStatus)
    }

    // if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
    //   if (this.tempSearch[0].value != '') {
    // this.gridState.filter.filters.push(this.filterSearchBox);
    // }
    // }
  }

  loadPage() {
    this.resetFilter()
  }

  selectedBtnChange(e, strCheck: string) {
    this[strCheck] = e
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListHamperRequest()
  }

  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  downloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "HamperTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let GetTemplate_sst = this.apiService.GetTemplate(getfilename).subscribe(res => {
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
    this.arrUnsubscribe.push(GetTemplate_sst)
  }

  openDetail(isAdd: boolean) {

    let changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      this.apiService.isAdd = isAdd
      var parent = item.ListMenu.find(f => f.Link.includes('config/config002-hamper-request'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('config002-hamper-request') || f.Link.includes('config002-hamper-request'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('config002-hamper-request-detail') || f.Link.includes('config002-hamper-request-detail'))
          if (isAdd) {
            var prom = new DTOHamperRequest()
            localStorage.setItem("Hamper", JSON.stringify({ ...prom, TypeData: 4 }))
          }
          else {
            localStorage.setItem("Hamper", JSON.stringify(this.Hamper))
          }
          this.menuService.activeMenu(detail2)
        }
      }
    })
    this.arrUnsubscribe.push(changeModuleData_sst)
  }

  resetFilter() {
    this.tempSearch = ""
    this.dangSoanThao_checked = true
    this.guiDuyet_checked = true
    this.daDuyet_checked = false
    this.NgungApDung_checked = false
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListHamperRequest()
  }

  handleSearch(event: string) {
    this.tempSearch = event;
    this.gridState.skip = 0
    this.loadFilter();
    this.GetListHamperRequest()
  }

  pageChange(event: PageChangeEvent) {
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListHamperRequest()
  }

  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    this.Hamper = { ...dataItem }
    var statusID = this.Hamper.StatusID;
    moreActionDropdown = []

    if (statusID == 0 || statusID == 4) {
      if (this.isToanQuyen || this.isAllowedToCreate) {
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
        moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Link: "1", Type: "StatusID", Actived: true })
        if (statusID == 0) {
          moreActionDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })
        }
      } else {
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })
      }
    }
    if (statusID == 1) {
      if (this.isToanQuyen || this.isAllowedToVerify){
          moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
          moreActionDropdown.push({ Name: "Trả về", Code: "undo", Link: "4", Type: "StatusID", Actived: true })
          moreActionDropdown.push({ Name: "Phê duyệt ", Code: "check-outline", Link: "2", Type: "StatusID", Actived: true })
      } else {
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })
      }
    }
    if (statusID == 2) {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true }) 
      if(this.isAllowedToVerify || this.isToanQuyen){
        moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Link: "3", Type: "StatusID", Actived: true })
      } 
    }
    if (statusID == 3) {
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "Detail", Actived: true })
      if(this.isAllowedToVerify || this.isToanQuyen){
        moreActionDropdown.push({ Name: "Phê duyệt ", Code: "check-outline", Link: "2", Type: "StatusID", Actived: true })  
        moreActionDropdown.push({ Name: "Trả về", Code: "undo", Link: "4", Type: "StatusID", Actived: true })
      } 
    }
    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: any) {
    if (item.Code != 0) {
      if (menu.Type == 'StatusID') {
        this.Hamper = { ...item }
        this.Hamper.StatusID = parseInt(menu.Link)

        this.UpdateHamperStatus([this.Hamper], this.Hamper.StatusID)
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        this.Hamper = { ...item }
        this.openDetail(false)
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.opened = true
      }
    }
  }
  onCloseDialog() {
    this.opened = false;
  }

  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.DeleteHamperRequest(this.Hamper.Code)
      this.opened = false;
    } else {
      this.opened = false;
    }
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.map(s => {
      s?.unsubscribe();
    });
  }
}
