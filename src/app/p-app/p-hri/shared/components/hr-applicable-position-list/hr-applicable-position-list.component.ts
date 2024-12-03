import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { DTOHRPolicyDepartment } from '../../dto/DTOHRPolicyDepartment.dto';
import { Align, Collision } from '@progress/kendo-angular-popup';
import { DTOHRPolicyPosition } from '../../dto/DTOHRPolicyPosition.dto';
import { eyeIcon, minusOutlineIcon, pencilIcon, searchIcon, trashIcon } from '@progress/kendo-svg-icons';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { takeUntil } from 'rxjs/operators';
import { DTOResponse, Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Subject } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { distinct } from '@progress/kendo-data-query';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTOHRPolicyLocation } from '../../dto/DTOHRPolicyLocation.dto';
import { DTOHRPolicyTypeStaff } from '../../dto/DTOHRPolicyTypeStaff.dto';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { TransitionService } from '../../services/transition.service';

@Component({
  selector: 'app-hr-applicable-position-list',
  templateUrl: './hr-applicable-position-list.component.html',
  styleUrls: ['./hr-applicable-position-list.component.scss']
})
export class HrApplicablePositionListComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild("popup", { read: ElementRef }) public popup: ElementRef;
  @ViewChildren('anchor') anchors: QueryList<ElementRef>;

  @Input() dataHRPolicyMaster: DTOHRPolicyMaster
  @Input() typeHrPolicy: number = 0
  @Input() reqDelete: boolean = false
  @Input() reqChangeStatus: any
  @Input() show: boolean = true
  @Input() location: DTOHRPolicyLocation
  @Input() reqCreate: boolean = false
  //load data thực hiện khi muốn load lại danh sách trong component
  @Input() loadData: boolean = false
  //reloadParent thực hiện khi muốn component bên ngoài thực hiện reload lại một thức gì đó
  @Output() reloadParent: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionPosition: EventEmitter<any> = new EventEmitter<any>();
  @Output() outListHRPolicyApply: EventEmitter<DTOHRPolicyDepartment[]> = new EventEmitter<DTOHRPolicyDepartment[]>();
  @Output() ListNewPosition: EventEmitter<string[]> = new EventEmitter<string[]>();

  loading: boolean = false

  //List page in panigation
  listPageSize: number[] = [25, 50, 75, 100];

  //List Icon
  icons = { eye: eyeIcon, pencil: pencilIcon, trash: trashIcon, searchIcon: searchIcon, minusOutline: minusOutlineIcon };

  //List Action popup

  listActionDraw: { id: number, text: string, icon: any }[] = [
    { id: 3, text: "Chỉnh sửa", icon: this.icons.pencil },
    { id: 4, text: "Xóa chức danh", icon: this.icons.trash }
  ];
  
  listActionApply: { id: number, text: string, icon: any }[] = [
    { id: 1, text: "Xem chi tiết", icon: this.icons.eye }
  ];
  
  //ListHRPolicyApply
  listHRPolicyApply: DTOHRPolicyDepartment[]
  listFilterHRPolicyApply: DTOHRPolicyDepartment[]

  //search
  keySearch: string = ""

  //POPUP
  isPopShow: boolean = false
  listFilterChanelFunction: any[] = []
  collision: Collision = { horizontal: 'flip', vertical: 'fit' };
  anchorAlign: Align = { horizontal: "left", vertical: "top" };
  popupAlign: Align = { horizontal: "right", vertical: "top" };
  tempItemSelected: any
  positionSelected: DTOHRPolicyPosition

  //DIALOG
  isShowDialogPosition: boolean = false
  isShowDialogLocation: boolean = false
  isShowDialogChangeStatus: boolean = false

  titleDialog: string = ""
  nameItemDialog: string = ""
  tempItemDeleteDialogPosition: DTOHRPolicyPosition
  tempItemDeleteDialogLocaton: DTOHRPolicyLocation
  tempItemChangeDialogLocation: DTOHRPolicyLocation

  //excel
  excelValid: boolean = true;

  //varible request call API
  callGetListHRPolicyApply: boolean = false

  //phân quyền
  justLoaded: boolean = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false
  uploadEventHandlerCallback: Function

  // Hàm sử dụng để check change của 2 giá trị
  hasProcessedLoadData: boolean = false;
  hasProcessedDataHRPolicyMaster: boolean = false;

  wattingAPI: boolean = false

  //page
  skip: number = 0

  //Mãng xét xem giá trị trước của pre data
  lastTwoStatuses: number[] = [];

  requestDeletePosition: boolean = false

  statusImport: number = 0
  

  // //Biến bắt sự kiện enter khi nhập mã chức danh
  // enterPressed: boolean = false;
  destroy$ = new Subject<void>

  
  constructor(
    private hriTransitionService: HriTransitionApiService,
    private layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
    public apiService: MarBannerAPIService,
    public transitionService: TransitionService
  ) { }

  //#region LifeCycle
   ngOnInit(): void {
    /**
     * Kiểm tra phân quyền
     */
    this.menuService.changePermission().pipe(takeUntil(this.destroy$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        if(this.dataHRPolicyMaster.Code != 0){
          this.APIGetListHRPolicyApply(this.dataHRPolicyMaster);
        }
    
      }
    })

    this.transitionService.getDataStatusImport().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.statusImport = data
    })

    this.uploadEventHandlerCallback = this.uploadEventHand.bind(this)

  }

  ngOnChanges(changes: SimpleChanges): void {
    /**
     * Kiểm tra sự thay đổi
     */
    // if (this.shouldCallGetListHRPolicyApply(changes)) {
    //   // if (!this.wattingAPI) {
    //     // this.APIGetListHRPolicyApply(this.dataHRPolicyMaster);
    //   // }

    // }
    /**
     * Bắt sự kiện component cha yêu cầu xóa Chức danh
     */
    if (changes['reqDelete']) {
      if (this.positionSelected) {
        this.handleOpenDialogPosition(this.positionSelected)
      }
    }

    if (changes['show']) {
      this.listFilterHRPolicyApply = [];
      this.listHRPolicyApply = [];
    }

    /**
     * Bắt sự kiện conponent cha yêu cầu chuyển đổi trạng thái địa điểm
     */
    if (changes['reqChangeStatus']) {
      if (this.location.Code != 0 && this.dataHRPolicyMaster.Status == 2) {
        this.handleOpenDialogChangeStatus(this.location)
      }
    }
  }

  //#endregion

    /**
   * Hàm thực hiện để kiểm tra sự thay đổi của input
   * @param changes Đối tượng thay đổi
   * @returns 
   */
    shouldCallGetListHRPolicyApply(changes: SimpleChanges): boolean {
      // if (this.callGetListHRPolicyApply) {
      //   this.callGetListHRPolicyApply = false
      //   return false
      // }
  
      if (changes['loadData']) {
        if (this.dataHRPolicyMaster.Code !== 0 && this.dataHRPolicyMaster.TypeApply == 1) {
          return true;
        }else{
          this.listFilterHRPolicyApply = [];
          this.listHRPolicyApply = [];
        }
      }    
      return false;
    }

  /**
   * Hàm kiểm tra xem có phải quyền xem hay không
   * @returns true, false
   */
  isViewer():boolean{
    if(!this.isCreator && !this.isApprover && !this.isMaster){
      return true
    }else{
      return false
    }
  }

  //#region API

  /**
   * API lấy danh sách chức danh áp dụng
   * @param dataHrPolicyMaster chính sách
   */
  APIGetListHRPolicyApply(dataHrPolicyMaster: DTOHRPolicyMaster) {
    this.wattingAPI = true
    this.loading = true
    this.hriTransitionService.GetListHRPolicyApply(dataHrPolicyMaster).pipe(takeUntil(this.destroy$)).subscribe(
      (res: any) => {
        this.loading = false
        if (
          Ps_UtilObjectService.hasValue(res) &&
          res.StatusCode == 0
        ) {
          this.listHRPolicyApply = res.ObjectReturn;
          this.listFilterHRPolicyApply = this.listHRPolicyApply
          this.onSendListPositionName(this.listFilterHRPolicyApply);

          this.outListHRPolicyApply.emit(this.listHRPolicyApply)
        } else {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi lấy Danh sách chức danh áp dụng: ${res.ErrorString}`
          );
        }
        this.wattingAPI = false
      },
      (err) => {
        this.loading = false
        this.layoutService.onError(
          `Đã xảy ra lỗi khi lấy Danh sách chức danh áp dụng: ${err}`
        );
      }
    );
  }

  /**
   * API thực hiện xóa danh sách chức danh đie
   * @param req 
   */
  APIDeleteHRPolicyLimit(req: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff) {
    this.loading = true
    this.hriTransitionService.DeleteHRPolicyLimit(req).pipe(takeUntil(this.destroy$)).subscribe(
      (res: any) => {
        this.loading = false
        if (
          Ps_UtilObjectService.hasValue(res) &&
          res.StatusCode == 0
        ) {
          this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
          if (this.isLocation(req)) {
            this.layoutService.onSuccess(
              'Xóa địa điểm thành công'
            )
          } else if (this.isPosition(req)) {
            // this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
            this.layoutService.onSuccess(
              'Xóa chức danh thành công'
            )
          }
          // this.reloadParent.emit(true)
        } else {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi xóa: ${res.ErrorString}`
          );
        }
      },
      (err) => {
        this.loading = false
        this.layoutService.onError(
          `Đã xảy ra lỗi khi xóa: ${err}`
        );
      }
    );
  }

  /**
   * API cập nhật trạng thái của location
   * @param dto location | position | typeStaff
   */
  APIUpdateHRPolicyLimitStatus(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyTypeStaff) {
    this.loading = true
    const apiText = "Ngưng áp dụng"
    dto.Status = 3;
    this.location.StatusName = "Ngưng áp dụng"
    this.hriTransitionService.UpdateHRPolicyLimitStatus(dto).pipe(takeUntil(this.destroy$)).subscribe((res: DTOResponse) => {
      this.loading = false
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(apiText + ' thành công');
        this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${res.ErrorString}`);
      }

    }, (err) => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi ${apiText}: ${err}`);
    })
  }
  //#region


  // Giả sử bạn đã có các phương thức kiểm tra kiểu như sau
  private isPosition(obj: any): obj is DTOHRPolicyPosition {
    return obj && typeof obj === 'object' && 'PositionID' in obj;
  }

  private isLocation(obj: any): obj is DTOHRPolicyLocation {
    return obj && typeof obj === 'object' && 'LocationID' in obj;
  }


  /***
     * dùng để expand grid
     */
  public expandedDetailKeys: number[] = [1];

  public handleExpandDetailsBy = (dataItem: any): number => {
    return dataItem;
  };



  //#region Logic
  /**
   * Ẩn popup
   */
  handleHidePopUp(): void {
    this.isPopShow = false
    this.tempItemSelected = null
  }

  /**
   * Mở popup
   * @param dataItem DTOHRPosition
   */
  handleOpenPopup(dataItem: any) {
    if (dataItem === this.tempItemSelected) {
      this.tempItemSelected = null
      this.isPopShow = false
    } else {
      this.tempItemSelected = dataItem
      this.isPopShow = true
    }
    this.positionSelected = dataItem
  }

  onContainerClick(event: MouseEvent) {
    event.stopPropagation();
  }

  /**
   * Xử lý tắt popup khi click bên ngoài
   * @param event 
   */
  @HostListener('document:click', ['$event'])
  public handleDocumentClick(event: MouseEvent): void {
    if (!this.contains(event.target)) {
      this.handleHidePopUp();
    }
  }

  contains(target: EventTarget): boolean {
    if (!this.anchors) return false;
    return this.anchors.toArray().some(anchor => anchor.nativeElement.contains(target));
  }

  /**
   * Gán value cho keySearch
   * @param e string 
   */
  handleSetValueSearch(e: any) {
    this.keySearch = e
    this.handleSearch(this.listHRPolicyApply, this.keySearch)
  }

  /**
   * Hàm xử lý search chức danh
   * @param data 
   * @param searchKey 
   * @returns 
   */
  handleSearch(node: DTOHRPolicyDepartment[] | DTOHRPolicyPosition[] | DTOHRPolicyLocation[], searchKey: string): void {
    this.listFilterHRPolicyApply = [];
    const keyLower = searchKey.toLowerCase().trim();

    if (!Ps_UtilObjectService.hasValueString(keyLower)) {
      this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
      return
    }

    node.forEach(departs => {
      // Lọc các vị trí (positions) phù hợp với từ khóa tìm kiếm
      const matchingPositions = departs.ListPosition.filter(pos => {
        const posCode = pos.PositionID.toLowerCase().trim();
        const posName = pos.PositionName.toString().toLowerCase().trim();
        return posCode.includes(keyLower) || posName.includes(keyLower);
      });

      if (matchingPositions.length > 0) {
        // Tạo một bản sao của đối tượng cha (departs)
        const matchingDepart = { ...departs };
        // Gán ListPosition chỉ chứa các vị trí phù hợp
        matchingDepart.ListPosition = matchingPositions;
        // Thêm đối tượng cha vào danh sách kết quả
        this.listFilterHRPolicyApply.push(matchingDepart);
      }
    });

    this.handleCheckReturnPage(this.listFilterHRPolicyApply)
  }

  /**
   * Hàm thực hiện kiểm tra xem trang đó còn item hay không nếu không trở về trang 1
   */
  handleCheckReturnPage(list: DTOHRPolicyDepartment[]) {
    if (this.listActionApply.length > 0) {
      this.skip = 0
    }
  }

  /**
   * Hàm bắt sự kiện khi kendo grid thay đổi trang
   * @param e 
   */
  handlePageChanges(e: PageChangeEvent) {
    this.skip = e.skip
    this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
  }



  /**
   * Hàm gửi giá trị lên com cha khi click vào popup
   * @param item truyền lên một position
   * @param status trạng thái muốn thực hiện 0: đóng drawer,  1: xem, 2 Thêm,  3: Sửa, 4: Xóa
   */
  handleACtionPositionClick(item: DTOHRPolicyPosition | null, status: number): void {
    if (status == 4) {
      this.handleOpenDialogPosition(item)
      return
    }
    let obj = { item: item, status: status }
    this.actionPosition.emit(obj)
  }

  /**
   * Hàm thực hiện xóa một locatiom
   * @param location locaton muốn xóa
   * @param position chức danh chứa location muốn xóa
   */
  handleDeleteLocation(location: DTOHRPolicyLocation) {
    this.APIDeleteHRPolicyLimit(location)
    this.callGetListHRPolicyApply = true
    this.isShowDialogLocation = false

  }

  /**
   * Hàm thực hiện xóa một chức danh ra khỏi chính sách
   * @param position 
   */
  handleDeletePosition(position: DTOHRPolicyPosition) {
    this.APIDeleteHRPolicyLimit(position)
    this.isShowDialogPosition = false
    let obj = { item: null, status: 0 }
    this.callGetListHRPolicyApply = true
    this.handleCheckReturnPage(this.listFilterHRPolicyApply)
    this.actionPosition.emit(obj)
  }

  /**
   * Hàm chuyển trạng thái của location
   * @param location địa điểm
   */
  handleChangeStatusLocation(location: DTOHRPolicyLocation) {
    this.APIUpdateHRPolicyLimitStatus(location)
    this.isShowDialogChangeStatus = false
  }

  /**
 * Hàm được gọi khi đóng dialog
 */
  handleCloseDialogPosition() {
    this.isShowDialogPosition = false;
  }

  /**
   * Hàm đóng dialog location
   */
  handleCloseDialogLocation() {
    this.isShowDialogLocation = false
  }

  /**
  * Hàm đóng dialog location status
  */
  handleCloseDialogChangeStatus() {
    this.isShowDialogChangeStatus = false
  }

  /**
   * Hàm mở thông báo comfirm khi chuyển trạng thái địa điểm
   * @param item địa điểm
   */
  handleOpenDialogChangeStatus(item: DTOHRPolicyLocation) {
    this.isShowDialogChangeStatus = true
    this.tempItemChangeDialogLocation = item
  }

  /**
   * Hàm mở thông báo comfirm khi xóa một chức danh
   * @param item chức danh
   */
  handleOpenDialogPosition(item: DTOHRPolicyPosition) {
    this.isShowDialogPosition = true
    this.tempItemDeleteDialogPosition = item
  }

  /**
   * Hàm mở dialog confirm khi muốn xóa một địa điểm
   * @param position chức danh
   * @param location địa điẻm
   * @returns null
   */
  handleOpenDiaLogLocation(position: DTOHRPolicyPosition, location: DTOHRPolicyLocation) {
    if (position.ListLocation.length <= 1) {
      this.layoutService.onError(
        `Đã xảy ra lỗi khi Xóa địa điểm áp dụng: Một chức danh cần một địa điểm áp dụng`
      );
      return
    } else {
      this.isShowDialogLocation = true
      this.tempItemDeleteDialogLocaton = location
    }
  }

  /**
   * Hàm xác định dto thuộc loại dto nào
   * @param dto 
   * @returns string name DTO
   */
  handleIdentifyDTO(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyDepartment): string {
    if (!dto) {
      return 'Unknown';
    }
    if ('Position' in dto && 'PositionName' in dto) {
      return 'DTOHRPolicyPosition';
    } else if ('Location' in dto && 'LocationName' in dto) {
      return 'DTOHRPolicyLocation';
    } else if ('DepartmentName' in dto && 'Department' in dto) {
      return 'DTOHRPolicyDepartment';
    }

    return 'Unknown';
  }

  /**
   * Hàm lấy icon của DTO
   * @param dto 
   * @returns icon string
   */
  handleGetIconByDTO(dto: DTOHRPolicyPosition | DTOHRPolicyLocation | DTOHRPolicyDepartment): string {
    if (this.handleIdentifyDTO(dto) === 'DTOHRPolicyPosition') {
      return 'user';
    }
    else if (this.handleIdentifyDTO(dto) === 'DTOHRPolicyLocation') {
      return 'location-dot';
    }
    else if (this.handleIdentifyDTO(dto) === 'DTOHRPolicyDepartment') {
      return 'network-wired';
    }
    return 'triangle-exclamation';
  }

  /**
   * HÀM GỬI RA OUPUT DANH SÁCH POSITIONNAME
   * @param ListPolicyApply LIST POLICY APPLY
   */
  onSendListPositionName(ListPolicyApply: DTOHRPolicyDepartment[]) {
    let PositionName: string[] = [];
    if (Ps_UtilObjectService.hasListValue(ListPolicyApply)) {
      ListPolicyApply.forEach((s) => {
        if (Ps_UtilObjectService.hasListValue(s.ListPosition)) {
          s.ListPosition.forEach((a) => {
            PositionName.push(a.PositionName);
          });
        }
      });
    }
    this.ListNewPosition.emit(PositionName);
  }

  //#region import và export
  onImportExcel() {
    this.transitionService.setDataStatusImport(1)
    if(this.statusImport == 1){
      this.layoutService.setImportDialog(true)
      this.layoutService.setExcelValid(true)
    }

  }

  /**
   * Dowload template import chức danh
   */
  APIDownloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "PolicyApplyTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    this.apiService.GetTemplate(getfilename).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.loading = false;
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        Ps_UtilObjectService.getFile(res)
        this.layoutService.onSuccess(`${ctx} thành công`);
      }else{
        this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + res.ErrorString)
      }


    }, f => {
      this.loading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)

    });
  }

  /**
   * API import chức danh bằng excel
   * @param file PolicyApplyTemplate
   */
  APIImportExcelPosition(file) {
    this.loading = true
    var ctx = "Import Excel"

    this.hriTransitionService.ImportPosition(file, this.dataHRPolicyMaster.Code).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && !Ps_UtilObjectService.hasValueString(res.ErrorString)) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
        this.APIGetListHRPolicyApply(this.dataHRPolicyMaster)
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${err}`)
      this.loading = false;
    })
  }
  uploadEventHand(e: File) {
    this.APIImportExcelPosition(e)
  }
  //#endregion


  /**
   * Kiểm tra xem có quyền chỉnh sửa khi là approver hay không
   * @returns 
   */
  handleCheckApproverEditable(): boolean {
    if (this.isApprover && (this.dataHRPolicyMaster.Status == 1 || this.dataHRPolicyMaster.Status == 2)) {
      return true
    }
    else if (this.isCreator && (this.dataHRPolicyMaster.Status == 0 || this.dataHRPolicyMaster.Status == 4)) {
      return true
    }
    return false
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
