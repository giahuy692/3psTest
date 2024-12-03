import { Component, Input, ViewChild } from '@angular/core';
import { ColumnComponent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-p-kendo-grid-column',
  template: `<kendo-grid-column
      #myCustomGridColumn
      [field]="field"
      [title]="title"
      [width]="width">
    </kendo-grid-column>` 
})
export class PKendoGridColumnComponent {

  @ViewChild(ColumnComponent) public realColumn: ColumnComponent;
  @Input() field: string = '';
  @Input() title: string = '';
  @Input() width: number = 0;

  constructor() { }

  ngAfterViewInit() {
  }

  // @Input()
  // public fieldName: string;

  // @ContentChild("cellTemplate")
  // public cellTemplate: TemplateRef<any>;

  // @ContentChild("headerTemplate")
  // public headerTemplate: TemplateRef<any>;

  // public get hasCellTemplate(): boolean {
  //   console.log(' có grid column ')
  //   return !!this.cellTemplate;
  // }

  // public get hasHeaderTemplate(): boolean {
  //   return !!this.headerTemplate;
  // }
}