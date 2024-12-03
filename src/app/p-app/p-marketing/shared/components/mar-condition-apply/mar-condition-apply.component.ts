import { Component, EventEmitter, OnDestroy, OnInit, Output, Input, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import DTOPromotionProduct, { DTOPromotionType, DTODayOfWeek, DTOGroupOfCard, DTOPromotionDetail, DTOPromotionInv, DTOPromotionInvDetail } from '../../../shared/dto/DTOPromotionProduct.dto';
import { DTOWarehouse } from 'src/app/p-app/p-ecommerce/shared/dto/DTOWarehouse';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MarketingService } from '../../services/marketing.service';
import { MarPromotionAPIService } from '../../services/marpromotion-api.service';
import { takeUntil } from 'rxjs/operators';
import { distinct } from '@progress/kendo-data-query';

@Component({
  selector: 'app-mar-condition-apply',
  templateUrl: './mar-condition-apply.component.html',
  styleUrls: ['./mar-condition-apply.component.scss']
})
export class MarConditionApplyComponent implements OnInit, OnDestroy{
  @Input() disabled: boolean = false;
  


  //#region Output
  @Output() getListWareHouse: EventEmitter<DTOWarehouse[]> = new EventEmitter<DTOWarehouse[]>();
  @Output() getListDayOfWeek: EventEmitter<DTODayOfWeek[]> = new EventEmitter<DTODayOfWeek[]>();
  @Output() getListGroupOfCard: EventEmitter<DTOGroupOfCard[]> = new EventEmitter<DTOGroupOfCard[]>();
  //#endregion

  //#region variable status
  loading = false
  isLockAll = false
  isGroupOfCardDisabled = true
  isGoldenHourDisabled = true
  //#endregion
  
  //#region variable repository
  listWareHouse: DTOWarehouse[] = []
  listDayOfWeek: DTODayOfWeek[] = []
  listGroupOfCard: DTOGroupOfCard[] = []
  //#endregion

  //#region permision
  isToanQuyen = false
  isAllowedToCreate = false
  isAllowedToVerify = false
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  dataPerm: DTODataPermission[] = []
  //#endregion
  
  //#region variable DTO
  @Input() curPromotion = new DTOPromotionProduct() // giá trị binding của chương trình

  //#region unsubcribe
  ngUnsubscribe$ = new Subject<void>();
  //#endregion


  constructor(
    public service: MarketingService,
    public apiService: MarPromotionAPIService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public menuService: PS_HelperMenuService,
  ) { }

  ngOnInit(): void {
    let that = this
    //- Thêm website hachihachi và Tất cả cửa hàng vì db không cung cấp 
    this.listWareHouse.push(new DTOWarehouse(7, 'Website hachihachi.com.vn', false))
    this.listWareHouse.push(new DTOWarehouse(-1, 'Tất cả cửa hàng', false))
    //cache
    this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false
        that.actionPerm = distinct(res.ActionPermission, "ActionType")

        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        that.isAllowedToCreate = that.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        that.isAllowedToVerify = that.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        that.isToanQuyen = that.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false

        that.dataPerm = distinct(res.DataPermission, "Warehouse")
        // this.getCache()
      }
    })

    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache()
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.curPromotion) {
      this.getCachePromotionDetail();
    }
    
  }
  //#region function chung  

  /**
   * Lấy cache khi oninit
   */
  getCache() {
    this.service.getCachePromotionDetail().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.curPromotion = res;
        this.APIGetPromotionWareHouse(); // Lấy danh sách cửa hàng
        this.APIGetPromotionListGroupOfCard() // Lấy danh sách nhóm thẻ
        this.APIGetPromotionDayOfWeek() // Lấy danh sách ngày trong tuần
        this.getCachePromotionDetail();
      }
    })
  }

  /**
   * Lấy thông tin mới nhất
   */
  loadData(){
    this.APIGetPromotionWareHouse(); // Lấy danh sách cửa hàng
    this.APIGetPromotionListGroupOfCard() // Lấy danh sách nhóm thẻ
    this.APIGetPromotionDayOfWeek() // Lấy danh sách ngày trong tuần
    this.getCachePromotionDetail();
  }

  /**
   * Lấy thông tin chi tiết của CTKM từ cache
   */
  getCachePromotionDetail(){
    this.service.getCachePromotionDetail().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.curPromotion = res;
        // Kiểm tra điều kiện "Chỉnh sửa"
        this.onCheckPermistion();
      }
    })
    
  }

  /**
   * Kiểm tra quyền dùng chức năng
   */
  onCheckPermistion(){
    const canCreateOrAdmin = this.isAllowedToCreate || this.isToanQuyen;
    const canVerify = this.isAllowedToVerify || this.isToanQuyen;
    const statusID = this.curPromotion.StatusID;
  
    // Kiểm tra điều kiện "Chỉnh sửa"
    if (canCreateOrAdmin && (statusID === 0 || statusID === 4 ) || canVerify && statusID === 1) {
      this.isLockAll = false; // Cho phép chỉnh sửa
    } else {
      this.isLockAll = true; // Bị disabled
    }
  }

  /**
   * Hàm xử lý cập nhật khi chechbox của ĐVAP - NTAP - GV được kích hoạt
   * @param ev event
   * @param prop thuộc tính cần cập nhât
   * @param item đối tượng cần được cập nhật
   */
  clickCheckbox(ev: any, prop: string, item: Object) {
    switch (prop) {
      case 'WHName': // Đối với đơn vị áp dụng 
        var wh = item as DTOWarehouse
        if (wh.WH == -1) {
          this.listWareHouse.map(s => {
            if (s.WH != 7 && s.WH != -1) {
              s.IsSelected = ev.target.checked
              this.APIUpdatePromotionWH(s)
            }
          })
        } else {
          wh.IsSelected = ev.target.checked
          this.APIUpdatePromotionWH(wh)
        }
        break
      case 'GroupName': // Đối với nhóm thẻ áp dụng
        var gr = item as DTOGroupOfCard
        gr.IsSelected = ev.target.checked
        this.APIUpdatePromotionListOfCard(gr)
        break
      case 'DayOfWeek': // Đổi với giờ vàng
        var dow = item as DTODayOfWeek
        dow.IsSelected = ev.target.checked
        this.APIUpdatePromotionDayOfWeek(dow)
        break
      default:
        break
    }
  }

  tempGroupOfCard: DTOGroupOfCard;

  /**
   * Hàm xử lý focus của nhóm thẻ cáp dụng
   * @param item nhóm thẻ áp dụng
   */
  focusGroupOfCard(item: DTOGroupOfCard){
    this.tempGroupOfCard = {...item};
  }

  /**
   * Hàm xử lý cập nhật dữ liệu của các thuộc tính được gắn với componet textarea, textbox
   * @param prop thuộc tính cần cập nhật
   * @param item data cẩn cập nhật
   */
  onTextboxLoseBlur(prop: string, item?: any) {
    if (Ps_UtilObjectService.hasValueString(prop)) {
      if(prop == 'Point'){
        var gr = item as DTOGroupOfCard
        if(this.tempGroupOfCard.Point !== gr.Point){
          this.APIUpdatePromotionListOfCard(gr)
        }
      }
    }
  }

  tempTimePicker: DTODayOfWeek;

  /**
   * Hàm xử lý focus của timepicker
   * @param item ngày trong tuần
   */
  focusTimePicker(item: DTODayOfWeek){
    this.tempTimePicker = {...item} // lưu giá trị tạm thời để kiểm tra giá trị cũ mới
  }


  /**
   * Hàm xử lý giá trị khi người dùng chọn ngày
   * @param prop thuộc tính cần cập nhật dữ liệu
   * @param item ngày trong tuần
   */
  onTimePickerChange(prop: string, item?: DTODayOfWeek) {
    const from = JSON.stringify(item[prop]);
    const to =  JSON.stringify(item[prop == 'From' ? 'To' : 'From']);
    if (Ps_UtilObjectService.hasValueString(prop) && this.tempTimePicker[prop] !== item[prop] && from !== to) {
      if (prop == 'From' || prop == 'To') {
        let dow = item as DTODayOfWeek
        this.APIUpdatePromotionDayOfWeek(dow)
      }
    } else {
      for (let i = 0; i < this.listDayOfWeek.length; i++) {
        if (this.listDayOfWeek[i].Code === this.tempTimePicker.Code) {
          this.listDayOfWeek[i] = this.tempTimePicker;
          break; 
        }
      }
      this.layoutService.onWarning(`Giá trị không hợp lệ vui lòng chọn lại`)
    }
  }

  /**
   * Hàm disabled danh sách nhóm thẻ áp dụng
   */
  disableListGroupOfCard() {
    this.listGroupOfCard.forEach(s => {
      if (s.IsSelected) {
        s.IsSelected = false
        this.APIUpdatePromotionListOfCard(s)
      }
    })
  }

  /**
   * Hàm disabled danh sách ngày trong tuần
   */
  disableListDayOfWeek() {
    this.listDayOfWeek.forEach(s => {
      if (s.IsSelected) {
        s.IsSelected = false
        this.APIUpdatePromotionDayOfWeek(s)
      }
    })
  }

  /**
   * Hàm xủa lý reset giờ trong ngày
   * @param dto ngày trong tuần
   */
  resetTimeOfDay(dto: DTODayOfWeek) {
    var dow = this.listDayOfWeek.find(s => s.Code == dto.Code && s.IsSelected == dto.IsSelected)

    if (Ps_UtilObjectService.hasValue(dow)) {
      dow.From = null
      dow.To = null
    }
  }

  /**
   * Hàm xử lý checked all cho NTAP - GV - Thường - Vip theo các loại CTKM
   */
  isCheckboxAllowByPromotionType() {
    // if (this.curPromotionType != null)
    if (Ps_UtilObjectService.hasValue(this.curPromotion.PromotionType))
      // switch (this.curPromotionType.TypeData) {
      switch (this.curPromotion.PromotionType) {
        case 3:// 14://KM Shock
          this.isGoldenHourDisabled = false
          this.isGroupOfCardDisabled = false
          break
        // case 15:
        //   this.isGroupOfCardDisabled = true
        //   this.isGoldenHourDisabled = false
        //   this.disableListGroupOfCard()
        //   break
        case 2://13://KM VIP 
          this.isGoldenHourDisabled = true//cũ
          this.isGroupOfCardDisabled = false
          this.disableListDayOfWeek()
          break
        case 4://11://KM Giờ Vàng 
          this.isGroupOfCardDisabled = true
          this.isGoldenHourDisabled = false
          this.disableListGroupOfCard()
          break
        default://1// 12://KM thường // ẩn hết
          this.isGoldenHourDisabled = true
          this.isGroupOfCardDisabled = true
          this.disableListDayOfWeek()
          this.disableListGroupOfCard()
          break
      }
  }


  defaultPromotionType: DTOPromotionType = new DTOPromotionType(-1, '- Chọn phân nhóm -')

  /**
   * Tạo mới một CTKM
   */
  createNewPromotion() {
    this.listWareHouse.map(s => {
      s.IsSelected = false
    })

    this.listGroupOfCard.map(s => {
      s.IsSelected = false
      s.Point = 0
    })
    this.listDayOfWeek.map(s => {
      s.IsSelected = false
      s.From = null
      s.To = null
    })
    this.isLockAll = false
    this.isGroupOfCardDisabled = true
    this.isGoldenHourDisabled = true
  }
  //#endregion
  
  //#region API  

  /**
   * API lấy danh sách nhóm thẻ áp dụng
   */
  APIGetPromotionListGroupOfCard() {
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách nhóm thẻ áp dụng`
     this.apiService.GetPromotionListGroupOfCard(this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.StatusCode != 0 &&  res.ErrorString != null) {
        this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listGroupOfCard = res.ObjectReturn;
        this.listGroupOfCard['disabled'] = true;
        this.getListGroupOfCard.emit(this.listGroupOfCard);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`${ctx}: ${error}`)
    });
  }

  /**
   * API cập nhật nhóm thẻ áp dụng
   * @param updateDTO Nhóm thẻ áp dụng
   */
  APIUpdatePromotionListOfCard(updateDTO: DTOGroupOfCard) {
    this.loading = true;
    var ctx = "Cập nhật nhóm thẻ áp dụng"
    updateDTO.Promotion = this.curPromotion.Code

    this.apiService.UpdatePromotionListOfCard(updateDTO).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var group = this.listGroupOfCard.find(s => s.GroupCard == updateDTO.GroupCard)

        if (group != undefined)
          group.Code = res.ObjectReturn.Code

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getListGroupOfCard.emit(this.listGroupOfCard);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetPromotionListGroupOfCard();
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionListGroupOfCard();
    });
  }

  /**
   * API lấy danh sách ngày trong tuần
   */
  APIGetPromotionDayOfWeek() {
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách ngày trong tuần`
    this.apiService.GetPromotionDayOfWeek(this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null) {
        this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listDayOfWeek = [];
        (res.ObjectReturn as DTODayOfWeek[]).forEach(s => {
          if (Ps_UtilObjectService.hasValueString(s.From))
            s.From = new Date(s.From)

          if (Ps_UtilObjectService.hasValueString(s.To))
            s.To = new Date(s.To)

          this.listDayOfWeek.push(s)
        })
        this.getListDayOfWeek.emit(this.listDayOfWeek);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`${ctx}: ${error}`)
    });
  }

  /**
   * API cập nhật ngày trong tuần của CTKM
   * @param updateDTO ngày trong tuần
   */
  APIUpdatePromotionDayOfWeek(updateDTO: DTODayOfWeek) {
    this.loading = true;
    var ctx = "Cập nhật Giờ vàng"
    updateDTO.Promotion = this.curPromotion.Code

    this.apiService.UpdatePromotionDayOfWeek(updateDTO).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listDayOfWeek.find(s => s.Config == updateDTO.Config)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getListDayOfWeek.emit(this.listDayOfWeek);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.resetTimeOfDay(updateDTO)
        this.APIGetPromotionDayOfWeek();
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.resetTimeOfDay(updateDTO)
      this.APIGetPromotionDayOfWeek();
    });
  }

  /**
   * API lấy danh sách đơn vị áp dụng 
   */
  APIGetPromotionWareHouse() {
    this.loading = true;
    var ctx = `Đã xảy ra lỗi khi lấy danh sách đơn vị áp dụng`

    this.apiService.GetPromotionWareHouse(this.curPromotion.Code).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (res.ErrorString != null) {
        this.layoutService.onError(`${ctx}: ${res.ErrorString}!`);
      }
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var rs = (res.ObjectReturn as DTOWarehouse[])
        var rsWeb = rs.find(s => s.WH == 7)

        if (rsWeb != undefined) {
          this.listWareHouse[0].Code = rsWeb.Code
          this.listWareHouse[0].Promotion = rsWeb.Promotion
          this.listWareHouse[0].Partner = rsWeb.Partner
          this.listWareHouse[0].IsSelected = rsWeb.IsSelected
        }

        rs.forEach(s => {
          if (s.WH != 7 && this.listWareHouse.findIndex(f => f.WH == s.WH) == -1) {
            this.listWareHouse.push(s)
          }
        })
        this.getListWareHouse.emit(this.listWareHouse);
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.layoutService.onError(`${ctx}: ${error}`)
    });
  }

  /**
   * API cập nhật đơn vị áp dụng
   * @param updateDTO đơn vị áp dụng
   */
  APIUpdatePromotionWH(updateDTO: DTOWarehouse) {
    this.loading = true;
    var ctx = "Cập nhật đơn vị áp dụng"
    updateDTO.Promotion = this.curPromotion.Code
    this.apiService.UpdatePromotionWH(updateDTO).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var wh = this.listWareHouse.find(s => s.WH == updateDTO.WH)

        if (wh != undefined)
          wh.Code = res.ObjectReturn.Code

        this.layoutService.onSuccess(`${ctx} thành công`)
        this.getListWareHouse.emit(this.listWareHouse);
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        this.APIGetPromotionWareHouse();
        
      }
      this.loading = false;
    }, (error) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
      this.loading = false;
      this.APIGetPromotionWareHouse();
    });
  }
  //#endregion


  ngOnDestroy(): void {
    this.ngUnsubscribe$.unsubscribe();
  }
}
