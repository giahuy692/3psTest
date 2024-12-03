import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigService } from 'src/app/p-app/p-config/shared/services/config.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PayslipService } from '../../shared/services/payslip.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { State, distinct } from '@progress/kendo-data-query';
import {
  MultiSelectComponent,
} from '@progress/kendo-angular-dropdowns';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { CompetenceFrameworkApiService } from '../../shared/services/competence-framework-api.service';
import { DTOCompetenceFrameworkDetail } from '../../shared/dto/DTOCompetenceFrameworkDetail.dto';
import { DTOCompetenceFramework } from '../../shared/dto/DTOCompetenceFramework.dto';
import { parseDate } from '@progress/kendo-angular-intl';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import * as $ from 'jquery';


@Component({
  selector: 'hri013-competency-framework-detail',
  templateUrl: './hri013-competency-framework-detail.component.html',
  styleUrls: ['./hri013-competency-framework-detail.component.scss'],
})
export class Hri013CompetencyFrameworkDetailComponent implements OnInit, AfterViewInit {
  //#region element ref
  @ViewChild('titleTable', { static: true }) rowPositionRef: ElementRef;
  widthRowPosition: number = 0;
  widthRowDepartment: number = 0;
  //#endregion

  //#region variable
  //#region permission
  isToanQuyen: boolean = false;
  isAllowedToCreate: boolean = false;
  isAllowedToVerify: boolean = false;
  isAllowedView: boolean = false;
  isLock: boolean = false;
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  isloading: boolean = false;
  //#endregion

  //#region variable framework
  Framework = new DTOCompetenceFramework();
  TempFramework = new DTOCompetenceFramework();
  FrameworkEffDate: Date;
  columnCompetences = [];
  rowPositions = [];
  ListFrameworkPosition = [];
  tempListFrameworkPosition = [];
  ListFrameworkCompetence = [];
  tempListFrameworkCompetence = [];
  uniqueCategoryIDs = [];
  uniqueDepartmentIDs = [];
  CompetenceLevelValue: number = null;
  CompetenceLevelMaxValue: number = null;
  StateListFrameworkPandC: State = {
    filter: { filters: [], logic: 'and' },
  };

  tdCount = 1;
  //#endregion

  // Subscription CallAPi
  arrUnsubscribe: Subscription[] = [];
  //#endregion

  // Dialog
  openedDialog: boolean = false;
  openedCompetence: boolean = false;
  openedPosition: boolean = false;
  openedDiaDeleteCompetence: boolean = false;
  openedDiaDeletegPosition: boolean = false;
  tempDeleteDetail: DTOCompetenceFrameworkDetail = new DTOCompetenceFrameworkDetail();
  //#region Grid



  total: number = 0;
  loading: boolean = false;
  pageSize: number = 25;
  pageSizes: number[] = [25, 50, 75, 100];
  tempSearch: any;
  gridState: State = {
    skip: null,
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  };
  StateFramework: State = {
    filter: { filters: [], logic: 'or' },
  };
  StateFrameworkDetail: State = {
    filter: { filters: [], logic: 'or' },
  };


  FilterCompetenceframeworkDetail = {
    field: 'Framework',
    operator: 'eq',
    value: null,
    ignoreCase: true,
  }
  //#endregion
  ListFrameworkDetail = [];
  tempListFrameworkDetail: any;
  trackByIndex(index: number, item: any) {
    return index;
  }

  public closeBtnAdd(status: string, dialogName: string): void {

    if (status == 'yes') {
      if (dialogName == 'position') {
        this.openedPosition = false;
      }

      if (dialogName == 'competence') {

        this.openedCompetence = false;
      }
    }

    if (status == 'no') {
      if (dialogName == 'position') {
        this.openedPosition = false;
      }

      if (dialogName == 'competence') {

        this.openedCompetence = false;
      }
    }
  }




  //#region variable Answer Options
  arrBtnStatus: any = [];
  //#endregion

  //#region Import & Export
  excelValid: boolean = true;
  uploadEventHandlerCallback: Function;
  //#endregion

  //#region Init
  constructor(
    public menuService: PS_HelperMenuService,
    public service: ConfigService,
    public servicePayslip: PayslipService,
    private cdr: ChangeDetectorRef,
    private competenceframeworkApiService: CompetenceFrameworkApiService,
    private layoutService: LayoutService,
    public apiServicePolicy: MarNewsProductAPIService,
    public apiService: MarBannerAPIService,
  ) {
    this.dataFilterCompetence = this.ListFrameworkCompetence.slice();
    this.dataFilterPosition = this.ListFrameworkPosition.slice();
  }

  ngOnInit(): void {
    let that = this;

    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    // this.menuService.activeMenu({
    //   "Name": "Chi tiết Khung năng lực",
    //   "Actived": false,
    //   "Code": "hri013-competency-framework-detail",
    //   "Link": "/hri/hri013-competency-framework-detail",
    //   "Type": "",
    //   "LstChild": []
    // });
    let changePermission_sst = this.menuService
      .changePermission()
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          that.isAllowedView =
            that.actionPerm.findIndex((s) => s.ActionType == 6) > -1 || false;

          that.dataPerm = distinct(res.DataPermission, 'Warehouse');


        }
        this.isloading = false;
      });

    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var a = this.servicePayslip.getCacheCompetenceframework().subscribe((res) => {
          if (res.Code != 0) {
            this.GetCompetenceFramework(res);
          } else {
            this.FrameworkEffDate = parseDate(res.EffDate);
          }
          this.isloading = false;
        });
      }
      this.arrUnsubscribe.push(a);
    })
    this.arrUnsubscribe.push(changePermission_sst,permissionAPI);
  }


  ngAfterViewInit(): void {

  }

  //#region Framework
  loadPage() {
    this.GetCompetenceFramework(this.Framework);

  }
  //#ndregion

  onCheckPermistion() {
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.Framework.StatusID;

    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4) || canVerify && statusID === 1) {
      this.isLock = false; // Cho phép chỉnh sửa
    } else {
      this.isLock = true; // Bị disabled
    }
  }


  checkedField(): boolean {
    const CheckPvC = this.ListFrameworkDetail.filter((v: DTOCompetenceFrameworkDetail) => v.Position !== null && v.Competence !== null)
    const CheckCompetenceLevel = this.ListFrameworkDetail.every((v: DTOCompetenceFrameworkDetail) => v.CompetenceLevel !== null && v.CompetenceLevelMax !== null)
    var is = false;

    if (Ps_UtilObjectService.hasValueString(this.Framework.EffDate) == false) {
      this.layoutService.onError("Vui lòng chọn ngày hiệu lực khung năng lực!");
      return is = false;
    }
    if (Ps_UtilObjectService.hasValueString(this.Framework.Title) == false) {
      this.layoutService.onError("Vui lòng nhập tên khung năng lực!");
      return is = false;
    }
    if (Ps_UtilObjectService.hasValueString(this.Framework.Description) == false) {
      this.layoutService.onError("Vui lòng nhập diễn giải khung năng lực!");
      return is = false;
    }
    if (this.ListFrameworkDetail.length == 0 || CheckPvC.length == 0) {
      this.layoutService.onError("Vui lòng thêm năng lực và chức danh cho khung năng lực!");
      return is = false;
    }

    if (CheckCompetenceLevel == false) {
      this.layoutService.onError("Vui lòng nhập 'Min' và 'Max' cho khung năng lực!");
      return is = false;
    }

    if (this.Framework.Code != 0 && Ps_UtilObjectService.hasValueString(this.Framework.EffDate) && this.ListFrameworkDetail.length !== 0 && CheckPvC.length !== 0 && CheckCompetenceLevel
      && Ps_UtilObjectService.hasValueString(this.Framework.Description) && Ps_UtilObjectService.hasValueString(this.Framework.Title)) {
      is = true;
    } else {
      is = false;
    }
    return is
  }

  setupBtnStatus() {
    this.arrBtnStatus = [];
    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    var statusID = this.Framework.StatusID;

    if (canCreateOrAdmin) {

      this.arrBtnStatus.push({
        class: 'addImport',
        code: 'export',
        type: 'import',
        link: 0,
        title: 'Import chi tiết KNL'
      }, {
        text: 'Template',
        class: 'addExport',
        code: 'import',
        type: 'export',
        link: 0,
        title: 'Template chi tiết KNL'
      });
    }

    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && this.Framework.Code > 0 && (statusID === 0 || statusID === 4)) {
      this.arrBtnStatus.push({
        text: 'GỬI DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'redo',
        link: 1,
        type: 'status',
      });
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && (statusID === 1 || statusID === 3)) {
      this.arrBtnStatus.push({
        text: 'DUYỆT ÁP DỤNG',
        class: 'k-button btn-hachi hachi-primary',
        code: 'check-outline',
        link: 2,
        type: 'status'
      });

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      this.arrBtnStatus.push({
        text: 'TRẢ VỀ',
        class: 'k-button btn-hachi hachi-warning hachi-secondary',
        code: 'undo',
        link: 4,
        type: 'status'
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && statusID === 2) {
      this.arrBtnStatus.push({
        text: 'NGƯNG HIỂN THỊ',
        class: 'k-button btn-hachi hachi-warning',
        code: 'minus-outline',
        link: 3,
        type: 'status'
      });
    }

    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0 và không có câu trả lời nào,không có khía cạnh
    if (canCreateOrAdmin && this.Framework.Code != 0 &&
      this.Framework.StatusID == 0 &&
      this.ListFrameworkDetail.length == 0) {
      this.arrBtnStatus.unshift({
        text: 'XÓA KHUNG NL',
        class: 'k-button btn-hachi hachi-warning',
        code: 'trash',
        type: 'delete',
        link: 5
      });
    }
    if (canCreateOrAdmin) {

      this.arrBtnStatus.push({
        text: 'THÊM MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'add',
        link: 0
      });
    }
  }

  //#endregion

  //#region framework
  //lấy giá trị của CompetenceLevel
  getCompetenceLevel(position: number, competence: number): string {
    const item = this.ListFrameworkDetail.find(
      (obj: DTOCompetenceFrameworkDetail) => obj.Position === position && obj.Competence === competence
    );
    return item && item.CompetenceLevel;
  }

  getCompetenceLevelMax(position: number, competence: number): string {
    const item = this.ListFrameworkDetail.find(
      (obj: DTOCompetenceFrameworkDetail) => obj.Position === position && obj.Competence === competence
    );
    return item && item.CompetenceLevelMax;
  }


  setCompetenceLevel(position: number, competence: number, isUpdate?: boolean): void {
    const item = this.ListFrameworkDetail.find(obj =>
      obj.Position === position && obj.Competence === competence
    );
    if (item && item.CompetenceLevel !== this.competenceLevelValue.CompetenceLevel && isUpdate) {
      if (item.CompetenceLevelMax < item.CompetenceLevel) {
        item.CompetenceLevelMax = item.CompetenceLevel;
        this.UpdateCompetenceFrameworkDetails([item], ['CompetenceLevel', 'CompetenceLevelMax'], 'update');
      } else {
        this.UpdateCompetenceFrameworkDetails([item], ['CompetenceLevel'], 'update');
      }
    }
  }

  setCompetenceLevelMax(position: number, competence: number, isUpdate?: boolean): void {
    const item = this.ListFrameworkDetail.find(obj =>
      obj.Position === position && obj.Competence === competence
    );


    if (item && item.CompetenceLevelMax !== this.competenceLevelMaxValue.CompetenceLevelMax && isUpdate) {
      if (item.CompetenceLevel == null && item.CompetenceLevelMax !== null) {
        item.CompetenceLevel = item.CompetenceLevelMax;
        this.UpdateCompetenceFrameworkDetails([item], ['CompetenceLevel', 'CompetenceLevelMax'], 'update');
      } else {
        this.UpdateCompetenceFrameworkDetails([item], ['CompetenceLevelMax'], 'update');
      }
    }
  }
  competenceLevelValue: DTOCompetenceFrameworkDetail
  competenceLevelMaxValue: DTOCompetenceFrameworkDetail

  onCompetenceLevelFocus(position: number, competence: number): void {
    const item = this.ListFrameworkDetail.find(
      (obj: DTOCompetenceFrameworkDetail) => obj.Position === position && obj.Competence === competence
    );

    this.competenceLevelValue = { ...item }
  }

  onCompetenceLevelMaxFocus(position: number, competence: number): void {
    const item = this.ListFrameworkDetail.find(
      (obj: DTOCompetenceFrameworkDetail) => obj.Position === position && obj.Competence === competence
    );

    this.competenceLevelMaxValue = { ...item }
  }


  onCompetenceLevelChange(position: number, competence: number, value: number): void {
    let roundedValue = Math.round(value);
    const item = this.ListFrameworkDetail.find(obj =>
      obj.Position === position && obj.Competence === competence
    );
    if (item) {
      item.CompetenceLevel = roundedValue;
    }
  }

  onCompetenceLevelMaxChange(position: number, competence: number, value: number): void {
    let roundedValue = Math.round(value);
    const item = this.ListFrameworkDetail.find(obj =>
      obj.Position === position && obj.Competence === competence
    );
    if (item) {
      item.CompetenceLevelMax = roundedValue;
    }
  }



  // kiểm trả xem đủ điều kiện để vẽ input table không 
  shouldDisplayInput(position: number, competence: number): boolean {
    const item = this.ListFrameworkDetail.find(obj => Ps_UtilObjectService.hasValue(position) && Ps_UtilObjectService.hasValue(competence) &&
      obj.Position === position && obj.Competence === competence
    );
    return item
  }

  // Lấy thông tin tương ứng với competence được bind
  getCompetenceByID(competence: number): any {
    return this.ListFrameworkDetail.find(item => Ps_UtilObjectService.hasValue(item.Competence) && item.Competence === competence);
  }

  // Lấy thông tin tương ứng với position được bind
  getPositionByID(position: number): any {
    return this.ListFrameworkDetail.find(item => Ps_UtilObjectService.hasValue(item.Position) && item.Position === position);
  }

  getItemUniqueCategoryIDs(category: number): any {
    return this.ListFrameworkDetail.find(item => Ps_UtilObjectService.hasValue(item.Category) && item.Category === category);
  }

  getItemUniqueDepartmentIDs(department: number): any {
    return this.ListFrameworkDetail.find(item => Ps_UtilObjectService.hasValue(item.Department) && item.Department === department);
  }

  // handle tách đối tường framework thành cột dọc và ngang
  countOccurrences(arr, value) {
    return arr.filter((x) => x === value).length;
  }
  removeDuplicates(array, property) {
    return array.filter((item, index, self) =>
      index === self.findIndex((obj) => obj[property] === item[property])
    );
  }
  createTable() {

    if (this.ListFrameworkDetail.length !== 0) {
      // Lọc trường "Position" khác null và không trùng lặp
      this.rowPositions = Array.from(
        new Map(
          this.ListFrameworkDetail
            .filter((item: DTOCompetenceFrameworkDetail) => Ps_UtilObjectService.hasValue(item.Position) && item.Position)
            .map((item: DTOCompetenceFrameworkDetail) => [
              item.Position,
              {
                Position: item.Position,
                PositionID: item.PositionID,
                PositionName: item.PositionName,
                Department: item.Department,
                DepartmentID: item.DepartmentID,
                DepartmentName: item.DepartmentName,
              },
            ])
        ).values()
      );

      // Lọc trường "Competence" khác null và không trùng lặp
      this.columnCompetences = Array.from(
        new Map(
          this.ListFrameworkDetail
            .filter((item: DTOCompetenceFrameworkDetail) => Ps_UtilObjectService.hasValue(item.Competence) && item.Competence)
            .map((item: DTOCompetenceFrameworkDetail) => [
              item.Competence,
              {
                Competence: item.Competence,
                CompetenceID: item.CompetenceID,
                CompetenceName: item.CompetenceName,
                Category: item.Category,
                CategoryID: item.CategoryID,
                CategoryName: item.CategoryName,
              },
            ])
        ).values()
      );

      // Sắp xếp rowPositions theo Department
      this.rowPositions.sort((a, b) => {
        if (a.Department < b.Department) {
          return -1;
        }
        if (a.Department > b.Department) {
          return 1;
        }
        return 0;
      });

      // Sắp xếp columnCompetences theo Category
      this.columnCompetences.sort((a, b) => {
        if (a.Category < b.Category) {
          return -1;
        }
        if (a.Category > b.Category) {
          return 1;
        }
        return 0;
      });



      // Đếm số lần lặp lại của Category trong columnCompetences và cho vào một mảng
      const categoryCounts = this.columnCompetences.map((competence) => ({
        Category: competence.Category,
        CategoryID: competence.CategoryID,
        CategoryName: competence.CategoryName,
        ColSpan: this.countOccurrences(this.columnCompetences.map((c) => c.Category), competence.Category),
      }));

      // Mảng chưa phân nhóm
      this.uniqueCategoryIDs = this.removeDuplicates(categoryCounts, 'CategoryID');


      // Đếm số lần lặp lại của Department trong rowPositions và cho vào một mảng
      const departmentCounts = this.rowPositions.map((position) => ({
        Department: position.Department,
        DepartmentID: position.DepartmentID,
        DepartmentName: position.DepartmentName,
        RowSpan: this.countOccurrences(this.rowPositions.map((p) => p.Department), position.Department),
      }));

      // Lọc và biến đổi uniqueDepartmentIDs
      this.uniqueDepartmentIDs = this.removeDuplicates(departmentCounts, 'DepartmentID');

      $(document).ready(function () {
        var prevDataType = null; // Khởi tạo một biến để lưu trữ kiểu dữ liệu của hàng trước đó
        var $rowsToMerge = $(); // Khởi tạo một biến để lưu trữ các hàng cần gộp
        var prevDataTypeCol = null; // Khởi tạo một biến để lưu trữ kiểu dữ liệu của hàng trước đó
        var $rowsToMergeCol = $(); // Khởi tạo một biến để lưu trữ các hàng cần gộp
        var prevDataTypeRow = null; // Khởi tạo một biến để lưu trữ kiểu dữ liệu của hàng trước đó
        var $rowsToMergeRow = $(); // Khởi tạo một biến để lưu trữ các hàng cần gộp

        //#region merge Department
        // Lặp qua tất cả các hàng trong tbody của bảng
        var tableRows = $('#myTable tbody tr');
        for (var i = 0; i <= tableRows.length; i++) {
          var currentRow = tableRows.eq(i); // Lấy hàng hiện tại
          var currentDataType = currentRow.find('td:first').attr('departData'); // Lấy kiểu dữ liệu của hàng hiện tại

          // Kiểm tra nếu kiểu dữ liệu của hàng hiện tại giống với kiểu dữ liệu của hàng trước đó
          if (currentDataType === prevDataType) {
            // Nếu giống, thêm hàng hiện tại vào mảng $rowsToMerge
            $rowsToMerge = $rowsToMerge.add(currentRow);
          } else {
            // Nếu khác, kiểm tra nếu đã có ít nhất 2 hàng cùng kiểu dữ liệu cần gộp
            if ($rowsToMerge.length > 1) {
              mergeRows($rowsToMerge); // Gọi hàm mergeRows để gộp các hàng cùng kiểu dữ liệu
            }
            $rowsToMerge = currentRow; // Đặt lại mảng $rowsToMerge với hàng hiện tại
            prevDataType = currentDataType; // Đặt lại giá trị kiểu dữ liệu của hàng trước đó
          }
        }
        //#region group  Category
        // Lặp qua tất cả các thẻ th có class "competenceItem" trong thead
        var tableHeaders = $('#myTable thead .headerGroup .competenceItem');
        for (var j = 1; j <= tableHeaders.length; j++) {
          let currentHeader = tableHeaders.eq(j); // Lấy thẻ th hiện tại
          let currentDataTypeCol = currentHeader.attr('cateData'); // Lấy kiểu dữ liệu của th hiện tại

          let firstTableHeader = tableHeaders.first(); // Thêm class "FirstGroupCol" cho phần tử đầu tiên trong mảng
          let firstDataTypeCol = firstTableHeader.attr('cateData'); // Lấy kiểu dữ liệu của item đầu tiên
          let isUniqueDataTypeCol = tableHeaders.filter(`[cateData="${firstDataTypeCol}"]`).length === 1;

          if (isUniqueDataTypeCol) {
            firstTableHeader.addClass('FirstGroupCol EndGroupCol')
          } else {
            firstTableHeader.addClass('FirstGroupCol')
          }

          if (currentDataTypeCol === prevDataTypeCol) {
            // Nếu giống, thêm th hiện tại vào mảng $rowsToMergeCol
            $rowsToMergeCol = $rowsToMergeCol.add(currentHeader);
          } else {
            // var $firstCol = $rowsToMergeCol.first();
            // $firstCol.first().addClass('FirstGroupCol'); // Thêm class "FirstGroupCol" cho phần tử đầu tiên trong mảng
            $rowsToMergeCol.last().addClass('EndGroupCol'); // Thêm class "EndGroupCol" cho phần tử cuối cùng trong mảng
            $rowsToMergeCol = currentHeader; // Đặt lại mảng $rowsToMergeCol với th hiện tại
            prevDataTypeCol = currentDataTypeCol; // Đặt lại giá trị kiểu dữ liệu của th trước đó
          }
        }
        //#endregion

        //#region group Department
        var tdHeaders = $('#myTable tbody .rowPosition .columnFisrt');
        for (var x = 1; x <= tdHeaders.length; x++) {
          var currentTdHeader = tdHeaders.eq(x); // Lấy thẻ th hiện tại
          let currentDataTypeRow = currentTdHeader.attr('departData'); // Lấy kiểu dữ liệu của th hiện tại

          var firstTdHeader = tdHeaders.first().addClass('FirstGroupRow'); // Thêm class "FirstGroupRow" cho phần tử đầu tiên trong mảng
          var firstDataTypeRow = firstTdHeader.attr('departData'); // Lấy kiểu dữ liệu của item đầu tiên
          // Kiểm tra xem item đầu tiên có giá trị departData duy nhất hay không
          var isUniqueDataType = tdHeaders.filter(`[departData="${firstDataTypeRow}"]`).length === 1;
          if (isUniqueDataType) firstTdHeader.addClass('EndGroupRow');


          if (currentDataTypeRow === prevDataTypeRow) {
            // Nếu giống, thêm th hiện tại vào mảng $rowsToMergeRow
            $rowsToMergeRow = $rowsToMergeRow.add(currentTdHeader);
          } else {
            // var $firstRow = $rowsToMergeRow.first();
            // $firstRow.first().addClass('FirstGroupRow'); // Thêm class "FirstGroupRow" cho phần tử đầu tiên trong mảng
            $rowsToMergeRow.last().addClass('EndGroupRow'); // Thêm class "EndGroupRow" cho phần tử cuối cùng trong mảng
            $rowsToMergeRow = currentTdHeader; // Đặt lại mảng $rowsToMergeRow với th hiện tại
            prevDataTypeRow = currentDataTypeRow; // Đặt lại giá trị kiểu dữ liệu của th trước đó
          }
        }
        //#endregion



        //#region  Tô màu cho rowDepartment
        var rowDepartment = $('#myTable .tbodyTable .rowPosition .rowDepartment');
        rowDepartment.first().addClass('FisrtRow'); // Thêm class "FisrtRow" cho phần tử đầu tiên trong mảng
        for (var e = 0; e <= rowDepartment.length; e++) {
          var currentRowDepartment = rowDepartment.eq(e); // Lấy thẻ th hiện tại
          currentRowDepartment.addClass('RowBorderLeftBottom'); // Thêm lớp 'RowBorderLeftBottom' vào phần tử có số chẵn
        }
        //#endregion

        //#region Tô màu cho td
        var trLevelFrameworks = $('#myTable .tbodyTable .rowPosition');
        // Sử dụng vòng lặp forEach để duyệt qua tất cả các phần tử.
        trLevelFrameworks.each(function (index) {
          // Kiểm tra xem index có phải là số chẵn hay không
          if (index % 2 !== 0) {
            $(this).addClass('highlight'); // Thêm lớp 'highlight' vào phần tử có số chẵn
          }
        });

        var tdLevelFrameworks = $('#myTable .tbodyTable .rowPosition .levelFramework');
        tdLevelFrameworks.each(function (index) {
          // Kiểm tra xem index có phải là số chẵn hay không
          if (index % 2 !== 0) {
            $(this).addClass('highlight'); // Thêm lớp 'highlight' vào phần tử có số chẵn
          }
        });
        //#endregion

        //#region  Tô màu cho cateContent
        var colCategory = $('#myTable .theadTable .categoryHeader .cateContent');
        colCategory.first().addClass('FisrtRow'); // Thêm class "FisrtRow" cho phần tử đầu tiên trong mảng
        for (var n = 0; n <= colCategory.length; n++) {
          var currentColCategory = colCategory.eq(n); // Lấy thẻ th hiện tại
          currentColCategory.addClass('RowBorderLeftBottom'); // Thêm lớp 'RowBorderLeftBottom' vào phần tử có số chẵn
        }
        //#endregion


        // Hàm mergeRows để gộp các hàng cùng kiểu dữ liệu
        function mergeRows($rows) {
          var $firstRow = $rows.first(); // Lấy phần tử đầu tiên trong mảng để thêm vào td đầu tiên và rowspan
          $rows.not($firstRow).find('td:first').remove(); // Xóa td đầu tiên (cột kiểu dữ liệu) trong các hàng khác
          $firstRow.find('td:first').attr('rowspan', $rows.length); // Đặt thuộc tính rowspan cho td đầu tiên trong hàng đầu
        }
      }

      );
      this.widthRowPosition = this.rowPositionRef.nativeElement.offsetWidth;
    } else {
      this.rowPositions = [];
      this.columnCompetences = [];
      this.uniqueCategoryIDs = [];
      this.uniqueDepartmentIDs = [];
      this.widthRowPosition = this.rowPositionRef.nativeElement.offsetWidth;
    }
  }

  //#endregion


  //#region Update all field
  onUpdateFramework(property: Array<string>) {
    if (!!this.Framework['Title'] && this.Framework.Code === 0) {
      this.layoutService.onError("Tên khung năng lực không được bỏ trống!")
    } else if (this.Framework[property[0]] !== this.TempFramework[property[0]]) {
      this.UpdateCompetenceFramework(this.Framework, property)
    }
  }


  onBlurDatePicker(value: any, property: Array<string>) {
    if (value !== null) {
      this.Framework[property[0]] = this.FrameworkEffDate;
      this.UpdateCompetenceFramework(this.Framework, property)
    }
  }
  //#endregion

  //#region import và export
  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }

  downloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "CompetenceFrameworkDetailTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let a = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res);
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
    this.arrUnsubscribe.push(a);
  }
  uploadEventHandler(e: File) {
    this.ImportExcelFrameworkDetail(e);
  }
  ImportExcelFrameworkDetail(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcelFrameworkDetail = this.competenceframeworkApiService.ImportExcelFrameworkDetail(file, this.Framework).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res == 0) {
        this.GetListCompetenceFrameworkDetails(this.Framework);
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
    this.arrUnsubscribe.push(ImportExcelFrameworkDetail);
  }
  //#endregion

  //#region DatePicker
  disabledDates = (date: Date): boolean => {
    const valueToday = new Date();
    var isDisable = false;

    if (date < valueToday) isDisable = true;

    if (
      date.getDate() == valueToday.getDate() &&
      date.getMonth() == valueToday.getMonth() &&
      date.getFullYear() == valueToday.getFullYear()
    )
      isDisable = false;
    return isDisable;
  };
  //#endregion
  arrPositon = []
  arrCompentence = []
  valueChangeMultiselect(value: any, type: string): void {
    if (type == 'p') {
      this.arrPositon = value;
    } else {
      this.arrCompentence = value;
    }
  }

  @ViewChild('mutiseleteComponent') MutiseleteRef: MultiSelectComponent;
  onAdd(type: string) {
    let ListDTO = []
    if (type == 'p') {
      this.arrPositon.forEach(e => {
        ListDTO.push({ "Position": e, "Framework": this.Framework.Code })
      })
      var Properties = [
        "Position"
      ]
      this.UpdateCompetenceFrameworkDetails(ListDTO, Properties, 'add')
      this.isloading = false;
    } else {
      this.arrCompentence.forEach(e => {
        ListDTO.push({ "Competence": e, "Framework": this.Framework.Code })
      })
      var Properties = [
        "Competence"
      ]
      this.UpdateCompetenceFrameworkDetails(ListDTO, Properties, 'add')
      this.isloading = false;
    }
    this.MutiseleteRef.reset();
  }

  SetFilterPandC(List: any, kind: string) {
    this.StateListFrameworkPandC.filter.filters = [];
    switch (kind) {
      case 'competence':
        for (let i = 0; i < List.length; i++) {
          let FilterCompetenceframework = {
            field: 'Code',
            operator: 'neq',
            value: List[i].Competence,
            ignoreCase: true,
          }
          this.StateListFrameworkPandC.filter.filters.push(FilterCompetenceframework);
        }
        break;
      case 'position':
        for (let i = 0; i < List.length; i++) {
          let FilterPositionframework = {
            field: 'Code',
            operator: 'neq',
            value: List[i].Position,
            ignoreCase: true,
          }
          this.StateListFrameworkPandC.filter.filters.push(FilterPositionframework)
        }
        break;
    }

    return this.StateListFrameworkPandC
  }

  openBtnAdd(dialogName: string): void {
    if (dialogName == 'competence') {
      this.openedCompetence = true;
      this.isloading = false;
    }

    if (dialogName == 'position') {
      this.openedPosition = true;
      this.isloading = false;
    }
  }

  focusDialogAdd(dialogName: string) {
    if (dialogName == 'competence') {
      this.GetListFrameworkCompetence(this.SetFilterPandC(this.columnCompetences, 'competence'));
    }

    if (dialogName == 'position') {
      this.GetListFrameworkPosition(this.SetFilterPandC(this.rowPositions, 'position'));
    }
  }

  oldListCompetence = [];
  oldListPosition = [];
  blurDialogAdd(dialogName: string) {
    if (dialogName == 'competence') {
      this.oldListCompetence = this.ListFrameworkCompetence.slice();
    }

    if (dialogName == 'position') {
      this.oldListPosition = this.ListFrameworkPosition.slice();
    }
  }


  //#region navigation
  // Render btn status
  handleBtnStatus(item: any) {
    if (this.Framework.Code != 0) {
      let StatusID = parseInt(item.link);

      // if(item.type == 'status'){
      //   var listdataUpdate = [];
      //   if (item.link == 1) {
      //     if (this.Framework.StatusID == 0 || this.Framework.StatusID == 4) {
      //       listdataUpdate.push(this.Framework);
      //       if(this.checkedField()) {
      //         this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
      //       }
      //     }
      //   } else if (item.link == 2) {
      //     if (this.Framework.StatusID == 1 || this.Framework.StatusID == 3) {
      //       listdataUpdate.push(this.Framework);
      //       if(this.checkedField()) {
      //         this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
      //       }
      //     }
      //   } else if (item.link == 3) {
      //     if (this.Framework.StatusID == 2) {
      //       listdataUpdate.push(this.Framework);
      //       this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
      //     }
      //   } else if (item.link == 4) {
      //     if (this.Framework.StatusID == 1 || this.Framework.StatusID == 3) {
      //       listdataUpdate.push(this.Framework);
      //       this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
      //     }
      //   }
      // } else if (item.type == 'add') {
      //   this.Framework = new DTOCompetenceFramework();
      //   this.ListFrameworkDetail = [];
      //   this.ListFrameworkCompetence = [];
      //   this.ListFrameworkPosition = [];
      //   this.columnCompetences = [];
      //   this.rowPositions = [];
      //   this.uniqueCategoryIDs = [];
      //   this.onCheckPermistion();
      //   this.setupBtnStatus();
      // } else if (item.type == 'delete') {
      //   this.openedDialog = true;
      // } else if (item.type == 'export'){
      //   this.downloadExcel()
      // } else if(item.type == 'import') {
      //   this.importExcel();
      // }


      switch (item.type) {
        case 'status':
          var listdataUpdate = [];
          if (item.link == 1 && (this.Framework.StatusID == 0 || this.Framework.StatusID == 4)) {
            // if (this.Framework.StatusID == 0 || this.Framework.StatusID == 4) {
            listdataUpdate.push(this.Framework);
            if (this.checkedField()) {
              this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
            }
            // }
          } else if (item.link == 2 && (this.Framework.StatusID == 1 || this.Framework.StatusID == 3)) {
            // if (this.Framework.StatusID == 1 || this.Framework.StatusID == 3) {
            listdataUpdate.push(this.Framework);
            if (this.checkedField()) {
              this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
            }
            // }
          } else if (item.link == 3 && this.Framework.StatusID == 2) {
            // if (this.Framework.StatusID == 2) {
            listdataUpdate.push(this.Framework);
            this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
            // }
          } else if (item.link == 4 && (this.Framework.StatusID == 1 || this.Framework.StatusID == 3)) {
            // if (this.Framework.StatusID == 1 || this.Framework.StatusID == 3) {
            listdataUpdate.push(this.Framework);
            this.UpdateStatusCompetenceFramework(listdataUpdate, StatusID);
            // }
          }
          break;
        case 'add':
          this.Framework = new DTOCompetenceFramework();
          this.ListFrameworkDetail = [];
          this.ListFrameworkCompetence = [];
          this.ListFrameworkPosition = [];
          this.columnCompetences = [];
          this.rowPositions = [];
          this.uniqueCategoryIDs = [];
          this.onCheckPermistion();
          this.setupBtnStatus();
          break;
        case 'delete':
          this.openedDialog = true;
          break;
        case 'export':
          this.downloadExcel()
          break;
        case 'import':
          this.importExcel();
          break;
        default:
          break;
      }
    }
  }

  // Xử lý chuyển trang chi tiết
  openDetail(link: string) {
    let changeModuleData_sst = this.menuService
      .changeModuleData()
      .subscribe((item: ModuleDataItem) => {
        var parent = item.ListMenu.find(
          (f) =>
            f.Code.includes('hriCompetency') ||
            f.Link.includes('hr007-competency-bank')
        );

        if (link == 'list') {
          if (
            Ps_UtilObjectService.hasValue(parent) &&
            Ps_UtilObjectService.hasListValue(parent.LstChild)
          ) {
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri013-competency-framework') ||
                f.Link.includes('hri013-competency-framework')
            );

            this.menuService.activeMenu(detail);
          }
        } else if (link == 'detail') {
          if (
            Ps_UtilObjectService.hasValue(parent) &&
            Ps_UtilObjectService.hasListValue(parent.LstChild)
          ) {
            var detail = parent.LstChild.find(
              (f) =>
                f.Code.includes('hri013-competency-framework') ||
                f.Link.includes('hri013-competency-framework')
            );

            if (
              Ps_UtilObjectService.hasValue(detail) &&
              Ps_UtilObjectService.hasListValue(detail.LstChild)
            ) {
              var detail2 = detail.LstChild.find(
                (f) =>
                  f.Code.includes('hri013-competency-framework-detail') ||
                  f.Link.includes('hri013-competency-framework-detail')
              );

              this.menuService.activeMenu(detail2);
            }
          }
        }
      });
    this.arrUnsubscribe.push(changeModuleData_sst);
  }
  //#endregion


  //#region dialog
  public closeDialog(): void {
    this.openedDialog = false;
  }

  deleteDialog(status: string): void {
    if (status == 'yes') {
      this.DeleteCompetenceFramework([this.Framework]);
      this.openedDialog = false;
    } else {
      this.openedDialog = false;
    }
  }

  closeDiaDeleteCompetence() {
    this.openedDiaDeleteCompetence = false;
  }

  handleDeleteCompetence(status: string) {
    let temp = {
      Framework: this.Framework.Code,
      Competence: this.tempDeleteDetail.Competence,
      Company: 1
    }
    if (status == 'yes') {
      this.DeleteCompetenceFrameworkDetails(temp, 1);
      this.openedDiaDeleteCompetence = false;
    } else {
      this.openedDiaDeleteCompetence = false;
    }
  }

  closeDiaDeletePosition() {
    this.openedDiaDeletegPosition = false;
  }

  handleDeletePosition(status: string) {
    let temp = {
      Framework: this.Framework.Code,
      Position: this.tempDeleteDetail.Position,
      Company: 1
    }
    if (status == 'yes') {
      this.DeleteCompetenceFrameworkDetails(temp, 2);
      this.openedDiaDeletegPosition = false;
    } else {
      this.openedDiaDeletegPosition = false;
    }
  }

  handleDeteleDetail(type: string, item: DTOCompetenceFrameworkDetail) {
    if (type == 'position') {
      this.tempDeleteDetail = item;
      this.openedDiaDeletegPosition = true;
    } else {
      this.tempDeleteDetail = item;
      this.openedDiaDeleteCompetence = true;
    }
  }

  dataFilterCompetence = []
  dataFilterPosition = []
  handleFilterCompetence(value: any) {
    this.dataFilterCompetence = this.ListFrameworkCompetence.filter((s) => s.CompetenceName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  handleFilterPosition(value: any) {
    this.dataFilterPosition = this.ListFrameworkPosition.filter((s) => s.Position.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }
  //#endialog

  //#region Helps
  //#endregion



  //#region api
  GetCompetenceFramework(dto: DTOCompetenceFramework) {
    this.loading = true;
    var GetCompetenceFramework = this.competenceframeworkApiService
      .GetCompetenceFramework(dto)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.Framework = res.ObjectReturn;
            this.TempFramework = { ...res.ObjectReturn }; // Lưu giá trị cũ
            this.FrameworkEffDate = parseDate(this.Framework.EffDate);
            this.onCheckPermistion()
            //#region lấy chi tiết năng lực của framework
            this.FilterCompetenceframeworkDetail.value = this.Framework.Code;
            this.StateFrameworkDetail.filter.filters.push(this.FilterCompetenceframeworkDetail)
            this.GetListCompetenceFrameworkDetails(this.Framework);
            //#endregion
          }
          this.setupBtnStatus();
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetCompetenceFramework);
  }

  GetListCompetenceFrameworkDetails(dto: DTOCompetenceFramework) {
    this.loading = true;
    var GetListCompetenceFrameworkDetails = this.competenceframeworkApiService
      .GetListCompetenceFrameworkDetails(dto)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chi tiết khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListFrameworkDetail = res.ObjectReturn;
            this.createTable();
          }
          this.setupBtnStatus();
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chi tiết khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListCompetenceFrameworkDetails);
  }

  GetListFrameworkPosition(state: State) {
    this.loading = true;
    var GetListFrameworkPosition = this.competenceframeworkApiService
      .GetListFrameworkPosition(state)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vị trí khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListFrameworkPosition = res.ObjectReturn.Data;
            this.dataFilterPosition = this.ListFrameworkPosition.slice();
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vị trí khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListFrameworkPosition);
  }

  GetListFrameworkCompetence(state: State) {
    this.loading = true;
    var GetListFrameworkCompetence = this.competenceframeworkApiService
      .GetListFrameworkCompetence(state)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListFrameworkCompetence = res.ObjectReturn;
            this.dataFilterCompetence = this.ListFrameworkCompetence.slice();
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(GetListFrameworkCompetence);
  }

  UpdateCompetenceFramework(dto: DTOCompetenceFramework, property: Array<string>) {
    this.isloading = true;
    let UpdateCompetenceFramework = this.competenceframeworkApiService.UpdateCompetenceFramework(dto, property)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.Framework = res.ObjectReturn;
            this.TempFramework = { ...res.ObjectReturn };
            this.layoutService.onSuccess('Cập nhật khung năng lực thành công!')
          }
          this.loading = false;
          this.setupBtnStatus();
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(UpdateCompetenceFramework);
  }

  UpdateStatusCompetenceFramework(dto: DTOCompetenceFramework[], statusID: number) {
    this.loading = true;
    var UpdateStatusCompetenceFramework = this.competenceframeworkApiService
      .UpdateStatusCompetenceFramework(dto, statusID)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(
              'Cập nhật trạng thái khung năng lực thành công!'
            );
            this.GetCompetenceFramework(this.Framework);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật trạng thái khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(UpdateStatusCompetenceFramework);
  }

  UpdateCompetenceFrameworkDetails(dto: DTOCompetenceFrameworkDetail[], Properties: string[], action: string) {
    this.isloading = true;
    let UpdateCompetenceFrameworkDetails = this.competenceframeworkApiService.UpdateCompetenceFrameworkDetails(this.Framework.Code, dto, Properties)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật chi tiết khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            if (this.ListFrameworkDetail.length == 0) {
              this.ListFrameworkDetail = res.ObjectReturn;
            }
            else {
              res.ObjectReturn.forEach(updatedItem => {
                const foundItem = this.ListFrameworkDetail.find(item => item.Code === updatedItem.Code);
                if (foundItem) {
                  for (let field in updatedItem) {
                    foundItem[field] = updatedItem[field];
                  }
                } else {
                  this.ListFrameworkDetail.push(updatedItem);
                }
              });
            }
            if (action == 'add') this.createTable();
            this.layoutService.onSuccess('Cập nhật khung năng lực thành công!')
          }
          this.loading = false;
          this.setupBtnStatus();
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật chi tiết khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(UpdateCompetenceFrameworkDetails);
    this.loading = false;
  }

  DeleteCompetenceFramework(arr: DTOCompetenceFramework[]) {
    this.loading = true;
    let DeleteCompetence = this.competenceframeworkApiService
      .DeleteCompetenceFramework(arr)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.Framework = new DTOCompetenceFramework();
            this.ListFrameworkDetail = [];
            this.FrameworkEffDate = parseDate(this.Framework.EffDate);
            this.createTable();
            this.layoutService.onSuccess('Xóa khung năng lực thành công');
          }
          this.loading = false;
          this.setupBtnStatus();
          this.onCheckPermistion()
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa khung năng lực:  ${error}`);
        }
      );
    this.arrUnsubscribe.push(DeleteCompetence);
  }

  DeleteCompetenceFrameworkDetails(dto: DTOCompetenceFrameworkDetail, type: number) {
    this.loading = true;
    let DeleteCompetenceFrameworkDetails = this.competenceframeworkApiService
      .DeleteCompetenceFrameworkDetails(dto)
      .subscribe(
        (res: any) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa chi tiết khung năng lực: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.GetListCompetenceFrameworkDetails(this.Framework);
            this.layoutService.onSuccess('Xóa chi tiết khung năng lực thành công');
          }
          this.loading = false;
          this.setupBtnStatus();
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa chi tiết khung năng lực: ${error}`);
        }
      );
    this.arrUnsubscribe.push(DeleteCompetenceFrameworkDetails);
  }
  //#endregion api

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }

  // Lấy màu
  getStatusColor() {

    // if (this.Framework.StatusID === 0) {
    //   return '#23282c';
    // } else if (this.Framework.StatusID === 1) {
    //   return '#FFB900';
    // } else if (this.Framework.StatusID === 2) {
    //   return '#1a6634';
    // } else if (this.Framework.StatusID === 3 || this.Framework.StatusID === 4) {
    //   return '#EB273A';
    // } else {
    //   return '';
    // }

    switch (this.Framework.StatusID) {
      case 0:
        return '#23282c';
      case 1:
        return '#FFB900';
      case 2:
        return '#1a6634';
      case 3:
      case 4:
        return '#EB273A';
      default:
        return '';
    }
  }

}
