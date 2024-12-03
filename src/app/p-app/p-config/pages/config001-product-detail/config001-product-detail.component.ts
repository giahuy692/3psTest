import { Component } from '@angular/core';
import { distinct } from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTODetailConfProduct } from '../../shared/dto/DTOConfProduct';
import { takeUntil } from 'rxjs/operators';
import { ConfigHamperService } from '../../shared/services/config-hamper.service';

@Component({
  selector: 'app-config001-product-detail',
  templateUrl: './config001-product-detail.component.html',
  styleUrls: ['./config001-product-detail.component.scss']
})
// export class Config001ProductDetailComponent implements OnInit, OnDestroy {
//   isLockAll: boolean = false
//   loading: boolean = false
//   justLoaded: boolean = true
//   isFilterActive: boolean = true

//   isAdd: boolean = true
//   isAddDetail: boolean = true
//   isHamper: boolean = false//todo là hamper

//   product = new DTODetailConfProduct()
//   label = new DTOLabel()

//   images: any[] = []
//   // sản phẩm con
//   productDetail = new DTODetailConfProduct()// sản phẩm con
//   form: UntypedFormGroup
//   // Permission
//   isMaster: boolean = false;
//   isCreator: boolean = false;
//   isApprover: boolean = false;

//   isAllowedToViewOnly: boolean = false
//   actionPerm: DTOActionPermission[];
//   //hashtag
//   gridStateH: State = {
//     filter: {
//       filters: [
//         { field: 'StatusID', operator: 'eq', value: 2 }
//       ], logic: 'and'
//     },
//   }

//   listHashtag: DTOMAHashtag[] = []
//   listFilterHashtag: DTOMAHashtag[] = []
//   listSelectedHashtag: DTOMAHashtag[] = []
//   //
//   searchForm: UntypedFormGroup
//   allowActionDropdown = ['detail', 'edit']
//   @ViewChild('multiSelect') multiSelect;
//   //GRID  
//   //#region prod
//   pageSize = 50
//   pageSizes = [this.pageSize]

//   gridView = new Subject<any>();
//   gridState: State = {
//     take: this.pageSize,
//     filter: { filters: [], logic: 'and' },
//   }
//   //select
//   selectable: SelectableSettings = {
//     enabled: true,
//     mode: 'multiple',
//     drag: false,
//     checkboxOnly: true,
//   }
//   //filder prod
//   filterTypeData: FilterDescriptor = {
//     field: "TypeData", operator: "eq", value: 1
//   }
//   //search prod
//   filterSearchBox: CompositeFilterDescriptor = {
//     logic: "or",
//     filters: []
//   }
//   filterBarcode: FilterDescriptor = {
//     field: "Barcode", operator: "contains", value: null
//   }
//   filterProductName: FilterDescriptor = {
//     field: "ProductName", operator: "contains", value: null
//   }
//   filterBrandName: FilterDescriptor = {
//     field: "BrandName", operator: "contains", value: null
//   }
//   //#endregion prod
//   //CALLBACK
//   //rowItem action dropdown
//   onActionDropdownClickCallback: Function
//   //grid data change
//   onPageChangeCallback: Function
//   onSortChangeCallback: Function
//   onFilterChangeCallback: Function
//   //grid select
//   getSelectionPopupCallback: Function
//   onSelectCallback: Function
//   onSelectedPopupBtnCallback: Function

//   //subscrition
//   subArr: Subscription[] = []

//   constructor(
//     public layoutService: LayoutService,
//     public menuService: PS_HelperMenuService,
//     public service: ConfigService,
//     public apiService: ConfigAPIService,
//     public marApiService: MarHashtagAPIService) { }

//   ngOnInit(): void {
//     let that = this

//     let sst = this.menuService
//       .changePermission()
//       .subscribe((res: DTOPermission) => {
//         if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
//           that.justLoaded = false;
//           that.actionPerm = distinct(res.ActionPermission, 'ActionType');

//           //Hashtag action permission
//           that.isMaster = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
//           that.isCreator = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
//           that.isApprover = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
//           //Chỉ được xem
//           that.isAllowedToViewOnly = that.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(that.actionPerm.filter(s => s.ActionType != 6))

//           that.getCache()
//         }
//       });
//     this.subArr.push(sst)
//     //form
//     this.loadFormDetail()
//     this.loadSearchForm()
//   }
//   //cache
//   getCache() {
//     let sst = this.service.getCacheConfProduct().subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res)) {
//         this.product = res
//       }
//       this.isLockAll = !this.isMaster

//       this.getData()
//     })
//     this.subArr.push(sst)
//   }

//   getData() {
//     if (this.product.Code != 0)
//       this.GetProduct()
//     this.GetListHashtag()
//   }
//   //api
//   GetProduct() {
//     this.loading = true;

//     let sst = this.apiService.GetProduct(this.product.Code).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.product = res.ObjectReturn
//         this.checkProp()
//       } else
//         this.layoutService.onError('Đã xảy ra lỗi khi lấy Thông tin sản phẩm: ' + res.ErrorString)

//       this.loading = false;
//     }, (e) => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi lấy Thông tin sản phẩm: ' + e)
//     });
//     this.subArr.push(sst)
//   }
//   //Update Product 
//   UpdateProduct(prop: string[], prod = this.product) {
//     var ctx = 'Cập nhật thông tin sản phẩm'
//     this.loading = true;

//     let sst = this.apiService.UpdateProduct(prod, prop).subscribe(res => {
//       this.loading = false;

//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.product = res.ObjectReturn
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
//     }, (e) => {
//       this.loading = false;
//       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
//     });
//     this.subArr.push(sst)
//   }
//   //Update Product ListTag
//   UpdateProductListTag(product: DTODetailConfProduct = this.product) {
//     product.ListTag = JSON.stringify(this.listSelectedHashtag)
//     this.loading = true;

//     let sst = this.apiService.UpdateProductListTag(product).subscribe((res) => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.layoutService.onSuccess('Cập nhật hashtag sản phẩm thành công');
//       } else
//         this.layoutService.onError('Đã xảy ra lỗi khi cập nhật hashtag sản phẩm');

//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi cập nhật hashtag sản phẩm')
//     });
//     this.subArr.push(sst)
//   }

//   // Get List Hashtag
//   GetListHashtag() {
//     this.loading = true;
//     var ctx = 'Danh sách hashtag'

//     let sst = this.marApiService.GetListHashtag(this.gridStateH).subscribe(res => {
//       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
//         this.listHashtag = res.ObjectReturn.Data;
//         this.listFilterHashtag = res.ObjectReturn.Data;
//         this.onMultiSelectFilter()
//         this.checkProp()
//       } else
//         this.layoutService.onError(`Đã xảy ra lỗi khi lấy ${ctx}: ${res.ErrorString}`)

//       this.loading = false;
//     }, () => {
//       this.loading = false;
//       this.layoutService.onError('Đã xảy ra lỗi khi lấy ' + ctx)
//     });
//     this.subArr.push(sst)
//   }
//   //
//   checkProp() {
//     if (Ps_UtilObjectService.hasValueString(this.product.ListTag) && Ps_UtilObjectService.hasListValue(this.listHashtag)) {
//       this.listSelectedHashtag = []
//       var tagList: DTOMAHashtag[] = []

//       JSON.parse(this.product.ListTag).map(s => {//lọc ra các json bị lỗi \"["\"["\"["\"[" này
//         if (Ps_UtilObjectService.hasValue(s) && Ps_UtilObjectService.hasValue(s.Code) && s.Code != 0)
//           tagList.push(s)
//       })
//       this.listSelectedHashtag = this.listHashtag.filter(s => tagList.findIndex(t => t.Code == s.Code) > -1)
//     }
//   }
//   //user event
//   onTextboxLoseFocus(prop: string, item?) {
//     if (Ps_UtilObjectService.hasValueString(prop)) {
//       switch (prop) {
//         case 'ListTag':
//           this.UpdateProductListTag()
//           break
//         default:
//           if (this.isLockAll)
//             return false
//           else
//             this.UpdateProduct([prop])
//           break
//       }
//     }
//   }

//   onDropdownlistClick(e, dropdownName: string) {
//     switch (dropdownName) {//todo
//       // case 'PromotionType':
//       //   this.curPromotionType = e
//       //   this.curPromotion.PromotionType = this.curPromotionType.Code
//       //   this.curPromotion.PromotionTypeName = this.curPromotionType.PromotionType
//       //   this.isCheckboxAllowByPromotionType()
//       //   this.p_UpdatePromotion([dropdownName])
//       //   break
//       default:
//         console.log('select ', e, dropdownName)
//         // this.p_UpdatePromotion([dropdownName])
//         break
//     }
//   }

//   clickCheckbox(ev, prop: string, item?) {
//     switch (prop) {//todo
//       // case 'WHName':
//       //   var wh = item as DTOWarehouse        
//       //     wh.IsSelected = ev.target.checked
//       //     this.p_UpdatePromotionWH(wh)        
//       //   break
//       case 'ListLabel':
//         item.Selectted = ev.target.checked
//         break
//       default:
//         break
//     }
//   }
//   //header1
//   updateStatus(s: number) {

//   }

//   onDelete() {

//   }

//   createNew() {

//   }

//   onUploadImg() {
//     //todo
//   }

//   deleteImg() {
//     //todo
//   }

//   viewImage(img) {

//   }
//   //LIST PRODUCT
//   loadSearchForm() {
//     this.searchForm = new UntypedFormGroup({
//       'SearchQuery': new UntypedFormControl(''),
//     })
//   }
//   search() {

//   }

//   onAddProd() {

//   }
//   //FORM PRODUCT
//   loadFormDetail() {
//     this.form = new UntypedFormGroup({
//       'Barcode': new UntypedFormControl(this.productDetail.Barcode, Validators.required),
//       'Qty': new UntypedFormControl(this.productDetail.Qty),
//     })
//   }

//   keydownEnter(e) {

//   }

//   closeForm() {

//   }

//   onSubmit() {

//   }
//   //file
//   onImportExcel() {
//     //todo
//   }

//   downloadExcel() {

//   }
//   //autorun
//   onMultiSelectFilter() {
//     const contains = (value) => (s: DTOMAHashtag) =>
//       s.TagName?.toLowerCase().indexOf(value?.toLowerCase()) !== -1
//       || s.TagCode?.toLowerCase().indexOf(value?.toLowerCase()) !== -1;

//     this.multiSelect?.filterChange.asObservable().pipe(
//       switchMap((value) =>
//         from([this.listHashtag]).pipe(
//           tap(() => (this.loading = true)),
//           delay(this.layoutService.typingDelay),
//           map((data) => data.filter(contains(value)))
//         )
//       )
//     ).subscribe((x) => {
//       this.listFilterHashtag = x;
//       this.loading = false
//     });
//   }

//   showLabel(l: DTOLabel) {
//     this.label = { ...l as DTOLabel }
//   }
//   getRes(img: string) {
//     return Ps_UtilObjectService.getImgRes(img)
//   }
//   ngOnDestroy() {
//     this.subArr.forEach(s => s?.unsubscribe())
//   }
// }
export class Config001ProductDetailComponent {

  Unsubscribe = new Subject<void>();

  product = new DTODetailConfProduct()

  // permission
  justLoaded = true
  actionPerm: DTOActionPermission[] = []
  isMaster: boolean = false;
  isCreator: boolean = false;
  isApprover: boolean = false;
  isAllowedToViewOnly: boolean = false


  constructor(
    public hamperService: ConfigHamperService,
    public menuService: PS_HelperMenuService
  ) { }


  ngOnInit(): void {
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false;
        this.actionPerm = distinct(res.ActionPermission, 'ActionType');
        //action permission
        this.isMaster = this.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        this.isCreator = this.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        this.isApprover = this.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
        // this.isMaster = false
        // this.isCreator = true
        // this.isApprover = true
        //Chỉ được xem
        this.isAllowedToViewOnly = this.actionPerm.findIndex(s => s.ActionType == 6) > -1 && !Ps_UtilObjectService.hasListValue(this.actionPerm.filter(s => s.ActionType != 6))
      }
    })
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
    // this.getHamperRequest();
  }

  loadData() {
    if (this.product.Code > 0) {
      this.hamperService.ReloadComponent();
    }
  }

  getHamperRequest() {
    this.hamperService.getHamperRequest().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.product = res
      }
    })
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }

}