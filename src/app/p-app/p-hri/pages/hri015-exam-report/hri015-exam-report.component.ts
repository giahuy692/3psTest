import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { State, CompositeFilterDescriptor, FilterDescriptor, distinct } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import DTOSYSModule, { DTOSYSFunction } from 'src/app/p-app/p-layout/dto/DTOSYSModule.dto';
import { PurAPIService } from 'src/app/p-app/p-purchase/shared/services/pur-api.service';
import { DTOPurReport } from 'src/app/p-app/p-purchase/shared/dto/DTOPurReport';



@Component({
  selector: 'app-hri015-exam-report',
  templateUrl: './hri015-exam-report.component.html',
  styleUrls: ['./hri015-exam-report.component.scss']
})
export class Hri015ExamReportComponent implements OnInit {

  loading: boolean = false
  justLoaded: boolean = true


  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  subArr: Subscription[] = []

  functionID: number
  GetReports_sst: Subscription;
  //permission
  isMaster = false
  isCreator = false
  isVerifier = false
  isViewOnly = false
  actionPerm: DTOActionPermission[] = []

  //fillter 
  total = 0
  pageSize = 25
  pageSizes = [this.pageSize]

  //GridView
  gridView = new Subject<any>();
  listReport: DTOPurReport[] = []
  filterListReport: DTOPurReport[] = [];

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: PurAPIService,
  ) { }
   
  ngOnInit(): void {
    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType");

        this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isCreator = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isVerifier = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        this.isViewOnly = !this.isMaster && !this.isCreator && !this.isVerifier


      }
    })

    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
        this.getLocalStorageModule();
        this.p_GetReports();
			}
		})
    this.subArr.push(sst, permissionAPI)
    //action dropdown    
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
  }

  /**
   * Lấy thông tin Module API từ localStorage và tìm kiếm thông tin chức năng cụ thể.
   * Nếu tìm thấy, gán mã chức năng vào thuộc tính functionID của đối tượng hiện tại.
   */
  getLocalStorageModule() {
    var moduleApiCache: string = localStorage.getItem('ModuleAPI')
    var moduleApi = new DTOSYSModule()
    var functionApi = new DTOSYSFunction()

    if (Ps_UtilObjectService.hasValueString(moduleApiCache)) {
      moduleApi = JSON.parse(moduleApiCache)
      var findFunctionApi = moduleApi.ListGroup.find(s => s.ModuleID == 'hriReport')
      functionApi = findFunctionApi.ListFunctions.find(s => s.DLLPackage.toLowerCase() == 'hri015-exam-report')
      this.functionID = functionApi?.Code
    }
  }


  //API
  p_GetReports() {
    if (this.functionID != 0) {
      this.loading = true

      this.GetReports_sst = this.apiService.GetReports(this.functionID).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn)) {
          this.listReport = res.ObjectReturn
          this.gridView.next({ data: this.listReport, total: this.listReport.length });
        }
        else{
          this.layoutService.onError("Đã xảy ra lỗi khi lấy danh sách báo cáo đánh giá nhân sự:  "+res.ErrorString)
        }
        this.loading = false
      }, (err) => {
        this.layoutService.onError("Đã xảy ra lỗi khi lấy danh sách báo cáo đánh giá nhân sự:  "+err)
        this.loading = false
      })
    }
  }

  // Xử lý load filter cho danh sách
  loadFilter() {
    this.gridView.next({ data: this.listReport, total: this.listReport.length });
  }

  // Reset lại bộ lọc mặc định
  resetFilter() {
    //header1
    this.Search(null)
    this.gridView.next({ data: this.listReport, total: this.listReport.length });
  }

  // Xử lý tìm kiếm đối tượng trong danh sách
  Search(event: any) {
    this.filterListReport = this.listReport.filter(s => s.DataName.includes(event))
    this.gridView.next({ data: this.filterListReport, total: this.filterListReport.length });
  }

  //Xử lý thêm các action vào dropdown
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    var typeData = dataItem.TypeData;
    moreActionDropdown = []

    // if(typeData == 1)
    //   moreActionDropdown.push({ Name: "Xem báo cáo", Code: "eye", Type: 'detail', Actived: true })
    // else 
    if (typeData == 2)
      moreActionDropdown.push({ Name: "Xem báo cáo", Code: "eye", Type: 'detail', Actived: true })

    return moreActionDropdown
  }

  //Xử lý action trong dropdown của item
  onActionDropdownClick(menu: MenuDataItem, item: DTOPurReport) {
    if (item.TypeData == 2) {
      if (item.OrderBy == 1)
        this.openReport('exam-report-detail');
      else if (item.OrderBy == 2)
        this.openReport('analysis-report-question');
      else
        this.openReport('wrong-report-question');
    }
  }

  // Xử lý vào trang chi tiết báo cáo
  openReport(name: string) {
    let changeModuleData = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('hriReport')
        || f.Link.includes('hriReport'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('hri015-exam-report')
          || f.Link.includes('hri015-exam-report'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(name)
            || f.Link.includes(name))
        }

        this.menuService.activeMenu(detail2)
      }
    })
    this.subArr.push(changeModuleData);
  }


  // Unsubcribe
  ngOnDestroy() {
    this.subArr.map(s => {
      s?.unsubscribe()
    })
  }
}
