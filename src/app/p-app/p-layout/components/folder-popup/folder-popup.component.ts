import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, DoCheck, OnDestroy, Inject } from '@angular/core';
import { FileRestrictions, FileSelectComponent } from '@progress/kendo-angular-upload';
import { State } from '@progress/kendo-data-query';
import { Subject, Observable, Subscription } from 'rxjs';
import {
  SelectableSettings, ColumnBase, SelectionEvent,
  EditEvent as EditEventGrid, SaveEvent as SaveEventGrid, CancelEvent as CancelEventGrid, RemoveEvent as RemoveEventGrid
} from '@progress/kendo-angular-grid';
import { LayoutService } from '../../services/layout.service';
import { DTOCFFolder, DTOCFFile } from '../../dto/DTOCFFolder.dto';
import { MarketingService } from 'src/app/p-app/p-marketing/shared/services/marketing.service';
import { MarBannerAPIService } from 'src/app/p-app/p-marketing/shared/services/marbanner-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { TreeItem } from '@progress/kendo-angular-treeview';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { TreeListComponent, AddEvent, EditEvent, SaveEvent, CancelEvent, RemoveEvent } from '@progress/kendo-angular-treelist';
import { MarPromotionAPIService } from 'src/app/p-app/p-marketing/shared/services/marpromotion-api.service';
import { MenuDataItem } from '../../dto/menu-data-item.dto';
import { IGraphServices } from '../../services/folder-popup.service';

@Component({
  selector: 'app-folder-popup',
  templateUrl: './folder-popup.component.html',
  styleUrls: ['./folder-popup.component.scss']
})
export class FolderPopupComponent implements OnInit, DoCheck, OnDestroy {
  justLoaded = true
  loading = false
  isAdd = false
  @Input() canResize = false

  @Input('serviceIndex') serviceIndex: number = 0;
  @Input() imgWidth = 150
  @Input() imgHeight = 50

  /** Cho phép tải lên tất cả định dạng
   */
  @Input() isAllowAllFormats: boolean = false

  itemList = new Array<any>()
  filterItemList = new Array<any>()
  contextList: Array<string> = ['Thư mục', 'File']
  context: string = ""
  searchQuery: string = ''

  restrictions: FileRestrictions = {
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxFileSize: 200000//200KB
  };
  actionIsVisible = false
  addDialogIsVisible = false
  path: Array<string> = []
  pathIndex: Array<number> = [0]
  //Grid
  pageSize: number = 0
  folGridDSState: State
  folGridDSView = new Subject<any>();
  //folder
  rootFolder = new DTOCFFolder()
  currentFolder = new DTOCFFolder()
  currentFolderWithDropdown = new DTOCFFolder()
  parentFolder = new DTOCFFolder()
  previousFolder = new DTOCFFolder()
  //file
  currentFile = new DTOCFFile()
  //
  selectedFolder = new Array<DTOCFFolder>()
  folderList = new Array<DTOCFFolder>()
  filterFolderList = new Array<DTOCFFolder>()
  //action
  allowActionDropdown = ['delete']//todo xử lý đổi tên file 'edit', 
  onActionDropdownClickCallback: Function
  //treeview
  public selectableSettings: SelectableSettings = {
    enabled: true,
    mode: 'single',
    drag: false,
    checkboxOnly: false,
  }
  //
  @ViewChild('actionList') actionDropdown: ElementRef;
  @ViewChild('newFolderName') newFolderName;
  @ViewChild('folderTree') folderTree: TreeListComponent;
  //
  public onPickFileCallback: Function;
  @Input() pickFileCallback: Function
  @Input() GetFolderCallback: Function
  //
  public editHandlerCallback: Function;
  public saveHandlerCallback: Function;
  public removeHandlerCallback: Function;
  public cancelHandlerCallback: Function;
  // public onDeleteCallback: Function;
  //
  GetFolderCallback_sst1: Subscription
  GetFolderCallback_sst2: Subscription
  CreateFolder_sst: Subscription
  RenameFolder_sst: Subscription
  DeleteFolder_sst: Subscription
  UploadFile_sst: Subscription
  RenameFile_sst: Subscription
  DeleteFile_sst: Subscription

  public activeItem: TreeItem;
  public focusEditor: boolean;
  public focusIndex: string;
  public textFormControl: UntypedFormControl;
  public formGroupFolder: UntypedFormGroup;
  public formGroupFile: UntypedFormGroup;
  public editedItemFolder: DTOCFFolder;
  public editedItemFile: DTOCFFile;
  public editedItemFileIndex;

  constructor(
    public layoutService: LayoutService,
    public marketingService: MarketingService,
    public marBannerApiService: MarBannerAPIService,
    public marPromotionApiService: MarPromotionAPIService,
    @Inject('IGraphServices') private providerService: IGraphServices[]
  ) {
  }

  ngOnInit(): void {
    this.folGridDSState = this.layoutService.gridDSState
    this.folGridDSView = this.layoutService.gridDSView
    // this.rootData = this.editService;
    // this.editService.read();
    this.onPickFileCallback = this.onPickFile.bind(this);
    // this.editHandlerCallback = this.editFileHandler.bind(this);
    // this.saveHandlerCallback = this.saveFileHandler.bind(this);
    // this.removeHandlerCallback = this.removeFileHandler.bind(this);
    // this.cancelHandlerCallback = this.cancelFileHandler.bind(this);
    // this.onDeleteCallback = this.onDeleteFile.bind(this)
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.providerService[this.serviceIndex].setGraphData(this.GetFolderCallback)

    this.restrictions.allowedExtensions = this.isAllowAllFormats ? [] : ['.jpg', '.jpeg', '.png']
  }
  // ngAfterViewInit() {
  //   // ngAfterViewChecked() {
  //   this.p_getFolder()
  // }
  ngDoCheck() {
    var sameAPI = this.GetFolderCallback == this.providerService[this.serviceIndex].getGraphData()
    //check folder trong service VÀ folder hiện tại có giống nhau
    //HOẶC 
    //check folder root VÀ folder hiện tại (có phải cũng là root) có giống nhau
    var sameCache = this.providerService[this.serviceIndex].getCache() ?
      this.rootFolder.PathFolder == this.providerService[this.serviceIndex].getCache().PathFolder ||
      (this.checkFolderIsRoot(this.currentFolder.PathFolder) && this.rootFolder.PathFolder == this.currentFolder.PathFolder)
      : this.rootFolder.PathFolder == this.currentFolder.PathFolder

    if (!sameAPI) {//nếu hàm lấy folder của service khác (bị null or undefined) với hàm Input thì gán vào service
      this.justLoaded = true
      this.providerService[this.serviceIndex].setGraphData(this.GetFolderCallback)
    }

    if (this.layoutService.getFolderDialog() && this.justLoaded) {//để chạy api 1 lần khi hiện popup
      this.justLoaded = false
      this.p_getFolder()
    }
    else if (!sameCache) {//nếu đổi popup sau khi đã gọi api hoặc có cache thì dùng cache của service
      this.p_getFolder('', false)
    }
  }
  //API
  //folder
  p_getFolder(folderPath?: string, callAPI = true) {
    this.loading = true;

    if (Ps_UtilObjectService.hasValue(this.GetFolderCallback)) {
      if (Ps_UtilObjectService.hasValueString(folderPath)) {
        // let api: Observable<DTOCFFolder> = this.GetFolderCallback(folderPath)
        if (callAPI) {
          let api: Observable<DTOCFFolder> = this.providerService[this.serviceIndex].getGraphData(folderPath)

          if (Ps_UtilObjectService.hasValue(api))
            this.GetFolderCallback_sst1 = api.subscribe(res => {
              this.handlingFolderWithChildPath(res)
              this.loading = false;
            }, () => {
              this.loading = false;
            })
        }
        else
          this.loading = false;
      }
      else {
        // let api: Observable<DTOCFFolder> = this.GetFolderCallback("")
        if (callAPI) {
          let api: Observable<DTOCFFolder> = this.providerService[this.serviceIndex].getGraphData('')

          if (Ps_UtilObjectService.hasValue(api))
            this.GetFolderCallback_sst2 = api.subscribe(res => {
              this.handlingFolderRoot(res)
              this.loading = false;
            }, () => {
              this.loading = false;
            })
        }
        else {
          let res = this.providerService[this.serviceIndex].getCache()
          // this.clearFolder()//thử ko clear thì có bị gì
          this.handlingFolderRoot(res)
          this.loading = false;
        }
      }
    }
  }
  handlingFolderWithChildPath(res) {
    if (res != null) {
      if (Ps_UtilObjectService.hasListValue(res.ListFiles))
        res.ListFiles.map((s, i) => { s.Code = i })
      if (Ps_UtilObjectService.hasListValue(res.SubFolders))
        res.SubFolders.map((s, i) => { s.Code = i + 1 })
      //update grid phải
      this.currentFolder.Loaded = true
      this.currentFolder.ListFiles = res.ListFiles
      this.currentFolder.SubFolders = res.SubFolders

      this.selectedFolder[0].Loaded = true
      this.selectedFolder[0].ListFiles = res.ListFiles
      this.selectedFolder[0].SubFolders = res.SubFolders
      //update grid trái
      var theFolder = this.searchTree(this.folderList[0], this.currentFolder)

      if (theFolder != null) {
        theFolder.ListFiles = res.ListFiles
        theFolder.SubFolders = res.SubFolders
      }
      this.setFolder()
      this.folGridDSView.next({ data: this.folderList, total: this.folderList.length });
    }
  }
  handlingFolderRoot(res) {
    if (res != null) {
      this.providerService[this.serviceIndex].setCache(res)

      if (Ps_UtilObjectService.hasListValue(res.ListFiles))
        res.ListFiles.map((s, i) => { s.Code = i })
      if (Ps_UtilObjectService.hasListValue(res.SubFolders))
        res.SubFolders.map((s, i) => { s.Code = i + 1 })

      res.Loaded = true
      this.rootFolder = res
      this.folderList[0] = res;
      this.folGridDSView.next({ data: this.folderList, total: this.folderList.length });

      this.loadFolder()
      this.setFolder()
    }
  }
  checkFolderIsRoot(fol) {
    if (Ps_UtilObjectService.hasValue(fol) && Ps_UtilObjectService.hasValueString(fol.PathFolder)) {
      var pathArr = fol.PathFolder.split('/')
      //  ~/Uploads/_6/<RootFolder>
      if (pathArr.length <= 4) {
        return true
      }
    }
    return false
  }
  clearFolder() {
    //folder
    this.rootFolder = new DTOCFFolder()
    this.currentFolder = new DTOCFFolder()
    this.currentFolderWithDropdown = new DTOCFFolder()
    this.parentFolder = new DTOCFFolder()
    this.previousFolder = new DTOCFFolder()
    //file
    this.currentFile = new DTOCFFile()
    //
    this.selectedFolder = new Array<DTOCFFolder>()
    this.folderList = new Array<DTOCFFolder>()
    this.filterFolderList = new Array<DTOCFFolder>()
  }
  //inline editing
  p_addFolder() {
    this.loading = true;

    this.CreateFolder_sst = this.marBannerApiService.CreateFolder(this.currentFolder.PathFolder
      + "/" + this.currentFolder.FolderName).subscribe(res => {
        if (res != null) {
          this.layoutService.onSuccess('Thêm mới Thư mục thành công')
          this.p_getFolder(this.parentFolder.PathFolder);
        } else {
          this.layoutService.onError('Thêm mới Thư mục thất bại')
        }
        this.loading = false;
      }, f => {
        this.layoutService.onError('Xảy ra lỗi khi Thêm mới Thư mục. ' + f?.error?.Message)
        this.loading = false;
      });
  }
  p_renameFolder() {
    this.loading = true;

    this.RenameFolder_sst = this.marBannerApiService.RenameFolder(this.currentFolder).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess('Đổi tên Thư mục thành công')
        this.p_getFolder();
      } else {
        this.layoutService.onError('Đổi tên Thư mục thất bại')
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError('Xảy ra lỗi khi Đổi tên Thư mục. ' + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  p_deleteFolder() {
    this.loading = true;

    this.DeleteFolder_sst = this.marBannerApiService.DeleteFolder(this.currentFolder.PathFolder).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess('Xóa Thư mục thành công')
        this.p_getFolder(this.parentFolder.PathFolder);
        this.deleteDialogOpened = false
      } else {
        this.layoutService.onError('Xóa Thư mục thất bại')
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError('Xảy ra lỗi khi Xóa Thư mục. ' + f?.error?.Message)
      this.loading = false;
    });
  }
  //file
  p_uploadFile(files: File[]) {
    this.loading = true;

    this.UploadFile_sst = this.marBannerApiService.UploadFile(files, this.currentFolder.PathFolder).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess('Upload File thành công')
        this.p_getFolder(this.currentFolder.PathFolder);
      } else {
        this.layoutService.onError('Upload File thất bại')
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError('Xảy ra lỗi khi Upload File. ' + f?.error?.Message)
      this.loading = false;
    });
  }
  p_renameFile() {
    this.loading = true;

    this.RenameFile_sst = this.marBannerApiService.RenameFile(this.currentFile).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess('Đổi tên File thành công')
        this.p_getFolder(this.currentFolder.PathFolder);
      } else {
        this.layoutService.onError('Đổi tên File thất bại')
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError('Xảy ra lỗi khi Đổi tên File. ' + f?.error?.Message)
      this.loading = false;
    });
  }
  p_deleteFile() {
    this.loading = true;

    this.DeleteFile_sst = this.marBannerApiService.DeleteFile(this.currentFile.PathFile).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess('Xóa File thành công')
        this.p_getFolder(this.currentFolder.PathFolder);
        this.deleteDialogOpened = false
      } else {
        this.layoutService.onError('Xóa File thất bại')
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError('Xảy ra lỗi khi Xóa File. ' + f?.error?.Message)
      this.loading = false;
    });
  }
  //CLICK EVENT  
  onActionDropdownClick(menu: MenuDataItem, item: DTOCFFile) {
    if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.onDeleteFile(item)
    }
  }
  //dialog button
  closeFolderDialog() {
    this.currentFile = new DTOCFFile()
    this.layoutService.setFolderDialog(false)
  }
  //left tree button
  addFolder() {
    var name = this.newFolderName.value

    if (Ps_UtilObjectService.hasValue(name) &&
      Ps_UtilObjectService.hasValueString(name)) {

      if (this.isAdd) {
        this.p_addFolder()
      } else {
        this.p_renameFolder()
      }
    } else {
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
    }
  }
  addFolderInside() {

  }
  //right grid button
  clickFolder(folder?: DTOCFFolder) {
    this.path = new Array<string>()
    this.pathIndex = [0]

    if (folder != null) {//set folder được click
      if (Ps_UtilObjectService.hasListValue(folder.ListFiles))
        folder.ListFiles.map((s, i) => { s.Code = i })
      if (Ps_UtilObjectService.hasListValue(folder.SubFolders))
        folder.SubFolders.map((s, i) => { s.Code = i + 1 })

      this.currentFolder = folder
      this.selectedFolder[0] = folder
      //nếu ko phải root thì get folder con và nếu file or subfolder null
      if (folder.PathFolder != this.rootFolder.PathFolder && folder.FolderName != this.rootFolder.FolderName
        && (folder.ListFiles == null || folder.SubFolders == null) && !folder.Loaded)
        this.p_getFolder(folder.PathFolder)
      else {
        this.searchTree(this.folderList[0], this.currentFolder)
        this.setFolder()
      }
    } else {//quay về root
      this.currentFolder = this.folderList[0]
      this.parentFolder = this.currentFolder
      this.selectedFolder[0] = this.currentFolder

      this.searchTree(this.folderList[0], this.currentFolder)
      this.setFolder()
    }
    // this.path = new Array<string>()
    // this.pathIndex = [0]
    // this.searchTree(this.folderList[0], this.currentFolder.Code)
    // this.setFolder()
  }
  backToParent() {
    this.path = new Array<string>()
    this.pathIndex = [0]
    // this.parentFolder = this.searchTree(
    //   this.folderList[0], this.currentFolder.ParentID)
    this.currentFolder = this.parentFolder
    this.setFolder()
  }
  setFolder() {
    this.layoutService.setFolder(this.currentFolder)
    this.layoutService.setFolderPath(this.path)//chưa biết dùng làm gì
    this.currentFolderWithDropdown = new DTOCFFolder()
  }
  search(ev?: string) {
    this.searchQuery = ev != null ? ev.toLowerCase() : ''
  }
  //sub dialog
  addFolderDialogVisible() {
    return this.addDialogIsVisible ? 'visible' : 'hidden'
  }
  openAddFolderDialog(isAdd) {
    this.isAdd = isAdd
    this.actionIsVisible = false
    this.addDialogIsVisible = true
  }
  closeAddFolderDialog() {
    this.addDialogIsVisible = false
  }
  onDeleteFile(e: DTOCFFile) {
    this.context = this.contextList[1]
    this.currentFile = e
    this.deleteDialogOpened = true
  }
  deleteFile() {
    this.p_deleteFile()
  }
  onPickFile(e: SelectionEvent) {
    this.currentFile = e?.selectedRows[0]?.dataItem
    this.imgHeight = this.currentFile?.Height
    this.imgWidth = this.currentFile?.Width
  }
  pickFile() {
    this.currentFile.PathFile = Ps_UtilObjectService.removeImgRes(this.currentFile.PathFile)
    this.pickFileCallback(this.currentFile, this.imgWidth, this.imgHeight)
  }
  //AUTO RUN
  folderDialogDisplay() {
    return this.layoutService.getFolderDialog() ? 'flex' : 'none'
  }
  public hasChildren = (item: DTOCFFolder): boolean => {
    return item.SubFolders != null && item.SubFolders.length > 0;
  }
  public fetchChildren = (item: DTOCFFolder): DTOCFFolder[] => {
    return item.SubFolders;
  }
  getFile() {
    return new Observable<any[]>(
      obs => {
        if (!Ps_UtilObjectService.hasListValue(this.currentFolder.ListFiles))
          this.currentFolder.ListFiles = []
        if (!Ps_UtilObjectService.hasListValue(this.currentFolder.SubFolders))
          this.currentFolder.SubFolders = []

        if (Ps_UtilObjectService.hasValueString(this.searchQuery))
          obs.next(this.currentFolder.ListFiles.filter(s => s.FileName.toLowerCase().includes(this.searchQuery)))
        else
          obs.next(this.currentFolder.ListFiles)

        obs.complete()
      })
  }
  isFilePicked() {
    return Ps_UtilObjectService.hasValue(this.currentFile?.PathFile)
  }
  loadFolder() {
    this.currentFolder = this.folderList[0]
    this.parentFolder = this.currentFolder
    this.selectedFolder[0] = this.currentFolder
    // this.path.push(this.currentFolder.FolderName)
    // this.layoutService.setFolderPath(this.path)
  }
  getSelectedRow(folder: DTOCFFolder) {
    if (folder != undefined && this.currentFolder != undefined) {
      return folder.PathFolder === this.currentFolder.PathFolder;
    } else
      return false
  }
  getCurrentFolder() {
    return this.currentFolder
  }
  searchTree(fol: DTOCFFolder, fol2: DTOCFFolder) {
    if (fol.Code == fol2.Code && fol.PathFolder == fol2.PathFolder) {
      this.path.push(fol.FolderName)
      return fol;
    }
    else if (Ps_UtilObjectService.hasListValue(fol.SubFolders)) {
      var result = null;
      this.path.push(fol.FolderName)

      for (var i = 0; result == null && i < fol.SubFolders.length; i++) {
        this.pathIndex.push(i)
        result = this.searchTree(fol.SubFolders[i], fol2);
      }

      if (result == null)
        this.path.pop()

      return result;
    }
    return null;
  }
  //CRUD HANDLER
  //FOLDER
  public addFolderHandler({ sender, parent }: AddEvent): void {
    // Close the current edited row, if any.
    this.parentFolder = parent != undefined ? parent : this.rootFolder
    this.closeFolderEditor(sender);
    // Expand the parent.
    if (parent) {
      sender.expand(parent);
    }
    // Define all editable fields validators and default values
    this.formGroupFolder = new UntypedFormGroup({
      'FolderName': new UntypedFormControl('', Validators.required),
      'PathFolder': new UntypedFormControl(this.parentFolder.PathFolder, Validators.required)
    });
    // Show the new row editor, with the `FormGroup` build above
    sender.addRow(this.formGroupFolder, parent);
  }
  public editFolderHandler({ sender, dataItem }: EditEvent): void {
    // Close the current edited row, if any.
    this.closeFolderEditor(sender, dataItem);
    // Define all editable fields validators and default values
    this.formGroupFolder = new UntypedFormGroup({
      'FolderName': new UntypedFormControl(dataItem.FolderName, Validators.required),
      'PathFolder': new UntypedFormControl(dataItem.PathFolder, Validators.required)
    });
    this.editedItemFolder = dataItem;
    // Put the row in edit mode, with the `FormGroup` build above
    sender.editRow(dataItem, this.formGroupFolder);
  }
  public cancelFolderHandler({ sender, dataItem, isNew }: CancelEvent): void {
    // Close the editor for the given row
    this.closeFolderEditor(sender, dataItem, isNew);
  }
  public saveFolderHandler({ sender, dataItem, parent, formGroup, isNew }: SaveEvent): void {
    // Collect the current state of the form.
    // The `formGroup` argument is the same as was provided when calling `editRow`.
    const folder: DTOCFFolder = formGroup.getRawValue();
    if (!isNew) {
      // Reflect changes immediately
      Object.assign(dataItem, folder);
    } else if (parent) {
      // Update the hasChildren field on the parent node
      parent.hasChildren = true;
    }
    this.currentFolder = folder
    if (isNew) {
      this.p_addFolder()
    } else {
      this.p_renameFolder()
    }
    // Reload the parent node to reflect the changes.
    sender.reload(parent);
    sender.closeRow(dataItem, isNew);
  }
  public removeFolderHandler({ sender, dataItem, parent }: RemoveEvent): void {
    this.currentFolder = dataItem
    // this.layoutService.setDeleteDialog(true)
    this.context = this.contextList[0]
    this.deleteDialogOpened = true
    // Reload the parent node to reflect the changes.
    sender.reload(parent);
  }
  private closeFolderEditor(treelist: TreeListComponent, dataItem: any = this.editedItemFolder, isNew: boolean = false): void {
    treelist.closeRow(dataItem, isNew);
    this.editedItemFolder = undefined;
    this.formGroupFolder = undefined;
  }
  //FILE
  // public editFileHandler({ sender, rowIndex, dataItem }: EditEventGrid) {
  //   this.closeFileEditor(sender);

  //   this.formGroupFile = new FormGroup({
  //     'FileName': new FormControl(dataItem.FileName, Validators.required),
  //     'PathFile': new FormControl(dataItem.PathFile, Validators.required)
  //   });
  //   this.editedItemFileIndex = rowIndex;

  //   sender.editRow(rowIndex, this.formGroupFile);
  // }
  // public cancelFileHandler({ sender, rowIndex }: CancelEventGrid) {
  //   this.closeFileEditor(sender, rowIndex);
  // }
  // public saveFileHandler({ sender, rowIndex, formGroup, isNew }: SaveEventGrid) {
  //   const file: DTOCFFile = formGroup.getrawvalue();
  //   // this.editService.save(product, isNew);
  //   sender.closeRow(rowIndex);
  // }
  // public removeFileHandler({ dataItem }: RemoveEventGrid) {
  //   // this.editService.remove(dataItem);
  // }
  // private closeFileEditor(grid, rowIndex = this.editedItemFileIndex) {
  //   grid.closeRow(rowIndex);
  //   this.editedItemFileIndex = undefined;
  //   this.formGroupFile = undefined;
  // }
  //upload  
  invalidFileExtension: boolean = false
  @ViewChild('selectImportFile') selectImportFile: FileSelectComponent;

  onUploadExcel(e: any) {
    this.selectImportFile.clearFiles()
    this.invalidFileExtension = false

    e.files.forEach(file => {
      if (file.validationErrors == "invalidFileExtension") {
        this.invalidFileExtension = true
      }
    });

    if (this.invalidFileExtension == false) {
      var files: File[] = []

      e.files.forEach(f => {
        files.push(f.rawFile)
      });
      this.p_uploadFile(files)
    }
    this.displayIfFileValid()
  }
  displayIfFileValid() {
    var inputBtnStyle = this.selectImportFile.fileSelectButton.nativeElement.style;

    if (this.invalidFileExtension == false) {
      inputBtnStyle.display = 'inline-flex'
    } else {
      inputBtnStyle.display = 'none'
    }
  }

  invalidFormatDisplay() {
    return this.invalidFileExtension == true ? 'block' : 'none'
  }
  public removeFile(fileSelect, uid: string) {
    fileSelect.removeFileByUid(uid);
    this.invalidFileExtension = false
    this.displayIfFileValid()
  }
  //giấu action list khi user click chỗ khác
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.actionDropdown != undefined) {
      if (this.actionDropdown.nativeElement.contains(event.target)) {
      } else {
        this.actionIsVisible = false
      }
    }
  }
  //delete dialog
  deleteDialogOpened = false

  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  deleteFolder() {
    this.p_deleteFolder()
  }
  //autorun
  getImg(str: string) {
    return Ps_UtilObjectService.getImgRes(str)
  }

  formatLink(str: string) {
    return Ps_UtilObjectService.hasValueString(str) ? str.replace('~', '') : ''
  }

  ngOnDestroy(): void {
    this.GetFolderCallback_sst1?.unsubscribe()
    this.GetFolderCallback_sst2?.unsubscribe()
    this.CreateFolder_sst?.unsubscribe()
    this.RenameFolder_sst?.unsubscribe()
    this.DeleteFolder_sst?.unsubscribe()
    this.UploadFile_sst?.unsubscribe()
    this.RenameFile_sst?.unsubscribe()
    this.DeleteFile_sst?.unsubscribe()
  }
}