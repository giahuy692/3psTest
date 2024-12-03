//#region IMPORT
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { SelectableSettings, SelectionChangeEvent, TreeListItem } from '@progress/kendo-angular-treelist';
import { DTOStatus } from 'src/app/p-app/p-layout/dto/DTOStatus';
import { DTOQuestionGroup } from '../../shared/dto/DTOQuestionGroup.dto';
import { CompositeFilterDescriptor, FilterDescriptor, State, distinct, filterBy } from '@progress/kendo-data-query';
import { QuestionGroupAPIService } from '../../shared/services/question-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { LayoutAPIService } from 'src/app/p-app/p-layout/services/layout-api.service';

import { OrganizationAPIService } from '../../shared/services/organization-api.service';
import { DTOPositionRole } from '../../shared/dto/DTOPositionRole.dto';
import { Subscription } from 'rxjs';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
//#endregion

//#region CREATE COMPONENT
@Component({
	selector: 'app-hri009-question-group',
	templateUrl: './hri009-question-group.component.html',
	styleUrls: ['./hri009-question-group.component.scss']
})
//#endregion

//#region Hri009QuestionGroupComponent
export class Hri009QuestionGroupComponent implements OnInit {
	//#region CONSTRUCTOR
	constructor(private questionGroupAPIService: QuestionGroupAPIService,
		private organizationAPIService: OrganizationAPIService,
		public menuService: PS_HelperMenuService,
		private layoutService: LayoutService,
		private layoutAPIService: LayoutAPIService,
		private helperService: PS_HelperMenuService,) { }
	//#endregion

	//#region ONINIT
	ngOnInit(): void {

		// GET LIST PERMISSION FOR PERMISSION - ALL
		var that = this
		let changePermissionAPI = this.menuService.changePermission().subscribe((res: DTOPermission) => {
			if (Ps_UtilObjectService.hasValue(res) && this.justLoaded) {
				that.justLoaded = false;
				that.actionPerm = distinct(res.ActionPermission, 'ActionType');

				that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
				that.isCanView = that.actionPerm.findIndex((s) => s.ActionType == 6) > -1 || false;
				that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
				that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;
				that.dataPerm = distinct(res.DataPermission, 'Warehouse');
			}
		});
		let permissionAPI = this.menuService.changePermissionAPI().subscribe((res) => {
			if (Ps_UtilObjectService.hasValue(res)) {
				// this.getListQuestionGroupTree(this.setFilter())
				this.getListQuestionGroupTree({})

				// GET LIST STATUS QUESTION GROUP  FOR DRAWER FUNCTION - DRAWER RIGHT
				let getListStatusAPI = this.layoutAPIService.GetListStatus(4).subscribe((res: any) => {
					if (res.StatusCode == 0) {
						this.d_listStatusDropdown = res.ObjectReturn
						this.d_listStatusDropdown.forEach(stt => stt.disable = false)
					}
					else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${res.ErrorString}`)
				}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách trạng thái: ${err}`))
				this.arrUnsubscribe.push(getListStatusAPI);

				// GET LIST POSITIONS ROLES FOR DRAWER FUNCTION - DRAWER RIGHT
				let getListPositionRoleAPI = this.organizationAPIService.GetListPositionRole().subscribe((res: any) => {
					if (res.StatusCode == 0) {
						this.d_listPositionRoleDropdown = res.ObjectReturn
						this.d_listPositionRoleDropdownSlice = res.ObjectReturn
					}
					else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò: ${res.ErrorString}`)
				}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách vai trò: ${err}`))
				this.arrUnsubscribe.push(getListPositionRoleAPI);
			}
		})
		this.arrUnsubscribe.push(changePermissionAPI, permissionAPI);
		this.uploadEventHandlerCallback = this.uploadEventHandler.bind(this)
	}
	//#endregion

	//#region AFTERVIEWINIT
	ngAfterViewInit() {
		const that = this
		$('.k-grid-content').scroll(function () {
			if (that.dropdownlisttreeTS != undefined) {
				that.dropdownlisttreeTS.toggle(false);
			}
		})
	}
	//#endregion

	//#region ONDESTROY
	ngOnDestroy(): void {
		this.arrUnsubscribe.forEach((s) => {
			s?.unsubscribe();
		});
	}
	//#endregion

	onLoadListQuestionGroup() {
		$('.clear-filter-btn').click()
	}

	//#region UNSUBSCRIPTION
	arrUnsubscribe: Subscription[] = []
	//#endregion

	//#region PERMISSION
	isAllPers = false
	isCanView = false
	isCanCreate = false
	isCanApproved = false
	justLoaded: boolean = true
	dataPerm: DTODataPermission[] = []
	actionPerm: DTOActionPermission[] = []
	//#endregion

	//#region TREELIST DATA VARIABLE
	loading = false
	btnClicked: string
	treelistSelected: any
	dropdownlisttreeTS: any
	isShowBtnAddChild = true
	itemsDropdownTreelist: any
	dataGroupTree: DTOQuestionGroup[]
	dataGroupTreeCopy: DTOQuestionGroup[]
	dataGroupTreeFilterDropdown: DTOQuestionGroup[]
	newGroup = new DTOQuestionGroup()
	checkCurrentlySelectedGroup: boolean = false
	listQuestionGroupGropdownKenDoFormat: any[] = []
	searchData: any = { filter: { filters: [], logic: 'or' } }
	// filter item drodown
	filterItemCode: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterItemDropdown: FilterDescriptor = { field: 'Code', value: '', operator: 'eq', ignoreCase: true }
	// 
	currentlySelectedGroup: DTOQuestionGroup = new DTOQuestionGroup()
	settingsTreelist: SelectableSettings = { enabled: true, mode: 'row', multiple: false, drag: false };
	private cache: any = new Map();

	//#endregion

	//#region TREELIST DATA FUNCTION
	//GET DATA TREE LIST FUNCTION - TREE LIST GIRD
	getListQuestionGroupTree(filter: State) {//, isCopy = false
		this.loading = true
		let getListQuestionGroupTreeAPI = this.questionGroupAPIService.GetListQuestionGroupTree(filter).subscribe(res => {
			if (res.StatusCode == 0) {
				// if (!isCopy) this.dataGroupTree = res.ObjectReturn
				// else this.dataGroupTreeCopy = res.ObjectReturn
				this.dataGroupTree = res.ObjectReturn
				this.onloadData()

			}
			else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${res.ErrorString}`)
			this.loading = false
		}, (err) => {
			this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${err}`);
			this.loading = false
		})
		this.arrUnsubscribe.push(getListQuestionGroupTreeAPI);
	}


	onloadData() {
		this.cache.clear();
		this.setFilter()
		this.dataGroupTreeCopy = this.fetchChildren()
	}

	// SEARCH DATA GROUP QUESTION FUNCTION - TREE LIST GIRD
	onSearchDataGroupQuestion(val: any) {
		this.searchData.filter.filters = val.filters
		// this.getListQuestionGroupTree(this.setFilter())
		this.onloadData()
	}

	isNew = true
	isSent = true
	isStoped = false
	isApproved = true
	isReturn = false
	filterStatus: CompositeFilterDescriptor = { logic: "or", filters: [] }
	filterNew: FilterDescriptor = { field: 'StatusID', value: '0', operator: 'eq', ignoreCase: true }
	filterSent: FilterDescriptor = { field: 'StatusID', value: '1', operator: 'eq', ignoreCase: true }
	filterStoped: FilterDescriptor = { field: 'StatusID', value: '3', operator: 'eq', ignoreCase: true }
	filterReturn: FilterDescriptor = { field: 'StatusID', value: '4', operator: 'eq', ignoreCase: true }
	filterApprove: FilterDescriptor = { field: 'StatusID', value: '2', operator: 'eq', ignoreCase: true }
	gridState: State = { filter: { filters: [], logic: 'and' } }
	filterChangeCheckbox(e: any, type: string) {
		if (type === 'isNew') this.filterNew = e
		else if (type === 'isSent') this.filterSent = e
		else if (type === 'isApproved') this.filterApprove = e
		else if (type === 'isStoped') this.filterStoped = e
		else if (type === 'isReturn') this.filterStoped = e
		// this.getListQuestionGroupTree(this.setFilter())
		this.onloadData()
	}

	setFilter() {
		this.gridState.filter.filters = []
		this.filterStatus.filters = []

		if (this.isNew) this.filterStatus.filters.push(this.filterNew)
		if (this.isSent) this.filterStatus.filters.push(this.filterSent)
		if (this.isApproved) this.filterStatus.filters.push(this.filterApprove)
		if (this.isReturn) this.filterStatus.filters.push(this.filterReturn)
		if (this.isStoped) this.filterStatus.filters.push(this.filterStoped)
		if (this.filterStatus.filters.length > 0) this.gridState.filter.filters.push(this.filterStatus)

		if (this.searchData !== undefined) {
			if (Ps_UtilObjectService.hasListValue(this.searchData.filter.filters)) {
				if (this.searchData.filter.filters[0].value != '') this.gridState.filter.filters.push(this.searchData.filter)
			}
		}

		// itemDropdown
		if (Ps_UtilObjectService.hasValueString(this.filterItemDropdown.value)) {
			this.filterItemCode.filters.push(this.filterItemDropdown)
			this.gridState.filter.filters.push(this.filterItemCode)
		}
		return this.gridState
	}

	onResetFilter(e) {
		this.searchData.filter.filters = e.filters
		this.isNew = true
		this.isSent = true
		this.isStoped = false
		this.isApproved = true
		this.isReturn = false
		this.onloadData()
		// this.getListQuestionGroupTree(this.setFilter())
	}

	// DELETE POSITION FUNCTION - DRAWER RIGHT
	deleteQuestionGroup(arr: DTOQuestionGroup) {
		let deleteQuestionGroupAPI = this.questionGroupAPIService.DeleteQuestionGroup([arr]).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				// this.getListQuestionGroupTree(this.setFilter())
				this.getListQuestionGroupTree({})
				this.layoutService.onSuccess('Xóa thành công phân nhóm câu hỏi: ' + arr.CategoryName)
			} else this.layoutService.onError(`Đã xảy ra lỗi khi xóa phân nhóm câu hỏi: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi xóa phân nhóm câu hỏi: ${err}`))
		this.arrUnsubscribe.push(deleteQuestionGroupAPI)
	}

	//FETCH CHILDREN FUNCTION - TREE LIST GIRD
	// fetchChildren = (item: any): any[] => {
	// 	return item.ListChilds;
	// };

	public fetchChildren = (parent?: DTOQuestionGroup): DTOQuestionGroup[] => {
		if (this.cache.get(parent)) {
			return this.cache.get(parent);
		}

		let result;
		const items = parent ? parent.ListChilds : this.dataGroupTree;
		if (this.gridState.filter && this.gridState.filter.filters.length && items) {
			result = filterBy(items, {
				logic: "or",
				filters: [
					this.gridState.filter,
					{
						// matches the current filter or a child matches the filter
						operator: (item: any) => {
							if (item.ListChilds) {
								const children = this.fetchChildren(item);
								return children && children.length;
							}
						},
					},
				],
			});
		} else {
			result = items;
		}

		this.cache.set(parent, result);

		return result;
	};

	//CHECK CHILDREN FUNCTION - TREE LIST GIRD
	hasChildren = (item: any): boolean => {
		return item.ListChilds && item.ListChilds.length > 0;
	};

	//DROPDOWN LIST TREE FORMAT FUNCTION -  TREE LIST GIRD
	ddltFormat(e: MouseEvent) {
		var body = $('body'), popup = $('.k-animation-container:has(.fmDropdown)')

		var left = $('.k-dropdown-button.k-focus').offset().left - popup.width() - 1
		$('.k-animation-container:has(.fmDropdown)').css('left', left)

		if (body.height() - Number(e.pageY) < popup.height())
			$('.fmDropdown').css('top', 28)
		else $('.fmDropdown').css('top', -28)
	}

	// ON SELECTED CHANGE IN TREELIST FUNCTION - TREE LIST GIRD
	onChangeSelectedTreelist(e: SelectionChangeEvent): void {
		this.isShowBtnAddChild = e.items[0].dataItem.LevelID == 3 ? false : true
		this.currentlySelectedGroup = e.items[0].dataItem
		this.checkCurrentlySelectedGroup = true
	}

	// ON CLICK DROPDOWN IN TREELIST FUNCTION - TREE LIST GIRD
	onFocusDropdownTreelist(item: any) {
		this.treelistSelected = [{ itemKey: item.Code }]
		this.currentlySelectedGroup = item;
		this.checkCurrentlySelectedGroup = true;
		this.itemsDropdownTreelist = []
		var sstID = item.StatusID,
			grCreateOrAll = this.isCanCreate || this.isAllPers,
			grSttCreateOrReturn = sstID === 0 || sstID === 4 || sstID === 1

		var grAllow = grCreateOrAll && grSttCreateOrReturn

		if (grAllow) this.itemsDropdownTreelist.push({ text: "Chỉnh sửa", icon: "edit", val: 'edit' })
		else this.itemsDropdownTreelist.push({ text: "Xem chi tiết", icon: "eye", val: 'view' })
		if (grCreateOrAll) {
			this.itemsDropdownTreelist.push({ text: "Thêm mới phân nhóm", icon: "image", val: 'add' })
			if (item.LevelID !== 3) this.itemsDropdownTreelist.push({ text: "Thêm mới phân nhóm con", icon: "image", val: 'addChild' })
		}

		var condition_1 = !Ps_UtilObjectService.hasListValue(item.ListChilds),
			condition_2 = !Ps_UtilObjectService.hasListValue(item.ListCreators),
			condition_3 = !Ps_UtilObjectService.hasListValue(item.ListVerifiers),
			checkList = condition_1 && condition_2 && condition_3

		if (checkList && grAllow) this.itemsDropdownTreelist.push({ text: "Xóa", icon: "trash", val: 'delete' });
		this.isShowStatus(item, true)
	}

	//KENDO FORMAT DATA TREELIST FUNCTION - TREE LIST GIRD
	trackBy = (index: number, item: TreeListItem): any => {
		this.listQuestionGroupGropdownKenDoFormat.push(item)
	}
	//#endregion

	//#region VARIABLE DIALOG
	// VARIABLE DIALOG - DIALOG
	openedDialog = false
	dialog = { obj: '', item: '' }
	//#endregion

	//#region DRAWER RIGHT VARIABLE
	d_drawer: any
	functionText = 'Thêm mới'
	d_disable: boolean = false
	d_listStatusDropdown: any
	d_listPositionRoleDropdown: DTOPositionRole
	d_listPositionRoleDropdownSlice: any
	d_listQuestionGroupDropdown: DTOQuestionGroup[]
	d_dataItemBding: DTOQuestionGroup
	d_newGroup: DTOQuestionGroup = new DTOQuestionGroup()
	//#endregion

	//#region DRAWER RIGHT FUNCTION
	//EXECUTES ACTION FUNCTION - DRAWER RIGHT
	executesAction(action: string) {
		this.d_disable = false
		if (this.checkCurrentlySelectedGroup) {
			if (action === 'edit' || action === 'view') {
				if (action === 'view') {
					this.isautoCollapse = true
					this.d_disable = true
				} else {
					this.isautoCollapse = false
				}
				this.d_newGroup = { ...this.currentlySelectedGroup };
				this.functionText = 'Cập nhật'
				this.getListQuestionGroup()
				this.d_drawer.toggle();
			} else if (action === 'add') {
				this.d_newGroup = new DTOQuestionGroup()
				const selectedGroup = this.listQuestionGroupGropdownKenDoFormat.find(group => group.data.Code === this.currentlySelectedGroup.Code);
				if (selectedGroup && selectedGroup.parent.data != undefined) {
					this.d_newGroup.Parent = selectedGroup.parent.data.Code;
					this.d_newGroup.ListCreators = selectedGroup.parent.data.ListCreators;
					this.d_newGroup.ListVerifiers = selectedGroup.parent.data.ListVerifiers;
				}
				else {
					this.d_newGroup.Parent = null
				}
				this.functionText = 'Thêm mới'
				this.getListQuestionGroup()
				this.isShowStatus(new DTOQuestionGroup())
				this.d_drawer.toggle();
			} else if (action === 'addChild') {
				this.d_newGroup = new DTOQuestionGroup()
				this.d_newGroup.Parent = this.currentlySelectedGroup.Code;
				this.d_newGroup.ListCreators = this.currentlySelectedGroup.ListCreators;
				this.d_newGroup.ListVerifiers = this.currentlySelectedGroup.ListVerifiers;
				this.functionText = 'Thêm mới'
				this.getListQuestionGroup()
				this.isShowStatus(this.d_newGroup)
				this.d_drawer.toggle();
			} else if (action === 'delete') {
				this.dialog.obj = "nhóm câu hỏi";
				this.dialog.item = this.currentlySelectedGroup.CategoryName;
				this.openedDialog = true;
			} else if (action === 'sent' || action == 'approved' || action == 'stop' || action == 'return') {
				this.d_newGroup = { ...this.currentlySelectedGroup };
				if (action === 'sent') {
					this.d_newGroup.StatusID = 1
				} else if (action === 'approved') {
					this.d_newGroup.StatusID = 2
				} else if (action === 'stop') {
					this.d_newGroup.StatusID = 3
				} else if (action === 'return') {
					this.d_newGroup.StatusID = 4
				}
				this.updateQuestionGroup(false)
			}
		} else {
			this.d_newGroup = new DTOQuestionGroup()
			this.getListQuestionGroup()
			this.d_drawer.toggle()
			this.isShowStatus(this.d_newGroup)
		}
	}

	recursiveSearch(dataList, targetCode) {
		for (const item of dataList) {
			if (item.Code === targetCode) {
				return item;
			}

			if (item.ListChilds && item.ListChilds.length > 0) {
				const foundItem = this.recursiveSearch(item.ListChilds, targetCode);
				if (foundItem) {
					return foundItem;
				}
			}
		}

		return null; // Trả về null nếu không tìm thấy
	}

	valueDropdowntreeChange(e) {
		this.d_newGroup.Parent = e.Code
	}

	onFilterRoleChange(e) {
		this.d_listPositionRoleDropdown = this.d_listPositionRoleDropdownSlice.filter(
			(s) => (s.RoleName ? s.RoleName.toLowerCase() : '')
				&& (s.RoleName ? s.RoleName.toLowerCase() : '').indexOf(e.toLowerCase()) !== -1
		);
	}

	// GET LIST QUESTION GROUP  FOR DRAWER FUNCTION - DRAWER RIGHT
	getListQuestionGroup() {
		let getListQuestionGroupAPI = this.questionGroupAPIService.GetListQuestionGroup(this.d_newGroup).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				this.d_listQuestionGroupDropdown = res.ObjectReturn
				var newQG = new DTOQuestionGroup();
				newQG.Code = null
				newQG.CategoryName = 'Không lựa chọn'
				this.d_listQuestionGroupDropdown.unshift(newQG)
				this.d_dataItemBding = this.recursiveSearch(res.ObjectReturn, this.d_newGroup.Parent)
			} else this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${res.ErrorString}`)
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách phân nhóm câu hỏi: ${err}`))
		this.arrUnsubscribe.push(getListQuestionGroupAPI)
	}

	// UPDATE QUESTION GROUP FUNCTION - DRAWER RIGHT
	updateQuestionGroup(toggle = true) {
		if (this.d_newGroup.StatusID === 1 || this.d_newGroup.StatusID == 2) {
			if (!Ps_UtilObjectService.hasValueString(this.d_newGroup.CategoryName)) {
				this.layoutService.onWarning('Tên của nhóm câu hỏi này không được để trống', 3500)
				this.d_newGroup = { ...this.currentlySelectedGroup };
				return
			} if (!Ps_UtilObjectService.hasValueString(this.d_newGroup.CategoryID)) {
				this.layoutService.onWarning('Mã của nhóm câu hỏi này không được để trống', 3500)
				this.d_newGroup = { ...this.currentlySelectedGroup };
				return
			} if (!Ps_UtilObjectService.hasListValue(this.d_newGroup.ListCreators)) {
				this.layoutService.onWarning('Vai trò tạo ngân hàng câu hỏi của nhóm câu hỏi này không được để trống', 3500)
				this.d_newGroup = { ...this.currentlySelectedGroup };
				return
			} if (!Ps_UtilObjectService.hasListValue(this.d_newGroup.ListVerifiers)) {
				this.layoutService.onWarning('Vai trò phê duyệt ngân hàng câu hỏi của nhóm câu hỏi này không được để trống', 3500)
				this.d_newGroup = { ...this.currentlySelectedGroup };
				return
			}
		}
		if (this.d_newGroup.Code === 0) this.d_newGroup.CreateTime = new Date()
		let updateQuestionGroupAPI = this.questionGroupAPIService.UpdateQuestionGroup(this.d_newGroup).subscribe((res: any) => {
			if (res.StatusCode == 0) {
				if (toggle) this.d_drawer.toggle()
				// this.getListQuestionGroupTree(this.setFilter())
				this.getListQuestionGroupTree({})
				this.layoutService.onSuccess('Cập nhật nhóm câu hỏi thành công: ' + res.ObjectReturn.CategoryName)
			} else {
				this.layoutService.onError(`Đã xảy ra lỗi khi ${this.d_newGroup.Code == 0 ? 'thêm mới' : 'cập nhật'} nhóm câu hỏi: ${res.ErrorString}`)
			}
		}, (err) => this.layoutService.onError(`Đã xảy ra lỗi khi ${this.d_newGroup.Code == 0 ? 'thêm mới' : 'cập nhật'} nhóm câu hỏi: ${err}`))
		this.arrUnsubscribe.push(updateQuestionGroupAPI)
	}

	// COLLAPSE DRAWER FUNCTION - DRAWER RIGHT
	isautoCollapse: boolean = false

	onDrawerCollapse() {
		this.d_newGroup = this.currentlySelectedGroup
	}

	itemDisabled(itemArgs: { dataItem: any; index: number }) {
		return !itemArgs.dataItem.disable;
	}

	//DISABLE ITEM STATUS FUNCTION - DRAWER RIGHT
	public isShowStatus(item: any, isDropdown = false) {
		if (this.recursiveSearch(this.dataGroupTree, item.Parent) !== null) var parentStatus: any = this.recursiveSearch(this.dataGroupTree, item.Parent).StatusID
		var statusID = item.StatusID, grApprovedOrAll = this.isCanApproved || this.isAllPers, grCreateOrAll = this.isCanCreate || this.isAllPers

		if (isDropdown) {
			if (parentStatus == 2 || !Ps_UtilObjectService.hasValue(parentStatus)) {
				if (grCreateOrAll) {
					if (statusID == 0 || statusID == 4) this.itemsDropdownTreelist.push({ text: "Gửi duyệt", icon: "redo", val: 'sent' })
				}
				if (grApprovedOrAll) {
					if (statusID == 1 || statusID == 3) {
						this.itemsDropdownTreelist.push({ text: "Duyêt áp dụng", icon: "check-outline", val: 'approved' })
					}
				}
			}

			if (grApprovedOrAll) {
				if (statusID == 1 || statusID == 3) {
					this.itemsDropdownTreelist.push({ text: "Trả về", icon: "undo", val: 'return' })
				}
				if (statusID == 2) this.itemsDropdownTreelist.push({ text: "Ngưng áp dụng", icon: "minus-outline", val: 'stop' })
			}
		}

		this.d_listStatusDropdown.forEach(stt => {
			// Disable based on parentStatus and stt.OrderBy
			if (parentStatus === 2 || !Ps_UtilObjectService.hasValue(parentStatus)) {
				stt.disable = true;
			} else if (parentStatus === 3 || parentStatus === 4 || parentStatus === 0 || parentStatus === 1) {
				stt.disable = stt.OrderBy === 0 || stt.OrderBy === 3 || stt.OrderBy === 4;
			}

			// Further disable based on statusID and permissions
			if (stt.disable) {
				if ((this.isCanCreate || this.isAllPers) && [0, 4].includes(statusID)) {
					if (stt.OrderBy !== 1 && stt.OrderBy !== statusID) stt.disable = false;
				} else if ((this.isCanApproved || this.isAllPers) && [1, 3].includes(statusID)) {
					if (![2, 4].includes(stt.OrderBy) || stt.OrderBy === statusID) stt.disable = false;
				} else if ((this.isCanApproved || this.isAllPers) && statusID === 2) {
					if (stt.OrderBy !== 3 && stt.OrderBy !== statusID) stt.disable = false;
				}
			}
		});

		// var statusID = item.StatusID
		// if ((this.isCanCreate || this.isAllPers) && (statusID === 0 || statusID === 4)) {
		// 	this.d_listStatusDropdown.forEach((stt) => {
		// 		if (stt.OrderBy == 1 || stt.OrderBy == statusID) stt.disable = true
		// 		else stt.disable = false
		// 	});
		// } else if ((this.isCanApproved || this.isAllPers) && (statusID === 1 || statusID === 3)) {
		// 	this.d_listStatusDropdown.forEach((stt) => {
		// 		if (stt.OrderBy == 2 || stt.OrderBy == 4 || stt.OrderBy == statusID) stt.disable = true
		// 		else stt.disable = false
		// 	});
		// } else if ((this.isCanApproved || this.isAllPers) && statusID === 2) {
		// 	this.d_listStatusDropdown.forEach((stt) => {
		// 		if (stt.OrderBy == 3 || stt.OrderBy == statusID) stt.disable = true
		// 		else stt.disable = false
		// 	});
		// }
	}
	//#endregion

	//#region HEADER
	openDetail() {
		let changeModuleData_sst = this.helperService.changeModuleData().subscribe((item: ModuleDataItem) => {
			var parent = item.ListMenu.find(f => f.Code.includes('hriCompetency')
				|| f.Link.includes('hr007-competency-bank'))

			if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
				var detail = parent.LstChild.find(f => f.Code.includes('hr009-question-group')
					|| f.Link.includes('hr009-question-group'))
				if (Ps_UtilObjectService.hasValue(detail)) {
					this.helperService.activeMenu(detail)
				}
			}
		})
		this.arrUnsubscribe.push(changeModuleData_sst)
	}
	//#endregion

	// Xử lý tải file excel
	onDownloadExcel() {
		var ctx = "Download Excel Template"
		var getfileName = "QuestionCategoryTemplate.xlsx"
		this.layoutService.onInfo(`Đang xử lý ${ctx}`)
		let GetTemplateDepartment_sst = this.layoutAPIService.GetTemplate(getfileName).subscribe(res => {
			if (res != null) {
				Ps_UtilObjectService.getFile(res, getfileName)
				this.layoutService.onSuccess(`Download Excel Template thành công`)
			} else {
				this.layoutService.onError(`Download Excel Template thất bại`)
			}
			this.loading = false;
		}, f => {
			this.layoutService.onError(`Xảy ra lỗi khi Download Excel Template. ` + f?.error?.ExceptionMessage)
		});
		this.arrUnsubscribe.push(GetTemplateDepartment_sst)
	}

	uploadEventHandlerCallback: Function
	// Xử lý bật dialog import
	onImportExcel() {
		this.layoutService.setImportDialog(true)
	}

	// Xử lý sự kiện upload
	uploadEventHandler(e: File) {
		this.ImportExcelCategoryQuestion(e)
	}

	// Xử lý import excel
	ImportExcelCategoryQuestion(file) {
		let ImportExcel_sst = this.questionGroupAPIService.ImportExcelQuestionCategory(file).subscribe(res => {
			if (Ps_UtilObjectService.hasValue(res)) {
				this.layoutService.onSuccess(`Import Excel thành công`)
				this.layoutService.setImportDialogMode(1)
				this.layoutService.setImportDialog(false)
				this.layoutService.getImportDialogComponent().inputBtnDisplay()
				this.onLoadListQuestionGroup()
			} else this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${res.ErrorString}`)
			this.loading = false;
		}, (err) => { this.layoutService.onError(`Đã xảy ra lỗi khi Import Excel: ${err}`) })
		this.arrUnsubscribe.push(ImportExcel_sst)
	}
}
//#endregion
