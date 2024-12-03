import { Component, OnInit, ContentChildren, EventEmitter, ViewChild, Input, AfterViewInit, ViewChildren, HostListener, ElementRef, Renderer2, ChangeDetectorRef, Output, TemplateRef, ContentChild, SimpleChanges } from '@angular/core';
import { ColumnComponent, PageChangeEvent, GridComponent, SelectableSettings, SelectionEvent, ColumnGroupComponent, ScrollMode, RowClassFn, GridDataResult } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { LayoutService } from '../../services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { GridDropdownData } from '../../p-sitemaps/grid.dropdown.data';
import { MenuDataItem } from '../../dto/menu-data-item.dto';
import * as $ from 'jquery'

@Component({
  selector: 'app-p-kendo-grid',
  templateUrl: './p-kendo-grid.component.html',
  styleUrls: ['./p-kendo-grid.component.scss']
})
export class PKendoGridComponent implements OnInit, AfterViewInit {
  @Input() @Ps_UtilObjectService.Required data: Array<any> | GridDataResult;
  @Input() id: string = 'Code'


  @Input() loading: boolean = false;
  @Input() sortable: boolean = true;
  @Input() pageable: boolean = true;
  @Input() filterable: boolean | string = false
  @Input() autoHeight: boolean = true; // Bật tự động tính height cho grid

  //detail
  // 1: item detail nằm ngang cấp so với item cha
  // 2: item detail padding vào 1 cấp so với item cha
  @Input() typeMasterDetail: number = 0; //1 full, 2 padding cho dễ nhận biết nếu 3 cấp trở lên (cây đệ quy với grid)
  @ContentChild('detailTemplate', { static: true }) detailTemplate: TemplateRef<any>; //Truyền nội dung vào detail master
  @Input() textExpand: string = ''
  @Input() textCollapse: string = ''
  @Output() callDataExpand: EventEmitter<string> = new EventEmitter();
  rowStates: Map<string, boolean> = new Map(); //Lưu trang thái của row để khi data thay đổi thì vẫn giữ nguyên giá trị của text
  eventHandlers: Map<string, (event: Event) => void> = new Map(); // Hủy sự kiện click để không bị dup
  //endDetail

  @Input() total: number = 0;
  @Input() height: number = null;
  @Input() width: number = null;
  @Input() skip: number = 0;
  @Input() take: number = 0;
  @Input() pageSize: number = 25;
  //pagingMode 1 = ngang, 2 = dọc
  @Input() pagingMode: number = 1

  @Input() scrollable: ScrollMode
  @Input() filter: CompositeFilterDescriptor;

  @Input() pageSizes: number[] = [25];
  @Input() sort: SortDescriptor[];

  filterableDefault = this.filterable
  //selection
  @Input() showCheckbox: boolean = true // Hiển thị cột checkbox
  @Input() hasMoreAction: boolean = true
  @Input() groupable: boolean = false;
  @Input() rowClass: RowClassFn
  @Input() selectable: SelectableSettings = { // setting seclected của component
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: false,
  }


  selectedRowitemDialogOpened = false
  count: number = 0
  editedRowIndex: number

  selectedKeys: number[] = []
  selectedRowitem = []
  clearSelectedRowitemCallback: Function
  // @Output() onDataStateChange: EventEmitter = new EventEmitter();
  @ViewChild('myCustomGrid') public diCustomGridRef: GridComponent;
  //grid event
  @Input() public onPageChangeCallback: Function
  @Input() public onSortChangeCallback: Function
  @Input() public onFilterChangeCallback: Function

  @Input() public onSelectCallback: Function
  @Input() public getSelectionPopupCallback: Function
  @Input() onSelectedPopupBtnCallback: Function

  btnList: MenuDataItem[] = []
  selectedRowitemPopupCallback: Function
  //rowItem action dropdown
  // @Input() public onEditCallback: Function
  // @Input() public onDeleteCallback: Function
  @Input() public getActionDropdownCallback: Function
  @Input() public onActionDropdownClickCallback: Function

  @Input() editHandlerCallback: Function
  @Input() saveHandlerCallback: Function
  @Input() removeHandlerCallback: Function
  @Input() cancelHandlerCallback: Function
  //popup  
  popupShow = false;
  currentAnchorIndex: number = -1

  // @Input() hasMoreActionPopup: boolean = true
  @Input() allowedMoreActionDropdown: string[] = []

  @Output() getSelectedRowitem: EventEmitter<any> = new EventEmitter<any>();
  moreActionDropdown: MenuDataItem[] = []

  @ViewChildren('anchor') anchors;
  @ViewChild('rowMoreActionPopup') rowMoreActionPopup;
  @ViewChild('myCustomGrid', { static: false }) defaultAnchor: ElementRef<HTMLInputElement> = {} as ElementRef;

  // @ContentChildren(PKendoGridColumnComponent) pcolumns;
  @ContentChildren(ColumnComponent) columns;
  @ContentChildren(ColumnGroupComponent) columnGroups;
  @ContentChildren('columns2') columns2;
  // @ContentChildren(ColumnComponent, {read: TemplateRef}) columns2;
  // @ContentChildren(CommandColumnComponent) commandColumns
  // @ContentChildren(TemplateRef) itemTemplate: TemplateRef<ColumnComponent>;

  currentRowItem = new Object()

  constructor(public layoutService: LayoutService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    //Deep copy, tránh GridDropdownData bị thay đổi sau khi moreActionDropdown update vì Obj Ref
    this.moreActionDropdown = JSON.parse(JSON.stringify(GridDropdownData))
    this.clearSelectedRowitemCallback = this.clearSelection.bind(this)
    this.selectedRowitemPopupCallback = this.onSelectedPopupBtnClick.bind(this)
  }

  ngAfterViewInit() {
    if (this.columns2.toArray().length > 0) {
      this.diCustomGridRef.columns.reset([
        this.diCustomGridRef.columns.toArray()[0],
        this.columns2.toArray(),
        this.diCustomGridRef.columns.toArray().slice(1)
      ])
    } else {
      this.diCustomGridRef.columns.reset([
        this.diCustomGridRef.columns.toArray()[0],
        this.columns.toArray(),
        this.columnGroups.toArray(),
        // this.commandColumns.toArray(),
        this.diCustomGridRef.columns.toArray().slice(1)
      ])
    }
    this.diCustomGridRef.autoFitColumns()

    if (this.rowClass != undefined)
      this.diCustomGridRef.rowClass = this.rowClass
    // this.diCustomGridRef.columns.reset(this.pcolumns.toArray().map(item => item.realColumn));
    if (this.autoHeight)
      this.handleCalcHeightGrid()
  }


  ngOnChanges() {
    this.getAllowedActionDropdown()
    if (this.filterableDefault != "menu")
      this.filterableDefault = this.filterable
    
    // có danh sách và text thì load hàm
    if (Ps_UtilObjectService.hasListValue(this.data) && this.textExpand.length > 0 && this.textCollapse.length > 0){
      this.modifyExpandCollapseOnGrid();
    }
    //đóng tất cả các item đang expand
    if (Ps_UtilObjectService.hasListValue(this.data)) {
      this.collapseAll()
    }
    // this.eventHandlers.clear();
    this.rowStates.clear();
  }

  collapseAll(){
    const grid = this.diCustomGridRef;
    if(grid && grid.data){
      const data = grid.data instanceof Array ? grid.data : grid.data.data;
      data.forEach((item, index) => {
          grid.collapseRow(index);
      });
    }
    if(this.textExpand.length > 0 && this.textCollapse.length > 0){
      this.updateExpandCollapseText();
    }
  }
  
  //Hàm set lại text khi đóng tất cả các row
  updateExpandCollapseText(): void {
    const rows = document.querySelectorAll('.isDetailGrid tbody tr.k-master-row');
    rows.forEach((row) => {
      const link = row.querySelector('td.k-hierarchy-cell a') as HTMLElement;
      if (!link) return;
  
      const rowId = row.getAttribute('data-kendo-grid-item-index');
      if (!rowId) return;
  
      const isExpanded = this.rowStates.get(rowId) || false;
      link.innerHTML = '';
      link.textContent = isExpanded ? this.textCollapse : this.textExpand;
      link.classList.toggle('expand-text', !isExpanded);
      link.classList.toggle('collapse-text', isExpanded);
    });
  }

  //Hàm thay đổi icon của expand,collapse thành text
  modifyExpandCollapseOnGrid() {
    const that = this;
    setTimeout(() => {
      const rows = document.querySelectorAll('.isDetailGrid tbody tr.k-master-row');
      rows.forEach((row) => {
        const link = row.querySelector('td.k-hierarchy-cell a') as HTMLElement;
        if (!link) return;
  
        const rowId = row.getAttribute('data-kendo-grid-item-index');
        if (!rowId) return;
  
        const oldHandler = this.eventHandlers.get(rowId);
        if (oldHandler) {
          link.removeEventListener('click', oldHandler);
        }

        const newHandler = (event: Event) => this.expandCollapseHandler(event, rowId);
        this.eventHandlers.set(rowId, newHandler);
        
        // Áp dụng trạng thái đã lưu hoặc mặc định là collapsed
        const isExpanded = this.rowStates.get(rowId) || false;
        link.innerHTML = '';
        link.textContent = isExpanded ? that.textCollapse : that.textExpand;
        //set lại text nếu data thay đổi
        link.classList.toggle('expand-text', !isExpanded);
        link.classList.toggle('collapse-text', isExpanded);
        
        link.addEventListener('click', newHandler);
      });
    }, 100);
  }

  

  // hàm set giá trị text khi click
  expandCollapseHandler = (event: Event, rowId: any) => {
    event.preventDefault();
    const link = event.currentTarget as HTMLElement;
    const isExpanding = link.textContent === this.textExpand;
    const grid = this.diCustomGridRef;
    var itemGrid: any
    if(grid && grid.data){
      const data = grid.data instanceof Array ? grid.data : grid.data.data;
      data.forEach((item, index) => {
        if(index == rowId){
          itemGrid = item
        }
      });
    }
    if (isExpanding) {
      link.textContent = this.textCollapse;
      link.classList.remove('expand-text');
      link.classList.add('collapse-text');
      if(Ps_UtilObjectService.hasValue(itemGrid)){
        this.callDataExpand.emit(itemGrid);
      }
      this.rowStates.set(rowId, true);

    } else {
      link.textContent = this.textExpand;
      link.classList.remove('collapse-text');
      link.classList.add('expand-text');
      this.rowStates.set(rowId, false);
    }
  }

  // Chạy hàm sau khi DOM đã load

  getAllowedActionDropdown() {
    if (!Ps_UtilObjectService.hasValue(this.allowedMoreActionDropdown)
      || this.allowedMoreActionDropdown.length == 0)
      this.moreActionDropdown.filter(s => s.Actived == true)
        .forEach(s => s.Actived = false)

    else
      this.allowedMoreActionDropdown.forEach(s => {
        var act = this.moreActionDropdown.find(m => m.Link == s)

        if (act != undefined)
          act.Actived = true
      });
  }
  getCustomAllowedActionDropdown(dataItem) {
    if (this.getActionDropdownCallback != undefined) {
      var newDropdown = this.getActionDropdownCallback(this.moreActionDropdown, dataItem)

      if (Ps_UtilObjectService.hasListValue(newDropdown))
        this.moreActionDropdown = newDropdown
    }
  }
  getActionDropdown() {
    var activedDropdown = this.moreActionDropdown.filter(s => s.Actived == true)
    return activedDropdown
  }
  //CLICK EVENT  
  //popup
  togglePopup(index: any, item: any, anchor: any) {
    this.popupAnchor = anchor;
    if (index != this.currentAnchorIndex) {
      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      this.popupShow = !this.popupShow
    }
    if (this.popupShow && this.getActionDropdownCallback != undefined)
      this.getCustomAllowedActionDropdown(item)

    this.currentAnchorIndex = index
    this.currentRowItem = item
  }
  onClickMoreActionItem(item: MenuDataItem) {
    if (this.onActionDropdownClickCallback != undefined) {
      this.onActionDropdownClickCallback(item, this.currentRowItem)
    }
  }
  //selection popup
  clearSelection() {
    this.count = 0
    this.selectedKeys = []
    this.selectedRowitem = []
    this.selectedRowitemDialogOpened = false

    this.isFilterMenuActive()

    if (this.onSelectCallback != undefined) {
      this.onSelectCallback(null, this.selectedRowitemDialogOpened)
    }
  }
  onSelectedPopupBtnClick(btnType: string, value: any) {
    if (this.onSelectedPopupBtnCallback != undefined)
      this.onSelectedPopupBtnCallback(btnType, this.selectedRowitem, value)
    
  }
  //AUTO RUN
  //Grid
  onSelectionChange(e: SelectionEvent) {
    if (this.selectable.mode == 'multiple') {
      if (e.selectedRows.length > 0) {
        e.selectedRows.forEach(s => this.selectedRowitem.push(s.dataItem))
        // this.selectedRowitem.push(e.selectedRows[0].dataItem)
        this.count = this.selectedRowitem.length
      }
      else if (e.deselectedRows.length > 0) {
        e.deselectedRows.forEach(s => {
          var index = this.selectedRowitem.findIndex(b => s.dataItem[this.id] == b[this.id])

          this.selectedRowitem.splice(index, 1);
        })
        // var item = e.deselectedRows[0].dataItem
        // var index = this.selectedRowitem.findIndex(s => s.Code == item.Code)

        // this.selectedRowitem.splice(index, 1);
        this.count = this.selectedRowitem.length
      }
      // this.selectedRowitemDialogOpened = this.selectedRowitem.length > 0

      if (this.selectedRowitem.length <= 0) {
        this.clearSelection()
      } else {
        this.selectedRowitemDialogOpened = true
        this.selectedKeys = this.selectedRowitem.map(s => s[this.id])
        this.isFilterMenuActive()

        if (this.getSelectionPopupCallback != undefined) {
          this.btnList = this.getSelectionPopupCallback(this.selectedRowitem)
        }
        if (this.onSelectCallback != undefined) {
          this.onSelectCallback(this.selectedRowitem, this.selectedRowitemDialogOpened)
        }
      }
    }
    else if (this.onSelectCallback != undefined) {
      this.onSelectCallback(e, this.selectedRowitemDialogOpened)
    }

    this.getSelectedRowitem.emit(this.selectedRowitem);

  }
  isFilterMenuActive() {
    this.filterable = this.selectedRowitemDialogOpened ? false : this.filterableDefault
    this.sortable = !this.selectedRowitemDialogOpened
  }
  //sorting
  sortChange(sort: SortDescriptor[]) {
    if (this.onSortChangeCallback != undefined)
      this.onSortChangeCallback(sort)
  }
  //paging
  pageChange(event: PageChangeEvent) {
    if (this.onPageChangeCallback != undefined)
      this.onPageChangeCallback(event)
  }
  //filtering
  filterChange(filter: CompositeFilterDescriptor) {
    if (this.onFilterChangeCallback != undefined)
      this.onFilterChangeCallback(filter)
  }
  //edit handler
  // public editHandler({ sender, rowIndex, dataItem }: EditEvent) {
  //   this.closeEditor(sender);
  //   this.editHandlerCallback({ sender, rowIndex, dataItem })
  // }
  // public cancelHandler({ sender, rowIndex }: CancelEvent) {
  //   this.closeEditor(sender, rowIndex);
  //   this.cancelHandlerCallback({ sender, rowIndex })
  // }
  // public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent) {
  //   // const file: DTOCFFile = formGroup.getrawvalue();
  //   // this.editService.save(product, isNew);
  //   this.saveHandlerCallback({ sender, rowIndex, formGroup, isNew })
  //   sender.closeRow(rowIndex);
  // }
  // public removeHandler({ dataItem }: RemoveEvent) {
  //   this.removeHandlerCallback({ dataItem })
  //   // this.editService.remove(dataItem);
  // }
  // private closeEditor(grid, rowIndex = this.editedRowIndex) {
  //   grid.closeRow(rowIndex);
  //   this.editedRowIndex = undefined;
  //   // this.formGroupFile = undefined;
  // }
  //popup
  popupAnchor: any;  
  isPopupVisible() {
    return this.popupShow ? 'visible' : 'hidden'
  }
  getAnchor() {
    return this.popupAnchor;
    // console.log('anchors', this.defaultAnchor)//todo làm sao để trả elementRef mặc định khi anchors null?
    //anchors bị null nếu list không còn row item nào
    // if (Ps_UtilObjectService.hasValue(this.anchors) && this.anchors.length > 0) {
    //   var anchor = this.anchors.toArray()[this.currentAnchorIndex]

    //   if (Ps_UtilObjectService.hasValue(anchor))
    //     return anchor
    // }

    //return this.defaultAnchor
  }
  //giấu more action list khi user click chỗ khác
  @HostListener('document:click', ['$event'])
  clickout(event) {
    // var anchor = this.getAnchor()
    // if (Ps_UtilObjectService.hasValue(anchor)) {
    //   if (!anchor.nativeElement.contains(event.target)
    //     && this.popupShow == true) {
    //     this.popupShow = false
    //   }
    // }
    const anchor = this.getAnchor();
    if (anchor && !anchor.nativeElement.contains(event.target) && this.popupShow) {
      this.popupShow = false;
    }
  }

  //#region tính độ cao cho grid phù hợp với trang
  // header 55 + footer 30 + header1 70 + header2 95
  handleCalcHeightGrid() {
    $(document).ready(function () {
      const heightHeaderMain = $('.app-header');
      const heightFooter = $('.app-footer');
      const heightHeader1 = $('.header-1');
      const heightHeader2 = $('.header-2');
      const heightHeaderPortal = $('.header-portal');
      const heightGridWrapper = $('.grid-wrapper');
      const heightGrid = $('.k-grid-aria-root');


      let totalHeight = 0;

      totalHeight += Ps_UtilObjectService.hasValue(heightHeaderMain) ? heightHeaderMain.outerHeight() || 0 : 0;
      totalHeight += Ps_UtilObjectService.hasValue(heightFooter) ? heightFooter.outerHeight() || 0 : 0;
      totalHeight += Ps_UtilObjectService.hasValue(heightHeader1) ? heightHeader1.outerHeight() || 0 : 0;
      totalHeight += Ps_UtilObjectService.hasValue(heightHeader2) ? heightHeader2.outerHeight() || 0 : 0;
      totalHeight += Ps_UtilObjectService.hasValue(heightHeaderPortal) ? heightHeaderPortal.outerHeight() || 0 : 0;

      if (totalHeight > 0) {
        // this.height = window.innerHeight - totalHeight
        if(Ps_UtilObjectService.hasValue(heightGridWrapper))
          heightGridWrapper.css('height', `calc(100vh - ${totalHeight + 20}px)`);

        if(Ps_UtilObjectService.hasValue(heightGrid))
          heightGrid.css('height', `calc(100vh - ${totalHeight + 20 + 49}px)`);
      }

    });
  }


  //#endregion
}
