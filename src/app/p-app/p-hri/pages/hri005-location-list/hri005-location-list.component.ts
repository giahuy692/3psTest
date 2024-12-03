import { Component, OnInit, ViewChild } from '@angular/core';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { SelectableSettings, TreeListComponent } from '@progress/kendo-angular-treelist';
import * as $ from 'jquery';

// DTO \\
import { DTOLocation } from '../../shared/dto/DTOLocation.dto';
import { Subject, Subscription } from 'rxjs';
import { EcomAPIService } from 'src/app/p-app/p-ecommerce/shared/services/ecom-api.service';
import { DTOLSProvince } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSProvince.dto';
import { DTOLSDistrict } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSDistrict.dto';
import { DTOLSWard } from 'src/app/p-app/p-ecommerce/shared/dto/DTOLSWard.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';

// Service \\
import { OrganizationAPIService } from '../../shared/services/organization-api.service';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct, filterBy } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { FormControl, FormGroup } from '@angular/forms';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';

@Component({
  selector: 'app-hri005-location-list',
  templateUrl: './hri005-location-list.component.html',
  styleUrls: ['./hri005-location-list.component.scss'],
})
export class Hri005LocationListComponent implements OnInit {

  //# variable callApi
  GetListLocationTree_sst: Subscription;
  GetAllProvinceInVietName_sst: Subscription;
  GetAllDistrictInProvince_sst: Subscription;
  GetAllWardInDistrict_sst: Subscription;
  GetListLocation_sst: Subscription;
  GetListStatus_sst: Subscription;
  UpdateLocation_sst: Subscription;
  DeleteLocation_sst: Subscription;

  //#region subscribe
  arrUnsubscribe: Subscription[] = [];
  //#endregion

  //#region permission
  isToanQuyen = false;
  isAllowedToCreate = false;
  isAllowedToVerify = false;
  isView = false
  justLoaded = true;
  actionPerm: DTOActionPermission[] = [];
  dataPerm: DTODataPermission[] = [];
  changePermission_sst: Subscription;
  //#endregion

  //# variable of status \\
  notSelectedProvince: boolean = true;
  notSelectedDistrict: boolean = true;
  notSelectedWard: boolean = true;
  isAction: number = 0;
  isSeen: boolean = false;
  messDelete = 'Xóa thành công';
  isCreate = false;

  //# variabble of drawer \\
  @ViewChild('drawerRight') public DrawerRightComponent: DrawerComponent;
  @ViewChild('myTreeList') treelist: TreeListComponent;
  drawer: any;
  expandedRight: boolean = false;
  isautoCollapse: boolean = false;
  listStatus = new Subject<any>();
  listProvinceInVietName: DTOLSProvince[] = [];
  ListStatus: DTOStatus;

  // propUpdate = [
  //   'Code',
  //   'ParentID',
  //   'ParentCode',
  //   'LocationID',
  //   'LocationName',
  //   'Brieft',
  //   'Address',
  //   'Province',
  //   'ProvinceCode',
  //   'District',
  //   'DistrictCode',
  //   'Ward',
  //   'WardCode',
  //   'Remark',
  //   'StatusID',
  //   'StatusName',
  //   'ListChild',
  // ];

  //# variable of search-filter-group \\
  isFilterActive: boolean = true;

  //# variable of treelist \\
  loading: boolean = false;
  TreeListDto = new DTOLocation();
  // treeListData = new Subject<any>();
  treeListData: DTOLocation[] = [];
  treeListDataFind: DTOLocation[] = [];
  ItemSelectedPopup = new DTOLocation();




  //- filter reset
  ResetState: State = {
    filter: { filters: [], logic: 'or' },
    sort: [],
  };
  uploadEventHandlerCallback: Function


  //# Variable button DropListTool \\
  @ViewChild('District') public DistrictRef: DropDownListComponent;
  @ViewChild('Ward') public WardRef: DropDownListComponent;
  @ViewChild('ParentID') public ParentIDRef: DropDownListComponent;
  public animate: boolean = false;
  public popupClass: string = 'DropDownButton';
  OptionTool: any[] = [];



  defaultParent: DTOLocation = new DTOLocation({ Code: null, LocationName: 'Không lựa chọn' });
  currentParentID: DTOLocation = { ...this.defaultParent }


  //#region variable of address \\
  currentProvince = new DTOLSProvince();
  currentDistrict = new DTOLSDistrict();
  currentWard = new DTOLSWard();
  provinceList: DTOLSProvince[] = [];
  districtList: DTOLSDistrict[] = [];
  wardList: DTOLSWard[] = [];
  locationList: DTOLocation[] = [];

  filteredWardList: DTOLSWard[] = []
  filteredDistricList: DTOLSDistrict[] = []
  filteredProvinceList: DTOLSProvince[] = []



  //#endregion

  //#region variable FormGroup \\
  formData: FormGroup;
  formDataDefault = {
    Code: null,
    ParentID: null,
    ParentCode: '',
    LocationID: '',
    LocationName: 'Không lựa chọn',
    Brieft: '',
    Address: '',
    Province: null,
    ProvinceCode: '',
    District: null,
    DistrictCode: '',
    Ward: null,
    WardCode: '',
    Remark: '',
    StatusID: 0,
    StatusName: 'Đang soạn thảo',
    ListChild: [],
  };
  //#endregion
  //#region Start: Variable dialog \\
  opened: boolean = false;
  Location: DTOLocation;
  valueArrayLocation: DTOLocation[] = [];
  openedDiaStopped: boolean = false;


  // cache cho treelist
  private cache: any = new Map();
  //- filter mặc định 
  isNew = true
  isSent = true
  isStoped = false
  isApproved = true
  isReturn = false

  filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
  filterNew: FilterDescriptor = { field: 'StatusID', value: '0', operator: 'eq', ignoreCase: true }
  filterSent: FilterDescriptor = { field: 'StatusID', value: '1', operator: 'eq', ignoreCase: true }
  filterStoped: FilterDescriptor = { field: 'StatusID', value: '3', operator: 'eq', ignoreCase: true }
  filterReturn: FilterDescriptor = { field: 'StatusID', value: '4', operator: 'eq', ignoreCase: true }
  filterApprove: FilterDescriptor = { field: 'StatusID', value: '2', operator: 'eq', ignoreCase: true }

  searchData: any;
  treeListState: State = { filter: { filters: [], logic: 'and' }, sort: [] };


  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };




  //#endregion
  constructor(
    private organizationAPIService: OrganizationAPIService,
    private ecomAPIService: EcomAPIService,
    public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    private layoutAPI: LayoutAPIService,
    public apiService: MarBannerAPIService,
  ) {
    this.formData = new FormGroup({
      Code: new FormControl(0),
      ParentID: new FormControl(null),
      ParentCode: new FormControl(''),
      LocationID: new FormControl(''),
      LocationName: new FormControl(''),
      Brieft: new FormControl(''),
      Address: new FormControl(''),
      Province: new FormControl(null),
      ProvinceCode: new FormControl(''),
      District: new FormControl(null),
      DistrictCode: new FormControl(''),
      Ward: new FormControl(null),
      WardCode: new FormControl(''),
      Remark: new FormControl(''),
      StatusID: new FormControl(0),
      StatusName: new FormControl('Đang soạn thảo'),
      ListChild: new FormControl([]),
    });
  }


  ngOnInit(): void {
    let that = this;
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    this.changePermission_sst = this.menuService
      .changePermission()
      .subscribe((res: DTOPermission) => {
        if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
          that.justLoaded = false;
          that.actionPerm = distinct(res.ActionPermission, 'ActionType');

          that.isToanQuyen =
            that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
          that.isAllowedToCreate =
            that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
          that.isAllowedToVerify =
            that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
          that.isView =
            that.actionPerm.findIndex((s) => s.ActionType == 6) > -1 || false;

          // this.isToanQuyen = false
          // this.isAllowedToCreate = true
          // this.isAllowedToVerify = true

          that.dataPerm = distinct(res.DataPermission, 'Warehouse');
        }
      });
      
      let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
        if(Ps_UtilObjectService.hasValue(res)){
          this.getApi();
        }
      })
    this.arrUnsubscribe.push(this.changePermission_sst, permissionAPI);

    // console.log(this.changePermission_sst);
    //disable trên form
    // this.formData.get("ParentID").disable(); 
  }



  //--------------------------
  Compeonentdropdownlisttree: any;
  ngAfterViewInit() {
    var that = this;
    $(document).ready(function () {
      $('.k-grid-content').scroll(function () {
        if (that.Compeonentdropdownlisttree != undefined) {
          that.Compeonentdropdownlisttree.toggle(false);
        }
      })
    })
  }

  //----------------------------

  cssPositionPopup() {
    var that = this;
    $(document).ready(function () {
      const pageHeight = $('.app-hri005-location-list').height();
      const popupHeight = $('.k-animation-container:has(.fmDropdown)').height();
      const positionBtn = $('.selectedPopup .k-button').offset().top;
      if (pageHeight - positionBtn < popupHeight) {
        if (popupHeight > 120) {
          $('.app-hri005-location-list .treelist-tool .k-animation-container').css({
            left: 'auto',
            top: positionBtn - 92,
            right: 47
          });
        } else {
          $('.app-hri005-location-list .treelist-tool .k-animation-container').css({
            left: 'auto',
            top: positionBtn - 61,
            right: 47
          });
        }
      } else if (pageHeight - positionBtn >= popupHeight) {
        $('.app-hri005-location-list .treelist-tool .k-animation-container').css({
          right: 47,
          left: 'auto',
          top: positionBtn
        });

      }
    })
  }
  //filterList
  handleFilterProvince(value) {
    this.filteredProvinceList = this.provinceList.filter(
      (s) => s.VNProvince.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
  }
  handleFilterDistric(value) {
    this.filteredDistricList = this.districtList.filter(
      (s) => s.VNDistrict.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  handleFilterWard(value) {
    this.filteredWardList = this.wardList.filter(
      (s) => s.VNWard.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }


  public isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    var statusID: number
    if (this.isCreate) {
      if (Ps_UtilObjectService.hasValue(this.TreeListDto.StatusID)) {
        statusID = this.TreeListDto.StatusID
      } else {
        statusID = 0
      }
    } else {
      if (Ps_UtilObjectService.hasValue(this.Location.StatusID)) {
        statusID = this.Location.StatusID
      }
    }

    var statusParent = new DTOLocation();
    var parentID = this.formData.value.ParentID
    if (Ps_UtilObjectService.hasValue(this.Location) && Ps_UtilObjectService.hasListValue(this.locationList) && Ps_UtilObjectService.hasValue(this.Location.ParentID)) {
      // if (Ps_UtilObjectService.hasValue(this.Location.ParentID)) {
        this.locationList.find(s => {
          if (s.Code == this.Location.ParentID) {
            statusParent = s
          }
          else {
            if (Ps_UtilObjectService.hasListValue(s.ListChild)) {
              s.ListChild.find(c => {
                if (c.Code == this.Location.ParentID) {
                  statusParent = c
                }
              })
            }
          }
        })
      // }
    }


    switch (itemArgs.dataItem.OrderBy) {
      case 0://soạn
        if (statusID > 0)
          return true
        break;
      case 1://gửi
        if ((statusID != 0 && statusID != 4) || (!this.isAllowedToCreate && !this.isToanQuyen) || (statusParent.StatusID != 2 && parentID != null))
          return true
        break;
      case 2://duyệt
        if ((statusID != 3 && statusID != 2 && statusID != 1) || (!this.isAllowedToVerify && !this.isToanQuyen) || (statusParent.StatusID != 2 && parentID != null))
          return true
        break;
      case 3://ngưng
        if ((statusID != 2 && statusID != 3) || (!this.isAllowedToVerify && !this.isToanQuyen))
          return true
        break;
      case 4://trả
        if ((statusID != 3 && statusID != 4 && statusID != 1) || (!this.isAllowedToVerify && !this.isToanQuyen) || (statusParent.StatusID != 2 && this.formData.value.ParentID != null))
          return true
        break;
    }

    return false;

    // if ((this.isAllowedToCreate || this.isToanQuyen) && (statusID === 0 || statusID === 4)) return itemArgs.dataItem.OrderBy !== 1 && itemArgs.dataItem.OrderBy !== statusID
    // if ((this.isAllowedToVerify || this.isToanQuyen) && (statusID === 1 || statusID === 3)) return itemArgs.dataItem.OrderBy !== 2 && itemArgs.dataItem.OrderBy !== 4 && itemArgs.dataItem.OrderBy !== statusID
    // if ((this.isAllowedToVerify || this.isToanQuyen) && statusID === 2) return itemArgs.dataItem.OrderBy !== 3 && itemArgs.dataItem.OrderBy !== statusID
    // return false;
  }





  //# Handle of header 2 \\
  //- handle xử lý tìm kiếm, filter địa điểm
  tempHandleSearch: any;
  handleSearch(e: any) {
    if (Ps_UtilObjectService.hasValueString(e)) {
      this.filterSearchBox.filters = e.filters;
      this.searchData = e.filters;
      this.selectedTreeList = [];
      this.loadData()
    }
  }

  setFilter() {
    this.treeListState.filter.filters = []
    this.filterStatus.filters = []

    if (this.isNew) {
      this.filterStatus.filters.push(this.filterNew)
      this.filterStatus.filters.push(this.filterReturn)
    }
    if (this.isSent) this.filterStatus.filters.push(this.filterSent)
    if (this.isApproved) this.filterStatus.filters.push(this.filterApprove)
    if (this.isStoped) this.filterStatus.filters.push(this.filterStoped)
    if (this.filterStatus.filters.length > 0) this.treeListState.filter.filters.push(this.filterStatus)
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.searchData[0].value != '') {
        this.treeListState.filter.filters.push(this.filterSearchBox)
      }
    }
  }

  //- handle reset
  collapsedIds: any[];
  resetFilter() {
    if (Ps_UtilObjectService.hasListValue(this.collapsedIds)) {
      for (const id of this.collapsedIds) {
        this.treelist.expand(id);
      }
    }
    this.isNew = true
    this.isSent = true
    this.isStoped = false
    this.isApproved = true
    this.selectedTreeList = [];
    this.treeListState.filter.filters = []
    this.TreeListDto = new DTOLocation();

    this.loadData();
  }

  // checkbox thay đổi thì gọi hàm này
  filterChangeCheckbox(event, strCheck: string) {
    if (strCheck === 'isNew') this.filterNew = event
    else if (strCheck === 'isSent') this.filterSent = event
    else if (strCheck === 'isApproved') this.filterApprove = event
    else if (strCheck === 'isStoped') this.filterStoped = event
    this.loadData()
  }

  //load dữ liệu vào treelist 
  loadData() {
    this.cache.clear();
    this.setFilter()
    this.treeListDataFind = this.fetchChildren()
  }

  // Handle of treelist \\
  //- handle đổ children cho treelist
  public fetchChildren = (parent?: DTOLocation): DTOLocation[] => {
    if (this.cache.get(parent)) {
      return this.cache.get(parent);
    }

    let result;
    const items = parent ? parent.ListChild : this.treeListData;
    if (this.treeListState.filter && this.treeListState.filter.filters.length && items) {
      result = filterBy(items, {
        logic: "or",
        filters: [
          this.treeListState.filter,
          {
            operator: (item: any) => {
              if (item.ListChild) {
                const children = this.fetchChildren(item);
                return children && children.length;
              }
            },
          },
        ],
      });
    } else {
      result = items;
    }

    this.cache.set(parent, result);

    return result;
  };

  //- handle kiểm tra item có children không của treelist
  hasChildren = (item: any): boolean => {
    if (item.hasOwnProperty('ListChild')) {
      const children = this.fetchChildren(item);
      return children && item.ListChild.length > 0;
      // return item.ListChilds.length > 0;
    }
  };

  // setting treelist
  public settingsTreeList: SelectableSettings = {
    enabled: true,
    mode: 'row',
    multiple: false,
    drag: true,
  };

  selectedTreeList: any[] = [];

  //- Handle xử lý item được chọn của treelist
  getValueSelectedTreeList(e: any): void {
    // console.log('Get item click item tree', e.items[0].dataItem);
    if (e.action == 'select') {
      this.formData.patchValue(e.items[0].dataItem);
      this.TreeListDto = e.items[0].dataItem;
    } else if (e.action == 'remove') {
      this.formData.patchValue(this.defaultParent);
      this.TreeListDto = new DTOLocation();
    }
  }

  //# Close dialog
  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeleteLocation(this.valueArrayLocation);
      // console.log('valueArrayLocation', this.valueArrayLocation);
      this.APIGetListLocationTree();
      this.opened = false;
    } else {
      this.opened = false;
    }
  }

  public closeDialog(status: string): void {
    this.opened = false;
  }

  public closeDialogStopped(status: string): void {
    this.formData.patchValue({
      StatusID: this.Location.StatusID,
      StatusName: this.Location.StatusName,
    });
    this.openedDiaStopped = false;
  }

  handleActionStopped(status) {
    this.formData.patchValue({
      StatusID: this.tempStatusID,
      StatusName: this.ListStatus[this.tempStatusID].StatusName,
    });
    this.openedDiaStopped = false;
  }

  // End: dialog \\

  //# DropListTool \\
  // tìm cấp cha của item được chọn
  SearchItemParent = (array: DTOLocation[], ParentID: number) => {
    for (const item of array) {
      if (item.Code === ParentID) {
        return item;
      }
      if (item.ListChild && item.ListChild.length > 0) {
        const result = this.SearchItemParent(item.ListChild, ParentID);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  //- handle xử lý khi mở drawer
  openDropDownList(data: DTOLocation) {
    this.cssPositionPopup();
    this.OptionTool = []
    let ObjectParent: DTOLocation

    if (Ps_UtilObjectService.hasValue(data.ParentID)) {
      ObjectParent = this.SearchItemParent(this.treeListData, data.ParentID)
    }

    if (this.isAllowedToCreate || this.isToanQuyen || this.isAllowedToVerify) {
      if (((data.StatusID == 0 || data.StatusID == 4) && (this.isAllowedToCreate || this.isToanQuyen)) ||
        ((data.StatusID == 1 && (this.isToanQuyen || this.isAllowedToVerify)))) {
        this.OptionTool.push({ id: 2, text: 'Chỉnh sửa', icon: 'k-i-pencil', });
      }
      else {
        this.OptionTool.push({ id: 4, text: 'Xem chi tiết', icon: 'k-i-eye', });
      }
    } else {
      this.OptionTool.push({ id: 4, text: 'Xem chi tiết', icon: 'k-i-eye', });
    }

    if (this.isAllowedToCreate || this.isToanQuyen) {

      this.OptionTool.push(
        { id: 0, text: 'Thêm điểm làm việc', imageUrl: 'assets/img/icon/icon_site_map.svg', },
        { id: 1, text: 'Thêm điểm làm việc con', imageUrl: 'assets/img/icon/icon_site_map.svg', }
      )

      //không có cấp cha
      if ((!Ps_UtilObjectService.hasValue(ObjectParent))) {
        if ((data.StatusID == 0 || data.StatusID == 4)) {
          this.OptionTool.push({ id: 5, text: 'Gửi duyệt', icon: 'k-i-redo' });
          if (data.StatusID == 0 && !Ps_UtilObjectService.hasListValue(data.ListChild)) {
            this.OptionTool.push({ id: 3, text: 'Xóa', icon: 'k-i-trash' });
          }
        }
      }

      //có cấp cha và được duyệt
      else if ((Ps_UtilObjectService.hasValue(ObjectParent))) {
        if ((data.StatusID == 0 || data.StatusID == 4) && (ObjectParent.StatusID == 2)) {
          this.OptionTool.push({ id: 5, text: 'Gửi duyệt', icon: 'k-i-redo' });
        }
        if (data.StatusID == 0 && !Ps_UtilObjectService.hasListValue(data.ListChild)) {
          this.OptionTool.push({ id: 3, text: 'Xóa', icon: 'k-i-trash' });
        }
      }
    }

    if (this.isToanQuyen || this.isAllowedToVerify) {

      //không có cấp cha
      if (!Ps_UtilObjectService.hasValue(ObjectParent)) {
        this.onDisplayStatus(data)
      }

      //có cấp cha và được duyệt
      else if ((Ps_UtilObjectService.hasValue(ObjectParent) && (ObjectParent.StatusID == 2))) {
        this.onDisplayStatus(data)
      }
    }

    this.ItemSelectedPopup = data;
    this.selectedTreeList = [{ itemKey: data.Code }];
  }

  // hiện nút chuyển tình trạng
  onDisplayStatus(Item: DTOLocation) {
    if (Item.StatusID == 1 || Item.StatusID == 3) {
      this.OptionTool.push(
        { id: 5, text: 'Phê duyệt', icon: 'k-i-check-outline' },
        { id: 5, text: 'Trả về', icon: 'k-i-undo' }
      );
    }
    if (Item.StatusID == 2) {
      this.OptionTool.push({ id: 5, text: 'Ngưng áp dụng', icon: 'k-i-minus-outline' });
    }
  }

  // Hàm đệ qui để tìm statusID của item cha 
  findParentStatusID(childItem, data) {
    const parentId = childItem.ParentID;
    let parentStatusID = null;

    const findStatusID = (item, parentId) => {
      if (item.Code === parentId) {
        return item.StatusID;
      } else if (item.ListChild) {
        for (const child of item.ListChild) {
          const statusID = findStatusID(child, parentId);
          if (statusID !== null) {
            return statusID;
          }
        }
      }
      return null;
    };

    for (const item of data) {
      const statusID = findStatusID(item, parentId);
      if (statusID !== null) {
        parentStatusID = statusID;
        break;
      }
    }
    return parentStatusID;
  }

  closeDropDownList(value: DTOLocation) {
    if (this.ItemSelectedPopup.Code == value.Code) {
      this.ItemSelectedPopup = new DTOLocation();
    }
  }

  //# handle of address và droplist \\
  //- handle xử lý slectionChange của droplist bên phải

  defaultCurrentParentID = {
    Code: 0,
    ParentID: null,
    ParentCode: '',
    LocationID: '',
    LocationName: '',
    Brieft: '',
    Address: '',
    Province: null,
    ProvinceCode: '',
    District: null,
    DistrictCode: '',
    Ward: null,
    WardCode: '',
    Remark: '',
    IsTree: false,
    StatusID: 0,
    StatusName: 'Đang soạn thảo',
    ListChild: [],
  };

  tempStatusID: number;

  selectionDropdownChange(e: any, dropdownName: string): void {
    // console.log('Dropdown change: ', e);
    switch (dropdownName) {
      case 'ParentID':
        this.currentParentID = e
        this.formData.patchValue({
          ParentID: e.Code,
          ParentCode: e.LocationName,
          ListChild: null
        });
        break;

      case 'Province':
        if (Ps_UtilObjectService.hasValue(e.Code)) {
          this.APIGetAllDistrictInProvince(e.Code);
        }
        this.notSelectedWard = true;
        this.formData.patchValue({
          ProvinceCode: e.VNProvince,
        });
        this.notSelectedDistrict = false;
        this.DistrictRef.reset();
        this.WardRef.reset()
        break;

      case 'District':
        this.APIGetAllWardInDistrict(e.Code);
        this.formData.patchValue({
          DistrictCode: e.VNDistrict,
        });
        this.notSelectedWard = false;
        this.WardRef.reset()
        break;

      case 'Ward':
        this.formData.patchValue({
          WardCode: e.VNWard,
        });
        break;

      case 'Status':
        if (e == 3) {
          this.tempStatusID = e;
          this.openedDiaStopped = true;
        } else {
          this.formData.patchValue({
            StatusID: e,
            StatusName: this.ListStatus[e].StatusName,
          });
        }
        break;

      default:
        break;
    }
    // if (dropdownName == 'ParentID') {
    //   this.currentParentID = e
    //   this.formData.patchValue({
    //     ParentID: e.Code,
    //     ParentCode: e.LocationName,
    //     ListChild: null
    //   });

    // } else if (dropdownName == 'Province') {
    //   if (Ps_UtilObjectService.hasValue(e.Code)) {
    //     this.APIGetAllDistrictInProvince(e.Code);
    //   }
    //   this.notSelectedWard = true;
    //   this.formData.patchValue({
    //     ProvinceCode: e.VNProvince,
    //   });
    //   this.notSelectedDistrict = false;
    //   this.DistrictRef.reset();
    //   this.WardRef.reset()
    //   // console.log('defaultItem', this.DistrictRef.defaultItem);
    // } else if (dropdownName == 'District') {
    //   this.APIGetAllWardInDistrict(e.Code);
    //   this.formData.patchValue({
    //     DistrictCode: e.VNDistrict,
    //   });
    //   this.notSelectedWard = false;
    //   this.WardRef.reset()
    // } else if (dropdownName == 'Ward') {
    //   // console.log('Ward', e);
    //   this.formData.patchValue({
    //     WardCode: e.VNWard,
    //   });
    // } else if (dropdownName == 'Status') {
    //   if (e == 3) {
    //     this.tempStatusID = e;
    //     this.openedDiaStopped = true;
    //   } else {
    //     this.formData.patchValue({
    //       StatusID: e,
    //       StatusName: this.ListStatus[e].StatusName,
    //     });
    //   }
    // }
  }

  //# Handle of drawer \\
  //- handle xử lý các hành động create/update/delete/...
  disabledField(data) {
    if (Ps_UtilObjectService.hasValue(data.value.Province)) {
      this.notSelectedDistrict = false;
      this.APIGetAllDistrictInProvince(data.value.Province);
    } else {
      this.notSelectedDistrict = true;
    }

    if (Ps_UtilObjectService.hasValue(data.value.District)) {
      this.APIGetAllWardInDistrict(data.value.District);
      this.notSelectedWard = false;
    } else {
      this.notSelectedWard = true;
    }
  }

  HandleCreateLocation(action: number, data?: any) {
    this.isCreate = true;
    if (action == 0) {
      this.isAction = 0;
      this.formData.get('ListChild').enable();
      // console.log('acction 0 for HanleCreate: ', this.formData.value);
      if (Ps_UtilObjectService.hasValue(data)) {
        this.defaultCurrentParentID.ParentID = data.ParentID;
        this.defaultCurrentParentID.DistrictCode = data.DistrictCode;
        this.defaultCurrentParentID.WardCode = data.WardCode;
        this.defaultCurrentParentID.ProvinceCode = data.ProvinceCode;
        this.currentParentID = data
      }
      else if (Ps_UtilObjectService.hasValue(data) && data.Code == 0) {
        this.currentParentID = this.defaultParent
      }
      // this.currentParentID = this.defaultCurrentParentID;
      // this.TreeListDto = this.defaultCurrentParentID
      this.formData.patchValue(this.defaultCurrentParentID);
      this.APIGetListLocation(this.formData.value);
      this.DrawerRightComponent.toggle();
      this.isSeen = false;
      this.disabledField(this.formData)
      // console.log(this.formData.value);
    } else if (action == 1) {
      this.isAction = 1;
      this.formData.get('ListChild').enable();
      if (Ps_UtilObjectService.hasValue(data)) {
        this.formData.patchValue({
          Code: 0,
          ParentID: data.Code,
          ParentCode: data.LocationName,
          LocationID: '',
          LocationName: '',
          Brieft: '',
          Address: '',
          Province: null,
          ProvinceCode: '',
          District: null,
          DistrictCode: '',
          Ward: null,
          WardCode: '',
          Remark: '',
          StatusID: 0,
          StatusName: 'Đang soạn thảo',
          ListChild: [],
        });
      }
      if (Ps_UtilObjectService.hasValue(data) && data.Code == 0) {
        this.formData.patchValue(this.defaultCurrentParentID)
        this.currentParentID = this.defaultCurrentParentID
      }
      // this.TreeListDto = this.defaultCurrentParentID
      this.APIGetListLocation(this.formData.value);
      this.DrawerRightComponent.toggle();
      this.isSeen = false;
      this.disabledField(this.formData)
      // console.log(this.formData.value);
    }
  }



  currentAction0: any;
  currentAction1: any;
  currentAction2: any;
  currentAction3: any;
  HandleOpenDrawer(action: any, data?: DTOLocation) {
    this.Location = data
    if (action.id == 0) {
      this.isSeen = false;
      this.isAction = 0;
      this.isCreate = true
      this.formData.get('ListChild').enable();
      if (Ps_UtilObjectService.hasValue(data)) {
        this.currentParentID = data
        this.defaultCurrentParentID.ParentID = data.ParentID;
        this.currentParentID = this.defaultCurrentParentID;
      }
      this.formData.patchValue(this.defaultCurrentParentID);
      this.APIGetListLocation(this.formData.value);
      this.DrawerRightComponent.toggle();
      this.disabledField(this.formData);
      // console.log(this.formData.value);
    } else if (action.id == 1) {
      this.isCreate = true
      this.isSeen = false;
      this.isAction = 1;
      this.formData.get('ListChild').enable();
      if (Ps_UtilObjectService.hasValue(data)) {
        this.currentParentID = data
        this.formData.patchValue({
          Code: 0,
          ParentID: data.Code,
          ParentCode: data.LocationName,
          LocationID: '',
          LocationName: '',
          Brieft: '',
          Address: '',
          Province: null,
          ProvinceCode: '',
          District: null,
          DistrictCode: '',
          Ward: null,
          WardCode: '',
          Remark: '',
          StatusID: 0,
          StatusName: 'Đang soạn thảo',
          ListChild: [],
        });

        // this.currentParentID = this.formData.value;

        // console.log('Gia tri 1 cua opend:', this.formData.value);
      }
      this.APIGetListLocation(this.formData.value);
      // console.log('acction 1 for HandleOpenDrawer: ', this.formData.value);
      this.DrawerRightComponent.toggle();
      this.disabledField(this.formData)
      // console.log(this.formData.value);
    } else if (action.id == 2 || action.id == 4) {
      this.currentParentID = data
      if (action.id == 4) {
        this.isSeen = true;
        this.formData.get('StatusID').enable();
        this.formData.get('ListChild').disable();
      } else {
        this.isSeen = false;
        this.formData.get('ListChild').enable();
      }
      this.isAction = 2;
      if (Ps_UtilObjectService.hasValue(data)) {
        // this.currentParentID = data
        this.formData.patchValue(data)
      }
      this.APIGetListLocation(this.formData.value);
      this.currentAction2 = this.formData.value;
      this.DrawerRightComponent.toggle();
      this.disabledField(this.formData)
    } else if (action.id == 3) {
      this.isSeen = false;
      this.valueArrayLocation = [];
      this.Location = data;
      this.valueArrayLocation.push(data);
      this.opened = true;
    } else if (action.id == 5) {

      //  chuyển trạng thái trong dropdownbutton
      let statusData = data
      if (action.text == "Gửi duyệt") {
        statusData.StatusID = 1
        statusData.StatusName = "Gởi duyệt"
      }
      if (action.text == "Phê duyệt") {
        statusData.StatusID = 2
        statusData.StatusName = 'Duyệt áp dụng'
      }
      if (action.text == "Ngưng áp dụng") {
        statusData.StatusID = 3
        statusData.StatusName = 'Ngưng áp dụng'
      }
      if (action.text == "Trả về") {
        statusData.StatusID = 4
        statusData.StatusName = 'Trả về'
      }
      this.APIUpdateLocation(statusData)

    }
    // ovelay đóng drawer
    if (action.id == 4) {
      this.isautoCollapse = true
    } else {
      this.isautoCollapse = false
    }
  }

  handleFilterGroupList(value) {
    if (Ps_UtilObjectService.hasListValue(this.locationList)) {
      this.locationList.filter(
        (s) => s.LocationName.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    }
  }

  //#region import và export
  importExcel() {
    this.layoutService.setImportDialog(true)
  }

  APIDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "LocationTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let a = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res);
        this.layoutService.onSuccess(`${ctx} thành công`);
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
    this.arrUnsubscribe.push(a);
  }

  uploadEventHandler(e: File) {
    this.APIImportExcelLocation(e);
  }
  APIImportExcelLocation(file) {
    this.loading = true
    var ctx = "Import Excel"

    let ImportExcelLocation = this.organizationAPIService.ImportExcelLocation(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListLocationTree();
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
    this.arrUnsubscribe.push(ImportExcelLocation);
  }
  //#endregion

  //-xử lý việc bấm nút cập nhật ở trên drawer
  onAction() {
    if (
      Ps_UtilObjectService.hasValueString(this.formData.controls['LocationID'].value) &&
      Ps_UtilObjectService.hasValueString(this.formData.controls['LocationName'].value)
    ) {
      switch (this.isAction) {
        case 0:
          if (this.currentParentID.Code != null) {
            this.formData.value.ParentID = this.currentParentID.Code;
          }
          this.currentAction0 = this.formData.value;
          // console.log('currentAction0 for onAction: ', this.currentAction0);
          this.APIUpdateLocation(this.currentAction0);
          this.DrawerRightComponent.toggle();
          break;
        case 1:
          if (this.currentParentID.Code != null) {
            this.formData.value.ParentID = this.currentParentID.Code;
          }
          this.currentAction1 = this.formData.value;
          // console.log('currentAction1 for onAction: ', this.currentAction1);
          this.APIUpdateLocation(this.currentAction1);
          this.DrawerRightComponent.toggle();
          break;
        case 2:
          this.currentAction2 = this.formData.value;
          // console.log('currentAction2 for onAction: ', this.currentAction2);
          this.APIUpdateLocation(this.currentAction2);
          this.isSeen = false;
          this.DrawerRightComponent.toggle();
          break;
        case 3:
          this.currentAction3 = this.formData.value;
          this.valueArrayLocation.push(this.currentAction3);
          this.APIDeleteLocation(this.valueArrayLocation);
          // console.log('currentAction3 for onAction: ', this.currentAction3);
          break;
        default:
          break;
      }
    } else {
      //-  Xử lý trường hợp nếu người dùng không nhập mã và tên của location được bind trên drawer.
      this.layoutService.onError('Vui lòng nhập mã và tên điểm làm việc!');
      this.isSeen = false;
    }
  }

  closeDrawer() {
    this.DrawerRightComponent.toggle();
    this.isSeen = false;
    this.isCreate = false;
  }



  //# AIP \\
  //-- Gọi các API cần khỏi tạo ban đầu
  getApi() {
    this.APIGetListLocationTree();
    // this.APIGetListLocationTree(this.treeListState);
    this.APIGetAllProvinceInVietName();
    this.APIGetListStatus(4);
  }


  //- Lấy danh sách location
  APIGetListLocationTree() {
    this.loading = true;
    this.GetListLocationTree_sst = this.organizationAPIService
      .GetListLocationTree({})
      .subscribe(
        (res) => {
          // if (res.ErrorString != null) {
          //   this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách điểm làm việc: ${res.ErrorString}`);
          // }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.treeListData = res.ObjectReturn;
            // this.treeListData.next(res.ObjectReturn);
            this.loadData()
          } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách điểm làm việc: ${res.ErrorString}`);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          // console.log(error);
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách điểm làm việc: ${error}`);
        }
      );

    this.arrUnsubscribe.push(this.GetListLocationTree_sst);
  }

  TreeSearch(locationList: DTOLocation[], parentID: number): DTOLocation | null {
    if (!Ps_UtilObjectService.hasListValue(locationList)) {
      return null;
    }
    for (const location of locationList) {
      if (location.Code === parentID) {
        return location;
      } else if (Ps_UtilObjectService.hasListValue(location.ListChild)) {
        const foundLocation = this.TreeSearch(location.ListChild, parentID);
        if (Ps_UtilObjectService.hasValue(foundLocation)) {
          return foundLocation;
        }
      }
    }
    return null;
  }


  //- Lấy danh sách trực thuộc
  APIGetListLocation(valueLocation: DTOLocation) {
    this.loading = true;
    valueLocation.IsTree = true
    this.GetListLocation_sst = this.organizationAPIService
      .GetListLocation(valueLocation)
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trực thuộc: ${res.ErrorString}`);
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasListValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.locationList = res.ObjectReturn;
            this.locationList.unshift(this.defaultParent)

            if (Ps_UtilObjectService.hasValue(this.formData.value)) {
              const result = this.TreeSearch(res.ObjectReturn, this.formData.value.ParentID);
              if (Ps_UtilObjectService.hasValue(result)) {
                this.currentParentID = result;
              }
            }
          }

          this.loading = false;
        },
        (error) => {
          this.loading = false;
          // console.log(error);
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trực thuộc: ${error}`);
        }
      );
    this.arrUnsubscribe.push(this.GetListLocation_sst);
  }


  //- Lấy danh sách Status
  APIGetListStatus(statusID: number) {
    this.loading = true;
    this.GetListStatus_sst = this.layoutAPI.GetListStatus(statusID).subscribe(
      (res) => {
        if (res.ErrorString != null) {
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${res.ErrorString}`);
        } else {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.ListStatus = res.ObjectReturn;
          }
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        // console.log(error);
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${error}`);
      }
    );
    this.arrUnsubscribe.push(this.GetListStatus_sst);
  }

  //- Update điểm làm việc
  APIUpdateLocation(data: DTOLocation) {
    const ctx = data.Code == 0 ? "Thêm mới" : "Cập nhật";
    this.loading = true;
    this.UpdateLocation_sst = this.organizationAPIService
      .UpdateLocation(data)
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx} điểm làm việc: ${res.ErrorString}`);
            this.APIGetListLocationTree();
          }
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.layoutService.onSuccess(`${ctx} thành công`);
            if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
              this.APIGetListLocationTree();
            }
          }
          this.isCreate = false;
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx} điểm làm việc: ${error}`);
          this.APIGetListLocationTree();
        }
      );
    this.arrUnsubscribe.push(this.UpdateLocation_sst);
  }

  //- Delete điểm làm việc
  APIDeleteLocation(arr: DTOLocation[]) {
    this.loading = true;
    this.DeleteLocation_sst = this.organizationAPIService
      .DeleteLocation(arr)
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi xóa điểm làm việc: ${res.ErrorString}`);
            this.APIGetListLocationTree();
          } else {
            this.layoutService.onSuccess(`${this.messDelete}`);
            if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
              this.APIGetListLocationTree();
            }
          }
          this.loading = false;
        },
        (error) => {
          this.layoutService.onError(`Đã xảy ra lỗi khi xóa điểm làm việc: ${error}`);
          this.APIGetListLocationTree();
        }
      );
    this.loading = false;
    this.arrUnsubscribe.push(this.DeleteLocation_sst);
  }

  // API Address
  //- Lấy danh sách Tỉnh thành
  APIGetAllProvinceInVietName() {
    this.loading = true;
    this.GetAllProvinceInVietName_sst = this.ecomAPIService
      .GetAllProvinceInVietName()
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tỉnh thành: ${res.ErrorString}`);
          }
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn)) {
            this.provinceList = res.ObjectReturn;
            this.filteredProvinceList = res.ObjectReturn
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tỉnh thành: ${error}`);
        }
      );
    this.arrUnsubscribe.push(this.GetAllProvinceInVietName_sst);
  }

  //- Lấy danh sách Quận/huyện
  APIGetAllDistrictInProvince(province: number) {
    this.loading = true;
    this.GetAllDistrictInProvince_sst = this.ecomAPIService
      .GetAllDistrictInProvince(province)
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Quận/huyện: ${res.ErrorString}`);
          }
          if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
            this.districtList = res.ObjectReturn;
            this.filteredDistricList = res.ObjectReturn
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Quận/huyện: ${error}`);
        }
      );
    this.arrUnsubscribe.push(this.GetAllDistrictInProvince_sst);
  }

  //- Lấy danh sách Phường/Xã
  APIGetAllWardInDistrict(district: number) {
    this.loading = true;

    this.GetAllWardInDistrict_sst = this.ecomAPIService
      .GetAllWardInDistrict(district)
      .subscribe(
        (res) => {
          if (res.ErrorString != null) {
            this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách Phường/Xã: ${res.ErrorString}`);
          }
          if (Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
            this.wardList = res.ObjectReturn;
            this.filteredWardList = res.ObjectReturn
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.layoutService.onError(`Đã xảy ra lỗi lấy danh sách Phường/Xã: ${error}`);
        }
      );
    this.arrUnsubscribe.push(this.GetAllWardInDistrict_sst);
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((s) => {
      s?.unsubscribe();
    });
  }
}