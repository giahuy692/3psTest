import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-filter-group',
  templateUrl: './search-filter-group.component.html',
  styleUrls: ['./search-filter-group.component.scss']
})
export class SearchFilterGroupComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() disabled: boolean = false
  @Input() clearButton: boolean = false
  @Input() loading: boolean = false
  @Input() @Ps_UtilObjectService.Required placeholder: string = 'Tìm theo...'
  @Input() title: string = ''
  @Input() label: string = 'Tìm kiếm'
  @Input() ignoreCase: boolean = false
  @Input() fields: string[] = []

  @Output() filterChange: EventEmitter<CompositeFilterDescriptor> = new EventEmitter()
  @Output() valueChange: EventEmitter<string> = new EventEmitter()
  @Output() onReset: EventEmitter<CompositeFilterDescriptor> = new EventEmitter()

  value: string = ''
  filterGroup: CompositeFilterDescriptor = {
    logic: 'or',
    filters: []
  }

  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(public menuService: PS_HelperMenuService) { }

  ngOnInit(): void {
    //#region disabled component nếu như GetListModuleAPITree pending
    this.disabled = true
    this.menuService.changePermissionAPI().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.disabled = false
      }
    })
  }

  ngAfterViewInit() {
    this.fields.forEach(s => {
      var f: FilterDescriptor = {
        field: s,
        operator: 'contains',
        ignoreCase: this.ignoreCase,
        value: ''
      }

      this.filterGroup.filters.push(f)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Nếu fields thay đổi thực hiện cập nhật filter mới theo các properties mà component cha cung cấp
    if (changes['fields'] && !changes['fields'].isFirstChange()) {
      // Clear previous filters to avoid duplicates
      this.filterGroup.filters = [];
      this.value = '' // set giá trị tìm kiếm về rỗng để set value theo fields mới
      // Apply the new fields to the filter group
      this.fields.forEach((field) => {
        const filter: FilterDescriptor = {
          field: field,
          operator: 'contains',
          ignoreCase: this.ignoreCase,
          value: ''
        };
        this.filterGroup.filters.push(filter);
      });
    }
  }

  resetFilter() {
    this.value = ''

    this.filterGroup.filters.forEach((s: FilterDescriptor) => {
      s.value = this.value
    });

    this.onReset.emit(this.filterGroup)
  }

  search() {
    this.filterGroup.filters.forEach((s: FilterDescriptor) => {
      s.value = this.value.trim()
    });

    this.valueChange.emit(this.value)
    this.filterChange.emit(this.filterGroup)
  }

  clear() {
    this.value = ''
    this.search()
  }

  isValidValue() {
    return Ps_UtilObjectService.hasValueString(this.value)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
