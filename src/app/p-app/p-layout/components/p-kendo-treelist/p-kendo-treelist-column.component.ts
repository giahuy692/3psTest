import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ColumnComponent } from '@progress/kendo-angular-treelist';

@Component({
  selector: 'app-p-kendo-treelist-column',
  template: `<kendo-treelist-column
  #CustomTreelistColumn
  [field]="field"
  [title]="title"
  [width]="width"
  [expandable]="expandable"
  >
</kendo-treelist-column>`
})
export class PKendoTreeListColumnComponent {
  @ViewChild(ColumnComponent) public realColumn: ColumnComponent;
  @Input() field: string = '';
  @Input() title: string = '';
  @Input() width: number = 0;
  @Input() expandable: boolean = false;

  constructor() { }

  ngAfterViewInit() {
    console.log(this.realColumn)
  }

}