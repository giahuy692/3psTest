import { Component, ElementRef, HostListener, ViewChild, ViewChildren,ChangeDetectorRef,Renderer2, NgZone } from '@angular/core';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeveloperAPIService } from '../../shared/services/developer-api.service';
import { DTOAPI, DTOModuleAPI } from '../../shared/dto/DTOAPI';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { SelectableSettings, TreeListComponent} from '@progress/kendo-angular-treelist';
import { State, filterBy, CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { MatDrawer } from '@angular/material/sidenav';
import { FormControl, FormGroup,} from '@angular/forms';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';



@Component({
  selector: 'app-dev003-api-list',
  templateUrl: './dev003-api-list.component.html',
  styleUrls: ['./dev003-api-list.component.scss']
})
export class Dev003ApiListComponent {
  
  @ViewChild('formDrawer') public drawer: MatDrawer;
  @ViewChildren('anchor') anchors;
  @ViewChild('myTreeList') treelist: TreeListComponent;

  loading:boolean = false
  popupShow:boolean = false;
  dialog:boolean = false;
  
  
  currentAnchorIndex: number = -1

  ngUnsubscribe = new Subject<void>();

  listModuleTree: DTOModuleAPI[] = [];

  rootData: Array<DTOModuleAPI | DTOAPI> = [];

  //current value
  currentModule = new DTOModuleAPI();
  currentModuleForm = new DTOModuleAPI();
  defaultModule: DTOModuleAPI = new DTOModuleAPI({ Code: null, Vietnamese: 'Tất cả' });

  settingsTreelist: SelectableSettings = { enabled: true, mode: 'row', multiple: false, drag: true };

  //selected
  selectedItem = new DTOAPI();

  //filter
  searchValue: State = { filter: { filters: [], logic: 'or' } }
	filterValue: State = { filter: { filters: [], logic: 'and' } }

  menuItemList:any[] = [];

  topValue: string = 'top'

  //reset expand tree
  collapsedIds: any[];

  //dto form
    apiForm: FormGroup = new FormGroup({
    Code: new FormControl(0),
    ModuleID: new FormControl(null),
    URL: new FormControl(''),
    ServerURL: new FormControl(''),
    IsClosed: new FormControl(false),
    OrderBy:new FormControl(null),
    Remark: new FormControl(''),
    APIID: new FormControl(''),
    APIPackage: new FormControl(''),
    Variable:  new FormControl(''),
  });

  
  constructor(
    private devAPIService: DeveloperAPIService,
    public layoutService: LayoutService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    public menuService: PS_HelperMenuService,
  ){}


  ngOnInit():void{
    // this.GetListModuleAPITree();
    this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.GetListModuleAPITree();
      }
    })
  }

 
  

  //breadcrumb
  loadAPI(){
    this.GetListModuleAPITree(true);
  }

  searchTree(dataList, targetCode) {
		for (const item of dataList) {
			if (item.Code === targetCode) {
				return item;
			}

			if (item.ListGroup && item.ListGroup.length > 0) {
				const foundItem = this.searchTree(item.ListGroup, targetCode);
				if (foundItem) {
					return foundItem;
				}
			}
		}

		return null; // Trả về null nếu không tìm thấy
	}

  //action trên form
  onAddNew(){
    // console.log(this.selectedItem)

    var newDTO:DTOAPI = new DTOAPI()
    this.currentModuleForm = null
    this.apiForm.reset();


    if(!Ps_UtilObjectService.hasValue(this.currentModule) && !Ps_UtilObjectService.hasValue(this.selectedItem)){
      this.selectedItem = null
    }
    

    //tìm module được bind bên ngoài để bind lên dropdown trong drawer
    var findParentModule: any
    if(Ps_UtilObjectService.hasValue(this.selectedItem) && this.selectedItem.Code > 0 && !Ps_UtilObjectService.hasValueString(this.selectedItem.APIID)){
      findParentModule = this.searchTree(this.listModuleTree,this.selectedItem.Code)
    }
    else{
        if(Ps_UtilObjectService.hasValue(this.selectedItem) && this.selectedItem.Code > 0 && Ps_UtilObjectService.hasValueString(this.selectedItem.APIID)){
          this.listModuleTree.find(s => {
            if (s.Code == this.selectedItem.ModuleID) {
              findParentModule = s;
            }
            if(Ps_UtilObjectService.hasListValue(s.ListGroup)){
              s.ListGroup.find(c => {
                if ('ListAPI' in c && c.Code == this.selectedItem.ModuleID) {
                  findParentModule = c;
                }
              })
            }
          })
        }
        else{
          if(Ps_UtilObjectService.hasValue(this.currentModule)){
            this.currentModuleForm = this.currentModule
            if(Ps_UtilObjectService.hasValue(this.currentModule.ModuleID)){
              newDTO.APIPackage =  this.currentModule.ModuleID
            }
          }
          else{
            this.currentModuleForm = this.listModuleTree[0]
            if(Ps_UtilObjectService.hasValue(this.listModuleTree[0].ModuleID)){
              newDTO.APIPackage =  this.listModuleTree[0].ModuleID
            }
          }
        }
    }

    if(Ps_UtilObjectService.hasValue(findParentModule)){
      this.currentModuleForm = findParentModule
      
      if(Ps_UtilObjectService.hasValueString(findParentModule.ModuleID)){
        newDTO.APIPackage = findParentModule.ModuleID
      }
    }
    newDTO.OrderBy = 1
    this.apiForm.patchValue({...newDTO, ModuleID: this.currentModuleForm})
    this.drawer.open();
    
  }

  onCloseForm(){
    this.drawer.close();
  }

  onUpdateAPI(){
    const updateAPI: DTOAPI = this.apiForm.value
    // console.log(updateAPI)
    updateAPI.ModuleID = this.currentModuleForm.Code
    if (!Ps_UtilObjectService.hasValueString(updateAPI.APIID)) {
      this.layoutService.onError("Bạn chưa nhập vào Tên biến trên Frontend");
  } else if (!Ps_UtilObjectService.hasValueString(updateAPI.ServerURL)) {
      this.layoutService.onError("Bạn chưa nhập vào ServerURL");
  } else if (!Ps_UtilObjectService.hasValueString(updateAPI.URL)) {
      this.layoutService.onError("Bạn chưa nhập vào URL");
  }else {
     if (Ps_UtilObjectService.hasValueString(updateAPI.IsClosed)) {
      this.UpdateAPI(updateAPI);
     }
  }

  }

  onDeleteAPI(){
    const deleteAPI: DTOAPI = this.apiForm.value
    if(Ps_UtilObjectService.hasValue(deleteAPI.Code) && deleteAPI.Code > 0){
      this.DeleteAPI(deleteAPI)
    }
    // else{
    //   this.layoutService.onError("Ban chua nhap du thong tin")
    // }
    // console.log(deleteAPI)
  }
  
  //dialog
  closeDialog(){
    this.dialog = false
  }
  openDialog(){
    this.dialog = true
  }

  //checkbox
  checkboxChange(e){
      this.apiForm.value.IsClosed = e.target.checked
  }

  // Ngăn chặn hành vi mặc định của phím Enter trên form
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
  selectIsClosed(){
    const isClosedControl = this.apiForm.controls['IsClosed'];
    isClosedControl.setValue(!isClosedControl.value);
  }

 
 

  //regionAPI
 

  GetListModuleAPITree(isHandle: boolean = false) {
    let ctx = `Lấy danh sách Module API`
    this.loading = true;
    this.devAPIService.GetListModuleAPITree().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
            this.listModuleTree = res.ObjectReturn
            // this.listModuleTree.unshift(this.defaultModule)
            // this.rootData = res.ObjectReturn
            if(isHandle == false){
              this.currentModule = res.ObjectReturn[0]
            }
            this.loadData();
        } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
        }
        this.loading = false;
    }, (error) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
    })
  }

  UpdateAPI(dto: DTOAPI) {
    let ctx = `Cập nhật thông tin API`
    this.loading = true;
    this.devAPIService.UpdateAPI(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} Thành công`)
          this.GetListModuleAPITree(true)
          this.drawer.close()
        } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
            this.GetListModuleAPITree(true)
            
        }
        this.loading = false;
    }, (error) => {
        this.loading = false;
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
        this.GetListModuleAPITree(true)
    })
  }

  DeleteAPI(dto:DTOAPI) {
    let ctx = `Xóa thông tin API`
    this.devAPIService.DeleteAPI(dto).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
          this.layoutService.onSuccess(`${ctx} Thành công`)
          this.GetListModuleAPITree(true)
          this.drawer.close()
          this.closeDialog()
        } else {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
            this.GetListModuleAPITree(true)  
        }
    }, (error) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
        this.GetListModuleAPITree(true);
    })
  }
    //endRegionAPI
    
  //region filter
  fetchChildren = (parent?: any): DTOModuleAPI[] => {
    if (parent && (parent.ListGroup || parent.ListAPI)) {
			let children: DTOModuleAPI[] = [];
      // const filter = this.searchValue.filter.filters

      // if(Ps_UtilObjectService.hasListValue(filter)){
      //   var itemIncludes = this.findFilterValue(this.searchValue.filter).toLowerCase();
      // }
      if(Ps_UtilObjectService.hasValue(this.currentModule)){

        if (Ps_UtilObjectService.hasListValue(parent.ListGroup)) {
          children = children.concat(this.filterAndFetchChildren(parent.ListGroup, 'ListGroup', parent));
        }
      
        if (Ps_UtilObjectService.hasListValue(parent.ListAPI)) {
          children = children.concat(this.filterAndFetchChildren(parent.ListAPI, 'ListAPI', parent));
        }
      
        return children;
        }
      else{
        if (Ps_UtilObjectService.hasListValue(parent.ListGroup)) {
          const filteredListGroup = parent.ListGroup.filter(this.filterFunction);
          children = children.concat(filteredListGroup);
        }
      
        if (Ps_UtilObjectService.hasListValue(parent.ListAPI)) {
          const filteredListAPI = parent.ListAPI.filter(this.filterFunction);
          children = children.concat(filteredListAPI);
        }
        return children;
        }
      }
    
	
		  return parent ? [] : this.listModuleTree.filter(this.filterFunction);
  }
  
  filterAndFetchChildren = (items: any[], property: string, parentToExclude?: any): DTOModuleAPI[] => {
    let filteredChildren: DTOModuleAPI[] = [];
   
    items.forEach(item => {
      if (item !== parentToExclude) {
        // console.log(item)
        const children = this.fetchChildren(item).filter(this.filterFunction);
        filteredChildren.push({ ...item, [property]: children });
      }
    });
    // console.log(filteredChildren)
    return filteredChildren;
  }
 



  
  filterFunction = (item:  any): boolean => {
		if (!this.filterValue.filter || this.filterValue.filter.filters.length === 0) {
      return true
		}
  	if(Ps_UtilObjectService.hasValue(item)){
      const matchesFilterValue = filterBy([item], this.filterValue.filter).length > 0;
      if (matchesFilterValue) {
        return true;
      }
    }
    

		if (item && ('ListGroup' in item || 'ListAPI' in item)) {
      // console.log(item.ListAPI)
      const children = this.fetchChildren(item)
      return children.length > 0 && children.some(child => this.filterFunction(child));
    }
		return false; 
	  };

  

    findFilterValue(filter: CompositeFilterDescriptor | FilterDescriptor): any {
      if ('value' in filter) {
        return filter.value;
      } else if ('filters' in filter && filter.filters.length > 0) {
        return this.findFilterValue(filter.filters[0]);
      }
    
      return null;
    }
    

    
    hasChildren(item: DTOModuleAPI): boolean {
      const children = this.fetchChildren(item)
      return children && children.length > 0
    }
  
  loadFilterTree(){
    var filterModule: CompositeFilterDescriptor = { logic: "and", filters:[]}
    this.filterValue.filter.filters = []
    if (Ps_UtilObjectService.hasValue(this.currentModule)) {
      filterModule.filters.push(
        { field: 'Code', value: this.currentModule.Code, operator: 'eq', ignoreCase: false },
        { field: 'Vietnamese', value: this.currentModule.Vietnamese, operator: 'contains', ignoreCase: false }
      );
      // if(Ps_UtilObjectService.hasListValue(this.currentModule.ListGroup)){
      //  const lstAPI = this.currentModule.ListGroup.filter(s => s['ListAPI'].length > 0)
      //  if(lstAPI){
      //   filterModule.filters.push(
      //     { field: 'Vietnamese', value: this.currentModule.Vietnamese, operator: 'contains', ignoreCase: false }
      //   );
      //  }
      // }
    }
    else{
      if (Ps_UtilObjectService.hasValue(this.searchValue)) {
        if (Ps_UtilObjectService.hasListValue(this.searchValue.filter.filters)) {
          this.filterValue.filter.filters.push(this.searchValue.filter)
        }
      }
    }
  
    if(filterModule.filters.length > 0){
			this.filterValue.filter.filters.push(filterModule)
		}
	}

  
  

  loadData(): void {
    this.loadFilterTree();
    const allData = this.fetchChildren();
    const filteredDataFilter = allData.filter(this.filterFunction);
    var itemModule = new DTOModuleAPI()

    if(Ps_UtilObjectService.hasValue(this.currentModule)){
      itemModule = this.searchTree(filteredDataFilter,this.currentModule.Code)
      this.rootData = [itemModule].filter(this.filterFunction)
      if (Ps_UtilObjectService.hasListValue(this.searchValue.filter.filters)) {
        const itemIncludes = this.findFilterValue(this.searchValue.filter).toLowerCase();
        if (Ps_UtilObjectService.hasValueString(itemIncludes)) {
          const sanitizedSearchTerm = itemIncludes.replace(/[\/.]/g, '');
          this.rootData = [].concat(...[itemModule].map(item => {
            if (Ps_UtilObjectService.hasListValue(item.ListAPI)) {
              const result = item.ListAPI.filter(s => this.sanitizeAndCheck(s.URL, sanitizedSearchTerm) || this.sanitizeAndCheck(s.APIID, sanitizedSearchTerm));
              // console.log(result)
              if(Ps_UtilObjectService.hasListValue(result)){
               
                return {...item,ListAPI:result,ListGroup:[]}
              }
            }if (Ps_UtilObjectService.hasListValue(item.ListGroup)) {
              // dto = item
              return [].concat(...item.ListGroup.map(z => {
                if (Ps_UtilObjectService.hasListValue(z['ListAPI'])) {
                  const result = z['ListAPI'].filter(s => this.sanitizeAndCheck(s.URL, sanitizedSearchTerm) || this.sanitizeAndCheck(s.APIID, sanitizedSearchTerm));
                  if(Ps_UtilObjectService.hasListValue(result)){
                   return {...item,ListGroup:[{...z,ListGroup:[],ListAPI:result}],ListAPI:[]}
                  }
                }
                return [];
              }));
            }
            return [];
          }));
        } else {
          this.rootData = [itemModule].filter(this.filterFunction);
        }
      } 
    }
    else{
      this.rootData = filteredDataFilter
    }
	}

  sanitizeAndCheck(originalString: string, searchTerm: string): boolean {
    const sanitizedString = originalString.replace(/[\/.]/g, '');
    return sanitizedString.toLowerCase().includes(searchTerm);
  }

 

  //handle Search
  onSearchValueAPI(e){
    this.searchValue.filter.filters = e.filters
		this.loadData();
  }
  

  onResetFilter(e){
    if(Ps_UtilObjectService.hasListValue(this.collapsedIds)){
      for (const id of this.collapsedIds) {
        this.treelist.expand(id);
      }
    }
    
    this.loadData();
    this.selectedItem = null
   
    // console.log(this.selectedItem)
    // if(!Ps_UtilObjectService.hasValue(this.currentModule) && (Ps_UtilObjectService.hasValue(this.selectedItem.ModuleID) || Ps_UtilObjectService.hasValue(this.selectedItem['IsVisible']))){
    //   this.selectedItem = null
    // }
  }

  onSelectionChange(e: any) {
    this.selectedItem = e.items[0].dataItem
    this.popupShow = false
  }

  // selectOnForm = new DTOModuleAPI();
  selectionChangeForm(e:any){
    if(Ps_UtilObjectService.hasValue(e)){
     this.currentModuleForm = e
    //  console.log(e)
     if(Ps_UtilObjectService.hasValueString(e.ModuleID)){
      const hasPackage = this.apiForm.controls['APIPackage'];
      hasPackage.setValue(e.ModuleID);
     }
    }
  }

  selectionDropdownChange(e: any){
    // console.log(e)
    if(Ps_UtilObjectService.hasValue(e)){
      this.selectedItem = e
      this.currentModule = e
    }
    else{
      this.currentModule = null
      this.selectedItem = null
    }
    this.loadData();
  }
  //endRegion


  //popup on treelist
  isPopupVisible() {
    return this.popupShow !== null ? (this.popupShow ? 'visible' : 'hidden') : 'hidden';
  }

  getAnchor() {
    if (Ps_UtilObjectService.hasValue(this.anchors) && this.anchors.length > 0) {
      const anchor = this.anchors.toArray()[this.currentAnchorIndex];
      if (Ps_UtilObjectService.hasValue(anchor)) {
        return anchor;
      }
    }
  
    return null;
  }
  
  @HostListener('document:click', ['$event'])
  clickout(event) {
    var anchor = this.getAnchor()
    if (Ps_UtilObjectService.hasValue(anchor)) {
      if (!anchor.nativeElement.contains(event.target)
        && this.popupShow == true) {
        this.popupShow = false
        
      }
    }
    this.cdr.detectChanges();
  }

 

  togglePopup(index, item){
    event.stopPropagation()
    // console.log(index)
    // console.log(this.currentAnchorIndex)
    // Lấy tham chiếu đến DOM element của popup
    const popupElement = this.el.nativeElement.querySelector('.stylePopup');
    const rect = popupElement.getBoundingClientRect();
     
    //kiểm tra index
    if (index != this.currentAnchorIndex) {
      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      this.popupShow = !this.popupShow
    }
    if (this.popupShow){
      this.selectedItem = item
      this.getSelectedMenuDropdown(item)
     
    }

    this.currentAnchorIndex = index
    // this.currentRowItem = item
  }
 
  //HANDLE TOGGLE FORM khi nhấn menu dropdown
  getSelectedMenuDropdown(dataItem: DTOAPI) {
    this.menuItemList = []
    
    this.apiForm.patchValue({...dataItem,ModuleID:{}})
    
    this.menuItemList.push(
      { id: 1, iconName: 'pencil', text: 'Chỉnh sửa'},
      { id: 0, iconName: 'delete', text: 'Xóa API'},
      )

    this.menuItemList = [...this.menuItemList]
    // console.log(this.menuItemList)
  }


  onClickMenuDropdownItem(selectedItem: any) {
    if(selectedItem){
      const id = selectedItem.id
     
      if(id == 1){
      this.apiForm.reset();
        this.currentModuleForm = this.searchTree(this.listModuleTree,this.selectedItem.ModuleID)
        this.apiForm.patchValue({ 
          ...this.selectedItem,
          ModuleID:this.currentModuleForm
      });

      this.drawer.open();
      }
      else if(id == 0){
        this.openDialog();
      }
      this.popupShow = false
    }
  }
  

  ngOnDestroy():void{
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
