import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DTOConfApplyCompany, DTOConfGroup, DTOHamperRequest } from '../../dto/DTOConfHamperRequest';
import { ConfigHamperApiService } from '../../services/config-hamper-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { ConfigHamperService } from '../../services/config-hamper.service';
import { MarCategoryWebAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-category-web.service';
import { ConfigAPIService } from '../../services/config-api.service';
import { State } from '@progress/kendo-data-query';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
@Component({
  selector: 'app-config-applied-company',
  templateUrl: './config-applied-company.component.html',
  styleUrls: ['./config-applied-company.component.scss']
})
export class ConfigAppliedCompanyComponent {
  //Input
  @Input() disable = false
  @Output() dataChanged: EventEmitter<any> = new EventEmitter();

  @ViewChild('dropdown2') dropdown2: any
  @ViewChild('dropdown3') dropdown3: any
  @ViewChild('dropdown4') dropdown4: any
  @ViewChild('dropdown5') dropdown5: any

  //boolean
  loading = false
  isLockAll = true
  dialogOpen = false
  isChecked: boolean = true;



  //DTO
  listCompany: DTOConfApplyCompany[] = [];
  Company = new DTOConfApplyCompany();

  listGroupWeb: { [company: number]: DTOConfGroup[] } = {};
  hamper = new DTOHamperRequest();


  currentGroupWeb: DTOConfGroup[] = []
  selectedCompany: any
  listCurrency: any[] = []

  // dataCurrency = [{Code: 1, Text: 'VND'},{Code: 2, Text: 'Dola'}]


  //Unsubcribe
  ngUnsubscribe = new Subject<void>();

  gridState: State = {
    filter: { filters: [], logic: 'and' },
  }


  //Company
  companies = [{ Company: 1, Currency: null, Selected: false },

  { Company: 2, Currency: null, Selected: false },
  { Company: 3, Currency: null, Selected: false }];
  companyData: { [key: number]: { [key: string]: DTOConfGroup[] } } = {};
  companyDropdownStates: { [key: number]: boolean } = {};

  testDropdown: { [key: number]: boolean } = {};

  currentGroupWeb1: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb2: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb3: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb4: { [key: number]: DTOConfGroup } = {};
  currentGroupWeb5: { [key: number]: DTOConfGroup } = {};
  currentUnitPrice: { [key: number]: any } = {};


  constructor(
    private hamperServiceAPI: ConfigHamperApiService,
    private layoutService: LayoutService,
    private hamperService: ConfigHamperService,
    public configAPIService: ConfigAPIService,
    public marAPIService: MarCategoryWebAPIService,
    public menuService: PS_HelperMenuService,
  ) {

  }

  ngOnInit(): void {
    // this.getHamperRequest();
    this.reloadApplyCompany();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.getHamperRequest();
      }
    })
  }


  // Khi có sự thay đổi dữ liệu, phát sự kiện thông báo đến component cha
  onDataChange(newData: DTOHamperRequest) {
    this.dataChanged.emit(newData);
  }

  reloadApplyCompany() {
    this.hamperService.reloadApplyCompany$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getListApplyCompany(0);
    });
  }


  closeDialog() {
    this.dialogOpen = false
    this.companies.forEach(c => {
      if (c.Company == this.selectedCompany.Company) {
        c.Selected = true
      }
    })
  }

  onDeleteCompany() {
    var companySave = new DTOConfApplyCompany()
    this.listCompany.find(s => {
      if (s.Company == this.selectedCompany.Company) {
        companySave = s
      }
    })
    if (Ps_UtilObjectService.hasValue(companySave)) {
      this.deleteProduct(companySave.Code, this.selectedCompany.Company, this.hamper.Code)
    }
  }


  getHamperRequest() {
    this.disable = true
    this.hamperService.getHamperRequest().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.disable = false
        this.hamper = res
        this.checkEmit();
        // this.getData()
      }
    })
  }

  checkEmit() {
    if (this.hamper.Code != 0) {
      if (!this.hamper['hasUpdateStatus']) {
        this.getListApplyCompany(1);
        this.getListCurrency();
      }
      if (this.hamper.StatusID == 2 || this.hamper.StatusID == 3 || this.hamper['isDisable']) {
        this.disable = true
      }
    }
    else {
      this.disable = true
      this.companies.forEach(s => {
        s.Selected = false
        this.companyDropdownStates[s.Company] = false
        for (let level = 1; level <= 5; level++) {
          this[`currentGroupWeb${level}`][s.Company] = { GroupName: '--Chọn--', Code: null };
        }
        this.currentUnitPrice[s.Company] = null
      })
    }

  }


  //type  = 1 get api đầu tiên để load listgroupweb, type = 0 thì sẽ load lại khi update
  getListApplyCompany(type: number) {
    this.hamperServiceAPI.GetListApplyCompany(this.hamper.Code).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.StatusCode == 0) {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn)) {
          this.listCompany = res.ObjectReturn
          this.onDataChange(res.ObjectReturn)
          if (type == 1) {
            this.listCompany.forEach(s => {
              this.companies.forEach(c => {
                if (s.Company == c.Company) {
                  c.Selected = true
                  this.companyDropdownStates[s.Company] = true
                  c.Currency = s.Currency
                }
              })

              this.currentUnitPrice[s.Company] = s.UnitPrice
            })
            const uniqueCompanies = Array.from(new Set(this.listCompany.map(item => item.Company)));
            uniqueCompanies.forEach(s => {
              this.getListGroupWeb(this.gridState, s)
            })
          }

          else {
            this.listCompany.forEach(s => {
              this.companies.forEach(c => {
                if (s.Company == c.Company) {
                  c.Selected = true
                  this.currentUnitPrice[c.Company] = s.UnitPrice
                  this.companyDropdownStates[s.Company] = true
                  c.Currency = s.Currency
                }
              })
            })
          }
        }

        else {
          this.onDataChange(res.ObjectReturn)
          this.companies.forEach(c => {
            c.Selected = false
            this.companyDropdownStates[c.Company] = false
          })
        }
      }

      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Công ty áp dụng: ${res.ErrorString} `)
      }
    }, err => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy thông tin Công ty áp dụng: ${err} `)
    })
  }


  onCheckboxChange(event, company) {
    this.selectedCompany = company
    if (this.hamper.Code != 0) {
      if (event.target.checked) {
        company.Selected = true
        this.companyDropdownStates[company.Company] = true
        this.updateDropdownListData(company.Company);
        var itemHamper = { ...this.Company, Code: 0, Barcode: this.hamper.Barcode, Product: this.hamper.Code, Company: company.Company }
        this.updateProduct(['Company'], itemHamper, 1)
      }
      else {
        company.Selected = false
        this.dialogOpen = true

      }
    }
  }

  //lưu data cho từng company
  updateDropdownListData(company) {
    if (Ps_UtilObjectService.hasListValue(this.companyData[company])) {
      for (let level = 1; level <= 5; level++) {
        this.listGroupWeb[company] = this.companyData[company][`level${level}`]
      }
    } else {
      this.listGroupWeb[company] = [];
    }
  }




  updateProduct(prop: string[], product = this.Company, type: number) {
    this.loading = true
    //nếu 2 field này trả về null
    if (!Ps_UtilObjectService.hasValue(product.MinDisplay) || !Ps_UtilObjectService.hasValue(product.VATInRate)) {
      product.MinDisplay = 0
      product.VATInRate = 0
    }
    this.configAPIService.UpdateProduct(product, prop).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (type == 1) {
          this.getListApplyCompany(0);
          this.layoutService.onSuccess("Cập nhật thành công công ty áp dụng")
          this.getListGroupWeb(this.gridState, product.Company);
        }
        else if (type == 3) {
          this.getListApplyCompany(1)
        }
        else {
          this.layoutService.onSuccess("Cập nhật thành công phân nhóm cho công ty");
          //get lại để bind lại giá
          this.getListApplyCompany(0);
        }

      }
      else {
        this.companies.forEach(c => {
          if (c.Company == product.Company) {
            c.Selected = false
            this.companyDropdownStates[c.Company] = false
          }
        })

        this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật thông tin Hamper:  ${err}`)
    })
  }


  openDropdown(company, level: number) {
    // this.gridState.filter.filters = []
    // // { field: "level", operator: "eq", value: level},
    // this.gridState.filter.filters.push(
    // { field: "Company", operator: "eq", value: company.Company})
    // this.getListGroupWeb(this.gridState,company.Company)
  }


  getListGroupWeb(state: State, company) {
    this.loading = true
    this.gridState.filter.filters = [{ field: "Company", operator: "eq", value: company }]
    this.hamperServiceAPI.GetListGroup(state).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var filteredData = res.ObjectReturn.Data;
        if (Ps_UtilObjectService.hasListValue(filteredData)) {
          if (!this.companyData[company]) {
            this.companyData[company] = {}
          }
          //load lần đầu bind list lên các dropdown
          for (let level = 1; level <= 5; level++) {
            this.companyData[company][`level${level}`] = filteredData.filter(item => item.Level == level)
          }

          //tìm item có trong listCompany
          const findMatchingItem = (level: number) => {
            const levelData = this.companyData[company][`level${level}`];
            const matchingItem = levelData.find(s => {
              return this.listCompany.some(c => s.Code === c[`GroupID${level}`]);
            });
            return matchingItem;
          };
          //lấy item có trong list company
          for (let level = 1; level <= 4; level++) {
            this[`currentGroupWeb${level}`][company] = findMatchingItem(level);
          }
          //lấy list theo item được bind từ list company
          for (let i = 2; i <= 5; i++) {
            const levelKey = `level${i}`;
            const parentGroupKey = `currentGroupWeb${i - 1}`;
            if (Ps_UtilObjectService.hasValue(this[parentGroupKey][company])) {
              this.companyData[company][levelKey] = filteredData.filter(item => item.ParentID == this[parentGroupKey][company].Code);
            }
          }

          // if (Ps_UtilObjectService.hasListValue(this.listCompany)) {
          //   this.Company = this.listCompany.find(s => s.Company == company)
          //   const itemFormat = {...this.Company,Product: this.hamper.Code}
          //   // for(let i = 1; i <= 5; i++){
          //   //   console.log(this[`currentGroupWeb${i}`][company])
          //   // }
          //   if(Ps_UtilObjectService.hasValue(this.currentGroupWeb2[company]) && Ps_UtilObjectService.hasValue(this.currentGroupWeb1[company]) &&
          //    this.currentGroupWeb2[company].ParentID != this.currentGroupWeb1[company].Code){
          //     itemFormat.GroupID2 = null
          //     itemFormat.GroupID3 = null
          //     itemFormat.GroupID4 = null
          //     itemFormat.GroupID = null
          //     this.updateProduct(['GroupID2','GroupID3','GroupID4','GroupID'],itemFormat,3)
          //   }
          //   else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb3[company]) && Ps_UtilObjectService.hasValue(this.currentGroupWeb2[company]) &&
          //   this.currentGroupWeb3[company].ParentID != this.currentGroupWeb2[company].Code){
          //    itemFormat.GroupID3 = null
          //    itemFormat.GroupID4 = null
          //    itemFormat.GroupID = null
          //    this.updateProduct(['GroupID3','GroupID4','GroupID'],itemFormat,3)
          //   }
          //   else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb4[company]) && Ps_UtilObjectService.hasValue(this.currentGroupWeb3[company]) &&
          //   this.currentGroupWeb4[company].ParentID != this.currentGroupWeb3[company].Code){
          //     itemFormat.GroupID4 = null
          //     itemFormat.GroupID = null
          //     this.updateProduct(['GroupID4','GroupID'],itemFormat,3)
          //   }
          //   else if(Ps_UtilObjectService.hasValue(this.currentGroupWeb5[company]) && Ps_UtilObjectService.hasValue(this.currentGroupWeb4[company]) &&
          //     this.currentGroupWeb5[company].ParentID != this.currentGroupWeb4[company].Code){
          //     itemFormat.GroupID = null
          //     this.updateProduct(['GroupID'],itemFormat,3)
          //   }
          // }


          //Lấy GroupID - phân nhóm 5
          this.currentGroupWeb5[company] = this.companyData[company][`level5`].find(s => {
            return this.listCompany.some(c => s.Code === c.GroupID)
          })

          this.listGroupWeb[company] = filteredData;
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
    })
  }

  deleteProduct(Code: number, Company: number, Product: number) {
    this.loading = true
    this.hamperServiceAPI.DeleteProduct(Code, Company, Product).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.getListApplyCompany(0);
        this.layoutService.onSuccess("Hủy áp dụng thành công Công ty")
        this.companies.forEach(c => {
          if (c.Company == Company) {
            c.Selected = false
            this.companyDropdownStates[c.Company] = false
          }
        })

        for (let level = 1; level <= 5; level++) {
          this[`currentGroupWeb${level}`][Company] = { GroupName: '--Chọn--', Code: null };
        }
        this.currentUnitPrice[Company] = null
        this.dialogOpen = false
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi Hủy áp dụng Công ty:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi Hủy áp dụng Công ty:  ${err}`)
    })
  }

  onDropdownlistClick(event, propName: string[], company) {
    if (Ps_UtilObjectService.hasListValue(this.listCompany)) {
      this.Company = this.listCompany.find(s => s.Company == company)
    }
    const itemFormat = { ...this.Company, Product: this.hamper.Code }
    if (propName[0] == 'GroupID1') {
      //Nếu null thì update tất cả tránh trường hợp load lại vẫn chưa update groupID lại
      itemFormat.GroupID2 = null
      itemFormat.GroupID3 = null
      itemFormat.GroupID4 = null
      itemFormat.GroupID = null
      if (event.Code == null) {
        itemFormat.GroupID1 = null
        this.currentGroupWeb1[company] = null
      }
      else {
        itemFormat.GroupID1 = event.Code
        this.currentGroupWeb1[company] = event
        const listLevel2 = this.listGroupWeb[company].filter(s => s.ParentID == event.Code)
        if (Ps_UtilObjectService.hasListValue(listLevel2)) {
          this.companyData[company].level2 = listLevel2
        } else {
          this.companyData[company].level2 = []
          this.dropdown2.source = []
        }
      }
      this.updateProduct(['GroupID1', 'GroupID2', 'GroupID3', 'GroupID4', 'GroupID'], itemFormat, 2)
      for (let level = 2; level <= 5; level++) {
        this[`currentGroupWeb${level}`][company] = null;
      }

    }
    else if (propName[0] == 'GroupID2') {
      itemFormat.GroupID3 = null
      itemFormat.GroupID4 = null
      itemFormat.GroupID = null
      if (event.Code == null) {
        itemFormat.GroupID2 = null
        this.currentGroupWeb2[company] = null
      }
      else {
        itemFormat.GroupID2 = event.Code
        this.currentGroupWeb2[company] = event
        const listLevel3 = this.listGroupWeb[company].filter(s => s.ParentID == event.Code)
        if (Ps_UtilObjectService.hasListValue(listLevel3)) {
          this.companyData[company].level3 = listLevel3
        } else {
          this.companyData[company].level3 = []
          this.dropdown3.source = []
        }
      }
      this.updateProduct(['GroupID2', 'GroupID3', 'GroupID4', 'GroupID'], itemFormat, 2)

      for (let level = 3; level <= 5; level++) {
        this[`currentGroupWeb${level}`][company] = null;
      }

    }
    else if (propName[0] == 'GroupID3') {
      itemFormat.GroupID4 = null
      itemFormat.GroupID = null
      if (event.Code == null) {
        itemFormat.GroupID3 = null
        this.currentGroupWeb3[company] = null
      }
      else {
        itemFormat.GroupID3 = event.Code
        this.currentGroupWeb3[company] = event
        const listLevel4 = this.listGroupWeb[company].filter(s => s.ParentID == event.Code)
        if (Ps_UtilObjectService.hasListValue(listLevel4)) {
          this.companyData[company].level4 = listLevel4
        } else {
          this.companyData[company].level4 = []
          this.dropdown4.source = []
        }
      }
      this.updateProduct(['GroupID3', 'GroupID4', 'GroupID'], itemFormat, 2)

      this.currentGroupWeb4[company] = null
      this.currentGroupWeb5[company] = null
    }
    else if (propName[0] == 'GroupID4') {
      itemFormat.GroupID = null
      if (event.Code == null) {
        itemFormat.GroupID4 = null
        this.currentGroupWeb4[company] = null
      }
      else {
        itemFormat.GroupID4 = event.Code
        this.currentGroupWeb4[company] = event
        const listLevel5 = this.listGroupWeb[company].filter(s => s.ParentID == event.Code)
        if (Ps_UtilObjectService.hasListValue(listLevel5)) {
          this.companyData[company].level5 = listLevel5
        } else {
          this.companyData[company].level5 = []
          this.dropdown5.source = []
        }
      }
      this.updateProduct(['GroupID4', 'GroupID'], itemFormat, 2)
      this.currentGroupWeb5[company] = null
    }
    else if (propName[0] == 'GroupID') {
      itemFormat.GroupID = event.Code
      this.updateProduct(propName, itemFormat, 2)
      this.currentGroupWeb5[company] = event
    }
  }



  getListCurrency() {
    this.loading = true
    this.hamperServiceAPI.GetListCurrency().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCurrency = res.ObjectReturn
        // this.currency = res.ObjectReturn.filter(s => s.OrderBy = 0)
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${res.ErrorString}`)
      }
      this.loading = false
    }, err => {
      this.loading = false
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách tiền tệ:  ${err}`)
    })
  }

  getCurrencyItem(code: number) {
    var rs = this.listCurrency.find(s => s.Code == code)
    return Ps_UtilObjectService.hasValue(rs) ? rs : this.listCurrency[0]
  }
  // onBlurTextbox(propName:string){
  //   this.updateApplyCompany([propName],this.hamperCompany)
  // }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}



