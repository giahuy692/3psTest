import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOSupplier } from '../../dto/DTOSupplier';
import { PurSupplierApiServiceService } from '../../services/pur-supplier-api.service.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PurService } from '../../services/pur.service';
import { DTOPartner } from '../../dto/DTOPartner';


@Component({
  selector: 'app-pur-menu-supplier-info',
  templateUrl: './pur-menu-supplier-info.component.html',
  styleUrls: ['./pur-menu-supplier-info.component.scss']
})
export class PurMenuSupplierInfoComponent implements OnInit, OnDestroy {

  /**
   * truyền link của component đang dùng component menu 
   * 
   */
  @Input() Link: string = ""

  data: {VNName: string , Partner: number, StatusName: string, StatusID: number} ={
    VNName: "",
    Partner: 0,
    StatusName: "",
    StatusID: 0,
  }
  Supplier: DTOSupplier = new DTOSupplier();
  dataSupplierCache: DTOSupplier = new DTOSupplier()
  dataPartnerCache: DTOPartner = new DTOPartner()
  Data: any

  dataLoaded = false;
  isAdd: boolean = true



  // region Subscription
  Unsubscribe = new Subject<void>();
  // endregion

  ListMenuSide: MenuDataItem[] = []

  constructor(
    public menuService: PS_HelperMenuService,
    public apiService: PurSupplierApiServiceService,
    public layoutService: LayoutService,
    public purService: PurService,
  ) {
  }

  ngOnInit(): void {

    // this.getCache();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getCache();
      }
    })
    this.reloadDataFrom();
    this.loadDataFrom()

    // lấy danh sách tranh chi tiết
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {

      var parent = item.ListMenu.find(f => f.Code.includes('pur-policy') || f.Link.includes('pur002-brand-list'))

      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('pur005-supplier-list') || f.Link.includes('pur005-supplier-list'))
        this.ListMenuSide = JSON.parse(JSON.stringify(detail.LstChild))
        this.ListMenuSide[0].Name = "Thông tin chung"

        // active vào trang hiện tại
        if (Ps_UtilObjectService.hasValueString(this.Link)) {

          this.ListMenuSide.forEach(s => {
            if (s.Code.includes(this.Link) || s.Link.includes(this.Link)) {
              s.Actived = true
            }
          })

        }
      }
    })
  }

  // Lấy Dữ liệu lưu trên Cache và gọi api lấy giá trị mới nhất
  getCache() {
    const res = JSON.parse(localStorage.getItem('supplierInfo'))
    if (Ps_UtilObjectService.hasValue(res)) {
      this.isAdd = this.apiService.isAdd
      this.Data = res
      if(!Ps_UtilObjectService.hasValue(res.Partner)){
        this.apiService.isAdd = false
        this.dataPartnerCache = res;
        this.data = {
          VNName: this.dataPartnerCache.VNName,
          Partner: this.dataPartnerCache.Code,
          StatusName: "",
          StatusID: 0
        }
        this.purService.activeSupplier(this.dataSupplierCache);
      } else {
        this.dataSupplierCache = res;
        this.APIGetSupplier(this.dataSupplierCache.Code)
        this.purService.activeSupplier(this.dataSupplierCache);
      }
    }
  }
  //

  // Lấy thông tin nhà cung cấp
  APIGetSupplier(CodeSupplier: number) {
    this.apiService.GetSupplier(CodeSupplier).pipe(takeUntil(this.Unsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.data = {
          VNName: res.ObjectReturn[0].VNName,
          Partner: res.ObjectReturn[0].Partner,
          StatusName: res.ObjectReturn[0].StatusName,
          StatusID: res.ObjectReturn[0].StatusID
        }
        this.Supplier = JSON.parse(JSON.stringify(res.ObjectReturn[0]))
        this.purService.activeSupplier(this.Supplier);
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chi tiết nhà cung cấp: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin chi tiết nhà cung cấp: ${err}`)
    })
  }

  // load lại trang 
  reloadDataFrom() {
    this.purService.reloadSuccess$.pipe(takeUntil(this.Unsubscribe)).subscribe(() => {
      this.APIGetSupplier(this.Supplier.Code)
    })
  }

  onChangMenu(item: MenuDataItem) {
    if(Ps_UtilObjectService.hasValueString(item.Link)){
      this.menuService.activeMenu(item)
    }
  }

  // load lại data 
  loadDataFrom() {
    this.purService.getSupplier().subscribe((sub: DTOSupplier) => {
      this.data = sub;
    });
  }

  ngOnDestroy(): void {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }
}
