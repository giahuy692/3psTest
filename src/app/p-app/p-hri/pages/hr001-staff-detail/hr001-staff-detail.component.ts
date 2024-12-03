import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription, } from 'rxjs';
import { DTOEmployeeDetail, DTOEmployee } from '../../shared/dto/DTOEmployee.dto';
import { DTODepartment } from '../../shared/dto/DTODepartment.dto';
import { OrganizationAPIService } from '../../shared/services/organization-api.service';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPosition } from '../../shared/dto/DTOPosition.dto';
import { DTOLocation } from '../../shared/dto/DTOLocation.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOPositionRole } from '../../shared/dto/DTOPositionRole.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { PayslipService } from '../../shared/services/payslip.service';
import { EnumDialogType } from 'src/app/p-app/p-layout/enum/EnumDialogType';
import { DTOListHR } from '../../shared/dto/DTOPersonalInfo.dto';
import { formatDate } from '@angular/common';
import { LocalStorageService } from 'src/app/p-lib/services/local-storage.service';
import { takeUntil } from 'rxjs/operators';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';


@Component({
  selector: 'app-hr001-staff-detail',
  templateUrl: './hr001-staff-detail.component.html',
  styleUrls: ['./hr001-staff-detail.component.scss']
})
export class Hr001StaffDetailComponent implements OnInit, OnDestroy {

  //DTO Employee
  statusEmployee = new DTOEmployee();
  employee = new DTOEmployeeDetail();
  newEmployee = new DTOEmployeeDetail()

  //DTO Department
  listDepartment: DTODepartment[] = [];
  department = new DTODepartment();
  //DTO Position
  // position = new DTOPosition();
  listPosition: DTOPosition[] = [];
  listPositionStatus: DTOPosition[] = [];
  listPositionStatusFilter: DTOPosition[] = [];

  listPositionDirect: DTOPosition[] = [];
  listPositionDirectStatus: DTOPosition[] = [];
  listPositionDirectStatusFilter: DTOPosition[] = [];

  listPositionInDirect: DTOPosition[] = [];
  listPositionInDirectStatus: DTOPosition[] = [];
  listPositionInDirectStatusFilter: DTOPosition[] = [];


  //DTO PositionRole

  positionRole = new DTOPositionRole();

  //DTO Location
  location = new DTOLocation();
  listLocation: DTOLocation[] = [];
  listLocationStatus: DTOLocation[] = [];
  listLocationStatusFilter: DTOLocation[] = [];

  newEmployeeRole = new DTOPositionRole();



  //Status
  typeData: DTOStatus[] = [];
  listRole: DTOPositionRole[] = [];
  listRoleChange: DTOPositionRole[] = [];
  listRoleChangeFilter: DTOPositionRole[] = [];

  listHR: DTOListHR[] = [];
  currentLocation = new DTOLocation();
  currentStatus = new DTOStatus();
  currentListHR = new DTOListHR();
  currentReportTo = new DTOPosition();
  currentIndirect = new DTOPosition();
  currentDepartment = new DTODepartment();
  currentPositon = new DTOPosition();
  listDepartmentStatus: DTODepartment[] = [];
  listDepartmentStatusFilter: DTODepartment[] = [];


  today = new Date();
  joinDate: Date
  leaveDate: Date

  //Check
  loading = false;
  deleteDialogOpened = false
  confirm = EnumDialogType.Confirm
  selectedRoleCode: any;
  isNew: boolean = true
  isNewUserName: boolean = true
  isNewPwr: boolean = true
  isAdd: boolean = true

  //subscrition
  subArr: Subscription[] = []
  Unsubscribe = new Subject<void>();


  //Selection Dropdown


  //variable sesion share
  localStorageSubscription: Subscription


  constructor(
    private apiServiceOrganization: OrganizationAPIService,
    private apiServiceStaff: StaffApiService,
    private layoutApiService: LayoutAPIService,
    private layoutService: LayoutService,
    private paySlipService: PayslipService,
    public menuService: PS_HelperMenuService,
  ) { }


  ngOnInit() {
    // let sst = this.paySlipService.getEmployee().subscribe((employee: DTOEmployeeDetail) => {
    //   this.employee = employee;
    //   this.newEmployee = JSON.parse(JSON.stringify(this.employee))
    //   this.newEmployeeRole = null;
    //   if (this.newEmployee.JoinDate != null) {
    //     this.joinDate = new Date(this.newEmployee.JoinDate)
    //   }
    //   if (this.newEmployee.LeaveDate != null) {
    //     this.leaveDate = new Date(this.newEmployee.LeaveDate)
    //   }
    //   if (!this.paySlipService.isDataLoaded()) {
    //     this.getData();
    //     this.paySlipService.setDataLoaded(true);
    //   }
    // });

    // Đăng ký `permissionAPI` từ menuService và thực hiện xử lý sau khi có kết quả
    const permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        // Đăng ký để lấy thông tin nhân viên sau khi có quyền
        const sst = this.paySlipService.getEmployee().subscribe((employee: DTOEmployeeDetail) => {
          this.employee = employee;
          this.newEmployee = JSON.parse(JSON.stringify(this.employee));
          this.newEmployeeRole = null;

          // Xử lý ngày tham gia và ngày rời đi nếu có
          if (this.newEmployee.JoinDate != null) {
            this.joinDate = new Date(this.newEmployee.JoinDate);
          }
          if (this.newEmployee.LeaveDate != null) {
            this.leaveDate = new Date(this.newEmployee.LeaveDate);
          }

          // Kiểm tra nếu dữ liệu chưa được tải, thì tải dữ liệu và đánh dấu là đã tải
          if (!this.paySlipService.isDataLoaded()) {
            this.getData();
            this.paySlipService.setDataLoaded(true);
          }
        });

        // Đẩy cả `sst` và `permissionAPI` vào mảng `subArr` để quản lý các đăng ký
        this.subArr.push(sst);
      }
    });
    // Đẩy cả `sst` và `permissionAPI` vào mảng `subArr` để quản lý các đăng ký
    this.subArr.push(permissionAPI);
    // this.subscribeToLocalStorageChanges()  // Đăng ký thay đổi từ localStorage nếu cần
  }

  openDialog(code: number) {
    this.selectedRoleCode = code;
    this.deleteDialogOpened = true;
  }
  closeDialog() {
    this.deleteDialogOpened = false;
  }

  getData() {
    this.getListDepartment()
    this.getListHR()
    this.getTypeData()
    this.getListRole()
    this.checkIsNew()

    this.reloadEmployee()
  }

  reloadEmployee() {
    this.paySlipService.triggerReloadSuccess();
  }

  // Kiểm tra dữ liệu 
  checkIsNew() {
    if (Ps_UtilObjectService.hasValue(this.employee.Code) && Ps_UtilObjectService.hasValue(this.employee.StaffID) && (this.employee.UserName == null)) {
      this.isNewUserName = false
    } else {
      this.isNewUserName = true
    }
    if (Ps_UtilObjectService.hasValue(this.employee.Code) && Ps_UtilObjectService.hasValue(this.employee.StaffID) && (this.employee.Pwd == null)) {
      this.isNewPwr = false
    } else {
      this.isNewPwr = true
    }
    if (Ps_UtilObjectService.hasValue(this.employee.Code) && Ps_UtilObjectService.hasValue(this.employee.StaffID)) {
      this.isNew = false
    }
  }

  //Update Employee
  updateEmployee(prop: string[], prod = this.employee) {
    this.apiServiceStaff.UpdateEmployeeInfo(prod, prop).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess("Cập nhật thành công Nhân sự");
        this.employee = res.ObjectReturn
        this.newEmployee = JSON.parse(JSON.stringify(res.ObjectReturn))
        this.checkIsNew()

        if (this.apiServiceStaff.isAdd == this.isAdd) {
          localStorage.setItem('Staff', JSON.stringify(this.employee))
          this.isAdd = false
        }
        if (this.employee.ListOfRoles !== null) {
          this.employee.ListOfRoles = JSON.parse(Array.from(this.employee.ListOfRoles).join(""));
        }
        if (Ps_UtilObjectService.isValidDate2(this.employee.JoinDate)) {
          this.employee.JoinDate = new Date(this.employee.JoinDate);
        }
        if (Ps_UtilObjectService.isValidDate2(this.employee.LeaveDate)) {
          this.employee.LeaveDate = new Date(this.employee.LeaveDate);
        }
        this.paySlipService.activeEmployee(this.employee);

        // lưu vào local dùng Sesion share cho chức năng update thông tin nhân viên
        // this.localStorageService.setItem('sesionShareUpdate', res.ObjectReturn);   
      } else {
        this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Nhân sự: ' + res.ErrorString);
        this.paySlipService.activeEmployee(this.employee);
      }
      this.loading = false;

    }, (e) => {
      this.loading = false;
      this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Nhân sự: ' + e.toString());
      this.paySlipService.activeEmployee(this.employee);
    });
  }

  // hàm theo dõi data lưu trên localstorage (sestion share) để đồng bộ dữ liệu từ các tab
  // subscribeToLocalStorageChanges() {
  //   let sst = this.localStorageService.subscribeStaff('sesionShareUpdate').subscribe((newValue: any) => {
  //     if (Ps_UtilObjectService.hasValue(newValue)) {
  //       console.log("newValue: ", newValue);  
  //       this.newEmployee.StaffID =  newValue.StaffID // Mã nhân viên
  //       this.newEmployee.Email =  newValue.Email //Email
  //       this.employee.PositionGroup = newValue.PositionGroup // nhóm chức danh

  //       this.currentStatus = this.typeData?.find(t => t.OrderBy === newValue.StatusID); //tình trạng làm việc
  //       this.currentDepartment = this.listDepartment?.find(d => d.Code === newValue.Department); //đơn vị công tác
  //       // this.currentPositon = this.listPosition?.find(d => d.Code === newValue.CurrentPosition); //chức danh

  //       this.currentLocation = this.listLocation?.find(d => d.Code === newValue.Location); //điểm làm việc
  //       this.currentListHR = this.listHR?.find(hr => hr.OrderBy === newValue.TypeData); //Loại nhân viên
  //       this.currentReportTo = this.listPositionDirect?.find(d => d.Code === newValue.ReportTo);//quản lý trực tiếp
  //       this.currentIndirect = this.listPositionInDirect?.find(d => d.Code === newValue.IndirectReportTo); //quản lý gián tiếp
  //     }
  //   });
  //   this.subArr.push(sst)
  // }

  //Blur textbox
  onTextboxLoseFocus(prop: string[], item?) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      if (prop[0] == 'Email') {
        if (this.newEmployee.Email != this.employee.Email) {
          if (Ps_UtilObjectService.isValidEmail(this.newEmployee.Email) && Ps_UtilObjectService.hasValueString(this.newEmployee.Email)) {
            this.employee.Email = this.newEmployee.Email
            this.updateEmployee(prop);
          }
          else {
            this.layoutService.onError('Địa chỉ email không hợp lệ');
          }
        }
      }
      else if (prop[0] == 'StaffID') {
        if (this.newEmployee.StaffID != this.employee.StaffID) {
          if (Ps_UtilObjectService.hasValueString(this.newEmployee.StaffID)) {
            if (this.employee.ProfileID != null || this.employee.ProfileID != 0) {
              const res = JSON.parse(localStorage.getItem('Staff'))
              this.employee.ProfileID = res.ProfileID
              prop.push('ProfileID')
            }
            this.employee.StaffID = this.newEmployee.StaffID
            this.updateEmployee(prop);
          }
          else {
            this.layoutService.onError('Mã nhân viên không được để trống !');
          }
        }
      }
      // else {
      //   switch (prop) {
      //     default:
      //       this.updateEmployee(prop)
      //       break
      //   }
      // }
    }
  }

  //datepicker change value
  onDatepickerChange(prop: string,) {
    if (prop == 'JoinDate') {
      if (this.employee.JoinDate > this.today) {
        this.layoutService.onError("Vui lòng nhập ngày nhỏ hơn ngày hiện tại");
      }
      else {
        if (Ps_UtilObjectService.hasValue(this.joinDate)) {
          const dateString1 = formatDate(this.joinDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
          const dateString2 = formatDate(this.employee.JoinDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
          if (dateString1 != dateString2) {
            if (Ps_UtilObjectService.hasValueString(prop)) {
              this.employee.JoinDate = this.joinDate
              this.updateEmployee([prop], this.employee);
            }
          }
        }
      }
    }
    else {
      if (Ps_UtilObjectService.hasValue(this.leaveDate)) {
        const dateString1 = formatDate(this.leaveDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
        const dateString2 = formatDate(this.employee.LeaveDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
        if (dateString1 != dateString2) {
          if (Ps_UtilObjectService.hasValueString(prop)) {
            this.employee.LeaveDate = this.leaveDate
            this.updateEmployee([prop], this.employee);
          }
        }
      }
    }
  }

  //Update status employee info
  UpdateEmployeeStatus(items: DTOEmployeeDetail[] = [this.employee], statusID: number, statusName: string) {
    var ctx = 'Cập nhật tình trạng'
    let sst = this.apiServiceStaff.UpdateEmployeeInfoStatus(items, statusID, statusName).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.paySlipService.activeEmployee(this.employee);

        // this.localStorageService.setItem('sesionShareUpdate', items[0]);   
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.paySlipService.activeEmployee(this.employee);
      }

      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.paySlipService.activeEmployee(this.employee);
    }
    )
    this.subArr.push(sst)
  }

  //Delete Employeerole
  deleteEmployeeRole(code: number) {
    this.apiServiceStaff.DeleteEmployeeRole(code).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.layoutService.onSuccess('Xóa thành công vai trò sử dụng tài nguyên hệ thống');
        this.paySlipService.triggerReloadSuccess();
        this.closeDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa vai trò sử dụng tài nguyên hệ thống: ${res.ErrorString}`)
      }

    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi Xóa vai trò sử dụng tài nguyên hệ thống: ${err}`);
    })
  }

  // ADD Employee Role
  addEmployeeRole() {
    const staffID = this.employee.Code;
    const newEmployeeRole: DTOPositionRole = {
      ...this.newEmployeeRole,
      StaffID: staffID
    }
    if (this.employee.ListOfStaffRoles.find(c => Number(c.RoleID) == newEmployeeRole.Code)) {
      this.layoutService.onError('Vai trò sử dụng tài nguyên hệ thống đã tồn tại');
    }
    else {
      this.apiServiceStaff.AddEmployeeRole(newEmployeeRole).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
        if (res.StatusCode == 0) {
          this.layoutService.onSuccess('Thêm thành công Vai trò sử dụng tài nguyên hệ thống');
          this.paySlipService.triggerReloadSuccess();
          this.listRoleChange = this.listRoleChange.filter(item => item.RoleName !== res.ObjectReturn.Roles)
          this.listRoleChangeFilter = this.listRoleChange
          this.newEmployeeRole = null;
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi Thêm vai trò sử dụng tài nguyên hệ thống: ${res.ErrorString}`)
        }

      }, (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi Thêm vai trò sử dụng tài nguyên hệ thống: ${err}`);
      });
    }
  }

  //get ListDepartment
  getListDepartment() {
    //reset dữ liệu của dropdown
    this.listDepartmentStatus = []
    this.listPositionStatus = []
    this.listLocationStatus = []
    this.listPositionDirectStatus = []
    //
    this.apiServiceOrganization.GetListDepartment(this.department).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDepartment = res.ObjectReturn;
        //Lọc department theo tình trạng duyệt áp dụng 
        this.listDepartment.forEach((ls => {
          if (ls.StatusID == 2) {
            this.listDepartmentStatus.push(ls)
          }
        }))

        this.listDepartmentStatusFilter = this.listDepartmentStatus
        //lấy code department từ employee
        this.currentDepartment = this.listDepartment.find(d => d.Code === this.employee.Department);
        //lấy list position và location từ department
        if (Ps_UtilObjectService.hasValue(this.currentDepartment)) {
          const selectedDepartment = this.listDepartment.find(d => d.Department === this.currentDepartment.Department);
          //list position
          this.listPosition = selectedDepartment.ListPosition;
          //Lọc Position theo tình trạng duyệt áp dụng 
          this.listPosition.forEach((ls) => {
            if (ls.StatusID == 2) {
              this.listPositionStatus.push(ls)
            }
          })

          this.listPositionStatusFilter = this.listPositionStatus

          //list location
          this.listLocation = selectedDepartment.ListLocation;
          //Lọc Location theo tình trạng duyệt áp dụng 
          this.listLocation.forEach((ls) => {
            if (ls.StatusID == 2) {
              this.listLocationStatus.push(ls)
            }
          })
        }
        this.listLocationStatusFilter = this.listLocationStatus
        // lấy giá trị chức danh hiện lên dropdown
        this.currentPositon = this.listPosition.find(d => d.Code === this.employee.CurrentPosition);
        //lấy giá trị Chức danh quản lý trực tiếp hiện lên dropdown
        this.currentReportTo = this.listPosition.find(d => d.Code === this.employee.ReportTo);
        //lấy giá trị Chức danh quản lý gián tiếp hiện lên dropdown
        this.currentIndirect = this.listPositionInDirect.find(d => d.Code === this.employee.IndirectReportTo);
        //lấy giá trị Điểm làm việc hiện lên dropdown
        this.currentLocation = this.listLocation.find(d => d.Code === this.employee.Location);
        //lấy giá trị Chức danh quản lý trực tiếp hiện lên dropdown
        if (Ps_UtilObjectService.hasValue(this.currentPositon)) {
          this.listPositionStatus.forEach((item) => {
            if (item.DepartmentID === this.currentPositon.DepartmentID && (item.IsLeader == true || item.IsSupervivor == true)) {
              this.listPositionDirectStatus.push(item)
            }
          })
          this.listPositionDirectStatusFilter = this.listPositionDirectStatus
        }


        // if (Ps_UtilObjectService.hasValue(this.currentPositon)) {

        //   this.getListPositionDirect()
        // }

        this.getListPositionInDirect()

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu bộ phận: ${res.ErrorString}`);
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu bộ phận: ${error}`);
    })
  }

  //LIST STATUS
  getTypeData() {
    this.layoutApiService.GetListStatus(7).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.typeData = res.ObjectReturn
        this.currentStatus = this.typeData.find(t => t.OrderBy === this.employee.StatusID);
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${err}`);
    })
  }

  //LIST HR
  getListHR() {
    this.apiServiceStaff.GetListHR(5).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.listHR = res.ObjectReturn
        this.currentListHR = this.listHR.find(hr => hr.OrderBy === this.employee.TypeData);
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Loại nhân viên: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Loại nhân viên: ${err}`);
    });
  }

  //LIST ROLE
  getListRole() {
    this.apiServiceStaff.GetListRole().pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listRole = res.ObjectReturn;

        if (Ps_UtilObjectService.hasListValue(this.employee.ListOfStaffRoles)) {
          this.listRoleChange = this.listRole.filter(item1 =>
            !this.employee.ListOfStaffRoles.some(item2 => item2.Roles === item1.RoleName)
          );
          this.listRoleChangeFilter = this.listRoleChange
        }
        else
          this.listRoleChange = this.listRole
        this.listRoleChangeFilter = this.listRoleChange
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu vai trò sử dụng tài nguyên hệ thống: ${res.ErrorString}`);
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu vai trò sử dụng tài nguyên hệ thống: ${error}`);
    })
  }

  // GetListPosition DIRECT/
  getListPositionDirect() {
    this.listPositionDirectStatus = []
    this.listPositionDirectStatusFilter = []
    this.apiServiceOrganization.GetListPosition(this.currentPositon).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPositionDirect = res.ObjectReturn;
        this.listPositionDirect.forEach((ls) => {
          if (ls.StatusID == 2) {
            this.listPositionDirectStatus.push(ls)
          }
        })

        this.listPositionDirectStatus.forEach((item) => {
          if (item.DepartmentID === this.currentPositon.DepartmentID && (item.IsLeader == true || item.IsSupervivor == true)) {
            this.listPositionDirectStatusFilter.push(item)
          }
        })


        // this.listPositionDirectStatusFilter = this.listPositionDirectStatus


        // this.listPositionDirectStatusFilter = this.listPositionDirectStatus
        this.currentReportTo = this.listPositionDirect.find(d => d.Code === this.employee.ReportTo);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu chức danh quản lý trực tiếp: ${res.ErrorString}`);
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu chức danh quản lý trực tiếp: ${error}`);
    })
  }
  // GetListPosition IN DIRECT/
  getListPositionInDirect() {
    const currentPositon = new DTOPosition
    this.apiServiceOrganization.GetListPositionIndirect(currentPositon).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPositionInDirect = res.ObjectReturn;
        this.listPositionInDirect.forEach((ls) => {
          if (ls.StatusID == 2) {
            this.listPositionInDirectStatus.push(ls)
          }
        })
        this.currentIndirect = this.listPositionInDirect.find(d => d.Code === this.employee.IndirectReportTo);
        this.listPositionInDirectStatusFilter = this.listPositionInDirectStatus
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu chức danh quản lý gián tiếp: ${res.ErrorString}`);
      }
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy dữ liệu chức danh quản lý gián tiếp: ${error}`);
    })
  }

  //Dropdown find value choose
  onDropdownlistClick(e, dropdownName: string[]) {
    switch (dropdownName[0]) {
      case 'Department':
        // check giá trị được nhập trên dropdown department để chọn những value liên quan
        if (Ps_UtilObjectService.hasValue(this.currentDepartment)) {
          this.listPositionStatus = []
          this.listLocationStatus = []

          const selectedDepartment = this.listDepartmentStatus.find(d => d.DepartmentID === this.currentDepartment.DepartmentID);
          if (selectedDepartment) {

            this.listPosition = selectedDepartment.ListPosition;

            this.listPosition.forEach((ls) => {
              if (ls.StatusID == 2) {
                this.listPositionStatus.push(ls)
              }
            })
            this.listPositionStatusFilter = this.listPositionStatus

            this.listLocation = selectedDepartment.ListLocation;

            this.listLocation.forEach((ls) => {
              if (ls.StatusID == 2) {
                this.listLocationStatus.push(ls)
              }
            })
            this.listLocationStatusFilter = this.listLocationStatus

            if (Ps_UtilObjectService.hasValue(this.currentPositon)) {
              this.listPositionDirectStatus = this.listPositionStatus.filter(p =>
                p.DepartmentID === this.currentPositon.DepartmentID && (p.IsLeader == true || p.IsSupervivor == true))
              this.listPositionDirectStatusFilter = this.listPositionDirectStatus
            }
          } else {
            this.listPosition = [];
            this.listLocation = [];
            this.listPositionStatusFilter = []
            this.listLocationStatusFilter = []
          }
        }
        // Department
        this.currentDepartment = e
        this.employee.Department = this.currentDepartment.Code
        //Position
        if (this.currentPositon != null) {
          this.currentPositon = null
          this.employee.CurrentPosition = null
          dropdownName.push('CurrentPosition')
        }
        //Location
        if (this.currentLocation != null) {
          this.currentLocation = null
          this.employee.Location = null
          dropdownName.push('Location')
        }
        //ReportTo
        if (this.currentReportTo != null) {
          if (Ps_UtilObjectService.hasValue(this.currentPositon)) {
            this.listPositionDirectStatus = this.listPositionStatus.filter(p =>
              p.DepartmentID === this.currentPositon.DepartmentID && (p.IsLeader === true || p.IsSupervivor == true))
            this.listPositionDirectStatusFilter = this.listPositionDirectStatus
          }
          this.currentReportTo = null
          this.employee.ReportTo = null
          dropdownName.push('ReportTo')
        }

        this.updateEmployee(dropdownName)
        break;
      case 'CurrentPosition':
        if (Ps_UtilObjectService.hasValue(this.currentPositon)) {
          this.listPositionDirectStatusFilter = this.listPositionStatus.filter(p =>
            p.DepartmentID === this.currentPositon.DepartmentID && (p.IsLeader === true || p.IsSupervivor == true))

        }
        if (this.currentReportTo != null) {
          this.currentReportTo.Code = null
          this.employee.ReportTo = this.currentReportTo.Code
          dropdownName.push('ReportTo')
        }
        this.currentPositon = e
        this.employee.CurrentPosition = this.currentPositon.Code
        this.updateEmployee(dropdownName)
        break;
      case 'Location':
        this.currentLocation = e
        this.employee.Location = this.currentLocation.Code
        this.updateEmployee(dropdownName)
        break;
      case 'TypeData':
        this.currentListHR = e
        this.employee.TypeData = this.currentListHR.OrderBy
        this.updateEmployee(dropdownName)
        break;
      case 'Status':
        this.currentStatus = e
        this.employee.StatusID = this.currentStatus.OrderBy
        this.employee.StatusName = this.currentStatus.StatusName
        this.UpdateEmployeeStatus([this.employee], this.employee.StatusID, this.employee.StatusName);
        break;
      case 'ReportTo':

        this.currentReportTo = e
        this.employee.ReportTo = this.currentReportTo.Code
        this.updateEmployee(dropdownName)
        break;
      case 'IndirectReportTo':
        this.currentIndirect = e
        if (Ps_UtilObjectService.hasValue(this.currentIndirect)) {
          this.employee.IndirectReportTo = this.currentIndirect.Code
          this.updateEmployee(dropdownName)
          break;
        }
    }
  }

  handleFilterDropdownlist(value, DropdownList, currentDropdownList, ListName, textField) {

    DropdownList = currentDropdownList

    if (value !== '') {
      this[ListName] = DropdownList.filter(
        (s) => s[textField].toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    } else {
      this[ListName] = currentDropdownList
    }

  }

  ngOnDestroy() {
    this.subArr.map(s => {
      s?.unsubscribe();
    });
    this.paySlipService.resetDataLoaded();

    this.Unsubscribe.next();
    this.Unsubscribe.complete();

    // localStorage.removeItem('sesionShareUpdate')
  }
}