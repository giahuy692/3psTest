import { Component, OnInit, ViewChild } from '@angular/core';
// import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Subject } from 'rxjs';
// import { Subject, Subscription } from 'rxjs';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { distinct } from '@progress/kendo-data-query/dist/npm/array.operators';
import { PayslipService } from '../../shared/services/payslip.service';
import { takeUntil } from 'rxjs/operators';
import { PersonalInfoDetailComponent } from 'src/app/p-app/p-layout/components/personal-info-detail/personal-info-detail.component';


@Component({
  selector: 'app-hr007-personal-info',
  templateUrl: './hr007-personal-info.component.html',
  styleUrls: ['./hr007-personal-info.component.scss']
})

export class Hri007PersonalInfoComponent implements OnInit {
  //#region ViewChild
  @ViewChild('personalInfoRef') personalInfoRef : PersonalInfoDetailComponent
  //#endregion

  //PERMISSION
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  actionPerm: DTOActionPermission[] = []
  //#endregion 
  justLoaded = true
  isLockAll: boolean = false

  //#region Subject
  unsubscribe = new Subject<void>();
  //#endregion

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public payslipService: PayslipService,
  ) {
  }
  

  ngOnInit(): void {
    let that = this
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
      }
    })
  }

  loadPage(){
    this.personalInfoRef.loadPage()
  }

  onAddNew(){
    this.personalInfoRef.onAddNew()
  }

  // Lấy Dữ liệu lưu trên Cache
  getCache() {
    const companyRes = localStorage.getItem('Company');
    if (Ps_UtilObjectService.hasValue(companyRes)) {
      if (companyRes == '4') {
        this.isLockAll = false;
      }
      else {
        this.isLockAll = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
//   //#region Boolean
//   dropdownStates: { [key: string]: boolean } = {};
//   loading: boolean = false
//   isLockAll: boolean = false
//   justLoaded = true
//   isAdd: boolean = true
//   isEmailValid: boolean = false;

//   //PERMISTION
//   isToanQuyen = false
//   isAllowedToCreate = false
//   isAllowedToVerify = false

//   //#endregion 

//   //address
//   hasValueCountry1: boolean = false
//   hasValueProvince1: boolean = false
//   hasValueDistrict1: boolean = false

//   hasValueCountry2: boolean = false
//   hasValueProvince2: boolean = false
//   hasValueDistrict2: boolean = false

//   //#region ObjectDrodown
//   SelectedGender: { ListName: string; OrderBy: number }
//   SelectedMarital: { ListName: string; OrderBy: number }
//   SelectedCountry: { VNName: string; Code: number }
//   SelectedEthnic: { ListName: string; OrderBy: number }
//   SelectedReligion: { ListName: string; OrderBy: number }
//   //edu
//   SelectedEducation: { ListName: string; OrderBy: number }
//   SelectedEduRank: { ListName: string; OrderBy: number }
//   SelectedEduDegree: { ListName: string; OrderBy: number }
//   //social
//   SelectedOtherSocialNetworkTypeData: { ListName: string; OrderBy: number }
//   SelectedSocialNetworkTypeData: { ListName: string; OrderBy: number }
//   SelectedchatVoIP: { ListName: string; OrderBy: number }
//   //address
//   SelectedNationality: { VNName: string; Code: number | string }

//   SelectedCountry1: { VNName: string; Code: number }
//   SelectedProvince1: { VNProvince: string; Code: number }
//   SelectedDistrict1: { VNDistrict: string; Code: number }
//   SelectedWard1: { VNWard: string; Code: number }

//   SelectedCountry2: { VNName: string; Code: number }
//   SelectedProvince2: { VNProvince: string; Code: number }
//   SelectedDistrict2: { VNDistrict: string; Code: number }
//   SelectedWard2: { VNWard: string; Code: number }

//   // 
//   SelectedBirthYear: { ListName: string; OrderBy: number }
//   SelectedBirthMonth: { ListName: string; OrderBy: number }
//   SelectedBirthDay: { ListName: string; OrderBy: number }
//   //#endregion

//   //#region ObjectDTO
//   personal = new DTOPersonalInfo()
//   employee = new DTOEmployee()
//   personalCertificateType1 = new DTOPersonalCertificate()
//   personalCertificateType2 = new DTOPersonalCertificate()
//   personalContact = new DTOPersonalContact()
//   personalAddressType1 = new DTOPersonalAddress()
//   personalAddressType2 = new DTOPersonalAddress()
//   //#endregion

//   //DATE
//   EffDateCCCD: Date
//   ExpDateCCCD: Date
//   EffDatePP: Date
//   ExpDatePP: Date
//   PITEffDate: Date
//   //STRING
//   CCCDCode: string = ''
//   PassportCode: string = ''
//   issuedbyCCCD: string = ''
//   issuedbyPass: string = ''
//   PermanentAddress: string = ''
//   TemporaryResidenceAddress: string = ''
//   //#region Kendo Filter
//   gridState: State = {
//     filter: { filters: [], logic: 'and' },
//   }
//   groupFilter: CompositeFilterDescriptor = {
//     logic: "or",
//     filters: []
//   }
//   filterProvince: FilterDescriptor = {
//     field: "Country", operator: "eq", value: 1
//   }
//   filterDistrict: FilterDescriptor = {
//     field: "Province", operator: "eq", value: 1
//   }
//   filterWard: FilterDescriptor = {
//     field: "District", operator: "eq", value: 1
//   }
//   //#endregion

//   //#region Array
//   actionPerm: DTOActionPermission[] = []
//   //NATION
//   listNationality: DTOListCountry[] = [];
//   listNationalityFilter: DTOListCountry[] = [];
//   //PROVINCE
//   provinceList1: DTOLSProvince[] = [];
//   provinceList1Filter: DTOLSProvince[] = [];
//   provinceList2: DTOLSProvince[] = [];
//   provinceList2Filter: DTOLSProvince[] = [];
//   //DISTRICT
//   districtList1: DTOLSDistrict[] = [];
//   districtList1Filter: DTOLSDistrict[] = [];
//   districtList2: DTOLSDistrict[] = [];
//   districtList2Filter: DTOLSDistrict[] = [];
//   //WARD
//   wardList1: DTOLSWard[] = [];
//   wardList1Filter: DTOLSWard[] = [];
//   wardList2: DTOLSWard[] = [];
//   wardList2Filter: DTOLSWard[] = [];
//   //dropdownbirthday
//   years: any[];
//   dropdownDay: any[];
//   dropdownMonth: any[];
//   // 
//   ListpersonalCertificate: DTOPersonalCertificate[] = []
//   ListpersonalAddress: DTOPersonalAddress[] = []

//   //#endregion

//   //object 
//   //INFO
//   //ADDRESS
//   province = new DTOLSProvince()
//   district = new DTOLSDistrict()
//   ward = new DTOLSWard()
//   Country = new DTOListCountry()
//   //DATE
//   today: Date = new Date()
//   minDate: Date = new Date();
//   maxDate: Date = new Date();

//   minEXPDate: Date = new Date();
//   maxEXPDate: Date = new Date();
//   component: { EffDate: Date; }[];
//   //ARRAY
//   List: { [key: string]: DTOListHR[] } = {}
//   ListFilter: { [key: string]: DTOListHR[] } = {}

//   //#region Subject
//   unsubscribe = new Subject<void>();
//   //#endregion


//   constructor(
//     public menuService: PS_HelperMenuService,
//     private apiServiceStaff: StaffApiService,
//     public layoutService: LayoutService,
//     public payslipService: PayslipService,

//   ) {
//     this.years = this.generateYearList()
//     this.dropdownDay = this.getDaysInMonth(1);
//     this.dropdownMonth = this.getMonth()
//   }

//   //
//   ngOnInit(): void {
//     let that = this

//     that.loading = true;
//     this.minDate.setFullYear(this.minDate.getFullYear() - 60);
//     this.maxEXPDate.setFullYear(this.maxEXPDate.getFullYear() + 80);

//     this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
//       if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
//         that.justLoaded = false
//         that.actionPerm = distinct(res.ActionPermission, "ActionType")

//         that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
//         that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
//         that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
//         this.getCache()
//       }
//       this.loading = false;
//     })
//   }
//   //

//   //#region API

//   // lấy thông tin Nhân sự
//   APIGetPersonalInfo(Code: number, TypeData: number) {
//     this.loading = true;

//     this.apiServiceStaff.GetPersonalInfo(Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personal = res.ObjectReturn;
//         this.assignDropdownValue()
//       }
//       else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${res.ErrorString}`)
//       }
//       if (TypeData == 1) {
//         this.APIGetPersonalContact()
//         this.APIGetPersonalCertificate()
//         this.APIGetPersonalAddress()
//       }

//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${err.toString()}`);
//       this.loading = false;
//     });
//   }

//   // lấy thông tin Chứng Thực
//   APIGetPersonalCertificate() {
//     this.loading = true;

//     this.apiServiceStaff.GetPersonalCertificate(this.employee.ProfileID).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.ListpersonalCertificate = res.ObjectReturn
//         if (this.ListpersonalCertificate.length == 0) {
//           for (let index = 1; index <= 2; index++) {
//             this[`personalCertificateType${index}`].TypeData = index
//             this[`personalCertificateType${index}`].ProfileID = this.personal.ProfileID
//             this.ListpersonalCertificate.push(this[`personalCertificateType${index}`])
//           }
//         } else if (this.ListpersonalCertificate.length == 1) {
//           let hasTypeData1 = this.ListpersonalCertificate.findIndex(i => i.TypeData == 1)
//           if (hasTypeData1 == -1) {
//             this.personalCertificateType1.TypeData = 1
//             this.personalCertificateType1.ProfileID = this.personal.ProfileID
//             this.ListpersonalCertificate.push(this.personalCertificateType1)
//           } else {
//             this.personalCertificateType2.TypeData = 2
//             this.personalCertificateType2.ProfileID = this.personal.ProfileID
//             this.ListpersonalCertificate.push(this.personalCertificateType2)
//           }
//         }
//         this.personalCertificateType1 = this.ListpersonalCertificate.find(i => i.TypeData == 1)
//         this.personalCertificateType2 = this.ListpersonalCertificate.find(i => i.TypeData == 2)
//         this.assignDate()
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chứng thực nhân sự: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chứng thực nhân sự: ${err}`);
//       this.loading = false;
//     })
//   }

//   // lấy thông tin liên hệ
//   APIGetPersonalContact() {
//     this.loading = true;

//     this.apiServiceStaff.GetPersonalContact(this.personal.ProfileID).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (res.StatusCode == 0) {
//         if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
//           this.personalContact = res.ObjectReturn;

//           this.SelectedSocialNetworkTypeData = { ListName: this.personalContact.SocialNetworkTypeDataName, OrderBy: this.personalContact.SocialNetworkTypeData }
//           this.SelectedOtherSocialNetworkTypeData = { ListName: this.personalContact.OtherSocialNetworkTypeDataName, OrderBy: this.personalContact.OtherSocialNetworkTypeData }
//           this.SelectedchatVoIP = { ListName: this.personalContact.VoIPTypeDataName, OrderBy: this.personalContact.VoIPTypeData }
//         }
//       }
//       else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${err}`);
//       this.loading = false;
//     })
//   }

//   // lấy thông tin Địa chỉ cư trú
//   APIGetPersonalAddress() {
//     this.loading = true;

//     this.apiServiceStaff.GetPersonalAddress(this.personal.ProfileID).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.ListpersonalAddress = res.ObjectReturn
//         if (this.ListpersonalAddress.length == 0) {
//           for (let index = 1; index <= 2; index++) {
//             this[`personalAddressType${index}`].TypeData = index
//             this[`personalAddressType${index}`].Profile = this.personal.ProfileID
//             this.ListpersonalAddress.push(this[`personalAddressType${index}`])
//           }
//         } else if (this.ListpersonalAddress.length == 1) {
//           let hasTypeData1 = this.ListpersonalAddress.findIndex(i => i.TypeData == 1)
//           if (hasTypeData1 == -1) {
//             this.personalAddressType1.TypeData = 1
//             this.personalAddressType1.Profile = this.personal.ProfileID
//             this.ListpersonalAddress.push(this.personalAddressType1)
//           } else {
//             this.personalAddressType2.TypeData = 2
//             this.personalAddressType2.Profile = this.personal.ProfileID
//             this.ListpersonalAddress.push(this.personalAddressType2)
//           }
//         }
//         this.personalAddressType1 = this.ListpersonalAddress.find(i => i.TypeData == 1)
//         this.personalAddressType2 = this.ListpersonalAddress.find(i => i.TypeData == 2)
//         this.assignDropdownAddress(1)
//         this.assignDropdownAddress(2)
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin địa chỉ cư trú nhân sự: ${res.ObjectReturn}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin địa chỉ cư trú nhân sự: ${err}`);
//       this.loading = false;
//     })
//   }

//   // Lấy dữ liệu dropdrown
//   APIGetListHr(Key: string, Code: number) {
//     this.loading = true;
//     this.apiServiceStaff.GetListHR(Code).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         this.List[Key] = res.ObjectReturn
//         this.ListFilter[Key] = this.List[Key]
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${err}`);
//       this.loading = false;
//     });
//   }

//   // Lấy dữ liệu dropdrown Quốc gia 
//   APIGetNationality() {
//     this.loading = true;
//     this.apiServiceStaff.GetListCountry().pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         this.listNationality = res.ObjectReturn.Data
//         this.listNationalityFilter = JSON.parse(JSON.stringify(res.ObjectReturn.Data))
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${err}`);
//       this.loading = false;
//     });
//   }

//   //Lấy dữ liệu dropdrown Tỉnh thành
//   APIGetListProvince(typeData: number, state: State) {
//     // switch (typeData) {
//     //   case 1:
//     var ctx = 'lấy Danh sách Tỉnh thành '
//     this.loading = true;

//     this.apiServiceStaff.GetListProvince(state).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.provinceList1 = data
//           this.provinceList1Filter = JSON.parse(JSON.stringify(data))
//         }
//         else {
//           ctx += 'Tạm trú'
//           this.provinceList2 = data
//           this.provinceList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//       this.loading = false;
//     });
//   }

//   //Lấy dữ liệu dropdrown Quận/huyện
//   APIGetListDistrict(typeData: number, state: State) {
//     var ctx = 'lấy Danh sách Quận huyện '
//     this.loading = true;

//     this.apiServiceStaff.GetListDistrict(state).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.districtList1 = data
//           this.districtList1Filter = JSON.parse(JSON.stringify(data))
//         } else {
//           ctx += 'Tạm trú'
//           this.districtList2 = data
//           this.districtList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//       this.loading = false;
//     });
//   }

//   //Lấy dữ liệu dropdrown Phường/xã
//   APIGetListWard(typeData: number, state: State) {
//     // switch (typeData) {
//     //   case 1:
//     var ctx = 'lấy Danh sách Phường xã '
//     this.loading = true;

//     this.apiServiceStaff.GetListWard(state).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.wardList1 = data
//           this.wardList1Filter = JSON.parse(JSON.stringify(data))
//         } else {
//           ctx += 'Tạm trú'
//           this.wardList2 = data
//           this.wardList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     },
//       (error) => {
//         this.loading = false;
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
//       }
//     );
//   }

//   //
//   generateYearList(): any[] {
//     const currentYear = new Date().getFullYear();
//     const startYear = currentYear - 60;
//     const endYear = currentYear - 18
//     const yearList = [];

//     for (let year = endYear; year >= startYear; year--) {
//       yearList.push({ ListName: year.toString(), OrderBy: year });
//     }

//     return yearList;
//   }

//   // Kiểm tra xem có phải là năm nhuận hay không.
//   isLeapYear(year: number): boolean {
//     return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
//   }

//   // Tạo ra danh sách các tháng từ 1 đến 12.
//   getMonth(): any[] {
//     const monthList = [];
//     for (let year = 1; year <= 12; year++) {
//       monthList.push({ ListName: year.toString(), OrderBy: year });
//     }
//     return monthList
//   }

//   // Tạo ra danh sách các ngày trong tháng được chọn.
//   getDaysInMonth(selectedMonth: number): any[] {
//     const dayList = [];
//     switch (selectedMonth) {
//       case 2:
//         const isLeapYear = this.isLeapYear(this.SelectedBirthYear.OrderBy);

//         // Tạo danh sách ngày từ 1 đến 29 hoặc 28 tùy thuộc vào năm nhuận.
//         if (isLeapYear == true) {
//           for (let day = 1; day <= 29; day++) {
//             dayList.push({ ListName: day.toString(), OrderBy: day });
//           }
//         } else {
//           for (let day = 1; day <= 28; day++) {
//             dayList.push({ ListName: day.toString(), OrderBy: day });
//           }
//         }
//         return dayList;
//       case 4:
//       case 6:
//       case 9:
//       case 11: // Tháng 4, 6, 9, 11 có 30 ngày.
//         for (let day = 1; day <= 30; day++) {
//           dayList.push({ ListName: day.toString(), OrderBy: day });
//         }
//         return dayList;
//       default:  // Các tháng còn lại có 31 ngày.
//         for (let day = 1; day <= 31; day++) {
//           dayList.push({ ListName: day.toString(), OrderBy: day });
//         }
//         return dayList;
//     }
//   }

//   //Update
//   //Update Thông tin Nhân sự
//   UpdatePersonalInfo(prop: string[], prod = this.personal) {
//     this.loading = true
//     this.apiServiceStaff.UpdatePersonalInfo(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personal = res.ObjectReturn
//         this.layoutService.onSuccess("Cập nhật thông tin nhân sự thành công");
//         if (this.isAdd) {
//           var newEmployee = new DTOEmployeeDetail()
//           newEmployee.ProfileID = this.personal.Code
//           localStorage.setItem('Staff', JSON.stringify(newEmployee))
//           this.isAdd = false
//         }

//         if (prop[0] == 'LastName' || prop[0] == 'MiddleName' || prop[0] == 'FirstName') {
//           this.payslipService.triggerReloadSuccess();
//         }
//         this.assignDropdownValue()
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${res.ErrorString}`);
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${err}`);
//     })
//   }

//   //Update Thông tin chứng thực
//   UpdatePersonalCertificate(prop: string[], prod: DTOPersonalCertificate) {
//     this.loading = true
//     this.apiServiceStaff.UpdatePersonalCertificate(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         if (res.ObjectReturn.TypeData == 1) {
//           this.personalCertificateType1 = res.ObjectReturn
//         } else if (res.ObjectReturn.TypeData == 2) {
//           this.personalCertificateType2 = res.ObjectReturn
//         }
//         this.layoutService.onSuccess("Cập nhật Thông tin chứng thực thành công");
//       } else {
//         this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + res.ErrorString);
//         this.APIGetPersonalCertificate()
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalCertificate()
//       this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + err);
//     })
//   }

//   //Update Thông tin liên hệ
//   UpdatePersonalContact(prop: string[], prod = this.personalContact) {
//     this.loading = true

//     this.apiServiceStaff.UpdatePersonalContact(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personalContact = res.ObjectReturn
//         this.layoutService.onSuccess("Cập nhật Thông tin liên hệ thành công");
//       } else {
//         this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + res.ErrorString);
//         this.APIGetPersonalContact()
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalContact()
//       this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + err);
//     })
//   }

//   //Update Thông tin địa chỉ cư trú
//   UpdatePersonalAddress(prop: string[], prod: DTOPersonalAddress) {
//     this.loading = true
//     var ctx = 'Cập nhật địa chỉ '

//     this.apiServiceStaff.UpdatePersonalAddress(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         if (res.ObjectReturn.TypeData == 1) {
//           ctx += 'thường trú'
//           this.personalAddressType1 = res.ObjectReturn
//         } else if (res.ObjectReturn.TypeData == 2) {
//           ctx += 'tạm trú'
//           this.personalAddressType2 = res.ObjectReturn
//         }
//         this.layoutService.onSuccess(ctx + " thành công");
//       } else {
//         this.APIGetPersonalAddress()
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalAddress()
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//     })
//   }

//   //#endregion

//   //#region Logic

//   // Lấy Dữ liệu lưu trên Cache
//   getCache() {
//     const res = JSON.parse(localStorage.getItem('Staff'))
//     if (Ps_UtilObjectService.hasValue(res)) {
//       this.employee = res
//       if (this.employee.Code != 0) {
//         this.isAdd = false
//         if (!this.isAdd && this.employee.ProfileID != null) {
//           this.APIGetPersonalInfo(this.employee.ProfileID, 1)
//         }
//       } else {
//         this.isAdd = this.apiServiceStaff.isAdd
//       }
//     }
//   }

//   //load lại trang khi click vào breacrum
//   loadPage() {
//     this.getCache()
//   }


//   // Xử lý logic nút "Tạo mới"
//   onAddNew() {
//     this.isAdd = true
//     this.apiServiceStaff.isAdd = true
//     const res = JSON.parse(localStorage.getItem('Staff'))
//     this.employee = res

//     if (this.employee.Code != 0) {
//       // clear block THÔNG TIN CƠ BẢN
//       this.personal = new DTOPersonalInfo()
//       this.assignDropdownValue()

//       // clear block THÔNG TIN CHỨNG THỰC VÀ THUẾ TNCN
//       this.personalCertificateType1 = new DTOPersonalCertificate()
//       this.personalCertificateType2 = new DTOPersonalCertificate()
//       this.ListpersonalCertificate = []
//       for (let index = 1; index <= 2; index++) {
//         this[`personalCertificateType${index}`].TypeData = index
//         this[`personalCertificateType${index}`].ProfileID = this.personal.ProfileID
//         this.ListpersonalCertificate.push(this[`personalCertificateType${index}`])
//       }
//       this.personalCertificateType1 = this.ListpersonalCertificate.find(i => i.TypeData == 1)
//       this.personalCertificateType2 = this.ListpersonalCertificate.find(i => i.TypeData == 2)
//       this.assignDate()

//       //clear block THÔNG TIN LIÊN HỆ
//       this.personalContact = new DTOPersonalContact()
//       this.SelectedSocialNetworkTypeData = null;
//       this.SelectedOtherSocialNetworkTypeData = null;
//       this.SelectedchatVoIP = null

//       // clear block ĐỊA CHỈ CƯ TRÚ
//       this.personalAddressType1 = new DTOPersonalAddress()
//       this.personalAddressType2 = new DTOPersonalAddress()
//       this.assignDropdownAddress(1)
//       this.assignDropdownAddress(2)

//       if (this.isAdd) {
//         localStorage.setItem('Staff', JSON.stringify(new DTOEmployeeDetail()));
//         this.payslipService.triggerReloadSuccess();
//       }
//     }
//   }

//   /**
//    * Gán giá trị cho các lựa chọn dropdown dựa trên dữ liệu cá nhân.
//    * Thiết lập các tùy chọn được chọn cho giới tính, tình trạng hôn nhân, dân tộc, tôn giáo,
//    * quốc tịch, trình độ học vấn, xếp hạng học vấn, bằng cấp học vấn, ngày sinh, và PITEffDate.
//    */
//   assignDropdownValue() {
//     this.SelectedGender = { ListName: this.personal.GenderName, OrderBy: this.personal.Gender == 0 ? null : this.personal.Gender }
//     this.SelectedMarital = { ListName: this.personal.MaritalName, OrderBy: this.personal.Marital == 0 ? null : this.personal.Marital }
//     this.SelectedEthnic = { ListName: this.personal.EthnicName, OrderBy: this.personal.Ethnic == 0 ? null : this.personal.Ethnic }
//     this.SelectedReligion = { ListName: this.personal.ReligionName, OrderBy: this.personal.Religion == 0 ? null : this.personal.Religion }
//     this.SelectedNationality = { VNName: this.personal.NationalityName, Code: this.personal.Nationality == 0 ? null : this.personal.Nationality }
//     this.SelectedEducation = { ListName: this.personal.EducationName, OrderBy: this.personal.Education == 0 ? null : this.personal.Education }
//     this.SelectedEduRank = { ListName: this.personal.EduRankName, OrderBy: this.personal.EduRank == 0 ? null : this.personal.EduRank }
//     this.SelectedEduDegree = { ListName: this.personal.EduDegreeName, OrderBy: this.personal.EduDegree == 0 ? null : this.personal.EduDegree }

//     this.SelectedBirthYear = this.years.find(i => i.OrderBy == this.personal.BirthYear)
//     this.SelectedBirthMonth = this.dropdownMonth.find(i => i.OrderBy == this.personal.BirthMonth)
//     this.SelectedBirthDay = this.dropdownDay.find(i => i.OrderBy == this.personal.BirthDay)
//     if (Ps_UtilObjectService.hasValue(this.SelectedBirthMonth)) {
//       this.dropdownDay = this.getDaysInMonth(this.SelectedBirthMonth.OrderBy)
//     }

//     if (Ps_UtilObjectService.hasValueString(this.personal.PITEffDate)) {
//       this.PITEffDate = new Date(this.personal.PITEffDate)
//     } else {
//       this.PITEffDate = null
//     }
//   }

//   // Xử lý filter trong dropdownlist
//   handleFilterDropdownlist(event, currentDropdownList: any[], DropdownList: any[], typeName: string, textField: string, type?) {
//     DropdownList = currentDropdownList

//     if (event !== '') {
//       if (type == 1) {
//         this.ListFilter[typeName] = DropdownList.filter(
//           (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
//         );
//       } else {
//         this[typeName] = DropdownList.filter(
//           (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
//         );
//       }
//     } else {
//       if (type == 1) {
//         this.ListFilter[typeName] = currentDropdownList
//       } else {
//         this[typeName] = currentDropdownList;
//       }
//     }
//   }

//   // Kiểm tra và gán giá trị ngày tháng (ngày hiệu lực và ngày hết hạn)
//   assignDate() {
//     if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.EffDate)) {
//       this.EffDateCCCD = new Date(this.personalCertificateType1.EffDate)
//     } else {
//       this.EffDateCCCD = null
//     }

//     if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.ExpDate)) {
//       this.ExpDateCCCD = new Date(this.personalCertificateType1.ExpDate)
//     } else {
//       this.ExpDateCCCD = null
//     }

//     if (Ps_UtilObjectService.hasValueString(this.personalCertificateType2.EffDate)) {
//       this.EffDatePP = new Date(this.personalCertificateType2.EffDate)
//     } else {
//       this.EffDatePP = null
//     }

//     if (Ps_UtilObjectService.hasValueString(this.personalCertificateType2.ExpDate)) {
//       this.ExpDatePP = new Date(this.personalCertificateType2.ExpDate)
//     } else {
//       this.ExpDatePP = null
//     }
//   }

//   /**
//    * Hàm gán thông tin địa chỉ được chọn vào các thuộc tính tương ứng của đối tượng địa chỉ cá nhân 
//    * (SelectedCountry, SelectedProvince, SelectedDistrict, SelectedWard) dựa trên tham số 'type'.
//    */
//   assignDropdownAddress(type: number) {
//     this[`SelectedCountry${type}`] = { VNName: this[`personalAddressType${type}`].CountryName, Code: this[`personalAddressType${type}`].Country == 0 ? null : this[`personalAddressType${type}`].Country }
//     this[`SelectedProvince${type}`] = { VNProvince: this[`personalAddressType${type}`].ProvinceName, Code: this[`personalAddressType${type}`].Province == 0 ? null : this[`personalAddressType${type}`].Province }
//     this[`SelectedDistrict${type}`] = { VNDistrict: this[`personalAddressType${type}`].DistrictName, Code: this[`personalAddressType${type}`].District == 0 ? null : this[`personalAddressType${type}`].District }
//     this[`SelectedWard${type}`] = { VNWard: this[`personalAddressType${type}`].WardName, Code: this[`personalAddressType${type}`].Ward == 0 ? null : this[`personalAddressType${type}`].Ward }

//     if (this[`SelectedCountry${type}`].Code != null) {
//       this[`hasValueCountry${type}`] = true
//     } else {
//       this[`hasValueCountry${type}`] = false
//     }

//     if (this[`SelectedProvince${type}`].Code != null) {
//       this[`hasValueProvince${type}`] = true
//     } else {
//       this[`hasValueProvince${type}`] = false
//     }

//     if (this[`SelectedDistrict${type}`].Code != null) {
//       this[`hasValueDistrict${type}`] = true
//     } else {
//       this[`hasValueDistrict${type}`] = false
//     }
//   }


//   // Lấy danh sách tỉnh, huyện, xã theo typeData 1
//   OpenProvince1() {
//     var f = { ...this.loadFilter(1) }
//     this.APIGetListProvince(1, f)
//   }

//   OpenDistrict1() {
//     var f = { ... this.loadFilter(2) }
//     this.APIGetListDistrict(1, f)
//   }

//   OpenWard1() {
//     var f = { ... this.loadFilter(5) }
//     this.APIGetListWard(1, f)
//   }


//   // Lấy danh sách tỉnh, huyện, xã theo typeData 2
//   OpenProvince2() {
//     var f = { ... this.loadFilter(3) }
//     this.APIGetListProvince(2, f)
//   }

//   OpenDistrict2() {
//     var f = { ...  this.loadFilter(4) }
//     this.APIGetListDistrict(2, f)
//   }

//   OpenWard2() {
//     var f = { ... this.loadFilter(6) }
//     this.APIGetListWard(2, f)
//   }

//   // Hàm load filter 
//   loadFilter(code: number) {
//     this.gridState.filter.filters = [];
//     this.groupFilter.filters = [];

//     const addressMappings = {
//       1: { filterField: this.filterProvince, addressIndex: 1, addressField: 'Country' },
//       2: { filterField: this.filterDistrict, addressIndex: 1, addressField: 'Province' },
//       3: { filterField: this.filterProvince, addressIndex: 2, addressField: 'Country' },
//       4: { filterField: this.filterDistrict, addressIndex: 2, addressField: 'Province' },
//       5: { filterField: this.filterWard, addressIndex: 1, addressField: 'District' },
//       6: { filterField: this.filterWard, addressIndex: 2, addressField: 'District' },
//     };

//     if (addressMappings[code]) {
//       const { filterField, addressIndex, addressField } = addressMappings[code];
//       filterField.value = this['personalAddressType' + [addressIndex]][addressField];
//       if (filterField.value !== null) {
//         this.groupFilter.filters.push(filterField);
//       }
//     }
//     if (this.groupFilter.filters.length > 0) {
//       this.gridState.filter.filters.push(this.groupFilter);
//     }
//     return this.gridState;
//   }

//   //#endregion

//   //#region Update Checkbox
//   clickCheckbox(ev, prop, typePhone: string) {
//     if (Ps_UtilObjectService.hasValueString(this.personalContact[typePhone])) {
//       this.personalContact[prop] = ev.target.checked
//       this.UpdatePersonalContact([prop])
//     } else {
//       this.layoutService.onWarning('Vui lòng nhập số diện thoại di động')
//     }
//   }
//   //#endregion

//   //#region Update Textbox
//   onTextboxLoseFocus(prop: string[], TypeData: number, ObjectString?: string) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       switch (TypeData) {
//         // update Personalinfor
//         case 1:
//           this.UpdatePersonalInfo(prop, this.personal)
//           break;

//         // Update personal Certificate
//         case 2:
//           if (this[ObjectString].Code == 0) {
//             prop.push('ProfileID')
//           }
//           if (ObjectString == 'personalCertificateType1') {
//             if (!Ps_UtilObjectService.hasValueString(this.personalCertificateType1.CertificateNo)) {
//               this.layoutService.onWarning('Vui lòng nhập số CMND/CCCD')
//             } else {
//               const CertificateNoRegex = /^[0-9]{9,12}$/
//               if (!CertificateNoRegex.test(this[ObjectString].CertificateNo)) {
//                 this.layoutService.onError('Số CMND/CCCD phải từ 9 đến 12 số')
//               } else {
//                 this.UpdatePersonalCertificate(prop, this[ObjectString])
//               }
//             }
//           } else {
//             this.UpdatePersonalCertificate(prop, this[ObjectString])
//           }
//           break;

//         // Update personal Contact
//         case 3:
//           if (this.personalContact.Code == 0) {
//             prop.push('Profile')
//             this.personalContact.Profile = this.personal.ProfileID
//           }
//           if (prop[0] == 'Email') {
//             if (!Ps_UtilObjectService.isValidEmail(this.personalContact.Email)) {
//               this.layoutService.onWarning('Email không hợp lệ!!')
//             } else {
//               this.UpdatePersonalContact(prop, this.personalContact)
//             }
//           } else {
//             this.UpdatePersonalContact(prop, this.personalContact)
//           }
//           break;

//         // Update Personal Address
//         case 4:
//           if (this[ObjectString].Code == 0) {
//             prop.push('Profile')
//           }
//           this.UpdatePersonalAddress(prop, this[ObjectString])
//           break;
//       }
//     }
//   }
//   //#endregion

//   //#region Update Dropdown
//   openDropdown(key: string, TypeData: number, order?: number) {
//     if (!this.dropdownStates[key]) {
//       if (TypeData == 0) {
//         switch (key) {

//           case 'Nationality':
//             this.APIGetNationality()
//             break;

//           case `${['Province' + order]}`:
//             this[`OpenProvince${order}`]()
//             break;

//           case `${['District' + order]}`:
//             this[`OpenDistrict${order}`]()
//             break;

//           case `${['Ward' + order]}`:
//             this[`OpenWard${order}`]()
//             break;

//         }
//       } else {
//         this.APIGetListHr(key, TypeData)
//       }
//       this.dropdownStates[key] = true;
//     }
//   }

//   onDropdownlistClick(ev, prop: string[], TypeData: number, TypeString: string, order?: number) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       switch (TypeData) {
//         // Update Dropdown Personal Info
//         case 1:
//           prop.forEach(item => {
//             if (item == TypeString) {
//               this['Selected' + item] = ev
//               this.personal[item] = this['Selected' + item].OrderBy;
//             } else {
//               this['Selected' + item] = null
//               this.personal[item] = this['Selected' + item]
//             }
//           })
//           this.UpdatePersonalInfo(prop, this.personal);
//           break;

//         // Update Personal Contact
//         case 3:
//           if (this.personalContact.Profile == 0) {
//             prop.push('Profile')
//             this.personalContact.Profile = this.personal.Code
//           }
//           this.personalContact[prop[0]] = this[TypeString].OrderBy
//           this.UpdatePersonalContact(prop, this.personalContact)
//           break

//         // Update Personal Address
//         case 4:
//           prop.forEach(item => {
//             if (item == TypeString) {
//               this['Selected' + item + order] = ev
//               this[`personalAddressType${order}`][item] = this['Selected' + item + order].Code;
//               if (this['Selected' + item + order].Code == null) {
//                 this[`hasValue${item + order}`] = false
//               } else {
//                 this[`hasValue${item + order}`] = true
//               }

//             } else {
//               this['Selected' + item + order] = null
//               this[`personalAddressType${order}`][item] = this['Selected' + item + order]
//               this[`hasValue${item + order}`] = false
//               this.dropdownStates[item + order] = false
//             }
//           })
//           if (this[`personalAddressType${order}`].Code == 0) {
//             prop.push('Code', 'TypeData', 'Profile')
//           }
//           this.UpdatePersonalAddress(prop, this[`personalAddressType${order}`])
//           break;
//       }
//     }
//   }

//   //#endregion

//   //#region Update DatePicker

//   onDatepickerChange(prop: string[], TypeData: number) {
//     if (TypeData != 3) {
//       if (this[`personalCertificateType${TypeData}`].Code == 0) {
//         prop.push('ProfileID')
//       }
//       if (TypeData == 1) {
//         if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.CertificateNo)) {
//           if (Ps_UtilObjectService.hasValue(this[`${prop[0]}CCCD`])) {
//             const dateString1 = formatDate(this[`${prop[0]}CCCD`], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             const dateString2 = formatDate(this.personalCertificateType1[prop[0]], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (dateString1 != dateString2) {
//               this.personalCertificateType1.EffDate = formatDate(this.EffDateCCCD, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//               if (this.personalCertificateType1.CertificateNo.length == 9 && prop[0] == 'EffDate') {
//                 // if (prop[0] == 'EffDate') {
//                   this.ExpDateCCCD = new Date(this.EffDateCCCD.setFullYear(this.EffDateCCCD.getFullYear() + 15))
//                 // }
//               } else if (this.personalCertificateType1.CertificateNo.length == 12 && prop[0] == 'EffDate') {
//                 // if (prop[0] == 'EffDate') {
//                   const currenYear: Date = new Date
//                   const age = currenYear.getFullYear() - this.personal.BirthYear
//                   let hsd = 0
//                   if (age <= 25) {
//                     hsd = this.personal.BirthYear + 25
//                   }
//                   else if (age > 25 && age <= 40) {
//                     hsd = this.personal.BirthYear + 40
//                   }
//                   else if (age > 40 && age <= 60) {
//                     hsd = this.personal.BirthYear + 60
//                   }
//                   this.ExpDateCCCD = new Date(hsd, this.personal.BirthMonth - 1, this.personal.BirthDay)
//                 // }
//               }
//               this.personalCertificateType1.ExpDate = this.ExpDateCCCD
//               this.UpdatePersonalCertificate(prop, this.personalCertificateType1)
//             }
//           }
//         } else {
//           this.layoutService.onWarning('Vui lòng nhập số CMND/CCCD')
//           this.EffDateCCCD = null
//           this.ExpDateCCCD = null
//         }
//       } else {
//         if (Ps_UtilObjectService.hasValue(this[`${prop[0]}PP`])) {
//           const dateString1 = formatDate(this[`${prop[0]}PP`], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//           const dateString2 = formatDate(this.personalCertificateType2[prop[0]], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//           if (dateString1 != dateString2) {
//             this.personalCertificateType2.EffDate = formatDate(this.EffDatePP, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (prop[0] == 'EffDate') {
//               this.ExpDatePP = new Date(this.EffDatePP.setFullYear(this.EffDatePP.getFullYear() + 10))
//               // this.personalCertificateType2.ExpDate = this.ExpDatePP
//             } 
//             // else {
//             this.personalCertificateType2.ExpDate = this.ExpDatePP
//             // }
//             this.UpdatePersonalCertificate(prop, this.personalCertificateType2)
//           }
//         }
//       }
//     } else {
//       const dateString1 = formatDate(this.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//       const dateString2 = formatDate(this.personal.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//       if (dateString1 != dateString2) {
//         this.personal.PITEffDate = formatDate(this.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//         this.UpdatePersonalInfo(prop, this.personal)
//       }
//     }
//   }

//   //#endregion

//   ngOnDestroy(): void {
//     this.unsubscribe.next();
//     this.unsubscribe.complete();
//   }
}

// export class Hri007PersonalInfoComponent implements OnInit {

//   //common variable
//   dropdownStates: { [key: string]: boolean } = {};
//   //BOOL
//   loading: boolean = false
//   isLockAll: boolean = false
//   justLoaded = true
//   isAdd: boolean = true
//   isclick: boolean = true
//   isEmailValid: boolean = false;
//   isCertificateNoValid: boolean = false;
//   //address
//   notSelectedDistrict1: boolean = true;
//   notSelectedDistrict2: boolean = true;
//   notSelectedProvince1: boolean = true;
//   notSelectedProvince2: boolean = true;
//   notSelectedWard1: boolean = true;
//   notSelectedWard2: boolean = true;
//   //BOOL FOR DROPDOWN
//   // isFirstGenderOpen = true;
//   // isFirstMaritalOpen = true;
//   // isFirstEthnicOpen = true;
//   // isFirstReligionOpen = true;
//   // isFirstNationalityOpen = true;
//   // isFirstSocialNetwork1Open = true;
//   // //edu
//   // isFirstEducationOpen = true;
//   // isFirstEduRankOpen = true;
//   // isFirstEduDegreeOpen = true;
//   // //address
//   // isFirstProvincePermanentOpen = true;
//   // isFirstProvinceTemporaryResidenceOpen = true;
//   // isFirstDistrictPermanentOpen = true;
//   // isFirstDistrictTemporaryResidenceOpen = true;
//   // isFirstWardPermanentOpen = true;
//   // isFirstWardTemporaryResidenceOpen = true;
//   //DROPDOWN
//   SelectedGender: { ListName: string; OrderBy: number }
//   SelectedMarital: { ListName: string; OrderBy: number }
//   SelectedEthnic: { ListName: string; OrderBy: number }
//   SelectedReligion: { ListName: string; OrderBy: number }
//   //edu
//   SelectedEducation: { ListName: string; OrderBy: number }
//   SelectedEduRank: { ListName: string; OrderBy: number }
//   SelectedEduDegree: { ListName: string; OrderBy: number }
//   //social
//   SelectedOtherSocialNetworkTypeData: { ListName: string; OrderBy: number }
//   SelectedCountryOfResidence: { VNName: string; Code: number }
//   SelectedSocialNetworkTypeData: { ListName: string; OrderBy: number }
//   SelectedchatVoIP: { ListName: string; OrderBy: number }
//   //address
//   SelectedNationality: { VNName: string; Code: number | string }
//   SelectedCountry: { VNName: string; Code: number }

//   SelectedProvincePermanent: { VNProvince: string; Code: number }
//   SelectedProvinceTemporaryResidence: { VNProvince: string; Code: number }
//   SelectedDistrictPermanent: { VNDistrict: string; Code: number }
//   SelectedDistrictTemporaryResidence: { VNDistrict: string; Code: number }
//   SelectedWardPermanent: { VNWard: string; Code: number }
//   SelectedWardTemporaryResidence: { VNWard: string; Code: number }
//   //
//   SelectedYear: any
//   SelectedMonth: any
//   SelectedDay: any
//   NationalityName: any
//   //DATE
//   EffDateCCCD: Date
//   ExpDateCCCD: Date
//   EffDatePP: Date
//   ExpDatePP: Date
//   PITEffDate: Date
//   //STRING
//   CCCDCode: string = ''
//   PassportCode: string = ''
//   issuedbyCCCD: string = ''
//   issuedbyPass: string = ''
//   PermanentAddress: string = ''
//   TemporaryResidenceAddress: string = ''
//   //GRID
//   gridState: State = {
//     filter: { filters: [], logic: 'and' },
//   }
//   groupFilter: CompositeFilterDescriptor = {
//     logic: "or",
//     filters: []
//   }
//   filterProvince: FilterDescriptor = {
//     field: "Country", operator: "eq", value: 1
//   }
//   filterDistrict: FilterDescriptor = {
//     field: "Province", operator: "eq", value: 1
//   }
//   filterWard: FilterDescriptor = {
//     field: "District", operator: "eq", value: 1
//   }
//   //PERMISTION
//   isToanQuyen = false
//   isAllowedToCreate = false
//   isAllowedToVerify = false

//   actionPerm: DTOActionPermission[] = []
//   //object
//   personal = new DTOPersonalInfo()
//   employee = new DTOEmployee()
//   personalChange = new DTOPersonalInfo()
//   //INFO
//   personalCertificate: DTOPersonalCertificate[] = []
//   personalCertificateType1 = new DTOPersonalCertificate()
//   personalCertificateType2 = new DTOPersonalCertificate()
//   personalContact = new DTOPersonalContact()
//   personalAddress: DTOPersonalAddress[] = []
//   personalAddressType1 = new DTOPersonalAddress()
//   personalAddressType2 = new DTOPersonalAddress()


//   personalContactChange = new DTOPersonalContact()
//   //ADDRESS
//   province = new DTOLSProvince()
//   district = new DTOLSDistrict()
//   ward = new DTOLSWard()
//   Country = new DTOListCountry()
//   //DATE
//   today: Date = new Date()
//   minDate: Date = new Date();
//   maxDate: Date = new Date();

//   minEXPDate: Date = new Date();
//   maxEXPDate: Date = new Date();
//   component: { EffDate: Date; }[];
//   //ARRAY
//   List: { [key: string]: DTOListHR[] } = {}
//   ListFilter: { [key: string]: DTOListHR[] } = {}

//   //
//   // listGender: Array<DTOListHR> = [];
//   // listMarital: Array<DTOListHR> = [];
//   // listReligion: Array<DTOListHR> = [];
//   // listEthnic: Array<DTOListHR> = [];
//   // listSocialNetwork: Array<DTOListHR> = [];
//   // //EDU
//   // listEducation: Array<DTOListHR> = [];
//   // listEduRank: Array<DTOListHR> = [];
//   // listEduDegree: Array<DTOListHR> = [];
//   //NATION
//   listNationality: DTOListCountry[] = [];
//   listNationalityFilter: DTOListCountry[] = [];
//   //PROVINCE
//   provinceList1: DTOLSProvince[] = [];
//   provinceList1Filter: DTOLSProvince[] = [];
//   provinceList2: DTOLSProvince[] = [];
//   provinceList2Filter: DTOLSProvince[] = [];
//   //DISTRICT
//   districtList1: DTOLSDistrict[] = [];
//   districtList1Filter: DTOLSDistrict[] = [];
//   districtList2: DTOLSDistrict[] = [];
//   districtList2Filter: DTOLSDistrict[] = [];
//   //WARD
//   wardList1: DTOLSWard[] = [];
//   wardList1Filter: DTOLSWard[] = [];
//   wardList2: DTOLSWard[] = [];
//   wardList2Filter: DTOLSWard[] = [];
//   // Subscription CallAPi
//   arrUnsubscribe: Subscription[] = [];
//   //dropdownbirthday
//   years: any[];
//   dropdownDay: any[];
//   dropdownMonth: any[];
//   //
//   constructor(
//     public menuService: PS_HelperMenuService,
//     private apiServiceStaff: StaffApiService,
//     public layoutService: LayoutService,
//     public payslipService: PayslipService,

//   ) {
//     this.years = this.generateYearList()
//     this.dropdownDay = this.getDaysInMonth(1);
//     this.dropdownMonth = this.getMonth()
//   }

//   //
//   ngOnInit(): void {
//     let that = this

//     that.loading = true;
//     this.minDate.setFullYear(this.minDate.getFullYear() - 80);
//     this.maxEXPDate.setFullYear(this.maxEXPDate.getFullYear() + 80);

//     let changePermission_sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
//       if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
//         that.justLoaded = false
//         that.actionPerm = distinct(res.ActionPermission, "ActionType")

//         that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
//         that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
//         that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
//         this.getCache()
//       }
//       this.loading = false;
//     })
//     this.arrUnsubscribe.push(changePermission_sst);
//   }
//   //

//   // Lấy Dữ liệu lưu trên Cache
//   getCache() {
//     const res = JSON.parse(localStorage.getItem('Staff'))
//     if (Ps_UtilObjectService.hasValue(res)) {
//       this.employee = res
//       console.log(this.employee)
//       if (this.employee.Code != 0) {
//         this.isAdd = false
//         if (!this.isAdd && this.employee.ProfileID != null) {
//           this.APIGetPersonalInfo(this.employee.ProfileID, 1)
//         }
//       } else {
//         this.isAdd = this.apiServiceStaff.isAdd
//       }
//     }
//   }
//   //

//   //Lấy Dữ Liệu

//   //load lại trang khi click vào breacrum
//   loadPage() {
//     this.getCache()
//   }

//   // thêm mới

//   onAddNew() {
//     this.isAdd = true
//     this.apiServiceStaff.isAdd = true
//     const res = JSON.parse(localStorage.getItem('Staff'))
//     this.employee = res

//     if (this.employee.Code != 0) {
//       // clear block THÔNG TIN CƠ BẢN
//       this.personalChange = new DTOPersonalInfo()
//       this.personal = new DTOPersonalInfo()
//       this.SelectedGender = null;
//       this.SelectedMarital = null;
//       this.SelectedEthnic = null;
//       this.SelectedReligion = null;
//       this.SelectedYear = null
//       this.SelectedMonth = null
//       this.SelectedDay = null
//       this.SelectedNationality = null;

//       // clear block THÔNG TIN CHỨNG THỰC VÀ THUẾ TNCN
//       // this.personalCertificate = new DTOGetPersonalCertificate()
//       // this.personalCertificate = new DTOPersonalCertificate()
//       this.PITEffDate = null
//       this.CCCDCode = ''
//       this.PassportCode = ''
//       this.issuedbyCCCD = ''
//       this.issuedbyPass = ''
//       this.EffDateCCCD = null
//       this.ExpDateCCCD = null
//       this.EffDatePP = null
//       this.ExpDatePP = null

//       this.personalCertificateType1 = new DTOPersonalCertificate()
//       this.personalCertificateType2 = new DTOPersonalCertificate()
//       const arrPersonalCertificate = []

//       arrPersonalCertificate.push(this.personalCertificateType1)
//       arrPersonalCertificate.push(this.personalCertificateType2)

//       this.personalCertificate = arrPersonalCertificate

//       //clear block VĂN HÓA, CHUYÊN MÔN - NGHỀ NGHIỆP
//       this.SelectedEducation = null;
//       this.SelectedEduRank = null;
//       this.SelectedEduDegree = null;

//       //clear block THÔNG TIN LIÊN HỆ
//       this.personalContactChange = new DTOPersonalContact()
//       this.SelectedSocialNetworkTypeData = null;
//       this.SelectedOtherSocialNetworkTypeData = null;
//       this.SelectedchatVoIP = null;

//       this.SelectedCountry = null;
//       this.SelectedCountryOfResidence = null;

//       this.SelectedProvincePermanent = null;
//       this.SelectedProvinceTemporaryResidence = null;
//       this.SelectedDistrictPermanent = null;
//       this.SelectedDistrictTemporaryResidence = null;
//       this.SelectedWardPermanent = null;
//       this.SelectedWardTemporaryResidence = null;

//       //clear block ĐỊA CHỈ CƯ TRÚ
//       // this.personalAddress = new DTOPersonalAddress()
//       this.PermanentAddress = ''
//       this.TemporaryResidenceAddress = ''
//       this.notSelectedProvince1 = true
//       this.notSelectedProvince2 = true
//       this.notSelectedDistrict1 = true
//       this.notSelectedDistrict2 = true
//       this.notSelectedWard1 = true
//       this.notSelectedWard2 = true

//       this.personalAddressType1 = new DTOPersonalAddress()
//       this.personalAddressType2 = new DTOPersonalAddress()

//       const arrPersonalAddress = []

//       arrPersonalAddress.push(this.personalAddressType1)
//       arrPersonalAddress.push(this.personalAddressType2)

//       this.personalAddress = arrPersonalAddress
//       if (this.isAdd) {
//         localStorage.setItem('Staff', JSON.stringify(new DTOEmployeeDetail()));
//         this.payslipService.triggerReloadSuccess();
//       }
//     }
//   }

//   // lấy thông tin Nhân sự
//   APIGetPersonalInfo(Code: number, TypeData: number) {
//     this.loading = true;

//     let GetPersonalInfo_sst = this.apiServiceStaff.GetPersonalInfo(Code).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personal = res.ObjectReturn;

//         this.personalChange = { ...this.personal };
//         this.SelectedGender = {
//           ListName: this.personal.GenderName,
//           OrderBy: this.personal.Gender
//         }
//         this.SelectedMarital = {
//           ListName: this.personal.MaritalName,
//           OrderBy: this.personal.Marital
//         }
//         this.SelectedEthnic = {
//           ListName: this.personal.EthnicName,
//           OrderBy: this.personal.Ethnic
//         }
//         this.SelectedReligion = {
//           ListName: this.personal.ReligionName,
//           OrderBy: this.personal.Religion
//         }
//         this.SelectedNationality = {
//           VNName: this.personal.NationalityName,
//           Code: this.personal.Nationality
//         }
//         this.SelectedEducation = {
//           ListName: this.personal.EducationName,
//           OrderBy: this.personal.Education
//         }
//         this.SelectedEduRank = {
//           ListName: this.personal.EduRankName,
//           OrderBy: this.personal.EduRank
//         }
//         this.SelectedEduDegree = {
//           ListName: this.personal.EduDegreeName,
//           OrderBy: this.personal.EduDegree
//         }
//         this.SelectedDay = this.personal.BirthDay
//         this.SelectedMonth = this.personal.BirthMonth
//         this.SelectedYear = this.personal.BirthYear
//         this.dropdownDay = this.getDaysInMonth(this.SelectedMonth)
//         // this.Domicile = this.personal.Domicile

//         if (Ps_UtilObjectService.isValidDate(this.personal.PITEffDate)) {
//           this.PITEffDate = new Date(this.personal.PITEffDate)
//         }

//       }
//       else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${res.ErrorString}`)
//       }
//       if (TypeData == 1) {
//         this.APIGetPersonalContact()
//         this.APIGetPersonalCertificate()
//         this.APIGetPersonalAddress()
//       }

//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${err.toString()}`);
//       this.loading = false;
//     });
//     this.arrUnsubscribe.push(GetPersonalInfo_sst);

//   }
//   // lấy thông tin Chứng Thực
//   APIGetPersonalCertificate() {
//     this.loading = true;

//     let GetPersonalCertificate_sst = this.apiServiceStaff.GetPersonalCertificate(this.employee.ProfileID).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         // if (Array.isArray(res.ObjectReturn) && res.ObjectReturn.length === 0) {
//         if (res.ObjectReturn.length == 0) {

//           var arr = []
//           // Chứng minh nhân dân
//           this.personalCertificateType1.ProfileID = this.personal.ProfileID
//           this.personalCertificateType1.TypeData = 1
//           this.personalAddressType1.TypeName = "Chứng minh nhân dân"
//           // Passport
//           this.personalCertificateType2.ProfileID = this.personal.ProfileID
//           this.personalCertificateType2.TypeData = 2
//           this.personalAddressType2.TypeName = "Passport"
//           //
//           arr.push(this.personalCertificateType1)
//           arr.push(this.personalCertificateType2)

//           //
//           this.personalCertificate = arr

//         } else {

//           this.personalCertificate = res.ObjectReturn;
//           this.personalCertificate.find(obj => {
//             if (obj.TypeData === 1) {
//               this.personalCertificateType1 = obj
//             } else if (obj.TypeData == 2) {
//               this.personalCertificateType2 = obj
//             }
//           });

//           // CCND
//           this.CCCDCode = this.personalCertificateType1.CertificateNo

//           if (Ps_UtilObjectService.isValidDate(this.personalCertificateType1.EffDate)) {
//             this.EffDateCCCD = new Date(this.personalCertificateType1.EffDate)
//           }
//           if (Ps_UtilObjectService.isValidDate(this.personalCertificateType1.ExpDate)) {
//             this.ExpDateCCCD = new Date(this.personalCertificateType1.ExpDate)
//           }
//           this.issuedbyCCCD = this.personalCertificateType1.Register

//           this.issuedbyCCCD = this.personalCertificateType1.Register
//           // Passport
//           this.PassportCode = this.personalCertificateType2.CertificateNo

//           if (Ps_UtilObjectService.isValidDate(this.personalCertificateType2.EffDate)) {
//             this.EffDatePP = new Date(this.personalCertificateType2.EffDate)
//           }
//           if (Ps_UtilObjectService.isValidDate(this.personalCertificateType2.ExpDate)) {
//             this.ExpDatePP = new Date(this.personalCertificateType2.ExpDate)
//           }
//           this.issuedbyPass = this.personalCertificateType2.Register

//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chứng thực nhân sự: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi Kết nỗi máy chủ: ${err}`);
//       this.loading = false;
//     })
//     this.arrUnsubscribe.push(GetPersonalCertificate_sst);
//   }
//   // lấy thông tin liên hệ
//   APIGetPersonalContact() {
//     this.loading = true;

//     let GetPersonalContact_sst = this.apiServiceStaff.GetPersonalContact(this.personal.ProfileID).subscribe(res => {
//       if (res.StatusCode == 0) {
//         if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
//           this.personalContact = res.ObjectReturn;
//           this.personalContactChange = { ...this.personalContact }

//           this.SelectedSocialNetworkTypeData = {
//             ListName: this.personalContact.SocialNetworkTypeDataName,
//             OrderBy: this.personalContact.SocialNetworkTypeData
//           }
//           this.SelectedOtherSocialNetworkTypeData = {
//             ListName: this.personalContact.OtherSocialNetworkTypeDataName,
//             OrderBy: this.personalContact.OtherSocialNetworkTypeData
//           }
//           this.SelectedchatVoIP = {
//             ListName: this.personalContact.VoIPTypeDataName,
//             OrderBy: this.personalContact.VoIPTypeData
//           }
//         }
//       }
//       else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${err}`);
//       this.loading = false;
//     })
//     this.arrUnsubscribe.push(GetPersonalContact_sst);
//   }
//   // lấy thông tin Địa chỉ cư trú
//   APIGetPersonalAddress() {
//     this.loading = true;

//     let GetPersonalAddress_sst = this.apiServiceStaff.GetPersonalAddress(this.personal.ProfileID).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         // if (Array.isArray(res.ObjectReturn) && res.ObjectReturn.length === 0)
//         if (res.ObjectReturn.length == 0) {
//           var arr = []
//           // thường trú
//           this.personalAddressType1.Profile = this.personal.ProfileID
//           this.personalAddressType1.TypeData = 1
//           // tạm trú
//           this.personalAddressType2.Profile = this.personal.ProfileID
//           this.personalAddressType2.TypeData = 2
//           //
//           arr.push(this.personalAddressType1)
//           arr.push(this.personalAddressType2)

//           //
//           this.personalAddress = arr

//         } else {
//           this.personalAddress = res.ObjectReturn;
//           this.personalAddress.find(obj => {
//             if (obj.TypeData === 1) {
//               this.personalAddressType1 = obj
//             } else if (obj.TypeData == 2) {
//               this.personalAddressType2 = obj
//             }
//           });

//           this.PermanentAddress = this.personalAddressType1.Address

//           this.SelectedCountryOfResidence = {
//             VNName: this.personalAddressType1.CountryName,
//             Code: this.personalAddressType1.Country
//           }
//           if (this.personalAddressType1.Country != null && this.personalAddressType1.Country != 0) {
//             this.notSelectedProvince1 = false

//             this.SelectedProvincePermanent = {
//               VNProvince: this.personalAddressType1.ProvinceName,
//               Code: this.personalAddressType1.Province
//             }
//             if (this.personalAddressType1.Province != null && this.personalAddressType1.Province != 0) {
//               this.notSelectedDistrict1 = false

//               this.SelectedDistrictPermanent = {
//                 VNDistrict: this.personalAddressType1.DistrictName,
//                 Code: this.personalAddressType1.District
//               }
//               if (this.personalAddressType1.District != null && this.personalAddressType1.District != 0) {
//                 this.notSelectedWard1 = false

//                 this.SelectedWardPermanent = {
//                   VNWard: this.personalAddressType1.WardName,
//                   Code: this.personalAddressType1.Ward
//                 }
//               }
//             }
//           }

//           this.TemporaryResidenceAddress = this.personalAddressType2.Address

//           this.SelectedCountry = {
//             VNName: this.personalAddressType2.CountryName,
//             Code: this.personalAddressType2.Country
//           }
//           if (this.personalAddressType2.Country != null && this.personalAddressType2.Country != 0) {
//             this.notSelectedProvince2 = false

//             this.SelectedProvinceTemporaryResidence = {
//               VNProvince: this.personalAddressType2.ProvinceName,
//               Code: this.personalAddressType2.Province
//             }
//             if (this.personalAddressType2.Province != null && this.personalAddressType2.Province != 0) {
//               this.notSelectedDistrict2 = false

//               this.SelectedDistrictTemporaryResidence = {
//                 VNDistrict: this.personalAddressType2.DistrictName,
//                 Code: this.personalAddressType2.District
//               }
//               if (this.personalAddressType2.District != null && this.personalAddressType2.District != 0) {
//                 this.notSelectedWard2 = false

//                 this.SelectedWardTemporaryResidence = {
//                   VNWard: this.personalAddressType2.WardName,
//                   Code: this.personalAddressType2.Ward
//                 }
//               }
//             }
//           }
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin địa chỉ cư trú nhân sự: ${res.ObjectReturn}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi kết nối máy chủ: ${err}`);
//       this.loading = false;
//     })
//     this.arrUnsubscribe.push(GetPersonalAddress_sst);
//   }
//   // Lấy dữ liệu dropdrown
//   APIGetListHr(Key: string, Code: number) {
//     this.loading = true;
//     let listDataHr_sst = this.apiServiceStaff.GetListHR(Code).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         this.List[Key] = res.ObjectReturn
//         this.ListFilter[Key] = this.List[Key]
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${err}`);
//       this.loading = false;
//     });
//     this.arrUnsubscribe.push(listDataHr_sst);
//   }
//   // Lấy dữ liệu dropdrown Quốc gia
//   APIGetNationality() {
//     this.loading = true;
//     let GetNationality_sst = this.apiServiceStaff.GetListCountry().subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         this.listNationality = res.ObjectReturn.Data
//         this.listNationalityFilter = JSON.parse(JSON.stringify(res.ObjectReturn.Data))
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${err}`);
//       this.loading = false;
//     });
//     this.arrUnsubscribe.push(GetNationality_sst);
//   }
//   //Lấy dữ liệu dropdrown Tỉnh thành
//   APIGetListProvince(typeData: number, state: State) {
//     // switch (typeData) {
//     //   case 1:
//     var ctx = 'lấy Danh sách Tỉnh thành '
//     this.loading = true;

//     let GetListProvince1_sst = this.apiServiceStaff.GetListProvince(state).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.provinceList1 = data
//           this.provinceList1Filter = JSON.parse(JSON.stringify(data))
//         }
//         else {
//           ctx += 'Tạm trú'
//           this.provinceList2 = data
//           this.provinceList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//       this.loading = false;
//     });
//     this.arrUnsubscribe.push(GetListProvince1_sst);
//   }
//   //Lấy dữ liệu dropdrown Quận/huyện
//   APIGetListDistrict(typeData: number, state: State) {
//     // switch (typeData) {
//     //   case 1:
//     var ctx = 'lấy Danh sách Quận huyện '
//     this.loading = true;

//     let GetListDistrict1_sst = this.apiServiceStaff.GetListDistrict(state).subscribe((res: any) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.districtList1 = data
//           this.districtList1Filter = JSON.parse(JSON.stringify(data))
//         } else {
//           ctx += 'Tạm trú'
//           this.districtList2 = data
//           this.districtList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     }, (err) => {
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//       this.loading = false;
//     });
//     this.arrUnsubscribe.push(GetListDistrict1_sst);
//   }
//   //Lấy dữ liệu dropdrown Phường/xã
//   APIGetListWard(typeData: number, state: State) {
//     // switch (typeData) {
//     //   case 1:
//     var ctx = 'lấy Danh sách Phường xã '
//     this.loading = true;

//     let GetListWard1_sst = this.apiServiceStaff.GetListWard(state).subscribe((res) => {
//       if (res.StatusCode == 0) {
//         var data = res.ObjectReturn.Data

//         if (typeData == 1) {
//           ctx += 'Thường trú'
//           this.wardList1 = data
//           this.wardList1Filter = JSON.parse(JSON.stringify(data))
//         } else {
//           ctx += 'Tạm trú'
//           this.wardList2 = data
//           this.wardList2Filter = JSON.parse(JSON.stringify(data))
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//       }
//       this.loading = false;
//     },
//       (error) => {
//         this.loading = false;
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
//       }
//     );
//     this.arrUnsubscribe.push(GetListWard1_sst);
//   }
//   //
//   generateYearList(): any[] {
//     const currentYear = new Date().getFullYear();
//     const startYear = currentYear - 60;
//     const endYear = currentYear - 18
//     const yearList = [];

//     for (let year = endYear; year >= startYear; year--) {
//       yearList.push({ text: year.toString(), value: year });
//     }

//     return yearList;
//   }
//   isLeapYear(year: number): boolean {
//     return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
//   }
//   getMonth(): any[] {
//     const monthList = [];
//     for (let year = 1; year <= 12; year++) {
//       monthList.push({ text: year.toString(), value: year });
//     }
//     return monthList
//   }
//   getDaysInMonth(selectedMonth: number): any[] {
//     const dayList = [];
//     switch (selectedMonth) {
//       case 2:
//         const isLeapYear = this.isLeapYear(this.SelectedYear);
//         if (isLeapYear == true) {
//           for (let day = 1; day <= 29; day++) {
//             dayList.push({ text: day.toString(), value: day });
//           }
//         } else {
//           for (let day = 1; day <= 28; day++) {
//             dayList.push({ text: day.toString(), value: day });
//           }
//         }
//         return dayList;
//       case 4:
//       case 6:
//       case 9:
//       case 11:
//         for (let day = 1; day <= 30; day++) {
//           dayList.push({ text: day.toString(), value: day });
//         }
//         return dayList;
//       default:
//         for (let day = 1; day <= 31; day++) {
//           dayList.push({ text: day.toString(), value: day });
//         }
//         return dayList;
//     }
//   }

//   //Update
//   //Update Thông tin Nhân sự
//   UpdatePersonalInfo(prop: string[], prod = this.personal) {
//     this.loading = true
//     let UpdatePersonal_sst = this.apiServiceStaff.UpdatePersonalInfo(prod, prop).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personal = res.ObjectReturn
//         this.personalChange = { ...this.personal }
//         this.layoutService.onSuccess("Cập nhật thông tin nhân sự thành công");
//         if (this.isAdd) {
//           var newEmployee = new DTOEmployeeDetail()
//           newEmployee.ProfileID = this.personal.Code
//           localStorage.setItem('Staff', JSON.stringify(newEmployee))
//           this.isAdd = false
//         }

//         if (prop[0] == 'LastName' || prop[0] == 'MiddleName' || prop[0] == 'FirstName') {
//           this.payslipService.triggerReloadSuccess();
//         }
//       } else {
//         this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${res.ErrorString}`);
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${err}`);
//     })
//     this.arrUnsubscribe.push(UpdatePersonal_sst);
//   }
//   //Update Thông tin chứng thực
//   UpdatePersonalCertificate(prop: string[], prod: DTOPersonalCertificate) {
//     this.loading = true
//     let UpdatePersonalCertificate_sst = this.apiServiceStaff.UpdatePersonalCertificate(prod, prop).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         if (res.ObjectReturn.TypeData == 1) {
//           this.personalCertificate[0] = res.ObjectReturn
//           this.personalCertificateType1 = res.ObjectReturn
//         } else if (res.ObjectReturn.TypeData == 2) {
//           this.personalCertificate[1] = res.ObjectReturn
//           this.personalCertificateType2 = res.ObjectReturn
//         }
//         this.layoutService.onSuccess("Cập nhật Thông tin chứng thực thành công");
//       } else {
//         this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + res.ErrorString);
//         this.APIGetPersonalCertificate()
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalCertificate()
//       this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + err);
//     })
//     this.arrUnsubscribe.push(UpdatePersonalCertificate_sst);
//   }
//   //Update Thông tin liên hệ
//   UpdatePersonalContact(prop: string[], prod = this.personalContact) {
//     this.loading = true

//     let UpdatePersonalContact_sst = this.apiServiceStaff.UpdatePersonalContact(prod, prop).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.personalContact = res.ObjectReturn
//         this.personalContactChange = { ...this.personalContact }
//         this.layoutService.onSuccess("Cập nhật Thông tin liên hệ thành công");
//       } else {
//         this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + res.ErrorString);
//         this.APIGetPersonalContact()
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalContact()
//       this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + err);
//     })
//     this.arrUnsubscribe.push(UpdatePersonalContact_sst);
//   }
//   //Update Thông tin địa chỉ cư trú
//   UpdatePersonalAddress(prop: string[], prod: DTOPersonalAddress) {
//     this.loading = true
//     var ctx = 'Cập nhật địa chỉ '

//     let UpdatePersonalAddress_sst = this.apiServiceStaff.UpdatePersonalAddress(prod, prop).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         if (res.ObjectReturn.TypeData == 1) {
//           ctx += 'thường trú'
//           this.personalAddressType1 = res.ObjectReturn
//         } else if (res.ObjectReturn.TypeData == 2) {
//           ctx += 'tạm trú'
//           this.personalAddressType2 = res.ObjectReturn
//         }
//         this.layoutService.onSuccess(ctx + " thành công");
//       } else {
//         this.APIGetPersonalAddress()
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
//       }
//       this.loading = false
//     }, (err) => {
//       this.loading = false
//       this.APIGetPersonalAddress()
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
//     })
//     this.arrUnsubscribe.push(UpdatePersonalAddress_sst);
//   }
//   //
//   // Xử lý sự kiện trên giao diện (event)
//   //Xử Lý sự kiện chuyển trang trong body-left side-router
//   openDetail(linkMenu: string) {
//     let changeModuleData_sst = this.menuService.changeModuleData().subscribe((item: ModuleDataItem) => {
//       var parent = item.ListMenu.find(f => f.Code.includes('hr001-staff-list') || f.Link.includes('hr001-staff-list'))

//       if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
//         var detail = parent.LstChild.find(f => f.Code.includes('hr001-staff-list') || f.Link.includes('hr001-staff-list'))
//         this.menuService.activeMenu(detail)
//       }
//     })
//     this.arrUnsubscribe.push(changeModuleData_sst);
//   }

//   handleFilterDropdownlist(event, currentDropdownList: any[], DropdownList: any[], typeName: string, textField: string, type?) {
//     DropdownList = currentDropdownList

//     if (event !== '') {
//       if (type == 1) {
//         this.ListFilter[typeName] = DropdownList.filter(
//           (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
//         );
//       } else {
//         this[typeName] = DropdownList.filter(
//           (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
//         );
//       }
//     } else {
//       if (type == 1) {
//         this.ListFilter[typeName] = currentDropdownList
//       } else {
//         this[typeName] = currentDropdownList;
//       }
//     }
//   }
//   //#endregion


//   clickCheckbox(ev, prop) {
//     this.personalContact[prop] = ev.target.checked
//     this.UpdatePersonalContact([prop])
//   }
//   //
//   openDropdown(key: string, TypeData: number) {
//     if (!this.dropdownStates[key]) {
//       if (TypeData == 0) {
//         switch (key) {
//           case 'Nationality':
//             this.APIGetNationality()
//             break;
//           case 'ProvincePermanent':
//             this.OpenProvince1()
//             break;
//           case 'ProvinceTemporaryResidence':
//             this.OpenProvince2()
//             break;
//           case 'DistrictPermanent':
//             this.OpenDistrict1()
//             break;
//           case 'DistrictTemporaryResidence':
//             this.OpenDistrict2()
//             break;
//           case 'WardPermanent':
//             this.OpenWard1()
//             break;
//           case 'WardTemporaryResidence':
//             this.OpenWard2()
//             break;
//         }
//       } else {
//         this.APIGetListHr(key, TypeData)
//       }
//       this.dropdownStates[key] = true;
//     }
//   }

//   loadFilter(code: number) {
//     this.gridState.filter.filters = [];
//     this.groupFilter.filters = [];

//     const addressMappings = {
//       1: { filterField: this.filterProvince, addressIndex: 1, addressField: 'Country' },
//       2: { filterField: this.filterDistrict, addressIndex: 1, addressField: 'Province' },
//       3: { filterField: this.filterProvince, addressIndex: 2, addressField: 'Country' },
//       4: { filterField: this.filterDistrict, addressIndex: 2, addressField: 'Province' },
//       5: { filterField: this.filterWard, addressIndex: 1, addressField: 'District' },
//       6: { filterField: this.filterWard, addressIndex: 2, addressField: 'District' },
//     };

//     if (addressMappings[code]) {
//       const { filterField, addressIndex, addressField } = addressMappings[code];
//       filterField.value = this['personalAddressType' + [addressIndex]][addressField];
//       if (filterField.value !== null) {
//         this.groupFilter.filters.push(filterField);
//       }
//     }
//     if (this.groupFilter.filters.length > 0) {
//       this.gridState.filter.filters.push(this.groupFilter);
//     }
//     return this.gridState;
//   }

//   onTextboxLoseFocus(prop: string[], TypeData: number) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       switch (TypeData) {
//         case 1:
//           if (this.personalCertificateType1.Code == 0) {
//             this.personalCertificateType1.ProfileID = this.personal.ProfileID
//             this.personalCertificateType1.TypeData = 1
//             prop.push('ProfileID')
//           }
//           if (this.CCCDCode != this.personalCertificateType1.CertificateNo) {
//             if (this.CCCDCode) {
//               const CertificateNoRegex = /^[0-9]{9,12}$/
//               this.isCertificateNoValid = CertificateNoRegex.test(this.CCCDCode);
//               if (this.isCertificateNoValid == true) {
//                 this.personalCertificateType1.CertificateNo = this.CCCDCode
//                 if (this.CCCDCode.length == 9 || this.CCCDCode.length == 12) {
//                   this.UpdatePersonalCertificate(prop, this.personalCertificateType1)
//                 } else {
//                   this.layoutService.onError('Số CMND/CCCD phải từ 9 đến 12 số')
//                 }
//               }
//               else {
//                 this.layoutService.onError('Lỗi mã CCCD/CMND');
//               }
//             }
//           }
//           break;
//         case 2:
//           if (this.personalCertificateType2.Code == 0) {
//             this.personalCertificateType2.ProfileID = this.personal.ProfileID
//             this.personalCertificateType2.TypeData = 2
//             prop.push('ProfileID')
//           }
//           if (this.PassportCode != this.personalCertificateType2.CertificateNo) {
//             this.personalCertificateType2.CertificateNo = this.PassportCode
//             this.UpdatePersonalCertificate(prop, this.personalCertificateType2)
//           }
//           break;
//         case 3:
//           const personalString = JSON.stringify(this.personal);
//           const personalChangeString = JSON.stringify(this.personalChange);
//           if (personalString != personalChangeString) {
//             for (const key in this.personal) {
//               if (this.personal.hasOwnProperty(key) && this.personalChange.hasOwnProperty(key) && this.personal[key] !== this.personalChange[key]) {
//                 this.personal[key] = this.personalChange[key];
//               }
//             }
//             // this.personal.Code = this.employee.Code
//             this.UpdatePersonalInfo(prop, this.personal)
//           }
//           break;
//         case 4:
//           const personalContactString = JSON.stringify(this.personalContact);
//           const personalContactChangeString = JSON.stringify(this.personalContactChange);
//           if (personalContactString != personalContactChangeString) {
//             for (const key in this.personalContact) {
//               if (this.personalContact.hasOwnProperty(key) && this.personalContactChange.hasOwnProperty(key) && this.personalContact[key] !== this.personalContactChange[key]) {
//                 this.personalContact[key] = this.personalContactChange[key];
//               }
//             }
//             if (this.personalContact.Email) {
//               const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
//               this.isEmailValid = emailRegex.test(this.personalContact.Email);
//               if (this.isEmailValid == true) {
//                 this.UpdatePersonalContact(prop, this.personalContact)
//               }
//               else {
//                 this.layoutService.onError('Email không hợp lệ');
//               }
//             }
//             else {
//               if (this.personalContact.Profile == 0) {
//                 prop.push('Profile')
//                 this.personalContact.Profile = this.personal.Code
//               }
//               this.UpdatePersonalContact(prop, this.personalContact)
//             }
//           }
//           break;
//         case 5:
//           this.handlePersonalAddressUpdate(prop, this.personalAddressType1, this.PermanentAddress, 1);
//           break;
//         case 6:
//           this.handlePersonalAddressUpdate(prop, this.personalAddressType2, this.TemporaryResidenceAddress, 2);
//           break;
//         case 7:
//           this.handlePersonalCertificateRegister(prop, this.issuedbyCCCD, this.personalCertificate[0]);
//           break;
//         case 8:
//           this.handlePersonalCertificateRegister(prop, this.issuedbyPass, this.personalCertificate[1]);
//           break;
//       }
//     }
//   }

//   // Hàm xử lý cho case 5 và 6
//   handlePersonalAddressUpdate(prop, addressObj, newAddress, TypeData) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       if (addressObj.Code == 0) {
//         addressObj.Profile = this.personal.ProfileID;
//         addressObj.TypeData = TypeData
//         prop.push('Profile');
//       }
//       if (addressObj.Profile == 0) {
//         addressObj.Profile = this.personal.ProfileID;
//       }
//       if (newAddress != addressObj.Address) {
//         addressObj.Address = newAddress;
//         this.UpdatePersonalAddress(prop, addressObj);
//       }
//     }
//   }

//   // Hàm xử lý cho case 7 và 8
//   handlePersonalCertificateRegister(prop, issuedBy, certificateObj: DTOPersonalCertificate) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       if (issuedBy != certificateObj.Register) {
//         certificateObj.Register = issuedBy;
//         if (certificateObj.Code == 0) {
//           if (Ps_UtilObjectService.hasValue(this.personalCertificateType1) || Ps_UtilObjectService.hasValue(this.personalCertificateType2))
//             certificateObj.Code = this.personalCertificateType1.Code
//         }
//         this.UpdatePersonalCertificate(prop, certificateObj);
//       }
//     }
//   }
//   onDropdownlistClick(prop: string[], TypeData: number, TypeString: string) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       switch (TypeData) {
//         case 1:
//           this.personal[TypeString] = this['Selected' + TypeString].OrderBy;
//           this.personal.Code = this.employee.Code
//           this.UpdatePersonalInfo(prop, this.personal);

//           break
//         case 2:
//           if (TypeString == 'SelectedYear') {
//             if (this.SelectedYear) {
//               this.dropdownDay = this.getDaysInMonth(this.SelectedMonth)
//               this.personal.BirthYear = this.SelectedYear
//               this.SelectedMonth = null
//               this.personal.BirthMonth = null
//               this.SelectedDay = null
//               this.personal.BirthDay = null
//             }
//           }
//           if (TypeString == 'SelectedMonth') {
//             if (this.SelectedMonth) {
//               this.dropdownDay = this.getDaysInMonth(this.SelectedMonth)
//               this.personal.BirthMonth = this.SelectedMonth
//               this.SelectedDay = null
//               this.personal.BirthDay = null
//             }
//           }
//           if (TypeString == 'SelectedDay') {
//             if (this.SelectedDay) {
//               this.personal.BirthDay = this.SelectedDay
//             }
//           }
//           this.personal.Code = this.employee.Code
//           this.UpdatePersonalInfo(prop, this.personal)
//           break
//         case 3:
//           if (this.personalContact.Profile == 0) {
//             prop.push('Profile')
//             this.personalContact.Profile = this.personal.Code
//           }

//           if (TypeString == "SelectedSocialNetworkTypeData") {
//             this.personalContact.SocialNetworkTypeData = this.SelectedSocialNetworkTypeData.OrderBy
//           }
//           else if (TypeString == "SelectedOtherSocialNetworkTypeData") {
//             this.personalContact.OtherSocialNetworkTypeData = this.SelectedOtherSocialNetworkTypeData.OrderBy
//           }
//           else if (TypeString == "SelectedchatVoIP") {
//             this.personalContact.VoIPTypeData = this.SelectedchatVoIP.OrderBy
//           }
//           this.UpdatePersonalContact(prop, this.personalContact)
//           break
//         case 4:
//           if (TypeString == "SelectedCountryOfResidence") {
//             const ListDiable = [
//               { Name: 'notSelectedProvince1', value: this.notSelectedProvince1, NameSelect: 'SelectedProvincePermanent', objectSelect: 'VNProvince' },
//               { Name: 'notSelectedDistrict1', value: this.notSelectedDistrict1, NameSelect: 'SelectedDistrictPermanent', objectSelect: 'VNDistrict' },
//               { Name: 'notSelectedWard1', value: this.notSelectedWard1, NameSelect: 'SelectedWardPermanent', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType1, prop, 'Country', this.SelectedCountryOfResidence.Code, ListDiable)
//           }
//           else if (TypeString == "SelectedCountry") {
//             const ListDiable = [
//               { Name: 'notSelectedProvince2', value: this.notSelectedProvince2, NameSelect: 'SelectedProvinceTemporaryResidence', objectSelect: 'VNProvince' },
//               { Name: 'notSelectedDistrict2', value: this.notSelectedDistrict2, NameSelect: 'SelectedDistrictTemporaryResidence', objectSelect: 'VNDistrict' },
//               { Name: 'notSelectedWard2', value: this.notSelectedWard2, NameSelect: 'SelectedWardTemporaryResidence', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType2, prop, 'Country', this.SelectedCountry.Code, ListDiable)
//           }
//           break
//         case 5:
//           if (TypeString === "SelectedProvincePermanent") {
//             const ListDiable = [
//               { Name: 'notSelectedDistrict1', value: this.notSelectedDistrict1, NameSelect: 'SelectedDistrictPermanent', objectSelect: 'VNDistrict' },
//               { Name: 'notSelectedWard1', value: this.notSelectedWard1, NameSelect: 'SelectedWardPermanent', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType1, prop, 'Province', this.SelectedProvincePermanent.Code, ListDiable)
//           } else if (TypeString === "SelectedProvinceTemporaryResidence") {
//             const ListDiable = [
//               { Name: 'notSelectedDistrict2', value: this.notSelectedDistrict2, NameSelect: 'SelectedDistrictTemporaryResidence', objectSelect: 'VNDistrict' },
//               { Name: 'notSelectedWard2', value: this.notSelectedWard2, NameSelect: 'SelectedWardTemporaryResidence', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType2, prop, 'Province', this.SelectedProvinceTemporaryResidence.Code, ListDiable)
//           }
//           break
//         case 6:
//           if (TypeString == "SelectedDistrictPermanent") {
//             const ListDiable = [
//               { Name: 'notSelectedWard1', value: this.notSelectedWard1, NameSelect: 'SelectedWardPermanent', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType1, prop, 'District', this.SelectedDistrictPermanent.Code, ListDiable)
//           }
//           else if (TypeString == "SelectedDistrictTemporaryResidence") {
//             const ListDiable = [
//               { Name: 'notSelectedWard2', value: this.notSelectedWard2, NameSelect: 'SelectedWardTemporaryResidence', objectSelect: 'VNWard' }
//             ]
//             this.onUpdatePersonalAddress(this.personalAddressType2, prop, 'District', this.SelectedDistrictTemporaryResidence.Code, ListDiable)
//           }
//           break
//         case 7:
//           if (TypeString == "SelectedWardPermanent") {
//             this.personalAddressType1.Ward = this.SelectedWardPermanent.Code
//             this.UpdatePersonalAddress(prop, this.personalAddressType1)
//           }
//           else if (TypeString == "SelectedWardTemporaryResidence") {
//             this.personalAddressType2.Ward = this.SelectedWardTemporaryResidence.Code
//             this.UpdatePersonalAddress(prop, this.personalAddressType2)
//           }
//           break
//       }
//     }
//   }

//   onUpdatePersonalAddress(objAddress: DTOPersonalAddress, prop, dropdownName: string, value: number, ListDiable) {
//     if (objAddress.Code == 0) {
//       prop.push('Profile')
//     }
//     if (dropdownName == 'Country') {
//       objAddress.Country = value
//       objAddress.Province = null
//       objAddress.District = null
//       objAddress.Ward = null
//       this.IsDiableDropdown(ListDiable, value, "VNProvince")
//       this.UpdatePersonalAddress(prop, objAddress)
//       if (objAddress.TypeData == 1) {
//         this.OpenProvince1()
//       } else {
//         this.OpenProvince2()
//       }
//     }
//     if (dropdownName == 'Province') {
//       objAddress.Province = value
//       objAddress.District = null
//       objAddress.Ward = null
//       this.IsDiableDropdown(ListDiable, value, "VNDistrict")
//       this.UpdatePersonalAddress(prop, objAddress)
//       if (objAddress.TypeData == 1) {
//         this.OpenDistrict1()
//       } else {
//         this.OpenDistrict2()
//       }
//     }
//     if (dropdownName == 'District') {
//       objAddress.District = value
//       objAddress.Ward = null
//       this.IsDiableDropdown(ListDiable, value, "VNWard")
//       this.UpdatePersonalAddress(prop, objAddress)
//       if (objAddress.TypeData == 1) {
//         this.OpenWard1()
//       } else {
//         this.OpenWard2()
//       }
//     }
//   }

//   IsDiableDropdown(ListDiable, value, string) {
//     ListDiable.forEach(i => {
//       if (Ps_UtilObjectService.hasValue(this[i.NameSelect])) {
//         this[i.NameSelect] = {
//           [i.objectSelect]: "",
//           Code: null
//         }
//       }
//       if (value == null) {
//         if (i.value == false) {
//           i.value = true
//           this[i.Name] = i.value
//         }
//       } else {
//         if (i.objectSelect == string) {
//           i.value = false
//           this[i.Name] = i.value
//         } else {
//           i.value = true
//           this[i.Name] = i.value
//         }
//       }
//     })
//     const key = ListDiable[0].NameSelect.replace("Selected", "")
//     this.dropdownStates[key] = true
//   }

//   //Xử Lý sự kiện nhập thông tin Update từ Datepicker
//   onDatepickerChange(prop: string[], TypeData: number) {
//     switch (TypeData) {
//       case 1:

//         if (Ps_UtilObjectService.hasValueString(prop)) {
//           if (this.personalCertificate[0].CertificateNo.length == 0 && this.personalCertificate[0].Code == 0) {
//             this.personalCertificate[0].ProfileID = this.personal.ProfileID
//             prop.push('ProfileID')
//           }
//           if (Ps_UtilObjectService.hasValueString(this.EffDateCCCD)) {
//             const dateString1 = formatDate(this.EffDateCCCD, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             const dateString2 = formatDate(this.personalCertificate[0].EffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (dateString1 != dateString2) {
//               if (this.EffDateCCCD <= this.minDate) {
//                 this.EffDateCCCD = this.minDate
//                 this.EffDateCCCD = new Date(this.EffDateCCCD.getTime() + (24 * 60 * 60 * 1000))
//                 this.personalCertificate[0].EffDate = this.EffDateCCCD
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else if (this.EffDateCCCD >= this.maxDate) {
//                 this.EffDateCCCD = this.maxDate
//                 this.personalCertificate[0].EffDate = this.EffDateCCCD
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else {
//                 this.personalCertificate[0].EffDate = this.EffDateCCCD
//                 if (this.CCCDCode.length == 9) {
//                   const HSD: Date = new Date(this.EffDateCCCD)
//                   HSD.setFullYear(this.EffDateCCCD.getFullYear() + 15)
//                   this.ExpDateCCCD = new Date(HSD)
//                   this.personalCertificate[0].ExpDate = this.ExpDateCCCD
//                 }
//                 else if (this.CCCDCode.length == 12) {
//                   const currenYear: Date = new Date
//                   const HSD: Date = new Date
//                   if (Ps_UtilObjectService.hasValue(this.personal.BirthYear)) {
//                     const age = currenYear.getFullYear() - this.personal.BirthYear
//                     if (age <= 25) {
//                       const hsd = this.personal.BirthYear + 25
//                       HSD.setFullYear(hsd, this.personal.BirthMonth - 1, this.personal.BirthDay)
//                       this.ExpDateCCCD = HSD
//                     }
//                     else if (age > 25 && age <= 40) {
//                       const hsd = this.personal.BirthYear + 40
//                       HSD.setFullYear(hsd, this.personal.BirthMonth - 1, this.personal.BirthDay)
//                       this.ExpDateCCCD = HSD
//                     }
//                     else if (age > 40 && age <= 60) {
//                       const hsd = this.personal.BirthYear + 60
//                       HSD.setFullYear(hsd, this.personal.BirthMonth - 1, this.personal.BirthDay)
//                       this.ExpDateCCCD = HSD
//                     }
//                   } else {
//                     const age = currenYear.getFullYear() - (this.EffDateCCCD.getFullYear() - 14)
//                     const BirthYear = currenYear.getFullYear() - age
//                     if (age <= 25) {
//                       const hsd = BirthYear + 25
//                       this.EffDateCCCD.setFullYear(hsd)
//                       this.ExpDateCCCD = this.EffDateCCCD
//                     }
//                     else if (age > 25 && age <= 40) {
//                       const hsd = BirthYear + 40
//                       this.EffDateCCCD.setFullYear(hsd)
//                       this.ExpDateCCCD = this.EffDateCCCD
//                     }
//                     else if (age > 40 && age <= 60) {
//                       const hsd = BirthYear + 60
//                       this.EffDateCCCD.setFullYear(hsd)
//                       this.ExpDateCCCD = this.EffDateCCCD
//                     }
//                   }
//                   this.personalCertificate[0].ExpDate = this.ExpDateCCCD
//                 }
//               }
//               this.UpdatePersonalCertificate(prop, this.personalCertificate[0])
//             }
//           } else {
//             this.ExpDateCCCD = null
//             const personalCertificateFormat = { ...this.personalCertificate[0], EffDate: null, ExpDate: null }
//             this.UpdatePersonalCertificate(prop, personalCertificateFormat)
//           }
//         }
//         break
//       case 2:
//         if (Ps_UtilObjectService.hasValueString(prop)) {
//           if (this.personalCertificate[1].CertificateNo.length == 0 && this.personalCertificate[1].Code == 0) {
//             this.personalCertificate[1].ProfileID = this.personal.ProfileID
//             prop.push('ProfileID')
//           }
//           if (Ps_UtilObjectService.hasValueString(this.EffDatePP)) {
//             const dateString = formatDate(this.EffDatePP, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             const dateString2 = formatDate(this.personalCertificate[1].EffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (dateString != dateString2) {
//               if (this.EffDatePP <= this.minDate) {
//                 this.EffDatePP = this.minDate
//                 this.EffDatePP = new Date(this.EffDatePP.getTime() + (24 * 60 * 60 * 1000))
//                 this.personalCertificate[1].EffDate = this.EffDatePP
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else if (this.EffDatePP >= this.maxDate) {
//                 this.EffDatePP = this.maxDate
//                 this.personalCertificate[1].EffDate = this.EffDatePP
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else {
//                 this.personalCertificate[1].EffDate = this.EffDatePP
//                 const HSD: Date = new Date(this.EffDatePP)
//                 HSD.setFullYear(this.EffDatePP.getFullYear() + 10)
//                 this.ExpDatePP = HSD
//                 this.personalCertificate[1].ExpDate = this.ExpDatePP
//               }
//               this.UpdatePersonalCertificate(prop, this.personalCertificate[1])
//             }
//           } else {
//             this.ExpDatePP = null
//             const personalCertificateFormat = { ...this.personalCertificate[1], EffDate: null, ExpDate: null }
//             this.UpdatePersonalCertificate(prop, personalCertificateFormat)
//           }
//         }
//         break
//       case 3:
//         if (Ps_UtilObjectService.hasValueString(prop)) {
//           if (Ps_UtilObjectService.hasValueString(this.ExpDateCCCD)) {
//             const dateString = formatDate(this.ExpDateCCCD, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             const dateString2 = formatDate(this.personalCertificate[0].ExpDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (dateString != dateString2) {
//               if (this.ExpDateCCCD <= this.minEXPDate) {
//                 this.ExpDateCCCD = this.minEXPDate
//                 this.ExpDateCCCD = new Date(this.ExpDateCCCD.getTime() + (24 * 60 * 60 * 1000))
//                 this.personalCertificate[0].ExpDate = this.ExpDateCCCD
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else if (this.ExpDateCCCD >= this.maxEXPDate) {
//                 this.ExpDateCCCD = this.maxEXPDate
//                 this.personalCertificate[0].ExpDate = this.ExpDateCCCD
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else {
//                 this.personalCertificate[0].ExpDate = this.ExpDateCCCD
//               }
//               this.UpdatePersonalCertificate(prop, this.personalCertificate[0])
//             }
//           } else {

//             const personalCertificateFormat = { ...this.personalCertificate[0], ExpDate: null, }
//             this.UpdatePersonalCertificate(prop, personalCertificateFormat)

//           }
//         }
//         break
//       case 4:
//         if (Ps_UtilObjectService.hasValueString(prop)) {
//           if (Ps_UtilObjectService.hasValueString(this.ExpDatePP)) {
//             const dateString = formatDate(this.ExpDatePP, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             const dateString2 = formatDate(this.personalCertificate[1].ExpDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
//             if (dateString != dateString2) {
//               if (this.ExpDatePP <= this.minEXPDate) {
//                 this.ExpDatePP = this.minEXPDate
//                 this.ExpDatePP = new Date(this.ExpDatePP.getTime() + (24 * 60 * 60 * 1000))
//                 this.personalCertificate[1].ExpDate = this.ExpDatePP
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else if (this.ExpDatePP >= this.maxEXPDate) {
//                 this.ExpDatePP = this.maxEXPDate
//                 this.personalCertificate[1].ExpDate = this.ExpDatePP
//                 this.layoutService.onError('Số năm không hợp lệ');
//               } else {
//                 this.personalCertificate[1].ExpDate = this.ExpDatePP
//               }
//               this.UpdatePersonalCertificate(prop, this.personalCertificate[1])
//             }
//           } else {

//             const personalCertificateFormat = { ...this.personalCertificate[1], ExpDate: null, }
//             this.UpdatePersonalCertificate(prop, personalCertificateFormat)
//           }

//         }
//         break
//       case 5:
//         if (Ps_UtilObjectService.hasValueString(prop)) {
//           if (Ps_UtilObjectService.hasValueString(this.PITEffDate)) {
//             const dateString = formatDate(this.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US')
//             if (dateString != this.personal.PITEffDate) {
//               this.personal.PITEffDate = dateString
//             }
//           }
//           else {
//             this.personal.PITEffDate = null
//           }
//           this.personal.Code = this.employee.Code;
//           this.UpdatePersonalInfo(prop, this.personal)
//         }
//         break
//     }
//   }
//   //
//   OpenProvince1() {
//     var f = { ...this.loadFilter(1) }
//     this.APIGetListProvince(1, f)
//   }
//   OpenDistrict1() {
//     var f = { ... this.loadFilter(2) }
//     this.APIGetListDistrict(1, f)
//   }
//   OpenWard1() {
//     var f = { ... this.loadFilter(5) }
//     this.APIGetListWard(1, f)
//     // this.GetListWard(this.SelectedDistrictPermanent.Code, 1)
//   }
//   OpenProvince2() {
//     var f = { ... this.loadFilter(3) }
//     this.APIGetListProvince(2, f)
//   }
//   OpenDistrict2() {
//     var f = { ...  this.loadFilter(4) }
//     this.APIGetListDistrict(2, f)
//   }
//   OpenWard2() {
//     var f = { ... this.loadFilter(6) }
//     this.APIGetListWard(2, f)
//     // this.GetListWard(this.SelectedDistrictTemporaryResidence.Code, 2)
//   }
//   onKeyPress(event: KeyboardEvent) {
//     const input = event.key;
//     const pattern = /[0-9]/; // Chỉ cho phép các ký tự số

//     if (!pattern.test(input)) {
//       event.preventDefault(); // Ngăn chặn ký tự không hợp lệ
//     }
//   }

//   ngOnDestroy(): void {
//     this.arrUnsubscribe.forEach((s) => {
//       s?.unsubscribe();
//     });
//   }
// }
