import { Component, OnInit, Input, Optional } from '@angular/core';
import { BaseFilterCellComponent, FilterService } from '@progress/kendo-angular-grid';
import { FilterDescriptor } from '@progress/kendo-data-query';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Component({
  selector: 'p-kendo-grid-dropdownlist',
  templateUrl: './p-kendo-grid-dropdownlist.component.html',
  styleUrls: ['./p-kendo-grid-dropdownlist.component.scss']
})

export class PKendoGridDropdownlistComponent extends BaseFilterCellComponent {
  public get selectedValue(): any {
    if (this.currentItem != null && Ps_UtilObjectService.hasValue(this.currentItem.text)) {
      return this.currentItem.value
    } else {
      const filter = this.filterByField(this.valueField);
      return filter ? filter.value : null;
    }
  }

  @Input() public filter: any;
  @Input() public data: any[];
  @Input() public textField: string;
  @Input() public valueField: string;
  @Input() onFilterChangeCallback: Function
  @Input() currentItem = {
    "text": null,
    "value": null
  }

  public get defaultItem(): any {
    return {
      [this.textField]: "Tất cả",
      [this.valueField]: null,
    };
  }

  constructor(@Optional() filterService: FilterService) {
    super(filterService);
  }

  public onChange(value: any): void {
    var currentFilter: FilterDescriptor = {
      field: this.valueField,
      operator: "eq",
      value: value,
    }
    if (this.onFilterChangeCallback != undefined)
      this.onFilterChangeCallback(currentFilter)
    // this.applyFilter(
    //   value === null // value of the default item
    //     ? this.removeFilter(this.valueField) // remove the filter
    //     : this.updateFilter({
    //       // add a filter for the field with the value
    //       field: this.valueField,
    //       operator: "eq",
    //       value: value,
    //     })
    // ); // update the root filter
  }
}
