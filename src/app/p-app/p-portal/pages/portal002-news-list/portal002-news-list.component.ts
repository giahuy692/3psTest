import { Component, ElementRef, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { faL } from '@fortawesome/free-solid-svg-icons';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import DTOMANews_ObjReturn, { DTOMACategory, DTOMAPost_ObjReturn } from 'src/app/p-app/p-marketing/shared/dto/DTOMANews.dto';
import { MarNewsAPIService } from 'src/app/p-app/p-marketing/shared/services/mar-news-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Component({
  selector: 'app-portal002-news-list',
  templateUrl: './portal002-news-list.component.html',
  styleUrls: ['./portal002-news-list.component.scss']
})
export class Portal002NewsListComponent {

  // variable input text search
  placeholder: string = 'Tìm theo bài viết'
  isFilterActive: boolean = true
  //////////////////////////////////////////

  // variable filter get list new
  curentDate: Date = new Date()

  filterPostDate: FilterDescriptor = {
    field: 'PostDate', operator: 'lte', value: this.curentDate
  }

  filterNewsStatus: FilterDescriptor = {
    field: 'StatusID', operator: 'eq', value: 2
  }

  filterCate: FilterDescriptor = {
    field: 'NewsCategory', operator: 'eq', value: 0
  }

  filterListNew: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [
      this.filterNewsStatus, this.filterPostDate
    ]
  }

  sortBy: SortDescriptor[] = [{ field: 'PostDate', dir: 'desc' }]

  stateListNews: State = {
    filter: this.filterListNew,
    take: 5,
    skip: 0,
    sort: this.sortBy
  }
  /////////////////////////////////

  // array list new and list cate
  listNew: DTOMAPost_ObjReturn[] = []
  listCategory: DTOMACategory[] = []

  /////////////////////////////////////

  // array catenew
  categorizedNews: { category: string, new: any[], total: number }[] = [];
  //////////////////////////////////////////////////////////

  // unssubcribe 
  ngUnsubscribe = new Subject<void>();
  ///////////////////////////////////////


  constructor(public layoutService: LayoutService, private apiMarketing: MarNewsAPIService, private menuService: PS_HelperMenuService) {
  }


  ngOnInit() {
    this.APIGetListCMSCategory()
    //this.APIGetListNews()
  }

  //#region Hàm gọi API

  APIGetListCMSCategory() {
    this.apiMarketing.GetListCMSNewsCategory(7).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.listCategory = res.ObjectReturn
        for (let i = 0; i < this.listCategory.length; i++) {
          this.filterListNew.filters = [this.filterNewsStatus, this.filterPostDate]
          this.filterCate.value = this.listCategory[i].Code
          this.filterListNew.filters.push(this.filterCate)
          this.APIGetListCMSNews()
        }

      }
      else {
        this.layoutService.onError(`'Đã xảy ra lỗi khi lấy danh sách phân nhóm:' + ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`'Đã xảy ra lỗi khi lấy danh sách phân nhóm:' + ${err}`)
    })

  }

  listTotalNews: { cate: string, total: number }[] = [] // biến lưu danh sách total new api trả về
  APIGetListCMSNews() {
    this.apiMarketing.GetListCMSNews(this.stateListNews).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode === 0) {
        this.listNew.push(...res.ObjectReturn.Data)
        this.listTotalNews.push({ cate: res.ObjectReturn.Data[0]?.NewsCategoryName, total: res.ObjectReturn.Total });
        this.categorizedNews = this.listCategory.map((category) => ({

          category: category.NewsCategory,
          new: this.listNew.filter(item => item.NewsCategoryName === category.NewsCategory),
          total: this.listTotalNews.find(item => item.cate === category.NewsCategory)?.total || 0

        })).filter(category => category.new.length > 0);

      }

      else {
        this.layoutService.onError(`'Đã xảy ra lỗi khi lấy danh sách chính sách:' + ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`'Đã xảy ra lỗi khi lấy danh sách chính sách:' + ${err}`)
    })
  }

  //#endregion 

  //#region nút xem thêm hiển thị 5 item   
  textExpandCollapse: string = ' Xem thêm'
  tempCodeCate: number = 0

  expandcopllapeToogle(codeCate: any) {

    if (this.tempCodeCate === 0 || this.tempCodeCate === codeCate) {
      this.tempCodeCate = codeCate;
    }
    else {
      this.tempCodeCate = 0
      this.stateListNews.skip = 0
    }
    this.stateListNews.skip += 5;
    this.filterListNew.filters = [this.filterNewsStatus, this.filterPostDate]
    this.filterCate.value = codeCate;
    this.filterListNew.filters.push(this.filterCate)

    this.APIGetListCMSNews()
  }

  //#endregion

  //#region filter keyword, reset filter
  handleSearch(e: any) {
    this.stateListNews.skip = 0
    this.filterListNew.filters = []
    this.filterListNew.filters.push(this.filterNewsStatus, this.filterPostDate)
    this.listNew = []
    if (Ps_UtilObjectService.hasValueString(e.filters[0].value)) {
      this.filterListNew.filters.push(...[e])
      this.APIGetListCMSNews()
    }
    else {
      this.resetFilter()
    }

  }

  resetFilter() {
    this.filterListNew.filters = []
    this.listCategory = []
    this.listNew = []
    this.stateListNews.skip = 0

    this.APIGetListCMSCategory()
  }
  //#endregion

  openDetail(SelectItem: DTOMANews_ObjReturn) {
    event.stopPropagation()
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('portal002-news-list') || f.Link.includes('/portal/portal002-news-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('portal002-news-detail') || f.Link.includes('/portal/portal002-news-detail'))
        localStorage.setItem('newInfo', JSON.stringify(SelectItem))
        this.menuService.activeMenu(detail)
      }
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
