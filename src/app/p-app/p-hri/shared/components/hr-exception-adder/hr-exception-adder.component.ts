import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  GridComponent,
  SelectableSettings,
} from '@progress/kendo-angular-grid';
import {
  plusOutlineIcon,
  plusIcon,
  trashIcon,
  searchIcon,
} from '@progress/kendo-svg-icons';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { HriTransitionApiService } from '../../services/hri-transition-api.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRPolicyPosition } from '../../dto/DTOHRPolicyPosition.dto';
import { DTOHRPolicyLocation } from '../../dto/DTOHRPolicyLocation.dto';
import { DTOHRPolicyTypeStaff } from '../../dto/DTOHRPolicyTypeStaff';
import { StaffApiService } from '../../services/staff-api.service';
import { DTOHRPolicyTask } from '../../dto/DTOHRPolicyTask.dto';
import { DTOHRPolicyMaster } from '../../dto/DTOHRPolicyMaster.dto';
import { RowArgs } from '@progress/kendo-angular-treelist';

@Component({
  selector: 'app-hr-exception-adder',
  templateUrl: './hr-exception-adder.component.html',
  styleUrls: ['./hr-exception-adder.component.scss'],
})
export class HrExceptionAdderComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Nhận vào chính sách cần thêm ngoại lệ
   * @type {DTOHRPolicyMaster}
   */
  @Input() PolicyTask: DTOHRPolicyTask = new DTOHRPolicyTask();

  // NHẬN VÀO GIÁ TRỊ TRUE FALSE ĐỂ MỞ DIALOG MẶC ĐỊNH
  @Input() isOpenDialog: boolean = true;

  /**
   * Nhận vào DTO PolicyMaster
   * @type {DTOHRPolicyMaster}
   */
  @Input() Policy: DTOHRPolicyMaster = new DTOHRPolicyMaster();
  /**
   * TRUYỀN RA GIÁ HÀM ĐÓNG
   * @type {void}
   */
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  /**
   * su kien truyen ra data ngoai le
   */
  @Output() data: EventEmitter<
    DTOHRPolicyTypeStaff[] | DTOHRPolicyPosition[] | DTOHRPolicyLocation[]
  > = new EventEmitter<
    DTOHRPolicyTypeStaff[] | DTOHRPolicyPosition[] | DTOHRPolicyLocation[]
  >();

  // gridview
  @ViewChild('grid') grid: GridComponent;

  isDropdownDisabled: boolean[] = [];

  // danh sach  chinh data ngoai le
  listException: (
    | DTOHRPolicyPosition[]
    | DTOHRPolicyLocation[]
    | DTOHRPolicyTypeStaff[]
  )[] = [];
  listPositionException: DTOHRPolicyPosition[] = [];
  listLocationException: DTOHRPolicyLocation[] = [];
  listTypeStaffException: DTOHRPolicyTypeStaff[] = [];

  // DANH SÁCH DATA CẤP 2
  listChildPosition: DTOHRPolicyPosition[] = [];
  listChildLocation: DTOHRPolicyLocation[] = [];
  listChildTypeStaff: DTOHRPolicyTypeStaff[] = [];
  selectable: SelectableSettings = {
    enabled: true,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  // danh sách ngoại lệ theo
  listModeException: { text: string; value: number }[] = [
    {
      text: 'Chức danh',
      value: 0,
    },
    {
      text: 'Điểm làm việc',
      value: 1,
    },
    {
      text: 'Loại nhân sự',
      value: 2,
    },
  ];

  // gán giá trị đầu tiên của danh sách ngoại lệ theo
  currentListException;
  selectedExceptions: { text: string; value: number }[] = [];
  selectMultiCombobox: (
    | DTOHRPolicyLocation
    | DTOHRPolicyPosition
    | DTOHRPolicyTypeStaff
  )[] = [];

  // placeholder hiển thị lên tìm kiếm theo
  placeHolderFind: string = '';

  // danh sách combobox tìm kiếm chức danh
  ListPolicyPosition: DTOHRPolicyPosition[] = [];
  // ------ dia diem
  ListPolicyLocation: DTOHRPolicyLocation[] = [];
  // --------- loai nhan su
  ListPolicyTypeStaff: DTOHRPolicyTypeStaff[] = [];

  // giá trị hiện tại của tìm kiếm theo chức danh
  currentListPosition: { PositionName: string; Code: number };
  currentListLocation: { LocationName: string; Code: number };
  currentListTypeStaff: { TypeStaffName: string; Code: number };

  // boolean kiem tra parent dang la loai nao
  isParentPosition: boolean = true;
  isParentLocation: boolean = false;
  isParentTypeStaff: boolean = false;

  // danh sách loại nhân sự
  listTpeStaffMode: { text: string; value: number }[] = [
    {
      text: 'Chính thức',
      value: 0,
    },
    {
      text: 'Không chính thức',
      value: 1,
    },
  ];
  // danh sách địa điểm

  //#region VARIABLE ICON
  // icon kendo
  public icons = {
    plusOutlineIcon,
    trashIcon,
    plusIcon,
    searchIcon
  };

  //#endregion

  Unsubscribe = new Subject<void>();

  constructor(
    private layoutService: LayoutService,
    private cdr: ChangeDetectorRef,
    private apiPolicyService: HriTransitionApiService,
    private apiHr: StaffApiService
  ) {}

  //#region ===============================================================
  //#endregion
  //#region LIFECYCLEHOOK

  // HÀM  NGONCHANGES , KIỂM TRA DATA KHI MỞ DIALOG  , GẮN VÀO CÁC MẢNG TỔNG VÀ MẢNG CON
  ngOnChanges(changes: SimpleChanges): void {
    // KIỂM TRA KHI DIALOG OPEN
    if (changes.isOpenDialog && changes.isOpenDialog.currentValue === true) {
      // CALL API
      this.APIGetListHRPolicyPosition();
      this.APIGetListHRTypeStaff();
      this.APIGetListHRPolicyLocation();
      // BIDING DATA
      this.onCheckDataInput();
      //
    }
  }

  // HÀM NGONINIT
  ngOnInit(): void {
    this.placeHolderFind = 'Tìm theo mã và tên chức danh';
    this.listException.push([]);
    this.currentListException = this.listModeException[0];
  }

  // HÀM NGONDESTROY
  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
  //#endregion

  //#region XỬ LÝ EXPANDED DETAIL

  /**
   * HÀM XỬ LÝ ĐÓNG DETAILT
   * @param event sự kiện
   */
  onDetailCollapse(event: any) {
    event.dataItem.expanded = false;
    this.toggleDetailExpanded(event.dataItem);
    // event.expand = false;
  }

  /**
   * HÀM XỬ LÝ MỞ DETAIL
   * @param event SỰ KIỆN
   */
  onDetailExpand(event: any) {
    event.dataItem.expanded = true;
    this.toggleDetailExpanded(event.dataItem);
  }

  /**
   * HÀM XỬ LÝ ĐIỀU KIỆN TỰ ĐỘNG MỞ DETAIL
   * @param param0 DATAITEM , DỮ LIỆU TRÊN GRID
   * @returns
   */
  toggleDetailExpanded({ dataItem }: RowArgs): boolean {
    if (Ps_UtilObjectService.hasListValue(dataItem)) {
      return dataItem.expanded;
    }
  }

  public showOnlyBeveragesDetails(dataItem: any): boolean {
    return dataItem.ListException?.length > 0;
  }

  //#endregion

  //#region KIỂM TRA

  /**
   * KIỂM TRA NẾU CÓ POLICYTASK ĐƯỢC TRUYỀN VÀO
   */
  onCheckDataInput() {
    if (this.PolicyTask?.ListException?.length > 0) {
      // LẤY RA DANH SÁCH LIST EXCEPTION TRONG DATA
      const exceptions = this.PolicyTask.ListException as any[];

      // FILTER LỌC DỮ LIỆU THEO LOẠI (POSITION,LOCATION,TYPESTAFF)
      this.listPositionException = exceptions.filter(
        (item) => item.PositionID !== null && item.PositionID !== undefined
      );
      this.listLocationException = exceptions.filter(
        (item) => item.LocationID !== null && item.LocationID !== undefined
      );

      this.listTypeStaffException = exceptions.filter(
        (item) =>
          item.TypeStaffName !== null && item.TypeStaffName !== undefined
      );

      // ÉP KIỂU DỮ LIỆU VÀ GẮN VÀO MẢNG TỪNG LOẠI
      if (this.listPositionException.length > 0) {
        this.listPositionException = this.castItemsToDTO(
          this.listPositionException,
          DTOHRPolicyPosition
        );
        this.listException.push(this.listPositionException);
      }
      if (this.listLocationException.length > 0) {
        this.listLocationException = this.castItemsToDTO(
          this.listLocationException,
          DTOHRPolicyLocation
        );
        this.listException.push(this.listLocationException);
      }
      if (this.listTypeStaffException.length > 0) {
        this.listTypeStaffException = this.castItemsToDTO(
          this.listTypeStaffException,
          DTOHRPolicyTypeStaff
        );
        this.listException.push(this.listTypeStaffException);
      }
      // LOẠI BỎ CÁC MẢNG TRỐNG TRONG LISTEXCEPTION (LIST TỔNG )
      this.listException = this.listException.filter(
        (array) => array.length > 0
      );
      // KIỂM TRA CÁC LIST ĐỂ HIỂN THỊ DROPDOWN NGOẠI LỆ THEO  VÀ COMBOBOX  TÌM KIẾM NGOẠI LỆ
      this.listException.filter((array) => array.length > 0);
      for (let i = 0; i < this.listException.length; i++) {
        if (
          this.listException[i] !== undefined &&
          this.listException[i] !== null
        ) {
          const hasPositionID = this.listException[i].some(
            (item) => item.PositionID !== null && item.PositionID !== undefined
          );
          const hasLocation = this.listException[i].some(
            (item) => item.LocationID !== null && item.LocationID !== undefined
          );
          const hasTypeStaff = this.listException[i].some(
            (item) =>
              item.TypeStaffName !== null && item.TypeStaffName !== undefined
          );
          if (hasPositionID) {
            this.selectedExceptions[i] = this.listModeException[1];
            this.isDropdownDisabled[i] = true;
            this.isListCombobxPosition[i] = true;
          }
          if (hasLocation) {
            this.selectedExceptions[i] = this.listModeException[2];
            this.isDropdownDisabled[i] = true;
            this.isListComboboxLocation[i] = true;
          }
          if (hasTypeStaff) {
            this.selectedExceptions[i] = this.listModeException[3];
            this.isDropdownDisabled[i] = true;
            this.isListCombobxTypeStaff[i] = true;
          }
        }
      }
      // HÀM KIỂM TRA DISABLED COMBOBOX
      this.onInitCheckCombobx();
      // HÀM KIỂM TRA DISABLED BUTTON TẠO NGOẠI LỆ
      this.onCheckButtonException();
    }
  }

  /**
   * HÀM LẤY DATA CHO COMBOBX TRÊN ROW
   * @param dataItem DATA ĐƯỢC CHỌN ĐỂ KIỂM TRA
   * @returns
   */
  oncheckChildDropdown(dataItem: any) {
    let optionCombobox: any[] = [];
    if (Ps_UtilObjectService.hasValue(dataItem.PositionID)) {
      optionCombobox = this.listModeException.filter(
        (option) => option.value !== 0
      );
    } else if (Ps_UtilObjectService.hasValue(dataItem.LocationID)) {
      optionCombobox = this.listModeException.filter(
        (option) => option.value !== 1
      );
    } else if (Ps_UtilObjectService.hasValue(dataItem.TypeStaffName)) {
      optionCombobox = this.listModeException.filter(
        (option) => option.value !== 2
      );
    }

    return optionCombobox;
  }

  // HÀM KIỂM TRA DATA ĐỂ DISABLED COMBOBOX KHI MỞ DIALOG ĐÃ CỐ DATA SẴN
  onInitCheckCombobx() {
    if (Ps_UtilObjectService.hasListValue(this.listPositionException)) {
      // LỌC LẤY RA CÁC ITEM CÓ LIST EXCEPTION
      const positinItem = this.listPositionException.filter((s) => {
        // NẾU KHÔNG CÓ VALUE TRONG LISTEXCEPTION THÌ TRẢ VỀ [] CHỨ KHÔNG PHẢI NULL
        if (!Ps_UtilObjectService.hasValue(s.ListException)) {
          s.ListException = [];
        }
        return s.ListException.length > 0;
      });
      const locationItem = this.listLocationException.filter((s) => {
        if (!Ps_UtilObjectService.hasValue(s.ListException)) {
          s.ListException = [];
        }
        return s.ListException.length > 0;
      });
      const typeStaffItem = this.listTypeStaffException.filter((s) => {
        if (!Ps_UtilObjectService.hasValue(s.ListException)) {
          s.ListException = [];
        }
        return s.ListException.length > 0;
      });
      this.disabledCombobx = [];

      // POSITION
      positinItem.forEach((s) => {
        s.ListException.forEach((a) => {
          // TÌM ITEM ĐÃ CÓ TRONG DISABLEDCOMBOBX HAY CHƯA
          const existingIndex = this.disabledCombobx.findIndex((item) => {
            return (
              item.dataItem &&
              item.dataItem.Position === s.Position &&
              Ps_UtilObjectService.hasValue(s.Position)
            );
          });
          // LẤY RA ITEM
          const matchingObject = positinItem.find((item) => item === s);
          // KIỂM TRA NẾU CHƯA CÓ TRONG DISABLEDCOMBOBX , THÌ KIỂM TRA ĐANG CÓ CON LÀ GÌ ĐỂ PUSH VALUE CẦN  DISABLED CỦA DATA ĐÓ
          if (existingIndex === -1) {
            if (Ps_UtilObjectService.hasValue(a.Location)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [1],
              });
            } else if (Ps_UtilObjectService.hasValue(a.TypeStaff)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [2],
              });
            }
          } else {
            // LẤY ITEM NẾU CÓ TRONG DISABLED THÌ LẤY RA
            const existingItem = this.disabledCombobx[existingIndex];
            // NẾU LISTEXCEPTION ĐANG CHỨA LOẠI CẤP CON NÀO , THÌ PUSH VALUE TƯƠNG ỨNG ĐỂ DISABLED OPTION TRÊN COMBOBOX
            if (Ps_UtilObjectService.hasValue(a.Location)) {
              if (!existingItem.value.includes(1)) {
                existingItem.value.push(1);
              }
            } else if (Ps_UtilObjectService.hasValue(a.TypeStaff)) {
              if (!existingItem.value.includes(2)) {
                existingItem.value.push(2);
              }
            }
          }
        });
      });

      // LOCATION
      locationItem.forEach((s) => {
        s.ListException.forEach((a) => {
          const existingIndex = this.disabledCombobx.findIndex((item) => {
            return (
              item.dataItem &&
              item.dataItem.Location === s.Location &&
              Ps_UtilObjectService.hasValue(s.Location)
            );
          });
          const matchingObject = locationItem.find((item) => item === s);
          if (existingIndex === -1) {
            if (Ps_UtilObjectService.hasValue(a.Position)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [0],
              });
            } else if (Ps_UtilObjectService.hasValue(a.TypeStaff)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [2],
              });
            }
          } else {
            const existingItem = this.disabledCombobx[existingIndex];
            if (Ps_UtilObjectService.hasValue(a.Position)) {
              if (!existingItem.value.includes(0)) {
                existingItem.value.push(0);
              }
            } else if (Ps_UtilObjectService.hasValue(a.TypeStaff)) {
              if (!existingItem.value.includes(2)) {
                existingItem.value.push(2);
              }
            }
          }
        });
      });
      // TYPESTAFF
      typeStaffItem.forEach((s) => {
        s.ListException.forEach((a) => {
          const existingIndex = this.disabledCombobx.findIndex((item) => {
            return (
              item.dataItem &&
              item.dataItem.TypeStaff === s.TypeStaff &&
              Ps_UtilObjectService.hasValue(s.TypeStaff)
            );
          });
          const matchingObject = typeStaffItem.find((item) => item === s);
          if (existingIndex === -1) {
            if (Ps_UtilObjectService.hasValue(a.Position)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [0],
              });
            } else if (Ps_UtilObjectService.hasValue(a.Location)) {
              this.disabledCombobx.push({
                dataItem: matchingObject,
                value: [1],
              });
            }
          } else {
            const existingItem = this.disabledCombobx[existingIndex];
            if (Ps_UtilObjectService.hasValue(a.Position)) {
              if (!existingItem.value.includes(0)) {
                existingItem.value.push(0);
              }
            } else if (Ps_UtilObjectService.hasValue(a.Location)) {
              if (!existingItem.value.includes(1)) {
                existingItem.value.push(1);
              }
            }
          }
        });
      });
    }
  }
  // HÀM KIỂM TRA DISABLED CHO NÚT TẠO NGOẠI LỆ
  onCheckButtonException() {
    if (Ps_UtilObjectService.hasListValue(this.listException)) {
      const checkException = this.listException.some(
        (array) => array.length == 0
      );
      if (checkException) {
        this.isDisabledBtn = true;
      } else {
        this.isDisabledBtn = false;
      }
      if (this.listException.length === 3) {
        this.isDisabledBtn = true;
      }
    }
  }

  /**
   * HÀM CHECK GIÁ TRỊ COMBOBX
   * @param dataItem DATAITEM
   * @returns
   */
  onCheckValueCombobx(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ) {
    let selectedValue: any = null;

    if (Ps_UtilObjectService.hasListValue(dataItem.ListException)) {
      const hasPosition = dataItem.ListException.some(
        (item) => item.PositionID !== null && item.PositionID !== undefined
      );
      const hasLocation = dataItem.ListException.some(
        (item) => item.LocationID !== null && item.LocationID !== undefined
      );
      const hasTypeStaff = dataItem.ListException.some(
        (item) =>
          item.TypeStaffName !== null && item.TypeStaffName !== undefined
      );

      if (hasPosition) {
        selectedValue = this.listModeException[1];
      }
      if (hasLocation) {
        selectedValue = this.listModeException[2];
      }
      if (hasTypeStaff) {
        selectedValue = this.listModeException[3];
      }
      if (!hasPosition && !hasLocation && !hasTypeStaff) {
        selectedValue = {
          text: '--Chọn--',
          value: null,
        };
      }
    }

    return selectedValue;
  }

  /**
   * GET DATAITEM TRÊN ROW
   * @param dataItem DATAITEM
   */
  getRowData(dataItem: any) {
    this.currentItemCombobox = dataItem;
  }

  // HÀM KIỂM TRA CÁC DỮ LIỆU ĐÃ THÊM ĐỂ ẨN KHỎI DROPDOWN
  onTranformsDataCombobox() {
    // POSITION
    let filteredPosition = [...this.listPosition];
    filteredPosition.forEach((p) => {
      if (Ps_UtilObjectService.hasListValue(this.listPositionException)) {
        const count = this.listPositionException.filter(
          (s) => s.Position === p.Position
        ).length;
        if (count >= 2) {
          filteredPosition = filteredPosition.filter(
            (a) => a.Position !== p.Position
          );
        }
      }
    });

    this.ListPolicyPosition = filteredPosition;

    // LOCATION
    let filteredLocation = [...this.listLocation];
    filteredLocation.forEach((p) => {
      if (Ps_UtilObjectService.hasListValue(this.listLocationException)) {
        const count = this.listLocationException.filter(
          (s) => s.Location === p.Location
        ).length;
        if (count >= 2) {
          filteredLocation = filteredLocation.filter((a) => {
            return a.Location !== p.Location;
          });
        }
      }
    });

    this.ListPolicyLocation = filteredLocation;

    // TYPESTAFF
    let filteredTypeStaff = [...this.listTypeStaff];
    filteredTypeStaff.forEach((p) => {
      if (Ps_UtilObjectService.hasListValue(this.listTypeStaffException)) {
        const count = this.listTypeStaffException.filter(
          (s) => s.TypeStaff === p.TypeStaff
        ).length;
        if (count >= 2) {
          filteredTypeStaff = filteredTypeStaff.filter((a) => {
            return a.TypeStaff !== p.TypeStaff;
          });
        }
      }
    });
    this.ListPolicyTypeStaff = filteredTypeStaff;
  }

  /**
   * HÀM KIỂM TRA LISTEXCEPTION CỦA DATAITEM
   * @param dataItem DATAITEM
   * @returns
   */
  getLastExceptionItem(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ): any {
    const list = dataItem.ListException;
    return list && list.length > 0 ? list[list.length - 1] : null;
  }

  /**
   * KIỂM TRA CÓ NAME TRONG DATA ITEM HAY KHÔNG , HIỂN THỊ ICON XOÁ TRÊN ROW
   * @param dataItem DATAITEM
   * @returns
   */
  checkDataName(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ) {
    let result = false;
    dataItem.ListException?.forEach((s) => {
      if (
        s.LocationName === '' ||
        s.TypeStaffName === '' ||
        s.PositionName === ''
      ) {
        result = true;
      }
    });
    return result;
  }

  /**
   * KIỂM TRA CÓ CHILD TRONG DATA ITEM HAY KHÔNG , HIỂN THỊ ICON XOÁ TRÊN ROW
   * @param dataItem DATAITEM
   * @returns
   */
  checkChildDataItem(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ) {
    return dataItem?.ListException?.length == 0;
  }

  // KIỂM TRA DISABLED NÚT TẠO MỚI NGOẠI LỆ
  isButtonDisabled(): boolean {
    return (
      this.listLocationException.length === 0 &&
      this.listPositionException.length === 0 &&
      this.listTypeStaffException.length === 0
    );
  }

  /**
   *  KIỂM TRA GRID ĐỂ HIỂN THỊ HEADER ĐƠN VỊ TRỰC THUỘC
   * @param listGrid LIST : MẢNG CHỨA
   * @returns
   */
  hasPositionData(listGrid: any[]) {
    return listGrid.every((item) => item instanceof DTOHRPolicyPosition);
  }

  // KIỂM TRA TRẠNG THÁI ĐÓNG MWOR DIALOG
  isCheckVisibilityDialog() {
    return this.isOpenDialog ? 'visible' : 'hidden';
  }

  // HÀM KIỂM TRA DATAITEM ĐỂ DISABLED COMBOBX TRÊN ROW
  /**
   *
   * @param dataItem DATAITEM KIỂM NHẬN VÀO
   * @param index INDEX CỦA DATAITEM
   * @returns
   */
  onCheckVisibility(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ): boolean {
    if (
      dataItem &&
      dataItem.ListException &&
      dataItem.ListException.length > 0
    ) {
      return dataItem.ListException.some(
        (exceptionItem: any) =>
          (exceptionItem.LocationName != undefined &&
            exceptionItem.LocationName != '') ||
          (exceptionItem.PositionName != undefined &&
            exceptionItem.PositionName != '') ||
          (exceptionItem.TypeStaffName != undefined &&
            exceptionItem.TypeStaffName != '')
      );
    }
    return false;
  }

  //#endregion

  //#region ÉP KIỂU

  /**
   * hàm ép kiểu DTO
   * @param dataList là dataItem truyền vào
   * @param dtoClass DTO cần ép kiểu
   * @returns
   */
  castItemsToDTO<T>(dataList: any[], dtoClass: new () => T): T[] {
    if (!Ps_UtilObjectService.hasListValue(dataList)) {
      return [];
    }
    const filteredData = dataList.map((item) => {
      const dto = new dtoClass();
      // key la cac truong co trong dto
      for (const key in dto) {
        if (dto.hasOwnProperty(key) && item.hasOwnProperty(key)) {
          dto[key] = item[key];
          // ep kieu cho listException con
          if (Ps_UtilObjectService.hasListValue(item.ListException)) {
            item.ListException = item.ListException.map((exception) => {
              if (Ps_UtilObjectService.hasValue(exception.Position)) {
                return this.castItemsToDTO([exception], DTOHRPolicyPosition)[0];
              } else if (Ps_UtilObjectService.hasValue(exception.Location)) {
                return this.castItemsToDTO([exception], DTOHRPolicyLocation)[0];
              } else if (Ps_UtilObjectService.hasValue(exception.TypeStaff)) {
                return this.castItemsToDTO(
                  [exception],
                  DTOHRPolicyTypeStaff
                )[0];
              } else {
                return exception;
              }
            });
            (dto as any).ListException = item.ListException;
          }
        }
      }
      return dto;
    });

    return filteredData;
  }

  /**
   * HÀM HỖ TRỢ GẮN GIÁ TRỊ VALUE TỪ COMBOBOX ÉP KIỂU DTO
   * @param dto DTO TRUYỀN VÀO
   * @param e GIÁ TRỊ CẦN ÉP VÀO DTO
   * @returns
   */
  assignMatchingValues<T>(dto: T, e: Partial<T>): T {
    Object.keys(dto).forEach((key) => {
      const typedKey = key as keyof T;
      // NẾU E CÓ CHỨA KEEY NÀY , GÁN GIÁ TRỊ TỪ E VÀO DTO
      if (e.hasOwnProperty(typedKey)) {
        // CHỈ GHE ĐÈ GIÁ TRỊ NẾU NÓ KHÔNG PHẢI LÀ UNDEFINED HOẶC NULL
        dto[typedKey] =
          e[typedKey] !== undefined && e[typedKey] !== null
            ? (e[typedKey] as T[keyof T])
            : dto[typedKey];
      }
    });

    (dto as any).PolicyTask = this.PolicyTask?.Code;
    // (dto as DTOHRPolicyLocation).TypeData = this.Policy?.TypeData;
    return dto;
  }
  //#endregion

  //region DROPDOWN

  // KHAI BÁO BIẾN BOOLEAN HIỂN THỊ COMBOBX CHỌN DATA CẤP 1
  isListCombobxPosition: boolean[] = [];
  isListComboboxLocation: boolean[] = [];
  isListCombobxTypeStaff: boolean[] = [];

  numOfDisabledDropdown: number = -1;

  /**
   * SỰ KIỆN KHI CHỌN DROPDOWN NGOẠI LỆ THEO
   * @param e GIÁ TRỊ ĐƯỢC CHỌN
   * @param index VỊ TRÍ
   * @returns
   */
  onDropdownlistClick(e: any, index: number) {
    // NGỪNG XỬ LÍ NẾU NGOẠI LỆ ĐÃ ĐƯỢC CHỌN TRƯỚC ĐÓ
    e.disabled = true;
    this.numOfDisabledDropdown = e.value;
    this.selectedExceptions[index] = e; // giá trị được chọn của dropdownlist theo index
    this.currentListException = e;
    // disabled dropdown theo index
    this.isListCombobxPosition[index] = false;
    this.isListComboboxLocation[index] = false;
    this.isListCombobxTypeStaff[index] = false;

    let arrayToAdd;
    let defaultDTO;

    switch (this.currentListException.value) {
      case 0:
        arrayToAdd = this.listPositionException;
        this.isListCombobxPosition[index] = true;
        defaultDTO = new DTOHRPolicyPosition();
        break;
      case 1:
        this.isListComboboxLocation[index] = true;

        arrayToAdd = this.listLocationException;
        defaultDTO = new DTOHRPolicyLocation();
        break;
      case 2:
        this.isListCombobxTypeStaff[index] = true;

        arrayToAdd = this.listTypeStaffException;
        defaultDTO = new DTOHRPolicyTypeStaff();
        break;
      default:
        return;
    }
    this.listException[index] = arrayToAdd;
  }

  /**
   * SỰ KIỆN DISABLED ITEM ĐÃ HỌN
   * @param itemArgs CHỨA DATAITEM VÀ INDEX
   * @returns
   */
  public handleDisabledDropdown(itemArgs: { dataItem: any; index: number }) {
    const disabledValues = [
      this.selectedExceptions[0]?.value,
      this.selectedExceptions[1]?.value,
      this.selectedExceptions[2]?.value,
    ];
    return disabledValues.includes(itemArgs.dataItem.value);
  }

  /**
   * SỰ KIỆN KHI CHỌN  DROPDOWN TÌM KIẾM POSITION CẤP 1
   * @param e GIÁ TRỊ ĐƯỢC CHỌN
   * @param index VỊ TRÍ
   * @param combobox KENDO COMBOBOX : DÙNG ĐỂ SET VALUE THÀNH NULL
   */
  onDropdownPositionClick(
    e: DTOHRPolicyPosition,
    index: number,
    combobox: any
  ) {
    this.isDisabledBtn = false;
    this.isDropdownDisabled[index] = true;

    if (
      Ps_UtilObjectService.hasListValue(e) &&
      Ps_UtilObjectService.hasListValue(e.ListException) &&
      e.ListException.length > 0
    ) {
      e.ListException = [];
    }
    if (Ps_UtilObjectService.hasListValue(e)) {
      // this.currentItemCombobox = e;
      const position = new DTOHRPolicyPosition();
      this.assignMatchingValues(position, e);
      position.TypeData = 1;
      this.listPositionException.push(position);
    }

    this.currentListPosition = null;
    combobox.value = null;
    this.cdr.detectChanges();
  }

  /**
   * SỰ KIỆN KHI CHỌN DROPDOWN TÌM KIẾM LOCATION CẤP 1
   * @param e GIÁ TRỊ ĐƯỢC CHỌN
   * @param index VỊ TRÍ
   * @param combobox KENDO COMBOBOX : DÙNG ĐỂ SET VALUE THÀNH NULL
   */
  onDropdownLocationClick(
    e: DTOHRPolicyLocation,
    index: number,
    combobox: any
  ) {
    this.isDisabledBtn = false;
    this.isDropdownDisabled[index] = true;

    if (
      Ps_UtilObjectService.hasListValue(e) &&
      Ps_UtilObjectService.hasListValue(e.ListException) &&
      e.ListException.length > 0
    ) {
      e.ListException = [];
    }
    if (Ps_UtilObjectService.hasListValue(e)) {
      // this.currentItemCombobox = e;
      let location = new DTOHRPolicyLocation();
      this.assignMatchingValues(location, e);
      location.TypeData = 2;
      this.listLocationException.push(location);
    }

    this.currentListLocation = null;
    combobox.value = null;
    this.cdr.detectChanges();
  }

  /**
   * SỰ KIỆN KHI CHỌN DROPDOWN TÌM KIẾM TYPESTAFF CẤP 1
   * @param e GIÁ TRỊ ĐƯỢC CHỌN
   * @param index VỊ TRÍ
   * @param combobox KENDO COMBOBOX : DÙNG ĐỂ SET VALUE THÀNH NULL
   */
  onDropdownTypeStaffClick(
    e: DTOHRPolicyTypeStaff,
    index: number,
    combobox: any
  ) {
    this.isDisabledBtn = false;
    this.isDropdownDisabled[index] = true;

    if (
      Ps_UtilObjectService.hasListValue(e) &&
      Ps_UtilObjectService.hasListValue(e.ListException) &&
      e.ListException.length > 0
    ) {
      e.ListException = [];
    }
    if (Ps_UtilObjectService.hasListValue(e)) {
      // this.currentItemCombobox = e;
      let typeStaff = new DTOHRPolicyTypeStaff();
      this.assignMatchingValues(typeStaff, e);
      typeStaff.TypeData = 3;
      this.listTypeStaffException.push(typeStaff);
    }

    this.currentListTypeStaff = null;
    combobox.value = null;
    this.cdr.detectChanges();
  }

  // HÀM XỬ LÍ KHI CHỌN GIÁ TRỊ CỦA COMBOBOX TRÊN ROW

  /**
   *
   * @param e GIÁ TRỊ OPTIONS TRONG COMBOBOX ĐƯỢC CHỌN
   * @param dataItem DATA CẦN  XỬ LÍ
   * @param index INDEX CỦA DATA ĐANG XỬ LÍ
   */
  onComboboxFirstChild(e: any, dataItem: any) {
    // KIỂM TRA ĐỂ DISABLED ITEM KHI NHẤN VÀO OPTIONS CHỌN
    if (!Ps_UtilObjectService.hasValue(e.value)) {
      dataItem.ListException = [];
      dataItem.expanded = false;
      this.toggleDetailExpanded(dataItem);
      let value: number = -1;
      value = this.getExceptionValue(dataItem);

      // HÀM TÌM ITEM LÀ DATAITEM ĐANG CÓ TRONG DISABLEDCOMBOBOX
      const itemInCombobx = this.onFindItemDisabledCombobox(dataItem);
      // XOÁ VALUE TRONG MẢNG CHỨA , UNDISABLED
      if (value == -1) {
        itemInCombobx.value = [];
      } else {
        if (Ps_UtilObjectService.hasValue(itemInCombobx)) {
          const valueIndex = itemInCombobx.value?.indexOf(value);
          if (valueIndex !== -1) {
            itemInCombobx.value.splice(valueIndex, 1);
          }
        }
      }
    } else {
      const existingIndex = this.onFindExistingIndexInCombobox(dataItem);
      // let chooseTypeLevelTwo = e;
      this.currentComboboxLevel2 = e;
      dataItem.ListException = JSON.parse(
        JSON.stringify(dataItem.ListException || [])
      );
      let data = dataItem;

      // NẾU CÓ VALUE E , THÊM DTO CẤP CON
      if (Ps_UtilObjectService.hasListValue(e)) {
        dataItem.expanded = true;
        this.toggleDetailExpanded(dataItem);
        this.onFirstChildDynamic(data, e);
      }

      // KIỂM TRA SỐ LƯỢNG ITEM ĐÃ CÓ TRONG MẢNG CHƯA DISABLEDCOMBOBOX (MẢNG CHỨA ITEM ĐỂ DISABLED)
      let length: number = -1;
      length = this.getLength(dataItem);

      if (existingIndex === -1) {
        this.disabledCombobx.push({
          dataItem: dataItem,
          value: [e.value],
        });
      } else {
        if (length === 1) {
          this.disabledCombobx[existingIndex].value = [e.value];
        } else {
          let listItem: any;
          listItem = this.onGetItemHasLisE(dataItem);

          if (listItem.length === 1) {
            this.disabledCombobx[existingIndex].value = [e.value];
          } else {
            this.disabledCombobx[existingIndex].value.push(e.value);
          }
        }
      }
    }
  }

  disabledCombobx: { dataItem: any; value: number[] }[] = [];
  currentItemCombobox: any = null;

  /**
   * SỰ KIÊN KHI CHỌN DATA Ở COMBOBOX LEVEL 2
   * @param e GIÁ TRỊ TRÊN COMBOBOX
   * @param dataItem DATAITEM ĐANG XỬ LÍ
   * @returns
   */
  currentComboboxLevel2: any;

  onComboboxDataTwoLevelClick(e: any, dataItem: any, comboboxChild: any) {
    if (!Ps_UtilObjectService.hasValue(e)) {
      return;
    }
    let data = dataItem;

    if (e.Location) {
      this.onExceptionHandleDynamic(data, e, 2);
    } else if (e.Position) {
      this.onExceptionHandleDynamic(data, e, 1);
    } else if (e.TypeStaff) {
      this.onExceptionHandleDynamic(data, e, 3);
    } else {
      this.layoutService.onError('Unknown event structure or properties');
    }
    this.removeEmptyNameObjects(data);
    comboboxChild.value = null;
    this.cdr.detectChanges();
  }

  /**
   *HÀM XOÁ CÁC ĐỐI TƯỢNG CÓ TÊN TRỐNG
   * @param dataItem DATAITEM CẦN KIỂM TRA
   */
  removeEmptyNameObjects(dataItem: any) {
    if (dataItem.ListException && Array.isArray(dataItem.ListException)) {
      // Lọc các đối tượng không có tên hợp lệ
      dataItem.ListException = dataItem.ListException.filter((item) => {
        if (item instanceof DTOHRPolicyLocation) {
          return item.LocationName && item.LocationName.trim() !== '';
        } else if (item instanceof DTOHRPolicyPosition) {
          return item.PositionName && item.PositionName.trim() !== '';
        } else if (item instanceof DTOHRPolicyTypeStaff) {
          return item.TypeStaffName && item.TypeStaffName.trim() !== '';
        }
        return false;
      });
    }
  }

  // level 3
  multiSelectedItem: any[] = [];

  /**
   *HÀM XỬ LÍ THÊM NGOẠI LỆ CẤP 3
   * @param selectedItems CÁC ITEM CẤP 3 ĐƯỢC CHỌN
   * @param dataItem DATAITEM
   * @param index INDEX CỦA DATAITEM
   * @returns
   */

  onMultiselectDropdown(
    selectedItems:
      | DTOHRPolicyLocation[]
      | DTOHRPolicyPosition[]
      | DTOHRPolicyTypeStaff[],
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    index: number
  ) {
    let exceptionItem = dataItem.ListException[index];
    if (!selectedItems || selectedItems.length === 0) {
      exceptionItem.ListException = [];
      return;
    }

    if (!dataItem.ListException) {
      dataItem.ListException = [];
    }
    dataItem.ListException[index].ListException = [];

    selectedItems.forEach((e) => {
      if (e.LocationName) {
        this.onExceptionHandleDynamic(exceptionItem, e, 2);
      } else if (e.PositionName) {
        this.onExceptionHandleDynamic(exceptionItem, e, 1);
      } else if (e.TypeStaffName) {
        this.onExceptionHandleDynamic(exceptionItem, e, 3);
      }
    });
    this.cdr.detectChanges();
  }
  //#endregion

  // select

  //#region HANDLE
  // HANDLE KHI BẤM VÀO BUTTON TẠO MỚI NGOẠI LỆ
  isDisabledBtn: boolean = true;
  handleCreateException() {
    this.currentListTypeStaff = null;
    const containsEmptyArray = this.listException.some(
      (item) => Array.isArray(item) && item.length === 0
    );

    if (containsEmptyArray) {
      this.isDisabledBtn = true;
      this.layoutService.onError(
        'Vui lòng thêm ngoại lệ trước đó để tạo mới ngoại lệ'
      );
    } else {
      this.isDisabledBtn = true;
      this.listException.push([]);
    }
  }

  // HÀM CẬP NHẬT NGOẠI LỆ , TRUYỀN OUTPUT
  onUpdateException() {
    // Combine all exceptions into one array
    const allExceptions: any = [
      ...this.listLocationException,
      ...this.listPositionException,
      ...this.listTypeStaffException,
    ];
    allExceptions.forEach((item) => {
      if (Ps_UtilObjectService.hasListValue(item.ListException)) {
        item.PolicyTask = this.PolicyTask?.Code;
        item.ListException = item.ListException.filter(
          (exception: any) =>
            exception.PositionID !== '' &&
            exception.LocationID !== '' &&
            exception.TypeStaffName !== ''
        );
        item.ListException?.forEach((exc) => {
          if (!Ps_UtilObjectService.hasValue(exc.PolicyTask)) {
            exc.PolicyTask = this.PolicyTask?.Code;
          }
          exc.ListException?.forEach((child) => {
            child.PolicyTask = this.PolicyTask?.Code;
          });
        });
      }
    });
    // LỌC VÀ KIỂM TRA CHỈ GIỮ LẠI 1 ITEM NẾU LISTEXCEP ĐỀU LÀ []
    const filteredExceptions = allExceptions.filter((item, index, self) => {
      const duplicateIndex = self.findIndex((other) => {
        return (
          item.PositionID === other.PositionID &&
          item.LocationID === other.LocationID &&
          item.TypeStaffName === other.TypeStaffName &&
          JSON.stringify(item.ListException) ===
            JSON.stringify(other.ListException)
        );
      });
      return (
        duplicateIndex === index ||
        (item.ListException?.length > 0 &&
          self[duplicateIndex].ListException.length === 0)
      );
    });

    // LOẠI BỎ TRƯỜNG EXPANDED TRONG CÁC ITEM
    filteredExceptions.map(({ expanded, ...rest }) => rest);
    this.onClose(1, filteredExceptions);
    this.layoutService.onSuccess('Cập nhật ngoại lệ thành công');
  }

  /**
   * HÀM XỬ LÍ DISABLED OPTIONS TRONG COMBOBOX TRÊN ROW
   * @param itemArgs CHỨA DATAITEM , INDEX CẦN DISABLED
   * @returns
   */
  public itemDisabledCombobx(itemArgs: { dataItem: any; index: number }) {
    if (!this.currentItemCombobox) {
      return false;
    }

    for (let i = 0; i < this.disabledCombobx.length; i++) {
      if (
        (this.disabledCombobx[i].dataItem.PositionID ===
          this.currentItemCombobox.PositionID &&
          Ps_UtilObjectService.hasValue(this.currentItemCombobox.PositionID)) ||
        (this.disabledCombobx[i].dataItem.LocationID ===
          this.currentItemCombobox.LocationID &&
          Ps_UtilObjectService.hasValue(this.currentItemCombobox.LocationID)) ||
        (this.disabledCombobx[i].dataItem.TypeStaff ===
          this.currentItemCombobox.TypeStaff &&
          Ps_UtilObjectService.hasValue(this.currentItemCombobox.TypeStaff))
      ) {
        let listValue = this.disabledCombobx[i].value;
        return listValue.includes(itemArgs.dataItem.value);
      }
    }
    return false;
  }

  //#endregion

  //#region REMOVE

  /**
   * HÀM XOÁ DATAITEM
   * @param dataItem DATAITEM CẤP CHA CẦN XOÁ
   */
  onRemoveException(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    index: number
  ) {
    // UNDISABLED COMBOBX CHILD
    let dataCode: string;
    let itemInCombobx: any;
    let value: number;
    // UNDISABLED COMBOBX CHILD

    // KIỂM TRA DATAITEM CẤP 1 ĐANG LÀ LOẠI GÌ
    if ('PositionID' in dataItem) {
      dataCode = dataItem.PositionID;
      // TÌM CẤP CON LÀ GÌ , ĐỂ GẮN VALUE TƯƠNG ỨNG VỚI CẤP CON
      if (dataItem.ListException) {
        for (const exception of dataItem.ListException) {
          if ('LocationID' in exception) {
            value = 1;
            break;
          } else if ('TypeStaffName' in exception) {
            value = 2;
            break;
          }
        }
      }
    }
    // LOCATION
    else if ('LocationID' in dataItem) {
      dataCode = dataItem.LocationID;

      if (dataItem.ListException) {
        for (const exception of dataItem.ListException) {
          if ('PositionID' in exception) {
            value = 0;
            break;
          } else if ('TypeStaffName' in exception) {
            value = 2;
            break;
          }
        }
      }
    }
    // TYPESTAFF
    else if ('TypeStaffName' in dataItem) {
      dataCode = dataItem.TypeStaffName;

      if (dataItem.ListException) {
        for (const exception of dataItem.ListException) {
          if ('PositionID' in exception) {
            value = 0;
            break;
          } else if ('LocationID' in exception) {
            value = 1;
            break;
          }
        }
      }
    }
    //KIỂM TRA MẢNG CHỨA

    itemInCombobx = this.disabledCombobx.find(
      (x) =>
        x.dataItem.PositionID == dataCode ||
        x.dataItem.TypeStaffName == dataCode ||
        x.dataItem.LocationID == dataCode
    );
    // XOÁ VALUE TRONG MẢNG CHỨA , UNDISABLED
    if (Ps_UtilObjectService.hasValue(itemInCombobx)) {
      const valueIndex = itemInCombobx.value?.indexOf(value);
      if (valueIndex !== -1) {
        itemInCombobx.value.splice(valueIndex, 1);
      }
    }

    // REMOVE LIST

    const list = [
      this.listTypeStaffException,
      this.listLocationException,
      this.listPositionException,
    ];

    list.forEach((listItem: any) => {
      const matchedItem = listItem.find((item) => {
        return item.ListException === dataItem.ListException;
      });
      if (matchedItem) {
        const innerIndex = listItem.indexOf(matchedItem);
        if (innerIndex !== -1) {
          listItem.splice(innerIndex, 1);
          this.layoutService.onSuccess('Xoá ngoại lệ thành công ');
        }
      }
    });
    // KIỂM TRA LẠI DỮ LIỆU ĐỂ DISABLED OPTITON TRONG DROPDOWN NGOẠI LỆ THEO
    // if (
    //   this.listLocationException.length == 0 ||
    //   this.listPositionException.length == 0 ||
    //   this.listTypeStaffException.length == 0
    // ) {
    //   this.isDropdownDisabled[index] = false;
    // }
    if (Ps_UtilObjectService.hasListValue(this.listException)) {
      // const exist = this.listException.findIndex((s) => s.length == 0);
      if (index !== -1) {
        this.isDropdownDisabled[index] = false;
      }
    }
    this.onCheckButtonException();
    if (list) this.cdr.detectChanges();
  }

  /**
   * HÀM XOÁ ITEM TRONG LISTEXCEPTION CỦA DATAITEM
   * @param dataItem DATAITEM
   * @param childItem ITEM CON TRONG LISTEXCEPTION
   */
  onRemoveChildException(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    childItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ) {
    let dataCode: number;
    let item: any;
    let itemInCombobx: any;
    let value: number;

    // UNDISABLED COMBOBX CHILD
    if ('Position' in dataItem) {
      dataCode = dataItem.Position;
      item = this.listPositionException.filter(
        (item) => item.Position === dataCode && item.ListException.length > 0
      );
      item.forEach((s) => {
        // item.filter(s=>s.TypeStaff == childItem.)
        if (s.ListException.length == 1) {
          if (
            Ps_UtilObjectService.hasListValue(s) &&
            Ps_UtilObjectService.hasListValue(s.ListException)
          ) {
            for (const exception of s.ListException) {
              if (Ps_UtilObjectService.hasListValue(exception)) {
                let item: any;
                if (
                  exception.Location == (childItem as any).Location ||
                  exception.TypeStaff == (childItem as any).TypeStaff
                ) {
                  item = exception;
                }

                if (Ps_UtilObjectService.hasValue(item?.Location)) {
                  value = 1;
                  break;
                } else if (Ps_UtilObjectService.hasValue(item?.TypeStaff)) {
                  value = 2;
                  break;
                }
              }
            }
          }
        }
      });
    } else if ('Location' in dataItem) {
      dataCode = dataItem.Location;
      item = this.listLocationException.filter(
        (item) => item.Location === dataCode && item.ListException.length > 0
      );
      item.forEach((s) => {
        if (s.ListException.length == 1) {
          if (
            Ps_UtilObjectService.hasValue(s) &&
            Ps_UtilObjectService.hasValue(s.ListException)
          ) {
            for (const exception of s.ListException) {
              if (Ps_UtilObjectService.hasValue(exception)) {
                let item: any;
                if (
                  exception.Position == (childItem as any).Position ||
                  exception.TypeStaff == (childItem as any).TypeStaff
                ) {
                  item = exception;
                }

                if (Ps_UtilObjectService.hasValue(item?.Position)) {
                  value = 0;
                  break;
                } else if (Ps_UtilObjectService.hasValue(item?.TypeStaff)) {
                  value = 2;
                  break;
                }
              }
            }
          }
        }
      });
    } else if ('TypeStaff' in dataItem) {
      dataCode = dataItem.TypeStaff;
      item = this.listTypeStaffException.filter(
        (item) => item.TypeStaff === dataCode && item.ListException.length > 0
      );
      item.forEach((s) => {
        if (s.ListException.length == 1) {
          if (
            Ps_UtilObjectService.hasValue(s) &&
            Ps_UtilObjectService.hasValue(s.ListException)
          ) {
            for (const exception of s.ListException) {
              if (Ps_UtilObjectService.hasValue(exception)) {
                let item: any;
                if (
                  exception.Location == (childItem as any).Location ||
                  exception.Position == (childItem as any).Position
                ) {
                  item = exception;
                }

                if (Ps_UtilObjectService.hasValue(item?.Position)) {
                  value = 0;
                  break;
                } else if (Ps_UtilObjectService.hasValue(item?.Location)) {
                  value = 1;
                  break;
                }
              }
            }
          }
        }
      });
    }

    //KIỂM TRA ITEM TRONG MẢNG LƯU TRỮ CÁC ITEM ĐÃ ĐƯỢC CHỌN
    itemInCombobx = this.disabledCombobx.find(
      (x) =>
        x.dataItem.Position == dataCode ||
        x.dataItem.TypeStaff == dataCode ||
        x.dataItem.Location == dataCode
    );
    // UNDISABLED VALUE ITEM ĐÃ CHỌN TRONG MẢNG CHỨA
    if (itemInCombobx) {
      const valueIndex = itemInCombobx.value.indexOf(value);

      if (valueIndex !== -1) {
        itemInCombobx.value.splice(valueIndex, 1);
      }
    }

    // REMOVE ITEM
    const index = (dataItem as any).ListException.indexOf(childItem);
    if (index !== -1) {
      (dataItem as any).ListException.splice(index, 1);
      this.layoutService.onSuccess('Xoá cấp con thành công ');
    }
  }

  // END REGION

  //#region FILTER LIST DROPDOWN

  /**
   *
   * @param dataItem dataitem
   * @param typeList loại danh sách
   */
  onFilterListChildCombobox(dataItem: any, typeList: number) {
    // Initialize child lists
    this.listChildPosition = [...this.listPosition];
    this.listChildTypeStaff = [...this.listTypeStaff];
    this.listChildLocation = [...this.listLocation];

    const exceptions = dataItem?.ListException || [];

    exceptions.forEach((exception) => {
      switch (typeList) {
        case 1: // Chuc danh
          this.listChildPosition = this.listChildPosition.filter(
            (p) => p.Position !== exception.Position
          );
          this.filteredChildPosition = [...this.listChildPosition];
          break;

        case 2: // Diem lam viec
          this.listChildLocation = this.listChildLocation.filter(
            (l) => l.Location !== exception.Location
          );
          this.filteredChildLocation = [...this.listChildLocation];
          break;

        case 3: // Loai nhan su
          this.listChildTypeStaff = this.listChildTypeStaff.filter(
            (s) => s.TypeStaff !== exception.TypeStaff
          );
          this.filteredChildTypeStaff = [...this.listChildTypeStaff];

          break;

        default:
          break;
      }
    });
  }

  //#endregion

  //#region FILTER

  /**
   * FILTER CHO COMBOBOX
   * @param value GIÁ TRỊ TÌM KIẾM NHẬN VÀO
   * @param field CÁC TRƯỜNG CẦN TÌM KIẾM
   */
  onHandleFilter(value: string, field: string) {
    this.onTranformsDataCombobox();
    const fieldMapping = {
      PositionName: 'ListPolicyPosition',
      LocationName: 'ListPolicyLocation',
      TypeStaffName: 'ListPolicyTypeStaff',
    };

    const trimmedValue = value.trim().toLowerCase();
    let filteredData: any = [];

    if (field == 'PositionName') {
      filteredData = this.ListPolicyPosition.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['PositionID']?.toLowerCase().includes(trimmedValue)
        );
      });
    } else if (field == 'LocationName') {
      filteredData = this.ListPolicyLocation.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['LocationID']?.toLowerCase().includes(trimmedValue)
        );
      });
    } else if (field == 'TypeStaffName') {
      filteredData = this.ListPolicyTypeStaff.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['ListID']?.toLowerCase().includes(trimmedValue)
        );
      });
    }

    this[fieldMapping[field]] = filteredData;
  }

  /**
   * FILTER CHO CHILD COMBOBOX
   * @param value GIÁ TRỊ TÌM KIẾM NHẬN VÀO
   * @param field CÁC TRƯỜNG CẦN TÌM KIẾM
   */
  filteredChildPosition: DTOHRPolicyPosition[] = [];
  filteredChildLocation: DTOHRPolicyLocation[] = [];
  filteredChildTypeStaff: DTOHRPolicyTypeStaff[] = [];

  onHandleChildFilter(value: string, field: string) {
    this.onTranformsDataCombobox();
    const fieldMapping = {
      PositionName: 'filteredChildPosition',
      LocationName: 'filteredChildLocation',
      TypeStaffName: 'filteredChildTypeStaff',
    };

    const trimmedValue = value.trim().toLowerCase();
    let filteredData: any = [];

    if (field == 'PositionName') {
      filteredData = this.listChildPosition.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['PositionID']?.toLowerCase().includes(trimmedValue)
        );
      });
    } else if (field == 'LocationName') {
      filteredData = this.listChildLocation.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['LocationID']?.toLowerCase().includes(trimmedValue)
        );
      });
    } else if (field == 'TypeStaffName') {
      filteredData = this.listChildTypeStaff.filter((item) => {
        return (
          item[field]?.toLowerCase().includes(trimmedValue) ||
          item['ListID']?.toLowerCase().includes(trimmedValue)
        );
      });
    }

    this[fieldMapping[field]] = filteredData;
  }

  /**
   *
   * @param event sự kiện click remove tag
   * @param dataItem data chọn để remove tag
   * @param index index của data removetag
   */
  public removeTag(event: any, dataItem: any, index: number) {
    let exceptionItem = dataItem.ListException[index];
    for (let i = exceptionItem.ListException.length - 1; i >= 0; i--) {
      if (exceptionItem.ListException[i] === event.dataItem) {
        exceptionItem.ListException.splice(i, 1);
      }
    }
  }

  //#endregion

  //#region ======================================
  //#endregion
  //#region HÀM DÙNG CHUNG

  /**
   * HÀM TÌM ITEM TRONG DISABLEDCOMBOBOX
   * @param dataItem DATAITEM CẦN TÌM TRONG DISABLEDCOMBOBOX
   */
  onFindItemDisabledCombobox(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ) {
    return this.disabledCombobx.find((x) => {
      if ('Position' in dataItem) {
        return (
          x.dataItem.Position === dataItem.Position &&
          Ps_UtilObjectService.hasValue(dataItem.Position)
        );
      } else if ('TypeStaff' in dataItem) {
        return (
          x.dataItem.TypeStaff === dataItem.TypeStaff &&
          Ps_UtilObjectService.hasValue(dataItem.TypeStaff)
        );
      } else if ('Location' in dataItem) {
        return (
          x.dataItem.Location === dataItem.Location &&
          Ps_UtilObjectService.hasValue(dataItem.Location)
        );
      }
      return false;
    });
  }

  /**
   * HÀM TÌM KIẾM INDEX CỦA ITEM TRONG DISABLEDCOMBOBX
   * @param dataItem DATAITEM
   * @returns
   */
  onFindExistingIndexInCombobox(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyLocation
  ) {
    return this.disabledCombobx.findIndex((item) => {
      if ('PositionID' in dataItem) {
        return (
          item.dataItem.PositionID === dataItem.PositionID &&
          Ps_UtilObjectService.hasValue(dataItem.PositionID)
        );
      } else if ('LocationID' in dataItem) {
        return (
          item.dataItem.LocationID === dataItem.LocationID &&
          Ps_UtilObjectService.hasValue(dataItem.LocationID)
        );
      } else if ('TypeStaff' in dataItem) {
        return (
          item.dataItem.TypeStaff === dataItem.TypeStaff &&
          Ps_UtilObjectService.hasValue(dataItem.TypeStaff)
        );
      }
      return false;
    });
  }

  /**
   * HÀM DYNAMIC XỦ LÝ TÌM LENGTH CỦA LIST THEO DATAITEM
   * @param dataItem DATAITEM
   * @returns
   */
  getLength(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ): number {
    const properties = ['Position', 'Location', 'TypeStaff'];
    const lists = [
      this.listPositionException,
      this.listLocationException,
      this.listTypeStaffException,
    ];

    for (let i = 0; i < properties.length; i++) {
      if (Ps_UtilObjectService.hasValue(dataItem[properties[i]])) {
        const list = lists[i] as any[];
        return list.filter(
          (item: any) => item[properties[i]] === dataItem[properties[i]]
        ).length;
      }
    }
    return -1;
  }

  /**
   * HÀM KIỂM TRA ITEM TRONG DISABLEDCOMBOBOX ,LẤY RA VALUE ĐỂ XỬ LÝ DISABLED OPTITON
   * @param dataItem DATAITEM
   * @returns
   */
  getExceptionValue(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff
  ): number {
    const mapping = {
      PositionID: { LocationID: 2, TypeStaffName: 1 },
      LocationID: { PositionID: 2, TypeStaffName: 0 },
      TypeStaffName: { PositionID: 1, LocationID: 0 },
    };

    const lists = {
      PositionID: this.listPositionException,
      LocationID: this.listLocationException,
      TypeStaffName: this.listTypeStaffException,
    };

    let result = -1;

    for (const propertyName in mapping) {
      if (Ps_UtilObjectService.hasValue(dataItem[propertyName])) {
        const itemFilter = lists[propertyName].filter(
          (s) => s[propertyName] === dataItem[propertyName]
        );
        itemFilter.forEach((a) => {
          if (Ps_UtilObjectService.hasListValue(a.ListException)) {
            a.ListException.forEach((b) => {
              for (const key in mapping[propertyName]) {
                if (Ps_UtilObjectService.hasValue(b[key])) {
                  result = mapping[propertyName][key];
                }
              }
            });
          }
        });
      }
    }

    return result;
  }

  /**
   * HÀM LỌC FILTER ITEM LÀ DATAITEM CÓ LISTEXCEPTION
   * @param dataItem DATAITEM
   */
  onGetItemHasLisE(dataItem) {
    let listItem = null;

    if (Ps_UtilObjectService.hasValue(dataItem.Position)) {
      listItem = this.listPositionException.filter(
        (item) =>
          item.Position === dataItem.Position && item.ListException.length > 0
      );
    }
    if (Ps_UtilObjectService.hasValue(dataItem.Location)) {
      listItem = this.listLocationException.filter(
        (item) =>
          item.Location === dataItem.Location && item.ListException.length > 0
      );
    }
    if (Ps_UtilObjectService.hasValue(dataItem.TypeStaff)) {
      listItem = this.listTypeStaffException.filter(
        (item) =>
          item.TypeStaff === dataItem.TypeStaff && item.ListException.length > 0
      );
    }

    return listItem;
  }

  /**
   * HÀM DYNAMIC THÊM DTO CẤP CON
   * @param dataItem DATAITEM CẦN THÊM CẤP CON
   * @param e GIÁ TRỊ CẤP CON THÊM VÀO
   * @returns
   */
  onFirstChildDynamic(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    e: any
  ) {
    let defaultDTO;

    switch (e.value) {
      case 0:
        defaultDTO = new DTOHRPolicyPosition();
        break;
      case 1:
        defaultDTO = new DTOHRPolicyLocation();
        break;
      case 2:
        defaultDTO = new DTOHRPolicyTypeStaff();
        break;
      default:
        this.layoutService.onError(
          `Unexpected exception type:${this.currentListException.value}`
        );
        return;
    }

    if (dataItem.ListException && dataItem.ListException.length === 0) {
      dataItem.ListException.push(defaultDTO);
    } else {
      dataItem.ListException = dataItem.ListException.map((exception) => {
        if (
          !Ps_UtilObjectService.hasValue(exception.Position) ||
          !Ps_UtilObjectService.hasValue(exception.Location) ||
          !Ps_UtilObjectService.hasValue(exception.TypeStaff)
        ) {
          return defaultDTO;
        }
        return exception;
      });
    }
    (dataItem as any).expanded = true;
  }

  onExceptionHandleDynamic(
    dataItem: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    e: DTOHRPolicyLocation | DTOHRPolicyPosition | DTOHRPolicyTypeStaff,
    type: number
  ) {
    let defaultDTO;

    switch (type) {
      case 1:
        defaultDTO = new DTOHRPolicyPosition();
        break;
      case 2:
        defaultDTO = new DTOHRPolicyLocation();
        break;
      case 3:
        defaultDTO = new DTOHRPolicyTypeStaff();
        break;
      default:
        this.layoutService.onError('Unknown event structure or properties');
        return;
    }

    let itemExists = false;

    if ('Location' in e) {
      itemExists = dataItem.ListException.some(
        (item) =>
          item instanceof DTOHRPolicyLocation && item.Location === e.Location
      );
    } else if ('Position' in e) {
      itemExists = dataItem.ListException.some(
        (item) =>
          item instanceof DTOHRPolicyPosition && item.Position === e.Position
      );
    } else if ('TypeStaff' in e) {
      itemExists = dataItem.ListException.some(
        (item) =>
          item instanceof DTOHRPolicyTypeStaff && item.TypeStaff === e.TypeStaff
      );
    }

    if (!itemExists) {
      const newItem = defaultDTO;
      this.assignMatchingValues(newItem, e);
      newItem.TypeData = type;
      dataItem.ListException.push(newItem);
    }
  }
  //#endregion

  //#region API
  /**
   *
   * @param TypeDialog LOẠI ĐÓNG DIALOG : 1 LÀ CẬP NHẬT , NẾU KHÔNG TRUYỀN LÀ ĐÓNG
   * @param dataUpte NẾU TYPEDIALOG LÀ 1 , TRUYỀN DATA EMIT
   */
  onClose(TypeDialog?: number, dataUpte?: any) {
    if (TypeDialog === 1) {
      this.data.emit(dataUpte);
    } else {
      this.closed.emit();
    }

    this.isOpenDialog = false;
    this.isDisabledBtn = true;
    this.listException = [[]];
    this.listLocationException = [];
    this.listPositionException = [];
    this.listTypeStaffException = [];
    this.currentListException = [];
    this.currentItemCombobox = [];
    this.isListCombobxTypeStaff = [];
    this.disabledCombobx = [];
    // RESET GIA TRI BAN DAU COMBOBOX FIRTCHILD
    this.currentListTypeStaff = null;
    this.currentListLocation = null;
    this.currentListPosition = null;

    // disabled combobox
    this.disabledCombobx = [];

    this.selectedExceptions = this.selectedExceptions.map(() => null);

    this.isDropdownDisabled.forEach((item, index) => {
      this.isDropdownDisabled[index] = false;
    });
    this.isListCombobxPosition.forEach((item, index) => {
      this.isListCombobxPosition[index] = false;
    });
    this.isListComboboxLocation.forEach((item, index) => {
      this.isListComboboxLocation[index] = false;
    });
    this.isListCombobxTypeStaff.forEach((item, index) => {
      this.isListCombobxTypeStaff[index] = false;
    });
  }
  // API LẤY DANH SÁCH CHỨC DANH
  listPosition: DTOHRPolicyPosition[] = [];
  APIGetListHRPolicyPosition() {
    this.apiPolicyService
      .GetListHRPolicyPosition()
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.listPosition = res.ObjectReturn;
            this.ListPolicyPosition = res.ObjectReturn;
          } else [`Đã xảy ra lỗi khi lấy danh sách : ${res.ErrorString}`];
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái : ${error}`
          );
        }
      );
  }
  // API LẤY DANH SÁCH ĐỊA ĐIỂM
  listLocation: DTOHRPolicyLocation[] = [];
  APIGetListHRPolicyLocation() {
    this.apiPolicyService
      .GetListHRPolicyLocation()
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode == 0
          ) {
            this.listLocation = res.ObjectReturn;
            this.ListPolicyLocation = res.ObjectReturn;
          } else [`Đã xảy ra lỗi khi lấy danh sách : ${res.ErrorString}`];
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái : ${error}`
          );
        }
      );
  }

  //API LẤY DANH SÁCH LOẠI NHÂN SỰ
  listTypeStaff: DTOHRPolicyTypeStaff[] = [];
  APIGetListHRTypeStaff() {
    const typeData = 5; // Định nghĩa giá trị chính xác của typeData
    this.apiHr
      .GetListHR(typeData)
      .pipe(takeUntil(this.Unsubscribe))
      .subscribe(
        (res) => {
          if (
            Ps_UtilObjectService.hasValue(res) &&
            Ps_UtilObjectService.hasValue(res.ObjectReturn) &&
            res.StatusCode === 0
          ) {
            this.listTypeStaff = res.ObjectReturn.map((item: any) => {
              return {
                Code: item.Code,
                TypeStaff: item.Code,
                TypeStaffName: item.ListName,
                TypeData: item.TypeData,
                ListID: item.ListID,
                ListException: [],
              } as DTOHRPolicyTypeStaff;
            });

            this.ListPolicyTypeStaff = res.ObjectReturn.map((item: any) => {
              return {
                Code: item.Code,
                TypeStaff: item.Code,
                TypeStaffName: item.ListName,
                TypeData: item.TypeData,
                ListID: item.ListID,
                ListException: [],
              } as DTOHRPolicyTypeStaff;
            });
          } else [`Đã xảy ra lỗi khi lấy danh sách : ${res.ErrorString}`];
        },
        (error) => {
          this.layoutService.onError(
            `Đã xảy ra lỗi khi cập nhật trạng thái : ${error}`
          );
        }
      );
  }
  //end region
}
