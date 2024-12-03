import { Component } from '@angular/core';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { distinct } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';
import { DTOPartner } from '../../shared/dto/DTOPartner';
import { DTOReason } from '../../shared/dto/DTOReason.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PurService } from '../../shared/services/pur.service';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';

@Component({
  selector: 'app-pur005-supplier-detail',
  templateUrl: './pur005-supplier-detail.component.html',
  styleUrls: ['./pur005-supplier-detail.component.scss']
})
export class Pur005SupplierDetailComponent {

  // variable Permission
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  actionPerm: DTOActionPermission[] = [];
  isLock: boolean = false

  // variable Contain data Supplier
  dataSuppliers: DTOSupplier = new DTOSupplier();
  dataPartner: DTOPartner = new DTOPartner();
  // variable DropdownList Nation 
  //listNationality: DTOListCountry[] = [];
  selectedNationality: string = ''

  // variable DropdownList Province
  //listProvince: DTOLSProvince[] = [];
  selectedProvince: string = ''

  //variable DropdownList District
  //listDistrict: DTOLSDistrict[] = [];
  selectedDistrict: string = ''

  // variable DropdownList Ward
  //listWard: DTOLSWard[] = [];
  selectedWard: string = ''

  // variable DropdownList Reason
  listReason: DTOReason[] = []
  selectedReason: number = 0

  // variable DropdownList TructhuocCongty
  selectedParentName: string = ''
  // variable DropdownList Stastus
  listStatus: Array<{ Code: number; StatusName: string; isClose: boolean }> = [
    { Code: 0, StatusName: 'Đang hợp tác', isClose: false },
    { Code: 1, StatusName: 'Ngưng hợp tác', isClose: true }
  ]
  selectedStatus: boolean

  // filter country, province, district, ward
  // filterProvince: FilterDescriptor = {
  //   field: 'Country', operator: 'eq', value: 1
  // }

  // filterDistrict: FilterDescriptor = {
  //   field: 'Province', operator: 'eq', value: 1
  // }

  // filterWard: FilterDescriptor = {
  //   field: 'District', operator: 'eq', value: 1
  // }

  //Unsubcribe
  ngUnsubscribe = new Subject<void>();

  // variable NoticeError, Success
  noticeError: string = 'Đã xảy ra lỗi'
  noticeSuccess: string = 'Cập nhật thành công'

  constructor(
    public layoutService: LayoutService,
    private apiServiceSupplier: PurSupplierApiServiceService,
    public menuService: PS_HelperMenuService,
    public purchaseService: PurService,
    public purService: PurService,) { }

  ngOnInit() {
    // this.APIGetListReason()
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res)) {

        var that = this
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        //console.log(this.isAllPers);
        //console.log(this.isCanCreate);
        // this.isAllPers = true
        // this.isCanCreate = false
        // this.isCanApproved = false
        // this.getDataCache()
      }
    });
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListReason()
        this.getDataCache();    
      }
    })
  }

  //breadcrumb
  reloadData() {
    if (this.dataSuppliers.Code !== 0) {
      this.APIGetSupplier(this.dataSuppliers.Code)
    }
    else {
      this.getDataCache()
    }
  }

  //#region Get, Set Cache
  getDataCache() {
    let cache = JSON.parse(localStorage.getItem('supplierInfo'));
    if (Ps_UtilObjectService.hasValue(cache)) {
      if (!cache.hasOwnProperty('Partner')) {
        this.dataSuppliers.Partner = cache.Code
        this.dataSuppliers.ShortName = cache.ShortName
        this.dataSuppliers.VNName = cache.VNName
        this.dataSuppliers.ENName = cache.ENName
        this.dataSuppliers.JPName = cache.JPName
        this.dataSuppliers.ParentName = cache.ParentName
        this.selectedNationality = this.dataSuppliers.CountryName = cache.CountryName
        this.selectedProvince = this.dataSuppliers.ProvinceName = cache.ProvinceName
        this.selectedDistrict = this.dataSuppliers.DistrictName = cache.DistrictName
        this.selectedWard = this.dataSuppliers.WardName = cache.WardName
        this.dataSuppliers.Country = cache.Country
        this.dataSuppliers.Province = cache.Province
        this.dataSuppliers.District = cache.District
        this.dataSuppliers.Ward = cache.Ward
        this.dataSuppliers.Address = cache.Address
        this.dataSuppliers.Tel = cache.Tel
        this.dataSuppliers.Fax = cache.Fax
        this.dataSuppliers.Website = cache.Website
        this.dataSuppliers.InvNo = cache.InvNo
        this.dataSuppliers.InvName = cache.InvNo
        this.dataSuppliers.InvAddress = cache.InvAddress
        this.selectedParentName = this.dataSuppliers.ParentName = cache.ParentName
      }
      else {
        this.dataSuppliers = cache
        this.selectedStatus = this.dataSuppliers.IsClosed
        this.selectedReason = this.dataSuppliers.ReasonID
        this.selectedNationality = this.dataSuppliers.CountryName
        this.selectedProvince = this.dataSuppliers.ProvinceName
        this.selectedDistrict = this.dataSuppliers.DistrictName
        this.selectedWard = this.dataSuppliers.WardName
        this.selectedParentName = this.dataSuppliers.ParentName
      }
    }
    // else {
    //   window.history.back();
    // }
    // this.purchaseService.getSupplier().pipe(takeUntil(this.ngUnsubscribe)).subscribe(v => {
    //   this.dataSuppliers = v
    //   this.selectedStatus = this.dataSuppliers.IsClosed
    //   this.selectedReason = this.dataSuppliers.ReasonID
    //   this.selectedNationality = this.dataSuppliers.CountryName
    //   this.selectedProvince = this.dataSuppliers.ProvinceName
    //   this.selectedDistrict = this.dataSuppliers.DistrictName
    //   this.selectedWard = this.dataSuppliers.WardName

    // })
  }


  setDataCache(objData: DTOSupplier) {
    localStorage.setItem('supplierInfo', JSON.stringify(objData))
  }
  //#endregion

  // navigate page
  navigatePage() {
    var parent = ModuleDataAdmin.find(s => s.Code.includes('pur'));
    var detail = parent.ListMenu.find(x => x.Code.includes('pur-policy'));
    var detail1 = detail.LstChild.find(a => a.Code.includes('pur005-supplier-list'));
    this.menuService.activeMenu(detail1);
  }


  // Lấy Supplier Detail
  APIGetSupplier(CodeSupplier: number) {
    this.apiServiceSupplier.GetSupplier(CodeSupplier).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {

        this.dataSuppliers = res.ObjectReturn[0]

        this.selectedStatus = this.dataSuppliers.IsClosed
        this.selectedReason = this.dataSuppliers.ReasonID

        this.setDataCache(this.dataSuppliers)

      } else {
        this.layoutService.onError(`${this.noticeError} khi lấy thông tin chi tiết nhà cung cấp: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`${this.noticeError} khi lấy thông tin chi tiết nhà cung cấp: ${err}`)
    })
  }

  // Update thông tin supplier
  APIUpdateSupplier(data: any, field: string) {
    this.apiServiceSupplier.UpdateSupplier(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.dataSuppliers = res.ObjectReturn
        this.selectedStatus = this.dataSuppliers.IsClosed
        this.selectedReason = this.dataSuppliers.ReasonID
        this.layoutService.onSuccess(`${this.noticeSuccess} ${field} chi tiết nhà cung cấp`)

        this.setDataCache(this.dataSuppliers)
        this.purService.activeSupplier(this.dataSuppliers)
      } else {
        this.layoutService.onError(`${this.noticeError} khi cập nhật thông tin chi tiết nhà cung cấp: ${res.ErrorString}`)
        this.purService.activeSupplier(this.dataSuppliers)
      }
    }, (err) => {
      this.layoutService.onError(`${this.noticeError} khi cập nhật thông tin chi tiết nhà cung cấp: ${err}`)
      this.purService.activeSupplier(this.dataSuppliers)
    })
  }

  // Láy danh sách lý do
  APIGetListReason() {
    let type = 1
    this.apiServiceSupplier.GetListReason(type).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.listReason = res.ObjectReturn
      }
      else {
        this.layoutService.onError(`${this.noticeError} khi lấy danh sách lý do ngừng hợp tác: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`${this.noticeError} khi lấy danh sách lý do ngừng hợp tác: ${err}`)
    })
  }

  // Xóa thông tin nhà cung cấp
  APIDeleteSupplierDetail() {
    this.apiServiceSupplier.DeleteSupplier(this.dataSuppliers).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.layoutService.onSuccess(`Xóa nhà cung cấp thành công`)
        this.navigatePage()
      }
      else {
        this.layoutService.onError(`${this.noticeError} khi lấy xóa thông tin nhà cung cấp: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`${this.noticeError} khi xóa thông tin nhà cung cấp: ${err}`)
    })
  }
  //#region Lấy danh sách quốc gia, tỉnh thành, quận huyện, phường xã dropdownlist
  // APIGetNationality() {

  //   this.apiServiceStaff.GetListCountry().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
  //     if (res.StatusCode == 0) {
  //       this.listNationality = res.ObjectReturn.Data
  //     } else {
  //       this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Quốc gia: ${res.ErrorString}`)
  //     }

  //   }, (err) => {
  //     this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Quốc gia: ${err}`);

  //   });
  // }

  // APIGetProvince(stateProvince: any) {
  //   this.apiServiceStaff.GetListProvince(stateProvince).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
  //     if (res.StatusCode == 0) {
  //       this.listProvince = res.ObjectReturn.Data
  //     } else {
  //       this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Tỉnh thành: ${res.ErrorString}`)
  //     }

  //   }, (err) => {
  //     this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Tỉnh thành: ${err}`);

  //   });
  // }

  // APIGetDistrict(stateDistrict: any) {
  //   //console.log(stateDistrict)
  //   this.apiServiceStaff.GetListDistrict(stateDistrict).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
  //     if (res.StatusCode == 0) {
  //       this.listDistrict = res.ObjectReturn.Data
  //     } else {
  //       this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Quận/huyện: ${res.ErrorString}`)
  //     }

  //   }, (err) => {
  //     this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Quận/huyện: ${err}`);
  //   })
  // }

  // APIGetWard(stateWard: any) {
  //   this.apiServiceStaff.GetListWard(stateWard).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
  //     if (res.StatusCode == 0) {
  //       this.listWard = res.ObjectReturn.Data
  //     } else {
  //       this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Phường/Xã: ${res.ErrorString}`)
  //     }

  //   }, (err) => {
  //     this.layoutService.onError(`${this.noticeError} khi lấy Danh sách Phường/Xã: ${err}`);
  //   })
  // }
  //#endregion

  // Blur textbox
  onBlurTextBox(prop: string[], field: string) {
    const data = {
      DTO: this.dataSuppliers,
      Properties: prop
    }
    if (this.dataSuppliers.Code === 0) {
      prop.push(...['Partner'])
    }
    this.APIUpdateSupplier(data, field)
  }

  // Change value dropdown
  onChangeDropdown(prop: string[], e: any, field: string) {
    const data = {
      DTO: this.dataSuppliers,
      Properties: prop
    }

    if (this.dataSuppliers.Code === 0) {
      prop.push(...['Partner'])
    }
    if (prop.includes('IsClosed')) {
      if (e == true) {
        prop.push(...['ReasonID'])
        this.dataSuppliers.ReasonID = 1
      }
      this.dataSuppliers.StatusID = e
      this.dataSuppliers.IsClosed = this.dataSuppliers.StatusID == 0 ? false : true;
    }
    else {
      this.dataSuppliers[prop[0]] = e
    }
    this.APIUpdateSupplier(data, field)
  }

  //#region Dialog Confirm Delete
  openConfirmDeleteDialog: boolean = false
  toggleDialog() {
    this.openConfirmDeleteDialog = !this.openConfirmDeleteDialog
  }


  onDeleteDialog(type: string) {
    if (type == 'yes') {
      this.APIDeleteSupplierDetail()
      localStorage.removeItem('supplierInfo');
    }
  }
  //#endregion

  // hàm check quyền
  onCheckPermission() {
    const isCreatorAdmin = this.isCanCreate || this.isAllPers
    const isVerify = this.isCanApproved
    //console.log(this.isCanCreate)
    if (isCreatorAdmin) {
      this.isLock = false
    }
    else {
      this.isLock = true
    }
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
