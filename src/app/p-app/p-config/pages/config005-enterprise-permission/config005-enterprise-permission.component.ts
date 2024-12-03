import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CompositeFilterDescriptor, filterBy, FilterDescriptor, State } from '@progress/kendo-data-query';
import { from, Observable, of, Subject } from 'rxjs';
import { delay, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DTOAction } from 'src/app/p-app/p-developer/shared/dto/DTOAction';
import { DTOCompany } from 'src/app/p-app/p-developer/shared/dto/DTOCompany';
import { DTOFunction } from 'src/app/p-app/p-developer/shared/dto/DTOFunction';
import { DTOModule } from 'src/app/p-app/p-developer/shared/dto/DTOModule';
import { DeveloperAPIService } from 'src/app/p-app/p-developer/shared/services/developer-api.service';
import { DTODepartment } from 'src/app/p-app/p-hri/shared/dto/DTODepartment.dto';
import { OrganizationAPIService } from 'src/app/p-app/p-hri/shared/services/organization-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTORole } from '../../shared/dto/DTOConfEnterpriseRole.dto';
import { ConfigEnterpriceApiService } from '../../shared/services/config-enterprice-api.service';
import { DropDownFilterSettings, MultiSelectComponent, MultiSelectTreeComponent } from '@progress/kendo-angular-dropdowns';
import { DTOPermission } from '../../shared/dto/DTOPermission';
import { DTODataPermission } from '../../shared/dto/DTODataPermission';
import { DTOSubFunction } from 'src/app/p-app/p-developer/shared/dto/DTOSubFunction';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-config005-enterprise-permission',
  templateUrl: './config005-enterprise-permission.component.html',
  styleUrls: ['./config005-enterprise-permission.component.scss']
})

export class Config005EnterprisePermissionComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild("multiselectRole") public multiselect: MultiSelectComponent;
  //#region company
  ListCompany: DTOCompany[] = [];
  //#endregion

  //#region module (phân hệ)
  listModuleTree: DTOModule[] = [];
  defaultParent: any = { Code: null, Vietnamese: 'Tất cả' };
  //#endregion

  //#region department (bộ phận)
  //#endregion

  //#region biến trạng thái
  loading: boolean = false;
  //#endregion

  //#region unsubscribe
  ngUnsubscribe$ = new Subject<void>();
  //#endregion


  constructor(public apiDevService: DeveloperAPIService, public layoutService: LayoutService,
      public apiConfigService: ConfigEnterpriceApiService,public organizationAPIService: OrganizationAPIService,
      private cdr: ChangeDetectorRef, public menuService: PS_HelperMenuService,){
        this.dataRole = this.ListRole.slice();
      }

  ngOnInit(): void {
    // this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
    //   if (Ps_UtilObjectService.hasListValue(res)) {
    //     this.handleLoadData();
    //   }
    // })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.handleLoadData();
      }
    })
  }

  ngAfterViewInit(): void {
    const contains = (value) => (s) => {
      Ps_UtilObjectService.hasValueString(s.text) ? s.text.toLowerCase().indexOf(value.toLowerCase()) !== -1 : null;
    }

    this.multiselect.filterChange
      .asObservable()
      .pipe(
        switchMap((value) =>
          from([this.ListRole]).pipe(
            tap(() => (this.multiselect.loading = true)),
            delay(1000),
            map((data) => data.filter(contains(value)))
          )
        )
      )
      .subscribe((x) => {
        this.dataRole = x;
        this.multiselect.loading = false;
      });

      this.cdr.detectChanges();
  }

  //#region hàm chung
  
  handleLoadData(){
 
    this.APIGetListCompany();
    this.APIGetListModuleTree();
  }
  
  filterValue: State = { filter: { filters: [], logic: 'and' } }
  filterRoleByDepartment: State = { filter: { filters: [], logic: 'and' } }
  filterCompany: CompositeFilterDescriptor = { logic: 'or', filters: []};

  handleLoadFilterTree() {
    this.filterRoleByDepartment.filter = {
      logic: 'and',
      filters: []
    };
  
    if (Ps_UtilObjectService.hasValue(this.curCompany)) {
      this.filterRoleByDepartment.filter.filters.push({
        field: 'Company',
        operator: 'eq',
        value: this.curCompany.Code,
        ignoreCase: true
      });
    }
  
    if (Ps_UtilObjectService.hasListValue(this.ListRoleByDepartment)) {
      // Tạo filter để lấy danh sách những vai trò khác với vai trò đang hiển thị trên treelist
      const filterGroup: CompositeFilterDescriptor = {
        logic: 'or',
        filters: []
      };
  
      for (const role of this.ListRoleByDepartment) {
        const filter: FilterDescriptor = {
          field: 'Code',
          operator: 'neq',
          ignoreCase: true,
          value: role.Code
        };
        filterGroup.filters.push(filter);
      }
  
      this.filterRoleByDepartment.filter.filters.push(filterGroup);
    }
  }
  

  filterFunction = (item: DTOModule | DTOFunction | DTOAction): boolean => {
    if (!this.filterValue.filter || this.filterValue.filter.filters.length === 0) {
      return true;
    }

    if(Ps_UtilObjectService.hasValue(item)){
      const matchesFilterValue = filterBy([item], this.filterValue.filter).length > 0;
      if (matchesFilterValue) {
          return true;
      }
    }
    // Kiểm tra nếu còn item thì đệ quy để filter tiếp
    if (item && ('ListGroup' in item || 'ListFunctions' in item || 'ListAction' in item)) {
        const children = this.fetchChildren(item);
         return children.length > 0 && children.some(child => this.filterFunction(child));
    }
    return false;
  };

  filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: "contains",
  };

  // Hàm kiểm trả data có kiểu dữ liệu là gì Module, Function, Action
  onCheckUniqueFieldsType(dto: DTOModule | DTOFunction | DTOAction): string | null {
    // Trường chỉ có trong DTOModule
    const uniqueFieldInModule = "GroupID";
    // Trường chỉ có trong DTOFunction
    const uniqueFieldInFunction = "DLLPackage";
    // Trường chỉ có trong DTOAction
    const uniqueFieldsInAction = ["ActionName", "ModuleName", "FunctionName", "ParentID", "FunctionID"];

    // Kiểm tra và trả về loại DTO cụ thể
    if (dto.hasOwnProperty(uniqueFieldInModule)) {
        return 'module';
    } else if (dto.hasOwnProperty(uniqueFieldInFunction)) {
        return 'function';
    } else if (uniqueFieldsInAction.every(field => dto.hasOwnProperty(field))) {
        return 'action';
    }

    // Trường hợp không khớp với bất kỳ loại nào
    return null;
  }
  //#endregion

  //#region header-1
  loadDateBreadcrumb(){
    this.APIGetListSysStructurePermissionTree(this.curCompany.Code);
  }
  //#endregion

  //#region dropdownlist
  curCompany: DTOCompany = new DTOCompany();
  @ViewChild('DepartmentMultiselect') DepartmentMultiselectRef: MultiSelectTreeComponent

  handleSelectedCurrentCompany(company: DTOCompany){
    this.curCompany = company;
    this.DepartmentMultiselectRef.reset();
    this.columns = [];
    this.curDepartment = [];
    this.curRole = [];
    this.APIGetListDepartment()
    this.APIGetListSysStructurePermissionTree(this.curCompany.Code)
    this.handleLoadFilterTree()
    this.APIGetListRoles(this.filterRoleByDepartment)
  }
  //#endregion

  //#region dropdownlistTree

  // không khởi tạo để kiểm tra nếu biến không có giá trị thì thực hiện 1
  curModule: DTOModule = null;
  compositeModule: FilterDescriptor[] = [];

  handleSelectedCurrentModule(module: DTOModule){
    this.curModule = module;
    if(!this.curModule.Vietnamese.includes("Tất cả")){
      this.compositeModule = [
        { field: 'Code', value: this.curModule.Code, operator: 'eq', ignoreCase: false },
        { field: 'Vietnamese', value: this.curModule.Vietnamese, operator: 'contains', ignoreCase: false }
      ] // Set filter
    } else {
      this.compositeModule = [] // Set filter
    }
    this.filterValue.filter.filters = this.compositeModule;
    const allData = this.fetchChildren();
    
    if(Ps_UtilObjectService.hasValue(this.curModule) && this.curModule.Code > 0){
      const itemModule = this.searchTree(this.rootlistSysStructurePermissionTree,this.curModule.Code)
      this.listSysStructurePermissionTree = [itemModule].filter(this.filterFunction).sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));
      // console.log(itemModule)
    }
    else{
       this.listSysStructurePermissionTree = allData.filter(this.filterFunction).sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));
    }
  }

  // Hàm dùng để tìm function và action của module đang được chọn trong phân hệ.
  // Thay đổi logic của hàm này cần phải kiểm tra xem chọn phân hệ danh sách còn hiển thị đúng data của module được chọn không.
  searchTree(dataList, targetCode) {
    // console.log(dataList)
		for (const item of dataList) {
			if (item.Code === targetCode) {
				return item;
			}

			if (item.ListGroup && item.ListGroup.length > 0 ) {
				const foundItem = this.searchTree(item.ListGroup, targetCode);
				if (foundItem) {
					return foundItem;
				}
			}

      if (item.ListFunctions && item.ListFunctions.length > 0 ) {
				const foundItem = this.searchTree(item.ListFunctions, targetCode);
				if (foundItem) {
					return foundItem;
				}
			}
		}

		return null; // Trả về null nếu không tìm thấy
	}
  
  //#endregion

  //#region MutilSelectTree
  curRoleByDepartment: null;
  curDepartment: DTODepartment[] = [];
  ListDepartment: DTODepartment[] = [];
  ListRoleByDepartment: DTORole[] = []
  compositeDepartment: FilterDescriptor;
  compositeRoleByDepartment: FilterDescriptor;

  /**
   * Hàm xử lý chọn deparment
   * @param item danh sách những department được chọn
   */
  handleValueChangeDepartment(item:DTODepartment[]){
    // Xóa những vai trò được thêm khi chọn department trước đó
    this.columns = this.columns.filter(column => column.Dropdown !== 'rolebydepartment')
    this.columns.sort((a, b) => a.RoleName.localeCompare(b.RoleName));;
    // Điều kiện để gọi APIGetListRoleByDepartment là param department không có ListDepartment
    // for (let i of listSelectedDepartment) {
    //   // Xóa ListDepartment của các department được chọn trong multiselect
    //   i.ListDepartment = []
    // }
    this.curDepartment = item.slice();
    this.APIGetListRoleByDepartment(this.curDepartment)
  }

  fetchChildrenDepartment(node: DTODepartment): Observable<DTODepartment[]> {
    // returns the items collection of the parent node as children
    return of(node.ListDepartment);
  }

  hasChildrenDepartment(node: DTODepartment): boolean {
    // checks if the parent node has children
    return node.ListDepartment && node.ListDepartment.length > 0;
  }

  parsedDataDepartment: DTODepartment[] = this.ListDepartment.slice();

  /**
   * Hàm tìm kiếm deparment
   * @param value keyword tìm kiếm 
   */
  handleFilterDepartment(value: string): void {
    this.parsedDataDepartment = this.handleSearchDepartment(this.ListDepartment.slice(), value);
  }

  /**
   * 
   * @param items danh sách department
   * @param term keyword
   * @returns danh sách department theo keyword
   */
  handleSearchDepartment(items: DTODepartment[], term: string): any[] {
    return items.reduce((acc, item) => {
      if (this.contains(item.Department, term)) {
        acc.push(item);
      } else if (item.ListDepartment && item.ListDepartment.length > 0) {
        const newItems = this.handleSearchDepartment(item.ListDepartment, term);
        if (Ps_UtilObjectService.hasValue(newItems)) {
          acc.push({ Department: item.Department, ListDepartment: [...newItems] });
        }
      }

      return acc;
    }, []);
  }


  //#endregion

  //#region Treelist
  // columns: DTOModule[]
  columns: any[] = [] // Chứa các cột
  row: any[] = [] // Chứa các hàng
  listSysStructurePermissionTree: DTOModule[] = []
  rootlistSysStructurePermissionTree: DTOModule[] = []

  /**
   * Hàm tạo cột
   * @param columnWidth Cung cấp chiều cao của các cột
   */
  generateData(
    columnWidth: number
  ): any {
    this.columns = [];
    for (let role of this.ListRoleByDepartment) {
      this.columns .push({Code: role.Code, RoleID : role.RoleID, RoleName : role.RoleName, width: columnWidth, Dropdown: 'rolebydepartment' });
    }
    this.columns[0].expandable = true;
    this.columns.sort((a, b) => a.RoleName.localeCompare(b.RoleName)); // sort cột theo A đến Z
  }


  fetchChildren = (parent?: any): any[] => {
    if (parent && (parent.ListGroup || parent.ListFunctions || parent.ListAction)) {
        let children: Array<DTOModule | DTOFunction | DTOAction> = [];

        if (Ps_UtilObjectService.hasListValue(parent.ListGroup)) {
          const filterListGroup = parent.ListGroup//.filter(this.filterFunction)
          children = children.concat(filterListGroup);
        }

        if (Ps_UtilObjectService.hasListValue(parent.ListFunctions)) {
          const filterListFunc = parent.ListFunctions//.filter(this.filterFunction);
          
          for (let i of parent.ListFunctions as DTOFunction[]) {
            if(Ps_UtilObjectService.hasListValue(i.ListAction)){
              // Thêm giá trị type data của function cho các action nằm trong function đó để phục vụ cho việc hiện dialog
              for (let action of i.ListAction) {
                action['TypeDataFunction'] = i.TypeData
                if(Ps_UtilObjectService.hasListValue(action.ListDataPermission)){
                  // Thêm giá trị type data của function cho các action nằm trong function đó để phục vụ cho việc hiện dialog
                  for (let x of action.ListDataPermission) {
                    x['TypeDataFunction'] = action['TypeDataFunction']
                    
                  }
                }
              }
            }
            
          }
          children = children.concat(filterListFunc);
        }
        if (Ps_UtilObjectService.hasListValue(parent.ListAction)) {
          const filterListAct = parent.ListAction//.filter(this.filterFunction)

            children = children.concat(filterListAct);
        }
        
       
        return children;
    }
    return parent ? [] : this.rootlistSysStructurePermissionTree.filter(this.filterFunction).sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));;
  }

  //Kiểm tra có cấp con không
  hasChildren(item: any): boolean {
      this.loading = true;
      const children = this.fetchChildren(item);
      return children && children.length > 0;
  }
  //#endregion

  //#region Vai trò
  dataRole: DTORole[] = []; // Lưu danh sách role được sao chép từ role gốc để filter
  ListRole: DTORole[] = []; // Lưu danh sách role gốc
  curRole: DTORole[] = []; // Lưu giá trị role được được chọn

  /**
   * hàm xử lý chọn vai trò
   * @param items danh sách vai trò được chọn
   */
  handleValueChangeRole(items: DTORole[]){
    this.curRole = items;
    // Xóa những vai tro được thêm khi chọn department trước đó
    this.columns = this.columns.filter(column => column.Dropdown !== 'role');
    // Thêm các cột mới tương ứng với vai trò được chọn
    for (let item of items) {
      this.columns.push({Code: item.Code, RoleID : item.RoleID, RoleName : item.RoleName, width: 164, Dropdown:  'role'})
    }

    this.columns.sort((a, b) => a.RoleName.localeCompare(b.RoleName));
  }
  //#endregion

  //#region permission
  typeDialog: number = 5;
  openedPermission: boolean = false;
  curPermission: DTOPermission = new DTOPermission();

  /**
   * Hàm xử lý cập nhật phân quyền
   * @param event checked hoặc unchecked
   * @param column cột vài trò
   * @param row hàng action nào
   */
  hanldePerssion(event: any, column: {Code: number, RoleID : string, RoleName : string, width: number, Dropdown:  string}, row: DTOAction){
    const permission = this.getPermission(column, row);
    if(Ps_UtilObjectService.hasValue(permission) && permission.Code === 0 && event.target.checked){
      permission.ActionID = row.Code;
      permission.RoleID = column.Code
      permission.FunctionName = row.FunctionName
      permission.ActionName = row.ActionName
      permission.Company = this.curCompany.Code
      permission.FunctionID = row.FunctionID
      this.APIUpdatePermission(permission, 'get')
    }
    else if(Ps_UtilObjectService.hasValue(permission)  && permission.Code !== 0 && !event.target.checked){
      this.APIDeletePermission(permission)
    }
    // permission.IsSelected = event.target.checked;

  }




curSubFunction: DTOSubFunction = null // Set giá trị null để phân biệt được là hàm được kích hoạt ở ngữ cảnh nào và để bỏ qua 1 số logic ko cần thiết 
// Tách hàm để xử lý việc kiểm tra và set giá trị IsSelected
handleIsSelected(itemChecked: DTODataPermission | DTOSubFunction, curPermission: DTOPermission): void {
  if('ParentID' in itemChecked && itemChecked.IsSelected && Ps_UtilObjectService.hasListValue(itemChecked.ListDataPermission)){
    itemChecked.ListDataPermission = itemChecked.ListDataPermission.map(item => ({ ...item, IsSelected: true}))
  }

  if('ParentID' in itemChecked && !itemChecked.IsSelected && Ps_UtilObjectService.hasListValue(itemChecked.ListDataPermission)){
    itemChecked.ListDataPermission = itemChecked.ListDataPermission.map(item => ({ ...item, IsSelected: false }))
  }
  if (Ps_UtilObjectService.hasListValue(curPermission.ListDataPermission)) {
    for (let dataPer of curPermission.ListDataPermission) {
      if (dataPer.Code == itemChecked.Code) {
        if (dataPer.IsSelected && Ps_UtilObjectService.hasListValue(dataPer.ListDataPermission)) {
          this.handleRecursivePermission(dataPer);
        }

        dataPer.ListDataPermission = Ps_UtilObjectService.hasListValue(dataPer.ListDataPermission) ?
          dataPer.ListDataPermission.map(item => ({ ...item, IsSelected: itemChecked.IsSelected })) : null;
      }
    }
  }


}

// Tách hàm để xử lý việc kiểm tra và set giá trị IsSelected cho ListSubFunction
// handleSubFunctionIsSelected(subfunction: any, itemChecked: DTODataPermission | DTOSubFunction): void {
  // Kiểm tra nếu như là item được check là tính năng
  // if ('FunctionID' in itemChecked && subfunction.Code == itemChecked.Code) {
    // Kiểm tra tính năng đó đã được check chưa
    // if (itemChecked.IsSelected) {
      // Set IsSelected trong tính năng  
      // subfunction.ListDataPermission = subfunction.ListDataPermission.map(item => ({ ...item, IsSelected: true }));
      // for (let dataItem of subfunction.ListDataPermission) {
      //   this.handleRecursivePermission(dataItem);
      // }
    // } else {
    //   subfunction.ListDataPermission = subfunction.ListDataPermission.map(item => ({ ...item, IsSelected: false }));
    //   for (let dataItem of subfunction.ListDataPermission) {
    //     this.handleRecursivePermission(dataItem);
    //   }
    // }
  // } 

  // Nếu Item được checked là dataPermission
  // else 
  // if ('ParentID' in itemChecked && Ps_UtilObjectService.hasListValue(subfunction.ListDataPermission)) {
  //   for (let dataItem of subfunction.ListDataPermission) {
  //     if (itemChecked.Code === dataItem.Code) {
  //       this.customizeIsSelected(itemChecked, dataItem);
  //     } else {
  //       break;
  //     }
  //   }
  // } else {
  //   // Nếu không thuộc 2 trường hợp trên thì xem thì là các DataPermission đã được check chưa 
  //   if (subfunction.IsSelected === false && Ps_UtilObjectService.hasListValue(subfunction.ListDataPermission) &&
  //       subfunction.ListDataPermission.every(child => child.IsSelected)) {
  //     // Nếu tất cả các DataPermission đã được checked thì 
  //     subfunction.IsSelected = true 
  //   }
  // }
  
// }

// hàm xử lý đệ quy khi chọn giá trị
customizeIsSelected(itemChecked: DTODataPermission | DTOSubFunction, curPermission: any): void {
  this.handleIsSelected(itemChecked, curPermission);

  if (Ps_UtilObjectService.hasListValue(curPermission.ListDataPermission)) {
    for (let x of curPermission.ListDataPermission) {
      // Nếu con checked hết thì cha cũng phải checked
      if (Ps_UtilObjectService.hasListValue(x.ListDataPermission) &&
          x.ListDataPermission.every(child => child.IsSelected)) {
        x.IsSelected = true;
      } 
    }
  }

  // Đệ quy set giá trị IsSelected cho đối tượng permission có ListSubFunction
  if (Ps_UtilObjectService.hasListValue(curPermission.ListSubFunction)) {
    for (let subfunction of curPermission.ListSubFunction) {
      // if(subfunction.Code === itemChecked.Code){
      //   this.handleSubFunctionIsSelected(subfunction, itemChecked);
      // }

      for(let x of subfunction.ListDataPermission){
        // Nếu những dataPermission có con được checked hết mà bản thân nó chưa check
        if(Ps_UtilObjectService.hasListValue(x.ListDataPermission)){
          let a = x.ListDataPermission.every(child => child.IsSelected);
          if(!x.IsSelected){
            a ? x.IsSelected = true : null;
          } 
          else {
            !a ? x.IsSelected = false : null 
          }
        }
      }

      let b = subfunction.ListDataPermission.every(child => child.IsSelected);
      b ? subfunction.IsSelected = true : null;
    }
  }
}

// Hàm xử lý khi chọn một data
handleUpdateSubFunction(itemChecked: DTODataPermission, curPermission: DTOPermission, curSubFunction?: DTOSubFunction): void {
  this.curSubFunction = Ps_UtilObjectService.hasValue(curSubFunction) ? curSubFunction : null; // lưu tính năng chi tiết đang được tương tác
  this.customizeIsSelected(itemChecked, curPermission);
  this.APIUpdatePermission(this.curPermission, 'noget');
}

// Đệ qui set giá trị IsSelected
handleRecursivePermission(data: DTODataPermission, itemChecked?: DTODataPermission | DTOSubFunction){
  if(!Ps_UtilObjectService.hasListValue(data.ListDataPermission)){
    return
  }
  else 
  {
    if (Ps_UtilObjectService.hasListValue(data.ListDataPermission)) {

      data.ListDataPermission = data.ListDataPermission.map(item => ({ ...item, IsSelected: data.IsSelected }))
      const allChildChecked = data.ListDataPermission.every(child => child.IsSelected)
      allChildChecked && !data.IsSelected ? data.IsSelected = true : null
      !allChildChecked && data.IsSelected ? data.IsSelected = false : null
      for(let x of data.ListDataPermission){
        if (Ps_UtilObjectService.hasListValue(x.ListDataPermission)) {
          this.handleRecursivePermission(x)
        }
      }
    }
  }
}


  /**
   * hàm lấy permission
   * @param column vai trò
   * @param row action
   * @returns permission
   */
  getPermission(column: { Code: number, RoleID: string, RoleName: string, width: number, Dropdown: string }, row: DTOAction): DTOPermission {
    // Tạo giá trị mặc định và set các giá trị liên quan cho nó 
    let temPer = new DTOPermission()
    temPer.ActionID = row.Code;
    temPer.RoleID = column.Code
    temPer.FunctionName = row.FunctionName
    temPer.ActionName = row.ActionName
    temPer.Company = this.curCompany.Code
    temPer.FunctionID = row.FunctionID


    if(Ps_UtilObjectService.hasListValue(row.ListDataPermission)){
      const item = row.ListDataPermission.find(
        (obj: DTOPermission) => obj.RoleID === column.Code && obj.ActionID === row.Code
      );
      
      if (item) {
        item.ActionID = row.Code;
        item.RoleID = column.Code
        item.FunctionName = row.FunctionName
        item.ActionName = row.ActionName
        item.Company = this.curCompany.Code
        item.FunctionID = row.FunctionID
        item.IsSelected = true;
        return item
      } else {
        return temPer;    // Trả về một đối tượng mới nếu không tìm thấy
      }
    } else {
      return temPer;
    }
    
  }

  /**
   * Hàm mở dialog phân quyền
   * @param permission là một đối tượng phân quyền
   */
  opendDialogPermission(permission: DTOPermission){
    this.openedPermission = true;
    this.typeDialog = Ps_UtilObjectService.hasValue(permission['TypeDataFunction']) ? permission['TypeDataFunction'] : 4;
    this.APIGetPermission(permission);
  }

  // Hàm đóng dialog phân quyền
  handleCloseDialogPer(){
    this.openedPermission = false;
  }

  
  
  //#endregion

  //#region dropdownTree
  public childrenModule = (dataitem: DTOModule): Observable<DTOModule[]> => of(dataitem.ListGroup);
  public hasChildrenModule = (dataitem: DTOModule): boolean => Ps_UtilObjectService.hasListValue(dataitem.ListGroup);
  parsedDataModule: DTOModule[] = [];
  handleFilterModule(value: string): void {
    this.parsedDataModule = this.searchModule(this.listModuleTree, value);
  }

  /**
   * Tìm module theo keyword
   * @param items Danh sách module
   * @param term keyword
   * @returns danh sách module tương ứng với keyword
   */
  searchModule(items: DTOModule[], term: string): DTOModule[] {
    return items.reduce((acc, item) => {
      if (this.contains(item.Vietnamese, term)) {
        acc.push(item);
      } else if (item.ListGroup && item.ListGroup.length > 0) {
        const newItems = this.searchModule(item.ListGroup, term);

        if (newItems.length > 0) {
          acc.push({ Vietnamese: item.Vietnamese, ListGroup: newItems });
        }
      }
      
      return acc;
    }, []);
  }

  contains(text: string, term: string): boolean {
    return text.toLowerCase().includes((term || "").toLowerCase());
  }
  //#endregion


  //#region API

  // Lấy danh sách công ty
  APIGetListCompany() {
    this.loading = true;
    let a = this.apiDevService.GetListCompany({}, '').pipe(takeUntil(this.ngUnsubscribe$)).subscribe(
      (res) => {
        this.loading = false
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.ListCompany = res.ObjectReturn.Data

          //Lấy item đầu tiên trong mảng làm giá trị mặc định
          this.curCompany = this.ListCompany[0]
          this.curRole = []

          // Gọi tiếp api để lấy bộ phân theo công ty
          this.APIGetListDepartment()
          this.APIGetListSysStructurePermissionTree(this.curCompany.Code)
          this.handleLoadFilterTree()
          this.APIGetListRoles(this.filterRoleByDepartment)
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

  // Lấy danh sách module dạng tree
  APIGetListModuleTree() {
    let ctx = `Lấy danh sách module`;
    this.loading = true;

    this.apiDevService.GetListModuleTree(2)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loading = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                    this.listModuleTree = res.ObjectReturn;
                    this.listModuleTree = this.listModuleTree.sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));
                    this.listModuleTree.unshift(this.defaultParent); // Thêm item mặc định 
                    this.parsedDataModule = this.listModuleTree.slice();
                    this.curModule = this.listModuleTree[0] // Set giá trị mặc định
                    if(!this.curModule.Vietnamese.includes("Tất cả")){
                      this.compositeModule = [
                        { field: 'Vietnamese', operator: 'eq', value: this.curModule.Vietnamese, ignoreCase: true },
                      ] // Set filter
                    }
                } else {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                }
            },
            (error) => {
                this.loading = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  /**
   * Lấy danh sách role theo department
   * @param ListDepartment Danh sách department cần lấy role
   */
  APIGetListRoleByDepartment(ListDepartment: DTODepartment[]) {
    let ctx = `Lấy danh sách bộ phận`;
    this.loading = true;
    this.apiConfigService.GetListRoleByDepartment(ListDepartment)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loading = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                    this.ListRoleByDepartment = res.ObjectReturn;
                    this.ListRoleByDepartment.sort((a, b) => a.RoleName.localeCompare(b.RoleName));

                    // Nếu department được chọn có vai trò
                    if(this.ListRoleByDepartment.length > 0){ 
                      this.generateData(164) // Tính số cột được render lên treelist
                      this.handleSelectedCurrentModule(this.curModule) // render treelist
                    } else {
                      this.columns = []
                    }

                    // Dù ListRoleByDepartment có giá trị hay không thì hàm  handleLoadFilterTree vẫn phải chạy nên không thế để vào if trên
                    this.handleLoadFilterTree() // Tạo filter để lọc vai trò
                    this.curRole = [] // reset giá trị đã chọn của dropdown vai trò
                    this.APIGetListRoles(this.filterRoleByDepartment) // lấy vai trò theo filter được tạo
                } else {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                }
            },
            (error) => {
                this.loading = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  loadingTree:boolean = false
  /**
   * Lấy danh sách module
   * @param company công ty cần lấy danh sách
   */
  APIGetListSysStructurePermissionTree(company: number) {
    let ctx = `Lấy danh sách chức năng phân quyền`;
    this.loadingTree = true;
    this.apiConfigService.GetListSysStructurePermissionTree(company)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loadingTree = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                  this.listSysStructurePermissionTree = JSON.parse(JSON.stringify(res.ObjectReturn)).sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));;
                  this.rootlistSysStructurePermissionTree = JSON.parse(JSON.stringify(this.listSysStructurePermissionTree)).sort((a, b) => a.Vietnamese.localeCompare(b.Vietnamese));
                  Ps_UtilObjectService.hasValue(this.curModule) ? this.handleSelectedCurrentModule(this.curModule) : null
                 
                } else {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                }
            },
            (error) => {
                this.loadingTree = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  /**
   * Lấy chi tiết thông tin phân quyền
   * @param item phân quyền cần lấy chi thông tin chi tiết
   */
  APIGetPermission(item: DTOPermission) {
    let ctx = `Lấy chi tiết thông tin phân quyền`;
    this.loading = true;
    this.apiConfigService.GetPermission(item)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loading = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                    this.curPermission = res.ObjectReturn;
                } else {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                }
            },
            (error) => {
                this.loading = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  loadingUpdate: boolean = false;

  /**
   * Tạo/cập nhật phân quyền
   * @param item phân quyền
   * @param type get or noget
   */
  APIUpdatePermission(item: DTOPermission,type: string) {
    let ctx = `${item.Code == 0 ? 'Tạo mới' : 'Cập nhật'}`;
    this.loadingUpdate = true;
    this.apiConfigService.UpdatePermission(item)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loadingUpdate = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                  type == 'get' ? this.APIGetListSysStructurePermissionTree(this.curCompany.Code) : null
                  this.layoutService.onSuccess(`${ctx} thành công.`);
                } else {
                  this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                  this.APIGetListSysStructurePermissionTree(this.curCompany.Code)
                }
            },
            (error) => {
                this.loadingUpdate = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  /**
   * API xóa phân quyền
   * @param item Truyền vào một đối tượng permission
   */
  APIDeletePermission(item: DTOPermission) {
    let ctx = `Xóa phân quyền`;
    this.loading = true;
    this.apiConfigService.DeletePermission(item)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(
            (res) => {
                this.loading = false;
                if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                  this.APIGetListSysStructurePermissionTree(this.curCompany.Code)
                  this.layoutService.onSuccess(`${ctx} thành công`);
                  } else {
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                    this.APIGetListSysStructurePermissionTree(this.curCompany.Code)
                }
            },
            (error) => {
                this.loading = false;
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
            }
        );
  }

  // Lấy danh sách department dạng tree
  APIGetListDepartment() {
    var temp: DTODepartment = new DTODepartment()
		temp['Company'] = this.curCompany.Code, temp['IsTree'] = true
    
		// Call the API to get the department list data
		this.apiConfigService.GetListDepartment(temp).pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.ListDepartment = res.ObjectReturn
        this.ListDepartment.sort((a, b) => a.Department.localeCompare(b.Department));
        this.parsedDataDepartment = this.ListDepartment.slice();
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị trực thuộc: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị trực thuộc: ${err}`);
		})
	}

  /**
   * Lấy danh sách vai trò theo đơn vị trực thuộc
   * @param state truyền filter
   */

  APIGetListRoles(state: State) {
    var temp: DTODepartment = new DTODepartment()
		temp['Company'] = this.curCompany.Code, temp['IsTree'] = true
    
		// lấy danh sách vai trò theo đơn vị trực thuộc
		this.apiConfigService.GetListRoles(state,'').pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.ListRole = res.ObjectReturn.Data
        this.ListRole.sort((a, b) => a.RoleName.localeCompare(b.RoleName));
        // Lọc các item trong ListRole có Code khác với các item trong ListRoleByDepartment
        this.ListRole = this.ListRole.filter(role =>
          !this.ListRoleByDepartment.some(departmentRole => departmentRole.Code === role.Code)
        );
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò theo đơn vị trực thuộc: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò theo đơn vị trực thuộc: ${err}`);
		})
	}
 
  //#endregion

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

}