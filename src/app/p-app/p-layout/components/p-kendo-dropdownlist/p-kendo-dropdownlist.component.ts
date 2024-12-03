import { Component, forwardRef, Output, Input, EventEmitter, ViewChild, OnInit, OnDestroy, SimpleChanges, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropDownListComponent, PopupSettings} from '@progress/kendo-angular-dropdowns';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'p-kendo-dropdownlist',
  templateUrl: './p-kendo-dropdownlist.component.html',
  styleUrls: ['./p-kendo-dropdownlist.component.scss'],
  providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PKendodropdownlistComponent),
        multi: true
    }]
})
export class PKendodropdownlistComponent  implements OnInit, OnDestroy,ControlValueAccessor{

  selectedValue: any;
  source: any[] = [];
  filter: string;
  hasIcon: boolean = false;

  @ViewChild("dropdownlist", { static: true }) public dropdownlist: DropDownListComponent;

  //require input
  @Input() data: any[] = []; // data binding cho dropdownlist
  @Input() searchFields: string[] = []; // danh sách các trường muốn lọc khi tìm kiếm
  @Input() defaultItem: any; // item mặc định của kendo dropdownlist
  @Input() textField: string; 
  @Input() valueField: string;
  @Input() filterable: boolean = false; // Bật chế độ tìm kiếm
  @Input() disabled: boolean = false; // disabled dropdownlist
  @Input() readonly: boolean = false; // readonly dropdown
  @Input() valuePrimitive: boolean = false; 
  @Input() hasAddItem: boolean = false; // chế độ thêm item mới khi tìm kiếm không thấy 
  @Input() itemDisabled: Function = () => false; // disabled item trong danh sách
  @Input() contentBeforeTextField: string ; // Nội dụng muốn hiển thị vị trí trước textField
  @Input() contentAfterTextField: string ; // Nội dụng muốn hiển thị vị trí trước textField
  @Input() icon: string ; // Thêm icon class cho item trong danh sách của dropdownlost
  @Input() hasValueNull: boolean = true; // có sử dụng giá trị null cho mảng không? (value: null, text: --chọn--)
  @Input() contentValueNull: string = '-- Chọn --'; // Chỉnh sửa nội dụng của giá trị null trong dropdownlist

  public _popupSettings: PopupSettings = { popupClass: 'customDropdownList'};
  @Input()
  set popupSettings(value: PopupSettings) {
    // Kiểm tra nếu popupClass không tồn tại customDropdownList
    if (value && value.popupClass && !value.popupClass.includes('customDropdownList')) {
      // Thêm customDropdownList vào popupClass
      value.popupClass += ' customDropdownList';
    }
    
    // Lưu giữ giá trị popupSettings
    this._popupSettings = value;
  } // setting popup dropdownlist

  @Input() loading: boolean = false; 

    /**
   * Biến nhận là 1 TemplateRef, người dùng có thể sử dụng biến này để tự custom template của item theo ý muốn
   */

  @Input() customHeaderTemplate: TemplateRef<any> //Template Header

  @Input() customItemTemplate: TemplateRef<any> //Template NodeItem

  @Input() customValueTemplate: TemplateRef<any> //Template Value

  @Input() customFooterTemplate: TemplateRef<any> //Template Footer


  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();
  @Output() addNew: EventEmitter<any> = new EventEmitter<any>();
  @Output() open: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  
  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(public menuService: PS_HelperMenuService) { }

  ngOnInit(): void {
    // //#region disabled component nếu như GetListModuleAPITree pending
    // this.disabled = true
    // this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     this.disabled = false
    //   }
    // })
  }

  ngAfterContentInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.data){
      this.loadData()
    }
  }

  loadData(){
    if(this.hasValueNull && !Ps_UtilObjectService.hasValue(this.defaultItem) && Ps_UtilObjectService.hasListValue(this.data)){
      if (Array.isArray(this.data) && !Ps_UtilObjectService.hasListValue(this.data.filter(v => v[this.valueField] == null))) {
        const defaultItem = { ...this.data[0] };
        defaultItem[this.textField] = this.contentValueNull;
        defaultItem[this.valueField] = null;
        // Thiết lập tất cả các trường còn lại về null
        Object.keys(defaultItem).forEach(key => {
          if (key !== this.textField && key !== this.valueField) {
            defaultItem[key] = null;
          }
        });
        this.data.unshift(defaultItem);
      }
    }
    if(this.filterable && Ps_UtilObjectService.hasListValue(this.data)){
      this.source = this.data.slice();
    } 
    this.hasIcon = Ps_UtilObjectService.hasValueString(this.icon);

  }

  // Các phương thức ControlValueAccessor
  onChange = (_: any) => {} 
  onTouched = (_: any) => {} 

  // Ghi giá trị từ FormControl vào component
  writeValue(valueChange: any): void {
    this.selectedValue = valueChange;
  }

  registerOnChange(onChangeFn: any) {
    this.onChange = onChangeFn; // Register the value change callback
  }

  registerOnTouched(onTouchFn: any) {
      this.onTouched = onTouchFn; // Register the touch event callback
  }

  handleFilter(value) {
    this.filter = value;
    if (Ps_UtilObjectService.hasListValue(this.data)) {
        if (Ps_UtilObjectService.hasListValue(this.searchFields)) {
            this.source = this.data.filter((s) =>
                this.searchFields.some((field) => {
                    const fieldValue = s[field];
                    return fieldValue && Ps_UtilObjectService.containsString(fieldValue.toString(), value);
                })
            );
        } else {
            this.source = this.data.filter(
                (s) => Ps_UtilObjectService.containsString(s[this.textField], value)
            );
        }
    }
  }

  onBlur(e: any): void {
    this.blur.emit(e);
  }

  onFocus(): void {
      this.focus.emit(this.selectedValue);
  }

  onAddNew(): void {
    this.addNew.emit(this.filter);
  }

  onValueChange(value: any): void {
    this.valueChange.emit(value);
  }

  onSelectionChange(value: any): void {
    this.selectionChange.emit(value);
  }

  onOpen(): void {
    this.open.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onOpened(): void {
    this.opened.emit();
  }

  onClosed(): void {
    this.closed.emit();
  }

  reset(){
    this.dropdownlist.reset();
  }

  removeWhitespaceAndLowerCase(inputString) {
    // Remove whitespace and convert to lowercase
    return inputString.replace(/\s/g, '').toLocaleLowerCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
