import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { State } from '@progress/kendo-data-query';

import { PurService } from '../../shared/services/pur.service';
import { PurAPIService } from '../../shared/services/pur-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Subject, Subscription } from 'rxjs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOPurReport } from '../../shared/dto/DTOPurReport';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import DTOSYSModule, { DTOSYSFunction } from 'src/app/p-app/p-layout/dto/DTOSYSModule.dto';
import { ConfigAPIService } from 'src/app/p-app/p-config/shared/services/config-api.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-pur001-report-import',
  templateUrl: './pur001-report-import.component.html',
  styleUrls: ['./pur001-report-import.component.scss']
})
export class Pur001ReportImportComponent implements OnInit, OnDestroy {
  loading = false
  excelValid = true;
  isDialogOpen1 = false
  importDialogOpened = false

  filecode = 0
  filename = ''
  functionID = 0
  dataID: string = ""
  //object
  // exportReport = new DTOExportReport()
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
  uploadEventHandlerCallback: Function
  //
  GetReports_sst: Subscription
  GetTemplate_sst: Subscription
  ImportExcelWithFunctionID_sst: Subscription
  ExportReport_sst: Subscription
  changePermissionAPI: Subscription

  constructor(
    
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public service: PurService,
    public apiService: PurAPIService,
    public menuService: PS_HelperMenuService,
    public apiConfigService: ConfigAPIService
  ) { }

  ngOnInit(): void {
    
    this.getLocalStorageModule()
    this.loadSearchForm()
    this.loadFilter()
    // this.p_GetReports()

    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.p_GetReports()
      }
    })

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
  }
  //load
  getLocalStorageModule() {
    var moduleApiCache: string = localStorage.getItem('ModuleAPI')
    var moduleApi = new DTOSYSModule()
    var functionApi = new DTOSYSFunction()

    if (Ps_UtilObjectService.hasValueString(moduleApiCache)) {
      moduleApi = JSON.parse(moduleApiCache)
      // functionApi = moduleApi.ListFunctions.find(s => s.DLLPackage.toLowerCase().includes('-report-import'))
      var findFunctionApi = moduleApi.ListGroup.find(s => s.ModuleID == 'pur-policy')
      functionApi = findFunctionApi.ListFunctions.find(s => s.DLLPackage.toLowerCase() == 'pur001-report-import')
      this.functionID = functionApi?.Code
    }
  }
  //api
  p_GetReports() {
    if (this.functionID != 0) {
      this.loading = true

      this.GetReports_sst = this.apiService.GetReports(this.functionID).subscribe(res => {
        if (res != null) {
          this.listReport = res.ObjectReturn
          this.gridDSView.next({ data: this.listReport, total: this.listReport.length });
        }
        this.loading = false
      }, () => {
        this.loading = false
      })
    }
  }
  p_GetTemplateExcel() {
    this.loading = true
    var ctx = "Download Excel Template"

    if (Ps_UtilObjectService.hasValueString(this.filename)) {
      this.layoutService.onInfo(`Đang xử lý ${ctx}`)

      this.GetTemplate_sst = this.layoutApiService.GetTemplate(this.filename).subscribe(res => {
        if (res != null) {
          Ps_UtilObjectService.getFile(res)
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
  }
  p_ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"
    
    if (this.filecode > 0)
      this.ImportExcelWithFunctionID_sst = this.layoutApiService.ImportExcelWithFunctionID(file, this.filecode).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.layoutService.setImportDialogMode(1)
          this.layoutService.setImportDialog(false)
          this.layoutService.getImportDialogComponent().inputBtnDisplay()
        }
        else {
           this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
        this.loading = false;
      }, () => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
        this.loading = false;
      })
  }

  // callApiBasedOnDataID(file: File) {
  //   if (this.filecode > 0) {
  //     switch (this.dataID) {
  //       case "P002":
  //         return this.layoutApiService.ImportExcelWithFunctionID(file, this.filecode);
  //       case "P005":
  //         return this.apiConfigService.ImportExcelProduct2(file);
  //       default:
  //         this.layoutService.onError("DataID không hợp lệ:" + this.dataID);
  //         return null;
  //     }
  //   }
  // }

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
      Name: 'Download Template', Code: 'excel', Actived: true, Link: 'download'
    },
    {
      Name: 'Import Excel', Code: 'excel', Actived: true, Link: 'import'
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
  onActionDropdownClick(menu: MenuDataItem, item: any) {
    // this.exportReport.ID = item.Code
    this.filecode = item.Code
    this.filename = item.Config
    this.dataID = item.DataID
    // if (item.TypePopup == 0) {
    // this.exportReport.Paramaters = null
    // this.ExportReport()
    // }
    // else if (item.TypePopup == 1)
    //   this.isDialogOpen1 = true

    if (menu.Link == 'download')
      this.p_GetTemplateExcel()
    else if (menu.Link == 'import')
      this.onImportExcel()
  }
  //dialog
  closeDialog() {
    // this.exportReport = new DTOExportReport()
    this.isDialogOpen1 = false
  }
  ExportReport() {
    // if (this.exportReport.ID > 0) {
    // this.p_ExportReport()
    // }
  }
  onImportExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  uploadEventHandler(e: File) {
    this.p_ImportExcel(e)
  }
  ngOnDestroy(): void {
    this.GetReports_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()
    this.ImportExcelWithFunctionID_sst?.unsubscribe()
    this.ExportReport_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
