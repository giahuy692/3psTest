import { Component, OnInit, Input, Output, ContentChildren, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { ColumnComponent, ColumnGroupComponent, TreeListComponent } from '@progress/kendo-angular-treelist';
import { Subject } from 'rxjs';
import { DTOLocation } from 'src/app/p-app/p-hri/shared/dto/DTOLocation.dto';
import { PKendoTreeListColumnComponent } from './p-kendo-treelist-column.component';

@Component({
  selector: 'app-p-kendo-treelist',
  templateUrl: './p-kendo-treelist.component.html',
  styleUrls: ['./p-kendo-treelist.component.scss']
})
export class PKendoTreelistComponent<T> implements OnInit, AfterViewInit {
  //Retrive input with many type of input array
  @Input() rootData: Subject<T[]> = new Subject<T[]>();
  @Input() hasChildrenFn: (item: T) => boolean;
  @Input() fetchChildrenFn: (item: T) => T[];
  @Input() myTemplate: any;

  @ViewChild('customTreeList') public customTreelist: TreeListComponent;
  @ViewChild('treelistContent', { static: true }) treelistContent!: TemplateRef<any>;

  @ContentChildren(ColumnComponent) columns;
  @ContentChildren(PKendoTreeListColumnComponent) customizedColumns;
  @ContentChildren(ColumnGroupComponent) columnGroups;

  constructor() {}

  ngOnInit(): void {
    // console.log(this.myTemplate);
    
  }

  ngAfterViewInit(): void {
      this.customTreelist.columns.reset([
        this.customTreelist.columns.toArray()[0],
        this.columnGroups.toArray(),
        this.customTreelist.columns.toArray().slice(1)
      ])
      // this.customTreelist.columns.reset(this.columns.toArray().map(item => item.realColumn));
  }
}
