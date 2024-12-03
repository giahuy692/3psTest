import { Injectable, Input } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { PS_CommonService, Ps_UtilObjectService } from "src/app/p-lib";
import { MatDrawer } from '@angular/material/sidenav';
import { UntypedFormBuilder } from '@angular/forms';
import { State, SortDescriptor, CompositeFilterDescriptor, filterBy, orderBy } from '@progress/kendo-data-query';
import { FileRestrictions } from '@progress/kendo-angular-upload';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { DTOCFFolder } from '../dto/DTOCFFolder.dto';
import { ImportPopupComponent } from '../components/import-popup/import-popup.component';
import { SelectedRowitemPopupComponent } from '../components/selected-rowitem-popup/selected-rowitem-popup.component';
import { PKendoEditorComponent } from "../components/p-kendo-editor/p-kendo-editor.component";
import { NotificationService } from "@progress/kendo-angular-notification";
import { DrawerComponent } from "@progress/kendo-angular-layout";
import { MenuDataItem, ModuleDataItem } from "../dto/menu-data-item.dto";
import DTOSYSModule from "../dto/DTOSYSModule.dto";
import { PS_HelperMenuService } from "./p-menu.helper.service";


@Injectable({
	providedIn: 'root'
})
export class LayoutService {
	//Editor
	arrayEditor = [];

	private reloadMenuPortal: Subject<void> = new Subject<void>();
	public reloadSuccess$: Observable<void> = this.reloadMenuPortal.asObservable();
	
	loading: boolean = true
	excelValid: boolean = true
	//
	deleteDialogOpened: boolean = false
	importDialogOpened: boolean = false
	folderDialogOpened: boolean = false


	searchProductDialogOpened: boolean = false //false
	changePasswordDialogOpened: boolean = false
	isAdd: boolean = false
	//
	context: string
	folderPath = new Array<string>()
	onEditFunc
	onDeleteFunc
	//
	folder: DTOCFFolder
	filterList = new Array<any>()
	filterImportList = new Array<any>()
	invalidList = new Array<any>()
	//Grid view
	pageSize: number = 25
	pageSizes: number[] = [25, 50, 75, 100]

	gridDSView = new Subject<any>();
	importGridDSView = new Subject<any>();
	//Grid state
	gridDSState: State = {
		skip: 0, take: 20,
		filter: { filters: [], logic: 'and' },
		group: [],
		sort: []
	};
	importGridDSState: State = {
		skip: 0, take: 20,
		filter: { filters: [], logic: 'and' },
		group: [],
		sort: []
	};
	//Image
	restrictions: FileRestrictions = {
		allowedExtensions: ['jpg', 'jpeg', 'png']
	};
	//delay debounce
	typingDelay: number = 2000

	//element	
	drawer: MatDrawer;
	importInput: Input;
	//component
	importDialog: ImportPopupComponent
	selectionPopup: SelectedRowitemPopupComponent
	editor: PKendoEditorComponent
	drawerState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	drawerAutoCollapse: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	constructor(
		public api: PS_CommonService,
		public sanitizer: DomSanitizer,
		public formBuilder: UntypedFormBuilder,
		private notificationService: NotificationService,
		public menuService: PS_HelperMenuService,
	) { }
	//context
	setContext(context) {
		this.context = context;
	}
	getContext() {
		return this.context
	}
	//drawer
	setDrawer(drawer: MatDrawer) {
		this.drawer = drawer;
	}
	getDrawer() {
		return this.drawer
	}
	//CRUD
	setOnEdit(func: Function) {
		this.onEditFunc = func
	}
	getOnEdit(item) {
		return this.onEditFunc(item)
	}
	setOnDelete(func: Function) {
		this.onDeleteFunc = func
	}
	GetOnDelete(item) {
		return this.onDeleteFunc(item)
	}
	//import input
	setImportInput(importInput: Input) {
		this.importInput = importInput
	}
	getImportInput() {
		return this.importInput
	}
	//delete dialog
	setDeleteDialog(dialogOpened: boolean) {
		this.deleteDialogOpened = dialogOpened
	}
	getDeleteDialog() {
		return this.deleteDialogOpened
	}
	//folder dialog
	setFolderDialog(dialogOpened: boolean) {
		this.folderDialogOpened = dialogOpened
	}
	getFolderDialog() {
		return this.folderDialogOpened
	}
	//search product dialog
	setSearchProductDialog(dialogOpened: boolean) {
		this.searchProductDialogOpened = dialogOpened
	}
	getSearchProductDialog() {
		return this.searchProductDialogOpened
	}
	//import dialog
	setImportDialogMode(mode: number) {
		this.importDialog.mode = mode
	}
	getImportDialogMode() {
		return this.importDialog.mode
	}
	// Dialogs
	
	setImportDialogComponent(cpn: ImportPopupComponent) {
		this.importDialog = cpn
	}
	getImportDialogComponent() {
		return this.importDialog
	}
	setImportDialog(importDialogOpened: boolean) {
		this.importDialogOpened = importDialogOpened
	}
	getImportDialog() {
		return this.importDialogOpened
	}

	//selection dialog
	setSelectionPopupComponent(cpn: SelectedRowitemPopupComponent) {
		this.selectionPopup = cpn
	}
	getSelectionPopupComponent() {
		return this.selectionPopup
	}
	//search product dialog
	setChangePasswordDialog(dialogOpened: boolean) {
		this.changePasswordDialogOpened = dialogOpened
	}
	getChangePasswordDialog() {
		return this.changePasswordDialogOpened
	}
	//editor component
	setEditor(cpn: PKendoEditorComponent, index?: number) {
		this.editor = cpn
		if(Ps_UtilObjectService.hasValue(index)){
			this.arrayEditor[index] = this.editor;
		}
	}
	getEditor(index?: number) {
		if(Ps_UtilObjectService.hasValue(index)){
			return this.arrayEditor[index];
		} else {
			return this.editor
		}
	}
	// setEditor(cpn: PKendoEditorComponent) {
	// 	this.editor = cpn
	// }
	// getEditor() {
	// 	return this.editor
	// }
	//excel
	setExcelValid(excelValid: boolean) {
		this.excelValid = excelValid
	}
	getExcelValid() {
		return this.excelValid
	}
	setFolder(fol) {
		this.folder = fol
	}
	getFolder() {
		return this.folder
	}
	//folder path
	setFolderPath(path) {
		this.folderPath = path
	}
	getFolderPath() {
		return this.folderPath
	}
	//
	setPageSize(pageSize) {
		this.pageSize = pageSize
	}
	//sorting
	sortChange(itemBannerList, filterList, gridDSView, gridDSState,
		sort: SortDescriptor[], gridName?: string) {
		gridDSState.sort = sort;
		if (gridName == null) {
			this.loadList(itemBannerList, filterList, gridDSView, gridDSState);
		} else {
			this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
		}
	}
	//paging
	pageChange(itemBannerList, filterList, gridDSView, gridDSState,
		event: PageChangeEvent, gridName?: string) {
		gridDSState.skip = event.skip;
		if (gridName == null) {
			this.loadList(itemBannerList, filterList, gridDSView, gridDSState);
		} else {
			this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
		}
	}
	//filtering
	filterChange(itemBannerList, filterList, gridDSView, gridDSState,
		filter: CompositeFilterDescriptor, gridName?: string) {
		gridDSState.filter = filter;
		if (gridName == null) {
			this.loadList(itemBannerList, filterList, gridDSView, gridDSState)
		} else {
			this.loadListExcel(itemBannerList, filterList, gridDSView, gridDSState);
		}
	}
	//loading
	loadList(itemBannerList, filterList, gridDSView, gridDSState) {
		filterList = filterBy(itemBannerList, gridDSState.filter)

		gridDSView.next({
			data: orderBy(filterList
				.slice(gridDSState.skip,
					gridDSState.skip + this.pageSize),
				gridDSState.sort),
			total: filterList.length
		});
	}
	loadListExcel(importBannerList, filterImportList, importGridDSView, importGridDSState) {
		filterImportList = filterBy(importBannerList, importGridDSState.filter)

		importGridDSView.next({
			data: orderBy(filterImportList
				.slice(importGridDSState.skip,
					importGridDSState.skip + this.pageSize),
				importGridDSState.sort),
			total: filterImportList.length
		});
	}
	//grid btn
	onAdd() {
		this.isAdd = true;
		this.drawer.open()
	}
	//onEdit và onDelete có khung như nhau nhưng khác số dòng code
	public closeImportDialog() {
		this.importDialogOpened = false;
		this.excelValid = true;
	}
	//deleteBanner có khung như nhau
	public importBanner() {
		if (this.excelValid) {
			this.onInfo("Importing...")
			// this.p_AddListBanner()
		} else {
			this.onError("Excel chứa dữ liệu lỗi")
		}
	}
	//upload img	
	// p_UploadExcel(file: File, objectName?: string, property?: string) {
	// 	return new Observable<Array<any>>(obs => {
	// 		this.payslipApiService.UploadExcel(file).subscribe(res => {
	// 			if (res != null) {
	// 				this.onSuccess(`Upload excel ${objectName} thành công.`)
	// 				// form.get(property).setValue([res]);
	// 			} else {
	// 				this.onError(`Upload excel ${objectName} thất bại.`)
	// 			}
	// 			obs.next(res);
	// 			obs.complete();
	// 		}, f => {
	// 			this.onError(`Xảy ra lỗi khi Upload excel ${objectName}. ${f.error.ExceptionMessage}`)
	// 			// this.loading = false;
	// 		});
	// 	})
	// }
	//highlight ô excel có lỗi
	colorDate(date: string): SafeStyle {
		let result;

		if (Ps_UtilObjectService.isValidDate(date)) {
			result = 'transparent'
		} else {
			result = 'firebrick'
			this.excelValid = false
		}
		return this.sanitizer.bypassSecurityTrustStyle(result);
	}
	colorString(str: any): SafeStyle {
		let result;

		if (isNaN(str)) {
			result = 'transparent'
		} else {
			result = 'firebrick'
			this.excelValid = false
		}
		return this.sanitizer.bypassSecurityTrustStyle(result);
	}
	colorNumber(num: any): SafeStyle {
		let result;

		if (typeof num === 'number') {
			result = 'transparent'
		} else {
			result = 'firebrick'
			this.excelValid = false
		}
		return this.sanitizer.bypassSecurityTrustStyle(result);
	}
	//notification
	onSuccess(message, milisecond = 1000) {
		this.notificationService.show({
			content: message,
			hideAfter: milisecond,
			position: { horizontal: 'left', vertical: 'bottom' },
			animation: { type: "fade", duration: milisecond / 10 },
			type: { style: "success", icon: true },
		});
	}
	onError(message, milisecond = 10000) {
		this.notificationService.show({
			content: message,
			hideAfter: milisecond,
			position: { horizontal: 'left', vertical: 'bottom' },
			animation: { type: "fade", duration: milisecond / 10 },
			type: { style: "error", icon: true },
		});
	}
	onWarning(message, milisecond = 4000) {
		this.notificationService.show({
			content: message,
			hideAfter: milisecond,
			position: { horizontal: 'left', vertical: 'bottom' },
			animation: { type: "fade", duration: milisecond / 10 },
			type: { style: "warning", icon: true },
		});
	}
	onInfo(message, milisecond = 4000) {
		this.notificationService.show({
			content: message,
			hideAfter: milisecond,
			position: { horizontal: 'left', vertical: 'bottom' },
			animation: { type: "fade", duration: milisecond / 10 },
			type: { style: "info", icon: true },
		});
	}

	//load menu-portal
	menuPortalReloadSuccess() {
		this.reloadMenuPortal.next();
	}
}
