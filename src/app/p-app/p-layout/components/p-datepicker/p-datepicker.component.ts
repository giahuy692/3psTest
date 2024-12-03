import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, LOCALE_ID, ViewChild, forwardRef, SimpleChanges } from '@angular/core';
import '@progress/kendo-angular-intl/locales/vi/all';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';
import '@progress/kendo-angular-intl/locales/vi/all';
import localeVi from '@angular/common/locales/vi';
import { registerLocaleData } from '@angular/common';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Subject } from 'rxjs';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';
registerLocaleData(localeVi);
@Component({
  selector: 'app-datepicker',
  templateUrl: './p-datepicker.component.html',
  styleUrls: ['./p-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PDatePickerComponent),
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'vi-VN' },
  ]
})
export class PDatePickerComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  /**
   * Reference to the datepicker component.
   */
  @ViewChild('datepickerRef', { static: true }) datepickerRef: DatePickerComponent;

  /**
   * Sets the dates of the DatePicker that will be disabled.
   * @input {Function} disabledDates - The function to determine disabled dates.
   * @example <app-datepicker [disabledDates]="disabledDates"></app-datepicker> 
   * public disabledDates = (date: Date): boolean => {
   *    return date.getDate() % 2 === 0;
   * };
   */

  @Input() disabledDates: (date: Date) => boolean;



  /**
   * Sets or gets the disabled property of the DatePicker and determines whether the component is active 
   * @input {boolean} disabled - Whether the datepicker is disabled. Option input true or false.
   * @default {boolean} false.
   */
  @Input() disabled = false;

  /**
   * Sets the read-only state of the DatePicker input field.
   * @input {boolean} readOnlyInputCustom . Option input input true or false
   * @default {boolean} false
   */
  @Input() readOnlyInput = false;


  /**
   * Defines the descriptions of the format sections in the input field.
   * @input {object} MyformatPlaceholder - The format for displaying the placeholder. Option input {year: 'yyyy', month: 'm', day: 'd'} or { year: 'yyyy', month: 'MM', day: 'dd' }
   * @default {object} {year: 'yyyy', month: 'm', day: 'd'} 
   * @example <app-datepicker [MyformatPlaceholder]="{year: 'yyyy', month: 'm', day: 'd'}"></app-datepicker> 
   */
  @Input() formatPlaceholder = { year: 'yyyy', month: 'm', day: 'd' };

  /**
   * Specifies the date format that is used to display the input value .
   * @input {string} Myformat - The format for displaying the date. Option input 'd/M/yyyy' or 'dd/MM/yyyy'
   * @default {string} 'd/M/yyyy'
   */
  @Input() format = 'd/M/yyyy';

  /**
  * The placeholder text for the input field.
  * @input {string} Myplaceholder - Option input 'd/m/yyyy' or  or 'dd/mm/yyyy'
  * @default {string} - 'd/m/yyyy'
  */
  @Input() placeholder = 'd/m/yyyy';

  /**
   * Minimum allowed date for the component.
   * @type {Date}
   * @default new Date(1900, 1, 1)
   * @input {Date}
   */
  @Input() min: Date | Function | string = null;

  /**
   * Maximum allowed date for the component.
   * @type {Date}
   * @default new Date(2099, 12, 31)
   * @input {Date}
   */
  @Input() max: Date | Function  | string = null;

  /**
   * Popup settings for the component.
   * @type { animate: boolean, appendTo: string, popupClass: string }
   * @default { animate: true, appendTo: 'component', popupClass: 'popupClassCustom' }
   * @input appendTo: 'root' | 'component' | ViewContainerRef —Controls the popup container. By default, the popup will be appended to the root component. 
   * @input animate: Boolean—Controls the popup animation. By default, the open and close animations are enabled.
   * @input popupClass: String—Specifies a list of CSS classes that are used to style the popup.
   * @example <app-datepicker [popupSetting]="{animate:true, appendTo: 'component',popupClass:'popupClassCustom'}"></app-datepicker> 
   */
  @Input() popupSetting = { animate: true, appendTo: 'root', popupClass: 'popupLayoutCpnDatePicker' }

  /**
   * @default 'MMMM, yyyy'
   * @example <app-datepicker [formatHeader]="'MMMM, yyyy'"></app-datepicker> 
   */
  @Input() formatHeaderTitle = 'MMMM, yyyy'

  /**
   * @default 'MMMM'
   * @example <app-datepicker [formatYearCell]="'MMMM'"></app-datepicker> 
   */
  @Input() formatYearCell = 'MMMM'

  /**
   * Event emitted when the datepicker loses focus.
   * @output {EventEmitter<Date>} blur - Event emitted when the datepicker loses focus.
   * @example <app-datepicker (blur)="onBlurDatePicker($event)"></app-datepicker> 
   * onBlurDatePicker(value: any){ if(value !== null){ ... } }
   * @returns {Date} the changed value. If the current value is the same as the old value when the user blurs, return null.
   */
  @Output() blur: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() focus: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() valueChange: EventEmitter<Date> = new EventEmitter<Date>();

  value: Date;
  tempValue: Date;
  intl: any;

  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(public menuService: PS_HelperMenuService,) { }

  ngOnInit(): void {
    // //#region disabled component nếu như GetListModuleAPITree pending
    // this.disabled = true
    // this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     this.disabled = false
    //   }
    // })
  }

  ngAfterViewInit(): void {
    this.tempValue = this.value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Nếu disabled thay đổi thực hiện cập nhật filter mới theo các properties mà component cha cung cấp
    if (changes['disabled'] && !changes['disabled'].isFirstChange()) {
      this.disabled = changes['disabled'].currentValue
    }
  }



  // Các phương thức ControlValueAccessor
  onChange = (_: any) => { }
  onTouched = (_: any) => { }

  // Ghi giá trị từ FormControl vào component
  writeValue(valueChange: Date): void {
    if (valueChange !== this.tempValue) {
      this.value = Ps_UtilObjectService.hasValueString(valueChange) ? new Date(valueChange) : null;
    }
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

  onDatepickerValueChange(newValue: Date) {
    this.value = newValue;
    this.tempValue = { ...this.value };
    this.onChange(this.value);
    this.valueChange.emit(this.value); // Phát ra sự kiện valueChange
  }

  // public disabledDates = (date: Date): boolean => {
  //   if (this.getDisabledDates) {
  //     return this.getDisabledDates(date);
  //   }
  //   return false;
  // };

  isHidden(dateView: Date, monthView: any) {
    let currentMonthView = new Date(monthView)
    if (dateView.getFullYear() === currentMonthView.getFullYear() && dateView.getMonth() > currentMonthView.getMonth()) {
      return true;
    }
    return false;
  }


  onFocus() {
    this.tempValue = this.value
    this.focus.emit();
  }


  onBlur() {
    if (this.value) {
      if (this.tempValue !== this.value) {
        this.tempValue = { ...this.value };
        this.blur.emit(this.value);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
