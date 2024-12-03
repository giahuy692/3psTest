import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { TextAreaComponent } from '@progress/kendo-angular-inputs';
import { CompositeFilterDescriptor, distinct, FilterDescriptor, State } from '@progress/kendo-data-query';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { MenuDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOHRCompetenceBank } from '../../shared/dto/DTOHRCompetenceBank.dto';
import { DTOHRCompetenceCategory } from '../../shared/dto/DTOHRCompetenceCategory.dto';
import { DTOHRCompetenceGuide } from '../../shared/dto/DTOHRCompetenceGuide.dto';
import { DTOHRCompetenceSector, DTOHRCompetenceSectorQuestion } from '../../shared/dto/DTOHRCompetenceSector.dto';
import { HRCompetenceAPIService } from '../../shared/services/hri-competence-api.service';
import { QuestionGroupAPIService } from '../../shared/services/question-api.service';
import { map } from 'rxjs/operators';
import { DTOQuestion } from '../../shared/dto/DTOQuestion.dto';

@Component({
  selector: 'app-hr007-competency-bank',
  templateUrl: './hr007-competency-bank.component.html',
  styleUrls: ['./hr007-competency-bank.component.scss']
})
export class Hr007CompetencyBankComponent implements OnInit, OnDestroy {
  justLoaded: boolean = true
  loading: boolean = false
  isFilterActive: boolean = true
  deleteMode: number = 0
  //tình trạng
  listStatus = [
    {
      StatusName: 'Đang soạn thảo', Checked: true, Filter: [
        { field: 'StatusID', operator: 'eq', value: 0 },
        { field: 'StatusID', operator: 'eq', value: 4 }
      ]
    },
    { StatusName: 'Gửi duyệt', Checked: true, Filter: { field: 'StatusID', operator: 'eq', value: 1 } },
    { StatusName: 'Áp dụng', Checked: true, Filter: { field: 'StatusID', operator: 'eq', value: 2 } },
  ]
  //  
  seriesColors = [
    '#470000',//đỏ 3p
    '#1a6634',//xanh 3p
    '#649e0f',//xanh hachi

    '#ffc000',
    '#5b9bd5',
    '#7030a0',
    '#255e91',
    '#9e480e',
    '#002060',
    '#C0504D',
    '#F79646',
    '#CD7371',
    '#5c6873',//xám
  ]
  //mức
  maturityList: DTOHRCompetenceGuide[] = [
    new DTOHRCompetenceGuide({
      Title: "MỨC ĐỘ TRƯỞNG THÀNH (MATURITY)",
      LevelID: 0,
      Color: "#fff",
      Expand: true
    }),
    new DTOHRCompetenceGuide({
      Title: "Mức 1",
      LevelID: 1,
      Color: "#C0392B"
    }),
    new DTOHRCompetenceGuide({
      Title: "Mức 2",
      LevelID: 2,
      Color: "#E74C3C"
    }),
    new DTOHRCompetenceGuide({
      Title: "Mức 3",
      LevelID: 3,
      Color: "#FFB606"
    }),
    new DTOHRCompetenceGuide({
      Title: "Mức 4",
      LevelID: 4,
      Color: "#62CB31"
    }),
    new DTOHRCompetenceGuide({
      Title: "Mức 5",
      LevelID: 5,
      Color: "#3498DB"
    }),
  ]

  Guide: DTOHRCompetenceGuide = new DTOHRCompetenceGuide()
  //năng lực  
  listCompetence: DTOHRCompetenceBank[] = []
  Competence: DTOHRCompetenceBank = new DTOHRCompetenceBank()
  //khía cạnh
  listAspect: DTOHRCompetenceBank[] = []
  Aspect: DTOHRCompetenceBank = new DTOHRCompetenceBank()
  //mô tả
  Sector: DTOHRCompetenceSector = new DTOHRCompetenceSector()
  //phân nhóm
  listCategory: DTOHRCompetenceCategory[] = []
  Category: DTOHRCompetenceCategory = new DTOHRCompetenceCategory()
  //#region GRID
  pageSize = 4
  //grid category
  gridViewCate = new BehaviorSubject<any>({
    // data: [{ Code: 1 }, { Code: 2 }, { Code: 3 }, { Code: 4 }], total: 4 
  })
  gridStateCate: State = {}

  filterCategoryID: FilterDescriptor = { field: 'CategoryID', operator: 'contains', value: null }
  filterStatus: CompositeFilterDescriptor = { logic: 'or', filters: [] }

  pageChangeCbCate: Function
  //grid competence
  gridStateComp: State = {}
  pageChangeCbComp: Function

  //grid question
  gridStateQuest: State = {
    take: this.pageSize,
  }
  pageChangeCbQuest: Function
  //#endregion
  //permission
  actionPerm: DTOActionPermission[] = []

  isMaster = false
  isCreator = false
  isVerifier = false
  isViewOnly = true
  //callback
  getActionDropdownCallback: Function
  onActionDropdownClickCallback: Function
  uploadEventHandlerCallback: Function

  subArr: Subscription[] = []
  //init
  constructor(public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    public apiService: HRCompetenceAPIService,
    public apiQuestService: QuestionGroupAPIService,
    public menuService: PS_HelperMenuService,
  ) {
  }

  ngOnInit(): void {
    var sst = this.menuService.changePermission().subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
        this.justLoaded = false
        this.actionPerm = distinct(res.ActionPermission, "ActionType")

        this.isMaster = this.actionPerm.findIndex(s => s.ActionType == 1) > -1 || false
        this.isCreator = this.actionPerm.findIndex(s => s.ActionType == 2) > -1 || false
        this.isVerifier = this.actionPerm.findIndex(s => s.ActionType == 3) > -1 || false
        this.isViewOnly = !this.isMaster && !this.isCreator && !this.isVerifier

        // this.maturityList.map(s => {
        //   if (s.LevelID != 0)
        //     this.seriesColors.unshift(s.Color)
        // })

        // this.getData()
      }
    })

    let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
      if(Ps_UtilObjectService.hasValue(res)){
        this.maturityList.map(s => {
          if (s.LevelID != 0)
            this.seriesColors.unshift(s.Color)
        })
        this.getData();
      }
    })
    this.subArr.push(sst, permissionAPI)
    //callback
    this.getActionDropdownCallback = this.getActionDropdown.bind(this)
    this.onActionDropdownClickCallback = this.onClickActionDropdown.bind(this)
    this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this);
    //pagechange    
    this.pageChangeCbCate = this.pageChangeCate.bind(this)
    this.pageChangeCbComp = this.pageChangeComp.bind(this)
    this.pageChangeCbQuest = this.pageChangeQuest.bind(this)
  }

  ngOnDestroy(): void {
    this.subArr.map(s => s?.unsubscribe())
  }

  //
  getData() {
    this.GetListCompetenceGuide()
    this.loadFilterCate()
    this.GetListCompetenceCategory()
  }
  //API  
  //mức trưởng thành
  GetListCompetenceGuide(state: State = {}) {
    this.loading = true;
    let ctx = 'Lấy danh sách Mức độ trưởng thành'

    let sst = this.apiService.GetListCompetenceGuide(state).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasListValue(res.ObjectReturn) && res.StatusCode == 0) {
        var temp: DTOHRCompetenceGuide[] = res.ObjectReturn.Data

        temp.map((s) => {
          var item = this.maturityList.find(f => f.LevelID == s.LevelID)
          if (Ps_UtilObjectService.hasValue(item))
            Ps_UtilObjectService.copyProperty(s, item)
        })
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceGuide(dto: DTOHRCompetenceGuide) {
    this.loading = true;
    let ctx = 'Cập nhật Mức độ trưởng thành'

    let sst = this.apiService.UpdateCompetenceGuide(dto).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        dto = res.ObjectReturn;
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //phân nhóm
  GetListCompetenceCategory(state: State = this.gridStateCate) {
    this.loading = true;
    let ctx = 'Lấy danh sách Phân nhóm năng lực'

    let sst = this.apiService.GetListCompetenceCategory(state).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var temp: DTOHRCompetenceCategory[] = res.ObjectReturn.Data
        //tạo gridView mặc định cho kết quả trả về
        temp = temp.map(s => {
          s['gridView'] = { data: s.ListCompetence ?? [], total: (s.ListCompetence ?? []).length, skip: 0, take: 4 }
          this.Category = { ...s }
          this.loadCateComp(0, 4)
          s = { ...this.Category }
          return s
        })
        //toggle đóng/mở mặc định cho phân nhóm
        this.listCategory = this.listCategory.map(s => {
          s.Expand = s.Expand == true
          s['gridView'] = Ps_UtilObjectService.hasValue(s['gridView']) ? s['gridView']
            : { data: s.ListCompetence ?? [], total: (s.ListCompetence ?? []).length, skip: 0, take: 4 }

          var t = temp.find(f => f.Code == s.Code)

          if (Ps_UtilObjectService.hasValue(t)) {
            t.Expand = s.Expand
            //lấy theo dữ liệu mới
            s['gridView'].data = t['gridView'].data
            s['gridView'].total = t['gridView'].total
            //lấy theo phân trang cũ
            t['gridView'].skip = s['gridView'].skip
            t['gridView'].take = s['gridView'].take
            //toggle đóng/mở mặc định cho năng lực
            s.ListCompetence = s.ListCompetence.map(sc => {
              sc.Expand = sc.Expand == true

              if (sc.Expand == true) {
                var tc = t.ListCompetence.find(f => f.Code == sc.Code)

                if (Ps_UtilObjectService.hasValue(tc)) {
                  tc.Expand = sc.Expand
                  //bind lại khía cạnh        
                  if (Ps_UtilObjectService.hasListValue(tc.ListChild)) {
                    sc.ListChild = sc.ListChild.map(sa => {
                      var ta = tc.ListChild.find(f => f.Code == sa.Code)

                      if (Ps_UtilObjectService.hasValue(ta)) {
                        ta = { ...sa }
                        //bind lại sector
                        // ta.ListSector = sa.ListSector
                      }
                      return sa
                    })
                  } else
                    tc.ListChild = sc.ListChild
                }
              } else
                sc.Expand = false
              return sc
            })
          }
          return s
        })
        //gán kết quả cuối cùng
        this.listCategory = temp
        // console.log(this.listCategory, temp)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceCategory(dto: DTOHRCompetenceCategory) {
    this.loading = true;
    let ctx = 'Cập nhật Phân nhóm năng lực'

    let sst = this.apiService.UpdateCompetenceCategory(dto).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Category = dto = res.ObjectReturn;
        this.GetListCompetenceCategory()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceCategoryStatus(list: DTOHRCompetenceCategory[], status: number) {
    this.loading = true;
    var dto = list[0]
    let ctx = 'Cập nhật tình trạng Phân nhóm'

    let sst = this.apiService.UpdateCompetenceCategoryStatus(list, status).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.Category = dto
        this.GetListCompetenceCategory()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  DeleteCompetenceCategory(list: DTOHRCompetenceCategory[]) {
    this.loading = true;
    let ctx = 'Xóa phân nhóm'

    let sst = this.apiService.DeleteCompetenceCategory(list).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && res.StatusCode == 0) {
        this.deleteDialogShown = false
        this.GetListCompetenceCategory()
        this.Category = new DTOHRCompetenceCategory()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //khía cạnh, năng lực
  GetListCompetenceBank(state: State = {}, competence?: DTOHRCompetenceBank) {
    this.loading = true;
    let ctx = 'Lấy danh sách Khía cạnh'

    let sst = this.apiService.GetListCompetenceBank(state).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listCompetence = res.ObjectReturn.Data

        if (Ps_UtilObjectService.hasValue(competence)) {
          competence.ListChild = res.ObjectReturn.Data

          var cate = this.listCategory.find(s => s.Code == competence.Category)

          if (Ps_UtilObjectService.hasValue(cate)) {
            var comp = cate.ListCompetence.find(s => s.Code == competence.Code)

            if (Ps_UtilObjectService.hasValue(comp))
              comp.ListChild = res.ObjectReturn.Data
          }
        }
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceBank(dto: DTOHRCompetenceBank) {
    this.loading = true;
    let ctx = 'Cập nhật ' + (Ps_UtilObjectService.hasValue(dto.Parent) ? 'Khía cạnh' : 'năng lực')

    let sst = this.apiService.UpdateCompetenceBank(dto).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        dto = res.ObjectReturn;

        if (!Ps_UtilObjectService.hasValue(dto.Parent)) {
          this.Competence = dto
          this.GetListCompetenceCategory()
        }
        else {
          this.Aspect = dto

          this.GetListCompetenceBank({
            filter: {
              logic: 'and', filters: [{
                field: 'Parent',
                operator: 'eq',
                value: this.Competence.Code
              }]
            },
            // sort: [{ field: 'OrderBy', dir: 'desc' }, { field: 'Code', dir: 'desc' }],
          }, this.Competence)
        }

        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceBankStatus(list: DTOHRCompetenceBank[], status: number) {
    this.loading = true;
    var dto = list[0]
    let ctx = 'Cập nhật tình trạng ' + (Ps_UtilObjectService.hasValue(dto.Parent) ? 'Khía cạnh' : 'năng lực')

    let sst = this.apiService.UpdateCompetenceBankStatus(list, status).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        if (!Ps_UtilObjectService.hasValue(dto.Parent)) {
          this.Competence = dto
          this.GetListCompetenceCategory()
        }
        else {
          this.Aspect = dto

          this.GetListCompetenceBank({
            filter: {
              logic: 'and', filters: [{
                field: 'Parent',
                operator: 'eq',
                value: this.Competence.Code
              }]
            },
            // sort: [{ field: 'OrderBy', dir: 'desc' }, { field: 'Code', dir: 'desc' }],
          }, this.Competence)
        }

        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  DeleteCompetenceBank(list: DTOHRCompetenceBank[]) {
    this.loading = true;
    let dto = list[0]
    let ctx = 'Xóa ' + Ps_UtilObjectService.hasValue(dto.Parent) ? 'Khía cạnh' : 'năng lực'

    let sst = this.apiService.DeleteCompetenceBank(list).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && res.StatusCode == 0) {
        this.deleteDialogShown = false

        if (!Ps_UtilObjectService.hasValue(dto.Parent)) {
          this.GetListCompetenceCategory()
        }
        else {
          this.GetListCompetenceBank({
            filter: {
              logic: 'and', filters: [{
                field: 'Parent',
                operator: 'eq',
                value: this.Competence.Code
              }]
            },
            // sort: [{ field: 'OrderBy', dir: 'desc' }, { field: 'Code', dir: 'desc' }],
          }, this.Competence)
        }

        this.Competence = this.Aspect = dto = new DTOHRCompetenceBank()
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //Mức khía cạnh năng lực
  GetListCompetenceSector(state: State = {}, aspect?: DTOHRCompetenceBank) {
    this.loading = true;
    let ctx = 'Lấy danh sách Mức trưởng thành của Khía cạnh'

    let sst = this.apiService.GetListCompetenceSector(state).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var temp: DTOHRCompetenceSector[] = res.ObjectReturn.Data

        // if (Ps_UtilObjectService.hasValue(aspect)) {
        //   this.maturityList.filter(s => s.LevelID > 0).map((s, i) => {
        //     var sector = temp.find(f => f.LevelID == s.LevelID)
        //     //nếu sector với LevelID trên ko tồn tại trong competence thì tạo mới
        //     if (!Ps_UtilObjectService.hasValue(sector)) {
        //       sector = new DTOHRCompetenceSector({ Competence: aspect.Code, LevelID: s.LevelID })
        //     }
        //     aspect.ListSector[i] = sector
        //     this.Aspect.ListSector[i] = sector
        //   })
        // }

        var cate = this.listCategory.find(s => s.Code == this.Competence.Category)

        if (Ps_UtilObjectService.hasValue(cate)) {
          var comp = cate.ListCompetence.find(s => s.Code == this.Competence.Code)

          if (Ps_UtilObjectService.hasValue(comp)) {
            var aspect = comp.ListChild.find(s => s.Code == this.Aspect.Code)

            if (Ps_UtilObjectService.hasValue(aspect)) {
              temp.forEach(t => {
                var sector = aspect.ListSector.find(s => s.LevelID == t.LevelID)

                if (Ps_UtilObjectService.hasValue(sector)) {
                  Ps_UtilObjectService.copyPropertyForce(t, sector)
                }
              })
            }
          }
        }
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateCompetenceSector(dto: DTOHRCompetenceSector) {
    this.loading = true;
    let ctx = 'Cập nhật Mức trưởng thành của Khía cạnh'

    let sst = this.apiService.UpdateCompetenceSector(dto).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.Sector = dto = res.ObjectReturn;

        this.GetListCompetenceSector({
          filter: {
            logic: 'and', filters: [{
              field: 'Competence',
              operator: 'eq',
              value: this.Aspect.Code
            }]
          },
        }, dto.Competence > 0 ? this.Aspect : null)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //Câu hỏi cho năng lực
  GetListSectorQuestion(state?: State) {
    this.loading = true;
    let ctx = 'Lấy danh sách Câu hỏi của Mức khía cạnh'

    let sst = this.apiService.GetListSectorQuestion(state).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        var temp = res.ObjectReturn.Data

        // if (Ps_UtilObjectService.hasValue(competence)) {
        //   this.maturityList.filter(s => s.LevelID > 0).map((s, i) => {
        //     var sector = temp.find(f => f.LevelID == s.LevelID)
        //     //nếu sector với LevelID trên ko tồn tại trong competence thì tạo mới
        //     if (!Ps_UtilObjectService.hasValue(sector)) {
        //       sector = new DTOHRCompetenceSector({ Competence: competence.Code, LevelID: s.LevelID })
        //     }
        //     competence.ListSector[i] = sector
        //   })
        // }
        this.Sector.ListQuestion = temp
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  UpdateQuestionCompetence(dto: DTOHRCompetenceSectorQuestion) {
    this.loading = true;
    let ctx = 'Cập nhật Câu hỏi của Mức khía cạnh'

    let sst = this.apiQuestService.UpdateQuestionCompetence(dto).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        // if (Ps_UtilObjectService.hasValue(this.Sector)) {
        //   if (dto.Code == 0)
        //     this.Sector.ListQuestion.unshift(res.ObjectReturn)
        // }
        dto = res.ObjectReturn
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.GetListSectorQuestion(this.gridStateQuest)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.GetListSectorQuestion(this.gridStateQuest)
      this.loading = false;
    })
    this.subArr.push(sst)
  }

  DeleteQuestionCompetence(list: DTOHRCompetenceSectorQuestion[] = [this.Question]) {
    this.loading = true;
    let ctx = 'Xóa Câu hỏi của năng lực'

    let sst = this.apiQuestService.DeleteQuestionCompetence(list).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.deleteDialogShown = false
        this.Question = new DTOHRCompetenceSectorQuestion()

        var temp = this.Sector.ListQuestion.filter(s => list.findIndex(f => f.Code != s.Code) != -1)
        this.Sector.ListQuestion = temp
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //Ngân hàng câu hỏi  
  GetListQuestion(state: State = {}, comp: number = this.Competence.Code) {
    this.loading = true;
    let ctx = 'Lấy danh sách Câu hỏi'

    let sst = this.apiQuestService.GetListCompetenceQuestion(state, comp).subscribe(res => {
      if (Ps_UtilObjectService.hasListValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
        this.listQuestion = res.ObjectReturn.Data
      } else
        this.layoutService.onError(`${ctx} thất bại: ${res.ErrorString}`)
      this.loading = false;
    }, e => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${e}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //excel
  DownloadExcel() {
    this.loading = true
    var ctx = "Download Excel Template"
    var getfileName = "CompetenceBankTemplate.xlsx"
    this.layoutService.onInfo(`Đang xử lý ${ctx}`)

    let sst = this.layoutApiService.GetTemplate(getfileName).subscribe(res => {
      if (res != null) {
        Ps_UtilObjectService.getFile(res, getfileName)
      } else {
        this.layoutService.onError(`${ctx} thất bại`)
      }
      this.loading = false;
    }, f => {
      this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f?.error?.ExceptionMessage)
      this.loading = false;
    });
    this.subArr.push(sst)
  }

  ImportExcel(file) {
    this.loading = true
    var ctx = "Import Excel"

    let sst = this.apiService.ImportExcelCompetenceCategory(file).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.GetListCompetenceCategory()
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.layoutService.setImportDialogMode(1)
        this.layoutService.setImportDialog(false)
        this.layoutService.getImportDialogComponent().inputBtnDisplay()
      } else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    })
    this.subArr.push(sst)
  }
  //#region Header
  selectedBtnChange(e, i) {
    this.listStatus[i].Checked = e

    this.loadFilterCate()
    this.GetListCompetenceCategory()
  }

  onImportExcel() {
    console.log('import')
    this.layoutService.setImportDialog(true)
  }
  uploadEventHandler(e: File) {
    this.ImportExcel(e)
  }

  loadFilterCate() {
    let that = this//dùng cái này để tránh filterStatus.filters bị dup do this scope

    this.gridStateCate = {
      // sort: [{ field: 'OrderBy', dir: 'desc' }],
      filter: { logic: 'and', filters: [] }
    }
    that.filterStatus.filters = []
    //search
    if (Ps_UtilObjectService.hasValueString(this.filterCategoryID.value))
      this.gridStateCate.filter.filters.push(this.filterCategoryID)

    //status
    this.listStatus.forEach((s, i) => {
      if (s.Checked) {
        if (i == 0) {
          that.filterStatus.filters = [...s.Filter as Array<any>]
        }
        else {
          that.filterStatus.filters.push(s.Filter as any)
        }
      }
    });
    //
    if (Ps_UtilObjectService.hasListValue(this.filterStatus))
      this.gridStateCate.filter.filters.push(this.filterStatus)
  }

  search(e) {
    if (Ps_UtilObjectService.hasValueString(e)) {
      this.filterCategoryID.value = e
    }
    else {
      this.filterCategoryID.value = null
    }

    this.loadFilterCate()
    this.GetListCompetenceCategory()
  }

  resetFilter() {
    this.listStatus.map(s => s.Checked = true)
    this.search(null)
  }
  //#endregion

  //#region MỨC ĐỘ TRƯỞNG THÀNH
  toggleMaturity(open: boolean) {
    this.maturityList[0].Expand = open
  }

  onDoubleClick(type: number, ele, e: any, ee?: any, eee?: any, eeee?: any) {
    var comp: TextAreaComponent = ele
    var canEdit = e.StatusID == 0 || e.StatusID == 4

    switch (type) {
      case 0://DTOHRCompetenceGuide.toString():
        comp.readonly = false
        this.Guide = { ...e }
        break
      case 1://DTOHRCompetenceCategory.toString():
        if (canEdit)
          comp.readonly = false
        this.Category = { ...e }
        break
      case 2://DTOHRCompetenceBank.toString():
        if (Ps_UtilObjectService.hasValue(e.Parent)) {
          if (canEdit)
            comp.readonly = false
          this.Aspect = { ...e }

          if (Ps_UtilObjectService.hasValue(ee))
            this.Competence = { ...ee }
          if (Ps_UtilObjectService.hasValue(eee))
            this.Category = { ...eee }
        }
        else {
          if (canEdit)
            comp.readonly = false
          this.Competence = { ...e }

          if (Ps_UtilObjectService.hasValue(ee))
            this.Category = { ...ee }
        }
        break
      case 3://DTOHRCompetenceSector.toString():
        this.Sector = { ...e }
        if (Ps_UtilObjectService.hasValue(ee))
          this.Aspect = { ...ee }
        if (Ps_UtilObjectService.hasValue(eee))
          this.Competence = { ...eee }
        if (Ps_UtilObjectService.hasValue(eeee))
          this.Category = { ...eeee }
        if (this.Aspect.StatusID == 0 || this.Aspect.StatusID == 4)
          comp.readonly = false
        break
    }

    return comp
  }

  onBlur(ele, item, type: number, parent?) {
    var comp: TextAreaComponent = ele

    if (!comp.readonly) {
      switch (type) {
        case 1:
          this.UpdateCompetenceGuide(item)
          break
        case 2:
          this.UpdateCompetenceCategory(item)
          break
        case 3:
          if (Ps_UtilObjectService.hasValue(parent))
            this.Category = parent
          this.UpdateCompetenceBank(item)
          break
        case 4:
          if (Ps_UtilObjectService.hasValue(parent)) {
            this.Competence = parent
            item.Category == this.Competence.Category
            // item.Competence = item.CompetenceID
          }
          this.UpdateCompetenceBank(item)
          break
        case 5:
          if (Ps_UtilObjectService.hasValue(parent))
            this.Aspect = parent
          this.UpdateCompetenceSector(item)
          break
      }
      comp.readonly = true
    }
    return comp
  }
  //#endregion

  //#region PHÂN NHÓM NĂNG LỰC  
  mouseenterCategory(cate) {
    this.Category = this.listCategory.find(s => s.Code == cate.Code)
  }

  pageChangeCate(event: PageChangeEvent) {
    this.gridStateCate.skip = event.skip;
    this.gridStateCate.take = this.pageSize = event.take
    this.GetListCompetenceCategory()
  }

  onAddCategory() {
    this.Category = new DTOHRCompetenceCategory()
    this.listCategory.unshift(this.Category)
  }

  toggleCategory(category: DTOHRCompetenceCategory, index: number = 0) {
    this.Category = category
    category['Expand'] = !category['Expand']

    if (category['Expand'] == false)
      category

    this.listCategory[index]['Expand'] = category['Expand']

    return category
  }

  onUpdateCategoryStatus(category: DTOHRCompetenceCategory, status: number) {
    this.Category = category

    if ((status == 2 || status == 1) && !this.isValidCategory(category))
      return

    this.UpdateCompetenceCategoryStatus([category], status)
  }

  isValidCategory(category: DTOHRCompetenceCategory = this.Category) {
    var rs = false

    if (Ps_UtilObjectService.hasValueString(category.CategoryID)
      && Ps_UtilObjectService.hasValueString(category.CategoryName)
      && Ps_UtilObjectService.hasListValue(category.ListCompetence))
      rs = true

    if (!rs)
      this.layoutService.onError(`Phân nhóm ${category.CategoryID}, ${category.CategoryName} không đầy đủ thông tin`)

    return rs
  }

  onDeleteCategory(category: DTOHRCompetenceCategory) {
    if (category.Code != 0) {
      this.deleteMode = 1
      this.deleteDialogShown = true
      this.Category = category
    } else {
      this.listCategory.shift()
    }
  }
  //#endregion

  //#region DANH SÁCH NĂNG LỰC  
  loadCateComp(skip, take): void {
    this.Category['gridView'] = {
      data: this.Category.ListCompetence.slice(skip, skip + this.pageSize),
      total: this.Category.ListCompetence.length,
      skip: skip,
      take: take
    };
  }

  pageChangeComp(event: PageChangeEvent) {
    this.loadCateComp(event.skip, event.take)
    // this.GetListCompetenceBank(this.gridStateComp)
  }

  toggleCompetence(competence: DTOHRCompetenceBank, index?: number) {
    this.Competence = competence
    competence['Expand'] = !competence['Expand']

    var Category = this.listCategory.find(s => s.Code == competence.Category)

    if (!Ps_UtilObjectService.hasValue(index)) {
      index = Category.ListCompetence?.findIndex(s => s.Code == competence.Code)
    }

    if (Ps_UtilObjectService.hasValue(Category) && Ps_UtilObjectService.hasListValue(Category.ListCompetence))
      Category.ListCompetence[index]['Expand'] = competence['Expand']

    if (competence['Expand'] == false)
      competence
    else {
      var state: State = {
        filter: {
          logic: 'and', filters: [{
            field: 'Parent',
            operator: 'eq',
            value: this.Competence.Code
          }]
        },
        // sort: [{ field: 'Code', dir: 'desc' }],
      }
      this.GetListCompetenceBank(state, competence)
    }

    return competence
  }
  //grid
  getActionDropdown(moreActionDropdown: MenuDataItem[], dataItem: any) {//todo
    this.Competence = { ...dataItem };
    var statusID = dataItem.StatusID || 0;
    moreActionDropdown = [{ Name: dataItem['Expand'] == true ? "Ẩn chi tiết" : "Xem chi tiết", Code: "eye", Link: "detail", Actived: true }];

    if ((statusID == 0 || statusID == 4) && (this.isMaster || this.isCreator)) {
      moreActionDropdown.push(
        { Name: "Gửi duyệt", Code: "redo", Type: 'StatusID', Link: "1", Actived: true },
      )
    }
    else if ((statusID == 1 || statusID == 3) && (this.isMaster || this.isCreator)) {
      moreActionDropdown.push(
        { Name: "Áp dụng", Code: "check-outline", Type: 'StatusID', Link: "2", Actived: true },
      )
    }
    else if ((statusID == 2 || statusID == 3) && (this.isMaster || this.isVerifier)) {
      moreActionDropdown.push(
        { Name: "Trả về", Code: "undo", Type: 'StatusID', Link: "4", Actived: true }
      )
    }
    // Display Delete Button
    if ((statusID == 0) && (this.isMaster || this.isCreator))
      moreActionDropdown.push({ Name: "Xóa", Code: "trash", Type: 'delete', Actived: true })
    // Return Array After Checking Conditions 
    return moreActionDropdown
  }

  onClickActionDropdown(menu: MenuDataItem, item: any) {//todo
    // Copy data of selected item
    this.Competence = { ...item }
    // Check Type Of Selected Button
    ////> If Send To Verify Clicked
    if (this.Competence.Code != 0 && menu.Type == 'StatusID') {
      var status = parseInt(menu.Link)
      this.onUpdateCompetenceStatus(item, status)
    }
    ////> If Edit Or Detail Button Clicked, Open Detail Page
    else if (this.Competence.Code != 0 && (menu.Type == 'edit' || menu.Code == 'pencil' || menu.Code == "eye" || menu.Type == 'detail')) {
      if (this.Competence.Code != 0)
        this.toggleCompetence(item)
    }
    ////> If Delete Button Clicked, Execute onDelete()
    else if (menu.Type == 'delete' || menu.Code == 'trash') {
      this.onDeleteCompetence(item)
    }
  }

  isValidCompetence(competence: DTOHRCompetenceBank = this.Competence) {
    var rs = false

    if (Ps_UtilObjectService.hasValueString(competence.Competence)
      && Ps_UtilObjectService.hasValueString(competence.CompetenceID)
      && Ps_UtilObjectService.hasValueString(competence.Remark)
      // && Ps_UtilObjectService.hasListValue(competence.ListChild)
      // && competence.ListChild.find(s => !Ps_UtilObjectService.hasListValue(s.ListSector)) == undefined
      //tạm cho phép duyệt mà ko cần câu hỏi
      //&& competence.ListChild.find(s => s.ListSector?.find(f => f.Code > 0 && !Ps_UtilObjectService.hasListValue(f.ListQuestion))) == undefined
    )
      rs = true

    if (!rs)
      this.layoutService.onError(`Năng lực ${competence.CompetenceID}, ${competence.Competence} không đầy đủ thông tin`)

    return rs
  }

  onAddCompetence(category: DTOHRCompetenceCategory) {
    this.Category = category
    this.Competence = new DTOHRCompetenceBank()
    this.Competence.Category = this.Category.Code
    this.Category.ListCompetence.unshift(this.Competence)
    this.loadCateComp(category['gridView'].skip, category['gridView'].take)
  }

  onUpdateCompetenceStatus(competence: DTOHRCompetenceBank, status: number) {
    this.Competence = competence

    if ((status == 2 || status == 1) && !this.isValidCompetence(competence))
      return

    this.UpdateCompetenceBankStatus([competence], status)
  }

  onDeleteCompetence(competence: DTOHRCompetenceBank) {
    if (competence.Code != 0) {
      this.deleteMode = 2
      this.deleteDialogShown = true
      this.Competence = competence
    } else {
      this.Category = this.listCategory.find(s => s.Code == competence.Category)
      this.Category.ListCompetence.shift()
      this.loadCateComp(this.Category['gridView'].skip, this.Category['gridView'].take)
    }
  }
  //#endregion

  //#region KHÍA CẠNH ĐÁNH GIÁ
  toggleAspect(aspect: DTOHRCompetenceBank, index: number) {
    if (aspect.Code != 0) {
      this.Aspect = aspect
      aspect['Expand'] = !aspect['Expand']

      if (aspect['Expand'] == false)
        aspect
      else {
        var state: State = {
          filter: {
            logic: 'and', filters: [{
              field: 'Competence',
              operator: 'eq',
              value: aspect.Code
            }]
          },
        }
        // this.GetListCompetenceSector(state, aspect)
      }
    }
    return aspect
  }

  onAddAspect(competence: DTOHRCompetenceBank) {
    this.Competence = competence
    this.Aspect = new DTOHRCompetenceBank()
    this.Aspect.Parent = this.Competence.Code
    this.Competence.ListChild.unshift(this.Aspect)
  }

  onDeleteAspect(aspect: DTOHRCompetenceBank, competence: DTOHRCompetenceBank) {
    this.Competence = competence

    if (aspect.Code != 0) {

      if (aspect.ListSector.find(s => Ps_UtilObjectService.hasListValue(s.ListQuestion)) != undefined) {
        this.layoutService.onError(`Khía cạnh ${aspect.CompetenceID}, ${aspect.Competence} này có Mức trưởng thành đã gắn Câu hỏi. Không thể xóa`)
        return
      }

      this.deleteMode = 3
      this.deleteDialogShown = true
      this.Aspect = aspect
    } else {
      this.Category = this.listCategory.find(s => s.ListCompetence.findIndex(f => { if (f.Code == aspect.Parent) { this.Competence = f; return true } }) != -1)
      this.Competence.ListChild.shift()
    }
  }

  getQuestionRatio(sector: DTOHRCompetenceSector, aspect: DTOHRCompetenceBank) {
    if (Ps_UtilObjectService.hasListValue(sector.ListQuestion)) {
      var sumQuestion = aspect.ListSector.reduce((a, b) => a + (b.ListQuestion?.length || 0), 0);

      if (sumQuestion > 0)
        return sector.ListQuestion.length * 100 / sumQuestion
    }

    return null;
  }
  //#endregion

  //#region DANH SÁCH CÂU HỎI
  isDialogQuestionList: boolean = false
  deleteDialogShown: boolean = false
  @ViewChild("combobox", { static: true }) combobox: ComboBoxComponent;

  queryQuestion: string = null
  listQuestion: DTOQuestion[] = []

  currentQuestion: DTOHRCompetenceSectorQuestion = new DTOHRCompetenceSectorQuestion()
  Question: DTOHRCompetenceSectorQuestion = new DTOHRCompetenceSectorQuestion()
  //
  loadFilterQuestion() {
    let that = this//dùng cái này để tránh filterStatus.filters bị dup do this scope

    this.gridStateQuest = {
      filter: {
        logic: 'and',
        filters: [{
          field: 'CompetenceSector',
          operator: 'eq',
          value: that.Sector.Code
        }]
      },
      take: that.gridStateQuest.take,
      skip: that.gridStateQuest.skip,
    }
  }

  pageChangeQuest(event: PageChangeEvent) {
    this.gridStateQuest.skip = event.skip;
    this.gridStateQuest.take = event.take
    this.GetListSectorQuestion(this.gridStateQuest)
  }

  toggleDialogQuestionList(open: boolean, sector?: DTOHRCompetenceSector, aspect?: DTOHRCompetenceBank, comp?: DTOHRCompetenceBank, cate?: DTOHRCompetenceCategory) {
    if (Ps_UtilObjectService.hasValue(sector))
      this.Sector = sector
    if (Ps_UtilObjectService.hasValue(aspect))
      this.Aspect = aspect
    if (Ps_UtilObjectService.hasValue(comp))
      this.Competence = comp
    if (Ps_UtilObjectService.hasValue(cate))
      this.Category = cate

    this.isDialogQuestionList = open

    if (open) {
      this.loadFilterQuestion()
      this.GetListSectorQuestion(this.gridStateQuest)
      this.searchQuestion(this.queryQuestion)
    }
  }

  toggleCombobox(e) {
    if (!this.combobox.isOpen)
      this.combobox.toggle(true)
  }

  filterChange(e) {
    this.toggleCombobox(e)
  }

  valueChange(e: DTOHRCompetenceSectorQuestion) {
    if (Ps_UtilObjectService.hasValue(e)) {
      this.queryQuestion = e.QuestionID
    }
  }

  valueNormalizer = (text: Observable<string>) =>//parse customValue thành object cho combobox dùng
    text.pipe(
      map((content: string) => {
        return new DTOHRCompetenceSectorQuestion({
          Code: 0,
          Remark: content,
          QuestionID: content,
          Question: content
        })
      })
    );

  searchQuestion(e?) {
    let that = this

    var state: State = {
      filter: {
        logic: 'and',
        filters: []
      }
    }
    // state.filter.filters.push({ field: 'StatusID', operator: 'eq', value: 2 })
    //filter tìm kiếm
    if (Ps_UtilObjectService.hasValue(e) && Ps_UtilObjectService.hasValue(e.target) && Ps_UtilObjectService.hasValueString(e.target.value)) {
      let query = e.target.value

      var filterSearch: CompositeFilterDescriptor = {
        logic: 'or',
        filters: [
          { field: 'Remark', operator: 'contains', value: query },
          { field: 'QuestionID', operator: 'contains', value: query },
          { field: 'CategoryName', operator: 'contains', value: query },
          { field: 'TypeOfEvaluationName', operator: 'contains', value: query },
          { field: 'TypeOfQuestionName', operator: 'contains', value: query },
        ]
      }
      state.filter.filters.push(filterSearch)
    }
    //gọi api
    that.GetListQuestion(state)
  }

  selectChange(e: DTOHRCompetenceSectorQuestion) {
    if (Ps_UtilObjectService.hasValue(e))
      this.currentQuestion = e
  }

  addQuestion() {
    let item = new DTOHRCompetenceSectorQuestion()
    item.Question = this.currentQuestion.Code
    item.Competence = this.Sector.Competence
    item.CompetenceSector = this.Sector.Code
    item.LevelID = this.Sector.LevelID

    this.UpdateQuestionCompetence(item)
  }

  onDeleteQuestion(e: DTOHRCompetenceSectorQuestion) {
    this.deleteDialogShown = true
    this.deleteMode = 4
    this.Question = e
  }

  //#endregion
  Delete() {
    switch (this.deleteMode) {
      case 1:
        this.DeleteCompetenceCategory([this.Category])
        break;
      case 2:
        this.DeleteCompetenceBank([this.Competence])
        break;
      case 3:
        this.DeleteCompetenceBank([this.Aspect])
        break;
      case 4:
        this.DeleteQuestionCompetence([this.Question])
        break
    }
  }
}
