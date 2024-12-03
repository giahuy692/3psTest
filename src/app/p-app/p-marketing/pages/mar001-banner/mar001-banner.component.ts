import { Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, ValidatorFn, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { MarketingService } from '../../shared/services/marketing.service';
import { MarBannerAPIService } from '../../shared/services/marbanner-api.service';
import { State, toDataSourceRequest, SortDescriptor, filterBy, orderBy, FilterDescriptor, CompositeFilterDescriptor, GroupDescriptor, groupBy } from '@progress/kendo-data-query';
import { Subject, Subscription } from 'rxjs';
import { DTOMABanner } from '../../shared/dto/DTOMABanner.dto';
import { DTOMABannerGroup } from '../../shared/dto/DTOMABannerGroup.dto';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, ActivatedRoute } from '@angular/router';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOCFFile } from 'src/app/p-app/p-layout/dto/DTOCFFolder.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';

@Component({
  selector: 'app-mar001-banner',
  templateUrl: './mar001-banner.component.html',
  styleUrls: ['./mar001-banner.component.scss']
})
export class Mar001BannerComponent implements OnInit, OnDestroy {
  // idCompany: string;
  shownBannerChecked = true
  hiddenBannerChecked = false
  //dialog
  excelValid = true
  deleteDialogOpened = false
  importDialogOpened = false
  //popup  
  popupShow = false;
  currentAnchorIndex: number = -1
  allowActionDropdown = ['edit', 'delete']
  @ViewChildren('anchor') anchors;
  @ViewChild('rowMoreActionPopup') rowMoreActionPopup;
  //Grid
  loading = true
  isAdd = false
  pageSize: number = 24
  //Grid setting
  gridDSState: State
  importGridDSState: State
  gridDSView = new Subject<any>();
  importGridDSView = new Subject<any>();
  groups: GroupDescriptor[] = [{ field: "BannerGroupName" }];
  //
  filterShownBanner: CompositeFilterDescriptor = {
    logic: "and",
    filters: [{
      field: "IsClosed", operator: "eq", value: false
    }, {
      logic: "or",
      filters: [{
        field: "EndDate", operator: "gte", value: new Date()
      }, {
        field: "EndDate", operator: "isnull", value: null
      }]
    }]
  }
  filterHiddenBanner: CompositeFilterDescriptor = {
    logic: "and",
    filters: [{
      field: "IsClosed", operator: "eq", value: true
    }, {
      field: "EndDate", operator: "lt", value: new Date()
    }]
  }
  filterVNTitle: FilterDescriptor = {
    field: "VNTitle", operator: "contains", value: null
  }
  filterStartDate: FilterDescriptor = {
    field: "StartDate", operator: "gte", value: null
  }
  filterEndDate: FilterDescriptor = {
    field: "EndDate", operator: "lte", value: null
  }
  //Banner
  banner = new DTOMABanner()
  bannerList = new Array<DTOMABanner>()
  importBannerList = new Array<DTOMABanner>()
  filterBannerList = new Array<DTOMABanner>()
  filterImportBannerList = new Array<DTOMABanner>()
  //Group banner
  groupBanner = new DTOMABannerGroup()
  groupBannerList = new Array<DTOMABannerGroup>()
  //Image
  restrictions: FileRestrictions
  uploadSaveUrl
  uploadFolder
  //FORM
  form: UntypedFormGroup;
  searchForm: UntypedFormGroup
  //Element
  @ViewChild('importInput') importInput;
  @ViewChild('drawer') drawer: MatSidenav;
  @ViewChild('shownBannerBtn') shownBannerBtn;
  @ViewChild('hiddenBannerBtn') hiddenBannerBtn;
  @ViewChild('SearchEndDate', { static: true }) SearchEndDate: DatePickerComponent
  @ViewChild('EndDate', { static: true }) EndDate: DatePickerComponent
  @ViewChild('StartDate', { static: true }) StartDate: DatePickerComponent
  //callback
  onActionDropdownClickCallback: Function
  pickFileCallback: Function
  uploadEventHandlerCallback: Function
  GetFolderCallback: Function
  //
  GetListGroupBanner_sst: Subscription
  GetListBanner_sst: Subscription
  GetTemplate_sst: Subscription

  UpdateBanner_sst: Subscription
  ImportExcel_sst: Subscription
  DeleteBanner_sst: Subscription
  changePermissionAPI: Subscription

  constructor(public router: Router,
    public activatedRoute: ActivatedRoute,
    public service: MarketingService,
    public formBuilder: UntypedFormBuilder,
    public apiService: MarBannerAPIService,
    public layoutService: LayoutService,
    public menuService: PS_HelperMenuService,
  ) {
    let that = this;

    // that.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd),
    //   map(() => this.activatedRoute),
    //   map(route => {
    //     while (route.firstChild) {
    //       route = route.firstChild;
    //     }
    //     return route;
    //   }),
    //   filter(route => {
    //     return route.outlet === 'primary';
    //   }),
    // ).subscribe(route => {
    //   route.data.subscribe(
    //     () => {
    //       that.idCompany = route.snapshot.params.idCompany;
    //       // if (that.listMenu.length > 0) {
    //       //   // that.p_CheckActiveMenu();
    //       // }
    //     }
    //   );
    // });
  }

  ngOnInit(): void {
    //filter
    this.loadFilter()
    this.importGridDSState = this.service.importGridDSState
    this.gridDSView = this.service.gridDSView
    this.importGridDSView = this.service.importGridDSView
    //Img
    this.restrictions = this.service.restrictions
    //
    // this.service.setContext('Banner')
    this.loadSearchForm()
    this.loadForm()
    // this.p_GetListGroupBanner()
    // this.p_GetListBanner();
    this.changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.p_GetListGroupBanner()
        this.p_GetListBanner();
      }
    })
    //callback
    this.onActionDropdownClickCallback = this.onActionDropdownClick.bind(this)
    this.pickFileCallback = this.pickFile.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
    this.GetFolderCallback = this.GetBannerFolderDrillWithFile.bind(this)
  }
  //API 
  p_GetListGroupBanner() {
    this.loading = true;

    this.GetListGroupBanner_sst = this.apiService.GetListGroupBanner().subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn)) {
        this.groupBannerList = res.ObjectReturn;
        this.loadForm()
      } else {
      }
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
  p_GetListBanner() {
    this.loading = true;

    this.GetListBanner_sst = this.apiService.GetListBanner(toDataSourceRequest(this.gridDSState)).subscribe(res => {
      if (res != null) {
        this.bannerList = res.ObjectReturn.Data;
        this.gridDSView.next({ data: groupBy(this.bannerList, this.groups), total: res.ObjectReturn.Total });
      } else {
        this.gridDSView.next({ data: [], total: 0 });
      }
      this.loading = false;
    }, () => {
      this.gridDSView.next({ data: [], total: 0 });
      this.loading = false;
    });
  }
  p_UpdateBanner() {
    this.loading = true;
    var ctx = (this.isAdd ? "Thêm mới" : "Cập Nhật") + " Banner"

    this.UpdateBanner_sst = this.apiService.UpdateBanner(this.banner, []).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.p_GetListBanner();
        this.drawer.close();
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  p_DeleteBanner() {
    this.loading = true;
    var ctx = "Xóa Banner"

    this.DeleteBanner_sst = this.apiService.DeleteBanner([this.banner]).subscribe(res => {
      if (res != null) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.p_GetListBanner();
        this.deleteDialogOpened = false
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  GetBannerFolderDrillWithFile() {
    return this.apiService.GetBannerFolderDrillWithFile()
  }
  //Kendo GRID
  //loading
  loadList(itemBannerList, filterList, gridDSView, gridDSState) {
    filterList = filterBy(itemBannerList, gridDSState.filter)

    gridDSView.next({
      data: orderBy(filterList
        .slice(gridDSState.skip,
          gridDSState.skip + this.pageSize),
        gridDSState.sort),
      total: filterList.length
    });
  }
  loadListExcel(importBannerList, filterImportList, importGridDSView, importGridDSState) {
    filterImportList = filterBy(importBannerList, importGridDSState.filter)

    importGridDSView.next({
      data: orderBy(filterImportList
        .slice(importGridDSState.skip,
          importGridDSState.skip + this.pageSize),
        importGridDSState.sort),
      total: filterImportList.length
    });
  }
  //sorting
  sortChange(sort: SortDescriptor[], gridName?: string) {
    this.gridDSState.sort = sort;
    if (gridName == null) {
      this.loadList(this.bannerList, this.filterBannerList,
        this.gridDSView, this.gridDSState);
    } else {
      this.loadListExcel(this.importBannerList,
        this.filterImportBannerList,
        this.importGridDSView, this.importGridDSState);
    }
  }
  //paging
  pageChange(event: PageChangeEvent, gridName?: string) {
    this.gridDSState.skip = event.skip;
    if (gridName == null) {
      this.loadList(this.bannerList, this.filterBannerList,
        this.gridDSView, this.gridDSState);
    } else {
      this.loadListExcel(this.importBannerList,
        this.filterImportBannerList,
        this.importGridDSView, this.importGridDSState);
    }
  }
  //filtering
  filterChange(filter: CompositeFilterDescriptor, gridName?: string) {
    this.gridDSState.filter = filter;
    if (gridName == null) {
      this.loadList(this.bannerList, this.filterBannerList,
        this.gridDSView, this.gridDSState);
    } else {
      this.loadListExcel(this.importBannerList,
        this.filterImportBannerList,
        this.importGridDSView, this.importGridDSState);
    }
  }
  loadFilter() {
    this.gridDSState = this.service.gridDSState
    this.gridDSState.take = this.pageSize
    this.gridDSState.filter.filters = []

    if (Ps_UtilObjectService.hasValueString(this.filterVNTitle.value))
      this.gridDSState.filter.filters.push(this.filterVNTitle)

    if (Ps_UtilObjectService.hasValueString(this.filterStartDate.value))
      this.gridDSState.filter.filters.push(this.filterStartDate)

    if (Ps_UtilObjectService.hasValueString(this.filterEndDate.value))
      this.gridDSState.filter.filters.push(this.filterEndDate)

    if (this.shownBannerChecked) {
      this.gridDSState.filter.filters.push(this.filterShownBanner)
    } else {
      this.gridDSState.filter.filters.push(this.filterHiddenBanner)
    }
    this.getMinMaxEndDate()
  }
  //Kendo FORM
  loadForm() {
    this.form = this.formBuilder.group({
      Code: [this.banner.Code],
      VNTitle: [this.banner.VNTitle, Validators.required],
      ENTitle: [this.banner.ENTitle],
      JPTitle: [this.banner.JPTitle],
      URLLink: [this.banner.URLLink],
      StartDate: [this.banner.StartDate, Validators.required],
      EndDate: [this.banner.EndDate],
      OrderBy: [this.banner.OrderBy, Validators.required],
      ImageSetting1: [this.banner.ImageSetting1],
      IsDefault: [this.banner.IsDefault],

      BannerGroup: [this.groupBannerList[0] != null ?
        this.groupBannerList[0].Code : ''],
    }, { validator: this.atLeastOneTitleField })
  }
  //CLICK EVENT 
  //header  
  selectedBtnChange(e, btn) {
    if (btn == this.shownBannerBtn.nativeElement.id) {
      this.shownBannerChecked = e
    } else if (btn == this.hiddenBannerBtn.nativeElement.id) {
      this.hiddenBannerChecked = e
    }
    this.loadFilter()
    this.p_GetListBanner()
  }
  downloadExcel() {
    var ctx = "Download Excel Template"
    var getfilename = "CreateBanners.xlsx"

    this.GetTemplate_sst = this.apiService.GetTemplate(getfilename).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
      this.loading = false;
    });
  }
  importExcel() {
    this.layoutService.setImportDialog(true)
    this.layoutService.setExcelValid(this.excelValid)
  }
  loadSearchForm() {
    this.searchForm = new UntypedFormGroup({
      'SearchTitle': new UntypedFormControl(''),
      'SearchStartDate': new UntypedFormControl(''),
      'SearchEndDate': new UntypedFormControl(''),
    }
      , { validators: this.atLeastOneSearchField }
    )
  }
  //
  atLeastOneTitleField: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const VNTitle = control.get('VNTitle');
    const ENTitle = control.get('ENTitle');
    const JPTitle = control.get('JPTitle');

    return (Ps_UtilObjectService.hasValueString(VNTitle.value)
      || Ps_UtilObjectService.hasValueString(ENTitle.value)
      || Ps_UtilObjectService.hasValueString(JPTitle.value))
      ? null : { atLeastOneTitleFieldBool: true };
  }
  atLeastOneSearchField: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const SearchTitle = control.get('SearchTitle');
    const SearchStartDate = control.get('SearchStartDate');
    const SearchEndDate = control.get('SearchEndDate');

    return (Ps_UtilObjectService.hasValueString(SearchTitle.value)
      || Ps_UtilObjectService.hasValueString(SearchStartDate.value)
      || Ps_UtilObjectService.hasValueString(SearchEndDate.value))
      ? null : { atLeastOneSearchFieldBool: true };
  }
  search() {
    var val = this.searchForm.value

    if (Ps_UtilObjectService.hasValueString(val.SearchTitle)) {
      this.filterVNTitle.value = val.SearchTitle;
    } else this.filterVNTitle.value = null;

    if (Ps_UtilObjectService.hasValueString(val.SearchStartDate)) {
      this.filterStartDate.value = val.SearchStartDate;
    } else this.filterStartDate.value = null;

    if (Ps_UtilObjectService.hasValueString(val.SearchEndDate)) {
      this.filterEndDate.value = val.SearchEndDate;
    } else this.filterEndDate.value = null;

    this.loadFilter();
    this.p_GetListBanner()
  }
  //dropdown
  onActionDropdownClick(menu: MenuDataItem, item: DTOMABanner) {
    if (item.Code > 0)
      if (menu.Link == 'edit' || menu.Code == 'pencil')
        this.onEdit(item)
      else
        this.onDelete(item)
  }
  onAdd() {
    this.isAdd = true;
    this.clearForm()
    this.form.get('Code').setValue(0)
    this.form.get('OrderBy').setValue(1)
    this.form.get('IsClosed').setValue(false)
    this.form.get('IsDefault').setValue(false)

    var newDate = new Date()
    this.form.get('StartDate').setValue(new Date(
      newDate.getFullYear(), newDate.getMonth(),
      newDate.getDate(), 0, 0, 0, 0))
    this.drawer.open();
  }
  onEdit(obj: DTOMABanner) {
    this.isAdd = false
    this.banner = { ...obj }
    //bind data to form
    this.form.get('Code').setValue(obj.Code);
    this.form.get('VNTitle').setValue(obj.VNTitle);
    this.form.get('ENTitle').setValue(obj.ENTitle);
    this.form.get('JPTitle').setValue(obj.JPTitle);
    this.form.get('URLLink').setValue(obj.URLLink);
    this.form.get('OrderBy').setValue(obj.OrderBy);
    this.form.get('IsDefault').setValue(obj.IsDefault);
    this.form.get('BannerGroup').setValue(obj.BannerGroup);
    this.form.get('ImageSetting1').setValue(obj.ImageSetting1);

    this.form.get('StartDate').setValue(obj.StartDate != null
      ? new Date(obj.StartDate) : '');
    this.form.get('EndDate').setValue(obj.EndDate != null
      ? new Date(obj.EndDate) : '');
    this.drawer.open();
  }
  onDelete(obj: DTOMABanner) {
    this.banner = obj;
    this.deleteDialogOpened = true
  }
  //FORM button
  shownAtWebpage(id) {
    var gb = this.groupBannerList.find(s => s.Code == id)

    if (Ps_UtilObjectService.hasValue(gb))
      this.groupBanner = gb
    this.service.setWebpageDialogPopup(true)
  }
  updateBanner() {
    this.form.markAllAsTouched();
    if (this.form.status == 'INVALID'
      // || !Ps_UtilObjectService.hasValueString(this.form.get('ImageSettings1').value)
    ) {
      this.layoutService.onError("Vui lòng điền vào trường bị thiếu")
    } else {
      this.banner = this.form.getRawValue()
      this.banner.VNTitle = this.form.get('VNTitle').value
      this.banner.ENTitle = this.form.get('ENTitle').value
      this.banner.JPTitle = this.form.get('JPTitle').value
      this.p_UpdateBanner()
    }
  }
  clearForm() {
    this.banner = new DTOMABanner()
    this.form.reset()
    this.loadForm()
  }
  closeForm() {
    this.clearForm()
    this.drawer.close()
  }
  //DIALOG button
  closeDeleteDialog() {
    this.deleteDialogOpened = false
  }
  closeImportDialog() {
    this.importDialogOpened = false
    this.excelValid = true;
  }
  delete() {
    this.p_DeleteBanner()
  }
  pickFile(e: DTOCFFile, isSelectedRowitemDialogVisible) {
    this.banner.ImageSetting1 = e?.PathFile//.replace('~', '')
    this.form.get('ImageSetting1').setValue(this.banner.ImageSetting1)
    this.layoutService.setFolderDialog(false)
  }
  //AUTO RUN
  //date filter
  getMinMaxEndDate() {
    if (Ps_UtilObjectService.hasValue(this.SearchEndDate)) {
      if (this.shownBannerChecked) {
        this.SearchEndDate.max = null
        this.SearchEndDate.min = new Date()
      } else {
        this.SearchEndDate.min = null
        var day = new Date()
        day.setDate(day.getDate() - 1)
        this.SearchEndDate.max = day
      }
    }
  }
  onValueChangeDatePickerStartDate(e) {//day
    if (Ps_UtilObjectService.hasValue(this.EndDate)) {
      this.EndDate.min = e
    }
  }
  onValueChangeDatePickerEndDate(e) {
    if (Ps_UtilObjectService.hasValue(this.StartDate)) {
      this.StartDate.max = e
    }
  }
  //UPLOAD ảnh
  onValueChangeImageSetting1(e) {
    if (!Ps_UtilObjectService.hasValueString(e)) {
      this.banner.ImageSetting1 = null
    }
  }
  onUploadFile() {
    this.layoutService.folderDialogOpened = true
  }
  selectEventHandler() {
    this.setFolderDialog()
  }
  uploadEventHandler(e: File) {
    this.ImportExcel_sst = this.apiService.ImportExcel(e).subscribe(res => {
      this.loading = true
      if (res != null) {
        // this.itemList = res;
        // this.importGridDSView.next({ data: this.itemList, total: res.length });
      } else {
        this.importGridDSView.next({ data: [], total: 0 });
      }
      this.loading = false;
    }, () => {
      this.importGridDSView.next({ data: [], total: 0 });
      this.loading = false;
    })
  }
  setFolderDialog() {
    // this.service.setFolderDialog(bool);
  }
  onUploadExcel() {

  }
  //DIALOG show/hide
  isImportDialogVisible() {
    return this.importDialogOpened ? 'visible' : 'hidden'
  }
  isDeleteDialogVisible() {
    return this.deleteDialogOpened ? 'visible' : 'hidden'
  }
  ngOnDestroy(): void {
    this.GetListGroupBanner_sst?.unsubscribe()
    this.GetListBanner_sst?.unsubscribe()
    this.GetTemplate_sst?.unsubscribe()

    this.UpdateBanner_sst?.unsubscribe()
    this.ImportExcel_sst?.unsubscribe()
    this.DeleteBanner_sst?.unsubscribe()
    this.changePermissionAPI?.unsubscribe()
  }
}
