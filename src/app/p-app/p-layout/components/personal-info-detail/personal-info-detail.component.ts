import { formatDate } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { State, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfigPersonalInforApiService } from 'src/app/p-app/p-config/shared/services/config-personal-infor-api.service';
import { DTOLSDistrict } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSDistrict.dto';
import { DTOLSProvince } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import { DTOLSWard } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSWard.dto';
import { DTOEmployee, DTOEmployeeDetail } from 'src/app/p-app/p-hri/shared/dto/DTOEmployee.dto';
import { DTOPersonalInfo, DTOPersonalCertificate, DTOPersonalContact, DTOPersonalAddress, DTOListCountry, DTOListHR } from 'src/app/p-app/p-hri/shared/dto/DTOPersonalInfo.dto';
import { PayslipService } from 'src/app/p-app/p-hri/shared/services/payslip.service';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { Ps_UtilObjectService, DTOConfig } from 'src/app/p-lib';
import { DTOActionPermission } from '../../dto/DTOActionPermission';
import { DTOCFFile } from '../../dto/DTOCFFolder.dto';
import { ModuleDataItem } from '../../dto/menu-data-item.dto';
import { EnumDialogType } from '../../enum/EnumDialogType';
import { LayoutService } from '../../services/layout.service';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';

@Component({
  selector: 'app-personal-info-detail',
  templateUrl: './personal-info-detail.component.html',
  styleUrls: ['./personal-info-detail.component.scss']
})
export class PersonalInfoDetailComponent {
  //#region ViewChild
  @ViewChild("passwordRef", { static: false }) public passwordTextBox: TextBoxComponent;
  //#endregion
  //#region Boolean
  dropdownStates: { [key: string]: boolean } = {};
  loading: boolean = false
  @Input() isLockAll: boolean = false
  justLoaded = true
  isAdd: boolean = true
  isEmailValid: boolean = false;
  isPasswordShow: boolean = false;
  dialogOpen: boolean = false;

  //PERMISTION
  @Input() isToanQuyen = false
  @Input() isAllowedToCreate = false
  @Input() isAllowedToVerify = false
  //#endregion 

  //address
  hasValueCountry1: boolean = false
  hasValueProvince1: boolean = false
  hasValueDistrict1: boolean = false

  hasValueCountry2: boolean = false
  hasValueProvince2: boolean = false
  hasValueDistrict2: boolean = false

  //#region ObjectDrodown
  SelectedGender: { ListName: string; OrderBy: number }
  SelectedMarital: { ListName: string; OrderBy: number }
  SelectedCountry: { VNName: string; Code: number }
  SelectedEthnic: { ListName: string; OrderBy: number }
  SelectedReligion: { ListName: string; OrderBy: number }
  //edu
  SelectedEducation: { ListName: string; OrderBy: number }
  SelectedEduRank: { ListName: string; OrderBy: number }
  SelectedEduDegree: { ListName: string; OrderBy: number }
  //social
  SelectedOtherSocialNetworkTypeData: { ListName: string; OrderBy: number }
  SelectedSocialNetworkTypeData: { ListName: string; OrderBy: number }
  SelectedchatVoIP: { ListName: string; OrderBy: number }
  //address
  SelectedNationality: { VNName: string; Code: number | string }

  SelectedCountry1: { VNName: string; Code: number }
  SelectedProvince1: { VNProvince: string; Code: number }
  SelectedDistrict1: { VNDistrict: string; Code: number }
  SelectedWard1: { VNWard: string; Code: number }

  SelectedCountry2: { VNName: string; Code: number }
  SelectedProvince2: { VNProvince: string; Code: number }
  SelectedDistrict2: { VNDistrict: string; Code: number }
  SelectedWard2: { VNWard: string; Code: number }

  // 
  SelectedBirthYear: { ListName: string; OrderBy: number }
  SelectedBirthMonth: { ListName: string; OrderBy: number }
  SelectedBirthDay: { ListName: string; OrderBy: number }
  //#endregion

  //#region ObjectDTO
  personal = new DTOPersonalInfo()
  employee = new DTOEmployee()
  personalCertificateType1 = new DTOPersonalCertificate()
  personalCertificateType2 = new DTOPersonalCertificate()
  personalContact = new DTOPersonalContact()
  personalAddressType1 = new DTOPersonalAddress()
  personalAddressType2 = new DTOPersonalAddress()
  //#endregion

  //DATE
  EffDateCCCD: Date
  ExpDateCCCD: Date
  EffDatePP: Date
  ExpDatePP: Date
  PITEffDate: Date
  //STRING
  CCCDCode: string = ''
  PassportCode: string = ''
  issuedbyCCCD: string = ''
  issuedbyPass: string = ''
  PermanentAddress: string = ''
  TemporaryResidenceAddress: string = ''
  previousPersonalPwd: string = ''
  previousPhoneNumberValue1: string = ''
  previousPhoneNumberValue2: string = ''
  previousEmerPhoneNumber: string = ''

  //#region Kendo Filter
  gridState: State = {
    filter: { filters: [], logic: 'and' },
  }
  groupFilter: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
  filterProvince: FilterDescriptor = {
    field: "Country", operator: "eq", value: 1
  }
  filterDistrict: FilterDescriptor = {
    field: "Province", operator: "eq", value: 1
  }
  filterWard: FilterDescriptor = {
    field: "District", operator: "eq", value: 1
  }
  //#endregion

  //#region Array
  actionPerm: DTOActionPermission[] = []
  //NATION
  listNationality: DTOListCountry[] = [];
  listNationalityFilter: DTOListCountry[] = [];
  //PROVINCE
  provinceList1: DTOLSProvince[] = [];
  provinceList1Filter: DTOLSProvince[] = [];
  provinceList2: DTOLSProvince[] = [];
  provinceList2Filter: DTOLSProvince[] = [];
  //DISTRICT
  districtList1: DTOLSDistrict[] = [];
  districtList1Filter: DTOLSDistrict[] = [];
  districtList2: DTOLSDistrict[] = [];
  districtList2Filter: DTOLSDistrict[] = [];
  //WARD
  wardList1: DTOLSWard[] = [];
  wardList1Filter: DTOLSWard[] = [];
  wardList2: DTOLSWard[] = [];
  wardList2Filter: DTOLSWard[] = [];
  //dropdownbirthday
  years: any[];
  dropdownDay: any[];
  dropdownMonth: any[];
  // 
  ListpersonalCertificate: DTOPersonalCertificate[] = []
  ListpersonalAddress: DTOPersonalAddress[] = []

  //#endregion

  //object 
  //INFO
  //ADDRESS
  province = new DTOLSProvince()
  district = new DTOLSDistrict()
  ward = new DTOLSWard()
  Country = new DTOListCountry()
  //DATE
  today: Date = new Date()
  minDate: Date = new Date();
  maxDate: Date = new Date();

  minEXPDate: Date = new Date();
  maxEXPDate: Date = new Date();
  component: { EffDate: Date; }[];
  //ARRAY
  List: { [key: string]: DTOListHR[] } = {}
  ListFilter: { [key: string]: DTOListHR[] } = {}

  //#region Callback Function
  pickFileCallback: Function
  GetFolderCallback: Function
  //#endregion

  //#region Subject
  unsubscribe = new Subject<void>();
  //#endregion

  confirm = EnumDialogType.Confirm

  constructor(
    public menuService: PS_HelperMenuService,
    private apiServiceMar: MarNewsProductAPIService,
    private apiServicePersonal: ConfigPersonalInforApiService,
    public layoutService: LayoutService,
    public payslipService: PayslipService,

  ) {
    this.years = this.generateYearList()
    this.dropdownDay = this.getDaysInMonth(1);
    this.dropdownMonth = this.getMonth()
  }



  //
  ngOnInit(): void {
    let that = this

    this.minDate.setFullYear(this.minDate.getFullYear() - 60);
    this.maxEXPDate.setFullYear(this.maxEXPDate.getFullYear() + 80);

    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })

    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)
  }

  ngAfterViewInit(): void {
    //Ẩn kí tự cho input password 
    if (!this.isAdd) {
      this.passwordTextBox.input.nativeElement.type = 'password'
    }
  }
  //



  //#region API

  // lấy thông tin Nhân sự
  /**
   * API Lấy thông tin nhân sự
   * @param DTO DTO
   */
  APIGetHRPersonalInfo(DTO: DTOPersonalInfo) {
    this.loading = true;
    // Nếu không phải công ty 4 thì lấy Code = ProfileID
    if (this.isLockAll) {
      DTO.Code = DTO.ProfileID;
    }

    this.apiServicePersonal.GetHRPersonalProfile(DTO).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.personal = res.ObjectReturn;
        this.previousPersonalPwd = this.personal.Pwd
        this.assignDropdownValue()
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${res.ErrorString}`)
      }
      this.APIGetPersonalContact()
      this.APIGetPersonalCertificate()
      this.APIGetPersonalAddress()

      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin nhân sự: ${err.toString()}`);
      this.loading = false;
    });
  }



  // lấy thông tin Chứng Thực
  APIGetPersonalCertificate() {
    this.loading = true;

    this.apiServicePersonal.GetPersonalCertificate(this.personal.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListpersonalCertificate = res.ObjectReturn
        if (this.ListpersonalCertificate.length == 0) {
          for (let index = 1; index <= 2; index++) {
            this[`personalCertificateType${index}`].TypeData = index
            this[`personalCertificateType${index}`].ProfileID = this.personal.Code
            this.ListpersonalCertificate.push(this[`personalCertificateType${index}`])
          }
        } else if (this.ListpersonalCertificate.length == 1) {
          let hasTypeData1 = this.ListpersonalCertificate.findIndex(i => i.TypeData == 1)
          if (hasTypeData1 == -1) {
            this.personalCertificateType1.TypeData = 1
            this.personalCertificateType1.ProfileID = this.personal.Code
            this.ListpersonalCertificate.push(this.personalCertificateType1)
          } else {
            this.personalCertificateType2.TypeData = 2
            this.personalCertificateType2.ProfileID = this.personal.Code
            this.ListpersonalCertificate.push(this.personalCertificateType2)
          }
        }
        this.personalCertificateType1 = this.ListpersonalCertificate.find(i => i.TypeData == 1)
        this.personalCertificateType2 = this.ListpersonalCertificate.find(i => i.TypeData == 2)
        this.assignDate()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chứng thực nhân sự: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chứng thực nhân sự: ${err}`);
      this.loading = false;
    })
  }

  // lấy thông tin liên hệ
  APIGetPersonalContact() {
    this.loading = true;

    this.apiServicePersonal.GetPersonalContact(this.personal.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
          this.personalContact = res.ObjectReturn;
          this.previousPhoneNumberValue1 = this.personalContact.Cellphone
          this.previousPhoneNumberValue2 = this.personalContact.OtherCellphone
          this.previousEmerPhoneNumber = this.personalContact.EmergencyNo
          this.SelectedSocialNetworkTypeData = { ListName: this.personalContact.SocialNetworkTypeDataName, OrderBy: this.personalContact.SocialNetworkTypeData }
          this.SelectedOtherSocialNetworkTypeData = { ListName: this.personalContact.OtherSocialNetworkTypeDataName, OrderBy: this.personalContact.OtherSocialNetworkTypeData }
          this.SelectedchatVoIP = { ListName: this.personalContact.VoIPTypeDataName, OrderBy: this.personalContact.VoIPTypeData }
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin liên hệ nhân sự: ${err}`);
      this.loading = false;
    })
  }

  // lấy thông tin Địa chỉ cư trú
  APIGetPersonalAddress() {
    this.loading = true;

    this.apiServicePersonal.GetPersonalAddress(this.personal.Code).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.ListpersonalAddress = res.ObjectReturn
        if (this.ListpersonalAddress.length == 0) {
          for (let index = 1; index <= 2; index++) {
            this[`personalAddressType${index}`].TypeData = index
            this[`personalAddressType${index}`].Profile = this.personal.Code
            this.ListpersonalAddress.push(this[`personalAddressType${index}`])
          }
        } else if (this.ListpersonalAddress.length == 1) {
          let hasTypeData1 = this.ListpersonalAddress.findIndex(i => i.TypeData == 1)
          if (hasTypeData1 == -1) {
            this.personalAddressType1.TypeData = 1
            this.personalAddressType1.Profile = this.personal.Code
            this.ListpersonalAddress.push(this.personalAddressType1)
          } else {
            this.personalAddressType2.TypeData = 2
            this.personalAddressType2.Profile = this.personal.Code
            this.ListpersonalAddress.push(this.personalAddressType2)
          }
        }
        this.personalAddressType1 = this.ListpersonalAddress.find(i => i.TypeData == 1)
        this.personalAddressType2 = this.ListpersonalAddress.find(i => i.TypeData == 2)
        this.assignDropdownAddress(1)
        this.assignDropdownAddress(2)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin địa chỉ cư trú nhân sự: ${res.ObjectReturn}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin địa chỉ cư trú nhân sự: ${err}`);
      this.loading = false;
    })
  }

  // Lấy dữ liệu dropdrown
  APIGetListHr(Key: string, Code: number) {
    this.loading = true;
    this.apiServicePersonal.GetListHR(Code).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.List[Key] = res.ObjectReturn
        this.ListFilter[Key] = this.List[Key]
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Giới tính: ${err}`);
      this.loading = false;
    });
  }

  // Lấy dữ liệu dropdrown Quốc gia 
  APIGetNationality() {
    this.loading = true;
    this.apiServicePersonal.GetListCountry().pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.listNationality = res.ObjectReturn.Data
        this.listNationalityFilter = JSON.parse(JSON.stringify(res.ObjectReturn.Data))
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${err}`);
      this.loading = false;
    });
  }

  //Lấy dữ liệu dropdrown Tỉnh thành
  APIGetListProvince(typeData: number, state: State) {
    // switch (typeData) {
    //   case 1:
    var ctx = 'lấy Danh sách Tỉnh thành '
    this.loading = true;

    this.apiServicePersonal.GetListProvince(state).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        var data = res.ObjectReturn.Data

        if (typeData == 1) {
          ctx += 'Thường trú'
          this.provinceList1 = data
          this.provinceList1Filter = JSON.parse(JSON.stringify(data))
        }
        else {
          ctx += 'Tạm trú'
          this.provinceList2 = data
          this.provinceList2Filter = JSON.parse(JSON.stringify(data))
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
      this.loading = false;
    });
  }

  //Lấy dữ liệu dropdrown Quận/huyện
  APIGetListDistrict(typeData: number, state: State) {
    var ctx = 'lấy Danh sách Quận huyện '
    this.loading = true;

    this.apiServicePersonal.GetListDistrict(state).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        var data = res.ObjectReturn.Data

        if (typeData == 1) {
          ctx += 'Thường trú'
          this.districtList1 = data
          this.districtList1Filter = JSON.parse(JSON.stringify(data))
        } else {
          ctx += 'Tạm trú'
          this.districtList2 = data
          this.districtList2Filter = JSON.parse(JSON.stringify(data))
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
      this.loading = false;
    });
  }

  //Lấy dữ liệu dropdrown Phường/xã
  APIGetListWard(typeData: number, state: State) {
    // switch (typeData) {
    //   case 1:
    var ctx = 'lấy Danh sách Phường xã '
    this.loading = true;

    this.apiServicePersonal.GetListWard(state).pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (res.StatusCode == 0) {
        var data = res.ObjectReturn.Data

        if (typeData == 1) {
          ctx += 'Thường trú'
          this.wardList1 = data
          this.wardList1Filter = JSON.parse(JSON.stringify(data))
        } else {
          ctx += 'Tạm trú'
          this.wardList2 = data
          this.wardList2Filter = JSON.parse(JSON.stringify(data))
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    },
      (error) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
      }
    );
  }

  //
  generateYearList(): any[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 60;
    const endYear = currentYear - 18
    const yearList = [];

    for (let year = endYear; year >= startYear; year--) {
      yearList.push({ ListName: year.toString(), OrderBy: year });
    }

    return yearList;
  }

  // Kiểm tra xem có phải là năm nhuận hay không.
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  // Tạo ra danh sách các tháng từ 1 đến 12.
  getMonth(): any[] {
    const monthList = [];
    for (let year = 1; year <= 12; year++) {
      monthList.push({ ListName: year.toString(), OrderBy: year });
    }
    return monthList
  }

  // Tạo ra danh sách các ngày trong tháng được chọn.
  getDaysInMonth(selectedMonth: number): any[] {
    const dayList = [];
    switch (selectedMonth) {
      case 2:
        const isLeapYear = this.isLeapYear(this.SelectedBirthYear.OrderBy);

        // Tạo danh sách ngày từ 1 đến 29 hoặc 28 tùy thuộc vào năm nhuận.
        if (isLeapYear == true) {
          for (let day = 1; day <= 29; day++) {
            dayList.push({ ListName: day.toString(), OrderBy: day });
          }
        } else {
          for (let day = 1; day <= 28; day++) {
            dayList.push({ ListName: day.toString(), OrderBy: day });
          }
        }
        return dayList;
      case 4:
      case 6:
      case 9:
      case 11: // Tháng 4, 6, 9, 11 có 30 ngày.
        for (let day = 1; day <= 30; day++) {
          dayList.push({ ListName: day.toString(), OrderBy: day });
        }
        return dayList;
      default:  // Các tháng còn lại có 31 ngày.
        for (let day = 1; day <= 31; day++) {
          dayList.push({ ListName: day.toString(), OrderBy: day });
        }
        return dayList;
    }
  }

  //#Update 
  /**
   * API Update Thông tin nhân sự
   * @param prop Properties cần update
   * @param prod DTO
   */
  APIUpdateHRPersonalInfo(prop: string[], prod = this.personal) {
    this.loading = true
    this.apiServicePersonal.UpdateHRPersonalProfile(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.personal = res.ObjectReturn
        localStorage.setItem('Staff', JSON.stringify(this.personal))

        this.layoutService.onSuccess("Cập nhật thông tin nhân sự thành công");
        if (this.isAdd) {
          this.isAdd = false
        }


        if (prop[0] == 'LastName' || prop[0] == 'MiddleName' || prop[0] == 'FirstName') {
          this.payslipService.triggerReloadSuccess();
        }
        this.assignDropdownValue()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${res.ErrorString}`);
      }
      this.loading = false
    }, (err) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi Cập nhật thông tin nhân sự: ${err}`);
    })
  }

  /**
   * Xoá hình ảnh của profile
   * @param prop 
   * @param prod 
   */
  APIDeleteImage(prop: string[], prod = this.personal) {
    prod.ImageThumb = null,
      this.apiServicePersonal.UpdateHRPersonalProfile(prod, prop).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.personal.ImageThumb = prod.ImageThumb;
          this.layoutService.onSuccess("Xóa thành công hình ảnh");
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa hình ảnh: ${res.ErrorString}`);
      }, (e) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa hình ảnh: ${e}`);
      });
  }

  /**
   * API Update Thông tin chứng thực
   * @param prop Properties cần update
   * @param prod DTO
   */
  APIUpdateHRPersonalCertificate(prop: string[], prod: DTOPersonalCertificate) {
    this.loading = true
    this.apiServicePersonal.UpdateHRPersonalCertificate(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (res.ObjectReturn.TypeData == 1) {
          this.personalCertificateType1 = res.ObjectReturn
        } else if (res.ObjectReturn.TypeData == 2) {
          this.personalCertificateType2 = res.ObjectReturn
        }
        this.layoutService.onSuccess("Cập nhật Thông tin chứng thực thành công");
      } else {
        this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + res.ErrorString);
        this.APIGetPersonalCertificate()
      }
      this.loading = false
    }, (err) => {
      this.loading = false
      this.APIGetPersonalCertificate()
      this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin chứng thực: ' + err);
    })
  }

  /**
   * API Update Thông tin liên hệ
   * @param prop Properties cần update
   * @param prod DTO
   */
  APIUpdateHRPersonalContact(prop: string[], prod = this.personalContact) {
    this.loading = true

    this.apiServicePersonal.UpdateHRPersonalContact(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.personalContact = res.ObjectReturn
        this.previousPhoneNumberValue1 = this.personalContact.Cellphone
        this.previousPhoneNumberValue2 = this.personalContact.OtherCellphone
        this.previousEmerPhoneNumber = this.personalContact.EmergencyNo
        this.layoutService.onSuccess("Cập nhật Thông tin liên hệ thành công");
      } else {
        this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + res.ErrorString);
        this.APIGetPersonalContact()
      }
      this.loading = false
    }, (err) => {
      this.loading = false
      this.APIGetPersonalContact()
      this.layoutService.onError('Đã xảy ra lỗi khi Cập nhật Thông tin liên hệ: ' + err);
    })
  }

  /**
   * API Update Thông tin địa chỉ cư trú
   * @param prop Properties cần update
   * @param prod DTO
   */
  APIUpdateHRPersonalAddress(prop: string[], prod: DTOPersonalAddress) {
    this.loading = true
    var ctx = 'Cập nhật địa chỉ '

    this.apiServicePersonal.UpdateHRPersonalAddress(prod, prop).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (res.ObjectReturn.TypeData == 1) {
          ctx += 'thường trú'
          this.personalAddressType1 = res.ObjectReturn
        } else if (res.ObjectReturn.TypeData == 2) {
          ctx += 'tạm trú'
          this.personalAddressType2 = res.ObjectReturn
        }
        this.layoutService.onSuccess(ctx + " thành công");
      } else {
        this.APIGetPersonalAddress()
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false
    }, (err) => {
      this.loading = false
      this.APIGetPersonalAddress()
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`);
    })
  }

  //#endregion

  //#region Logic

  // Lấy Dữ liệu lưu trên Cache
  getCache() {
    const res = JSON.parse(localStorage.getItem('Staff'))
    const companyRes = localStorage.getItem('Company');

    if (Ps_UtilObjectService.hasValue(companyRes)) {
      if (companyRes == '4') {
        this.isLockAll = false;
      }
      else {
        this.isLockAll = true;
      }
    }

    if (Ps_UtilObjectService.hasValue(res)) {
      if('Position' in res){
        res.Code = res.ProfileID
      }
      this.personal = res
      if (this.personal.Code != 0) {
        this.isAdd = false
        if (!this.isAdd) {
          this.APIGetHRPersonalInfo(this.personal)
        }
      } else {
        this.isAdd = true
      }
    }


  }

  
  

  //load lại trang khi click vào breacrumb
  loadPage() {
    this.getCache()
  }


  // Xử lý logic nút "Tạo mới"
  onAddNew() {
    this.isAdd = true
    const res = JSON.parse(localStorage.getItem('Staff'))
    this.personal = res

    if (this.personal.Code != 0) {
      // clear block THÔNG TIN CƠ BẢN
      this.personal = new DTOPersonalInfo()
      this.assignDropdownValue()

      // clear block THÔNG TIN CHỨNG THỰC VÀ THUẾ TNCN
      this.personalCertificateType1 = new DTOPersonalCertificate()
      this.personalCertificateType2 = new DTOPersonalCertificate()
      this.ListpersonalCertificate = []
      for (let index = 1; index <= 2; index++) {
        this[`personalCertificateType${index}`].TypeData = index
        this[`personalCertificateType${index}`].ProfileID = this.personal.Code
        this.ListpersonalCertificate.push(this[`personalCertificateType${index}`])
      }
      this.personalCertificateType1 = this.ListpersonalCertificate.find(i => i.TypeData == 1)
      this.personalCertificateType2 = this.ListpersonalCertificate.find(i => i.TypeData == 2)
      this.assignDate()

      //clear block THÔNG TIN LIÊN HỆ
      this.personalContact = new DTOPersonalContact()
      this.SelectedSocialNetworkTypeData = null;
      this.SelectedOtherSocialNetworkTypeData = null;
      this.SelectedchatVoIP = null

      // clear block ĐỊA CHỈ CƯ TRÚ
      this.personalAddressType1 = new DTOPersonalAddress()
      this.personalAddressType2 = new DTOPersonalAddress()
      this.assignDropdownAddress(1)
      this.assignDropdownAddress(2)

      if (this.isAdd) {
        localStorage.setItem('Staff', JSON.stringify(new DTOPersonalInfo()));
        this.payslipService.triggerReloadSuccess();
      }
    }
  }

  /**
   * Function chuyển sang trang thông tin gốc
   */
  onEdit() {
    this.menuService.allowModuleList$.pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem[]) => {
      var configModule = item.find(f => f.Code === 'config');
      if (Ps_UtilObjectService.hasValue(configModule) && Ps_UtilObjectService.hasListValue(configModule.ListMenu)) {
        var detail = configModule.ListMenu.find(f => f.Code === 'personal');
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes("config008-enterprise-personal-info-list")
            || f.Link.includes("config008-enterprise-personal-info-list"))
          if (Ps_UtilObjectService.hasValue(detail2) && Ps_UtilObjectService.hasListValue(detail2.LstChild)) {
            var detail3 = detail2.LstChild.find(f => f.Code.includes("config008-enterprise-personal-info-detail")
              || f.Link.includes("config008-enterprise-personal-info-detail"))
            
              // localStorage.removeItem('GetModule')
              localStorage.setItem('Staff', JSON.stringify(this.personal));
              DTOConfig.cache.companyid = '4'
              localStorage.setItem('Company', '4');
              this.menuService.GetModule()
              // this.menuService.switchModule(configModule)
              this.menuService.selectedMenu(detail2, detail)
              this.menuService.activeMenu(detail3)          
          }
        }
      }
    })
  }

  /**
   * Gán giá trị cho các lựa chọn dropdown dựa trên dữ liệu cá nhân.
   * Thiết lập các tùy chọn được chọn cho giới tính, tình trạng hôn nhân, dân tộc, tôn giáo,
   * quốc tịch, trình độ học vấn, xếp hạng học vấn, bằng cấp học vấn, ngày sinh, và PITEffDate.
   */
  assignDropdownValue() {
    this.SelectedGender = { ListName: this.personal.GenderName, OrderBy: this.personal.Gender == 0 ? null : this.personal.Gender }
    this.SelectedMarital = { ListName: this.personal.MaritalName, OrderBy: this.personal.Marital == 0 ? null : this.personal.Marital }
    this.SelectedEthnic = { ListName: this.personal.EthnicName, OrderBy: this.personal.Ethnic == 0 ? null : this.personal.Ethnic }
    this.SelectedReligion = { ListName: this.personal.ReligionName, OrderBy: this.personal.Religion == 0 ? null : this.personal.Religion }
    this.SelectedNationality = { VNName: this.personal.NationalityName, Code: this.personal.Nationality == 0 ? null : this.personal.Nationality }
    this.SelectedEducation = { ListName: this.personal.EducationName, OrderBy: this.personal.Education == 0 ? null : this.personal.Education }
    this.SelectedEduRank = { ListName: this.personal.EduRankName, OrderBy: this.personal.EduRank == 0 ? null : this.personal.EduRank }
    this.SelectedEduDegree = { ListName: this.personal.EduDegreeName, OrderBy: this.personal.EduDegree == 0 ? null : this.personal.EduDegree }

    this.SelectedBirthYear = this.years.find(i => i.OrderBy == this.personal.BirthYear)
    this.SelectedBirthMonth = this.dropdownMonth.find(i => i.OrderBy == this.personal.BirthMonth)
    this.SelectedBirthDay = this.dropdownDay.find(i => i.OrderBy == this.personal.BirthDay)


    if (Ps_UtilObjectService.hasValue(this.SelectedBirthMonth)) {
      this.dropdownDay = this.getDaysInMonth(this.SelectedBirthMonth.OrderBy)
    }

    if (Ps_UtilObjectService.hasValueString(this.personal.PITEffDate)) {
      this.PITEffDate = new Date(this.personal.PITEffDate)
    } else {
      this.PITEffDate = null
    }
  }

  // Xử lý filter trong dropdownlist
  handleFilterDropdownlist(event, currentDropdownList: any[], DropdownList: any[], typeName: string, textField: string, type?) {
    DropdownList = currentDropdownList

    if (event !== '') {
      if (type == 1) {
        this.ListFilter[typeName] = DropdownList.filter(
          (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
        );
      } else {
        this[typeName] = DropdownList.filter(
          (s) => s[textField].toLowerCase().indexOf(event.toLowerCase()) !== -1
        );
      }
    } else {
      if (type == 1) {
        this.ListFilter[typeName] = currentDropdownList
      } else {
        this[typeName] = currentDropdownList;
      }
    }
  }

  // Kiểm tra và gán giá trị ngày tháng (ngày hiệu lực và ngày hết hạn)
  assignDate() {
    if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.EffDate)) {
      this.EffDateCCCD = new Date(this.personalCertificateType1.EffDate)
    } else {
      this.EffDateCCCD = null
    }

    if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.ExpDate)) {
      this.ExpDateCCCD = new Date(this.personalCertificateType1.ExpDate)
    } else {
      this.ExpDateCCCD = null
    }

    if (Ps_UtilObjectService.hasValueString(this.personalCertificateType2.EffDate)) {
      this.EffDatePP = new Date(this.personalCertificateType2.EffDate)
    } else {
      this.EffDatePP = null
    }

    if (Ps_UtilObjectService.hasValueString(this.personalCertificateType2.ExpDate)) {
      this.ExpDatePP = new Date(this.personalCertificateType2.ExpDate)
    } else {
      this.ExpDatePP = null
    }
  }

  /**
   * Hàm gán thông tin địa chỉ được chọn vào các thuộc tính tương ứng của đối tượng địa chỉ cá nhân 
   * (SelectedCountry, SelectedProvince, SelectedDistrict, SelectedWard) dựa trên tham số 'type'.
   */
  assignDropdownAddress(type: number) {
    this[`SelectedCountry${type}`] = { VNName: this[`personalAddressType${type}`].CountryName, Code: this[`personalAddressType${type}`].Country == 0 ? null : this[`personalAddressType${type}`].Country }
    this[`SelectedProvince${type}`] = { VNProvince: this[`personalAddressType${type}`].ProvinceName, Code: this[`personalAddressType${type}`].Province == 0 ? null : this[`personalAddressType${type}`].Province }
    this[`SelectedDistrict${type}`] = { VNDistrict: this[`personalAddressType${type}`].DistrictName, Code: this[`personalAddressType${type}`].District == 0 ? null : this[`personalAddressType${type}`].District }
    this[`SelectedWard${type}`] = { VNWard: this[`personalAddressType${type}`].WardName, Code: this[`personalAddressType${type}`].Ward == 0 ? null : this[`personalAddressType${type}`].Ward }

    if (this[`SelectedCountry${type}`].Code != null) {
      this[`hasValueCountry${type}`] = true
    } else {
      this[`hasValueCountry${type}`] = false
    }

    if (this[`SelectedProvince${type}`].Code != null) {
      this[`hasValueProvince${type}`] = true
    } else {
      this[`hasValueProvince${type}`] = false
    }

    if (this[`SelectedDistrict${type}`].Code != null) {
      this[`hasValueDistrict${type}`] = true
    } else {
      this[`hasValueDistrict${type}`] = false
    }
  }


  // Lấy danh sách tỉnh, huyện, xã theo typeData 1
  OpenProvince1() {
    var f = { ...this.loadFilter(1) }
    this.APIGetListProvince(1, f)
  }

  OpenDistrict1() {
    var f = { ... this.loadFilter(2) }
    this.APIGetListDistrict(1, f)
  }

  OpenWard1() {
    var f = { ... this.loadFilter(5) }
    this.APIGetListWard(1, f)
  }


  // Lấy danh sách tỉnh, huyện, xã theo typeData 2
  OpenProvince2() {
    var f = { ... this.loadFilter(3) }
    this.APIGetListProvince(2, f)
  }

  OpenDistrict2() {
    var f = { ...  this.loadFilter(4) }
    this.APIGetListDistrict(2, f)
  }

  OpenWard2() {
    var f = { ... this.loadFilter(6) }
    this.APIGetListWard(2, f)
  }

  // Hàm load filter 
  loadFilter(code: number) {
    this.gridState.filter.filters = [];
    this.groupFilter.filters = [];

    const addressMappings = {
      1: { filterField: this.filterProvince, addressIndex: 1, addressField: 'Country' },
      2: { filterField: this.filterDistrict, addressIndex: 1, addressField: 'Province' },
      3: { filterField: this.filterProvince, addressIndex: 2, addressField: 'Country' },
      4: { filterField: this.filterDistrict, addressIndex: 2, addressField: 'Province' },
      5: { filterField: this.filterWard, addressIndex: 1, addressField: 'District' },
      6: { filterField: this.filterWard, addressIndex: 2, addressField: 'District' },
    };

    if (addressMappings[code]) {
      const { filterField, addressIndex, addressField } = addressMappings[code];
      filterField.value = this['personalAddressType' + [addressIndex]][addressField];
      if (filterField.value !== null) {
        this.groupFilter.filters.push(filterField);
      }
    }
    if (this.groupFilter.filters.length > 0) {
      this.gridState.filter.filters.push(this.groupFilter);
    }
    return this.gridState;
  }

  toggleDialog() {
    this.dialogOpen = !this.dialogOpen
  }

  onUploadImg() {
    this.layoutService.folderDialogOpened = true
  }

  //Xóa hình ảnh
  delImage(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      this.APIDeleteImage([prop])
      this.dialogOpen = false;
    }
  }

  pickFile(e: DTOCFFile) {
    this.personal.ImageThumb = e?.PathFile.replace('~', '')
    this.APIUpdateHRPersonalInfo(['ImageThumb'])
    this.layoutService.setFolderDialog(false)
  }

  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog())
      return this.apiServiceMar.GetFolderWithFile(childPath, DTOConfig.cache.companyid == '2' ? 18 : 14);
    //14 = folder cocautochuc
    //17 = folder LS_cocautochuc
  }

  /**
   * Hàm lấy link ảnh
   * @param str Link ảnh
   * @returns string
   */
  getImgRes(str: string) {
    return Ps_UtilObjectService.hasValueString(str) ? Ps_UtilObjectService.getImgRes(str) : 'assets/img/icon/icon-nonImageThumb.svg'
  }

  /**
   * Hàm hiển thị password
   */
  showPassword() {
    this.isPasswordShow = !this.isPasswordShow
    if (this.isPasswordShow) {
      this.passwordTextBox.input.nativeElement.type = 'text'
    }
    else {
      this.passwordTextBox.input.nativeElement.type = 'password'
    }
  }

  checkDisableCheckbox(phoneNumber : string){
    return !Ps_UtilObjectService.isValidPhone(phoneNumber);
  }

  //#endregion

  //#region Update Checkbox
  clickCheckbox(ev, prop, typePhone: string) {
    if (Ps_UtilObjectService.hasValueString(this.personalContact[typePhone])) {
      this.personalContact[prop] = ev.target.checked
      this.APIUpdateHRPersonalContact([prop])
    } else {
      this.layoutService.onWarning('Vui lòng nhập số diện thoại di động')
    }
  }
  //#endregion

  //#region Update Textbox
  onTextboxLoseFocus(prop: string[], TypeData: number, ObjectString?: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (TypeData) {
        // update PersonalInfo
        case 1:
          if (prop[0] == 'Pwd') {
            if (this.previousPersonalPwd != this.personal.Pwd) {
              this.APIUpdateHRPersonalInfo(prop, this.personal)
            }
          } else {
            this.APIUpdateHRPersonalInfo(prop, this.personal)
          }
          break;

        // Update Personal Certificate
        case 2:
          if (this[ObjectString].Code == 0) {
            prop.push('ProfileID')
          }
          if (ObjectString == 'personalCertificateType1') {
            if (!Ps_UtilObjectService.hasValueString(this.personalCertificateType1.CertificateNo)) {
              this.layoutService.onWarning('Vui lòng nhập số CMND/CCCD')
            } else {
              const CertificateNoRegex = /^[0-9]{9,12}$/
              if (!CertificateNoRegex.test(this[ObjectString].CertificateNo)) {
                this.layoutService.onError('Số CMND/CCCD phải từ 9 đến 12 số')
              } else {
                this.APIUpdateHRPersonalCertificate(prop, this[ObjectString])
              }
            }
          } else {
            this.APIUpdateHRPersonalCertificate(prop, this[ObjectString])
          }
          break;

        // Update personal Contact
        case 3:
          if (this.personalContact.Code == 0) {
            prop.push('Profile')
            this.personalContact.Profile = this.personal.Code
          }
          if (prop[0] == 'Email') {
            if (!Ps_UtilObjectService.isValidEmail(this.personalContact.Email)) {
              this.layoutService.onWarning('Email không hợp lệ!!')
            } else {
              this.APIUpdateHRPersonalContact(prop, this.personalContact)
            }
          } else if (prop[0] == 'Cellphone') {
            if(this.previousPhoneNumberValue1 != this.personalContact.Cellphone){
              if(Ps_UtilObjectService.isValidPhone(this.personalContact.Cellphone)){
                this.APIUpdateHRPersonalContact(prop, this.personalContact)
              }else{
                this.layoutService.onWarning('Số điện thoại không hợp lệ!!')
                this.personalContact.Cellphone = this.previousPhoneNumberValue1
              }
            }
          } else if (prop[0] == 'OtherCellphone') {
            if(this.previousPhoneNumberValue2 != this.personalContact.OtherCellphone){
              if(Ps_UtilObjectService.isValidPhone(this.personalContact.OtherCellphone)){
                this.APIUpdateHRPersonalContact(prop, this.personalContact)
              }else{
                this.layoutService.onWarning('Số điện thoại không hợp lệ!!')
                this.personalContact.OtherCellphone = this.previousPhoneNumberValue2
              }
            }
          } else if (prop[0] == 'EmergencyNo') {
            if(this.previousEmerPhoneNumber != this.personalContact.EmergencyNo){
              if(Ps_UtilObjectService.isValidPhone(this.personalContact.EmergencyNo)){
                this.APIUpdateHRPersonalContact(prop, this.personalContact)
              }else{
                this.layoutService.onWarning('Số điện thoại không hợp lệ!!')
                this.personalContact.EmergencyNo = ''
              }
            } 
          } else {
            this.APIUpdateHRPersonalContact(prop, this.personalContact)
          }
          break;

        // Update Personal Address
        case 4:
          if (this[ObjectString].Code == 0) {
            prop.push('Profile')
          }
          this.APIUpdateHRPersonalAddress(prop, this[ObjectString])
          break;
      }
    }
  }
  //#endregion

  //#region Update Dropdown
  openDropdown(key: string, TypeData: number, order?: number) {
    if (!this.dropdownStates[key]) {
      if (TypeData == 0) {
        switch (key) {

          case 'Nationality':
            this.APIGetNationality()
            break;

          case `${['Province' + order]}`:
            this[`OpenProvince${order}`]()
            break;

          case `${['District' + order]}`:
            this[`OpenDistrict${order}`]()
            break;

          case `${['Ward' + order]}`:
            this[`OpenWard${order}`]()
            break;

        }
      } else {
        this.APIGetListHr(key, TypeData)
      }
      this.dropdownStates[key] = true;
    }
  }

  onDropdownlistClick(ev, prop: string[], TypeData: number, TypeString: string, order?: number) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (TypeData) {
        // Update Dropdown Personal Info
        case 1:
          prop.forEach(item => {
            if (item == TypeString) {
              this['Selected' + item] = ev
              this.personal[item] = this['Selected' + item].OrderBy;
            } else {
              this['Selected' + item] = null
              this.personal[item] = this['Selected' + item]
            }
          })
          this.APIUpdateHRPersonalInfo(prop, this.personal);
          break;

        // Update Personal Contact
        case 3:
          if (this.personalContact.Profile == 0) {
            prop.push('Profile')
            this.personalContact.Profile = this.personal.Code
          }
          this.personalContact[prop[0]] = this[TypeString].OrderBy
          this.APIUpdateHRPersonalContact(prop, this.personalContact)
          break

        // Update Personal Address
        case 4:
          prop.forEach(item => {
            if (item == TypeString) {
              this['Selected' + item + order] = ev
              this[`personalAddressType${order}`][item] = this['Selected' + item + order].Code;
              if (this['Selected' + item + order].Code == null) {
                this[`hasValue${item + order}`] = false
              } else {
                this[`hasValue${item + order}`] = true
              }

            } else {
              this['Selected' + item + order] = null
              this[`personalAddressType${order}`][item] = this['Selected' + item + order]
              this[`hasValue${item + order}`] = false
              this.dropdownStates[item + order] = false
            }
          })
          if (this[`personalAddressType${order}`].Code == 0) {
            prop.push('Code', 'TypeData', 'Profile')
          }
          this.APIUpdateHRPersonalAddress(prop, this[`personalAddressType${order}`])
          break;
      }
    }
  }

  //#endregion

  //#region Update DatePicker

  onDatepickerChange(prop: string[], TypeData: number) {
    if (TypeData != 3) {
      if (this[`personalCertificateType${TypeData}`].Code == 0) {
        prop.push('ProfileID')
      }
      if (TypeData == 1) {
        if (Ps_UtilObjectService.hasValueString(this.personalCertificateType1.CertificateNo)) {

          if (Ps_UtilObjectService.hasValue(this[`${prop[0]}CCCD`])) {
            const dateString1 = formatDate(this[`${prop[0]}CCCD`], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
            const dateString2 = formatDate(this.personalCertificateType1[prop[0]], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
            if (dateString1 != dateString2) {
              this.personalCertificateType1.EffDate = formatDate(this.EffDateCCCD, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
              if (this.personalCertificateType1.CertificateNo.length == 9 && prop[0] == 'EffDate') {
                // if (prop[0] == 'EffDate') {
                this.ExpDateCCCD = new Date(this.EffDateCCCD.setFullYear(this.EffDateCCCD.getFullYear() + 15))
                // }
              } else if (this.personalCertificateType1.CertificateNo.length == 12 && prop[0] == 'EffDate') {
                // if (prop[0] == 'EffDate') {
                const currenYear: Date = new Date
                const age = currenYear.getFullYear() - this.personal.BirthYear
                let hsd = 0
                if (age <= 25) {
                  hsd = this.personal.BirthYear + 25
                }
                else if (age > 25 && age <= 40) {
                  hsd = this.personal.BirthYear + 40
                }
                else if (age > 40 && age <= 60) {
                  hsd = this.personal.BirthYear + 60
                }
                this.ExpDateCCCD = new Date(hsd, this.personal.BirthMonth - 1, this.personal.BirthDay)
                // }
              }
              this.personalCertificateType1.ExpDate = this.ExpDateCCCD
              this.APIUpdateHRPersonalCertificate(prop, this.personalCertificateType1)
            }
          }
        } else {
          this.layoutService.onWarning('Vui lòng nhập số CMND/CCCD')
          this.EffDateCCCD = null
          this.ExpDateCCCD = null
        }
      } else {
        if (Ps_UtilObjectService.hasValue(this[`${prop[0]}PP`])) {
          const dateString1 = formatDate(this[`${prop[0]}PP`], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
          const dateString2 = formatDate(this.personalCertificateType2[prop[0]], 'yyyy-MM-ddTHH:mm:ss', 'en-US');
          if (dateString1 != dateString2) {
            this.personalCertificateType2.EffDate = formatDate(this.EffDatePP, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
            if (prop[0] == 'EffDate') {
              this.ExpDatePP = new Date(this.EffDatePP.setFullYear(this.EffDatePP.getFullYear() + 10))
              // this.personalCertificateType2.ExpDate = this.ExpDatePP
            }
            // else {
            this.personalCertificateType2.ExpDate = this.ExpDatePP
            // }
            this.APIUpdateHRPersonalCertificate(prop, this.personalCertificateType2)
          }
        }
      }
    } else {
      const dateString1 = formatDate(this.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
      const dateString2 = formatDate(this.personal.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
      if (dateString1 != dateString2) {
        this.personal.PITEffDate = formatDate(this.PITEffDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
        this.APIUpdateHRPersonalInfo(prop, this.personal)
      }
    }
  }

  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
