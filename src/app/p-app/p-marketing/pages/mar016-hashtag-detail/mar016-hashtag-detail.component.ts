import { DTODetailConfProduct } from './../../../p-config/shared/dto/DTOConfProduct';
import { DTOMAPost_ObjReturn } from './../../shared/dto/DTOMANews.dto';
import { Subject, Subscription, of } from 'rxjs';
import { DTOMAHashtag } from './../../shared/dto/DTOMAHashtag.dto';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';

import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PageChangeEvent, SelectableSettings, } from '@progress/kendo-angular-grid';
import { MarketingService } from '../../shared/services/marketing.service';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State, } from '@progress/kendo-data-query';
import { MatSidenav } from '@angular/material/sidenav';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { ConfigAPIService } from 'src/app/p-app/p-config/shared/services/config-api.service';
import { MarPostAPIService } from '../../shared/services/mar-post-api.service';
import { MarHashtagAPIService } from '../../shared/services/mar-hashtag-api.service';
import { filter, switchMap } from 'rxjs/operators';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

@Component({
  selector: 'app-mar016-hashtag-detail',
  templateUrl: './mar016-hashtag-detail.component.html',
  styleUrls: ['./mar016-hashtag-detail.component.scss'],
})
export class Mar016HashtagDetailComponent implements OnInit {
  @ViewChild('formDrawer') formDrawer: MatSidenav;
  //Selectable grid
  onSelectCallbackSP: Function;
  onSortChangeCallbackSP: Function;
  onPageChangeCallbackSP: Function;
  onSelectCallbackBV: Function;
  onSortChangeCallbackBV: Function;
  onPageChangeCallbackBV: Function;

  // Dropdown
  allowActionDropdownSP = ['delete'];
  onActionDropdownClickCallbackSP: Function;
  getActionDropdownCallbackSP: Function;

  allowActionDropdownBV = ['delete'];
  onActionDropdownClickCallbackBV: Function;
  getActionDropdownCallbackBV: Function;

  // Popup
  showCheckbox: boolean = true;
  onSelectedPopupBtnCallbackSP: Function;
  getSelectionPopupCallbackSP: Function;
  onSelectedPopupBtnCallbackBV: Function;
  getSelectionPopupCallbackBV: Function;

  //Import
  uploadEventHandlerCallback: Function;

  // Dialog
  deleteDialogOpened = false;
  deleteManyDialogOpened = false;
  deleteHashtagDialogOpened = false;

  // bool
  isLockTag: boolean = true;
  isLockProd: boolean = true;
  isLockPost: boolean = true;

  justLoaded: boolean = true;
  loading: boolean = false;
  isAdd: boolean = false;

  showDeleteDialog: boolean = false;
  isFilterActive: boolean = true;
  // Permission booleans
  // Hashtag permissions declarations
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false;

  //Product permission declarations
  isAllowedToCreateProd: boolean = false;

  //Post permission declarations
  isAllowedToCreatePost: boolean = false;

  actionPerm: DTOActionPermission[];
  // Hashtag
  Hashtag = new DTOMAHashtag();
  // Product
  Product = new DTODetailConfProduct();
  listProduct: DTODetailConfProduct[] = [];
  selectedListProduct: DTODetailConfProduct[] = [];
  //Form action
  isProduct: boolean = true;
  isNonHashtagPostCheckedAll: boolean = false;

  pageSizeSP = 10;
  pageSizesSP = [this.pageSizeSP];

  nonHashtagPostList: DTOMAPost_ObjReturn[] = [];
  selectedAddHashtagPosts: DTOMAPost_ObjReturn[] = [];

  gridViewSP = new Subject<any>();
  gridStateSP: State = {
    take: this.pageSizeSP,
    filter: { filters: [], logic: 'and' },
  };
  // Post
  Post = new DTOMAPost_ObjReturn();
  listPost: DTOMAPost_ObjReturn[] = [];
  selectedListPost: DTOMAPost_ObjReturn[] = [];

  pageSizeBV = 10;
  pageSizesBV = [this.pageSizeBV];

  gridViewBV = new Subject<any>();
  gridStateBV: State = {
    take: this.pageSizeBV,
    filter: { filters: [], logic: 'and' },
  };
  //Selectable grid
  selectableSP: SelectableSettings = {
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  selectableBV: SelectableSettings = {
    enabled: false,
    mode: 'multiple',
    drag: false,
    checkboxOnly: true,
  };
  // Form
  formProduct: UntypedFormGroup;
  formPost: UntypedFormGroup;
  // Filters
  filterSearchBoxSP: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  filterSearchBoxBV: CompositeFilterDescriptor = { logic: 'or', filters: [] };
  // Products Filters
  filterBarCode: FilterDescriptor = { field: 'Barcode', operator: 'contains', value: null, };
  filterPosCode: FilterDescriptor = { field: 'PosCode', operator: 'contains', value: null, };
  filterVNName: FilterDescriptor = { field: 'VNName', operator: 'contains', value: null, };
  // Posts Filters
  filterTitleVN: FilterDescriptor = { field: 'TitleVN', operator: 'contains', value: null, };
  filterTitleEN: FilterDescriptor = { field: 'TitleEN', operator: 'contains', value: null, };
  filterTitleJP: FilterDescriptor = { field: 'TitleJP', operator: 'contains', value: null, };

  filterSummaryVN: FilterDescriptor = { field: 'SummaryVN', operator: 'contains', value: null, };
  filterSummaryEN: FilterDescriptor = { field: 'SummaryEN', operator: 'contains', value: null, };
  filterSummaryJP: FilterDescriptor = { field: 'SummaryJP', operator: 'contains', value: null, };
  // Function,
  pickFileCallback: Function;
  getFolderCallback: Function;

  //Subscription
  subArr: Subscription[] = [];

  //Store tracking value of TagCode and TagName input
  storeTagCodeValue: string = '';
  storeTagNameValue: string = '';

  //store tracking value of postForm and productForm
  storePostFormInput: string = '';
  storeProductFormInput: string = '';

  //Store tracking value of totalProductHashtag and totalPostHashtag
  storeTotalProductHashtag: number = 0;
  storeTotalPostHashtag: number = 0;

  constructor(
    public service: MarketingService,
    public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,

    public menuService: PS_HelperMenuService,
    public apiService: MarHashtagAPIService,
    public apiProductService: ConfigAPIService,
    public apiPostService: MarPostAPIService
  ) { }

  ngOnInit(): void {
    let that = this
    this.loadFormProduct();
    this.loadFormPost();

    let sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        that.justLoaded = false;
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');

        //Hashtag action permission
        that.isMaster = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCreator = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isApprover = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        //Product actions permission
        that.isAllowedToCreateProd = that.actionPerm.findIndex((s) => s.ActionType == 4) > -1 || false;
        //Post actions permission
        that.isAllowedToCreatePost = that.actionPerm.findIndex((s) => s.ActionType == 7) > -1 || false;
        //Chỉ được xem
        that.isAllowedToViewOnly = that.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(that.actionPerm.filter(s => s.ActionType != 6))

        this.selectableSP.enabled = this.isMaster || this.isAllowedToCreateProd;
        this.selectableBV.enabled = this.isMaster || this.isAllowedToCreatePost;
        // that.GetHashtagCache();
      }
    });

    let changePermissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetHashtagCache()
      }
    })
    this.subArr.push(sst, changePermissionAPI)
    // Select
    this.onSelectCallbackSP = this.selectChangeSP.bind(this);
    this.onSelectCallbackBV = this.selectChangeBV.bind(this);

    //PRODUCT
    this.onActionDropdownClickCallbackSP = this.onActionDropdownClickSP.bind(this);
    this.getActionDropdownCallbackSP = this.getActionDropdownSP.bind(this);
    this.getSelectionPopupCallbackSP = this.getSelectionPopupSP.bind(this);
    this.onSelectedPopupBtnCallbackSP = this.onSelectedPopupBtnClickSP.bind(this);
    this.onPageChangeCallbackSP = this.pageChangeSP.bind(this);

    //POST
    this.onActionDropdownClickCallbackBV = this.onActionDropdownClickBV.bind(this);
    this.getActionDropdownCallbackBV = this.getActionDropdownBV.bind(this);
    this.getSelectionPopupCallbackBV = this.getSelectionPopupBV.bind(this);
    this.onSelectedPopupBtnCallbackBV = this.onSelectedPopupBtnClickBV.bind(this);
    this.onPageChangeCallbackBV = this.pageChangeBV.bind(this);

    //Import excel product
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
  }

  //filter
  loadFilterProduct() {
    this.pageSizesSP = [...this.layoutService.pageSizes];
    this.gridStateSP.take = this.pageSizeSP;
    // let productSearchQuery: string =
    //   this.formProduct.controls['SearchQuery'].value;
    this.gridStateSP.filter.filters = [
      {
        field: 'ListTag',
        operator: 'contains',
        value: `{"Code":${this.Hashtag.Code}}`,
      },
    ];
    this.filterSearchBoxSP.filters = [];
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterBarCode.value))
      this.filterSearchBoxSP.filters.push(this.filterBarCode);

    if (Ps_UtilObjectService.hasValueString(this.filterPosCode.value))
      this.filterSearchBoxSP.filters.push(this.filterPosCode);

    if (Ps_UtilObjectService.hasValueString(this.filterVNName.value))
      this.filterSearchBoxSP.filters.push(this.filterVNName);

    if (this.filterSearchBoxSP.filters.length > 0)
      this.gridStateSP.filter.filters.push(this.filterSearchBoxSP);
  }

  loadFilterPost() {
    this.pageSizesBV = [...this.layoutService.pageSizes];
    this.gridStateBV.take = this.pageSizeBV;
    this.gridStateBV.filter.filters = [
      {
        field: 'ListTag',
        operator: 'contains',
        value: `{"Code":${this.Hashtag.Code}}`,
      },
    ];
    this.filterSearchBoxBV.filters = [];
    //search box
    if (Ps_UtilObjectService.hasValueString(this.filterTitleVN.value))
      this.filterSearchBoxBV.filters.push(this.filterTitleVN);

    if (Ps_UtilObjectService.hasValueString(this.filterTitleEN.value))
      this.filterSearchBoxBV.filters.push(this.filterTitleEN);

    if (Ps_UtilObjectService.hasValueString(this.filterTitleJP.value))
      this.filterSearchBoxBV.filters.push(this.filterTitleJP);

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryVN.value))
      this.filterSearchBoxBV.filters.push(this.filterSummaryVN);

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryEN.value))
      this.filterSearchBoxBV.filters.push(this.filterSummaryEN);

    if (Ps_UtilObjectService.hasValueString(this.filterSummaryJP.value))
      this.filterSearchBoxBV.filters.push(this.filterSummaryJP);

    if (this.filterSearchBoxBV.filters.length > 0)
      this.gridStateBV.filter.filters.push(this.filterSearchBoxBV);
  }
  // loading, searching
  search(isProd, e) {
    if (isProd) {
      let searchQuery = e// this.searchFormProduct.controls['SearchQuery'].value;
      this.setSearchQueryProduct(searchQuery);
      this.loadFilterProduct();
      this.GetListProduct();
    } else {
      let searchQuery = e// this.searchFormPost.controls['SearchQuery'].value;
      this.setSearchQueryPost(searchQuery);
      this.loadFilterPost();
      this.GetListPost();
    }
  }

  // set value của filter khi input search của product có value và được trigger
  setSearchQueryProduct(searchQuery: string) {
    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterBarCode.value = searchQuery;
      this.filterPosCode.value = searchQuery;
      this.filterVNName.value = searchQuery;
    } else {
      this.filterBarCode.value = null;
      this.filterPosCode.value = null;
      this.filterVNName.value = null;
    }
  }

  // set value của filter khi input search của post có value và được trigger
  setSearchQueryPost(searchQuery: string) {
    if (Ps_UtilObjectService.hasValueString(searchQuery)) {
      this.filterTitleVN.value = searchQuery;
      this.filterTitleEN.value = searchQuery;
      this.filterTitleJP.value = searchQuery;
      this.filterSummaryVN.value = searchQuery;
      this.filterSummaryEN.value = searchQuery;
      this.filterSummaryJP.value = searchQuery;
    } else {
      this.filterTitleVN.value = null;
      this.filterTitleEN.value = null;
      this.filterTitleJP.value = null;
      this.filterSummaryVN.value = null;
      this.filterSummaryEN.value = null;
      this.filterSummaryJP.value = null;
    }
  }

  // Form group chứa giá trị search của list products và posts
  loadFormProduct() {
    this.formProduct = new UntypedFormGroup({
      Barcode: new UntypedFormControl(this.Product.Barcode, Validators.required),
    });
  }
  loadFormPost() {
    this.formPost = new UntypedFormGroup({
      TitleVN: new UntypedFormControl(this.Post.TitleVN, Validators.required),
      isNonHashtagPostCheckAll: new UntypedFormControl(false)
    });
  }

  // Handle Form event
  closeForm() {
    this.clearForm();
    this.formDrawer.close();
  }
  clearForm() {
    this.Product = new DTODetailConfProduct();
    this.formProduct.reset();
    this.loadFormProduct();

    this.Post = new DTOMAPost_ObjReturn();
    this.nonHashtagPostList = [];
    this.selectedAddHashtagPosts = [];
    this.storeProductFormInput = "";
    this.storePostFormInput = "";
    this.formPost.reset();
    this.loadFormPost();
  }

  // GetAPI
  getData() {
    this.GetHashtag();

    this.loadFilterProduct();
    this.loadFilterPost();

    this.GetListProduct();
    this.GetListPost();
  }

  // lấy hashtag code được lưu trong cache và get data
  GetHashtagCache() {
    let sst = this.service.getCacheHashtagDetail().subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.Hashtag = res;
      }
      this.isAdd = this.Hashtag.Code == 0;

      if (!this.isAdd || this.Hashtag.Code != 0) {
        this.getData();
      }
    });
    this.subArr.push(sst)
  }

  // api call to get hashtag khi user nhập vào input và blur
  GetHashtag() {
    if (this.Hashtag.Code != 0) {
      this.loading = true;
      var ctx = 'Lấy thông tin Hashtag';

      let sst = this.apiService.GetHashtag(this.Hashtag.Code).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.Hashtag = res.ObjectReturn;
          this.storeTagCodeValue = this.Hashtag.TagCode;
          this.storeTagNameValue = this.Hashtag.TagName;
          this.checkProp()
        } else
          this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);

        this.loading = false;
      }, (e) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
      });
      this.subArr.push(sst)
    }
  }

  checkProp() {
    this.isLockTag = this.isAllowedToViewOnly ||
      (this.isCreator && this.Hashtag.StatusID != 0 && this.Hashtag.StatusID != 4) ||
      (this.isApprover && (this.Hashtag.StatusID == 0 || this.Hashtag.StatusID == 3)) ||
      (this.isMaster && this.Hashtag.StatusID == 2)

    this.isLockProd = this.isAllowedToViewOnly ||
      this.Hashtag.StatusID != 2 ||
      this.Hashtag.Code == 0 ||
      (!this.isAllowedToCreateProd && !this.isMaster)

    this.isLockPost = this.isAllowedToViewOnly ||
      this.Hashtag.StatusID != 2 ||
      this.Hashtag.Code == 0 ||
      (!this.isAllowedToCreatePost && !this.isMaster)
  }

  UpdateHashtag(prop: string[]) {
    this.loading = true
    let ctx = 'Cập nhật hashtag'

    let sst = this.apiService.UpdateHashtag(this.Hashtag, prop).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.loading = false;
        // this.formHashtag.controls[prop == 'TagName' ? 'TagCode' : prop].enable();
        this.Hashtag = { ...res.ObjectReturn };
        //cập nhật lại isAdd sau khi đã tạo xong Hashtag mới
        if (this.isAdd && this.Hashtag.Code != 0) {
          this.isAdd = false;
          this.loadFilterProduct();
          this.loadFilterPost();
        }
        // this.storeTagNameValue = this.Hashtag.TagName;
        this.layoutService.onSuccess(`${ctx} thành công`);
      } else {
        this.loading = false;
        // this.formHashtag.controls[prop == 'TagName' ? 'TagCode' : prop].enable();
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`);
      }
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //
  GetProduct() {
    if (!Ps_UtilObjectService.hasValueString(this.formProduct.controls['Barcode'].value) && this.formProduct.controls['Barcode'].value === this.storeProductFormInput) {
      this.clearForm();
      return;
    }
    else if (Ps_UtilObjectService.hasValueString(this.formProduct.controls['Barcode'].value) && this.formProduct.controls['Barcode'].value !== this.storeProductFormInput) {
      this.loading = true;
      let newGridState = { ...this.gridStateSP };

      newGridState.filter = {
        filters: [
          {
            field: 'Barcode',
            operator: 'contains',
            value: this.formProduct.controls['Barcode'].value,
          },
          {
            logic: 'or',
            filters: [
              {
                field: 'ListTag',
                operator: 'doesnotcontain',
                value: `{"Code":${this.Hashtag.Code}}`,
              },
              {
                field: 'ListTag',
                operator: 'eq',
                value: null,
              },
              {
                field: 'ListTag',
                operator: 'eq',
                value: `[]`,
              },
            ],
          },
        ],
        logic: 'and',
      };

      let sst = this.apiProductService.GetListProduct(newGridState).subscribe((res) => {
        this.loading = false;

        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
            this.Product = res.ObjectReturn.Data[0];
            this.storeProductFormInput = this.formProduct.controls['Barcode'].value;
          }
          else {
            this.layoutService.onError('Không tìm thấy danh sách sản phẩm');
            this.storeProductFormInput = this.formProduct.controls['Barcode'].value;
          }
        }
        else {
          this.layoutService.onError('Đã xảy ra lỗi khi tìm danh sách sản phẩm: ' + res.ErrorString);
          this.storeProductFormInput = this.formProduct.controls['Barcode'].value;
        }
      }, (e) => {
        this.loading = false;
        this.layoutService.onError('Đã xảy ra lỗi khi tìm danh sách sản phẩm: ' + e);
        this.storeProductFormInput = this.formProduct.controls['Barcode'].value;
      });
      this.subArr.push(sst)
    }
  }

  GetPost() {
    if (!Ps_UtilObjectService.hasValueString(this.formPost.controls['TitleVN'].value) && this.formPost.controls['TitleVN'].value === this.storePostFormInput) {
      this.clearForm();
      return;
    } else if (Ps_UtilObjectService.hasValueString(this.formPost.controls['TitleVN'].value) && this.formPost.controls['TitleVN'].value !== this.storePostFormInput) {
      this.loading = true;
      let newGridState = { ...this.gridStateSP };

      newGridState.filter = {
        filters: [
          {
            logic: 'or',
            filters: [
              {
                field: 'ListTag',
                operator: 'doesnotcontain',
                value: `{"Code":${this.Hashtag.Code}}`,
              },
              {
                field: 'ListTag',
                operator: 'eq',
                value: null,
              },
              {
                field: 'ListTag',
                operator: 'eq',
                value: `[]`,
              },
            ],
          },
          {
            logic: 'or',
            filters: [
              {
                field: 'SummaryVN',
                operator: 'contains',
                value: this.formPost.controls['TitleVN'].value,
              },
              {
                field: 'TitleVN',
                operator: 'contains',
                value: this.formPost.controls['TitleVN'].value,
              },
            ],
          },
        ],
        logic: 'and',
      };

      let sst = this.apiPostService.GetListBlog(newGridState).subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          if (Ps_UtilObjectService.hasListValue(res.ObjectReturn.Data)) {
            const posts = res.ObjectReturn.Data;
            this.Post = res.ObjectReturn.Data[0];
            this.nonHashtagPostList = [...posts];
          } else {
            this.layoutService.onError('Bài viết không tồn tại');
          }
        }
        else {
          this.layoutService.onError('Đã xảy ra lỗi khi tìm bài viết: ' + res.ErrorString);
        }
        this.storePostFormInput = this.formPost.controls['TitleVN'].value;
        this.loading = false;
      }, (e) => {
        this.loading = false;
        this.storePostFormInput = this.formPost.controls['TitleVN'].value;
        this.layoutService.onError('Đã xảy ra lỗi khi tìm bài viết: ' + e);
      });
      this.subArr.push(sst)
    }
  }

  GetListProduct() {
    this.loading = true;
    let ctx = 'Lấy danh sách Sản phẩm'

    let sst = this.apiProductService.GetListProduct(this.gridStateSP).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listProduct = res.ObjectReturn.Data;
        this.Hashtag.NoOfProduct = res.ObjectReturn.Total

        this.gridViewSP.next({
          data: this.listProduct,
          total: res.ObjectReturn.Total,
        });
        // if (this.listProduct.length > 0) this.Product = this.listProduct[0];
        // else this.Product = new DTODetailConfProduct();
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      this.loading = false;
    }, (e) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
    })
    this.subArr.push(sst)
  }

  // API get data về POST
  GetListPost() {
    this.loading = true;
    var ctx = 'Lấy danh sách bài viết';

    let sst = this.apiPostService.GetListBlog(this.gridStateBV).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPost = res.ObjectReturn.Data;
        this.Hashtag.NoOfPost = res.ObjectReturn.Total;

        this.gridViewBV.next({
          data: this.listPost,
          total: res.ObjectReturn.Total,
        });
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);

      this.loading = false;
    }, (e) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
    })
    this.subArr.push(sst)
  }
  // Check condition
  checkDetail(statusID: number) {
    if (this.service.isAdd) {
      this.service.isAdd = false;
      return true;
    }

    if (statusID == 1 || statusID == 2) {
      if (!Ps_UtilObjectService.hasValueString(this.Hashtag.TagName)) {
        this.layoutService.onError('Vui lòng nhập tên hashtag!');
        return false;
      } else if (!Ps_UtilObjectService.hasValueString(this.Hashtag.TagCode)) {
        this.layoutService.onError('Vui lòng nhập mã hashtag!');
        return false;
      }
    }
    return true;
  }
  // Button update form Blog or Product
  onUpdateTag(type: number) {
    switch (type) {
      case 1:
        var tagList = []

        JSON.parse(this.Product.ListTag)?.map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
          if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
            tagList.push(s)
        })

        tagList.push({ Code: this.Hashtag.Code })
        this.Product.ListTag = JSON.stringify(tagList)
        this.onUpdateProductListTag(this.Product)
        break;
      case 2:
        this.selectedAddHashtagPosts.forEach(post => {
          var tagList = []

          JSON.parse(post.ListTag)?.map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
            if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
              tagList.push(s)
          })

          tagList.push({ Code: this.Hashtag.Code })
          post.ListTag = JSON.stringify(tagList)
          this.onUpdatePostListTag(post)
        })
        break;
    }
  }

  openDeleteHashtagDialog() {
    this.deleteHashtagDialogOpened = true;
  }

  //DELETE HASHTAG FROM HASHTAG LIST
  DeleteHashtag(items: DTOMAHashtag[] = [this.Hashtag]) {
    this.loading = true;
    var ctx = 'Xóa hashtag';

    let sst = this.apiService.DeleteHashtag(items).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.deleteHashtagDialogOpened = false;
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.onRefreshHashTagData();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (e) => {
      this.deleteHashtagDialogOpened = true;
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
    })
    this.subArr.push(sst)
  }

  // Mở form thêm mới post và product
  openDetail(isProduct: boolean) {
    // this.isAdd = isAdd;
    this.isProduct = isProduct;
    this.clearForm();
    this.formDrawer.open();
  }

  //Reset tất cả data về rỗng để tạo mới hashtag
  onRefreshHashTagData() {
    this.Hashtag = new DTOMAHashtag();
    this.listProduct = [];
    this.listPost = [];
    this.storeTagNameValue = '';
    this.storeTagCodeValue = '';
    this.service.setCacheHashtagDetail(this.Hashtag);

    this.gridViewSP.next({
      data: this.listProduct,
      total: 0,
    });
    this.gridViewBV.next({
      data: this.listPost,
      total: 0,
    });
  }

  //Select All non hashtag post
  onSelectAllNonHashtagPost() {
    if (this.selectedAddHashtagPosts.length < this.nonHashtagPostList.length) {
      this.isNonHashtagPostCheckedAll = true;
      this.formPost.controls['isNonHashtagPostCheckAll'].setValue(true);
      this.selectedAddHashtagPosts = [...this.nonHashtagPostList];
    } else {
      this.selectedAddHashtagPosts = [];
      this.isNonHashtagPostCheckedAll = false;
      this.formPost.controls['isNonHashtagPostCheckAll'].setValue(false);
    }
  }

  //Non hashtag post selection handle
  onSelectSingleNonHashtagPost(selectedPost: DTOMAPost_ObjReturn) {
    const selectedPostLength = this.selectedAddHashtagPosts.length;
    const nonHashtagPostLength = this.nonHashtagPostList.length;
    const isCheckedAll = this.formPost.controls['isNonHashtagPostCheckAll'].value;
    let newSelectedList: DTOMAPost_ObjReturn[] = [];
    // check checkbox post khi đang được select all
    if (!isCheckedAll) {
      if (!Ps_UtilObjectService.hasListValue(this.selectedAddHashtagPosts)) {
        this.selectedAddHashtagPosts.push(selectedPost);
      }
      else if (selectedPostLength < nonHashtagPostLength) {
        const hasSamePost = this.selectedAddHashtagPosts.some(post => post.Code === selectedPost.Code);

        if (hasSamePost) {
          newSelectedList = [...this.selectedAddHashtagPosts.filter(post => post.Code !== selectedPost.Code)];
          this.selectedAddHashtagPosts = [...newSelectedList];
        } else {
          this.selectedAddHashtagPosts.push(selectedPost);
        }
      }
    } else {
      newSelectedList = [...this.selectedAddHashtagPosts.filter(post => post.Code !== selectedPost.Code)];
      this.selectedAddHashtagPosts = [...newSelectedList];
      this.formPost.controls['isNonHashtagPostCheckAll'].setValue(false);
    }
    if (this.selectedAddHashtagPosts.length == nonHashtagPostLength) {
      this.formPost.controls['isNonHashtagPostCheckAll'].setValue(true);
    }
  }

  isPostSelected(post: any): boolean {
    return this.selectedAddHashtagPosts.some(obj => obj.Code === post.Code);
  }

  //Update Product ListTag
  onUpdateProductListTag(product: DTODetailConfProduct) {
    let ctx = 'Cập nhật hashtag sản phẩm'

    let sst = this.apiProductService.UpdateProductListTag(product).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.GetListProduct();
        this.closeForm()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);

      this.loading = false;
    }, (e) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
    })
    this.subArr.push(sst)
  }

  //Update Post ListTag
  onUpdatePostListTag(post: DTOMAPost_ObjReturn) {
    let ctx = 'Cập nhật hashtag bài viết'

    let sst = this.apiPostService.UpdateBlog(post, ['ListTag']).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.GetListPost();
        this.closeForm()
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);

      this.loading = false;
    }, (e) => {
      this.loading = false;
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
    })
    this.subArr.push(sst)
  }

  //Import excel
  onImportExcel() {
    this.layoutService.setImportDialog(true);
  }

  uploadEventHandler(e: File) {
    this.p_ImportExcel(e);
  }

  p_ImportExcel(file) {
    this.loading = true;
    var ctx = 'Import Excel';

    //import excel of product
    let sst = this.apiService.ImportExcelHashtagProduct(file, this.Hashtag.Code).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListProduct();
        this.GetHashtag()
        this.layoutService.onSuccess(`${ctx} thành công`);
        this.layoutService.setImportDialogMode(1);
        this.layoutService.setImportDialog(false);
        this.layoutService.getImportDialogComponent().inputBtnDisplay();
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
      }
      this.loading = false;
    }, (e) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`);
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  // download excel template
  downloadExcel(isProduct: boolean) {
    this.loading = true;
    var ctx = 'Download Excel Template';
    var getfileName = isProduct ? 'HashtagProductTemplate.xlsx' : 'HashtagBlogTemplate.xlsx';
    this.layoutService.onInfo(`Đang xử lý ${ctx}`);

    let sst = this.layoutApiService.GetTemplate(getfileName).subscribe((res) => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
        this.layoutService.onSuccess(`${ctx} thành công`);
      } else {
        this.layoutService.onError(`${ctx} thất bại`);
      }
      this.loading = false;
    }, (f) => {
      this.loading = false;
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage);
    });
    this.subArr.push(sst)
  }

  //Update hashtag status
  onClickChangeStatus(statusID: number) {
    let newPro = [{ ...this.Hashtag }];
    // newPro.StatusID = statusID

    if (this.checkDetail(statusID)) {
      this.loading = true;
      this.onUpdateHashTagStatus(newPro, statusID);
    }
  }

  onUpdateHashTagStatus(hashtagItem: DTOMAHashtag[], statusID: number) {
    return this.apiService
      .UpdateHashtagStatus(hashtagItem, statusID)
      .pipe(
        filter((res) => {
          if (res.ErrorString == null && res.StatusCode == 0) {
            this.loading = false;
            this.layoutService.onSuccess(
              'Cập nhật trạng thái hashtag thành công'
            );
            return true;
          } else {
            this.loading = false;
            this.layoutService.onError(
              'Đã xảy ra lỗi khi cập nhật trạng thái hashtag'
            );
            return false;
          }
        }),
        switchMap(() => {
          return of(this.GetHashtag());
        })
      )
      .subscribe((res) => {
      });
  }

  // Khi nhấn delete thì check statusID của hastag
  //nếu == 0 => update ListTag của product thành kh chứa code của hashtag
  onActionDropdownClickSP(menu: MenuDataItem, item: DTODetailConfProduct) {
    if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.onDeleteSingleHashtagProductPost();
    }
  }

  //delete hashtag handle function popup
  getSelectionPopupSP(selectedList: DTODetailConfProduct[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    this.selectedListProduct = [...selectedList];

    if (this.isAllowedToCreateProd || this.isMaster) {
      moreActionDropdown.push({
        Name: 'Xóa hashtag',
        Type: 'delete',
        Code: 'trash',
        Link: 'delete',
        Actived: true,
        LstChild: [],
      });
    }
    return moreActionDropdown;
  }

  //Post grid handle functions
  selectChangeBV(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }

  // handle delete many selection
  onSelectedPopupBtnClickBV(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == 'delete') {
        //Xóa
        this.onDeleteSingleHashtagProductPost();
      }
    }
  }

  onActionDropdownClickBV(menu: MenuDataItem, item: DTOMAPost_ObjReturn) {
    if (menu.Link == 'delete' || menu.Code == 'trash') {
      this.onDeleteSingleHashtagProductPost();
    }
  }

  //delete hashtag handle function popup
  getSelectionPopupBV(selectedList: DTOMAPost_ObjReturn[]) {
    var moreActionDropdown = new Array<MenuDataItem>();
    this.selectedListPost = [...selectedList];
    if (this.isAllowedToCreatePost || this.isMaster) {
      moreActionDropdown.push({
        Name: 'Xóa hashtag',
        Type: 'delete',
        Code: 'trash',
        Link: 'delete',
        Actived: true,
        LstChild: [],
      });
    }
    return moreActionDropdown;
  }

  //Dropdonw popup handle function
  getActionDropdownBV(
    moreActionDropdown: MenuDataItem[],
    dataItem: DTOMAPost_ObjReturn
  ) {
    moreActionDropdown = [];
    //xoa
    if (this.isAllowedToCreatePost || this.isMaster) {
      this.selectedListPost = [{ ...dataItem }];
      moreActionDropdown.push({
        Name: 'Xóa hashtag',
        Code: 'trash',
        Type: 'delete',
        Actived: true,
      });
    }

    return moreActionDropdown;
  }

  ///KENDO GRID
  //paging
  pageChangeSP(event: PageChangeEvent) {
    this.gridStateSP.skip = event.skip;
    this.gridStateSP.take = this.pageSizeSP = event.take;
    this.GetListProduct();
  }

  pageChangeBV(event: PageChangeEvent) {
    this.gridStateBV.skip = event.skip;
    this.gridStateBV.take = this.pageSizeBV = event.take;
    this.GetListPost();
  }

  // Delete hashtag product dialog
  onDelete() {
    this.deleteDialogOpened = true;
  }
  onDeleteSingleHashtagProductPost() {
    this.deleteDialogOpened = true;
  }

  closeDeleteDialog() {
    this.deleteDialogOpened = false;
    this.selectedListProduct = [];
    this.selectedListPost = [];
  }
  closeDeleteManyDialog() {
    this.deleteManyDialogOpened = false;
    this.selectedListProduct = [];
  }

  deleteMany() {
    this.deleteManyDialogOpened = false;
    this.deleteDialogOpened = false;
    this.onDeleteHashTagProductOrPost();
  }

  deleteProductHashTag() {
    this.onDeleteHashTagProductOrPost();
    this.deleteDialogOpened = false;
  }

  // handle delete many selection
  onSelectedPopupBtnClickSP(btnType: string, list: any[], value: any) {
    if (list.length > 0) {
      if (btnType == 'delete') {
        //Xóa
        this.onDeleteSingleHashtagProductPost();
      }
    }
  }

  selectChangeSP(isSelectedRowitemDialogVisible) {
    this.isFilterActive = !isSelectedRowitemDialogVisible;
  }

  // Delete hashtag listtag of product or post
  onDeleteHashTagProductOrPost() {
    if (Ps_UtilObjectService.hasListValue(this.selectedListProduct)) {
      this.selectedListProduct.map((product: DTODetailConfProduct) => {
        var tagList = []

        JSON.parse(product.ListTag)?.map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
          if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0 && s.Code != this.Hashtag.Code)
            tagList.push(s)
        })

        product.ListTag = JSON.stringify(tagList)
        this.onUpdateProductListTag(product)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
      });
      this.selectedListProduct = [];
    } else if (Ps_UtilObjectService.hasListValue(this.selectedListPost)) {
      var temp = [...this.selectedListPost]

      temp.map((post: DTOMAPost_ObjReturn) => {
        var tagList = []

        JSON.parse(post.ListTag)?.map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
          if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0 && s.Code != this.Hashtag.Code)
            tagList.push(s)
        })

        post.ListTag = JSON.stringify(tagList)
        this.onUpdatePostListTag(post)
        this.layoutService.getSelectionPopupComponent().closeSelectedRowitemDialog();
        this.selectedListPost = [];
      });
    }
  }

  //Dropdonw popup handle function
  getActionDropdownSP(
    moreActionDropdown: MenuDataItem[],
    dataItem: DTODetailConfProduct
  ) {
    moreActionDropdown = [];
    //xoa
    if (this.isAllowedToCreateProd || this.isMaster) {
      this.selectedListProduct.push(dataItem);
      moreActionDropdown.push({
        Name: 'Xóa hashtag',
        Code: 'trash',
        Type: 'delete',
        Actived: true,
      });
    }
    return moreActionDropdown;
  }

  //autorun
  validImg(str) {
    return Ps_UtilObjectService.hasValueString(Ps_UtilObjectService.removeImgRes(str))
  }

  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();

    if (this.isProduct && this.formProduct.controls['Barcode'].value !== this.storeProductFormInput) {
      this.GetProduct();
    } else if (!this.isProduct && this.formPost.controls['TitleVN'].value !== this.storePostFormInput) {
      this.GetPost();
    }
  }

  ngOnDestroy(): void {
    this.subArr.forEach(s => s?.unsubscribe())
  }
}
