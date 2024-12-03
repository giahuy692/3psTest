import { Component, HostListener, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { SelectableSettings, TreeListComponent } from '@progress/kendo-angular-treelist';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DTOPartner } from 'src/app/p-app/p-purchase/shared/dto/DTOPartner';
import { ConfigEnterpriceApiService } from '../../shared/services/config-enterprice-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { StaffApiService } from 'src/app/p-app/p-hri/shared/services/staff-api.service';
import { DTOListCountry } from 'src/app/p-app/p-hri/shared/dto/DTOPersonalInfo.dto';
import { DTOLSProvince } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import { DTOLSWard } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSWard.dto';
import { DTOLSDistrict } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSDistrict.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct, filterBy } from '@progress/kendo-data-query';
import { ChangeDetectorRef } from '@angular/core';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';


@Component({
  selector: 'app-config006-enterprise-partner',
  templateUrl: './config006-enterprise-partner.component.html',
  styleUrls: ['./config006-enterprise-partner.component.scss']
})


export class Config006EnterprisePartnerComponent {

  @ViewChild('formDrawer') public drawer: MatDrawer;
  @ViewChildren('anchor') anchors;
  @ViewChild('myTreeList') treelist: TreeListComponent;
  @ViewChild('dropdown2') dropdown2: any
  @ViewChild('dropdown3') dropdown3: any
  @ViewChild('dropdown4') dropdown4: any

  loading: boolean = false
  dialog: boolean = false
  popupShow: boolean = false;
  isLockAll: boolean = false;


  currentAnchorIndex: number = -1

  menuItemList: any[] = [];

  settingsTreelist: SelectableSettings = { enabled: true, mode: 'row', multiple: false, drag: true };
  collapsedIds: any[];

  ngUnsubscribe = new Subject<void>();

  partnerForm: FormGroup = new FormGroup({
    Code: new FormControl(0),
    InvNo: new FormControl(''),
    VNName: new FormControl(''),
    ENName: new FormControl(''),
    JPName: new FormControl(''),
    ShortName: new FormControl(''),
    ParentID: new FormControl(null),
    ParentName: new FormControl(''),
    Address: new FormControl(''),
    Country: new FormControl(null),
    CountryObj: new FormControl({}),
    CountryName: new FormControl(''),
    Province: new FormControl(null),
    ProvinceObj: new FormControl({}),
    District: new FormControl(null),
    DistrictObj: new FormControl({}),
    Ward: new FormControl(null),
    WardObj: new FormControl({}),
    IsLocal: new FormControl(true),
    IsForeign: new FormControl(false),
    Tel: new FormControl(''),
    Fax: new FormControl(''),
    Website: new FormControl(''),
    InvName: new FormControl(''),
    InvAddress: new FormControl(''),
  });

  partner = new DTOPartner();
  rootData: DTOPartner[] = []
  listPartnerTree: DTOPartner[] = []
  listDropdownTree: DTOPartner[] = []


  selectedItemPopup = new DTOPartner();
  selectedItemTree = new DTOPartner();
  currentPartnerForm = new DTOPartner();

  currentCountry = new DTOListCountry();

  defaultParent: DTOPartner = new DTOPartner({ Code: null, VNName: 'Không lựa chọn' });

  //DTO list LS
  listCountry: DTOListCountry[] = []
  listProvince: DTOLSProvince[] = []
  listDistrict: DTOLSDistrict[] = []
  listWard: DTOLSWard[] = []

  gridStateLS: State = {
    filter: { filters: [], logic: 'and' },
  }

  //filter
  filterValue: State = { filter: { filters: [], logic: 'and' } }
  searchValue: State = { filter: { filters: [], logic: 'or' } }

  // permission
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false


  constructor(
    public enterServiceAPI: ConfigEnterpriceApiService,
    public layoutService: LayoutService,
    private cdRef: ChangeDetectorRef,
    public StaffServiceAPI: StaffApiService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    //permision
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = false
        // this.isCreator = true
        // this.isApprover = true
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })

    // this.GetListPartnerTree();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListPartnerTree();
      }
    })

  }




  loadBRC() {
    this.GetListPartnerTree();
  }

  loadData(): void {
    this.loadFilterTree()
    const allData = this.fetchChildren();
    this.rootData = allData.filter(this.filterFunction);
    // console.log(this.filterValue.filter.filters)
    // console.log(this.rootData)
  }

  closeDialog() {
    this.dialog = false
  }
  openDialog() {
    this.dialog = true
  }

  onCloseForm() {
    this.drawer.close();
  }

  onAddNew() {
    this.partnerForm.reset();
    const newPartner = new DTOPartner();
    if (!Ps_UtilObjectService.hasValue(this.selectedItemTree)) {
      this.selectedItemTree = newPartner
    }
    // this.GetListPartnerDropdown(this.selectedItemTree)
    this.partnerForm.patchValue(newPartner)
    this.disableInvNo = false
    this.isLockAll = true
    // this.APIGetListCountry(0);
    this.drawer.open();
    // console.log(this.partnerForm.value)
  }

  onUpdatePartner() {
    const updatePartner: DTOPartner = this.partnerForm.value
    // console.log(updatePartner)
    // console.log(this.currentParenID)
    if (Ps_UtilObjectService.hasValue(this.currentParenID) && this.currentParenID.Code > 0) {
      updatePartner.ParentID = this.currentParenID.Code
    }
    else {
      if (updatePartner.Code > 0) {
        updatePartner.ParentID = this.partnerForm.value.ParentID.Code
      } else {
        updatePartner.ParentID = null
      }
    }
    // this.partnerForm.value.ParentID = this.partnerForm.value.ParentID.Code

    if (!Ps_UtilObjectService.hasValueString(updatePartner.InvNo)) {
      this.layoutService.onError("Bạn chưa nhập vào Mã số thuế");
    } else if (!Ps_UtilObjectService.hasValueString(updatePartner.VNName)) {
      this.layoutService.onError("Bạn chưa nhập vào Tên tiếng Việt");
    } else if (!Ps_UtilObjectService.hasValueString(updatePartner.ShortName)) {
      this.layoutService.onError("Bạn chưa nhập vào Tên viết tắt");
    } else if (!Ps_UtilObjectService.hasValueString(updatePartner.Fax)) {
      this.layoutService.onError("Bạn chưa nhập vào Số fax");
    } else if (!Ps_UtilObjectService.hasValueString(updatePartner.InvName)) {
      this.layoutService.onError("Bạn chưa nhập vào Tên hóa đơn");
    } else if (!Ps_UtilObjectService.hasValueString(updatePartner.InvAddress)) {
      this.layoutService.onError("Bạn chưa nhập vào Địa chỉ hóa đơn");
    }//check string number -- to do --
    else {

      this.UpdatePartner(updatePartner);
    }
  }

  onDeletePartner() {
    if (Ps_UtilObjectService.hasValue(this.selectedItemPopup.Code) && this.selectedItemPopup.Code > 0 && Ps_UtilObjectService.hasValueString(this.selectedItemPopup.InvNo)) {
      this.DeletePartner(this.selectedItemPopup)
    }
  }

  onInvNoBlur() {
    if (Ps_UtilObjectService.hasValueString(this.partnerForm.value.InvNo)) {
      this.GetPartner(this.partnerForm.value)
    }
  }


  isLocal: boolean = true
  isForeign: boolean = true

  filterLocal: FilterDescriptor = { field: 'IsLocal', value: true, operator: 'eq', ignoreCase: true }
  filterForeign: FilterDescriptor = { field: 'IsForeign', value: true, operator: 'eq', ignoreCase: true }

  applyFilter(event, name: string) {
    if (name == "isLocal") {
      this.isLocal = event.target.checked
    }
    else if (name == "isForeign") {
      this.isForeign = event.target.checked
    }
    this.loadData();
  }

  loadFilterTree() {
    this.filterValue.filter.filters = []
    var filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }

    if (this.isLocal) {
      this.filterLocal.value = this.isLocal
      filterStatus.filters.push(this.filterLocal)
    }
    if (this.isForeign) {
      this.filterForeign.value = this.isForeign
      filterStatus.filters.push(this.filterForeign)
    }
    if (filterStatus.filters.length > 0) {
      // this.filterForeign.value = this.isForeign
      this.filterValue.filter.filters.push(filterStatus)
    }

    if (Ps_UtilObjectService.hasValue(this.searchValue)) {
      if (Ps_UtilObjectService.hasListValue(this.searchValue.filter.filters)) {
        this.filterValue.filter.filters.push(this.searchValue.filter)
      }
    }
  }

  onResetFilter(e) {
    if (Ps_UtilObjectService.hasListValue(this.collapsedIds)) {
      for (const id of this.collapsedIds) {
        this.treelist.expand(id);
      }
    }
    this.isForeign = true
    this.isLocal = true
    this.loadData();
  }





  //Search dropdownTree form
  parsedData: DTOPartner[] = [];
  handleFilter(value: string): void {
    this.parsedData = this.search(this.listDropdownTree, value);
  }

  search(items: DTOPartner[], term: string): DTOPartner[] {
    return items.reduce((acc, item) => {
      if (this.contains(item.VNName, term)) {
        acc.push(item);
      } else if (item.ListPartner && item.ListPartner.length > 0) {
        const newItems = this.search(item.ListPartner, term);

        if (newItems.length > 0) {
          acc.push({ VNName: item.VNName, ListPartner: newItems });
        }
      }

      return acc;
    }, []);
  }

  contains(text: string, term: string): boolean {
    return text.includes(term);
  }

  children = (dataItem: DTOPartner): Observable<DTOPartner[]> => of(dataItem.ListPartner);
  hasChildrenDropdown = (dataItem: DTOPartner): boolean => !!dataItem.ListPartner;


  //end

  onSearchValuePartner(e) {
    this.searchValue.filter.filters = e.filters
    this.loadData();
  }




  onSelectionChange(e) {
    if (e.action == "select") {
      this.selectedItemTree = e.items[0].dataItem
    }
    else[
      this.selectedItemTree = null
    ]
    this.popupShow = false
  }

  isPopupVisible() {
    return this.popupShow !== null ? (this.popupShow ? 'visible' : 'hidden') : 'hidden';
  }

  getAnchor() {
    if (Ps_UtilObjectService.hasValue(this.anchors) && this.anchors.length > 0) {
      const anchor = this.anchors.toArray()[this.currentAnchorIndex];
      if (Ps_UtilObjectService.hasValue(anchor)) {
        return anchor;
      }
    }

    return null;
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    var anchor = this.getAnchor()
    if (Ps_UtilObjectService.hasValue(anchor)) {
      if (!anchor.nativeElement.contains(event.target)
        && this.popupShow == true) {
        this.popupShow = false

      }
    }
    // this.cdr.detectChanges();
  }

  togglePopup(index, dataItem) {
    event.stopPropagation();

    if (index != this.currentAnchorIndex) {
      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      this.popupShow = !this.popupShow
    }
    if (this.popupShow) {
      this.selectedItemPopup = dataItem
      this.getSelectedMenuDropdown(dataItem)
    }

    this.currentAnchorIndex = index
  }

  getSelectedMenuDropdown(dataItem: DTOPartner) {
    this.menuItemList = []

    // this.partnerForm.patchValue({...dataItem,ModuleID:{}})

    this.menuItemList.push(
      { id: 1, iconName: 'pencil', text: 'Chỉnh sửa' },
      { id: 0, iconName: 'delete', text: 'Xóa Đối tác' },
    )

    this.menuItemList = [...this.menuItemList]
    // console.log(this.menuItemList)
  }

  currentParenID: any
  onClickMenuDropdownItem(selectItemPopup: any) {
    if (selectItemPopup) {
      const id = selectItemPopup.id

      if (id == 1) {
        this.partnerForm.reset();
        if (Ps_UtilObjectService.hasValue(this.selectedItemPopup)) {
          this.isLockAll = true
          this.GetPartner(this.selectedItemPopup)
        } else {
          this.isLockAll = true
        }
        // if(Ps_UtilObjectService.hasValue(this.selectedItemPopup.ParentID)){
        //   const currentPartner = this.searchTree(this.listPartnerTree,this.selectedItemPopup.ParentID)

        //   if(Ps_UtilObjectService.hasValue(currentPartner)){
        //     this.currentParenID = currentPartner
        //     this.partnerForm.patchValue({ 
        //       ...this.selectedItemPopup,
        //       ParentID: currentPartner,
        //   });
        //   }
        // }else{
        //   this.partnerForm.patchValue({ 
        //     ...this.selectedItemPopup,
        //     ParentID: this.defaultParent,
        // });
        // }
        this.drawer.open();
        // console.log(this.partnerForm.value)
      }
      else if (id == 0) {
        this.openDialog();
      }
      this.popupShow = false
    }
  }

  searchTree(dataList, targetCode) {
    for (const item of dataList) {
      if (item.Code === targetCode) {
        return item;
      }

      if (item.ListPartner && item.ListPartner.length > 0) {
        const foundItem = this.searchTree(item.ListPartner, targetCode);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null; // Trả về null nếu không tìm thấy
  }

  selectionChangeForm(e: any) {
    if (Ps_UtilObjectService.hasValue(e) && e.Code > 0) {
      this.currentParenID = e
    } else {
      this.currentParenID = null
    }

  }


  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }



  fetchChildren = (parent?: any): DTOPartner[] => {
    if (parent) {
      let children: DTOPartner[] = [];
      if (Ps_UtilObjectService.hasListValue(parent.ListPartner)) {
        const filterListGroup = parent.ListPartner.filter(this.filterFunction);
        children = children.concat(filterListGroup);
      }
      return children;
    }
    return parent ? [] : this.listPartnerTree.filter(this.filterFunction);
  }



  filterFunction = (item: DTOPartner): boolean => {
    if (!Ps_UtilObjectService.hasValue(this.filterValue.filter) || !Ps_UtilObjectService.hasListValue(this.filterValue.filter.filters)) {
      return true;
    }

    const matchesFilterValue = filterBy([item], this.filterValue.filter).length > 0;
    if (matchesFilterValue) {
      return true;
    }
    // Kiểm tra nếu còn item thì đệ quy để filter tiếp
    if (item) {
      const children = this.fetchChildren(item);
      return children.some(child => this.filterFunction(child));
    }
    return false;
  };

  hasChildren(item: DTOPartner): boolean {
    const children = this.fetchChildren(item)
    return children && children.length > 0
  }

  loadFilterLS(code: number, propName: string) {
    this.gridStateLS.filter.filters = []
    if (code > 0) {
      if (propName == 'Country') {
        this.gridStateLS.filter.filters.push({ field: 'Country', operator: 'eq', value: code })
        this.APIGetListProvince(this.gridStateLS)
      }
      else if (propName == 'Province') {
        this.gridStateLS.filter.filters.push({ field: 'Province', operator: 'eq', value: code })
        this.APIGetListDistrict(this.gridStateLS)
      }
      else if (propName == 'District') {
        this.gridStateLS.filter.filters.push({ field: 'District', operator: 'eq', value: code })
        this.APIGetListWard(this.gridStateLS)
      }
    }
    // else{
    //   this.gridStateLS.filter.filters.push({ field: 'Ward', operator: 'eq', value: code })
    //   this.APIGetListWard(this.gridStateLS)
    // }
  }

  // selectdropdown: any
  onDropdownlistClick(event, propName: string) {
    const province = this.partnerForm.controls['ProvinceObj'];
    const district = this.partnerForm.controls['DistrictObj'];
    const ward = this.partnerForm.controls['WardObj'];
    const provinceID = this.partnerForm.controls['Province'];
    const districtID = this.partnerForm.controls['District'];
    const wardID = this.partnerForm.controls['Ward'];

    this.loadFilterLS(event.Code, propName)
    if (propName == 'Country') {
      province.patchValue(null);
      district.patchValue(null);
      ward.patchValue(null);
      // this.disableProvince = true
      this.disableDistrict = true
      this.disableWard = true
      if (Ps_UtilObjectService.hasValue(event.Code)) {
        provinceID.patchValue(null)
        wardID.patchValue(null)
        districtID.patchValue(null)
        this.partnerForm.value.Country = event.Code
        this.disableProvince = false
        // if(event.VNName == "Việt Nam" || event.Code == 1){
        //   this.disableProvince = false
        // }

      } else {
        this.disableProvince = true
        this.disableDistrict = true
        this.disableWard = true
      }
    }
    else if (propName == 'Province') {
      if (Ps_UtilObjectService.hasValue(event.Code)) {
        district.patchValue(null);
        ward.patchValue(null);
        wardID.patchValue(null)
        districtID.patchValue(null)
        this.partnerForm.value.Province = event.Code
        this.disableWard = true
        this.disableDistrict = false
      } else {
        this.disableDistrict = true
        this.disableWard = true
      }
    }
    else if (propName == 'District') {
      ward.patchValue(null);
      if (Ps_UtilObjectService.hasValue(event.Code)) {
        this.partnerForm.value.District = event.Code
        this.disableWard = false
      } else {
        // ward.patchValue(event.Code);
        this.disableWard = true
      }
    }
    else {
      this.partnerForm.value.Ward = event.Code
    }
    this.partnerForm.patchValue(this.partnerForm.value)

    // console.log(this.partnerForm.value)
  }

  //#regionAPI
  GetListPartnerTree() {
    let ctx = `Lấy danh sách Đối tác`
    this.loading = true;
    this.enterServiceAPI.GetListPartnerTree().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPartnerTree = res.ObjectReturn
        this.loadData();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }
  GetListPartnerDropdown(dto: DTOPartner) {
    let ctx = `Lấy danh sách Đối tác`
    this.loading = true;
    this.enterServiceAPI.GetListPartnerDropdown(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDropdownTree = res.ObjectReturn
        this.parsedData = res.ObjectReturn
        this.listDropdownTree.unshift(this.defaultParent)
        // this.loadData();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }


  disableInvNo: boolean = false
  GetPartner(dto: DTOPartner) {
    let ctx = `Lấy thông tin Đối tác`
    this.loading = true;
    this.enterServiceAPI.GetPartner(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.isLockAll = false
        this.disableInvNo = true
        this.GetListPartnerDropdown(dto)
        this.APIGetListCountry(1)
        if (Ps_UtilObjectService.hasValue(res.ObjectReturn.ParentID)) {
          const currentPartner = this.searchTree(this.listPartnerTree, res.ObjectReturn.ParentID)
          if (Ps_UtilObjectService.hasValue(currentPartner)) {
            this.partnerForm.patchValue({
              ...res.ObjectReturn,
              ParentID: currentPartner,
            });
          }
        } else {
          this.partnerForm.patchValue({
            ...res.ObjectReturn,
            ParentID: this.defaultParent,
          });
        }


      } else {
        this.isLockAll = true
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  UpdatePartner(dto: DTOPartner) {
    let ctx = `Cập nhật thông tin Đối tác`
    this.loading = true;
    this.enterServiceAPI.UpdatePartner(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} Thành công`)
        this.GetListPartnerTree()
        this.drawer.close();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListPartnerTree()

      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.GetListPartnerTree()
    })
  }

  DeletePartner(dto: DTOPartner) {
    let ctx = `Xóa thông tin Đối tác`
    this.loading = true;
    this.enterServiceAPI.DeletePartner(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} Thành công`)
        this.GetListPartnerTree()
        this.drawer.close()
        this.closeDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.GetListPartnerTree()

      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.GetListPartnerTree()
    })
  }

  updateCurrentCountry(selectedItem, listCountry: DTOListCountry[]) {
    if (Ps_UtilObjectService.hasValue(selectedItem.Country)) {
      return listCountry.find(s => s.Code === selectedItem.Country);
    } else {
      return null;
    }
  }


  disableProvince: boolean = false
  disableDistrict: boolean = false
  disableWard: boolean = false
  //Lấy danh sách quốc gia
  APIGetListCountry(typeOnForm) {
    let ctx = `Lấy danh sách quốc gia`
    this.loading = true;
    this.StaffServiceAPI.GetListCountry().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCountry = res.ObjectReturn.Data
        var country = new DTOListCountry();
        if (Ps_UtilObjectService.hasValue(this.selectedItemPopup) && this.selectedItemPopup.Code > 0 && typeOnForm == 1) {
          this.loadFilterLS(this.selectedItemPopup.Country, "Country")
          country = this.updateCurrentCountry(this.selectedItemPopup, this.listCountry);
        }

        else if (Ps_UtilObjectService.hasValue(this.selectedItemTree) && this.selectedItemTree.Code > 0 && typeOnForm == 0) {
          this.loadFilterLS(this.selectedItemTree.Country, "Country")
          country = this.updateCurrentCountry(this.selectedItemTree, this.listCountry);
        }
        else {
          this.loadFilterLS(this.listCountry[0].Code, "Country")
          country = this.listCountry[0]
        }


        this.partnerForm.patchValue({ CountryObj: country, Country: country.Code })

        // console.log(this.partnerForm.value)


      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  //Lấy danh sách tỉnh thành
  APIGetListProvince(state: State) {
    let ctx = `Lấy danh sách Tỉnh Thành`
    this.loading = true;

    this.StaffServiceAPI.GetListProvince(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listProvince = res.ObjectReturn.Data
        // console.log(this.partnerForm.value)
        this.disableDistrict = true
        this.disableWard = true
        if (Ps_UtilObjectService.hasValue(this.partnerForm.value.Province) && Ps_UtilObjectService.hasListValue(this.listProvince)) {
          this.disableProvince = false
          this.disableDistrict = false
          this.loadFilterLS(this.partnerForm.value.Province, "Province")
          const province = this.listProvince.find(s => s.Code == this.partnerForm.value.Province)
          // console.log(province)
          this.partnerForm.patchValue({ ProvinceObj: province })
        } else {
          this.partnerForm.patchValue({ ProvinceObj: { Code: null } })
          this.dropdown2.source = []
        }

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  //- Lấy danh sách Quận/huyện
  APIGetListDistrict(state: State) {
    let ctx = `Lấy danh sách Quận/huyện`
    this.loading = true;
    this.StaffServiceAPI.GetListDistrict(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDistrict = res.ObjectReturn.Data
        // console.log(this.partnerForm.value)
        if (Ps_UtilObjectService.hasValue(this.partnerForm.value.District) && Ps_UtilObjectService.hasListValue(this.listDistrict)) {
          this.loadFilterLS(this.partnerForm.value.District, "District")
          const district = this.listDistrict.find(s => s.Code == this.partnerForm.value.District)
          this.partnerForm.patchValue({ DistrictObj: district })
          this.disableDistrict = false
        } else {
          this.partnerForm.patchValue({ DistrictObj: { Code: null } })
          this.dropdown3.source = []
        }


      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  //- Lấy danh sách Phường/Xã
  APIGetListWard(state: State) {
    let ctx = `Lấy danh sách Phường/Xã`
    this.loading = true;
    this.StaffServiceAPI.GetListWard(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listWard = res.ObjectReturn.Data
        if (Ps_UtilObjectService.hasValue(this.partnerForm.value.Ward) && Ps_UtilObjectService.hasListValue(this.listWard)) {
          const ward = this.listWard.find(s => s.Code == this.partnerForm.value.Ward)
          this.partnerForm.patchValue({ WardObj: ward })
          this.disableWard = false
        }
        else {
          this.partnerForm.patchValue({ WardObj: { Code: null } })
          this.dropdown4.source = []
        }

      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }



  //#endregion

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
