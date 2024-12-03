import { Component } from '@angular/core';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPriceRequest } from '../../shared/dto/DTOPriceRequest.dto';
import { takeUntil } from 'rxjs/operators';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PurPriceRequestApiService } from '../../shared/services/pur-price-request-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';



@Component({
  selector: 'app-pur008-price-request-list',
  templateUrl: './pur008-price-request-list.component.html',
  styleUrls: ['./pur008-price-request-list.component.scss']
})
export class Pur008PriceRequestListComponent {

  loading: boolean = false
  isDisabledFilter: boolean = false
  dialog: boolean = false
  dialogMany: boolean = false

  gridView = new Subject<any>();

  // region permission
  isToanQuyen: boolean = false
  isAllowedToCreate: boolean = false
  isAllowedToVerify: boolean = false
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  // endregion

  total = 0
  pageSize = 25
  pageSizes = [this.pageSize];
  
  gridState: State = { take: this.pageSize, filter: { filters: [], logic: 'and' }, }
  //filter
  isNew: boolean = true
	isSent:boolean = false
	isStoped:boolean = false
	isApproved:boolean = false

  isFilterActive:boolean = true


	// isReturn = false
	filterNew: FilterDescriptor = { field: 'StatusID', value: 0, operator: 'eq', ignoreCase: false }
	filterSent: FilterDescriptor = { field: 'StatusID', value: 1, operator: 'eq', ignoreCase: false }
	filterApprove: FilterDescriptor = { field: 'StatusID', value: 2, operator: 'eq', ignoreCase: false }
	filterStoped: FilterDescriptor = { field: 'StatusID', value: 3, operator: 'eq', ignoreCase: false }
	filterReturn: FilterDescriptor = { field: 'StatusID', value: 4, operator: 'eq', ignoreCase: false }

  filterEffDate: FilterDescriptor = { field: 'EffDate', value: null, operator: '', ignoreCase: false }

  filterSearchBox: CompositeFilterDescriptor = {
    logic: 'or',
    filters: [],
  };


	

  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getSelectionPopupCallback: Function
  // Dropdown
  onActionDropdownClickCallback: Function
  getActionDropdownCallback: Function
  //function grid
  onPageChangeCallback: Function

  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  listPriceRequest: DTOPriceRequest[] = []
  priceRequest = new DTOPriceRequest();

  defaultFilterDate:any
  listDropdownFilterDate = [
    {Code: 1, TypeName:"Từ"},
    {Code: 2, TypeName:"Trước"},
  ]
  currentEffDate: any

  unsubscribe = new Subject<void>;
  constructor(
    public menuService: PS_HelperMenuService,
    public priceRequestAPI: PurPriceRequestApiService,
    public layoutService: LayoutService,
    ){}


  ngOnInit():void {
    
    this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasListValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType")

        this.isToanQuyen = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isAllowedToCreate = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isAllowedToVerify = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        //test permission
        // this.isToanQuyen =  false
        // this.isAllowedToCreate =  true
        // this.isAllowedToVerify = true
        this.loadFilter()
        // this.GetListPriceRequest(this.gridState)
      }
    })
    
    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListPriceRequest(this.gridState)
      }
    })
    this.defaultFilterDate = this.listDropdownFilterDate[0]

    this.onPageChangeCallback = this.onPageChange.bind(this)

    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)

    this.getSelectionPopupCallback = this.getSelectionPopup.bind(this)
    this.onSelectedPopupBtnCallback = this.onSelectedPopupBtnClick.bind(this)
    this.onSelectCallback = this.selectItem.bind(this)

   
  }

  loadData(){
    this.GetListPriceRequest(this.gridState)
  }
  
  // rowCallback = (context: RowClassArgs) => {
  //   return {
  //     'no-expand': context.dataItem.StatusID == 4
  //   };
  // };


  //#region filter
  onDropdownFilter(e){
    this.defaultFilterDate = e
    
    if(Ps_UtilObjectService.hasValue( this.defaultFilterDate) && Ps_UtilObjectService.hasValueString(this.currentEffDate)){
      this.loadFilter();
      this.GetListPriceRequest(this.gridState);
    }
  }

  //select effdate
  onDateblur(e){
    if(Ps_UtilObjectService.hasValue(e) && Ps_UtilObjectService.hasValue(this.defaultFilterDate)){
      this.currentEffDate = e
      this.loadFilter();
      this.GetListPriceRequest(this.gridState);
    }
  }
  
  // Xử lý search
  handleSearch(event: any){
    if (event.filters && event.filters.length > 0){
      if (event.filters[0].value === '') {
        this.filterSearchBox.filters = []
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListPriceRequest(this.gridState)
      } else if (Ps_UtilObjectService.hasValueString(event)) {
        this.filterSearchBox.filters = event.filters;
        this.gridState.skip = 0
        this.loadFilter();
        this.GetListPriceRequest(this.gridState)
      }
    }
  }

  // Xử lý reset bộ lọc mặc định
  resetFilter() {
    this.filterSearchBox.filters = []
    this.isNew = true
    this.isSent = false
    this.isApproved = false
    this.isStoped = false
    this.gridState.skip = 0
    this.defaultFilterDate = this.listDropdownFilterDate[0]
    this.currentEffDate = null
    this.loadFilter()
    this.GetListPriceRequest(this.gridState)
  }

  // Xử lý load filter cho danh sách
  loadFilter(){
    this.pageSizes = [...this.layoutService.pageSizes]
    this.gridState.take = this.pageSize

    this.gridState.filter.filters = []

    var filterStatusID: CompositeFilterDescriptor = {
      logic: "or",
      filters: []
    }
    var filterEffDate: CompositeFilterDescriptor = {
      logic: "and",
      filters: []
    }
    if (this.isNew) {
      filterStatusID.filters.push(this.filterNew)
      filterStatusID.filters.push(this.filterReturn)
    }

    if (this.isSent)
      filterStatusID.filters.push(this.filterSent)
    
    if (this.isApproved)
      filterStatusID.filters.push(this.filterApprove)
    
    if (this.isStoped)
      filterStatusID.filters.push(this.filterStoped)

    if(Ps_UtilObjectService.hasValueString(this.currentEffDate) && this.defaultFilterDate){
      if(this.defaultFilterDate.Code == 1){
        this.filterEffDate.operator = 'gte'
      }else{
        this.filterEffDate.operator = 'lt'
      }
      this.filterEffDate.value = this.currentEffDate
      filterEffDate.filters.push(this.filterEffDate)
    }

    if (filterStatusID.filters.length > 0)
      this.gridState.filter.filters.push(filterStatusID)
    if (filterEffDate.filters.length > 0)
      this.gridState.filter.filters.push(filterEffDate)

    //search box
    if (Ps_UtilObjectService.hasListValue(this.filterSearchBox.filters)) {
        this.gridState.filter.filters.push(this.filterSearchBox);
    }
    //

  }


	// Áp dụng giá trị lọc vào thuộc tính được chỉ định và tải lại dữ liệu.
  applyFilter(value,name:string){
		this[name] = value
    this.gridState.skip = 0
    this.loadFilter()
    this.GetListPriceRequest(this.gridState)
	}

  // Xử lý data khi chuyển trang trong danh sách
  onPageChange(event: PageChangeEvent){
    this.gridState.skip = event.skip;
    this.gridState.take = this.pageSize = event.take
    this.GetListPriceRequest(this.gridState)
  }

  //#endregion


  //#region action
  //Hàm xóa 1 đề nghị
  onDelete(){
    if(Ps_UtilObjectService.hasValue(this.priceRequest) && this.priceRequest.Code > 0){
      this.DeletePriceRequest([this.priceRequest]);
    }
  }

  //Hàm xóa nhiều đề nghị
  onDeleteManyItem(){
    if(Ps_UtilObjectService.hasListValue(this.listDelete)){
      this.DeletePriceRequest(this.listDelete)
    }
  }

  //Đóng dialog
  closeDialog(){
    this.dialog = false
    this.dialogMany = false
  }

  //Hàm chuyển sang trang detail
  openDetail(isNew:boolean = false) {
     this.menuService.changeModuleData().pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code == 'pur-po')
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('price-request-list')
          || f.Link.includes('price-request-list'))

        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes('price-request-detail')
            || f.Link.includes('price-request-detail'))
          this.menuService.activeMenu(detail2)
          if(isNew){
            var newPriceRequest = new DTOPriceRequest();
            localStorage.setItem("PriceRequest", JSON.stringify(newPriceRequest))
          }
        }
      }
    })
  }

  

 //hàm disable các action khác khi chọn checkbox trên grid
  selectItem(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible
  }

  //Hàm push item vào popup 3 chấm khi chọn
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any){
    moreActionDropdown = []
    var statusID = dataItem.StatusID
    this.priceRequest = dataItem


  if (((statusID == 0 || statusID == 4) && (this.isAllowedToCreate || this.isToanQuyen)) || (statusID == 1 && (this.isAllowedToVerify || this.isToanQuyen)))
    moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
  else
    moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })
  //status

  if ((statusID == 0 || statusID == 4) && (this.isAllowedToCreate || this.isToanQuyen)) {
    moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true })
  }
  else if ((statusID == 1 || statusID == 3) && (this.isAllowedToVerify || this.isToanQuyen)) {
    moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true })
    moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true })
  }
  else if (statusID == 2 && (this.isAllowedToVerify || this.isToanQuyen)) {
    moreActionDropdown.push({ Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true })
  }
 
  //xoa
  if (statusID == 0 && (this.isAllowedToCreate || this.isToanQuyen))
    moreActionDropdown.push({ Name: "Xóa đề nghị", Code: "trash", Type: 'delete', Actived: true })

  return moreActionDropdown
  }

  // Hàm xử lí các action trong popup
  onActionDropdownClick(menu: MenuDataItem, item: any){
    if (item.Code > 0) {
      if (menu.Type == 'StatusID') {
        if(this.priceRequest.NoOfChangePartner > 0 || this.priceRequest.NoOfChangePrice > 0 || this.priceRequest.NoOfNewProduct > 0){
          this.UpdatePriceRequestStatus([this.priceRequest], parseInt(menu.Link))
        }else{
          this.layoutService.onError(`Đề nghị báo giá của nhà cung cấp ${this.priceRequest.PartnerName} chưa có sản phẩm`)
        }
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        localStorage.setItem("PriceRequest", JSON.stringify(item))
        this.openDetail()
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
       this.dialog = true
      }
    }
  }

  //hàm push item vào popup giữa màn khi chọn vào checkbox
  getSelectionPopup(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    var checkProduct = arrItem.findIndex(s => 
     (s.NoOfChangePartner > 0 || s.NoOfChangePrice > 0 || s.NoOfNewProduct > 0))
    //tìm item có tình trạng ...
    var canSent = arrItem.findIndex(s => s.StatusID == 0 || s.StatusID == 4) //đang soạn/trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.StatusID == 1 || s.StatusID == 3) //gửi duyệt có thể duyệt/trả về
    var canStop = arrItem.findIndex(s => s.StatusID == 2) // duyệt có thể ngưng
    var canDel = arrItem.findIndex(s => s.StatusID == 0) // đang soạn có thể xóa


    if (canSent != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true }
      )
    }

    if (canAppro_Return != -1 && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && checkProduct != -1 && (this.isAllowedToVerify || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Ngưng hiển thị", Code: "minus-outline", Type: 'StatusID', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isAllowedToCreate || this.isToanQuyen)) {
      moreActionDropdown.push(
        { Name: "Xóa", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }
    return moreActionDropdown
  }

  listDelete: DTOPriceRequest[] = []
  //hàm xử lý action của các button trong popup checkbox
  onSelectedPopupBtnClick(btnType: string, list: any[], value: any) {
    let arr = []
    let StatusID: number = -1

    if (list.length > 0) {

      if (btnType == "StatusID") {
        const today = new Date()
        if (value == 1 || value == '1') {//Gửi duyệt
          arr = []
          list.forEach(s => {
            var effDate =  new Date(s.EffDate) 
            if ((s.StatusID == 0 || s.StatusID == 4) && (s.NoOfChangePartner > 0 || s.NoOfChangePrice > 0 || s.NoOfNewProduct > 0) && effDate > today) {
              arr.push(s);
            }
          })
          StatusID = 1
        }
        else if (value == 2 || value == '2') {//Phê duyệt
          arr = []
          list.forEach(s => {
            var effDate =  new Date(s.EffDate) 
            if ((s.StatusID == 1 || s.StatusID == 3) && (s.NoOfChangePartner > 0 || s.NoOfChangePrice > 0 || s.NoOfNewProduct > 0) && effDate > today) {
              arr.push(s);
            }
          })
          StatusID = 2
        }
        else if (value == 4 || value == '4') {//Trả về
          arr = []
          list.forEach(s => {
            if (s.StatusID == 1 || s.StatusID == 3) {
              arr.push(s);
            }
          })
          StatusID = 4
        }
        else if (value == 3 || value == '3') {//Ngưng hiển thị
          arr = []
          list.forEach(s => {
            if (s.StatusID == 2) {
              arr.push(s);
            }
          })
          StatusID = 3
        }

        
        if (Ps_UtilObjectService.hasListValue(arr)) {
          this.UpdatePriceRequestStatus(arr, StatusID)
        }else{
          this.layoutService.onError("Ngày hiệu lực nhỏ hơn ngày hiện tại hoặc không có sản phẩm trong đề nghị !")
        }
      }

      // else
      if (btnType == "Delete") {//Xóa
        this.listDelete = []

        list.forEach(s => {
          if (s.StatusID == 0)
            this.listDelete.push(s)
            this.dialogMany = true
        })
      }
    }
  }
  //#endregion

  //#region API
  GetListPriceRequest(state:State) {
    this.loading = true;
    var ctx = "Đề nghị báo giá"
    this.priceRequestAPI.GetListPriceRequest(state).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPriceRequest = res.ObjectReturn.Data
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.listPriceRequest, total: this.total });
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${err}`);
      this.loading = false
    })
  }

  UpdatePriceRequestStatus(items: DTOPriceRequest[] = [this.priceRequest], statusID = this.priceRequest.StatusID){
    this.loading = true
    var ctx = 'Cập nhật tình trạng'
      this.priceRequestAPI.UpdatePriceRequestStatus(items, statusID).pipe(takeUntil(this.unsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} thành công`)
          this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
          this.GetListPriceRequest(this.gridState);
       } else{
         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
         this.GetListPriceRequest(this.gridState);
       }
  
        this.loading = false;
      },() =>{
        this.loading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi ' + ctx)
        this.GetListPriceRequest(this.gridState);
      }
      )
    
  }

  DeletePriceRequest(dto:DTOPriceRequest[]){
    this.loading = true;
    var ctx = `Đề nghị báo giá`
    this.priceRequestAPI.DeletePriceRequest(dto).pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      if (res.StatusCode == 0) {
        this.layoutService.onSuccess(`Xóa thành công ${ctx}`);
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog()
        this.closeDialog();
        this.GetListPriceRequest(this.gridState);
      }else{
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${res.ErrorString}!`)
        this.GetListPriceRequest(this.gridState);
      }
      this.loading = false;
      },(error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi Xóa ${ctx}: ${error}!`);
        this.GetListPriceRequest(this.gridState);
        this.loading = false;
      }
    );
  }


  //#endregion

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
