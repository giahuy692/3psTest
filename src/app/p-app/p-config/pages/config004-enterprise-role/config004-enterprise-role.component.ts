import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { DTORole } from '../../shared/dto/DTOConfEnterpriseRole.dto';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { FormControl, FormGroup } from '@angular/forms';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigEnterpriceApiService } from '../../shared/services/config-enterprice-api.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { DeveloperAPIService } from 'src/app/p-app/p-developer/shared/services/developer-api.service';
import { DTOCompany } from 'src/app/p-app/p-developer/shared/dto/DTOCompany';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';

@Component({
  selector: 'app-config004-enterprise-role',
  templateUrl: './config004-enterprise-role.component.html',
  styleUrls: ['./config004-enterprise-role.component.scss']
})
export class Config004EnterpriseRoleComponent implements OnInit , OnDestroy{

  @ViewChild('drawerRight') public DrawerRightComponent: DrawerComponent;

  // region Boolean
  isAdd: boolean = false
  loading: boolean = false
  expandedRight: boolean = false
  isautoCollapse: boolean = false
  opened: boolean = false
  isSeen: boolean = false
  isOnlySeen: boolean = false

  // endregion

  // region grid
  ListRole: DTORole[] = []
  Role = new DTORole
  gridView = new Subject<any>();
  pageSize = 25
  pageSizes = [this.pageSize]
  allowActionDropdown = []
  skip = 0;
  total = 0
  gridState: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  filterDropdown: CompositeFilterDescriptor = {
    logic: "or",
    filters: []
  }
    filterCompany: FilterDescriptor = {
    field: "Company", operator: "eq", value: 1
  }
  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };
  // endregion

  //region CallBack
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  onPageChangeCallback: Function
  //endregion

  // region Subscription
  Unsubscribe = new Subject<void>();
  // endregion

  // region permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  // endregion

  //region Company
  ListCompany: DTOCompany[] = []
  gridStateCompany: State = {
    take: this.pageSize,
    filter: { filters: [], logic: 'and' },
  }
  currentCompany: {Bieft: string , Code: number}
  selectedCompany = new DTOCompany()
  // endregion

  // 
  keyword: string =""
  // 

  // region FormGroup
  formData: FormGroup;
  formDataDefault = {
    Code: 0,
    Company: null,
    RoleName: "",
    RoleID: "",
    IsSupperAdmin: false,
    TypeData: 1,
    OrderBy: 1,
    Remark:"",
    ListPositionApply: [],
  }
  tempSearch: any;
  // endregion

  constructor(
    public menuService: PS_HelperMenuService,
    public layoutService: LayoutService,
    public apiService: ConfigEnterpriceApiService,
    public apiDevService: DeveloperAPIService
  ){
    this.formData = new FormGroup({
      Code: new FormControl(0),
      Company: new FormControl(null),
      RoleName: new FormControl(""),
      RoleID: new FormControl(""),
      IsSupperAdmin: new FormControl(false),
      TypeData: new FormControl(0),
      OrderBy: new FormControl(0),
      Remark: new FormControl(""),
      ListPositionApply: new FormControl([]),
    })
  }


  ngOnInit(): void {

    let that = this

    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        // this.APIGetListCompany(this.gridStateCompany, '')
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListCompany(this.gridStateCompany, '')
      }
    })

    this.onPageChangeCallback = this.onPageChange.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
  }

  // region GetData
    onGetData(){
      this.onLoadFilter()
      this.APIGetListRoles()
    }
  // endregion GetData

  // region API

    // lấy danh sách công ty
    // Các trường bắt buộc gridState và keyword
    APIGetListCompany(gridState: State, keyword: string = ''){
      this.loading = true;
      this.apiDevService.GetListCompany(gridState, keyword).pipe(takeUntil(this.Unsubscribe)).subscribe(
        (res) => {
          this.loading = false
          if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.ListCompany = res.ObjectReturn.Data
            this.selectedCompany = this.ListCompany.find(Company => Company.Code === 1)
            this.currentCompany = {
              Bieft: this.selectedCompany.Bieft,
              Code: this.selectedCompany.Code
            }
            this.onGetData()
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
    }

    // lấy danh sách vai trò
    APIGetListRoles(){
      this.apiService.GetListRoles(this.gridState, this.keyword).pipe(takeUntil(this.Unsubscribe)).subscribe(res =>{
        if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.ListRole = res.ObjectReturn.Data;
          this.total = res.ObjectReturn.Total;
          this.gridView.next({data: this.ListRole, total: this.total})
        } else {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò: ${res.ErrorString}`)
        }
      },
      (error) => {
        this.loading = false
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò: ${error} `)
      })
    }

    // Cập nhập thông tin vai trò
    APIUpdateRoles(Item: DTORole, isAdd: boolean){
      this.loading = true
      var ctx = isAdd == true ? 'Thêm mới' : 'Cập nhập'

      this.apiService.UpdateRoles(Item).pipe(takeUntil(this.Unsubscribe)).subscribe(res =>{
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.onGetData()
        } else{
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
          this.onGetData()
        }
        this.loading = false;
        this.onCloseDrawer()
      },(err) =>{
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
        this.onGetData()
      }
      )
    }

    // Xóa vai trò
    APIDeleteRoles(Item: DTORole){
      this.loading = true
      var ctx = "Xóa cai trò"

      this.apiService.DeleteRoles(Item).pipe(takeUntil(this.Unsubscribe)).subscribe(res =>{
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.onGetData()
        } else{
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
          this.onGetData()
        }
        this.loading = false;
      },(err) =>{
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
        this.onGetData()
      }
      )
    }
    
  // endregion APi

  // region DRAWER
    // đóng drawer
    onCloseDrawer(){
      this.formData.setValue(this.formDataDefault);
      this.DrawerRightComponent.toggle()
    }
    // cập nhập form
    onSubmitForm(){
      const UpdateRole = this.formData.value
      if(!Ps_UtilObjectService.hasValue(UpdateRole.Company)){
        this.layoutService.onWarning(`Vui lòng chọn công ty`)
      } else if(!Ps_UtilObjectService.hasValueString(UpdateRole.RoleName)){
        this.layoutService.onWarning(`Vui lòng nhập vai trò người dùng`)
      } else if(!Ps_UtilObjectService.hasValueString(UpdateRole.RoleID)){
        this.layoutService.onWarning(`Vui lòng nhập mã vai trò`)
      } else if(!Ps_UtilObjectService.hasValue(UpdateRole.TypeData)){
        this.layoutService.onWarning(`Vui lòng nhập loại vai trò`)
      } else if(!Ps_UtilObjectService.hasValue(UpdateRole.OrderBy)){
        this.layoutService.onWarning(`Vui lòng nhập thứ tự hiển thị`)
      } else {
        this.APIUpdateRoles(UpdateRole,this.isAdd)
      }
    }
    // đóng mở dialog
    onToggleDialog(){
      this.opened = true
    }
  // endregion DRAWER

  // region CONTENT

    // region hearder-1
    onLoadPage(){
      this.onResetFilter()
    }

    onOpenDrawer(isAdd: boolean){
      // tạo mới
      this.isAdd = isAdd
      if(isAdd){
        this.isSeen = false
        // gán lại giá trị mặc định
        this.formData.setValue(this.formDataDefault);
        this.Role = this.formData.value
        if(this.selectedCompany.Code == 0){
          this.selectedCompany.Code = this.Role.Company
        }

      } 
      else {
        this.isSeen = true
      }
      this.DrawerRightComponent.toggle()
    }
    //endregion hearder-1

    // region hearder-2
    handleSearch(event: any){
      if (event.filters && event.filters.length > 0){
        if (event.filters[0].value === '') {
          this.gridState.skip = 0
          this.onGetData()
        }
        else if (Ps_UtilObjectService.hasValueString(event)) {
          this.filterSearchBox.filters = event.filters;
          this.tempSearch = event.filters;
          this.gridState.skip = 0
          this.onGetData()
        }
      }
    }

    onResetFilter(){
      this.gridState.skip = 0
      this.keyword = ""
      this.filterCompany.value = 1
      this.currentCompany = {
        Bieft: this.selectedCompany.Bieft,
        Code: this.currentCompany.Code
      }
      this.onGetData()
    }

    onDropdownlistClick(event: DTOCompany){
      this.filterCompany.value = event.Code
      this.gridState.skip = 0
      this.onGetData()  
    }
    //endregion hearder-2

    // region gird

    onLoadFilter(){
      this.pageSizes = [...this.layoutService.pageSizes]
      this.gridState.take = this.pageSize
      this.gridState.filter.filters = []

      this.filterDropdown.filters = []

      if(this.filterCompany.value != null){
        this.filterDropdown.filters.push(this.filterCompany)
      }

      if (this.filterDropdown.filters.length > 0) {
        this.gridState.filter.filters.push(this.filterDropdown)
      }

      if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
        if (this.tempSearch[0].value != '') {
          this.gridState.filter.filters.push(this.filterSearchBox);
        }
      }

    }

    onPageChange(event: PageChangeEvent){
      this.gridState.skip = event.skip;
      this.gridState.take = this.pageSize = event.take
      this.APIGetListRoles()
    }

    getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
      moreActionDropdown = []

      if(this.isToanQuyen || this.isAllowedToCreate){
        moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Link: "edit", Actived: true })
  
        if(!Ps_UtilObjectService.hasListValue(dataItem.ListPositionApply)){
          moreActionDropdown.push({ Name: "Xóa", Code: "trash", Link: "delete", Actived: true })
        }
      } else {
        moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Link: "detail", Actived: true })
      }
      return moreActionDropdown
    }

    onActionDropdownClick(menu: MenuDataItem, item: any){
      this.Role = item
      if(menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail'){
        // gán giá trị vào form
        this.formData.patchValue(this.Role)
        // gán giá trị dropdown trên form
        this.selectedCompany = this.ListCompany.find(company => company.Code === this.Role.Company);
        if(menu.Code == "eye" || menu.Link == 'detail'){
          this.isOnlySeen = true
        }
        // mở drawer
        this.onOpenDrawer(false)
      }

      if(menu.Link == 'delete' || menu.Code == 'trash'){
        this.onToggleDialog()
      }
    }
    // endregion gird

  // endregion CONTENT

  // dialog
    onDeleteDialog(status: string){
      if (status == 'yes') {
        this.APIDeleteRoles(this.Role)
        this.opened = false;
      } else {
        this.opened = false;
      }
    }

    onCloseDialog(){
      this.opened = false;
    }
  // 



  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }

}
