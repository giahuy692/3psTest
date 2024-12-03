import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State } from '@progress/kendo-data-query';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Subject, Subscription } from 'rxjs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOPurReport, DTOExportReport } from 'src/app/p-app/p-purchase/shared/dto/DTOPurReport';
import { PurService } from 'src/app/p-app/p-purchase/shared/services/pur.service';
import { PurAPIService } from 'src/app/p-app/p-purchase/shared/services/pur-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import DTOSYSModule, { DTOSYSFunction } from 'src/app/p-app/p-layout/dto/DTOSYSModule.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-mar001-report',
  templateUrl: './mar001-report.component.html',
  styleUrls: ['./mar001-report.component.scss']
})
export class Mar001ReportComponent implements OnInit, OnDestroy {
  loading = false
  isDialogOpen1 = false
  functionID = 0
  //object
  exportReport = new DTOExportReport()
  //list
  listReport: DTOPurReport[] = []
  filterListReport: DTOPurReport[] = []
  //grid
  gridDSView = new Subject<any>()
  gridDSState: State
  pageSize = 0
  //
  searchForm: UntypedFormGroup
  //callback  
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  //
  ExportReport_sst: Subscription
  GetReports_sst: Subscription
  changePermissonAPI: Subscription

  constructor(
    public layoutService: LayoutService,
    public service: PurService,
    public menuService: PS_HelperMenuService,
    public apiService: PurAPIService,) { }

  ngOnInit(): void {
    this.getLocalStorageModule()
    this.loadSearchForm()
    this.loadFilter()
    // this.p_GetReports()

    this.changePermissonAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.p_GetReports()
      }
    })

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
  }
  //load
  getLocalStorageModule() {
    var moduleApiCache: string = localStorage.getItem('ModuleAPI')
    var moduleApi = new DTOSYSModule()
    var functionApi = new DTOSYSFunction()

    if (Ps_UtilObjectService.hasValueString(moduleApiCache)) {
      moduleApi = JSON.parse(moduleApiCache)
      // functionApi = moduleApi.ListFunctions.find(s => s.DLLPackage.toLowerCase().includes('-report'))
      var findFunctionApi = moduleApi.ListGroup.find(s => s.ModuleID == 'mar-report')
      functionApi = findFunctionApi.ListFunctions.find(s => s.DLLPackage.toLowerCase() == 'mar001-report')
      this.functionID = functionApi?.Code
    }
  }
  //api
  p_GetReports() {
    if (this.functionID != 0) {
      this.loading = true

      this.GetReports_sst = this.apiService.GetReports(this.functionID).subscribe(res => {
        this.loading = false
        if (res != null) {
          this.listReport = res.ObjectReturn
          this.gridDSView.next({ data: this.listReport, total: this.listReport.length });
        }
      }, () => {
        this.loading = false
      })
    }
  }
  p_ExportReport(ex = this.exportReport) {
    this.loading = true
    var ctx = 'Xuất ra Excel'
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.ExportReport_sst = this.apiService.ExportReport(ex).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false
    })
  }
  //load  
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchQuery': new UntypedFormControl(''),
    })
  }
  loadFilter() {
    this.gridDSState = JSON.parse(JSON.stringify(this.layoutService.gridDSState))
    this.gridDSState.skip = null
    this.gridDSState.sort = null
    this.gridDSState.filter.filters = []
  }
  //action dropdown popup
  getActionDropdown(moreActionDropdown: MenuDataItem[]) {
    moreActionDropdown = [{
      Name: 'Xuất ra Excel', Code: 'excel', Actived: true, Link: 'excel'
    }]
    return moreActionDropdown
  }
  getData() {
    this.gridDSView.next({ data: this.listReport, total: this.listReport.length });
  }
  //CLICK EVENT
  //header
  resetFilter() {
    this.searchForm.get('SearchQuery').setValue(null)
    this.filterListReport = []
    this.gridDSView.next({ data: this.listReport, total: this.listReport.length });
  }
  search() {
    var val = this.searchForm.value
    var searchQuery = val.SearchQuery.toLowerCase()

    this.filterListReport = this.listReport.filter(s => s.DataID.toLowerCase().includes(searchQuery) ||
      s.DataName.toLowerCase().includes(searchQuery) || s.DataDescription.toLowerCase().includes(searchQuery))

    this.gridDSView.next({ data: this.filterListReport, total: this.filterListReport.length });
  }
  //popup
  onActionDropdownClick(menu: MenuDataItem, item: DTOPurReport) {
    this.exportReport.ID = item.Code
    this.exportReport.DataPermission = item.DataPermission

    if (item.TypePopup == 0) {
      var newEx = { ...this.exportReport }
      newEx.Paramaters = null
      this.ExportReport(newEx)
    }
    else if (item.TypePopup == 1)
      this.isDialogOpen1 = true
  }
  //dialog
  closeDialog() {
    this.exportReport = new DTOExportReport()
    this.isDialogOpen1 = false
  }
  ExportReport(ex = this.exportReport) {
    if (ex.ID > 0) {
      this.p_ExportReport(ex)
    }
  }
  ngOnDestroy(): void {
    this.ExportReport_sst?.unsubscribe()
    this.GetReports_sst?.unsubscribe()
    this.changePermissonAPI?.unsubscribe()
  }
}
