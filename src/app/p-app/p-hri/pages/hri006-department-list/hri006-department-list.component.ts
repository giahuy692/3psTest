import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ColumnBase, SelectableSettings} from '@progress/kendo-angular-treelist';
import * as $ from 'jquery';
import { DTODepartment } from '../../shared/dto/DTODepartment.dto';
import { DTOPosition } from '../../shared/dto/DTOPosition.dto';
import { DTOLocation } from '../../shared/dto/DTOLocation.dto';
import { OrganizationAPIService } from '../../shared/services/organization-api.service';

import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct,filterBy} from '@progress/kendo-data-query';
import { DTOPositionGroup } from '../../shared/dto/DTOPositionGroup.dto';
import { DTOPositionRole } from '../../shared/dto/DTOPositionRole.dto';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';
import { Subscription, from } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';


@Component({
	selector: 'app-hri006-department-list',
	templateUrl: './hri006-department-list.component.html',
	styleUrls: ['./hri006-department-list.component.scss']
})
export class Hri006DepartmentListComponent implements OnInit {
	constructor(private organizationAPIService: OrganizationAPIService,

		private layoutService: LayoutService,
		public menuService: PS_HelperMenuService,
		private layoutAPIService: LayoutAPIService,
		) { }

	isAutoCollapse: boolean = false;
	//#region ONINIT
	ngOnInit(): void {
	
		
		let getListStatusAPI = this.layoutAPIService.GetListStatus(4).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.listStatusDropdown = res.ObjectReturn
				this.listStatusDropdown.forEach(stt => stt.disable = false)
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${err}`);
		})
		this.arrUnsubscribe.push(getListStatusAPI);
		var that = this
		let changePermission = this.menuService.changePermission().subscribe((res: DTOPermission) => {
			if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
				that.justLoaded = false;
				that.actionPerm = distinct(res.ActionPermission, 'ActionType');

				that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
				that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
				that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
				that.isCanView = that.actionPerm.findIndex((s) => s.ActionType == 6) > -1 || false;
				// that.isAllPers = false
				// that.isCanCreate = false
				// that.isCanApproved = true	
				
				that.dataPerm = distinct(res.DataPermission, 'Warehouse');
			}
		});

		let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if(Ps_UtilObjectService.hasValue(res)){
				this.getListDepartmentTree({})
			}
		  })
		this.arrUnsubscribe.push(permissionAPI, changePermission);
		this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
		
	}
	//#endregion



	
	//#region AFTERVIEWINIT
	ngAfterViewInit() {
		this.defaultItemDepartment.Department = '-- Chọn --'
		this.defaultItemDepartment.Code = null
		const that = this
		$('.k-grid-content').scroll(function () {
			if (that.dropdownlisttreeTS != undefined) {
				that.dropdownlisttreeTS.toggle(false);
			}
		})
		// this.controlClass()
	}
	//get type file từ component
	// getTypeFile(type:number){
	// 	console.log('typeFile',type)
	// }
	//#endregion
	


	//#region ONDESTROY
	ngOnDestroy(): void {
		this.arrUnsubscribe.forEach((s) => {
			s?.unsubscribe();
		});
	}
	//#endregion

	onReset() {
		
		this.getListDepartmentTree({})
		this.filterValue.filter.filters = []
		this.loadData();
		this.isSelectedItem = null
	}

	//#region UNSUBSCRIPTION
	arrUnsubscribe: Subscription[] = []
	//#endregion

	//#region PERMISSION
	isAllPers:boolean = false
	isCanView:boolean = false
	isCanCreate:boolean = false
	isCanApproved:boolean = false
	justLoaded: boolean = true
	dataPerm: DTODataPermission[] = [];
	actionPerm: DTOActionPermission[] = [];
	//#endregion

	//#region VARIABLE DRAWER RIGHT
	drawer: any
	btnClicked: string
	department = 'department'
	departmentChild = 'departmentChild'
	departmentFix = 'departmentFix'
	departmentDel = 'departmentDel'
	departmentView = 'departmentView'
	departmentSent = 'departmentSent'
	departmentApproved = 'departmentApproved'
	departmentReturn = 'departmentReturn'
	departmentStop = 'departmentStop'
	position = 'position'
	positionFix = 'positionFix'
	positionDel = 'positionDel'
	positionView = 'positionView'
	positionSent = 'positionSent'
	positionApproved = 'positionApproved'
	positionReturn = 'positionReturn'
	positionStop = 'positionStop'

	newDepartment = new DTODepartment()
	listDerpartmentDropdown: DTODepartment[] = []
	selectedItemDepartmentDrawer: any;
	defaultItemDepartment = new DTODepartment()

	listLocationDropdown:DTOLocation[] = []
	listLocationDropdownSlice:DTOLocation[] = []

	newPosition = new DTOPosition()
	listOfRoles: any = []
	positionGroup = new DTOPositionGroup()
	listPositionsDropdown: DTOPosition[] = []
	listPositionGroupDropdown:DTOPositionGroup[] = []
	listPositionRolesDropdown:DTOPositionRole[] = []
	listPositionRolesDropdownSlice:DTOPositionRole[] = []
	listStatusDropdown: any
	listStatusDropdownShow: DTOStatus[] = []
	positionTemp: DTOPosition
	departmentTemp: DTODepartment
	arrProp: string[]
	//#endregion

	//#region ALL
	// CALL REQUIRED API WHEN BUTTON CLICK - DRAWER RIGHT
	// drawerOpen() {
	// 	this.getListDepartment()
	// 	if (this.btnClicked == 0 || this.btnClicked == 1) {
	// 		this.newDepartment = new DTODepartment()
	// 		this.isShowStatu s(this.newDepartment)
	// 	}
	// 	if (this.btnClicked == 2) {
	// 		this.newPosition = new DTOPosition()
	// 		this.newPosition.ListOfRoles = ''
	// 		this.isShowStatu s(this.newPosition)
	// 	}
	// 	if (this.btnClicked == 0 || this.btnClicked == 1 || this.btnClicked == 3) {
	// 		this.getListLocation()
	// 	} else if (this.btnClicked == 2 || this.btnClicked == 4) {
	// 		this.getListPosition()
	// 		this.getListPositionGroup()
	// 		this.getListPositionRole()
	// 	}
	// 	this.drawer.toggle()
	// }

	
	
// dat class 
// 	cellClassFormat(dataItem: any, list: DTODepartment[]): string{
// 		let cellClass = '';
// 		// console.log(list)
// 		const filteredDepartmentHasAll: DTOPosition[] = [];
// 		const filteredDepartmentJustLeader: DTOPosition[] = [];
// 		const filteredDepartmentJustSuper: DTOPosition[] = [];
// 		//lấy list từng item từ lớn tới nhỏ nhất
// 		// if (Ps_UtilObjectService.hasValue(dataItem.GroupPosition)) {
// 			if (Ps_UtilObjectService.hasListValue(list)) {
// 				for (const s of list) {
// 				  if (Ps_UtilObjectService.hasListValue(s.ListPosition) && s.ListPosition.length > 1) {
// 					for (const position of s.ListPosition) {
// 					  if (position.IsLeader == true && position.IsSupervivor == true) {
// 						filteredDepartmentHasAll.push(position);
// 					  }
// 					  if (position.IsLeader == true && position.IsSupervivor == false) {
						
// 						filteredDepartmentJustLeader.push(position);
						
// 					  }
// 					 if (position.IsSupervivor == true && position.IsLeader == false) {
// 						filteredDepartmentJustSuper.push(position);
// 					  }


// 					  if(Ps_UtilObjectService.hasListValue(filteredDepartmentHasAll)){
// 						for (const all of filteredDepartmentHasAll) {
// 						//   console.log(position)
// 						if (position.DepartmentID == all.DepartmentID) {
// 							if(position !== all ){
// 								if (position.IsLeader == true && position.IsSupervivor == false) {
// 									if(dataItem == position){
// 											cellClass = 'leader';
// 									}
// 								}
// 								if (position.IsSupervivor == true && position.IsLeader == false) {
// 									if(dataItem == position){
// 										if(cellClass != 'leader'){
// 											cellClass = 'leader'
// 										}
// 										else if(cellClass == 'leader') {
// 											cellClass = 'supervivor'
// 										}
// 									}
// 								}
// 								if (position.IsLeader == false && position.IsSupervivor == false) {
// 									if(dataItem == position){
// 											if(cellClass != 'supervivor' && cellClass !== 'leader'){
// 												cellClass = 'leader'
// 											}else if(cellClass != 'supervivor' && cellClass == 'leader'){
// 												cellClass = 'supervivor'
// 											}
// 											else{
// 												cellClass = 'noHas'
// 											}
// 									}
// 								}
// 							}
// 						}
// 					  }
// 					}
// 					if(Ps_UtilObjectService.hasListValue(filteredDepartmentJustLeader)){
					
// 					  for (const all of filteredDepartmentJustLeader) {
// 						if (position.DepartmentID == all.DepartmentID) {
// 							if(position !== all ){
// 								if (position.IsSupervivor == true && position.IsLeader == false) {
// 									if(dataItem == position){
// 										if(cellClass != 'leader'){
// 											cellClass = 'leader';
// 										}else{
// 											cellClass = 'supervivor'
// 										}
// 									}
// 								}
// 								if (position.IsLeader == false && position.IsSupervivor == false) {
// 									if(dataItem == position){
										
// 											if(cellClass != 'supervivor' && cellClass == 'leader'){
// 												cellClass = 'supervivor'
// 											}else{
// 												cellClass = 'leader'
// 											}

// 									}
// 								}
// 							}
// 						}
// 					  }
// 					}
// 					if(Ps_UtilObjectService.hasListValue(filteredDepartmentJustSuper)){
// 						for (const all of filteredDepartmentJustSuper) {
// 							if (position.DepartmentID == all.DepartmentID ) {
// 								if(position !== all ){
// 									if (position.IsLeader == false && position.IsSupervivor == false) {
// 										if(dataItem == position){
											
// 											// console.log(cellClass)												
// 											if(cellClass != 'supervivor' && cellClass != 'leader'){
// 												cellClass = 'leader';
// 											}
// 											else if(cellClass != 'supervivor' && cellClass == 'leader'){
// 												cellClass = 'supervivor';
// 											}
// 											else{
// 												cellClass = 'noHas'
// 											}
// 										// console.log(cellClass)	
// 										}
// 									}
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 			//   tiep tuc de quy neu mang co ListDepartment
// 			if (Ps_UtilObjectService.hasListValue(s.ListDepartment)) {
//                 // Đệ quy gọi hàm để xử lý các cấp con
//                 const childClass = this.cellClassFormat(dataItem, s.ListDepartment);
//                 // Kết hợp kết quả từ các cấp con với cellClass hiện tại
//                 cellClass += ' ' + childClass;
//             }
// 		}
// 		return cellClass.trim();
// 	}	
// }

// 	getCellClass(dataItem: any): string {
// 		// console.log(this.rootData)
// 		return this.cellClassFormat(dataItem, this.rootData);	
// 	}


	

	  

	addNewItem(e: string) {
		this.btnClicked = e
		this.isautoCollapse = false
		if (this.checkSelectedItemDepartment) {
			if (e == this.department || e == this.departmentChild) {
				this.newDepartment = new DTODepartment()
				if (this.typeSelectItem) {
					if (e == this.department) this.newDepartment.ParentID = this.selectedItemDepartmentTree.ParentID
					else this.newDepartment.ParentID = this.selectedItemDepartmentTree.Code
				} else this.newDepartment.ParentID = this.selectedItemDepartmentTree.DepartmentID
				this.isShowStatus(this.newDepartment)
			}
			if (e == this.position) {
				this.newPosition = new DTOPosition()
				if (this.typeSelectItem) this.newPosition.DepartmentID = this.selectedItemDepartmentTree.Code
				else this.newPosition.DepartmentID = this.selectedItemDepartmentTree.DepartmentID
				this.listOfRoles = []
				this.isShowStatus(this.newPosition)
			}
		} else {
			if (e == this.department || e == this.departmentChild) {
				this.newDepartment = new DTODepartment()
				this.newDepartment.ParentID = null
				this.isShowStatus(this.newDepartment)
			}
			if (e == this.position) {
				this.newPosition = new DTOPosition()
				this.listOfRoles = []
				this.newPosition.DepartmentID = 1
				this.isShowStatus(this.newPosition)
			}
		}
		if (e == this.department || e == this.departmentChild) this.getListLocation()
		if (e == this.position) {
			this.getListPosition()
			this.getListPositionGroup()
			this.getListPositionRole(true)
		}
		this.getListDepartment(0)
		this.drawer.toggle()
	}

	viewItem(e: string) {
		this.btnClicked = e
		this.isautoCollapse = true
		if (e == this.departmentView) {
			this.newDepartment = this.selectedItemDepartmentTree
			this.isShowStatus(this.newDepartment)
			this.getListLocation()
		}
		if (e == this.positionView) {
			// this.listOfRoles = Ps_UtilObjectService.hasListValue(JSON.parse(this.newPosition.ListOfRoles)) ? JSON.parse(this.newPosition.ListOfRoles) : []
			this.newPosition =this.selectedItemDepartmentTree
			
			//todo 
			this.isShowStatus(this.newPosition)
			this.getListPosition()
			this.getListPositionGroup()
			this.getListPositionRole()
		}
		this.getListDepartment(0)
		this.drawer.toggle()
	}

	fixItem(e: string) {
		this.btnClicked = e
		this.isautoCollapse = false
		if (e == this.departmentFix) {
			this.newDepartment = this.selectedItemDepartmentTree
			this.isShowStatus(this.newDepartment)
			this.getListLocation()
			this.getListDepartment(this.newDepartment.Code)
		}
		if (e == this.positionFix) {
			this.newPosition = this.selectedItemDepartmentTree
			// console.log(this.newPosition)
			// listPositionRolesDropdown
			// this.listOfRoles = Ps_UtilObjectService.hasListValue(JSON.parse(this.newPosition.ListOfRoles))
			this.isShowStatus(this.newPosition)
			this.getListPosition()
			this.getListPositionGroup()
			this.getListPositionRole()
			this.getListDepartment(0)

			// const itemTree = JSON.parse(this.newPosition.ListOfRoles).filter(s => s)
			// // console.log(itemTree)
			// this.listOfRoles = this.listPositionRolesDropdown.filter(s => {
			// 	itemTree.filter(t => {
			// 		console.log(t)
			// 		if(t == s.Code){
			// 			console.log(s)
			// 			return s
			// 		}
			// 	})
			// })

			// console.log(this.listOfRoles)
			
			
		}


		this.drawer.toggle()
	}

	// COLLAPSE DRAWER FUNCTION - DRAWER RIGHT
	isautoCollapse: boolean = false;
	onCollapse() {
		if (this.btnClicked === this.departmentFix || this.btnClicked === this.departmentView) {
			for (let item in this.selectedItemDepartmentTreeCopy) {
				this.newDepartment[item] = this.selectedItemDepartmentTreeCopy[item]
			}
		} else if (this.btnClicked === this.positionFix || this.btnClicked === this.positionView) {
			for (let item in this.selectedItemDepartmentTreeCopy) {
				this.newPosition[item] = this.selectedItemDepartmentTreeCopy[item]
			}
		}
	}

	// SET VALUE STATUS FUNCTION - DRAWER RIGHT
	setValueStatus(e) {
		for (let i = 0; i < this.listStatusDropdown.length; i++) {
			if (e == this.listStatusDropdown[i].OrderBy) this.newDepartment.StatusName = this.listStatusDropdown[i].StatusName
		}
	}

	public itemDisabled(itemArgs: { dataItem: any; index: number }) {
		return !itemArgs.dataItem.disable;
	}

	//DISABLE ITEM STATUS FUNCTION - DRAWER RIGHT
	isShowStatus(item: any, isDropdown = false) {
		var parentStatus: any
		var grCreateOrAll = this.isCanCreate || this.isAllPers,
			grApprovedOrAll = this.isCanApproved || this.isAllPers

		if ('Position' in item) {
			//cấp con 
			parentStatus = this.recursiveSearch(this.dataStructure, item.DepartmentID).StatusID
			if (isDropdown) {
				if (parentStatus == 2) {
					if (grCreateOrAll && (item.StatusID == 0 || item.StatusID == 4) ) {
						// if (item.StatusID == 0 || item.StatusID == 4) 
						this.itemsDropdownTreelist.push({ text: "Gửi duyệt", icon: "redo", val: this.positionSent })
					}
					if (grApprovedOrAll && (item.StatusID == 1 || item.StatusID == 3)) {
						// if (item.StatusID == 1 || item.StatusID == 3) {
						this.itemsDropdownTreelist.push({ text: "Duyệt áp dụng", icon: "check-outline", val: this.positionApproved })
						// }
					}
				}
				if (grApprovedOrAll && (parentStatus == 2 || parentStatus == 3)) {
					if (item.StatusID == 1 || item.StatusID == 3) {
						this.itemsDropdownTreelist.push({ text: "Trả về", icon: "undo", val: this.positionReturn })
					}
					if (item.StatusID == 2) this.itemsDropdownTreelist.push({ text: "Ngưng áp dụng", icon: "minus-outline", val: this.positionStop })
				}
			}
		} else {
			//cấp cha - lớn nhất (đơn vị)
			if (item.ParentID) parentStatus = this.recursiveSearch(this.dataStructure, item.ParentID).StatusID
			if (isDropdown) {
				if (parentStatus == 2 || !Ps_UtilObjectService.hasValue(parentStatus)) {
					if (grCreateOrAll && (item.StatusID == 0 || item.StatusID == 4)) {
						// if (item.StatusID == 0 || item.StatusID == 4) 
						this.itemsDropdownTreelist.push({ text: "Gửi duyệt", icon: "redo", val: this.departmentSent })
					}
					if (grApprovedOrAll && (item.StatusID == 1 || item.StatusID == 3)) {
						// if (item.StatusID == 1 || item.StatusID == 3) {
						this.itemsDropdownTreelist.push({ text: "Duyệt áp dụng", icon: "check-outline", val: this.departmentApproved })
						// }
					}
				}
				if (grApprovedOrAll && (parentStatus == 2 || parentStatus == 3 || !Ps_UtilObjectService.hasValue(parentStatus))) {
					if (item.StatusID == 1 || item.StatusID == 3) {
						this.itemsDropdownTreelist.push({ text: "Trả về", icon: "undo", val: this.departmentReturn })
					}
					if (item.StatusID == 2) this.itemsDropdownTreelist.push({ text: "Ngưng áp dụng", icon: "minus-outline", val: this.departmentStop })
				}
			}
		}

		var statusID = item.StatusID
		if(Ps_UtilObjectService.hasListValue(this.listStatusDropdown)){
		this.listStatusDropdown.forEach(stt => {
			// Disable based on parentStatus and stt.OrderBy
			
			if (parentStatus === 2 || parentStatus === 3 || parentStatus === 4 || !Ps_UtilObjectService.hasValue(parentStatus)) {
				stt.disable = true;
			} else if (parentStatus === 0 || parentStatus === 1) {
				stt.disable = false
			}
			
			// Further disable based on statusID and permissions
			if (stt.disable) {
				if ((this.isCanCreate || this.isAllPers) && [0, 4].includes(statusID)) {
					if (stt.OrderBy !== 1 && stt.OrderBy !== statusID) stt.disable = false;
					if(parentStatus == 3 || parentStatus === 4 && stt.OrderBy !== 2){
						stt.disable = false;
					}
				} else if ((this.isCanApproved || this.isAllPers) && [1, 3].includes(statusID)) {
					if (![2, 4].includes(stt.OrderBy) || stt.OrderBy === statusID){
						stt.disable = false;
					}
					if(parentStatus == 3 || parentStatus === 4 && stt.OrderBy !== 4){
						stt.disable = false;
					}
				} else if ((this.isCanApproved || this.isAllPers) && statusID === 2) {
					if (stt.OrderBy !== 3 && stt.OrderBy !== statusID) stt.disable = false;
				}
			}
		});
		}
	}
	//#endregion
	dataItemBding = new DTODepartment()
	dataItemBdingPosition = new DTOPosition()
	defaultParent = { Code: null, Department: 'Không lựa chọn' }
	//#region DEPARTMENT

	recursiveSearch(dataList, targetCode) {
		for (const item of dataList) {
			if (item.Code === targetCode) {
				return item;
			}

			if (item.ListDepartment && item.ListDepartment.length > 0) {
				const foundItem = this.recursiveSearch(item.ListDepartment, targetCode);
				if (foundItem) {
					return foundItem;
				}
			}
		}

		return null; // Trả về null nếu không tìm thấy
	}

	// GET LIST DEPARTMENT FOR DRAWER FUNCTION - DRAWER RIGHT
	getListDepartment(c) {
		var temp: DTODepartment = new DTODepartment()
		temp.Code = c; temp['IsTree'] = true
		// Call the API to get the department list data
		let getListDepartmentAPI = this.organizationAPIService.GetListDepartment(temp).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.listDerpartmentDropdown = res.ObjectReturn
				if (this.btnClicked !== this.positionView && this.btnClicked !== this.position && this.btnClicked !== this.positionFix) {
					var newDpm = new DTODepartment();
					newDpm.Code = null
					newDpm.Department = 'Không lựa chọn'
					this.listDerpartmentDropdown.unshift(newDpm)
				}
				this.dataItemBding = this.recursiveSearch(res.ObjectReturn, this.newDepartment.ParentID)
				this.dataItemBdingPosition = this.recursiveSearch(res.ObjectReturn, this.newPosition.DepartmentID)
				// if (this.checkSelectedItemDepartment) this.setValueDepartment(this.newDepartment.ParentID, res.ObjectReturn)
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị trực thuộc: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách đơn vị trực thuộc: ${err}`);
		})
		this.arrUnsubscribe.push(getListDepartmentAPI);
	}

	valueDropdowntreeChange(e) {
		if (this.btnClicked === this.positionView || this.btnClicked === this.position || this.btnClicked === this.positionFix) this.newPosition.DepartmentID = e.Code
		else this.newDepartment.ParentID = e.Code
	}

	onUpdateDepartmentDrawer(){
		if(this.newDepartment.StatusID == 1 || this.newDepartment.StatusID == 2){
			if (!Ps_UtilObjectService.hasValueString(this.newDepartment.Department)) {
				this.layoutService.onWarning('Tên của đơn vị không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasValueString(this.newDepartment.DepartmentID)) {
				this.layoutService.onWarning('Mã của đơn vị không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasListValue(this.newDepartment.ListLocation)) {
				this.layoutService.onWarning('Địa điểm làm việc của đơn vị không được để trống', 3500)
			}else{
				this.updateDepartment()
			}
		}
		else{
			this.updateDepartment()
		}
	}

	// UPDATE DEPARTMENT FUNCTION - DRAWER RIGHT
	updateDepartment(toggle = true) {
				let updateDepartmentAPI = this.organizationAPIService.UpdateDepartment(this.newDepartment).subscribe((res: any) => {
					if (res.StatusCode == 0) {
						if (toggle) this.drawer.toggle()
						this.getListDepartmentTree({})
						this.checkHasChild(res.ObjectReturn)
						this.isSelectedItem = null
						this.layoutService.onSuccess('Cập nhật thành công: ' + res.ObjectReturn.Department)
					} else {
						if (this.newDepartment.Code == 0) this.layoutService.onError(`Đã xảy ra lỗi khi thêm mới đơn vị ${this.newDepartment.Department}: ${res.ErrorString}`)
						else this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật đơn vị ${this.newDepartment.Department}: ${res.ErrorString}`)
						this.getListDepartmentTree({})
					}
				}, (err) => {
					for (let item in this.selectedItemDepartmentTreeCopy) {
						this.newDepartment[item] = this.selectedItemDepartmentTreeCopy[item]
					}
					this.layoutService.onError(`Đã xảy ra lỗi khi thêm mới/cập nhật đơn vị: ${err}`);
					this.getListDepartmentTree({})
				})
				this.arrUnsubscribe.push(updateDepartmentAPI);
			// }
		// }
	}

	// DELETE POSITION FUNCTION - DRAWER RIGHT
	deleteDepartment(arr: DTODepartment) {
		let deleteDepartmentAPI = this.organizationAPIService.DeleteDepartment([arr]).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.getListDepartmentTree({})
				this.layoutService.onSuccess('Xóa đơn vị thành công: ' + arr.Department)
			} else{
				this.layoutService.onError(`Đã xảy ra lỗi khi xóa đơn vị ${arr.Department}: ${res.ErrorString}`)
				this.getListDepartmentTree({})
			}

		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi xóa đơn vị: ${err}`);
			this.getListDepartmentTree({})
		})
		this.arrUnsubscribe.push(deleteDepartmentAPI);
	}
	//#endregion

	//#region LOCATION
	// GET LIST LOCATON FOR DRAWER FUNCTION - DRAWER RIGHT
	getListLocation() {
		var temp = new DTOLocation
		// Call the API to get the department list data
		let getListLocationAPI = this.organizationAPIService.GetListLocation(temp).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.listLocationDropdown = res.ObjectReturn
				this.listLocationDropdownSlice = res.ObjectReturn
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách địa điểm làm việc: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách địa điểm làm việc: ${err}`);
		})
		this.arrUnsubscribe.push(getListLocationAPI);
	}

	onFilterLocationChange(e) {
		this.listLocationDropdown = this.listLocationDropdownSlice.filter(
			(s) => (s.LocationName ? s.LocationName.toLowerCase() : '')
				&& (s.LocationName ? s.LocationName.toLowerCase() : '').indexOf(e.toLowerCase()) !== -1
		);
	}
	//#endregion

	//#region POSITION
	onFilterUseSysChange(e) {
		this.listPositionRolesDropdown = this.listPositionRolesDropdownSlice.filter(
			(s) => (s.RoleName ? s.RoleName.toLowerCase() : '')
				&& (s.RoleName ? s.RoleName.toLowerCase() : '').indexOf(e.toLowerCase()) !== -1
		);
	}

	// GET LIST POSITIONS GROUP FOR DRAWER FUNCTION - DRAWER RIGHT
	getListPositionGroup() {
		// Call the API to get the department list data
		let getListPositionGroupAPI = this.organizationAPIService.GetListPositionGroup().subscribe((res: any) => {
			if (res.StatusCode == 0) this.listPositionGroupDropdown = res.ObjectReturn
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm chức năng: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm chức năng: ${err}`);
		})
		this.arrUnsubscribe.push(getListPositionGroupAPI);
	}

	// VALUE POSITION GROUP CHANGE FUNCTION- - DRAWER RIGHT
	valueGroupPositionChange(value: any): void {
		for (let i = 0; i < this.listPositionGroupDropdown.length; i++) {
			if (value == this.listPositionGroupDropdown[i].Code) {
				this.newPosition.GroupPositionCode = this.listPositionGroupDropdown[i].ListID
			}
		}
	}

	// GET LIST POSITIONS ROLES FOR DRAWER FUNCTION - DRAWER RIGHT
	getListPositionRole(addNew:boolean = false) {
		this.listOfRoles = []
		let getListPositionRoleAPI = this.organizationAPIService.GetListPositionRole().subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.listPositionRolesDropdown = res.ObjectReturn
				this.listPositionRolesDropdownSlice = res.ObjectReturn
				if(Ps_UtilObjectService.hasValueString(this.selectedItemDepartmentTree.ListOfRoles)){
					const tempList = JSON.parse(this.selectedItemDepartmentTree.ListOfRoles)
					var listJsonPosition: DTOPositionRole[] = []
					tempList.forEach(item => {
						this.listPositionRolesDropdown.forEach(pos => {
							if(pos.Code == item){
								listJsonPosition.push(pos)
							}
						})
					});
				}

				if(Ps_UtilObjectService.hasValue(listJsonPosition)){
					this.listOfRoles = listJsonPosition
				}

				if(addNew){
					this.listOfRoles = []
				}

				
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò sử dụng tài nguyên hệ thống: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò sử dụng tài nguyên hệ thống: ${err}`);
		})
		this.arrUnsubscribe.push(getListPositionRoleAPI);
	}

	// GET LIST POSITIONS  FOR DRAWER FUNCTION - DRAWER RIGHT
	getListPosition() {
		// if (this.btnClicked == this.position) {
			// if (this.checkSelectedItemDepartment) this.newPosition.ReportTo = this.selectedItemDepartmentTree.Code
			// else this.newPosition.ReportTo = null
		// }
		let getListPositionAPI = this.organizationAPIService.GetListPosition(this.newPosition).subscribe((res: any) => {
			if (res.StatusCode == 0) this.listPositionsDropdown = res.ObjectReturn
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh quản lý hành chính/trực tiếp: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách chức danh quản lý hành chính/trực tiếp: ${err}`);
		})
		this.arrUnsubscribe.push(getListPositionAPI);
	}

	// ADD POSITION ROLE FUCTION - DRAWER RIGHT
	addPositionRole() {
		let addPositionRoleAPI = this.organizationAPIService.AddPositionRole(this.newPosition).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.getListPositionRole()
				this.layoutService.onSuccess('Thêm vai trò sử dụng tài nguyên hệ thống thành công: ' + res.ObjectReturn.RoleName)
			} else this.layoutService.onError(`Đã xảy ra lỗi khi thêm vai trò sử dụng tài nguyên hệ thống: ${res.ErrorString}`)
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi thêm vai trò sử dụng tài nguyên hệ thống: ${err}`);
		})
		this.arrUnsubscribe.push(addPositionRoleAPI);
	}

	onUpdatePosition(){
		const objListOfRole = this.listOfRoles.map(role => role.Code );
				this.newPosition.ListOfRoles = JSON.stringify(objListOfRole)
		if(this.newPosition.StatusID == 1 || this.newPosition.StatusID == 2){
			if (!Ps_UtilObjectService.hasValueString(this.newPosition.Position)) {
				this.layoutService.onWarning('Tên của chức danh không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasValueString(this.newPosition.PositionID)) {
				this.layoutService.onWarning('Mã của chức danh không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasValue(this.newPosition.DepartmentID)) {
				this.layoutService.onWarning('Đơn vị trực thuộc của chức danh không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasValueString(this.newPosition.GroupPosition)) {
				this.layoutService.onWarning('Phân nhóm của chức danh không được để trống', 3500)
			}else if (!Ps_UtilObjectService.hasValueString(this.listOfRoles)){
				
				this.layoutService.onWarning('Vai trò sử dụng tài nguyên hệ thống không được để trống', 3500)
			}
			else{
				this.updatePosition()
			}
		}else{
			this.updatePosition()
		}
	}

	// UPDATE POSITION FUNCTION - DRAWER RIGHT
	updatePosition(toggle = true) {
				
				let updatePositionAPI = this.organizationAPIService.UpdatePosition(this.newPosition).subscribe((res: any) => {
					if (res.StatusCode == 0) {
						if (toggle) this.drawer.toggle()
						this.getListDepartmentTree({})
						this.checkHasChild(res.ObjectReturn)
						this.layoutService.onSuccess('Cập nhật chức danh thành công: ' + res.ObjectReturn.Position)
					} else {
						if (this.newPosition.Code == 0) this.layoutService.onError(`Đã xảy ra lỗi khi thêm mới chức danh: ${res.ErrorString}`)
						else 
						this.layoutService.onError(`Đã xảy ra lỗi khi cập nhật chức danh: ${res.ErrorString}`)
						this.getListDepartmentTree({})
					}
				}, (err) => {
					this.layoutService.onError(`Đã xảy ra lỗi khi thêm mới/cập nhật chức danh: ${err}`);
					this.getListDepartmentTree({})
				})
				this.arrUnsubscribe.push(updatePositionAPI);
			}


	// DELETE POSITION FUNCTION - DRAWER RIGHT
	deletePosition(arr: DTOPosition) {
		let deletePositionAPI = this.organizationAPIService.DeletePosition([arr]).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.getListDepartmentTree({})
				this.layoutService.onSuccess('Xóa thành công chức danh: ' + arr.Position)
			} else{
				this.layoutService.onError(`Đã xảy ra lỗi khi xóa chức danh ${arr.Position}: ${res.ErrorString}`)
				this.getListDepartmentTree({})
			}
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi xóa chức danh: ${err}`);
			this.getListDepartmentTree({})
		})
		this.arrUnsubscribe.push(deletePositionAPI);
	}

	// SET VALUE DROPDOWN POSITION CHANGE - DRAWER RIGHT
	valuePositionChange(e: any) {
		for (let i = 0; i < this.listPositionsDropdown.length; i++) {
			if (e == this.listPositionsDropdown[i].Code) this.newPosition.ReportToCode = this.listPositionsDropdown[i].PositionID
		}
	}
	//#endregion

	isNew: boolean = true
	isSent:boolean = false
	isStoped:boolean = false
	isApproved:boolean = false


	// isReturn = false
	filterNew: FilterDescriptor = { field: 'StatusID', value: 0, operator: 'eq', ignoreCase: true }
	filterSent: FilterDescriptor = { field: 'StatusID', value: 1, operator: 'eq', ignoreCase: true }
	filterStoped: FilterDescriptor = { field: 'StatusID', value: 3, operator: 'eq', ignoreCase: true }
	filterReturn: FilterDescriptor = { field: 'StatusID', value: 4, operator: 'eq', ignoreCase: true }
	filterApprove: FilterDescriptor = { field: 'StatusID', value: 2, operator: 'eq', ignoreCase: true }
	searchData: State = { filter: { filters: [], logic: 'or' } }
	filterValue: State = { filter: { filters: [], logic: 'and' } }
	rootData: Array<any> = [];
	
  	// Xử lý load dữ liệu của trang
	loadData(): void {
		this.loadFilterTree();
		const allData = this.fetchChildren();
		this.rootData = allData.filter(this.filterFunction);
		// this.getCellClass();
		// console.log(this.filterValue.filter.filters)
		// console.log(this.rootData)
	}

	// Xử lý load filter cho danh sách tree
	loadFilterTree(){
		this.filterValue.filter.filters = []
		var filterStatus: CompositeFilterDescriptor =  { logic: "or", filters: [] }
		if (this.isNew){
			filterStatus.filters.push(this.filterNew,this.filterReturn)
		  }
		if (this.isSent){
			filterStatus.filters.push(this.filterSent)
		}
		if (this.isApproved){
			filterStatus.filters.push(this.filterApprove)
		}
		if(this.isStoped){
			filterStatus.filters.push(this.filterStoped)
		}
		if(filterStatus.filters.length > 0){
			this.filterValue.filter.filters.push(filterStatus)
		}
	
		if (Ps_UtilObjectService.hasValue(this.searchData)) {
			if (Ps_UtilObjectService.hasListValue(this.searchData.filter.filters)) {
				this.filterValue.filter.filters.push(this.searchData.filter)
			}
		}
	}


	// Áp dụng giá trị lọc vào thuộc tính được chỉ định và tải lại dữ liệu.
	applyFilter(value,name:string){
		this[name] = value
		this.loadData();
	}


	// Hàm lấy lên các child của mỗi đối tượng load lên grid
	fetchChildren = (structure?: any): Array<DTODepartment | DTOPosition> => {
		// const items = structure ?  structure.ListDepartment && structure.ListPosition || structure.ListPosition   : this.dataStructure;
		if (structure && (structure.ListPosition || structure.ListDepartment || structure.ListChild)) {
			let children: Array<DTODepartment | DTOPosition> = [];
			// let filteredPositionsChild: DTOPosition[] = []
			if (Ps_UtilObjectService.hasListValue(structure.ListPosition)) {
				const filteredPositions = structure.ListPosition.filter(this.filterFunction);
				// filteredPositionsChild = filteredPositions.flatMap(position => position.ListChild ? position.ListChild.filter(this.filterFunction) : position);
				children = children.concat(filteredPositions);
			}

			if(Ps_UtilObjectService.hasListValue(structure.ListChild)){
				const filteredPositionsChild = structure.ListChild.filter(this.filterFunction);
				children = children.concat(filteredPositionsChild);
			}

			if (Ps_UtilObjectService.hasListValue(structure.ListDepartment)) {
			  const filteredDepartments = structure.ListDepartment.filter(this.filterFunction);
			  children = children.concat(filteredDepartments);
			}
		
			return children;
		  }
		
		  return structure ? [] : this.dataStructure.filter(this.filterFunction);
	}


	/**
	 * Hàm filter để áp dụng các điều kiện lọc lên một đối tượng item.
	 * @param item Đối tượng cần kiểm tra và lọc.
	 * @returns {boolean} Trả về true nếu đối tượng item thỏa mãn các điều kiện lọc, ngược lại trả về false.
	 */
	filterFunction = (item: DTODepartment | DTOPosition): boolean => {
		if (!this.filterValue.filter || this.filterValue.filter.filters.length === 0) {
		  return true;
		}
	
		const matchesFilterValue = filterBy([item], this.filterValue.filter).length > 0;
		if (matchesFilterValue) {
		  return true;
		}
		// Kiểm tra nếu còn item thì đệ quy để filter tiếp
		if (item && ('ListDepartment' in item || 'ListPosition' in item || 'ListChild' in item)) {
		  const children = this.fetchChildren(item);
		  return children.some(child => this.filterFunction(child));
		}

		// if(item && 'ListChild' in item) {
		// 	if(Ps_UtilObjectService.hasListValue(item.ListChild)){
		// 		const children = item.ListChild.filter(this.filterFunction);
		// 		return children.length > 0;
		// 	}
		// }

		return false; 
	};

	//Kiểm tra có cấp con không
	hasChildren(structure: DTODepartment): boolean {
		const children = this.fetchChildren(structure);
		return children && children.length > 0;
	}

	// Reset lại filter default
	onResetFilter(e) {
		this.isNew = true
		this.isApproved = false
		this.isStoped = false
		this.isSent = false
		this.loadData();
	}

	//#region VARIABLE TREELIST
	//VARIABLE TREELIST GIRD - TREE LIST GIRD
	loading:boolean = false
	typeSelectItem:boolean = false //true: DTODepartment, false: DTOPosition
	dropdownlisttreeTS: any
	itemsDropdownTreelist: any[];
	dataStructure: Array<DTODepartment | DTOPosition> = []
	selectedItemDepartmentTree: any;
	selectedItemDepartmentTreeCopy: any;
	checkSelectedItemDepartment:boolean = false
	settingsTreelist: SelectableSettings = { enabled: true, mode: 'row', multiple: false, drag: true };
	
	//#endregion

	//#region TREELIST
	// SEARCH DATA DEPARTMENT FUNCTION - TREE LIST GIRD

	onSearchDataDepartment(val: any) {
		this.searchData.filter.filters = val.filters
		this.loadData();
	}

	//ON SELECT IN TREELIST - TREE LIST GIRD
	isSelectedItem: any
	isSelectedPosition: boolean = true
	onSelectionChange(e: any) {
		
		this.selectedItemDepartmentTree = e.items[0].dataItem
		

		this.isSelectedItem = e.items[0].dataItem

		if(Ps_UtilObjectService.hasValue(this.isSelectedItem.GroupPosition)){
			this.isSelectedPosition = false
		}else{
			this.isSelectedPosition = true
		}

		this.checkSelectedItemDepartment = true
		if ('Position' in e.items[0].dataItem) { this.typeSelectItem = false }
		else { this.typeSelectItem = true }
	}

	

	getListDepartmentTree(filter: State, isCopy = false) {
		this.loading = true

		// Call the API to get the department tree data
		let getListDepartmentTreeAPI = this.organizationAPIService.GetListDepartmentTree(filter).subscribe(res => {
			if (res.StatusCode == 0) {
				this.dataStructure = res.ObjectReturn
				// this.rootData = res.ObjectReturn
				this.loadData();
			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách cơ cấu tổ chức: ${res.ErrorString}`)
			this.loading = false
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách cơ cấu tổ chức: ${err}`);
			this.loading = false
		})
		this.arrUnsubscribe.push(getListDepartmentTreeAPI);
	}

	//FETCH CHILDREN FUNCTION - TREE LIST GIRD
	// fetchChildren(structure: DTODepartment): Array<DTODepartment | DTOPosition> {
	// 	const children: Array<DTODepartment | DTOPosition> = []
	// 	if (structure.ListPosition) children.push(...structure.ListPosition)
	// 	if (structure.ListDepartment) children.push(...structure.ListDepartment)

	// 	console.log(this.filterValue)
		
	// 	return children;
	// }

	

	//CHECK IS STRUCTURE FUNCTION - TREE LIST GIRD
	isStructure(item: any): item is DTODepartment {
		return item && typeof item.ListDepartment !== 'undefined';
	}

	//CHECK CHILDREN FUNCTION - TREE LIST GIRD
	// hasChildren(structure: DTODepartment): boolean {
	// 	return (structure.ListDepartment && structure.ListDepartment.length > 0) || (structure.ListPosition && structure.ListPosition.length > 0);
	// }
	



	// SELECT DROPDOWN GIRD FUNCTION - TREE LIST GIRD
	selectionDropdownGirdChange(e: any, dt: any) {
		this.selectedItemDepartmentTree = dt
		this.selectedItemDepartmentTreeCopy = { ...dt }
		this.checkSelectedItemDepartment = true
		if ('Position' in dt) this.typeSelectItem = false
		else this.typeSelectItem = true
		if (e.val == this.department || e.val == this.departmentChild || e.val == this.position) this.addNewItem(e.val)
		if (e.val == this.departmentView || e.val == this.positionView) this.viewItem(e.val)
		if (e.val == this.departmentFix || e.val == this.positionFix) this.fixItem(e.val)
		if (e.val == this.positionDel) {
			this.btnClicked = e.val
			this.dialog.obj = "chức danh"
			this.dialog.item = this.selectedItemDepartmentTree.Position
			this.openedDialog = true
		}
		if (e.val == this.departmentDel) {
			this.btnClicked = e.val
			this.dialog.obj = 'đơn vị'
			this.dialog.item = this.selectedItemDepartmentTree.Department
			this.openedDialog = true
		}
		if (e.val == this.departmentSent || e.val == this.departmentApproved || e.val == this.departmentStop || e.val == this.departmentReturn) {

			this.newDepartment = this.selectedItemDepartmentTree

			if(this.newDepartment.StatusID == 2 || this.newDepartment.StatusID == 3){
				if (e.val == this.departmentApproved) this.newDepartment.StatusID = 2
				else if (e.val == this.departmentStop) this.newDepartment.StatusID = 3
				else if (e.val == this.departmentReturn) this.newDepartment.StatusID = 4
				this.updateDepartment(false)
			}else{
				if (!Ps_UtilObjectService.hasValueString(this.newDepartment.Department)) {
					this.layoutService.onWarning('Tên của đơn vị không được để trống', 3500)
				}else if (!Ps_UtilObjectService.hasValueString(this.newDepartment.DepartmentID)) {
					this.layoutService.onWarning('Mã của đơn vị không được để trống', 3500)
				}else if (!Ps_UtilObjectService.hasListValue(this.newDepartment.ListLocation)) {
					this.layoutService.onWarning('Địa điểm làm việc của đơn vị không được để trống', 3500)
				}else{
					if (e.val == this.departmentSent) this.newDepartment.StatusID = 1
					else if (e.val == this.departmentApproved) this.newDepartment.StatusID = 2
					this.updateDepartment(false)
				}
			}
		

		}
		if (e.val == this.positionSent || e.val == this.positionApproved || e.val == this.positionStop || e.val == this.positionReturn) {
			
			this.newPosition = this.selectedItemDepartmentTree
			this.listOfRoles = JSON.parse(this.newPosition.ListOfRoles)
			
			if(this.newPosition.StatusID == 2 || this.newPosition.StatusID == 3){
				if (e.val == this.positionApproved) this.newPosition.StatusID = 2
				else if (e.val == this.positionStop) this.newPosition.StatusID = 3
				else if (e.val == this.positionReturn) this.newPosition.StatusID = 4
				this.updatePosition(false)
			}else{
				if (!Ps_UtilObjectService.hasValueString(this.newPosition.Position)) {
					this.layoutService.onWarning('Tên của chức danh không được để trống', 3500)
				}else if (!Ps_UtilObjectService.hasValueString(this.newPosition.PositionID)) {
					this.layoutService.onWarning('Mã của chức danh không được để trống', 3500)
					
				}else if (!Ps_UtilObjectService.hasValue(this.newPosition.DepartmentID)) {
					this.layoutService.onWarning('Đơn vị trực thuộc của chức danh không được để trống', 3500)
				}else if (!Ps_UtilObjectService.hasValueString(this.newPosition.GroupPosition)) {
					this.layoutService.onWarning('Phân nhóm của chức danh không được để trống', 3500)
				}else if (!Ps_UtilObjectService.hasListValue(this.listOfRoles)){
					this.layoutService.onWarning('Vai trò sử dụng tài nguyên hệ thống không được để trống', 3500)
				}
				else{
					
					if (e.val == this.positionSent) this.newPosition.StatusID = 1
					else if (e.val == this.positionApproved) this.newPosition.StatusID = 2
					else if (e.val == this.positionReturn) this.newPosition.StatusID = 4
					this.updatePosition(false)
				}
			}
		}
	}

	// CHECK HAS CHILREN FOR BUTTON DELETE - TREE LIST GIRD
	checkHasChild(dt: any): void {
		this.itemsDropdownTreelist = []
		var sstID = dt.StatusID,
			grCreateOrAll = this.isCanCreate || this.isAllPers,
			grApprovedOrAll = this.isCanApproved || this.isAllPers,
			grSttCreateOrReturn = sstID === 0 || sstID === 4

		var grAllow = (grCreateOrAll && grSttCreateOrReturn) || (grApprovedOrAll && sstID === 1)

		if ('Position' in dt) {
			if (grAllow) this.itemsDropdownTreelist.push({ text: "Chỉnh sửa", icon: "edit", val: this.positionFix })
			else this.itemsDropdownTreelist.push({ text: "Xem chi tiết", icon: "eye", val: this.positionView })
			if (grAllow && sstID == 0){
				this.itemsDropdownTreelist.push({ text: "Thêm mới chức danh", icon: "user", val: this.position })
				this.itemsDropdownTreelist.push({ text: "Xóa", icon: "trash", val: this.positionDel });
			} 
			

		} else {
			if (grAllow) this.itemsDropdownTreelist.push({ text: "Chỉnh sửa", icon: "edit", val: this.departmentFix })
			else this.itemsDropdownTreelist.push({ text: "Xem chi tiết", icon: "eye", val: this.departmentView })

			if (grCreateOrAll) {
				this.itemsDropdownTreelist.push({ text: "Thêm mới đơn vị", icon: "image", val: this.department })
				this.itemsDropdownTreelist.push({ text: "Thêm mới đơn vị con", icon: "image", val: this.departmentChild })
				this.itemsDropdownTreelist.push({ text: "Thêm mới chức danh", icon: "user", val: this.position })
				// this.itemsDropdownTreelist.push({ text: "Xóa", icon: "trash", val: this.departmentDel });
			}
			//Xóa để ở cuối
			var checkListDepartment = !Ps_UtilObjectService.hasListValue(dt.ListDepartment),
				checkListPosition = !Ps_UtilObjectService.hasListValue(dt.ListPosition),
				checkListLocation = !Ps_UtilObjectService.hasListValue(dt.ListLocation),
				checkList = checkListDepartment && checkListPosition && checkListLocation
			if (checkList && grAllow && sstID == 0) this.itemsDropdownTreelist.push({ text: "Xóa", icon: "trash", val: this.departmentDel })
		}
		this.isShowStatus(dt, true)
	}

	//DROPDOWN LIST TREE FORMAT FUNCTION -  TREE LIST GIRD
	ddltFormat(e: MouseEvent) {
		var body = $('body'), popup = $('.k-animation-container:has(.fmDropdown)')
		var left = $('.k-dropdown-button.k-focus').offset().left - popup.width() - 1
		$('.k-animation-container:has(.fmDropdown)').css('left', left)

		if (body.height() - Number(e.pageY) < popup.height())
			$('.fmDropdown').css('top', 28)
		else $('.fmDropdown').css('top', -28)

		// if($('.k-animation-container:has(.fmDropdown)').length <= 0){
		// 	// $('.k-dropdown-button.k-focus').removeClass('k-focus');
		// }
		
	}
	//#endregion

	//#region VARIABLE DIALOG
	// VARIABLE DIALOG - DIALOG
	openedDialog:boolean = false
	dialog = { obj: '', item: '' }
	//#endregion

	// Xử lý tải về file excel 
	onDownloadExcel() {
		this.loading = true
		var ctx = "Download Excel Template"
		var getfileName = "DepartmentTemplate.xlsx"
		this.layoutService.onInfo(`Đang xử lý ${ctx}`)
		let GetTemplateDepartment_sst = this.layoutAPIService.GetTemplate(getfileName).subscribe(res => {
			if (res != null) {
				Ps_UtilObjectService.getFile(res, getfileName)
				this.layoutService.onSuccess(`${ctx} thành công`)
			} else {
				this.layoutService.onError(`${ctx} thất bại`)
			}
			this.loading = false;
		}, f => {
			this.layoutService.onError(`Xảy ra lỗi khi ${ctx}. ` + f.error.ExceptionMessage)
			this.loading = false;
		});
		this.arrUnsubscribe.push(GetTemplateDepartment_sst)
	
	}

	uploadEventHandlerCallback: Function
	// Xử lý mở dialog import
	onImportExcel() {
		this.layoutService.setImportDialog(true)
	}

	// Xử lý sự kiện Import
	uploadEventHandler(e: File) {
		this.ImportExcelDepartment(e)
	}

	// Xử lý import file excel
	ImportExcelDepartment(file) {
		let ImportExcel_sst = this.organizationAPIService.ImportExcelDepartment(file).subscribe(res => {
			if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0 || res == 0) {
				// this.GetListHashtag()
				this.layoutService.onSuccess(`Import Excel thành công`)
				this.layoutService.setImportDialogMode(1)
				this.layoutService.setImportDialog(false)
				this.layoutService.getImportDialogComponent().inputBtnDisplay()
				this.getListDepartmentTree({})
			} else {
				this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${res.ErrorString}`)
			}
			this.loading = false;
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${err}`)
			this.loading = false;
		})
		this.arrUnsubscribe.push(ImportExcel_sst)
	}
}
