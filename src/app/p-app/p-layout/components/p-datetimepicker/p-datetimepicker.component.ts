import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, LOCALE_ID, ViewChild, forwardRef, ElementRef, Renderer2, DoCheck, ChangeDetectorRef, HostListener } from '@angular/core';
import '@progress/kendo-angular-intl/locales/vi/all';
import { CheckboxControlValueAccessor, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePickerComponent, PopupSettings } from '@progress/kendo-angular-dateinputs';
import * as $ from 'jquery'
import '@progress/kendo-angular-intl/locales/vi/all';
import localeVi from '@angular/common/locales/vi';
import { DatePipe, registerLocaleData, Time } from '@angular/common';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { LayoutService } from '../../services/layout.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
registerLocaleData(localeVi);
@Component({
  selector: 'app-datetimepicker',
  templateUrl: './p-datetimepicker.component.html',
  styleUrls: ['./p-datetimepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PDateTimePickerComponent),
      multi: true
    },
    CheckboxControlValueAccessor,
    { provide: LOCALE_ID, useValue: 'vi-VN' },
  ]
})

export class PDateTimePickerComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  @ViewChild('datepickerRef', { static: true }) datepickerRef: DatePickerComponent;
  @ViewChild('TimePicker', { static: true }) TimePickerRef: ElementRef<HTMLDivElement>;
  @ViewChild('DropDownTime', { static: true }) DropDownTime: DropDownListComponent;
  @Input() disabledDates: (date: Date) => boolean;

  @Input() disabled = false;
  @Input() readOnlyInput = false;
  @Input() formatPlaceholder: any = { time: 'H:mm', year: 'yyyy', month: 'MM', day: 'd' };
  @Input() format = 'd/MM/yyyy H:mm';
  @Input() placeholder = 'd/MM/yyyy H:mm';

  @Input() min: any
  //  @Input() min: Date | Function = null;
  @Input() max: any
  //  @Input() max: Date | Function = null;

  @Input() popupSetting: PopupSettings = { animate: true, appendTo: 'root', popupClass: 'popupLayoutCpnDateTimePicker' }
  @Input() stepTime = 30;
  @Input() formatHeaderTitle = 'MMMM, yyyy'
  @Input() formatYearCell = 'MMMM'
  @Input() turnOnAllDay = false;
  @Output() blur: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() allDay: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() valueChange: EventEmitter<Date> = new EventEmitter<Date>();

  DateTime: Date;
  currentDate: Date;
  currentTime: string = "00:00";
  tempTime: string;
  tempDateTime: Date;
  isAllDay: boolean = false;
  timePicker: JQuery<HTMLElement>;
  isChecked: boolean = false;
  valueTime: string = '';
  valueDate: Date = new Date();
  TimeItemList = [];
  selectedTime = false
  isTempDateTime: any;
  buttons = [
    { text: "AM", selected: true, index: 1 },
    { text: "PM", index: 2 },
  ];
  timeFormat: string;
  placeholderTimeFormat: string;
  tempFormatPlaceholder: any;
  OptionTimeIndex: number = 1;
  previousDate: Date;
  isEmit: boolean = false;

  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(private renderer: Renderer2, private cd: ChangeDetectorRef, public menuService: PS_HelperMenuService) {
    this.TimeItemList = this.generateTimeArray(this.stepTime, this.OptionTimeIndex);
  }

  ngOnInit(): void {
    // //#region disabled component nếu như GetListModuleAPITree pending
    // this.disabled = true
    // this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     this.disabled = false
    //   }
    // })
  }

  @Input() isMinAndMaxSameDay: boolean;
  @Output() allDayClick: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnChanges() {
    let a = this.format.slice();
    let b = this.placeholder.slice();
    this.tempFormatPlaceholder = { ...this.formatPlaceholder }
    this.timeFormat = a.split(' ')[1];
    this.placeholderTimeFormat = b.split(' ')[1];


    //bị lỗi triple blur
    // set giá trị 00:00 - 23H59 khi trùng ngày và chọn All days
    // if (this.isMinAndMaxSameDay) {
    //   if (this.min && this.isAllDay) {
    //     this.min.setHours(0, 0, 0, 0)
    //     this.tempMin = new Date(this.min)
    //   }
    //   else if (this.max && this.isAllDay) {
    //     this.max.setHours(23, 59, 59, 999);
    //     this.tempMax = new Date(this.max)
    //   }
    // }

    // console.log('check: ', this.isMinAndMaxSameDay);
    // console.log("this.min: ", this.min);
    // console.log("this.max: ", this.max);
  }

  ngAfterViewInit(): void {
    $(document).ready(() => {
      this.timePicker = $('#TimePicker').detach();
    });
    this.cd.checkNoChanges();
  }

  // Các phương thức ControlValueAccessor
  onChange = (_: any) => { }
  onTouched = (_: any) => { }
  onTouchedCheckBox: () => {}
  // Ghi giá trị từ FormControl vào component
  writeValue(valueChange: Date): void {
    this.DateTime = valueChange;
  }

  // Đăng ký hàm callback khi component được chạm vào
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // // Cập nhật trạng thái vô hiệu hóa của component
  // setDisabledState(isDisabled: boolean): void {
  //   this.disabled = isDisabled;
  // }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Lấy nghe giá trị thay đổi của ngày
  onDatepickerValueChange(newValue: Date) {

    // newValue.setHours(0, 0, 0, 0);
    // this.currentTime = "00:00";
    this.currentDate = newValue;
    this.DateTime = new Date(
      `${this.currentDate.toDateString()} ${this.currentTime}`
    );
    this.onAllDayChange()
    this.onChange(this.DateTime);
    this.handleAddTime(newValue);
    this.valueChange.emit(this.DateTime);
  }

  // xử lý disabled ngày
  // public onDisabledDates = (date: Date): boolean => {
  //   if (this.disabledDates) {
  //     return this.disabledDates(date);
  //   }
  //   return false;
  // };

  // ẩn những ngày của tháng sau hiện ở view hiện tại của tháng sau
  isHiddenDate(dateView: Date, monthView: any) {
    let currentMonthView = new Date(monthView)
    currentMonthView.setHours(0, 0, 0, 0);
    currentMonthView.getMonth() + 1
    dateView.setHours(0, 0, 0, 0);
    dateView.getMonth() + 1;

    if (dateView.getFullYear() === currentMonthView.getFullYear()
      && dateView.getMonth() > currentMonthView.getMonth()) {
      return true;
    }
    return false;
  }

  onFocusDate() {
    this.tempDateTime = this.DateTime;
    this.previousDate = this.DateTime;
  }

  onFocusTime() {
    this.tempTime = this.currentTime;
  }

  onOpendDate() {
    this.tempDateTime = this.DateTime;
    if (Ps_UtilObjectService.hasValue(this.DateTime) && this.DateTime.getHours() > 12) {
      this.OptionTimeIndex = 2;
      this.TimeItemList = this.generateTimeArray(this.stepTime, 2)
      this.currentTime = this.getTime(this.DateTime)
      this.isTempDateTime = this.currentTime
      this.handleAddTime(this.DateTime);
    } else if (Ps_UtilObjectService.hasValue(this.DateTime) && this.DateTime.getHours() < 12) {
      this.OptionTimeIndex = 1;
      this.TimeItemList = this.generateTimeArray(this.stepTime, 1)
      this.currentTime = this.getTime(this.DateTime)
      this.handleAddTime(this.DateTime);
    }
    this.appendHtml()
    this.isEmit = false //dùng để set điều kiện emit khi click vào allday

    if (Ps_UtilObjectService.hasValue(this.DateTime)) {
      this.currentDate = new Date(this.tempDateTime.setHours(0, 0, 0, 0))
    }
  }

  getTime(dateObj: Date) {

    const hours = dateObj.getHours().toString().padStart(2, '0'); // Lấy giờ và thêm số 0 nếu cần thiết
    const minutes = dateObj.getMinutes().toString().padStart(2, '0'); // Lấy phút và thêm số 0 nếu cần thiết

    const timeString = `${hours}:${minutes}`; // Định dạng lại thành chuỗi "h:mm"

    return timeString

  }

  appendHtml() {
    $(document).ready(() => {
      $('.k-calendar-classic').append(this.timePicker);
      $('.k-datetime-footer').append(this.timePicker);
    });
  }

  onCloseDate(event: any) {
    $('.k-animation-container').css('display', 'block');
    $('.wrapperTime').append(this.timePicker);
    event.preventDefault();
  }


  generateTimeArray(step: number, optionTime: number) {
    let hoursInDay = 12;
    let hour = 0;
    const result: Array<string> = []; // Định dạng mảng result là Array<string> (mảng các chuỗi)

    if (optionTime === 2) {
      hour = 12
      hoursInDay = 24;
    }

    for (hour; hour < hoursInDay; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const hourString = hour.toString().padStart(2, '0'); // Thêm số 0 vào phần giờ nếu cần thiết
        const minuteString = minute.toString().padStart(2, '0'); // Thêm số 0 vào phần phút nếu cần thiết
        const timeString = `${hourString}:${minuteString}`;
        result.push(timeString);
      }
    }

    // Kiểm tra nếu optionTime === 2 và hour đã đạt đến hoursInDay, thêm 00:00 vào mảng result.
    // if (optionTime === 2 && hour === hoursInDay) {
    //   result.push('00:00');
    // }

    return result;
  }

  handleAddTime(newDateTime: Date) {
    const newHour = newDateTime.getHours(); // Lấy giờ từ giá trị mới
    const newMinute = newDateTime.getMinutes(); // Lấy phút từ giá trị mới
    const newTimeString = `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;

    const isTimeExist = this.TimeItemList.includes(newTimeString);

    if (!isTimeExist) {
      let inserted = false; // Biến kiểm tra đã thêm giá trị mới vào mảng chưa

      // Duyệt qua mảng TimeItemList để tìm vị trí thích hợp để chèn giá trị mới vào
      for (let i = 0; i < this.TimeItemList.length; i++) {
        const currentTime = this.TimeItemList[i];
        if (currentTime > newTimeString) {
          this.TimeItemList.splice(i, 0, newTimeString); // Chèn giá trị mới vào mảng
          inserted = true;
          break;
        }
      }

      // Nếu giá trị mới lớn hơn tất cả các giá trị trong mảng, thêm vào cuối mảng
      if (!inserted) {
        this.TimeItemList.push(newTimeString);
      }
    }
  }


  // Hàm lắng nghe sự thây đổi giờ AM/PM
  handleTimeSelection(e: boolean, btn: any): void {
    this.OptionTimeIndex = btn.index;

    //lấy ra list AM/PM 
    this.TimeItemList = this.generateTimeArray(this.stepTime, this.OptionTimeIndex);

    //thay đổi giá trị trên dropdonw
    // var hour = parseInt(this.currentTime.split(":")[0], 10);
    // var minute = parseInt(this.currentTime.split(":")[1], 10);
    // hour = (hour > 12) ? (hour - 12) : (hour + 12);
    // this.currentTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // //thay đổi trên input
    // this.DateTime = new Date(
    //   `${this.currentDate.toDateString()} ${this.currentTime}`
    // );
  }

  // Lắng nghe người dùng chọn giờ
  public selectionTimeChange(value: any): void {
    if (Ps_UtilObjectService.hasValue(this.DateTime)) {
      this.currentTime = value;
      this.DateTime = new Date(
        `${this.currentDate.toDateString()} ${this.currentTime}`
      );
      // this.datepickerRef.toggle();
      this.tempDateTime = this.DateTime;
      this.datepickerRef.writeValue(this.DateTime)
      this.onChange(this.DateTime);

      this.datepickerRef.onFocus.emit(false);
    }
  }

  onBlurDate() {
    // đoạn này khi date1 còn mở -> click và date2 bị double time trong date 1
    // if (!Ps_UtilObjectService.hasValue(this.tempDateTime) && Ps_UtilObjectService.hasValue(this.DateTime)) {
    //   this.blur.emit(this.DateTime)
    // } else if (this.tempDateTime.toString() !== this.DateTime.toString()) {
    // console.log(this.DateTime);
    // this.blur.emit(this.DateTime)
    // }

    if (Ps_UtilObjectService.hasValue(this.DateTime)) {
      if (this.DateTime.toLocaleString() !== this.previousDate?.toLocaleString() || this.isEmit == true) {
        this.blur.emit(this.DateTime)
      }
    }
    this.datepickerRef.toggle(false);
  }


  isItemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem === this.currentTime;
  }


  blurTime() {
    if (this.currentDate && this.currentTime) {
      this.DateTime = new Date(`${this.currentDate.toDateString()} ${this.currentTime}`);
    }
    this.onAllDayChange()
    if (this.isAllDay == false && this.tempTime !== this.currentTime) {
      this.blur.emit(this.DateTime);
    }
    this.DropDownTime.toggle(false);
    this.datepickerRef.toggle(false);
  }


  //sự kiện thay đổi allDays
  onAllDayChange() {
    if (Ps_UtilObjectService.hasValue(this.DateTime)) {
      const hasChanged = this.DateTime.getHours() !== 0 || this.DateTime.getMinutes() !== 0 || this.DateTime.getSeconds() !== 0 || this.DateTime.getMilliseconds() !== 0;
      if (this.isAllDay && hasChanged) {
        this.DateTime.setHours(0, 0, 0, 0); // Set giờ về không.
        this.currentTime = "00:00"; // Value Binding dropdown 
        this.datepickerRef.writeValue(this.DateTime); // New value binding input client
        this.datepickerRef.onFocus.emit(true); // focus vào input của datepicker để có khi blur chạy được event blur 
        // this.datepickerRef.toggle(false);
        this.writeValue(this.DateTime);
        this.onChange(this.DateTime); // Thông báo giá trị đã thay đổi thông qua ControlValueAccessor,
        this.allDay.emit(this.DateTime)
        this.isEmit = true //dùng biến này để set điều kiện emit trong blur 
      }

      //thông báo cho cha là đang click all day
      this.allDayClick.emit(this.isAllDay);

      this.adjustFormat()
    }
  }


  //hàm thay đổi format trên input
  adjustFormat() {
    if (this.isAllDay) {
      this.formatPlaceholder = { year: 'yyyy', month: 'MM', day: 'd' };
      this.format = this.format.split(' ')[0];
      this.placeholder = this.placeholder.split(' ')[0];
    } else {
      this.formatPlaceholder = { time: 'H:mm', year: 'yyyy', month: 'MM', day: 'd' };
      this.format = this.format.includes(' ') ? this.format : 'd/MM/yyyy H:mm';
      this.placeholder = this.placeholder.includes(' ') ? this.placeholder : 'd/MM/yyyy H:mm';
    }

  }



  onEnterKeyPressed(event: Event) {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLElement) {
      target.blur();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
