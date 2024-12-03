import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropDownTreeComponent, PopupSettings } from '@progress/kendo-angular-dropdowns';
import { Observable, of, Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'p-kendo-dropdowntree',
  templateUrl: './p-kendo-dropdowntree.component.html',
  styleUrls: ['./p-kendo-dropdowntree.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PKendoDropdowntreeComponent),
      multi: true
    }]
})
export class PKendoDropdowntreeComponent implements OnInit, ControlValueAccessor {
  /**
   * Lưu ý: component cho cần người dùng cung cấp childrenFields để xử lý được hasChildren và fetchChildren
   * ------ component cần người dùng cung cấp ít nhất 1 field cho @Input listSearchField nếu filterable = true.
   * ------ component cần người dùng cung cấp textField component tự động hiển thị giá trị đó lên popup.
   * ------ component này được dựng để custom lại logic search nên sẽ không cho phép sử dụng [kendoDropDownTreeHierarchyBinding],
   * [kendoDropDownTreeFlatBinding] để data binding -> nếu dùng 2 loại này thì khi filterable = true kendo sẽ tự động search và gây ra lỗi tắt popup.
   */
  curSelected: any; // giá trị đang được chọn
  @ViewChild('DropDowntreRef') DropDowntreRef: DropDownTreeComponent;

  @Input() data: Object[] = []; // Nhận data từ component cha;
  public parsedData: Object[] = this.getData(); // Coppy deep dữ liệu từ biến data
  @Input() textField: string = '';
  @Input() valueField: string = '';
  @Input() customClasses: string[]; // Danh sách class mà người dùng muốn import và component
  @Input() loading: boolean = false;
  @Input() filterable: boolean = false; // Có dùng search của component không?
  @Input() clearButton: boolean = false; // Có dùng nút xóa không?
  @Input() valuePrimitive: boolean = false;
  @Input() listSearchField: string[]; // danh sách các trường dữ liệu mà người dùng muốn component search theo.
  @Input() childrenFields: string[] = [];
  @Input() FieldViewBinding: string[] = []; // danh sách các trường cần được binding trên dropdown
  @Input() disabled: boolean = false;
  @Input() itemDisabled: Function = () => false; // disabled item trong danh sách

  //#region Custom template
  
  /**
   * Biến nhận là 1 TemplateRef, người dùng có thể sử dụng biến này để tự custom template của item theo ý muốn
   * 
   * <p-kendo-dropdowntree class="classRemoveDropdowntree"
      [customNodeTemplate]="myCustomNodeTemplate">

   *  <ng-template #myCustomNodeTemplate let-dataItem let-index="index">
          <div class="treeItem" [ngClass]="{'disableChoice': dataItem.StatusID != 2}">
              <div class="item-name">{{dataItem.Department}}</div>
              <div class="item-status" *ngIf="dataItem.StatusID != 2">{{dataItem.StatusName}}</div>
          </div>
      </ng-template>
   */
  
  @Input() customHeaderTemplate : TemplateRef<any> //Template Header

  @Input() customNodeTemplate : TemplateRef<any> //Template NodeItem

  @Input() customValueTemplate : TemplateRef<any> //Template Value

  @Input() customFooterTemplate : TemplateRef<any> //Template Footer
  //#endregion  

  //#region Item template
  @Input() beforeContentItemTemplate: string = ''; // thêm nội dụng khác sau nội dụng chính
  @Input() afterContentItemTemplate: string = ''; // thêm nội dụng khác sau nội dụng chính
  @Input() imgItemTemplate: string = ''; // thêm hình cho nội dung template item

  //#endregion

  //#region Value template
  @Input() beforeContentValueTemplate: string = ''; // thêm nội dụng khác sau nội dụng chính
  @Input() afterContenttValueTemplate: string = ''; // thêm nội dụng khác sau nội dụng chính
  // @Input() imgValueTemplate: string = ''; // thêm hình cho nội dung template item
  //#region 

  /**
   * @description: có thể truyền ảnh, class icon front awesome, kendo icon
   */
  @Input() icon: string = '';
  public _popupSettings: PopupSettings = { popupClass: 'Bps CustomPopupTreeAtRoot' };
  /**
   * @description: popupClass phải luôn có giá trị "Bps CustomPopupTreeAtRoot" nếu không component sẽ bị bất style
   */
  @Input()
  set popupSettings(value: PopupSettings) {
    // Kiểm tra nếu popupClass không tồn tại customDropdownList
    if (value && value.popupClass && !value.popupClass.includes('Bps CustomPopupTreeAtRoot')) {
      // Thêm customDropdownList vào popupClass
      value.popupClass += ' Bps CustomPopupTreeAtRoot';
    }

    // Lưu giữ giá trị popupSettings
    this._popupSettings = value;
  } // setting popup dropdownlist

  @Input() dataItem: Object
  @Input() isItemDisableCallback : Function


  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  // Các phương thức ControlValueAccessor
  onChange = (_: any) => { }
  onTouched = (_: any) => { }

  // Ghi giá trị từ FormControl vào component
  writeValue(valueChange: any): void {
    this.curSelected = valueChange;
  }

  registerOnChange(onChangeFn: any) {
    this.onChange = onChangeFn; // Register the value change callback
  }

  registerOnTouched(onTouchFn: any) {
    this.onTouched = onTouchFn; // Register the touch event callback
  }

  //unsubcribe
  destroy$ = new Subject<void>();
  constructor(private cdr: ChangeDetectorRef, public menuService: PS_HelperMenuService) { }

  ngOnInit(): void {
    // //#region disabled component nếu như GetListModuleAPITree pending
    // this.disabled = true
    // this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     this.disabled = false
    //   }
    // })
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Kiểm tra xem có sự thay đổi trong listModuleTree hay không
    if (changes.data && Ps_UtilObjectService.hasListValue(this.data)) {
      // Cập nhật parsedData với giá trị mới từ listModuleTree
      this.parsedData = this.getData();
    }
  }

  /**
   * 
   * @param value giá trị đầu vào là một keyword mà người dùng đã nhập
   */
  public handleFilter(value: string): void {
    this.parsedData = this.search(this.getData(), value);
  }

  /**
   * Hàm xử lý data theo keyword
   * @param items danh sách data mà lọc theo keyword
   * @param term keyword mà người dùng đã nhập
   * @returns danh sách item thỏa keyword
   */
  public search(items: any[], term: string): any[] {
    return items.reduce((acc, item) => {
      if (Ps_UtilObjectService.hasListValue(this.listSearchField)) {
        this.listSearchField.forEach(v => {
          if (Ps_UtilObjectService.containsString(item[v], term)) {
            acc.push(item);
          } else if (this.hasChildrenField(item, this.childrenFields)) {
            this.childrenFields.forEach(v => {
              if (Ps_UtilObjectService.hasListValue(item[v]?.length)) {
                const newItems = this.search(item[v], term);
                if (newItems.length > 0) {
                  acc.push(item);
                }
              }
            })
          }
        })
      }

      return acc;
    }, []);
  }

  // /**
  //  * Hàm so sách 2 chuỗi
  //  * @param text trường dữ liệu string muốn so sánh với keyword
  //  * @param term keyword
  //  * @returns true | false
  //  */
  // public contains(text: string, term: string): boolean {
  //   const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  //   const normalizedTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  //   return normalizedText.includes(normalizedTerm);
  // }

  /**
   * Hàm sử dụng để kiểm tra 1 đối tượng có dữ liệu của mảng con không
   * @param item là đối tượng muốn kiểm tra có mảng con không
   * @param childrenFields là danh sách các field quy định danh sách item con của item đó
   * @returns true | false
   */
  hasChildrenField(item: any, childrenFields: string[]): boolean {
    return childrenFields.some(field => field in item);
  }

  /**
   * Hàm trả về data gốc coppy deep
   * @returns data gốc do người dùng truyền cho component
   */
  getData() {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Hàm xử lý khi người dùng chọn giá trị mới
   * @param value giá trị thay đổi khi người dùng chọn giá trị
   */
  handleValueChange(value: any) {
    this.valueChange.emit(value);
  }

  fetchChildren = (dataitem: any): Observable<any[]> => {
    const childrenData = [];

    // Lặp qua danh sách trường dữ liệu con và thêm dữ liệu vào mảng childrenData
    this.childrenFields.forEach(field => {
      if (dataitem[field] && Array.isArray(dataitem[field])) {
        childrenData.push(...dataitem[field]);
      }
    });

    // Trả về mảng childrenData dưới dạng một Observable
    return of(childrenData);
  };

  hasChildren = (dataitem: any): boolean => {
    let hasChild = false;

    // Lặp qua danh sách trường dữ liệu con và kiểm tra xem chúng có tồn tại hay không
    this.childrenFields.forEach(field => {
      if (dataitem[field] && Array.isArray(dataitem[field]) && dataitem[field].length > 0) {
        hasChild = true;
      }
    });

    return hasChild;
  };

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
