import { Component, ViewChild, OnInit, OnDestroy, ElementRef, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Subject, Subscription } from 'rxjs';
import { DeveloperAPIService } from '../../shared/services/developer-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';
import { MarNewsProductAPIService } from 'src/app/p-app/p-marketing/shared/services/marnewsproduct-api.service';
import { DTOLSProvince } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import { DTOLSDistrict } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSDistrict.dto';
import { DTOLSWard } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSWard.dto';
import { DTOListCountry } from 'src/app/p-app/p-hri/shared/dto/DTOPersonalInfo.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTOCompany } from '../../shared/dto/DTOCompany';
import { DeveloperApiConfigService } from '../../shared/services/developer-api-config.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
@Component({
  selector: 'app-dev001-company-list',
  templateUrl: './dev001-company-list.component.html',
  styleUrls: ['./dev001-company-list.component.scss']
})
export class Dev001CompanyListComponent implements OnInit {


  // varible of drawer
  expandedRight: boolean = false;
  @ViewChild('drawerRight') public DrawerRightComponent: DrawerComponent;
  @ViewChild('Province') public ProvinceRef: DropDownListComponent;
  @ViewChild('District') public DistrictRef: DropDownListComponent;
  @ViewChild('Ward') public WardRef: DropDownListComponent;
  drawer: any;
  isSystem: boolean = false

  listNationalityFilter: DTOListCountry[] = [];
  listNationality: DTOListCountry[] = [];
  provinceList: DTOLSProvince[] = [];
  provinceListFilter: DTOLSProvince[] = [];
  districtList: DTOLSDistrict[] = [];
  districtListFilter: DTOLSDistrict[] = [];
  wardList: DTOLSWard[] = [];
  wardListFilter: DTOLSWard[] = [];

  notSelectedProvince: boolean = true;
  notSelectedDistrict: boolean = true;
  notSelectedWard: boolean = true;

  gridStateCPDW: State = {
    filter: { filters: [], logic: 'and' },
  }
  isAction: number = 0;


  formDataDefault = ({
    Code: 0,
    VNName: '',
    CompanyID: '',
    Bieft: '',
    Address: '',
    CountryName: null,
    TypeCompanyName: null,
    URLLogo: '',
    Country: null,
    Province: null,
    District: null,
    Ward: null,
    ConfigDesc: '',
    IsSystem: false
  });



  SelectedCountry: any
  SelectedProvince: { VNName: string; Code: number }
  SelectedDistrict: { VNName: string; Code: number }
  SelectedWard: { VNName: string; Code: number }

  filteredWardList: DTOLSWard[] = []
  filteredDistricList: DTOLSDistrict[] = []
  filteredProvinceList: DTOLSProvince[] = []
  isautoCollapse: boolean = false;
  // varible of Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function

  // varible of DIALOG
  opened: boolean = false;

  // variable of unsubcribe
  GetListCompany_sst: Subscription;
  DeleteCompany_sst: Subscription;
  UpdateCompany_sst: Subscription;
  GetNationality_sst: Subscription;
  GetListProvince_sst: Subscription;
  GetListDistrict_sst: Subscription;
  GetListWard_sst: Subscription;
  arrUnsubscribe: Subscription[] = [];
  ngUnsubscribe$ = new Subject<void>();
  // form data
  formData: FormGroup;


  // varible of grid
  loading: boolean = false
  justLoaded: boolean = true
  pageSize: number = 25
  skip: number = 0;
  gridState: State = {
    take: this.pageSize,
  }
  keyword: string = ''
  dataCompany_System: DTOCompany[] = []

  dataCompany: DTOCompany = new DTOCompany()
  dataCompanyForm: any


  //  variable of upload img
  pickFileCallback: Function
  GetFolderCallback: Function

  flagSuccess: boolean = false

  //permission 
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoadedPer: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];



  constructor(
    public apiService: DeveloperAPIService,
    public layoutService: LayoutService,
    private apiServiceStaff: StaffApiService,
    public MarServiceAPI: MarNewsProductAPIService,
    private changeDetector: ChangeDetectorRef,
    public menuService: PS_HelperMenuService,

  ) {


    this.loadFormData()
  }

  ngOnInit() {

    let that = this
    // phân quyền  
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && that.justLoadedPer) {
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.getApi()
        that.justLoadedPer = false;
      }
    });

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
          this.getApi()
      }
    })
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetFolderWithFile.bind(this)


  }

  //dùng này để tránh lỗi ng0100
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  //=========================== FORM DATA ===========================
  loadFormData() {
    // this.form = new UntypedFormGroup({
    //   'Code': new UntypedFormControl({ value:this.dataCompanyForm.Code , disabled: false }),
    //   'VNName': new UntypedFormControl({value: this.dataCompanyForm.Quantity , disabled: false}, Validators.required),
    //   'CompanyID': new UntypedFormControl({value: this. dataCompanyForm.CompanyID  , disabled: false}),
    //   'Bieft': new UntypedFormControl({value: this. dataCompanyForm.Bieft, disabled: false}, Validators.required),
    //   'Address': new UntypedFormControl({ value: this. dataCompanyForm.Address, disabled: false }),
    //   'CountryName': new UntypedFormControl({ value: this. dataCompanyForm.CountryName, disabled: false }),
    //   'TypeCompanyName': new UntypedFormControl({value: this. dataCompanyForm.TypeCompanyName, disabled: false}),
    //   'URLLogo': new UntypedFormControl({ value: this. dataCompanyForm.URLLogo, disabled: false }, Validators.required),
    //   'Country': new UntypedFormControl({ value: this. dataCompanyForm.Country, disabled: false }),
    //   'Province': new UntypedFormControl({value: this. dataCompanyForm.Province, disabled: false}),
    //   'District': new UntypedFormControl({value: this. dataCompanyForm.District, disabled: false}),
    //   'Ward': new UntypedFormControl({value: this. dataCompanyForm.Ward, disabled: false}),
    //   'ConfigDesc': new UntypedFormControl({value: this. dataCompanyForm.ConfigDesc, disabled: false}),
    //   'IsSystem': new UntypedFormControl({value: this. dataCompanyForm.IsSystem, disabled: false}),
    // })



    // this.formData = new FormGroup({
    //   Code: new FormControl(0),
    //   VNName: new FormControl(''),
    //   CompanyID: new FormControl(''),
    //   Bieft: new FormControl(''),
    //   Address: new FormControl(''),
    //   CountryName: new FormControl(null),
    //   TypeCompanyName: new FormControl(null),
    //   URLLogo: new FormControl(''),
    //   Country: new FormControl(null),
    //   Province: new FormControl(null),
    //   District: new FormControl(null),
    //   Ward: new FormControl(null),
    //   ConfigDesc: new FormControl(''),
    //   IsSystem: new FormControl(false)
    // });
  }

  //=========================== SEARCH ===========================
  onSearch(keySearch) {
    this.keyword = keySearch
    this.APIGetListCompany(this.gridState)
  }
  onResetFilter() {
    this.keyword = ''
    this.APIGetListCompany(this.gridState)
  }

  // =========================== CAll ALL API ===========================
  getApi() {
    this.APIGetListCompany(this.gridState)
    this.APIGetNationality()
  }

  @ViewChild('search', { static: false }) searchComponent: any;
  reloadData() {
    this.searchComponent.value = '' //reset value trong input search
    this.keyword = ''
    this.APIGetListCompany(this.gridState)
  }

  //=========================== DRAWER ===========================
  onOpendDrawer(type: number, data: DTOCompany = new DTOCompany()) {
    if (type == 0 || type == 1) {
      this.onActionEdit_Cre(type, data)
      this.expandedRight = true
      this.isautoCollapse = false
    } else if (type == 3) {
      this.expandedRight = false
    }

  }


  //#region hàm xác định là drawer tạo hay drawer cập nhật
  onActionEdit_Cre(type: number, data: DTOCompany) {
    this.isAction = 0
    this.dataCompany = data
    this.dataCompanyForm = { ... this.dataCompany }
    if (type == 0) { //drawer tạo mới 
      this.dataCompanyForm = {
        Code: 0,
        VNName: '',
        CompanyID: null,
        Bieft: '',
        Address: null,
        CountryName: null,
        TypeCompanyName: null,
        URLLogo: '',
        Country: null,
        Province: null,
        District: null,
        Ward: null,
        ConfigDesc: '',
        IsSystem: false
      }

      this.isAction = 0
      this.notSelectedProvince = true;
      this.notSelectedDistrict = true;
      this.notSelectedWard = true;
    }
    else if (type == 1) { //drawer cập nhật

      if (Ps_UtilObjectService.hasValue(data)) {
        // this.formData.patchValue(data)
        this.dataCompany = data
        this.isAction = 1
      }
      // console.log(this.formData.value);

      // check nếu công ty đã có các trường thông tin này thì fill lên
      if (Ps_UtilObjectService.hasValue(this.listNationalityFilter)) {
        this.onFilterAddress(data.Country, 'Country')
      }
      if (Ps_UtilObjectService.hasValue(this.provinceListFilter)) {
        this.onFilterAddress(data.Province, 'Province')

      }
      if (Ps_UtilObjectService.hasValue(this.districtListFilter)) {
        this.onFilterAddress(data.District, 'District')

      }
      if (Ps_UtilObjectService.hasValue(this.wardListFilter)) {
        this.onFilterAddress(data.Ward, 'Ward')

      }
    }


  }
  //#endregion


  //#region  xử lý gọi api cho dropdown country, province, district
  onFilterAddress(code: number, field: string) {
    this.gridStateCPDW.filter.filters = []
    if (Ps_UtilObjectService.hasValue(code)) { // kiểm tra code có null không
      if (field == 'Country') {
        this.gridStateCPDW.filter.filters.push(({ field: 'Country', operator: 'eq', value: code }))
        this.APIGetListProvince(this.gridStateCPDW)
        this.notSelectedProvince = false;
        this.dataCompanyForm.Country = code

      }
      else if (field == 'Province') {
        this.gridStateCPDW.filter.filters.push(({ field: 'Province', operator: 'eq', value: code }))
        this.APIGetListDistrict(this.gridStateCPDW)
        this.notSelectedDistrict = false;
        this.dataCompanyForm.Province = code
      }
      else if (field == 'District') {
        this.gridStateCPDW.filter.filters.push(({ field: 'District', operator: 'eq', value: code }))
        this.APIGetListWard(this.gridStateCPDW)
        this.notSelectedWard = false;
        this.dataCompanyForm.District = code
      }
      else if (field == 'Ward') {
        this.dataCompanyForm.Ward = code
      }
    }
    else {  //trường hợp chọn dropdown value null
      if (code == null && field == 'Country') {
        this.notSelectedProvince = true;
        this.notSelectedDistrict = true;
        this.notSelectedWard = true;
        this.dataCompanyForm.Country = code
        this.dataCompanyForm.Province = code
        this.dataCompanyForm.District = code
        this.dataCompanyForm.Ward = code
      }
      else if (code == null && field == 'Province') {
        this.notSelectedDistrict = true;
        this.notSelectedWard = true;
        this.dataCompanyForm.Province = code
        this.dataCompanyForm.District = code
        this.dataCompanyForm.Ward = code
      }
      else if (code == null && field == 'District') {
        this.notSelectedWard = true;
        this.dataCompanyForm.District = code
        this.dataCompanyForm.Ward = code

      }

    }
  }
  //#endregion


  //#region Xử lý khi giá trị dropdown thay đổi country, province, district
  selectionDropdownChange(e: any, field: string): void {
    this.onFilterAddress(e, field)

    // dropdown thay đổi thì reset lại giá trị, trường hợp chọn giá trị khác
    if (field == 'Country') {
      this.notSelectedDistrict = true;
      this.notSelectedWard = true;
      this.ProvinceRef.reset()
      this.DistrictRef.reset()
      this.WardRef.reset()
    } else if (field == 'Province') {
      this.notSelectedWard = true;
      this.DistrictRef.reset()
      this.WardRef.reset()
    }
    else if (field == 'District') {
      this.WardRef.reset()
    }
  }
  //#endregion


  //#region check img
  isValidImg(str: string) {
    return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  }
  getRes(str: string) {
    return Ps_UtilObjectService.getImgRes(str)
  }
  //#endregion 

  //#region xử lý button Thêm/cập nhật form tới api 
  onUpdate_Add() {
    this.dataCompanyForm.VNName = this.dataCompanyForm.VNName.trim()
    this.dataCompanyForm.Bieft = this.dataCompanyForm.Bieft.trim()

    // lấy ra tên country
    let VNName: string = ''
    this.listNationalityFilter.filter(res => {
      if (this.dataCompanyForm.Country == res.Code) {
        VNName = res.VNName
      }
    })
    this.dataCompanyForm.CountryName = VNName

    // console.log(this.dataCompanyForm);
    if (this.dataCompanyForm.Code == 0 && this.checkCode(this.dataCompanyForm.CompanyID)) { //kiển tra mã bị trùng
      this.layoutService.onWarning(`Mã công ty đã tồn tại`)
    }
    else {
      if (
        Ps_UtilObjectService.hasValueString(this.dataCompanyForm.VNName) &&
        Ps_UtilObjectService.hasValueString(this.dataCompanyForm.Bieft) &&
        Ps_UtilObjectService.hasValueString(this.dataCompanyForm.URLLogo) &&
        Ps_UtilObjectService.hasValueString(this.dataCompanyForm.CompanyID)
      ) {

        // Sử dụng hàm extractPath để lấy chuỗi từ "/ProductImage/..." trở về sau
        // const extractedPath = this.extractPath(this.dataCompanyForm.URLLogo);
        // this.dataCompanyForm.URLLogo = extractedPath
        this.APIUpdateCompany(this.dataCompanyForm)
        this.expandedRight = this.flagSuccess === true;
        // console.log(this.dataCompanyForm);

      }
      else {
        const fieldsToCheck = [
          { name: 'VNName', message: 'nhập tên công ty ' },
          { name: 'Bieft', message: 'nhập tên viết tắt' },
          { name: 'URLLogo', message: 'chọn hình ảnh Logo' },
          { name: 'CompanyID', message: 'nhập mã công ty' },
        ];

        fieldsToCheck.forEach(field => {
          if (!Ps_UtilObjectService.hasValueString(this.dataCompanyForm[field.name])) {
            this.layoutService.onWarning(`Vui lòng ${field.message}`)
          }
        });
      }
    }
  }
  //#endregion 

  //hàm kiểm tra trùng mã công ty
  checkCode(dataCode: any) {
    let check = this.dataCompany_System.filter(res => dataCode == res.CompanyID)
    if (Ps_UtilObjectService.hasListValue(check)) {
      return true
    }
  }




  // xóa hình trong form
  onDelImg() {
    // this.dataCompany.URLLogo = null
    // this.formData.value.URLLogo = null
    this.dataCompanyForm.URLLogo = null
  }

  //hàm lấy ra chuỗi từ "/ProductImage/...""
  extractPath(url: string): string | null {
    const index = url.indexOf('/ProductImage/');
    if (index !== -1) {
      return url.substring(index);
    }
    return null;
  }
  //hàm chọn img
  pickFile(e: DTOCFFile, width, height) {

    this.dataCompanyForm.URLLogo = e?.PathFile.replace('~', '')
    // this.formData.value.URLLogo =  e?.PathFile.replace('~', '')
    // this.formData.value.URLLogo = this.dataCompany.URLLogo
    // this.formData.patchValue({
    //   URLLogo: this.dataCompany.URLLogo
    // });
    // console.log(this.formData.value.URLLogo);
    // console.log(this.dataCompany.URLLogo);

    this.layoutService.setFolderDialog(false)
  }

  //hàm mở folder
  onUploadImg() {
    this.layoutService.folderDialogOpened = true;
  }
  // lấy foler chứa ảnh 
  GetFolderWithFile(childPath) {
    if (this.layoutService.getFolderDialog()) {
      // console.log(childPath);
      return this.MarServiceAPI.GetFolderWithFile(childPath, 16);
    }

  }

  //#region search trong dropdown
  handleFilterNational(value) {
    this.listNationalityFilter = this.listNationality.filter(
      (s) => s.VNName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
  }
  handleFilterProvince(value) {
    this.provinceListFilter = this.provinceList.filter(
      (s) => s.VNProvince.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
  }
  handleFilterDistric(value) {
    this.districtListFilter = this.districtList.filter(
      (s) => s.VNDistrict.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  handleFilterWard(value) {
    this.wardListFilter = this.wardList.filter(
      (s) => s.VNWard.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  //#endregion  



  //#region =========================== DIALOG ===========================
  onCloseDialog(): void {
    this.opened = false;
  }

  onDeleteDialog(status: string): void {
    if (status == 'yes') {

      this.APIDeleteCompany(this.dataCompany);
      this.opened = false;
    } else {
      this.opened = false;
    }
  }
  //#endregion

  // =========================== DROPDOWN ===========================
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {  //hàm thêm option vào dropdown
    moreActionDropdown = []
    moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
    moreActionDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })
    return moreActionDropdown
  }

  onActionDropdownClick(menu: MenuDataItem, item: DTOCompany) {  // hàm act của item trong dropdown
    // console.log('item: ', item);
    this.dataCompany = item
    if (item.Code != 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.opened = true;
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.onOpendDrawer(1, item)
      }

    }
  }




  // =========================== API ===========================

  //#region API GET LIST
  APIGetListCompany(state: State) {

    this.loading = true;
    this.GetListCompany_sst = this.apiService.GetListCompany(state, this.keyword).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res) => {
        this.loading = false
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.dataCompany_System = res.ObjectReturn.Data
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công ty: ${res.ErrorString}`)
        }

      },
      (error) => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách công ty: ${error} `)
      }
    )


    this.arrUnsubscribe.push(this.GetListCompany_sst)
  }
  //#endregion

  //#region API DELETE
  APIDeleteCompany(dataDelete: DTOCompany) {
    const tx = dataDelete.IsSystem === true ? 'Hệ thống' : 'Công ty'
    this.DeleteCompany_sst = this.apiService.DeleteCompany(dataDelete).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res) => {
        this.loading = false;
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`Xóa ${tx} thành công`)
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${tx}: ${res.ErrorString}`)
        }

        this.APIGetListCompany(this.gridState)
      },
      (error) => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi xóa ${tx}: ${error}`)
        this.APIGetListCompany(this.gridState)
      }
    )
    this.arrUnsubscribe.push(this.DeleteCompany_sst);
  }
  //#endregion

  //#region API UPDATE
  APIUpdateCompany(dataUpdate: DTOCompany) {
    this.flagSuccess = false
    const tx = dataUpdate.IsSystem === true ? 'Hệ thống' : 'Công ty'
    const txAdd_Up = dataUpdate.Code === 0 ? 'Thêm mới' : 'Cập nhật'
    this.UpdateCompany_sst = this.apiService.UpdateCompany(dataUpdate).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${txAdd_Up} ${tx} thành công`)
          this.flagSuccess = true
        }
        else {
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${tx}: ${res.ErrorString}`)
          this.flagSuccess = false
        }
        this.APIGetListCompany(this.gridState)
      },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật ${tx}: ${error}`)
        this.APIGetListCompany(this.gridState)
        this.flagSuccess = false
      }
    )

    this.arrUnsubscribe.push(this.UpdateCompany_sst);
  }
  //#endregion

  //#region API GET NATIONALITY
  APIGetNationality() {
    this.GetNationality_sst = this.apiServiceStaff.GetListCountry().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listNationality = res.ObjectReturn.Data
        this.listNationalityFilter = res.ObjectReturn.Data
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quốc gia: ${err}`);
    });
    this.arrUnsubscribe.push(this.GetNationality_sst);
  }
  //#endregion

  //#region API GET PROVINCE
  APIGetListProvince(state: State) {
    this.GetListProvince_sst = this.apiServiceStaff.GetListProvince(state).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.provinceList = res.ObjectReturn.Data
        this.provinceListFilter = res.ObjectReturn.Data
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Tỉnh thành: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Tỉnh thành: ${err}`);
    });
    this.arrUnsubscribe.push(this.GetListProvince_sst);
  }
  //#endregion

  //#region API HET DISTRICT
  APIGetListDistrict(state: State) {
    this.GetListDistrict_sst = this.apiServiceStaff.GetListDistrict(state).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.districtList = res.ObjectReturn.Data
        this.districtListFilter = res.ObjectReturn.Data
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quận huyện: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Quận huyện: ${err}`);
    });
    this.arrUnsubscribe.push(this.GetListDistrict_sst);
  }
  //#endregion

  //#region API GET WARD
  APIGetListWard(state: State) {
    this.GetListWard_sst = this.apiServiceStaff.GetListWard(state).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.wardList = res.ObjectReturn.Data
        this.wardListFilter = res.ObjectReturn.Data
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Phường xã: ${res.ErrorString}`)
      }
    },
      (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy Danh sách Phường xã: ${error}`);
      }
    );
    this.arrUnsubscribe.push(this.GetListWard_sst);
  }
  //#endregion


  //  =========================== ngOnDestroy ===========================
  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
