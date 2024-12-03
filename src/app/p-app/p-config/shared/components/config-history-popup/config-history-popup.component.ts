import { ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';


/**
 * Component historyDialog dùng component PKendoDialogComponent và PKendoGridComponent.
 *
 * @remarks
 * Đây là một Component dùng để tạo xem thông tin lịch sử thay đổi.
 *
 * @example
 * <app-p-kendo-dialog></app-p-kendo-dialog>
 *
 * @export
 * @class ConfigHistoryPopupComponent
 * @implements {OnInit}
 */

@Component({
  selector: 'app-config-history-popup',
  templateUrl: './config-history-popup.component.html',
  styleUrls: ['./config-history-popup.component.scss']
})

export class ConfigHistoryPopupComponent implements OnInit, OnDestroy{

   /**
   * Tiêu đề của Dialog và Grid.
   *
   */
  @Input() popupTitle: string = ''

   /**
   * 
   *
   */
   @Input() isDialogOpened: boolean = false

  /**
   * Thông tin sản phẩm.
   *
   */
  @Input() popupData: { Barcode: string, ProductName: string , ImageThum: string}

  /**
   * Dữ liệu của grid.
   *
   */
  @Input() popupGridData = new Subject<any>()

  /**
   * Cấu hình từng column trong grid.
   *
   */
  @Input() columnConfig: { title: string; class: string; field: string; cellTemplate: TemplateRef<any> }[] = [];
    
  /**
   * Sự kiện khi đóng Dialog.
   *
   * @type {EventEmitter<string>}
   */
  @Output() closeHistoryDialog: EventEmitter<string> = new EventEmitter<string>();

  isOpenDetail: false
  loading: false

  constructor(){

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.columnConfig) {
      this.columnConfig = changes['columnConfig'].currentValue;
    }
  }

  closeDialog(){
    this.closeHistoryDialog.emit();
  }
  ngOnDestroy(): void {
    
  }
}
