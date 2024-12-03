import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from '../../services/p-menu.helper.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-checkbox-button-group',
  templateUrl: './checkbox-button-group.component.html',
  styleUrls: ['./checkbox-button-group.component.scss']
})
export class CheckboxButtonGroupComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() disabled: boolean = false
  @Input() checked: boolean = false
  @Input() count: number = 0
  @Input() @Ps_UtilObjectService.Required title: string = ''

  @Input() field: string = ''
  @Input() operator: string = 'eq'
  @Input() value: any

  @Output() selectedChange: EventEmitter<boolean> = new EventEmitter()
  @Output() filterChange: EventEmitter<FilterDescriptor> = new EventEmitter()

  filter: FilterDescriptor

  //unsubcribe
  destroy$ = new Subject<void>();

  constructor(public menuService: PS_HelperMenuService,) { }

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
    this.loadFilter()
  }

  ngOnChanges() {
  }

  loadFilter() {
    this.filter = {
      field: this.field,
      value: this.value,
      operator: this.operator,
      ignoreCase: true,
    }
  }

  onSelectedChange(e) {
    this.checked = e
    this.loadFilter()
    this.selectedChange.emit(this.checked)
    this.filterChange.emit(this.filter)
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
