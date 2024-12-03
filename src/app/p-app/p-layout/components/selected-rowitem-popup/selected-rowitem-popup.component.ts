import { Component, OnInit, Input, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MenuDataItem } from '../../dto/menu-data-item.dto';

@Component({
  selector: 'app-selected-rowitem-popup',
  templateUrl: './selected-rowitem-popup.component.html',
  styleUrls: ['./selected-rowitem-popup.component.scss']
})
export class SelectedRowitemPopupComponent implements OnInit, OnChanges {
  @Input() count = 0
  @Input() selectedRowitemDialogOpened = false
  @Input() selectedRowitemPopupCallback: Function
  @Input() clearSelectedRowitemCallback: Function
  @Input() btnList: MenuDataItem[] = []

  constructor(public layoutService: LayoutService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.layoutService.setSelectionPopupComponent(this)
  }
  //CLICK
  buttonClick(field: string, value: number) {
    if (this.selectedRowitemPopupCallback != undefined)
      this.selectedRowitemPopupCallback(field, value)
  }

  // updateListStatus(statusID: number){
  //   if(this.selectedRowitemPopupCallback != undefined)
  //     this.selectedRowitemPopupCallback("StatusID", statusID)
  // }
  // updateListType(orderTypeID: number){
  //   if(this.selectedRowitemPopupCallback != undefined)
  //     this.selectedRowitemPopupCallback("OrderTypeID", orderTypeID)
  // }
  closeSelectedRowitemDialog() {
    if (this.clearSelectedRowitemCallback != undefined)
      this.clearSelectedRowitemCallback()
    this.selectedRowitemDialogOpened = false
  }
  //AUTORUN
  isSelectedRowitemDialogVisible() {
    return this.selectedRowitemDialogOpened ? 'visible' : 'hidden'
  }
}
