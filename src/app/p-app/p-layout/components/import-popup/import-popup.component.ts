import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FileRestrictions, FileSelectComponent } from '@progress/kendo-angular-upload';
import { State, CompositeFilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { LayoutService } from '../../services/layout.service';
import DTOListProp_ObjReturn from 'src/app/p-app/p-marketing/shared/dto/DTOListProp_ObjReturn.dto';

@Component({
  selector: 'app-import-popup',
  templateUrl: './import-popup.component.html',
  styleUrls: ['./import-popup.component.scss']
})
export class ImportPopupComponent implements OnInit {
  invalidFileExtension: boolean = false
  excelValid = false
  loading = false
  pageSize = 24
  mode = 1
  modes = [1, 2, 3, 4]
  //1 = chọn file
  //2 = invalid file
  //3 = uploading
  //4 = preview grid
  itemList = new Array<any>()
  filterItemList = new Array<any>()

  // rowKey: string = ''
  errorRows = []
  // errorCellsOfRow = []//[string[], rowKey]

  // filterImportList = new Array<any>()
  importGridDSState: State = {
    skip: 0, take: 24,
    filter: { filters: [], logic: 'or' },
    group: [],
    sort: []
  };
  importGridDSView = new Subject<{ data: DTOListProp_ObjReturn[], total }>();

  restrictions: FileRestrictions = {
    allowedExtensions: ['.xls', '.xlsx']
  };
  @ViewChild('selectImportFile') selectImportFile: FileSelectComponent;
  @ViewChild('texts') texts;
  @ViewChild('importGridDiv') importGridDiv;
  @ViewChild('importGrid') public diCustomGridRef: GridComponent;
  @Input() uploadEventHandlerCallback: Function

  constructor(
    public layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.layoutService.setImportDialogComponent(this)
  }
  //api
  //click

  closeImportDialog() {
    this.mode = 1
    this.excelValid = false
    this.invalidFileExtension = false
    this.layoutService.setImportDialog(false)
    this.selectImportFile.clearFiles()
    this.inputBtnDisplay()
    // this.excelValid = true;
    // this.service.setExcelValid(this.excelValid)
  }
  public removeFile(fileSelect, uid: string) {
    fileSelect.removeFileByUid(uid);
    this.invalidFileExtension = false
    this.mode = 1
    this.displayIfFileValid()
  }

  //autorun
  importDialogDisplay() {
    return this.layoutService.getImportDialog() ? 'unset' : 'none'
  }
  bodyDisplay() {
    return this.mode == 4 ? '13px 11px' : '16px'
  }
  innerBorderDisplay() {
    return this.mode == 1 || this.mode == 2 ? 0.2 : 0
  }
  invalidFormatDisplay() {
    return this.mode == 2 ? 'block' : 'none'
  }
  instructionTextsDisplay() {
    return this.mode == 1 ? 'block' : 'none'
  }
  innerBodyPaddingTop() {
    return this.mode == 4 ? 0 : '20%'
  }
  inputBtnDisplay() {
    var inputBtnStyle = this.selectImportFile.fileSelectButton.nativeElement.style;

    if (this.mode == 1) {
      inputBtnStyle.display = 'inline-flex'
    } else {
      inputBtnStyle.display = 'none'
    }
  }
  displayIfFileValid() {
    this.inputBtnDisplay()
  }

  // public showButton(state: FileState): boolean {
  //   return (state === FileState.Selected) ? true : false;
  // }
  onUploadExcel(e: any) {
    this.mode = 1
    // this.selectImportFile.clearFiles()
    var file = e.files[0];

    if (file.validationErrors == "invalidFileExtension") {
      this.invalidFileExtension = true
      this.mode = 2
    } else {
      this.invalidFileExtension = false
      this.mode = 4
      this.uploadEventHandler(e)
    }
    this.selectImportFile.clearFiles()
    this.displayIfFileValid()
  }
  uploadEventHandler(e: any) {
    this.uploadEventHandlerCallback(e.files[0].rawFile)
  }
  //paging
  pageChange(event: PageChangeEvent, gridName?: string) {
    if (gridName == null) {
      this.layoutService.pageChange(this.itemList,
        this.filterItemList, this.importGridDSView,
        this.importGridDSState, event)
    }
  }
  filterChange(filter: CompositeFilterDescriptor, gridName?: string) {
    if (gridName == null) {
      this.layoutService.filterChange(this.itemList,
        this.filterItemList, this.importGridDSView,
        this.importGridDSState, filter)
    }
  }
  sortChange(sort: SortDescriptor[], gridName?: string) {
    if (gridName == null) {
      this.layoutService.sortChange(this.itemList,
        this.filterItemList, this.importGridDSView,
        this.importGridDSState, sort)
    }
  }

  // rowCallback = ({ dataItem }) => {
  //   var item = { ...dataItem }
  //   // item.ListProperties[0]

  //   //tìm listProp map với row theo rowKey
  //   var object = Object.assign({}, ...Object.entries({ ...item.ListProperties as any[] }).map(([a, b]) => ({ [b]: true })))
  //   // var listProp: { ListProperties: string[], RowKey } = this.errorCellsOfRow.find(s => s.RowKey == item[this.rowKey])
  //   //từ listProp string tạo ra object với property tương ứng
  //   var object = Object.assign({}, ...Object.entries({ ...listProp.ListProperties as any[] }).map(([a, b]) => ({ [b]: true })))

  //   // return {
  //   //   // showCombo: item['ShowCombo'] == true
  //   // }
  //   return object
  // }
}
