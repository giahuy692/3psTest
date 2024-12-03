import { Component, Input } from '@angular/core';
import { DTOHRDecisionMaster } from '../../shared/dto/DTOHRDecisionMaster.dto';
import { DTOPositionQuantity } from '../../shared/dto/DTOPositionQuantity.dto';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { Subject } from 'rxjs';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { HriDecisionApiService } from '../../shared/services/hri-decision-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { takeUntil } from 'rxjs/operators';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';


@Component({
  selector: 'app-hri037-disciplinary-requirement-list',
  templateUrl: './hri037-disciplinary-requirement-list.component.html',
  styleUrls: ['./hri037-disciplinary-requirement-list.component.scss']
})
export class Hri037DisciplinaryRequirementListComponent {

  //#region Input Output
  @Input({ required: true }) TypeDecision:3 | 1 | 2 = 1 ;
  //#endregion

  //#region Varible
  childMenuItem: string = 'hriDecision'
  childMenuItem2: string = ''
  childMenuItem3: string = ''

  //phân quyền
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false
  uploadEventHandlerCallback: Function

  //varible disable grid
  isFilterDisable:boolean = false;

  //checkbox
  isDraft: boolean = true;
  isSent: boolean = true;
  isApproved: boolean = false;
  isSuspended: boolean = false;
  isLoading: boolean = false;

  //Grid
  curDate: Date = new Date()

  //decision selected
  selectedDecision: DTOHRDecisionMaster = new DTOHRDecisionMaster();

  //grid view
  gridView = new Subject<any>();
  pageSizes: number[] = [25, 50, 75, 100];
  pageSize: number = 25
  page: number = 0;

  // State của grid
  gridState: State = {
    skip: this.page,
    take: this.pageSize,
    sort: [{ field: 'Code', dir: 'desc' }],
    filter: { filters: [], logic: 'and' },
  };

  // Data nhận về từ grd
  gridData: DTOHRDecisionMaster[] = []
  total: number = 0

  //Filter bằng composite của input search
  SearchTermComposite: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  // Filter của nhóm status
  StatusFilterComposite: CompositeFilterDescriptor = { logic: 'or', filters: [] };

  //Filter của trạng thái Đang soạn thảo
  draftDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 0,
    operator: 'eq',
    ignoreCase: true
  }
  //Filter của trạng thái Gửi duyệt
  sentDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 1,
    operator: 'eq',
    ignoreCase: true
  }
  //Filter của trạng thái Duyệt áp dụng
  approvedDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của trạng thái Ngưng áp dụng
  suspendedDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }
  //Filter của trạng thái Trả về
  returnedDescriptor: FilterDescriptor = {
    field: 'Status',
    value: 4,
    operator: 'eq',
    ignoreCase: true
  }

  //Filter của input ngày hiệu lực
  dateFilterDescriptor: FilterDescriptor = { field: '', operator: '', value: '' }


  //Setting Selectable cho grid
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  }

  //Filter của loại quyết định
  // typeDecisionDescriptor: FilterDescriptor = { field: 'TypeData', operator: 'eq', value: '' }

  unsubscribe = new Subject<void>;

  onPageChangeCallback: Function
  onActionDropDownClickCallback: Function
  onSelectCallback: Function
  onSelectedPopupBtnCallback: Function
  getActionDropdownCallback: Function
  getSelectionPopupCallback: Function

  isDialogShow: boolean = false
  ListDeleteDecisionReq: DTOHRDecisionMaster[] = [];

  // Data dropdown của filter ngày hiệu lực
  ListDateFilterOperator = [{ Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' }, { Code: 2, TypeFilter: 'trước', ValueFilter: 'lt' }];
  // Operator hiện tại được chọn của dropdown filter ngày hiệu lực
  curDateFilterOperator = { Code: 1, TypeFilter: 'từ', ValueFilter: 'gte' }

  curDateFilterValue: any = null;

  keySearch: string = ""
  //#endregion

  constructor(
    private menuService: PS_HelperMenuService,
    private decisionService: HriDecisionApiService,
    private layoutService: LayoutService,
  ) { }

  //#region Init
  ngOnInit(): void {
    this.childMenuItem2 = 'hri037-disciplinary-requirement-list'
    this.childMenuItem3 = 'hri037-disciplinary-requirement-detail'

    //Lấy value cho filter dựa trên loại quyết định
    // this.typeDecisionDescriptor.value = this.TypeDecision;

    // //Phân quyền ứng dụng
    // this.menuService
    // .changePermission()
    // .pipe(takeUntil(this.unsubscribe))
    // .subscribe((res: DTOPermission) => {
    //   if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
    //     this.justLoaded = false;
    //     this.actionPerm = distinct(res.ActionPermission, 'ActionType');
    //     this.isMaster =
    //       this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
    //     this.isCreator =
    //       this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
    //     this.isApprover =
    //       this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
    //     //Chỉ được xem
    //     this.isAllowedToViewOnly =
    //       this.actionPerm.findIndex((s) => s.ActionType == 6) > -1 &&
    //       !Ps_UtilObjectService.hasListValue(
    //         this.actionPerm.filter((s) => s.ActionType != 6)
    //       );
    //   }
    // });

        // //Phân quyền
        // this.menuService.changePermission().pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOPermission) => {
        //   if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        //     this.justLoaded = false
        //     this.actionPerm = distinct(res.ActionPermission, "ActionType")
    
        //     this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        //     this.isCreator = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        //     this.isApproved = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        //   }
        // })
    

    this.isApprover = false
    this.isCreator = false
    this.isMaster = true





    this.onSelectCallback = this.handleGridItemSelect.bind(this)
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.getSelectionPopupCallback = this.getSelectionPopupAction.bind(this)
    this.onActionDropDownClickCallback = this.handleMoreActionItemClick.bind(this)
    this.onSelectedPopupBtnCallback = this.handleSelectionActionItemClick.bind(this)
    this.onPageChangeCallback = this.handlePageChange.bind(this)
    this.curDate.setHours(0, 0, 0, 0)
    this.gridView.next({ data: this.gridData, total: this.total });

    // this.APIGetListHRDecisionMaster()
    this.menuService.changePermissionAPI().pipe(takeUntil(this.unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
         this.handleLoadFilter();
			}
		})

  }

  //#endregion


  //#region API
  /**
  * API lấy danh sách thông tin quyết định
  */
  APIGetListHRDecisionMaster() {
    let apiText = "Yêu cầu kỹ luật"
    this.decisionService.GetListHRDecisionMaster(this.gridState, this.keySearch, 5).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      this.isLoading = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.gridData = res.ObjectReturn.Data;
        this.total = res.ObjectReturn.Total
        this.gridView.next({ data: this.gridData, total: this.total });
        if(this.gridData.length <= 0 && this.total != 0){
          this.page = this.page - 1;
          this.gridState.skip = this.gridState.skip - 1
          this.APIGetListHRDecisionMaster()
        }
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${res.ErrorString}`)
      }
   
    }, (err) => {
      this.isLoading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${apiText}: ${err}`);

    })
  }

  /**
   * API thay đổi trạng thái quyết định
   * @param listDTO Danh sách quyết định muốn thay đổi
   * @param reqStatus Trạng thái muốn chuyển
   */
  APIUpdateHRDecisionMasterStatus(listDTO: DTOHRDecisionMaster[], reqStatus: number) {
    const apiText = "Cập nhật trạng thái quyết định"
    this.decisionService.UpdateHRDecisionMasterStatus(listDTO, reqStatus).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.handleLoadFilter();
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.handleLoadFilter();

    })
  }

  /**
 * API xoá quyết định
 * @param listDTO danh sách quyết định cần xoá
 * @returns 
 */
  APIDeleteHRDecisionMaster(listDTO: DTOHRDecisionMaster[]) {
    const apiText = "Xoá quyết định"
    this.decisionService.DeleteHRDecisionMaster(listDTO).pipe(takeUntil(this.unsubscribe)).subscribe((res: DTOResponse) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công')
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`)
      }
      this.handleLoadFilter();

    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
      this.handleLoadFilter();

    })
  }

  //#endregion


  //#region  Handle Page
  /**
   * Hàm nhận value từ component filter
   * @param value Giá trị từ component truyền ra
   * @param varaiable Tên biến cần gán giá trị vào
   * Trả về trang 1 khi filter
   */
  handleFilterChange(value: any, varaiable?: string, loadProcess: boolean = true) {
    this.page = 0;
    this.gridState.skip = 0;
    if (Ps_UtilObjectService.hasValue(varaiable)) {
      this[varaiable] = JSON.parse(JSON.stringify(value));
      //Nếu là filter search thì kiểm tra xem value nhập có là rỗng hay không
      if (Ps_UtilObjectService.containsString(varaiable, 'SearchTermComposite')) {
        //Nếu không có giá trị thì set rỗng
        if (!Ps_UtilObjectService.hasValueString(value.filters[0]?.value)) {
          this.SearchTermComposite.filters = []
          this.keySearch = ""
        }else{
          this.keySearch = value.filters[0]?.value
        }
      }

      //Nếu là filter ngày thì lấy value chính xác với múi giờ
      if (Ps_UtilObjectService.containsString(varaiable, 'curDateFilterValue')) {
        this.curDateFilterValue = new Date(value).toDateString() + " " + new Date(value).toLocaleTimeString([], { hour12: false });
      }
    }

   // Kiểm tra nếu là dropdown chọn operator cho filter ngày
    const isDateFilterOperator = Ps_UtilObjectService.containsString(varaiable, 'curDateFilterOperator');

    // Nếu là filter ngày và giá trị không phải null hoặc nếu không phải filter ngày mà loadProcess là true
    if ((isDateFilterOperator && Ps_UtilObjectService.hasValue(this.curDateFilterValue)) || (!isDateFilterOperator && loadProcess)) {
      this.handleLoadFilter();
    }

  }

  /**
   * Hàm tổng hợp filter và filter data
   */
  handleLoadFilter() {
    if (!this.isFilterDisable) {
      this.isLoading = true;
      this.gridState.filter.filters = [];
      this.StatusFilterComposite.filters = [];

      // this.handlePushFilter(this.gridState.filter, this.typeDecisionDescriptor, true);

      this.handlePushFilter(this.StatusFilterComposite, this.draftDescriptor, this.isDraft);
      this.handlePushFilter(this.StatusFilterComposite, this.sentDescriptor, this.isSent);
      this.handlePushFilter(this.StatusFilterComposite, this.approvedDescriptor, this.isApproved);
      this.handlePushFilter(this.StatusFilterComposite, this.suspendedDescriptor, this.isSuspended);

      //Nếu trạng thái đang soạn thảo được check thì push thêm trạng thái trả về vào Composite
      if (this.isDraft) {
        this.handlePushFilter(this.StatusFilterComposite, this.returnedDescriptor, this.isDraft);
      }

      this.dateFilterDescriptor = this.handleGenerateFilterDescriptor('EffDate', this.curDateFilterOperator.ValueFilter, this.curDateFilterValue)

      // this.handlePushFilter(this.gridState.filter, null, null, this.SearchTermComposite);
      this.handlePushFilter(this.gridState.filter, null, null, this.StatusFilterComposite);
      this.handlePushFilter(this.gridState.filter, this.dateFilterDescriptor, true)
      this.APIGetListHRDecisionMaster();
    }
  }

  /**
   * Hàm kiểm tra và push filter vào composite nếu filter có giá trị
   * @param composite Composite cần được push filter vào
   * @param filterDescriptor FilterDescriptor cần kiểm tra để được push
   * @param checkStatus Varaiable của statusFilter để kiểm tra có đang được check hay không
   * @param compositeFilter Param này dùng khi cần push 1 composite vào filter của gridState
   * Nếu checkStatus là false thì sẽ không push vào composite
   * Nếu sử dụng hàm để push composite vào filter của grid thì truyền param filterDescriptor là null và checkStatus là null;
   */
  handlePushFilter(composite: CompositeFilterDescriptor, filterDescriptor?: FilterDescriptor, checkStatus?: boolean, compositeFilter?: CompositeFilterDescriptor) {
    if (compositeFilter == null) {
      if (Ps_UtilObjectService.hasValueString(filterDescriptor.value) && checkStatus) {
        composite.filters.push(filterDescriptor)
      }
    }
    else {
      if (Ps_UtilObjectService.hasListValue(compositeFilter.filters)) {
        composite.filters.push(compositeFilter)
      }
    }

  }

  /**
  * Hàm tạo FilterDescriptor
  * @param field trường cần filter
  * @param operator toán tử
  * @param value giá trị
  * @returns FilterDescriptor
  */
  handleGenerateFilterDescriptor(field: string, operator: string, value: string | number) {
    return { field: field, operator: operator, value: value }
  }

  hanldeResetFilter() {
    this.page = 0;
    this.gridState.skip = 0;
    this.keySearch = ""

    this.isDraft = true;
    this.isSent = true;
    this.isApproved = false;
    this.isSuspended = false;

    this.SearchTermComposite.filters = [];
    this.curDateFilterValue = null;
    this.curDateFilterOperator = { ...this.ListDateFilterOperator[0] }
    // this.curTypeApplyFilterValue = { ...this.ListTypeApplyFilter[0] }
    this.handleLoadFilter();
  }

  /**
   * Hàm set giá trị để nhận biết chọn nhiều item cho việc disable
   * @param isSelected 
   */
  handleGridItemSelect(isSelected: boolean) {
    this.isFilterDisable = isSelected;
  }

  /**
 * Hàm lấy các action cho popup moreAction của grid
 * @param moreActionDropdown 
 * @param dataItem 
 * @returns MenuDataItem[]
 */
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {
    console.log(this.isApproved)
    console.log(this.isCreator)
    console.log(this.isMaster)
    const decisionDate = dataItem.EffDate
    moreActionDropdown = []
    var status = dataItem.Status
    this.selectedDecision = dataItem

    // Action chỉnh sửa và xem chi tiết
    if (((status == 0 || status == 4) && (this.isCreator || this.isMaster)) || (status == 1 && (this.isApprover || this.isMaster)))
      moreActionDropdown.push({ Name: "Chỉnh sửa", Code: "pencil", Type: 'edit', Actived: true })
    else
      moreActionDropdown.push({ Name: "Xem chi tiết", Code: "eye", Type: 'detail', Actived: true })

    // Nhóm action đổi tình trạng
    if ((status == 0 || status == 4) && (this.isCreator || this.isMaster)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true })
    }
    else if ((status == 1 || (status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, decisionDate) > 0))) && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push({ Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true })
      moreActionDropdown.push({ Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true })
    }
    else if (status == 2 && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push({ Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true })
    }

    // Action xoá
    if (status == 0 && (this.isCreator || this.isMaster))
      moreActionDropdown.push({ Name: "Xóa yêu cầu", Code: "trash", Type: 'delete', Actived: true })

    return moreActionDropdown
  }

  /**
* Hàm lấy các action cho popup giữa màn hình khi chọn vào checkbox
* @param arrItem 
* @returns MenuDataItem[]
*/
  getSelectionPopupAction(arrItem: any[]) {
    var moreActionDropdown = new Array<MenuDataItem>()
    // Kiểm tra các action có thể tương tác của item
    var canSent = arrItem.findIndex(s => s.Status == 0 || s.Status == 4) // Đang soạn thảo và Trả về có thể gửi duyệt
    var canAppro_Return = arrItem.findIndex(s => s.Status == 1) // Gửi duyệt có thể Duyệt và Trả về
    var canReturnOnEffDate = arrItem.findIndex(s => s.Status == 3 && Ps_UtilObjectService.getDaysLeft(this.curDate, s.EffDate) > 0) // Ngưng áp dụng có thể trả về với điều kiện chưa tới ngày hiệu lực
    var canStop = arrItem.findIndex(s => s.Status == 2) // Duyệt áp dụng có thể ngưng
    var canDel = arrItem.findIndex(s => s.Status == 0) // Đang soạn thảo có thể xóa

    if (canSent != -1 && (this.isCreator || this.isMaster)) {
      moreActionDropdown.push({ Name: "Gửi duyệt", Code: "redo", Type: 'Status', Link: "1", Actived: true }
      )
    }

    if ((canReturnOnEffDate != -1 || canAppro_Return != -1) && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push(
        { Name: "Phê duyệt", Code: "check-outline", Type: 'Status', Link: "2", Actived: true },
        { Name: "Trả về", Code: "undo", Type: 'Status', Link: "4", Actived: true }
      )
    }

    if (canStop != -1 && (this.isApprover || this.isMaster)) {
      moreActionDropdown.push(
        { Name: "Ngưng áp dụng", Code: "minus-outline", Type: 'Status', Link: "3", Actived: true }
      )
    }

    if (canDel != -1 && (this.isCreator || this.isMaster)) {
      moreActionDropdown.push(
        { Name: "Xóa yêu cầu", Code: "trash", Type: 'Delete', Link: "delete", Actived: true }
      )
    }

    return moreActionDropdown
  }

  /**
   * Hàm xử lí action được chọn trên popup
   * @param menu menu action đã nhấn
   * @param item quyết định được chọn
   */
  handleMoreActionItemClick(menu: MenuDataItem, item: any) {
    if (item.Code > 0) {
      if (menu.Type == 'Status') {
        // Nếu trạng thái được nhấn là gửi duyệt hoặc duyệt áp dụng
        if (parseInt(menu.Link) == 1 || parseInt(menu.Link) == 2) {
          //Nếu các trường bắt buộc đủ thông tin thì gọi API
          if (this.handleRequiredFieldCheck(this.selectedDecision)) {
            this.APIUpdateHRDecisionMasterStatus([this.selectedDecision], parseInt(menu.Link))
          }
        } else {
          this.APIUpdateHRDecisionMasterStatus([this.selectedDecision], parseInt(menu.Link))
        }
      }
      else if (menu.Link == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Link == 'detail') {
        localStorage.setItem("HrDecisionMaster", JSON.stringify(this.selectedDecision))
        this.openDetail()
      }
      else if (menu.Link == 'delete' || menu.Code == 'trash') {
        this.ListDeleteDecisionReq.push(this.selectedDecision);
        this.isDialogShow = true
      }
    }

  }

  /**
 * Hàm xử lí action được chọn trên dialog
 * @param btnType Loại action đã nhấn
 * @param listSelectedItem List các item đã được chọn
 * @param value Value của action đã nhấn
 */
  handleSelectionActionItemClick(btnType: string, listSelectedItem: any[], value: any) {
    let reqList = []
    let reqStatus = 0;

    if (btnType == 'Status') {
      if (value == '1') {
        reqList = []

        listSelectedItem.forEach(item => {
          if ((item.Status == 0 || item.Status == 4) && this.handleRequiredFieldCheck(item)) {
            reqList.push(item)
          }
        });

        reqStatus = 1; // Trạng thái Gửi duyệt
      }
      else if (value == '2') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 1 && this.handleRequiredFieldCheck(item)) {
            reqList.push(item)
          }
          else if (item.Status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, item.EffDate) > 0)) {
            reqList.push(item)
          }
        });

        reqStatus = 2; // Trạng thái Duyệt áp dụng
      }
      else if (value == '3') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 2) {
            reqList.push(item)
          }
        });

        reqStatus = 3; // Trạng thái Ngừng áp dụng
      }
      else if (value == '4') {
        reqList = []

        listSelectedItem.forEach(item => {
          if (item.Status == 1) {
            reqList.push(item)
          }
          else if (item.Status == 3 && (Ps_UtilObjectService.getDaysLeft(this.curDate, item.EffDate) > 0)) {
            reqList.push(item)
          }
        });

        reqStatus = 4; // Trạng thái Trả về
      }

      if (Ps_UtilObjectService.hasListValue(reqList)) {
        this.APIUpdateHRDecisionMasterStatus(reqList, reqStatus);
      } else {
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      }
    }
    else if (btnType == 'Delete') {
      this.ListDeleteDecisionReq = [];
      listSelectedItem.forEach(item => {
        if (item.Status == 0) {
          this.ListDeleteDecisionReq.push(item)
        }
      });
      if (Ps_UtilObjectService.hasListValue(this.ListDeleteDecisionReq)) {
        this.isDialogShow = true;
      }

    }
  }

  /**
  * Hàm dùng để check các trường bắt buộc của dto
  * @param dto dto cần check
  * @param isSkipMsg bỏ qua thông báo mặc định là false
  * @returns true | false
  */
  handleRequiredFieldCheck(dto: DTOHRDecisionMaster, isSkipMsg: boolean = false) {
    let msgStr = `Đã xảy ra lỗi khi cập nhật trạng thái yêu cầu kỹ luật ${dto.DecisionID ?? 'không xác định'}: Yêu cầu thiếu `;
    if (!Ps_UtilObjectService.hasValueString(dto.DecisionID)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Mã yêu cầu')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(dto.DecisionName)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Tiêu đề')
      }
      return false;
    }
    else if (!Ps_UtilObjectService.hasValueString(dto.EffDate)) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Ngày hiệu lực')
      }
      return false;
    }
    else if (dto.NumOfProfile <= 0) {
      if (!isSkipMsg) {
        this.layoutService.onError(msgStr + 'Số ứng viên')
      }
      return false;
    }

    // else if (!Ps_UtilObjectService.hasListValue(dto.ListPosition)) {
    //   if (!isSkipMsg) {
    //     this.layoutService.onError(msgStr + 'Thông tin tuyển dụng')
    //   }
    //   return false;
    // }

    return true;
  }

  /**
  * Hàm chuyển trang
  * @param isNew Nếu là thêm mới thì param này là true
  */
  openDetail(isNew: boolean = false) {
    this.menuService.changeModuleData().pipe(takeUntil(this.unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code == 'hriDisciplinary')
      console.log(parent)
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes(this.childMenuItem2) || f.Link.includes(this.childMenuItem2))
        if (Ps_UtilObjectService.hasValue(detail) && Ps_UtilObjectService.hasListValue(detail.LstChild)) {
          var detail2 = detail.LstChild.find(f => f.Code.includes(this.childMenuItem3) || f.Link.includes(this.childMenuItem3))
          this.menuService.activeMenu(detail2)
          if (isNew) {
            var newDecision = new DTOHRDecisionMaster();
            newDecision.TypeData = 3
            localStorage.setItem("HrDecisionMaster", JSON.stringify(newDecision))
          }
        }
      }
    })
  }

  /**
   * HÀm thực hiện khi thay đổi trang
   * @param event 
   */
  handlePageChange(event: PageChangeEvent) {
    this.page = event.skip;
    this.pageSize = event.take;
    this.gridState.skip = event.skip
    this.gridState.take = event.take
    this.handleLoadFilter();
  }

  /**
   * Hàm thực hiện khi comfirm delete
   */
  handleDeleteRequest(): void {
    this.ListDeleteDecisionReq.find(item => {
      if(this.TypeDecision == 1){
        if(item.NumOfProfile > 0){
          this.layoutService.onError(`Không thể xóa quyết định ${item.DecisionName} vì còn danh sách tuyển dụng`);
          this.ListDeleteDecisionReq = this.ListDeleteDecisionReq.filter(decision => decision.Code !== item.Code);
        }

      } else {
        if(item.NumOfStaff > 0){
          this.layoutService.onError(`Không thể xóa quyết định ${item.DecisionName} vì còn danh sách điều chuyển`);
          this.ListDeleteDecisionReq = this.ListDeleteDecisionReq.filter(decision => decision.Code !== item.Code);
        } 
      }
    })
    
    if(Ps_UtilObjectService.hasListValue(this.ListDeleteDecisionReq)){
      this.APIDeleteHRDecisionMaster(this.ListDeleteDecisionReq);
    }
    this.ListDeleteDecisionReq = []
    this.isDialogShow = false;
  }


  /**
   * Hàm thực hiện close dialog
   */
  handleCloseDialog(): void {
    this.isDialogShow = false;
    this.ListDeleteDecisionReq = [];
  }

  /**
  * Hàm trả về tên các quyết địng chưa hiển thị trên dialog xoá
  * @returns string
  */
  handleGetRemainingPolicyNames(): string {
    return this.ListDeleteDecisionReq.slice(2).map(item => item.DecisionName).join(',\n');
  }

  //#endregion


  //#region Destroy
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
  //#endregion
}
