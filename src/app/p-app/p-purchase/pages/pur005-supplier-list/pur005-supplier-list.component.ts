import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ModuleDataAdmin } from 'src/app/p-app/p-layout/p-sitemaps/menu.data-admin';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOSupplier } from '../../shared/dto/DTOSupplier';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct, filterBy } from '@progress/kendo-data-query';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as $ from 'jquery';
import { PurSupplierApiServiceService } from '../../shared/services/pur-supplier-api.service.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOPartner } from '../../shared/dto/DTOPartner';
import { ConfigEnterpriceApiService } from 'src/app/p-app/p-config/shared/services/config-enterprice-api.service';
import { formatDate } from '@angular/common';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';

@Component({
  selector: 'app-pur005-supplier-list',
  templateUrl: './pur005-supplier-list.component.html',
  styleUrls: ['./pur005-supplier-list.component.scss']
})
export class Pur005SupplierListComponent implements OnInit, OnDestroy{

  @ViewChildren('anchor') anchors;
  @ViewChild('rowMoreActionPopup') rowMoreActionPopup;


  // boolean
  danghoptac_checked: boolean = true
  ngunghoptac_checked: boolean = false
  opened: boolean = false
  loading: boolean = false
  popupShow = false;

  // string
  filterDate: Date 
  filterDateString: string 
  currentAnchorIndex: number = -1


  
  // permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []

  //  Subscription
  Unsubscribe = new Subject<void>();

  // list
  ListFilter = [
    {text: "từ" , value: 1},
    {text: "trước" , value: 2}
  ]
  currentFilterValue: {text: string , value: number}

  treeListSupplier: DTOSupplier[] = [];
  treeListSupplierFilter: DTOSupplier[] = [];
  OptionTool = []

  treeListPartner: DTOPartner[] = [];
  treeListPartnerData: DTOPartner[] = [];
  treeListPartnerFilter: DTOPartner[] = [];


  // object
  private cache: any = new Map();
  private cachePopup: any = new Map();
  ItemSelectedPopup = new DTOSupplier();
  ItemSelected = new DTOSupplier();
  Compeonentdropdownlisttree: any;


  // filter
  treeListSupplierState: State = { filter: { filters: [], logic: 'and' }, sort: [] };
  filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
  filterSearchBox: CompositeFilterDescriptor = { logic: 'or', filters: [],};
  filterDangHopTac: FilterDescriptor = { field: 'StatusID', value: '0', operator: 'eq', ignoreCase: true }
  filterNgungHopTac: FilterDescriptor = { field: 'StatusID', value: '1', operator: 'eq', ignoreCase: true }
  filterTu: FilterDescriptor = { field: 'LastPO', value: '0', operator: 'gte', ignoreCase: true }
  filterTruoc: FilterDescriptor = { field: 'LastPO', value: '1', operator: 'lte', ignoreCase: true }
  searchData: any;
  searchDataPopup: any

  // 
  treeListPartnerState: State = { filter: { filters: [], logic: 'and' }, sort: [] };
  filterSearchBoxPopup: CompositeFilterDescriptor = { logic: 'or', filters: [],};


  constructor( 
    private menuService: PS_HelperMenuService,
    public apiService: PurSupplierApiServiceService,
    public layoutService: LayoutService,    
    public enterServiceAPI: ConfigEnterpriceApiService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    let that = this

    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        this.currentFilterValue = this.ListFilter[0]
        // this.APIGetListSupplierTree()
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListSupplierTree();
      }
    })
  }
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

  // -----------API -----------//
  APIGetListSupplierTree(){
    this.loading = true

    this.apiService.GetListSupplierTree().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.treeListSupplier = res.ObjectReturn
        this.loadData()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung cấp nội địa: ${res.ErrorString}`)
      }
      this.loading = false
    }, (error) =>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách nhà cung cấp nội địa: ${error} `)
    })
  }

  APIGetListPartnerTree(){
    this.loading = true

    this.enterServiceAPI.GetListPartnerTree().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        this.treeListPartner = res.ObjectReturn
        this.filterList()
        this.loadDataPopup()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đối tác: ${res.ErrorString} `)
      }
      this.loading = false
    }, (error) =>{
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đối tác: ${error} `)
    })
  }

  // -----------End API -----------//

  // -----------Header 1 -----------//
  loadPage(){
    this.danghoptac_checked = true
    this.ngunghoptac_checked = false
    this.filterDate = null
    this.filterDateString = ""
    this.APIGetListSupplierTree()
  }

  selectedBtnChange(e, strCheck: string){
    this[strCheck] = e
    this.loadData()
  }


  onOpenDialog(){
    this.opened = true
    this.APIGetListPartnerTree()
  }
  // -----------End header 1 -----------//


  // -----------Header 2 -----------//

  handleSearch(event){
    this.filterSearchBox.filters = []
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterSearchBox.filters = event.filters;
      this.searchData = event.filters;
      this.loadData()
    }
  }

  resetFilter(){
    this.danghoptac_checked = true
    this.ngunghoptac_checked = false
    this.filterDate = null
    this.filterDateString = ""
    this.loadData()
  }

  onDropdownlistClick(event){
    if(Ps_UtilObjectService.hasValue(this.filterDate)){
      if(event.value == 1){
        this.filterTu.value = this.filterDateString
      } else {
        this.filterTruoc.value = this.filterDateString
      }
      this.loadData()
    } 
  }

  onDatepickerChange(event){
    this.filterDate = event
    this.filterDateString = formatDate(this.filterDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US');

    if(this.currentFilterValue.value == 1){
      this.filterTu.value = this.filterDateString
    } else {
      this.filterTruoc.value = this.filterDateString
    }
    this.loadData()
  }
  // -----------End header 2 -----------//

  // -----------TreeList -----------//

  loadData() {
    this.cache.clear();
    this.setFilter()
    this.treeListSupplierFilter = this.fetchChildren()
  }

  setFilter() {
    this.treeListSupplierState.filter.filters = []
    this.filterStatus.filters = []

    if (this.danghoptac_checked) {
      this.filterStatus.filters.push(this.filterDangHopTac)
    }
    if (this.ngunghoptac_checked) this.filterStatus.filters.push(this.filterNgungHopTac)
    if(this.filterDateString != ""){
      if (this.currentFilterValue.value == 1) this.treeListSupplierState.filter.filters.push(this.filterTu)
      if (this.currentFilterValue.value == 2) this.treeListSupplierState.filter.filters.push(this.filterTruoc)  
    }
    if (this.filterStatus.filters.length > 0) this.treeListSupplierState.filter.filters.push(this.filterStatus)
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
      if (this.searchData[0].value != '') {
        this.treeListSupplierState.filter.filters.push(this.filterSearchBox)
      }
    }
  }

  fetchChildren = (parent?: DTOSupplier): DTOSupplier[] => {
    if (this.cache.get(parent)) {
      return this.cache.get(parent);
    }

    let result;
    const items = parent ? parent.ListSuppliers : this.treeListSupplier;
    if (this.treeListSupplierState.filter && this.treeListSupplierState.filter.filters.length && items) {
      result = filterBy(items, {
        logic: "or",
        filters: [
          this.treeListSupplierState.filter,
          {
            operator: (item: any) => {
              if (item.ListSuppliers) {
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


  hasChildren = (item: any): boolean => {
    if (item.hasOwnProperty('ListSuppliers')) {
      const children = this.fetchChildren(item);
      return children && item.ListSuppliers.length > 0;
    }
  };


  HandleOpenDetail(dataItem){
    this.onOpenDetail(false, this.ItemSelectedPopup)
  }

  // Toggle drodown khi nhấn nút more ở cột cuối ds
  togglePopup(index, item){
    event.stopPropagation()

    if (index != this.currentAnchorIndex) {

      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      
      this.popupShow = !this.popupShow

    }

    if (this.popupShow){
      this.ItemSelectedPopup = item
      this.openDropDownList(item)
    }


    this.currentAnchorIndex = index
    // this.currentRowItem = item
  }
  isPopupVisible() {
    return this.popupShow ? 'visible' : 'hidden'
  }

  getAnchor() {
    if (Ps_UtilObjectService.hasValue(this.anchors) && this.anchors.length > 0) {
      var anchor = this.anchors.toArray()[this.currentAnchorIndex]

      if (Ps_UtilObjectService.hasValue(anchor))
        return anchor
    }
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
  }

  openDropDownList(dataItem){
    this.OptionTool = []
    if(this.isToanQuyen || this.isAllowedToCreate){
      this.OptionTool.push({ id: 2, text: 'Chỉnh sửa', icon: 'pencil', }); 
    } else {
      this.OptionTool.push({ id: 4, text: 'Xem chi tiết', icon: 'eye', }); 
    }
    this.ItemSelectedPopup = dataItem;
  }


  // -----------End TreeList -----------//

  // -----------Popup-----------//

  filterList(){
    this.treeListPartnerData = this.treeListPartner.filter(item2 => {
      // Kiểm tra xem có bất kỳ phần tử nào trong danh sách 1 giống với phần tử trong danh sách 2 không
      return !this.treeListSupplier.some(item1 => this.isEqual(item1, item2));
    });
  }

  isEqual(item1: DTOSupplier, item2: DTOPartner): boolean {
    if(item1.Partner !== item2.Code){
      return false;
    }
    if(Ps_UtilObjectService.hasListValue(item2.ListPartner)){
      item2.ListPartner.forEach(obj =>{
        if(item1.Partner !== obj.Code){
          return false;
        }
      })
    }
    // // So sánh danh sách con nếu tồn tại
    // if (item1.ListSuppliers && item2.ListPartner) {
    //   if (!this.areListsEqual(item1.ListSuppliers, item2.ListPartner)) {
    //     return false;
    //   }
    // }
    return true;
  }

  areListsEqual(list1: DTOSupplier[], list2: DTOPartner[]){
    return list2.filter(item2 => {
      list1.some(item1 => this.isEqual(item1, item2));
    });
  }

  onCloseDialog(){
    this.opened = false
  }

  handleSearchPartner(event){
    this.filterSearchBox.filters = []
    if (Ps_UtilObjectService.hasValueString(event)) {
      this.filterSearchBoxPopup.filters = event.filters;
      this.searchDataPopup = event.filters;
      this.loadDataPopup()
    }
  }

  loadDataPopup(){
    this.cachePopup.clear();
    this.setFilterPopup()
    this.treeListPartnerFilter = this.fetchChildrenPopup()
  }

  setFilterPopup(){
    this.treeListPartnerState.filter.filters = []

    if (Ps_UtilObjectService.hasListValue(this.filterSearchBoxPopup.filters)) {
      if (this.searchDataPopup[0].value != '') {
        this.treeListPartnerState.filter.filters.push(this.filterSearchBoxPopup)
      }
    }

  }

  fetchChildrenPopup = (parent?: DTOSupplier): DTOSupplier[] =>{
    if (this.cachePopup.get(parent)) {
      return this.cachePopup.get(parent);
    }

    let result;
    const items = parent ? parent.ListPartner : this.treeListPartnerData;
    if (this.treeListPartnerState.filter && this.treeListPartnerState.filter.filters.length && items) {
      result = filterBy(items, {
        logic: "or",
        filters: [
          this.treeListPartnerState.filter,
          {
            operator: (item: any) => {
              if (item.ListPartner) {
                const children = this.fetchChildrenPopup(item);
                return children && children.length;
              }
            },
          },
        ],
      });
    } else {
      result = items;
    }

    this.cachePopup.set(parent, result);

    return result;
  }

  hasChildrenPopup = (item: any): boolean => {
    if (item.hasOwnProperty('ListPartner')) {
      const children = this.fetchChildrenPopup(item);
      return children && item.ListPartner.length > 0;
    }
  }

  onOpenDetail(isAdd: boolean, SelectItem){
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {

      var parent = item.ListMenu.find(f => f.Code.includes('pur-policy') || f.Link.includes('pur002-brand-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('pur005-supplier-list') || f.Link.includes('pur005-supplier-list'))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('pur005-supplier-detail') || f.Link.includes('pur005-supplier-detail'))
          this.apiService.isAdd = isAdd
          if(isAdd){
            localStorage.setItem("supplierInfo",JSON.stringify(SelectItem))
          } else {
            localStorage.setItem("supplierInfo",JSON.stringify(SelectItem))
          }
          this.menuService.activeMenu(detail2)
        }
      }
    })
  }

  // -----------End Popup-----------//


  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
