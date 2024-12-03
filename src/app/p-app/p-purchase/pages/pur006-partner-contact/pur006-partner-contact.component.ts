import { Component, OnInit, ViewChild, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPartnerContact } from '../../shared/dto/DTOPartnerContact.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Subject, Subscription } from 'rxjs';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { takeUntil } from 'rxjs/operators';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';
import { State, distinct } from '@progress/kendo-data-query';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

import { PurService } from '../../shared/services/pur.service';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';


@Component({
  selector: 'app-pur006-partner-contact',
  templateUrl: './pur006-partner-contact.component.html',
  styleUrls: ['./pur006-partner-contact.component.scss']
})
export class Pur006PartnerContactComponent implements OnInit, AfterContentChecked {
  // list contact
  listContact: DTOPartnerContact[] = []
  isLoading: boolean = false
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function


  //search 
  @ViewChild('search') searchBox: SearchFilterGroupComponent
  Keyword: string = ''


  //dialog
  openeDialog: boolean = false
  delItem: DTOPartnerContact


  //form - drawer
  @ViewChild('Drawer') drawer: MatSidenav
  formPersonContact: UntypedFormGroup
  isLockAll: boolean = false

  //unsubcribe
  arrUnsubscribe: Subscription[] = []
  Unsubscribe = new Subject<void>()


  //permission 
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoaded: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];

  Supplier: DTOSupplier = new DTOSupplier();


  //lọc danh sách theo COPartner
  loadState: State = {
    filter: {
      filters: [], logic: 'or'
    },
    sort: [],
  };


  constructor(public LayoutService: LayoutService,
    private apiService: PurSupplierApiServiceService,
    private menuService: PS_HelperMenuService,
    private changeDetector: ChangeDetectorRef,
    public purService: PurService,


  ) { }


  ngOnInit() {

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)


    // phân quyền  
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        var that = this
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.isAllPers = true
        // this.isCanCreate = false
        // this.isCanApproved = false
      }
    });


    // this.GetCache()
    this.loadForm()

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetCache();
      }
    })
    // this.getApi()
  }


  //lấy thông tin từ cache
  GetCache() {
    this.purService.getSupplier().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Supplier = res

        //filter
        if (!Ps_UtilObjectService.hasListValue(this.loadState.filter.filters) && this.Supplier.Code !== 0) {
          this.loadState.filter.filters.push(
            { field: 'COPartner', value: this.Supplier.Code, operator: 'eq', ignoreCase: true }
          )
          this.getApi()
        }
      }
    })
  }

  //dùng này để tránh lỗi ng0100
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }


  //#region ================= LOAD DATA
  getApi() {
    this.APIGetListSupplierContact(this.loadState, '')
  }

  // gọi lại API mới
  reloadData() {
    this.Keyword = ''
    this.searchBox.value = ''
    this.APIGetListSupplierContact(this.loadState, this.Keyword)
  }
  //#endregion

  //#region ================= SEARCH
  onSearch(search: string) { //nhấn tìm kiếm thì hàm này chạy
    this.Keyword = search
    this.APIGetListSupplierContact(this.loadState, this.Keyword)
  }

  onReset() { // nhấn reset thì hàm này chạy
    this.Keyword = ''
    this.APIGetListSupplierContact(this.loadState, this.Keyword)
  }
  //#endregion

  //#region ================= DRDP DOWN ACTION
  // hàm hiển thị option trong dropdown
  getActionDropdown(ActsDropdown: MenuDataItem[]) {
    ActsDropdown = []
    // quyền tạo
    if (this.isCanCreate == true || this.isAllPers == true) {
      ActsDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
      ActsDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })
      this.isLockAll = false
    }

    // quyền duyệt
    if (this.isCanApproved == true) {
      ActsDropdown.push({ Name: "Xem", Code: "eye", Link: "view", Actived: true })
      this.isLockAll = true
    }
    return ActsDropdown
  }

  // hàm thực hiện option trong dropdown
  onActionDropdownClick(menu: MenuDataItem, item: DTOPartnerContact) {
    this.delItem = item
    if (item.Code != 0) {
      if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.openeDialog = true;
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil') {
        this.onOpenDrawer(1, item)
      }
      else if (menu.Link == 'view' || menu.Code == 'eye') {
        this.onOpenDrawer(1, item)
      }
    }
  }

  //#endregion

  showDel: any
  //#region ================= DRAWER
  onOpenDrawer(type: number, dataItem?: DTOPartnerContact) { //hàm mở drawer
    this.showDel = type
    this.loadForm()
    if (type > 0) { //cập nhật 
      this.formPersonContact.patchValue(dataItem)
    }

    this.formPersonContact.markAsTouched()
    this.drawer.open()
  }


  // hàm submit
  onSubmitForm() {
    this.formPersonContact.markAsUntouched()
    if (this.formPersonContact.valid) {
      // check email
      if ((Ps_UtilObjectService.hasValueString(this.formPersonContact.value.Email1) && Ps_UtilObjectService.isValidEmail(this.formPersonContact.value.Email1) == false)
        && (Ps_UtilObjectService.hasValueString(this.formPersonContact.value.Email2) && Ps_UtilObjectService.isValidEmail(this.formPersonContact.value.Email2) == false)
      ) {
        this.LayoutService.onWarning('Cả hai Email không hợp lệ')
      }
      else {
        if (Ps_UtilObjectService.hasValueString(this.formPersonContact.value.Email1) && Ps_UtilObjectService.isValidEmail(this.formPersonContact.value.Email1) == false) {
          this.LayoutService.onWarning('Email 1 không hợp lệ')
        }
        else if (Ps_UtilObjectService.hasValueString(this.formPersonContact.value.Email2) && Ps_UtilObjectService.isValidEmail(this.formPersonContact.value.Email2) == false) {
          this.LayoutService.onWarning('Email 2 không hợp lệ')
        }
        else {
          this.APIUpdateSupplierContact(this.formPersonContact.value)
        }
      }
    }
    else {
      const invalidFields = this.getInvalidFields(this.formPersonContact.controls);
      const fieldTranslations = {
        'ContactName': 'họ và tên người liên hệ',
      };

      invalidFields.forEach((field) => {
        const translatedField = fieldTranslations[field] || field;
        this.LayoutService.onWarning(`Vui lòng điền vào ${translatedField}`);
      });
    }
  }


  // hàm kiểm tra thiếu trường bắt buộc trong form
  getInvalidFields(controls: any): string[] {
    return Object.keys(controls).reduce((invalidFields, key) => {
      if (controls[key].status === "INVALID") {
        invalidFields.push(key);
      }
      return invalidFields;
    }, []);
  }


  // hàm đóng drawer và reset form
  onCloseDrawer() {
    this.formPersonContact.reset()
    this.drawer.close()
  }


  onKeydownEnter(e: KeyboardEvent) { //hàm chặn sự kiện enter
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  //#endregion


  //#region ================= FORM
  loadForm() {
    this.formPersonContact = new UntypedFormGroup({
      'Code': new UntypedFormControl(0, Validators.required),
      'Company': new UntypedFormControl(1, Validators.required),
      'COPartner': new UntypedFormControl(this.Supplier.Code, Validators.required),
      'IsOversea': new UntypedFormControl(false, Validators.required),
      'ContactName': new UntypedFormControl("", Validators.required),
      'PositionName': new UntypedFormControl(""),
      'Department': new UntypedFormControl(""),
      'Tel1': new UntypedFormControl(""),
      'Tel2': new UntypedFormControl(""),
      'Ext1': new UntypedFormControl(""),
      'Ext2': new UntypedFormControl(""),
      'Cellphone1': new UntypedFormControl(""),
      'Cellphone2': new UntypedFormControl(""),
      'Email1': new UntypedFormControl(""),
      'Email2': new UntypedFormControl(""),
      'StatusName': new UntypedFormControl(""),
    })
  }
  //#endregion


  //#region ================= DIALOG CONFIRM DELETE
  onToggleDialog() { //hàm mở dialog
    this.openeDialog = !this.openeDialog
  }

  onDeleteDialog(type: string) { //hàm xác nhận xóa
    if (type == 'yes') {
      this.APIDeleteSupplierContact(this.delItem)
    }
    this.openeDialog = false
  }
  //#endregion


  //#region ================= API
  // Get list
  APIGetListSupplierContact(Filter: State, Keyword: string) {
    this.isLoading = true;
    const ctx = 'danh sách người liên hệ'
    this.apiService.GetListSupplierContact(Filter, Keyword).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.listContact = res.ObjectReturn.Data
        }
        else {
          this.LayoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)
        }

      },
      (error) => {
        this.isLoading = false
        this.LayoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${error} `)
      }
    )
  }

  // Update contact
  APIUpdateSupplierContact(dataUpdate: DTOPartnerContact) {
    const ctx = 'người liên hệ'
    this.isLoading = true;
    const txAdd_Up = dataUpdate.Code === 0 ? 'Thêm mới' : 'Cập nhật'
    this.apiService.UpdateSupplierContact(dataUpdate).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;

        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.LayoutService.onSuccess(`${txAdd_Up} ${ctx} thành công`)
          this.drawer.close()
        }
        else {
          this.LayoutService.onError(`Đã xảy ra lỗi khi ${txAdd_Up} ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListSupplierContact(this.loadState, '')
      },
      (error) => {
        this.LayoutService.onError(`Đã xảy ra lỗi khi ${txAdd_Up} ${ctx}: ${error}`)
        this.isLoading = true;
        this.APIGetListSupplierContact(this.loadState, '')
      }
    )
  }

  //Delete contact
  APIDeleteSupplierContact(dataDelete: DTOPartnerContact) {
    const ctx = 'người liên hệ'
    this.isLoading = true;
    this.apiService.DeleteSupplierContact(dataDelete).pipe(takeUntil(this.Unsubscribe)).subscribe(
      (res) => {
        this.isLoading = false;
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.LayoutService.onSuccess(`Xóa ${ctx} thành công`)
          this.drawer.close()
        }
        else {
          this.LayoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${res.ErrorString}`)
        }
        this.APIGetListSupplierContact(this.loadState, '')
      },
      (error) => {
        this.LayoutService.onError(`Đã xảy ra lỗi khi xóa ${ctx}: ${error}`)
        this.isLoading = false;
        this.APIGetListSupplierContact(this.loadState, '')
      }
    )
  }
  //#endregion


  //destroy
  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}



