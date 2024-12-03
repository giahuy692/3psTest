import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Subject, } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import DTOPromotionProduct, { DTOPromotionType, DTODayOfWeek, DTOGroupOfCard, DTOPromotionDetail, DTOPromotionInv, DTOPromotionInvDetail } from '../../dto/DTOPromotionProduct.dto';
import { MarketingService } from '../../services/marketing.service';
import { MarPromotionAPIService } from '../../services/marpromotion-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOUpdate } from 'src/app/p-app/p-ecommerce/shared/dto/DTOUpdate';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { distinct } from '@progress/kendo-data-query';
class DTOActionStatus { text: string; class: string; code: string; statusID?: number; type?: string }

@Component({
  selector: 'app-mar-promotion-infor',
  templateUrl: './mar-promotion-infor.component.html',
  styleUrls: ['./mar-promotion-infor.component.scss']
})
export class MarPromotionInforComponent implements OnInit {

  @Input({ required: true }) productName: string = '';
  @Input() isloadPromotionInfo: boolean = false;
  @Input() statusUpdate: number = null;
  @Input() disabled: boolean = false;

  @Output() getPromotion: EventEmitter<DTOPromotionProduct> = new EventEmitter<DTOPromotionProduct>();
  @Output() uppdateStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() getListActionPromotion: EventEmitter<{ text: string, class: string, code: string, link?: number, type?: string }[]> = new EventEmitter<{ text: string, class: string, code: string, link?: number, type?: string }[]>();

  //#region permision
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []

  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  //#endregion
  //#region variable useful
  loading = false
  isLockAll = false
  ngUnsubscribe$ = new Subject<void>();

  curPromotion = new DTOPromotionProduct() // giá trị binding của chương trình
  listPromotionType: DTOPromotionType[] = [] // danh sách loại chương trình 
  //#endregion

  constructor(public serviceMar: MarketingService,
    public apiMarService: MarPromotionAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public menuService: PS_HelperMenuService,) { }

  ngOnInit(): void {
    let that = this
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false

        that.dataPerm = distinct(res.DataPermission, "Warehouse")
        // this.getCache()
      }
    })
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
    //#region callback
    this.pickFileCallback = this.pickFile.bind(this)
    this.GetFolderCallback = this.GetPromotionFolderDrillWithFile.bind(this)
    //#endregion
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  //#region function chung
  getCache() {
    this.serviceMar.getCachePromotionDetail().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.curPromotion = res
        if (this.curPromotion.Code == 0) {
          this.createNewPromotion()
          this.APIGetListPromotionType();
        } else {
          this.loadData();
        }
      }
    })
  }

  /**
   * Lấy thông tin mới
   */
  loadData() {
    this.APIGetPromotionByCode(this.curPromotion);
    this.APIGetListPromotionType();
  }

  /**
   * Hàm tạo mới một CTKM
   */
  createNewPromotion() {
    //object
    this.curPromotion = new DTOPromotionProduct()
    this.curPromotion.Category = 10
    this.curPromotion.CategoryName = 'Hamper'
    this.curPromotion.PromotionType = 1
    this.curPromotion.PromotionTypeName = 'KM Thường'
    this.curPromotion.TypeData = 3
    this.curPromotionType = null

    this.isLockAll = false;
    this.curLanguage = 1
    this.curImgSetting = 0

    this.StartDate = null
    this.EndDate = null

    this.CreateListBtnStatus();
    this.getPromotion.emit(this.curPromotion);
  }

  /**
   * Hàm xử lý cập nhật trạng thái của khuyến mãi
   * @param item loại hành động cập nhật trạng thái
   */
  onUpdatePromotionStatus(item: DTOActionStatus) {
    var newPro = { ...this.curPromotion }
    this.APIUpdatePromotionStatus([newPro], item.statusID)
  }

  //#endregion

  //#region function useful of listPromotionType
  //- disabled item 
  isItemDisabled(itemArgs: { dataItem: DTOPromotionType; index: number }) {
    return itemArgs.dataItem.Code == -1;
  }

  //- value change
  defaultPromotionType: DTOPromotionType = new DTOPromotionType(-1, '- Chọn phân nhóm -')
  curPromotionType: DTOPromotionType = null

  /**
   * Hàm xử lý giá trị khi người dùng chọn giá trị trong dropdownlist
   * @param e event của dropdownlist
   * @param dropdownName tên của dropdown đó
   */
  onDropdownlistClick(e: any, dropdownName: string) {
    if(dropdownName === 'PromotionType'){
      this.curPromotion.PromotionType = e.Code
      this.curPromotion.PromotionTypeName = e.PromotionType
      this.APIUpdatePromotion([dropdownName])
    }
  }

  //#endregion

  //#region change tag
  curLanguage: number = 1

  /**
   * Hàm xử lý lăng nghe thay đổi tab ngôn ngư
   * @param lang ngôn ngữ tiếng viêt | anh | nhật
   */
  changeLanguage(lang: number) {
    this.curLanguage = lang
  }
  //#endregion

  //#region set date promotion
  tempDate: DTOPromotionProduct;
  StartDate: Date = null;
  EndDate: Date = null;
  isUpdateDate: boolean = false;

  // Hàm xử lý focus của datepicker 
  focusDatepicker() {
    this.tempDate = JSON.parse(JSON.stringify(this.curPromotion))
  }


  /**
   * Hàm xử lý giá trị thay đổi của component datepicker
   * @param prop thuộc tính cần cập nhật
   * @param item là giá trị của component datepicker
   */
  onDatepickerChange(prop: string, item?: string |  Date) {
    var valueFormatDate: Date
    const tempcurDate = Ps_UtilObjectService.hasValue(this.tempDate[prop]) ? new Date(this.tempDate[prop]).toDateString() : null
    const tempItemDate = new Date(item).toDateString()
    if (JSON.stringify(this.curPromotion[prop]) !== JSON.stringify(item) && tempcurDate !== tempItemDate) {
      valueFormatDate = new Date(item);
      if (prop == 'StartDate') {
        valueFormatDate.setHours(7, 0, 0, 0);
      } else {
        valueFormatDate.setHours(23, 59, 59, 0)
      }
      this.isUpdateDate = true;
    } else {
      this.isUpdateDate = false;
    }
    if (Ps_UtilObjectService.hasValue(item) && Ps_UtilObjectService.hasValueString(prop) && this.isUpdateDate) {
      this.curPromotion[prop] = valueFormatDate.toISOString();
      this.APIUpdatePromotion([prop])
    }
    this.checkPromotionProp();
  }


  /**
   * Hàm xử lý các thuộc tính đặt biết không thể binding trực tập mà cần phải xử lý qua
   */
  checkPromotionProp() {
    this.onCheckPermistion();

    if (Ps_UtilObjectService.hasValueString(this.curPromotion.StartDate))
      this.StartDate = new Date(this.curPromotion.StartDate)

    if (Ps_UtilObjectService.hasValueString(this.curPromotion.EndDate))
      this.EndDate = new Date(this.curPromotion.EndDate)

    this.curPromotionType = this.listPromotionType.find(s => s.Code == this.curPromotion.PromotionType)
    // this.isCheckboxAllowByPromotionType() // emit
  }

  /**
   * Hàm kiểm tra quyền của người dùng sử dụng chức năng
   */
  onCheckPermistion() {
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.curPromotion.StatusID;

    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4) || canVerify && statusID === 1) {
      this.isLockAll = false; // Cho phép chỉnh sửa
    } else {
      this.isLockAll = true; // Bị disabled
    }
  }
  //#endregion

  //#region handle textbox, textarea
  /**
   * hàm xử lý giá trị khi các componet textbox và textarea blur ra
   * @param prop thuộc tính cần được cập nhật
   */
  onTextboxLoseBlur(prop: string) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      switch (prop) {
        default:
          this.APIUpdatePromotion([prop])
          break
      }
    }
  }

  /**
   * Hàm xử lý giá trị thay đổi của editor
   * @param value là giá trị của edit mà người dùng nhập vào
   */
  valueChangeEditor(value: string) {
    this.curLanguage == 1 ? this.curPromotion.VNSummary = value
      : this.curLanguage == 2 ? this.curPromotion.JPSummary = value : this.curPromotion.ENSummary = value
  }
  //#endregion

  //#region button status
  listpromotionActionButton: DTOActionStatus[] = [];

  /**
   * Hàm tạo danh sách nút cập nhật trạng thái và tạo mới
   */
  CreateListBtnStatus() {
    this.listpromotionActionButton = [];
    var statusID = this.curPromotion.StatusID;

    // Kiểm tra quyền tạo hoặc toàn quyền
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;

    // Kiểm tra quyền duyệt
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;

    // Push "Xóa" khi có quyền tạo hoặc toàn quyền và statusID === 0
    if (canCreateOrAdmin && statusID === 0 && Ps_UtilObjectService.hasValueString(this.curPromotion.PromotionNo)) {
      this.listpromotionActionButton.push({
        text: 'XÓA CHƯƠNG TRÌNH',
        class: 'k-button btn-hachi hachi-warning',
        code: 'trash',
        type: 'delete',
      });
    }
    // Push "Gửi duyệt" khi có quyền tạo hoặc toàn quyền và statusID = 0 hoặc statusID = 4
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4) && Ps_UtilObjectService.hasValueString(this.curPromotion.PromotionNo)) {
      this.listpromotionActionButton.push({
        text: 'GỬI DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'redo',
        statusID: 1,
      });
    }

    // Push "Phê duyệt" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
    if (canVerify && (statusID === 1 || statusID === 3)) {
      this.listpromotionActionButton.push({
        text: 'PHÊ DUYỆT',
        class: 'k-button btn-hachi hachi-primary',
        code: 'check-outline',
        statusID: 2,
      });

      // Push "Trả về" khi có quyền duyệt hoặc toàn quyền và statusID = 1 hoặc statusID = 3
      this.listpromotionActionButton.push({
        text: 'TRẢ VỀ',
        class: 'k-button btn-hachi hachi-warning hachi-secondary',
        code: 'undo',
        statusID: 4,
      });
    }

    // Push "Ngưng hiển thị" khi có quyền duyệt hoặc toàn quyền và statusID = 2
    if (canVerify && statusID === 2) {
      this.listpromotionActionButton.push({
        text: 'NGƯNG HIỂN THỊ',
        class: 'k-button btn-hachi hachi-warning',
        code: 'minus-outline',
        statusID: 3,
      });
    }

    
    if (canCreateOrAdmin) {
      this.listpromotionActionButton.push({
        text: 'TẠO MỚI',
        class: 'k-button btn-hachi hachi-primary',
        code: 'plus',
        type: 'new',
      });
    }
    // Sắp xếp theo thứ tự: xem -> chỉnh sửa -> gửi -> duyệt -> ngưng -> trả về
    this.getListActionPromotion.emit(this.listpromotionActionButton);
  }
  //#endregion

  //#region  Update img

  /**
   * Hàm xử lý ảnh
   * @param str URL ảnh
   * @returns ảnh
   */
  getRes(str: string) {
    return Ps_UtilObjectService.getImgRes(str)
  }

  curImgSetting = 0
  pickFileCallback: Function
  GetFolderCallback: Function
  uploadEventHandlerCallback: Function

  pickFile(e: DTOCFFile, width, height) {
    this.curPromotion[`ImageSetting${this.curImgSetting}`] = Ps_UtilObjectService.removeImgRes(e?.PathFile)
    this.layoutService.getEditor(1).embedImgURL(e, width, height);
    this.layoutService.setFolderDialog(false)
    // this.APIUpdatePromotion([`ImageSetting${this.curImgSetting}`])
  }

  /**
   * Lấy folder ảnh khuyển mãi
   * @returns folder ảnh của CTKM
   */
  GetPromotionFolderDrillWithFile() {
    return this.apiMarService.GetPromotionFolderDrillWithFile()
  }

  /**
   * Hàm upload file ảnh nhỏ và lớn
   * @param imgSetting 1 là ảnh nhở | 2 là ảnh ảnh
   */
  onUploadFile(imgSetting: number) {
    this.curImgSetting = imgSetting
    this.layoutService.folderDialogOpened = true
  }

  /**
   * Hàm xóa file ảnh nhỏ và lớn
   * @param imgSetting 1 là ảnh nhở | 2 là ảnh ảnh
   */
  deleteFile(imgSetting: number) {
    this.curPromotion[`ImageSetting${imgSetting}`] = null
    this.APIUpdatePromotion([`ImageSetting${imgSetting}`])
  }
  //#endregion




  //#region API
  /**
   * Lấy chi tiết thông tin của một CTKM
   * @param dto CTKM
   */
  APIGetPromotionByCode(dto: DTOPromotionProduct) {
    this.loading = true;
    var ctx = `chương trình khuyển mã ${dto.TypeData == 1 ? 'sản phẩm' : dto.TypeData == 2 ? 'combo - giftset' : 'hamper'}`
    this.apiMarService.GetPromotionByCode(dto.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null) {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}!`);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn;
        this.serviceMar.setCachePromotionDetail(this.curPromotion)
        this.getPromotion.emit(this.curPromotion);
        this.checkPromotionProp();
        this.CreateListBtnStatus();
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${error}!`);
    });
  }

  /**
   * Cập nhật CTKM
   * @param properties danh sách những thuộc tính muốn cập nhật
   * @param promotion CKKM
   */
  APIUpdatePromotion(properties: string[], promotion: DTOPromotionProduct = this.curPromotion) {
    this.loading = true;
    var ctx = (promotion.Code == 0 ? "tạo mới" : "cập nhật") + ` khuyến mãi ${promotion.TypeData == 1 ? 'sản phẩm' : promotion.TypeData == 2 ? 'combo - giftset' : 'hamper'}`
    promotion.Code == 0 ? properties.push('PromotionType', 'PromotionTypeName', 'Category') : null
    promotion.Category = 10
    var updateDTO: DTOUpdate = {
      "DTO": promotion,
      "Properties": properties
    }

    this.apiMarService.UpdatePromotion(updateDTO).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {

      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.curPromotion = res.ObjectReturn
        this.serviceMar.setCachePromotionDetail(this.curPromotion)
        this.getPromotion.emit(this.curPromotion);
        this.checkPromotionProp();
        this.CreateListBtnStatus();
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetPromotionByCode(this.curPromotion);
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionByCode(this.curPromotion);
    });
  }


  /**
   * Cập nhật trạng thái của CTKM
   * @param list danh sách những CKTM cần được cập nhật trạng thái
   * @param status ID của status cần cập nhật
   */
  APIUpdatePromotionStatus(list: DTOPromotionProduct[] = [this.curPromotion], status: number) {
    this.loading = true;
    var ctx = `Cập nhật tình trạng khuyến mãi ${this.curPromotion.TypeData == 1 ? 'sản phẩm' : this.curPromotion.TypeData == 2 ? 'combo - giftset' : 'hamper'}`

    this.apiMarService.UpdatePromotionStatus(list, status).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null && res.StatusCode !== 0) {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetPromotionByCode(this.curPromotion);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.serviceMar.setCachePromotionDetail(this.curPromotion)
        this.APIGetPromotionByCode(this.curPromotion);
        this.uppdateStatus.emit(true);
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionByCode(this.curPromotion);
    });
  }
  
  /**
   * Xóa CTKM 
   */
  APIDeletePromotion() {
    this.loading = true;
    var ctx = "xóa khuyến mãi" + `${this.curPromotion.TypeData == 1 ? 'sản phẩm' : this.curPromotion.TypeData == 2 ? 'combo - giftset' : 'hamper'}`

    this.apiMarService.DeletePromotion(this.curPromotion).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null && res.StatusCode !== 0) {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetPromotionByCode(this.curPromotion);
      }
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        // this.createNewPromotion()
        let newpro = new DTOPromotionProduct()
        this.serviceMar.setCachePromotionDetail(newpro);
        this.layoutService.onSuccess(`${ctx} thành công`)
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionByCode(this.curPromotion);
    });
  }

  /**
   * Lấy danh sách loại khuyễn mãi
   */
  APIGetListPromotionType() {
    var ctx = "loại khuyến mãi" + `${this.curPromotion.TypeData == 1 ? 'sản phẩm' : this.curPromotion.TypeData == 2 ? 'combo - giftset' : 'hamper'}`
    this.loading = true;
    this.apiMarService.GetListPromotionType().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null && res.StatusCode !== 0) {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}!`);
        this.APIGetPromotionByCode(this.curPromotion);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPromotionType = res.ObjectReturn;
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionByCode(this.curPromotion);
    });
  }
  //#endregion
  ngOnDestroy(): void {
    this.ngUnsubscribe$.unsubscribe();
  }
}
