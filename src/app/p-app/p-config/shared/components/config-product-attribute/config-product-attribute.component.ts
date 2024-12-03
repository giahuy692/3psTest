import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { DTOConfGroup, DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { CompositeFilterDescriptor, FilterDescriptor, State } from '@progress/kendo-data-query';
import { ConfigAPIService } from '../../services/config-api.service';
import { MarCategoryWebAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-category-web.service';
import { DTOCategoryWeb } from 'src/app/p-app/p-marketing/shared/dto/DTOCategoryWeb.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
@Component({
  selector: 'app-config-product-attribute',
  templateUrl: './config-product-attribute.component.html',
  styleUrls: ['./config-product-attribute.component.scss']
})
export class ConfigProductAttributeComponent {

  @ViewChild('dropdown2') dropdown2: any
  @ViewChild('dropdown3') dropdown3: any
  @ViewChild('dropdown4') dropdown4: any
  @ViewChild('dropdown5') dropdown5: any

  
  @Input() disable:boolean = false
  @Input() typeInfo: number = 0 // 2: thông tin sản phẩm Cty


 
  loading = false
  //DTO
  product = new DTOHamperRequest();
  listStatus: DTOStatus[] = [];
  
  listPackingUnit: any[] = []

  currentUnit = new DTOHamperRequest();

  currentTypeData = new DTOStatus();
 
  listGroupWeb: DTOConfGroup[] = []
  listGroupWebData:   { [key: string]: DTOConfGroup[] } = {};
  currentGroupWeb1: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb2: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb3: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb4: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb5: { [key: number]: DTOConfGroup } = {};
  

  //state
  gridState: State = {
    filter: { filters: [], logic: 'and' },
  }
  gridStateGroup: State = {
    filter: { filters: [], logic: 'and' },
  }

  filterParentBarcode: FilterDescriptor = {
    field: "TypeData", operator: "eq", value: 1
  }


  //Unsubcribe
  ngUnsubscribe = new Subject<void>();


  constructor(
    private configHamperAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    private hamperService: ConfigHamperService,
    private layoutServiceAPI: LayoutAPIService,
    private configAPIService: ConfigAPIService,
    public marAPIService: MarCategoryWebAPIService,
    public menuService: PS_HelperMenuService,
  ){}

  ngOnInit():void{
    // this.getHamperRequest();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }

  getAllDropdownStatus(){
    this.getListStatus(10,'listPurchases');
    this.getListStatus(11,'listRetail');
    this.getListStatus(12,'listWholesale');
    
  }
  
  isCheckTwoRole:boolean = false
  getHamperRequest(){
    this.loading = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    if(Ps_UtilObjectService.hasValue(res)){
      this.product = res
      this.isCheckTwoRole =  this.product['isApprover'] && this.product['isCreator'] ? false : this.product['isCreator'] ? true : false

      this.disable =  this.product['isApprover'] && this.product['isCreator'] ? false : this.product['isApprover'] ? true : false;
    }
    if(this.product.Code != 0){
      this.loadFilter();
      this.getListPackingUnit(this.gridState);
      this.getAllDropdownStatus();
      this.getListGroupWeb(this.gridStateGroup);
    }
   })
  }
 

  getListStatus(typeData: number,key:string){
    this.loading = true
    this.layoutServiceAPI.GetListStatus(typeData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          this.listStatus[key] = res.ObjectReturn
          if(typeData == 10)
            this.currentTypeData[typeData] = this.listStatus[key].find(s => s.OrderBy == this.product.StatusBuyer)
          else if(typeData == 11)
            this.currentTypeData[typeData] = this.listStatus[key].find(s => s.OrderBy == this.product.Status)
          else
            this.currentTypeData[typeData] = this.listStatus[key].find(s => s.OrderBy == this.product.StatusWhole)
      }
      else{
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng của Thuộc tính Hamper:  ${res.ErrorString}`)
      }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tình trạng của Thuộc tính Hamper:  ${err}`)
    })
  }


  loadFilter() {
    if(Ps_UtilObjectService.hasValue(this.product.Company)){
      this.gridState.filter.filters = [];
      this.gridStateGroup.filter.filters = [];
      this.gridStateGroup.filter.filters.push({  field: "Company", operator: "eq", value: this.product.Company })
    // Add filter for TypeData = 1 or TypeData = 2 and Code = Baseunit của product
    let filterSearch: CompositeFilterDescriptor = { logic: 'or', filters: [] };
    // const listUnit = [this.product.BaseUnit,this.product.SellerUnit,this.product.BuyerUnit,this.product.WHUnit]
    // if(listUnit.every(x => x !== 6 && x !== 7 && x !== 8)){
      filterSearch.filters.push({field: "TypeData", operator: "eq", value: 2},{field: "TypeData", operator: "eq", value: 1})
    // }else{
    //   filterSearch.filters.push({field: "TypeData", operator: "eq", value: 2})
    // }
    // if(Ps_UtilObjectService.hasValue(this.product.BaseUnit)){
    //   filterSearch.filters.push({
    //     logic: 'and',
    //     filters: [
    //       { field: "TypeData", operator: "eq", value: 1 },
    //       // { field: "Code", operator: "eq", value: this.product.BaseUnit }
    //     ]
    //   }, {
    //     logic: 'and',
    //     filters: [
    //       { field: "TypeData", operator: "eq", value: 2 }
    //     ]
    //   });
    // }
    // else{
      // filterSearch.filters = []
      // filterSearch.filters.push({field: "TypeData", operator: "eq", value: 2},{field: "TypeData", operator: "eq", value: 1})
    // }
    
  
    if (filterSearch.filters.length > 0) {
      this.gridState.filter.filters.push(filterSearch);
    }
  }
  
  }
  

  listPackingUnitCustom: any[] = []
  getListPackingUnit(state:State) {
    this.loading = true
    this.configHamperAPI.GetListPackingUnit(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listPackingUnit = res.ObjectReturn.Data
        this.currentUnit['BaseUnit'] = this.listPackingUnit.find(s => s.Code == this.product.BaseUnit)
        this.currentUnit['BuyerUnit'] = this.listPackingUnit.find(s => s.Code == this.product.BuyerUnit)
        this.currentUnit['SellerUnit'] = this.listPackingUnit.find(s => s.Code == this.product.SellerUnit)
        this.currentUnit['WHUnit'] = this.listPackingUnit.find(s => s.Code == this.product.WHUnit)

        const listCurrentUnit = [this.currentUnit['BaseUnit'],this.currentUnit['BuyerUnit'],this.currentUnit['SellerUnit'],this.currentUnit['WHUnit']]

        const listPackingType1 = listCurrentUnit.filter(s =>Ps_UtilObjectService.hasValue(s) && s['TypeData'] !== 2).map(s => (s));

        const listDefault = this.listPackingUnit.filter(item => item.TypeData === 2);

        if(Ps_UtilObjectService.hasListValue(listDefault) || Ps_UtilObjectService.hasListValue(listPackingType1)){
          this.listPackingUnitCustom = [...listPackingType1, ...listDefault].filter((item, index) => {
            return [...listPackingType1, ...listDefault].findIndex(obj => obj.Code === item.Code) === index;
          });
        }
      } else {
        this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${res.ErrorString}`)
      }
      this.loading = false
    }, (err) => {
      this.layoutService.onError(`Lỗi lấy danh sách Đơn vị sản phẩm: ${err}`);
      this.loading = false
    })
  }

  valueChange(e,sellName:string){
    switch (sellName) {
      default:
        if(e.target.checked)
          this.product[sellName] = true
        else
          this.product[sellName] = false
          this.updateProduct([sellName], this.product,0);
        break;
    }
    // console.log(this.hamper)
  }


  onDropdownlistClick(event, propName: string[]) {
    switch (propName[0]) {
        case 'BaseUnit':
            this.product.BaseUnit = event.Code;
            this.updateProduct(propName, this.product,0);
            break;
        case 'BuyerUnit':
            this.product.BuyerUnit = event.Code;
            this.updateProduct(propName, this.product,0);
            break;
        case 'SellerUnit':
            this.product.SellerUnit = event.Code;
            this.updateProduct(propName, this.product,0);
            break;
        case 'WHUnit':
            this.product.WHUnit = event.Code;
            this.updateProduct(propName, this.product,0);
            break;
        case 'StatusBuyer':
            this.product.StatusBuyer = event.OrderBy;
            this.updateProduct(propName, this.product,0);
            break;
        case 'Status':
            this.product.Status = event.OrderBy;
            this.updateProduct(propName, this.product,0);
            break;
        case 'StatusWhole':
            this.product.StatusWhole = event.OrderBy;
            this.updateProduct(propName, this.product,0);
            break;
        case 'GroupID1':
        //Nếu null thì update tất cả tránh trường hợp load lại vẫn chưa update lại groupID 
            this.product.GroupID2 = null
            this.product.GroupID3 = null
            this.product.GroupID4 = null
            this.product.GroupID = null
            if(event.Code == null){
              this.product.GroupID1 = null
              this.currentGroupWeb1 = null
            }
            else{
              this.product.GroupID1 = event.Code
              const listLevel2 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
              this.currentGroupWeb1= event
              
              if(Ps_UtilObjectService.hasListValue(listLevel2)){
                this.listGroupWebData.level2 = listLevel2
              }else{
                this.listGroupWebData.level2 = []
                this.dropdown2.source = []
              }
              
            }
            this.updateProduct(['GroupID1','GroupID2','GroupID3','GroupID4','GroupID'],this.product,2)
            for (let level = 2; level <= 5; level++) {
              this[`currentGroupWeb${level}`] = null;
            }
            break;
        case 'GroupID2':
          this.product.GroupID3 = null
          this.product.GroupID4 = null
          this.product.GroupID = null
          if(event.Code == null){
            this.product.GroupID2 = null
            this.currentGroupWeb2 = null
          }
          else{
              this.product.GroupID2 = event.Code
              const listLevel3 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
              this.currentGroupWeb2 = event
              
              if(Ps_UtilObjectService.hasListValue(listLevel3)){
                this.listGroupWebData.level3 = listLevel3
              }else{
                this.listGroupWebData.level3 = []
                this.dropdown3.source = []
              }
            }
            this.updateProduct(['GroupID2','GroupID3','GroupID4','GroupID'],this.product,2)
            for (let level = 3; level <= 5; level++) {
              this[`currentGroupWeb${level}`] = null;
            }
            break;
        case 'GroupID3':
          this.product.GroupID4 = null
          this.product.GroupID = null
          if(event.Code == null){
            this.product.GroupID3 = null
            this.currentGroupWeb3 = null
          }
          else{
            this.product.GroupID3 = event.Code
            const listLevel4 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
            this.currentGroupWeb3 = event
            
            if(Ps_UtilObjectService.hasListValue(listLevel4)){
              this.listGroupWebData.level4 = listLevel4
            }else{
              this.listGroupWebData.level4 = []
              this.dropdown4.source = []
            }
          }
          this.updateProduct(['GroupID3','GroupID4','GroupID'],this.product,2)
            this.currentGroupWeb4 = null
            this.currentGroupWeb5 = null
            break;
        case 'GroupID4':
          this.product.GroupID = null
          if(event.Code == null){
            this.product.GroupID4 = null
            this.currentGroupWeb4 = null
          }
          else{
            this.product.GroupID4 = event.Code
            const listLevel5 = this.listGroupWeb.filter(s => s.ParentID == event.Code)
            this.currentGroupWeb4 = event
            
            if(Ps_UtilObjectService.hasListValue(listLevel5)){
              this.listGroupWebData.level5 = listLevel5
            }else{
              this.listGroupWebData.level5 = []
              this.dropdown5.source = []
            }

          }
          this.updateProduct(['GroupID4','GroupID'],this.product,2)
            this.currentGroupWeb5 = null
            break;
        case 'GroupID5':
            this.product.GroupID = event.Code;
            this.currentGroupWeb5 = event
            this.updateProduct(['GroupID'], this.product,0);
            break;
    }
}


  getListGroupWeb(state:State){
    this.configHamperAPI.GetListGroup(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
        const flatData = res.ObjectReturn.Data
        for (let level = 1; level <= 5; level++) {
          this.listGroupWebData[`level${level}`] = flatData.filter(item => item.Level == level)
        }

      // lấy item bằng với groupID của product

      const findMatchingItem = (level: number) => {
        const levelData = this.listGroupWebData[`level${level}`];
        const matchingItem = levelData.find(s => {
            return  s.Code === this.product[`GroupID${level}`]
          });
        return matchingItem;

    };
    //lấy item có trong list company
    for (let level = 1; level <= 5; level++) {
        this[`currentGroupWeb${level}`] = findMatchingItem(level);
    }

    for (let i = 2; i <= 5; i++) {
      const levelKey = `level${i}`;
      const parentGroupKey = `currentGroupWeb${i - 1}`;
      if(Ps_UtilObjectService.hasValue(this[parentGroupKey])){
        this.listGroupWebData[levelKey] = flatData.filter(item => item.ParentID == this[parentGroupKey].Code);
      }
    }

  //   if(Ps_UtilObjectService.hasValue(this.currentGroupWeb2) && Ps_UtilObjectService.hasValue(this.currentGroupWeb1) &&
  //   this.currentGroupWeb2['ParentID'] != this.currentGroupWeb1['Code']){
  //    this.product.GroupID2 = null
  //    this.product.GroupID3 = null
  //    this.product.GroupID4 = null
  //    this.product.GroupID = null
  //    this.updateProduct(['GroupID2','GroupID3','GroupID4','GroupID'],this.product,1)
  //  }
  //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb3) && Ps_UtilObjectService.hasValue(this.currentGroupWeb2) &&
  //  this.currentGroupWeb3['ParentID'] != this.currentGroupWeb2['Code']){
  //   this.product.GroupID3 = null
  //   this.product.GroupID4 = null
  //   this.product.GroupID = null
  //   this.updateProduct(['GroupID3','GroupID4','GroupID'],this.product,1)
  //  }
  //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb4) && Ps_UtilObjectService.hasValue(this.currentGroupWeb3) &&
  //  this.currentGroupWeb4['ParentID'] != this.currentGroupWeb3['Code']){
  //    this.product.GroupID4 = null
  //    this.product.GroupID = null
  //    this.updateProduct(['GroupID4','GroupID'],this.product,1)
  //  }
  //  else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb5) && Ps_UtilObjectService.hasValue(this.currentGroupWeb4) &&
  //    this.currentGroupWeb5['ParentID'] != this.currentGroupWeb4['Code']){
  //    this.product.GroupID = null
  //    this.updateProduct(['GroupID'],this.product,1)
  //  }
    this.listGroupWeb = flatData

  }
  else{
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy phân nhóm:  ${res.ErrorString}`)
  }
      this.loading = false
    },err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy phân nhóm:  ${err}`)
    })
  }

  updateProduct(prop: string[], product = this.product,typeUpdate:number){
    //0 là cập nhật mặc định - 1 là cập nhật lại phân nhóm nếu item các cấp không giống nhau
      this.loading = true
      this.configAPIService.UpdateProduct(product,prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if(Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0){
          if(typeUpdate == 1){
            this.product = res.ObjectReturn
            this.getListGroupWeb(this.gridStateGroup);
          }
          else
           if(this.typeInfo == 2){
              this.layoutService.onSuccess("Cập nhật thành công thuộc tính Sản Phẩm")
          }
          else{
              this.layoutService.onSuccess("Cập nhật thành công thuộc tính Hamper")
          }
        }
        else{
          if(this.typeInfo == 3){
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Hamper:  ${res.ErrorString}`)
          }
          else if(this.typeInfo == 2){
            this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Sản Phẩm:  ${res.ErrorString}`)
          }
        
        }
        this.loading = false
      },err => {
        this.loading = false
        if(this.typeInfo == 3){
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Hamper:  ${err}`)
        }
        else if(this.typeInfo == 2){
          this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thuộc tính Sản Phẩm:  ${err}`)
        }
      })
  }

  onBlurTextbox(propName:string){
    if (Ps_UtilObjectService.hasValueString(propName)) {
      switch (propName) {
        default:
          this.updateProduct([propName],this.product,0)
          break
      }
    }
  }


  ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
