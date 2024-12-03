import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOConfig, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOEmployeeDetail } from '../../dto/DTOEmployee.dto';
import { Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PayslipService } from '../../services/payslip.service';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { Router } from '@angular/router';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
@Component({
  selector: 'app-hr-menu-staff-info',
  templateUrl: './hr-menu-staff-info.component.html',
  styleUrls: ['./hr-menu-staff-info.component.scss']
})
export class HRMenuStaffInfoComponent implements OnInit, OnDestroy {
  employee = new DTOEmployeeDetail();
  //function
  reloadSuccessSubscription: Subscription;
  changeModuleData_sst: Subscription
  getEmployeeInfo_sst: Subscription
  permissionAPI_sst: Subscription

  pickFileCallback: Function
  GetFolderCallback: Function

  deleteDialogOpened = false
  dataLoaded = false;
  dialogOpen: boolean = false;
  confirm = EnumDialogType.Confirm

  constructor(
    private apiServiceStaff: StaffApiService,
    private apiServiceMar: MarNewsProductAPIService,
    private menuService: PS_HelperMenuService,
    private layoutService: LayoutService,
    private StaffService: PayslipService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.permissionAPI_sst = this.menuService.changePermissionAPI().subscribe((res) => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.getLocalStorage();
        this.pickFileCallback = this.pickFile.bind(this)
        this.GetFolderCallback = this.GetFolderWithFile.bind(this)
        this.loadEmployeeFrom();
        this.reloadDataFrom();
      }
    })
  }

  reloadDataFrom() {
    this.reloadSuccessSubscription = this.StaffService.reloadSuccess$.subscribe(() => {
      this.dataLoaded = true;
      const res = JSON.parse(localStorage.getItem('Staff'))
      if (res.Code == 0) {
        this.employee = res
      }
      else {
        this.getEmployee();
      }
    });
  }

  openDialog() {
    this.dialogOpen = true
  }

  // Đóng dialog
  closeDialog() {
    this.dialogOpen = false
  }

  loadEmployeeFrom() {
    this.StaffService.getEmployee().subscribe((employee: DTOEmployeeDetail) => {
      this.employee = employee;
    });
  }

  getLocalStorage() {
    const res = JSON.parse(localStorage.getItem('Staff'))
    if (Ps_UtilObjectService.hasValue(res)) {
      this.employee = res
      if (this.employee.Code > 0) {
        this.getEmployee();
      }
    }
  }

  /*EMPLOYEE */
  // get EmployeeInfo
  getEmployee() {
    if (this.employee.Code > 0) {
      this.getEmployeeInfo_sst = this.apiServiceStaff.GetEmployeeInfo(this.employee.Code).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.employee = res.ObjectReturn
          if (this.employee.ListOfRoles !== null) {
            this.employee.ListOfRoles = JSON.parse(Array.from(this.employee.ListOfRoles).join(""));
          }
          if (Ps_UtilObjectService.isValidDate2(this.employee.JoinDate)) {
            // this.employee.JoinDate = new Date(this.employee.JoinDate);        
          }
          this.StaffService.activeEmployee(this.employee);
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự:  ${res.ErrorString}`);
        }
      }, (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${error}`);
      })
    }
  }

  changeMenu(linkMenu: string) {
    this.changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
      //staff
      var parent = item.ListMenu.find(f => f.Code.includes('hriStaff')
        || f.Link.includes('hriStaff'))
      //
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('staff-list')
          || f.Link.includes('staff-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(linkMenu)
            || f.Link.includes(linkMenu))
        }
        this.menuService.activeMenu(detail2);

      }
    })
  }

  isActiveMenu(link: string): boolean {
    return this.router.url === link;
  }

  deleteEmployee(prop: string[], prod = this.employee) {
    prod.ImageThumb = null,
      this.apiServiceStaff.UpdateEmployeeInfo(prod, prop).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.employee.ImageThumb = prod.ImageThumb;
          this.closeDialog();
          this.layoutService.onSuccess("Xóa thành công hình ảnh");
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa hình ảnh: ${res.ErrorString}`);
      }, (e) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa hình ảnh: ${e}`);
      });
  }

  updateEmployee(prop: string[], prod = this.employee) {
    this.apiServiceStaff.UpdateEmployeeInfo(prod, prop).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.closeDialog();
        this.layoutService.onSuccess("Cập nhật thành công hình ảnh");
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật hình ảnh: ${res.ErrorString}`);
    }, (e) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật hình ảnh: ${e}`);
    });
  }

  //Xóa hình ảnh
  delImage(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.deleteEmployee([prop])
      this.deleteDialogOpened = false;
    }
  }

  // validImg(str) {
  //   return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  // }

  pickFile(e: DTOCFFile, width, height) {
    this.employee.ImageThumb = e?.PathFile.replace('~', '')
    this.updateEmployee(['ImageThumb'])
    this.layoutService.setFolderDialog(false)
  }

  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceMar.GetFolderWithFile(childPath, DTOConfig.cache.companyid == '2' ? 18 : 14);
    //14 = folder cocautochuc
    //17 = folder LS_cocautochuc
  }

  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }

  getImgRes(str: string) {
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str) : 'assets/img/icon/icon-nonImageThumb.svg'
  }

  ngOnDestroy(): void {
    this.getEmployeeInfo_sst?.unsubscribe();
    this.reloadSuccessSubscription?.unsubscribe();
    this.changeModuleData_sst?.unsubscribe();
    this.permissionAPI_sst?.unsubscribe();
  }
}
