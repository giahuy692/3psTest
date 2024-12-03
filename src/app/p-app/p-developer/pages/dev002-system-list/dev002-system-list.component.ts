import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOAction } from '../../shared/dto/DTOAction';
import { DTOFunction } from '../../shared/dto/DTOFunction';
import { DTOModule } from '../../shared/dto/DTOModule';
import { DTOSubFunction } from '../../shared/dto/DTOSubFunction';
import { DeveloperAPIService } from '../../shared/services/developer-api.service';
import { SelectableSettings, SelectionChangeEvent, TreeListComponent, } from '@progress/kendo-angular-treelist';
import { State, filterBy, distinct } from '@progress/kendo-data-query';
import { MatSidenav } from '@angular/material/sidenav';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';


@Component({
    selector: 'app-dev002-system-list',
    templateUrl: './dev002-system-list.component.html',
    styleUrls: ['./dev002-system-list.component.scss']
})
export class Dev002SystemListComponent implements OnInit, OnDestroy, AfterViewInit {
    // data
    listActionTree: DTOAction[] = []
    listModuleTree: DTOModule[] = []
    fullListModuleTree: DTOModule[] = []

    //state
    isLoading: boolean = false;
    expandedIds: number[] = [1, 2];
    opened: boolean = false
    popupShow: boolean = false;
    loading: boolean = false;
    MultiOOPForm: UntypedFormGroup; // biển được bind [formGroup]

    defaultParent: any = { Code: null, Vietnamese: 'Không lựa chọn' };
    currentParentID: any = this.defaultParent;
    defaultParentAction: any = { Code: null, ActionName: 'Không lựa chọn' };
    currentParentIDAction: any = this.defaultParentAction;

    isChildAction: boolean = false


    //search
    filterValue: State = { filter: { filters: [], logic: 'and' } }
    searchData: State = { filter: { filters: [], logic: 'or' } }
    rootData: DTOModule[] = []
    @ViewChild('treeListSystem') treeListSystem: TreeListComponent;

    //dropdownbtn
    delItem: any = {}
    checkbtnDel: boolean = false
    OptionTool: { id: number, icon?: string, imageUrl?: string, text: string }[] = [];
    listSysTreeList: DTOModule[] = []
    originalData: DTOModule[] = []
    selectedTreelistItem: any
    disable: boolean = true
    currentAnchorIndex: number = -1
    selectedItem: any = {}
    topValue: string = 'top'

    // showButtonAdd
    showBtnAddModule: boolean = false
    showBtnAddModuleChild: boolean = false
    showBtnAddFunc: boolean = false
    showBtnAddFuncChild: boolean = false
    showBtnAddAct: boolean = false
    showBtnAddActChild: boolean = false
    // treelist
    public settings: SelectableSettings = {
        enabled: true,
        mode: 'row',
        multiple: false,
        drag: true,
    };
    itemCollapsed: DTOModule[] | DTOFunction[];


    //dialog func data detail
    isDialogOpened: boolean = false
    BreadCrumbItem: string = ''
    expandedItems: { [key: number]: boolean } = {};
    disableDes: boolean = false
    disableCof: boolean = false
    disableTypeData: boolean = false
    disableTypePopup: boolean = false
    disableOrderby: boolean = false
    dataDetailFunc: any
    newDataFuncDetail: any
    isInput: boolean = false
    lengOfArrDetailFunc: number = 0
    popupGridData: DTOSubFunction[] = []
    oldPopupGridData: DTOSubFunction[] = []
    openedDialogDetailFunc: boolean = false
    delDetailFunc: any
    oldSelectItemCode: number = -1
    isEditing: boolean = false;
    oldValue: any
    //Unsubscribe
    ngUnsubscribe$ = new Subject<void>();

    //permission 
    isAllPers: boolean = false
    isCanCreate: boolean = false
    isCanApproved: boolean = false
    justLoadedPer: boolean = true
    dataPerm: DTODataPermission[] = [];
    actionPerm: DTOActionPermission[] = [];
    constructor(private formBuilder: FormBuilder, public apiService: DeveloperAPIService, public layoutService: LayoutService, private el: ElementRef,
        private cdr: ChangeDetectorRef, public menuService: PS_HelperMenuService,
    ) { }


    ngOnInit(): void {
        // Gọi hàm tạo form cho DTOModule khi component được khởi tạo
        this.currentDrawer = 'module'
        this.MultiOOPForm = this.handleCreateForm(new DTOModule());

        let that = this
        // phân quyền  
        this.menuService.changePermission().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res: DTOPermission) => {
            if (Ps_UtilObjectService.hasValue(res) && that.justLoadedPer) {
                that.actionPerm = distinct(res.ActionPermission, 'ActionType');
                that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
                that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
                that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

                // this.getApi()
                that.justLoadedPer = false;
            }
        });
        this.showBtnAddModule = true;

        this.menuService.changePermissionAPI().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((res) => {
            if (Ps_UtilObjectService.hasValue(res)) {
                this.getApi()
            }
          })
    }

    getApi() {
        this.APIGetListSysStructureTree()
    }


    ngAfterViewInit(): void {

    }


    //#region dialog detail function
    //close dialog func detail
    closeDialogFuncDetail() {

        let check0 = this.popupGridData.filter(res => !Ps_UtilObjectService.hasValueString(res.DataName) ||
            !Ps_UtilObjectService.hasValueString(res.DataID) || !Ps_UtilObjectService.hasValue(res.TypeData) || !Ps_UtilObjectService.hasValue(res.TypePopup) ||
            !Ps_UtilObjectService.hasValue(res.OrderBy))

        //kiểm tra nếu còn để trống trường bắt buộc thì không dóng dialog
        if (Ps_UtilObjectService.hasListValue(check0)) {
            this.layoutService.onWarning(`Vui lòng kiểm tra lại thông tin`)
        }
        else {

            this.isDialogOpened = false
            // trường hợp user nhấn thêm mới nhưng để trống row thì bỏ row đó khi tắt dialog
            if (this.popupGridData.length > 0) {
                if (this.popupGridData[0].Code == 0 && !Ps_UtilObjectService.hasValue(this.popupGridData[0].DataName) && !Ps_UtilObjectService.hasValue(this.popupGridData[0].DataID)) {
                    this.popupGridData.shift()
                    this.lengOfArrDetailFunc = this.popupGridData.length
                }

            }

            //tắt hết các item chi tiết còn đang expand
            for (let key in this.expandedItems) {
                if (this.expandedItems.hasOwnProperty(key)) {
                    this.expandedItems[key] = false;
                }
            }


            //phải lưu biến data cũ (đã thực hiện hành động xóa) so sánh với biến data của selectedItem  
            this.oldPopupGridData = this.popupGridData
            this.oldSelectItemCode = this.selectedItem.Code
        }

    }


    //open dialog func detail
    openDialogFuncDetail() {
        this.BreadCrumbItem = ''
        this.popupGridData = []
        this.isDialogOpened = true
        if (Ps_UtilObjectService.hasListValue(this.selectedItem.Breadcrumb)) {
            this.BreadCrumbItem = this.selectedItem.Breadcrumb

            // vì lấy data từ selectedItem -> khi load lại listree mới bị mất select -> selectedItem vẫn còn data cũ
            if (this.selectedItem.Code !== this.oldSelectItemCode) {
                this.popupGridData = this.selectedItem.ListSubFunction
            }
            else {
                this.popupGridData = this.oldPopupGridData
            }
        }


    }
    //mở chi tiết item 
    toggleDetail(dataItem: any) {
        // dùng để tránh mở tất cả khi expand detail
        this.expandedItems[dataItem.Code] = !this.expandedItems[dataItem.Code];
        //nếu đã nhập name và id thì bỏ disable  
        if (Ps_UtilObjectService.hasValueString(dataItem.DataName) && Ps_UtilObjectService.hasValueString(dataItem.DataID)) {
            this.disableDes = false
            this.disableCof = false
            this.disableTypeData = false
            this.disableTypePopup = false
            this.disableOrderby = false
        }
        else {
            this.disableDes = true
            this.disableCof = true
            this.disableTypeData = true
            this.disableTypePopup = true
            this.disableOrderby = true
        }
    }

    //hàm check trường con thiếu
    validateObject(obj: any, requiredFields: any): string[] {
        const missingFields: string[] = [];
        requiredFields.forEach(field => {
            if (obj[field.field] === undefined || obj[field.field] === null) {
                missingFields.push(field);
            }
        });
        return missingFields;
    }


    //xử lý double
    onDoubleClick(dataItem: DTOSubFunction) {
        this.isEditing = true;
        this.isInput = true

        //copy lại giá trị ban đầu để so sánh
        this.oldValue = { ...dataItem }
    }


    //cập nhật
    onBlur(dataItem: DTOSubFunction, type: string) {

        dataItem.FunctionID = this.selectedItem.Code

        //kiểm tra nếu có thay đổi thì gọi api update
        if (this.isEditing && dataItem[type] !== this.oldValue[type]) {
            const requiredFields = [
                { field: 'TypeData', name: 'loại data tính năng chi tiết' },
                { field: 'TypePopup', name: 'loại popup tính năng chi tiết' },
                { field: 'OrderBy', name: 'thứ tự hiển thị tính năng chi tiết' },
                { field: 'DataID', name: 'mã tính năng chi tiết' },
                { field: 'DataName', name: 'tên tính năng chi tiết' },
            ];
            const missingFields = this.validateObject(dataItem, requiredFields);

            if (Ps_UtilObjectService.hasListValue(missingFields)) { //check trường còn thiếu
                missingFields.forEach((res: any) => this.layoutService.onWarning(`Vui lòng nhập trường ${res.name}`))
            }
            else {
                if (dataItem.Code == 0) { //tạo mới

                    if (!Ps_UtilObjectService.hasValueString(dataItem.DataName)) {
                        this.layoutService.onWarning(`Vui lòng nhập tên để tạo mới chi tiết tính năng`)
                    }
                    if (!Ps_UtilObjectService.hasValueString(dataItem.DataID)) {
                        this.layoutService.onWarning(`Vui lòng nhập mã để tạo mới chi tiết tính năng`)
                    }

                    if (Ps_UtilObjectService.hasValueString(dataItem.DataName) && Ps_UtilObjectService.hasValueString(dataItem.DataID)) {
                        this.disableDes = false
                        this.disableCof = false
                        this.disableTypeData = false
                        this.disableTypePopup = false
                        this.disableOrderby = false

                        this.dataDetailFunc = {
                            DTO: dataItem,
                            Properties: ['DataName', 'DataID', 'TypeData', 'TypePopup', 'OrderBy', 'IsSelected', 'FunctionID']
                        }
                        this.APIUpdateSupFunction(this.dataDetailFunc)
                    }

                }
                else { //cập nhật
                    //nếu đã nhập name và id thì bỏ disable  
                    if (Ps_UtilObjectService.hasValueString(dataItem.DataName) && Ps_UtilObjectService.hasValueString(dataItem.DataID)) {
                        this.disableDes = false
                        this.disableCof = false
                        this.disableTypeData = false
                        this.disableTypePopup = false
                        this.disableOrderby = false
                        this.dataDetailFunc = {
                            DTO: dataItem,
                            Properties: ['']
                        }

                        if (Ps_UtilObjectService.hasValueString(type)) {
                            this.dataDetailFunc.Properties = [type]
                            this.APIUpdateSupFunction(this.dataDetailFunc)
                        }

                    }
                    else {
                        this.disableDes = true
                        this.disableCof = true
                        this.disableTypeData = true
                        this.disableTypePopup = true
                        this.disableOrderby = true

                        if (!Ps_UtilObjectService.hasValueString(dataItem.DataName)) {
                            this.layoutService.onWarning(`Vui lòng nhập tên tính năng chi tiết`)
                        } else if (!Ps_UtilObjectService.hasValueString(dataItem.DataID)) {
                            this.layoutService.onWarning(`Vui lòng nhập mã tính năng chi tiết`)
                        }


                    }
                }

            }
        }
        this.isEditing = false;
        this.isInput = false
    }

    // tạo ra row item mới trong detail function
    onCreateDetailFunc() {
        let isExistCode0 = this.popupGridData.filter(res => res.Code == 0)

        //kiểm tra nếu đã tạo tính năng chi tiết trước đó nhưng không nhập thông tin thì không cho tạo nữa tránh spam row
        if (Ps_UtilObjectService.hasListValue(isExistCode0)) {
            this.layoutService.onWarning(`Không thể tạo mới vì bạn chưa nhập thông tin tính năng chi tiết được tạo trước đó`)
        }
        else {
            let newDetail: DTOSubFunction = new DTOSubFunction()
            this.popupGridData.unshift(newDetail);
            this.lengOfArrDetailFunc = this.popupGridData.length // số item trong ListSubFunction


            //tắt hết các item chi tiết còn đang expand
            for (let key in this.expandedItems) {
                if (this.expandedItems.hasOwnProperty(key)) {
                    this.expandedItems[key] = false;
                }
            }
            this.cdr.detectChanges();
        }
    }

    //mở dialog xóa func detail
    onToggleDelDetailFunc(dataItem?) {
        this.delDetailFunc = dataItem
        this.openedDialogDetailFunc = !this.openedDialogDetailFunc;
    }

    // xóa tính năng chi tiết
    onDeleteDetailFunc(status: string) {
        if (status == 'yes') {

            if (this.delDetailFunc.Code != 0 && Ps_UtilObjectService.hasValueString(this.delDetailFunc.DataName) && Ps_UtilObjectService.hasValueString(this.delDetailFunc.DataID)) {
                this.APIDeleteSupFunction(this.delDetailFunc)
                this.openedDialogDetailFunc = false;
                this.popupGridData = this.popupGridData.filter(res => res.Code !== this.delDetailFunc.Code)
            }
            else {  //xóa row empty khi người dùng không muốn thêm mới nữa
                this.popupGridData.shift()
                this.lengOfArrDetailFunc = this.popupGridData.length // số item trong ListSubFunction
                this.openedDialogDetailFunc = false;
            }
        } else {
            this.openedDialogDetailFunc = false;
        }
    }
    //#endregion


    //#region hàm dùng chung 
    currentDrawer: string = null; // drawer hiện tại
    currentDto: DTOModule | DTOFunction | DTOAction; // Biến để theo dõi loại DTO hiện tại
    @ViewChild('Drawer') Drawer: MatSidenav; // dùng để on/off Drawer 

    /**
     * 
     * @param type cho biết đó là loại đối tượng nào Module, Funciton, Action
     * @param action cho biết đó là loại hành động nào update, create
     * @param data nếu có là cập nhật thì cung cấp data của đối tượng đó để bind giá trị và form
     */

    onOpenDrawer(action: string, type?: string, data?: DTOModule | DTOFunction | DTOAction, level?: string) {

        // check type form theo "data"
        if (Ps_UtilObjectService.hasValue(data)) {
            this.currentDrawer = this.onCheckUniqueFieldsType(data)
        }


        // check type form theo "type"
        Ps_UtilObjectService.hasValueString(type) ? this.currentDrawer = type : this.currentDrawer = null
        switch (this.currentDrawer) {
            case 'module':
                this.currentDto = new DTOModule();
                break;
            case 'function':
                this.currentDto = new DTOFunction();
                break;
            case 'action':
                this.currentDto = new DTOAction();
                break;
            default:
                break;
        }


        // Cập nhật form dựa trên loại DTO mới
        this.MultiOOPForm = this.handleCreateForm(this.currentDto);
        this.MultiOOPForm.patchValue(data); //xem lại dòng này có ca26nt thiết hay không
        this.isChildAction = false
        if (action === 'create') {
            if (level == 'sameLevel') { //tạo cùng cấp
                if (this.currentDrawer === 'module' || this.currentDrawer === 'function') {
                    let formControl = this.currentDrawer === 'module' ? 'GroupID' : 'ModuleID';
                    this.MultiOOPForm.patchValue({ [formControl]: { Code: this.defaultParent.Code, Vietnamese: this.defaultParent.Vietnamese } });
                    let level = this.currentDrawer === 'module' ? 1 : 2;

                    //nếu item module hiện tại có cha khi tạo cùng cấp thì lấy id cha của item này gán vào form 
                    if (this.currentDrawer === 'module') {
                        let changeValue = new DTOModule()

                        if (this.onCheckUniqueFieldsType(this.selectedItem) == 'function') { //nếu item được chọn là fun thì lấy ModuleID để tìm cấp cha
                            changeValue.GroupID = this.selectedItem.ModuleID
                        }
                        else if (this.onCheckUniqueFieldsType(this.selectedItem) == 'module') {
                            changeValue.GroupID = this.selectedItem.GroupID
                        }
                        this.APIGetListModuleTree(level, {}, changeValue, null)
                        if (Ps_UtilObjectService.hasValue(this.selectedItem.GroupID) || Ps_UtilObjectService.hasValue(this.selectedItem.ModuleID)) {
                            this.MultiOOPForm.patchValue({
                                GroupID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                            })
                        }
                    }
                    else if (this.currentDrawer == 'function') {
                        let changeValue = new DTOFunction()
                        if (this.onCheckUniqueFieldsType(this.selectedItem) == 'function') { //nếu item được chọn là fun thì lấy ModuleID để tìm cấp cha
                            changeValue.ModuleID = this.selectedItem.ModuleID
                        }
                        else if (this.onCheckUniqueFieldsType(this.selectedItem) == 'module') {
                            changeValue.ModuleID = this.selectedItem.GroupID
                        }
                        this.APIGetListModuleTree(level, {}, changeValue, null)
                        if (Ps_UtilObjectService.hasValue(this.selectedItem.ModuleID) || Ps_UtilObjectService.hasValue(this.selectedItem.GroupID)) {
                            this.MultiOOPForm.patchValue({
                                ModuleID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                            })
                        }
                    }
                }
                if (this.currentDrawer == 'action') {
                    let dataAction = this.selectedItem as DTOAction
                    let param = { Code: 0, FunctionID: dataAction.FunctionID }
                    this.APIGetListActionTree(param, dataAction, 'new')
                    this.MultiOOPForm.patchValue({
                        FunctionName: dataAction.FunctionName,
                        ModuleName: dataAction.ModuleName,
                        ModuleID: dataAction.ModuleID,
                        FunctionID: dataAction.FunctionID,
                        // ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                    });

                }
            }
            else if (level == 'childLevel') { //tạo cấp con trong item cha

                if (this.currentDrawer === 'module' || this.currentDrawer === 'function') {
                    let dataModule = this.selectedItem as DTOModule;
                    let formControl = this.currentDrawer === 'module' ? 'GroupID' : 'ModuleID';
                    this.MultiOOPForm.patchValue({ [formControl]: { Code: dataModule.Code, Vietnamese: dataModule.Vietnamese } });
                    let level = this.currentDrawer === 'module' ? 1 : 2;
                    this.APIGetListModuleTree(level, {}, null, null)

                }


                if (this.currentDrawer == 'action') {
                    //kiểm tra đối tượng chọn tạo Action là gi để fill trường Module/Funciton 
                    let checkTypeSelectCreateActtion = this.onCheckUniqueFieldsType(this.selectedItem)

                    //trường hợp chọn option thêm Action từ đối tượng Action, fill data Module/Funciton
                    if (checkTypeSelectCreateActtion == 'action') {
                        this.isChildAction = true
                        let dataAction = this.selectedItem as DTOAction
                        let param = { Code: 0, FunctionID: dataAction.FunctionID }
                        this.APIGetListActionTree(param, dataAction, 'new')

                        this.MultiOOPForm.patchValue({
                            FunctionName: dataAction.FunctionName,
                            ModuleName: dataAction.ModuleName,
                            ModuleID: dataAction.ModuleID,
                            FunctionID: dataAction.FunctionID,
                            // ParentID: { Code: dataAction.Code, ActionName: dataAction.ActionName }
                        });


                    }

                    //trường hợp chọn option thêm Action từ đối tượng function, fill data Module/Funciton  
                    else if (checkTypeSelectCreateActtion == 'function') {
                        let dataAction = this.selectedItem as DTOFunction
                        this.currentParentIDAction = this.defaultParentAction;
                        this.MultiOOPForm.patchValue({
                            FunctionName: dataAction.Vietnamese,
                            ModuleName: dataAction.ModuleName,
                            ModuleID: dataAction.ModuleID,
                            FunctionID: dataAction.Code,
                            ParentID: { Code: null, ActionName: 'Không lựa chọn' }
                        });
                        let param = {
                            Code: 0,
                            FunctionID: dataAction.Code,
                        }
                        this.APIGetListActionTree(param, {}, 'new')


                    }

                }
            }
        }

        // Mở drawer 
        this.Drawer.open()
    }

    // hàm kiểm tra thiếu trường bắt buộc trong form
    getInvalidFields(controls: any): string[] {
        return Object.keys(controls).reduce((invalidFields, key) => {
            if (controls[key].status === "INVALID") {
                invalidFields.push(key);
            }
            return invalidFields;
        }, []);
    }

    // flagShowCharDetail: boolean = false
    // Hàm tạo mới/câp nhật
    onSubmitForm() {
        this.MultiOOPForm.markAsTouched();
        const checkFormType = this.onCheckUniqueFieldsType(this.MultiOOPForm.value)

        if (this.MultiOOPForm.valid) {
            if (checkFormType === 'module') {  // thêm mới - cập nhật module

                let dataForSubmit = this.MultiOOPForm.value


                //check module này chuyển sang con module khác
                if (Ps_UtilObjectService.hasListValue(dataForSubmit.GroupID.Code) &&
                    Ps_UtilObjectService.hasListValue(dataForSubmit.ListGroup)
                ) {
                    this.layoutService.onWarning(`Không thể chuyển tới Module ${dataForSubmit.GroupID.Vietnamese} vì đang có module con`);
                }
                else {
                    this.APIUpdateModule(this.MultiOOPForm.value)
                }
            }
            else if (checkFormType === 'function') {

                if (Ps_UtilObjectService.hasValue(this.MultiOOPForm.value.ModuleID.Code)) {
                    this.APIUpdateFunction(this.MultiOOPForm.value)
                    // this.flagShowCharDetail = true
                    // console.log(this.MultiOOPForm.value);
                }
                else {
                    this.layoutService.onWarning(`Vui lòng chọn trường Module`);
                }
            }
            else if (checkFormType === 'action') {
                this.APIUpdateAction(this.MultiOOPForm.value)
                // console.log(this.MultiOOPForm.value);

            }


        }
        else {
            const invalidFields = this.getInvalidFields(this.MultiOOPForm.controls);
            const fieldTranslations = {
                'Vietnamese': this.currentDrawer == 'module' ? 'Tên module' : 'Tên tính năng',
                "ModuleID": this.currentDrawer == 'module' ? 'Mã Module' : 'Nhóm cấp cha',
                "DLLPackage": 'DLL Package',
                "TypeData": 'Loại data',
                "ActionName": 'Tên chức năng',
                "FunctionID": 'Mã tính năng'

            };

            invalidFields.forEach((field) => {
                const translatedField = fieldTranslations[field] || field;
                this.layoutService.onWarning(`Vui lòng điền vào trường ${translatedField}`);
            });

        }

    }


    // Hàm đóng drawer
    onCloseDrawer() {
        this.Drawer.close()
        this.MultiOOPForm.reset();
    }

    // Hàm tạo form dựa trên DTO
    // Trường chỉ có trong DTOModule: "APIPackage" 
    // Trường chỉ có trong DTOFunction: "DLLPackage"
    // Trường chỉ có trong DTOAction: ["ActionName","ModuleName","FunctionName","ParentID","FunctionID"]
    handleCreateForm(dto: DTOModule | DTOFunction | DTOAction): UntypedFormGroup {
        const formGroup = this.formBuilder.group({});

        // Duyệt qua các thuộc tính bắt buộc của DTO và thêm vào form với validators (nếu cần)
        Object.keys(dto).forEach(key => {
            if (key === 'Vietnamese' || key === 'Code' || key === 'ModuleID' || key === 'IsVisible'
                || key === 'DLLPackage' || key === 'ActionName' || key === 'FunctionName') {
                // Nếu là một trong các trường bắt buộc, thêm vào form với validators (nếu cần)
                formGroup.addControl(key, this.formBuilder.control(dto[key], Validators.required));
            } else if ((dto instanceof DTOFunction || dto instanceof DTOAction) && key === 'TypeData') {
                // Kiểm tra TypeData của DTOFunction hoặc DTOAction để áp dụng Validators.required
                formGroup.addControl(key, this.formBuilder.control(dto[key], Validators.required));
            } else if (dto instanceof DTOFunction && key === 'ModuleName') {
                // Đối với DTOFunction, không coi ModuleName là trường bắt buộc
                formGroup.addControl(key, this.formBuilder.control(dto[key]));
            } else {
                // Nếu không phải trường bắt buộc, thêm vào form mà không cần validators
                formGroup.addControl(key, this.formBuilder.control(dto[key]));
            }
        });

        return formGroup;
    }


    // Hàm kiểm trả data có kiểu dữ liệu là gì Module, Function, Action
    onCheckUniqueFieldsType(dto: DTOModule | DTOFunction | DTOAction): string | null {
        // Trường chỉ có trong DTOModule
        const uniqueFieldInModule = "GroupID";
        // Trường chỉ có trong DTOFunction
        const uniqueFieldInFunction = "DLLPackage";
        // Trường chỉ có trong DTOAction
        const uniqueFieldsInAction = ["ActionName", "ModuleName", "FunctionName", "ParentID", "FunctionID"];

        // Kiểm tra và trả về loại DTO cụ thể
        if (dto.hasOwnProperty(uniqueFieldInModule)) {
            return 'module';
        } else if (dto.hasOwnProperty(uniqueFieldInFunction)) {
            return 'function';
        } else if (uniqueFieldsInAction.every(field => dto.hasOwnProperty(field))) {
            return 'action';
        }

        // Trường hợp không khớp với bất kỳ loại nào
        return null;
    }


    // Hàm chọn giá trị cho Nhóm cấp cha của Module, Module của drawer funciton, Nhóm cấp cha của chức năng
    onSelectedDropdownList(value: any) {

        if (this.currentDrawer === 'module') {
            // Sử dụng type assertion để bảo vệ kiểu dữ liệu
            const moduleOrFunctionValue = value as DTOModule;
            this.currentParentID = moduleOrFunctionValue
            this.MultiOOPForm.patchValue({
                GroupID: { Code: moduleOrFunctionValue.Code, Vietnamese: moduleOrFunctionValue.Vietnamese }
            })

        } else if (this.currentDrawer === 'action') {
            // Sử dụng type assertion để bảo vệ kiểu dữ liệu
            const actionValue = value as DTOAction;
            this.currentParentIDAction = actionValue

            this.MultiOOPForm.patchValue({
                ParentID: { Code: actionValue.Code, ActionName: actionValue.ActionName },
            });
        } else if (this.currentDrawer === 'function') {
            // Sử dụng type assertion để bảo vệ kiểu dữ liệu
            const moduleOrFunctionValue = value as DTOFunction;
            this.currentParentID = moduleOrFunctionValue
            this.MultiOOPForm.patchValue({
                ModuleID: { Code: moduleOrFunctionValue.Code, Vietnamese: moduleOrFunctionValue.Vietnamese }
            })
        }
    }

    // Hàm dùng để khi bấm ra ngoài thì drawer không bị đóng 
    onKeydownEnter(e: KeyboardEvent) {
        //disable close drawer
        e.preventDefault();
        e.stopPropagation();
    }
    //#endregion  hàm dùng chung 


    //#region =========================== SEARCH 
    onSearch(val: any) { // nhấn search sẽ chạy hàm này
        this.searchData.filter.filters = val.filters
        this.loadData();
    }

    loadData(): void {
        this.loadFilterTree();
        const allData = this.fetchChildren();
        this.rootData = allData.filter(this.filterFunction);
    }


    loadFilterTree() { //load filter cho tree
        this.filterValue.filter.filters = []
        if (Ps_UtilObjectService.hasValue(this.searchData)) {
            if (Ps_UtilObjectService.hasListValue(this.searchData.filter.filters)) {
                this.filterValue.filter.filters.push(this.searchData.filter)
            }
        }
    }

    //đệ qui để filter
    filterFunction = (item: DTOModule | DTOFunction): boolean => {
        if (!this.filterValue.filter || this.filterValue.filter.filters.length === 0) {
            return true;
        }
        const matchesFilterValue = filterBy([item], this.filterValue.filter).length > 0;
        if (matchesFilterValue) {
            return true;
        }
        // Kiểm tra nếu còn item thì đệ quy để filter tiếp
        if (item && ('ListGroup' in item || 'ListFunctions' in item || 'ListAction' in item)) {
            const children = this.fetchChildren(item);
            return children.some(child => this.filterFunction(child));
        }
        return false;
    };



    //reset search 
    onResetFilter(e?) {
        this.loadData();

        //expand hết item đang bị thu lại khi nhấn reset
        if (Ps_UtilObjectService.hasListValue(this.itemCollapsed)) {
            this.itemCollapsed.forEach(id => {
                if (Ps_UtilObjectService.hasValue(id)) {
                    this.treeListSystem.expand(id);
                }
            });
        }
    }

    //#endregion


    //#region =========================== treelist 

    // hàm lấy lên các child của mỗi đối tượng load lên grid
    fetchChildren = (parent?: any): any[] => {
        if (parent && (parent.ListGroup || parent.ListFunctions || parent.ListAction)) {
            let children: Array<DTOModule | DTOFunction | DTOAction> = [];

            if (Ps_UtilObjectService.hasListValue(parent.ListGroup)) {
                const filterListGroup = parent.ListGroup.filter(this.filterFunction);
                children = children.concat(filterListGroup);
            }

            if (Ps_UtilObjectService.hasListValue(parent.ListFunctions)) {
                const filterListFunc = parent.ListFunctions.filter(this.filterFunction);
                children = children.concat(filterListFunc);
            }
            if (Ps_UtilObjectService.hasListValue(parent.ListAction)) {
                const filterListAct = parent.ListAction.filter(this.filterFunction);
                children = children.concat(filterListAct);
            }
            return children;
        }
        return parent ? [] : this.listSysTreeList.filter(this.filterFunction);
    }

    //Kiểm tra có cấp con không
    hasChildren(item: any): boolean {
        this.isLoading = true;
        const children = this.fetchChildren(item);
        return children && children.length > 0;
    }


    // ẩn/hiện button thêm Module - Function - Action
    selectionChange(e: SelectionChangeEvent) {
        let dataItem: any = {}
        this.showBtnAddModule = false
        this.showBtnAddModuleChild = false

        this.showBtnAddFunc = false
        this.showBtnAddFuncChild = false

        this.showBtnAddAct = false
        this.showBtnAddActChild = false

        if (e.action == 'select') {
            e.items.map((i) => { dataItem = i.dataItem }) //lấy ra dataItem
            // console.log('dataItem: ', dataItem);

            if (dataItem.hasOwnProperty("ListGroup") && dataItem.hasOwnProperty("ListFunctions")) { //item module
                this.selectedItem = dataItem
                this.showBtnAddModule = true
                this.showBtnAddModuleChild = true
                this.showBtnAddFuncChild = true
                if (Ps_UtilObjectService.hasValue(dataItem.GroupID)) { //có cha = module level 2 => không được thêm module level 3, chỉ được thêm đồng cấp
                    this.showBtnAddFunc = true
                    this.showBtnAddModuleChild = false
                }
            }
            else if (dataItem.hasOwnProperty("DLLPackage")) { //item function
                this.showBtnAddModule = true
                this.showBtnAddFunc = true
                this.showBtnAddActChild = true

                // Function level 3
                const level = this.onFindLevel(this.originalData, dataItem.Code);

                if (level == 3) {
                    this.showBtnAddModule = false
                    this.showBtnAddFunc = true
                    this.showBtnAddActChild = true
                }
                this.selectedItem = dataItem
            }
            else if (dataItem.hasOwnProperty("ActionName")) { //item action
                this.showBtnAddAct = true
                this.showBtnAddActChild = true
                this.selectedItem = dataItem
            }

        }

    }


    // hàm tìm level của đối tượng 
    onFindLevel(items: any[], targetCode: number, currentLevel = 1): number | undefined {
        // Kiểm tra từng đối tượng trong mảng
        for (const item of items) {
            if (item.Code === targetCode) {
                return currentLevel; // Tìm thấy đối tượng, trả về level hiện tại
            }

            // Đệ quy tìm kiếm trong các nhóm và chức năng con
            const levelInGroup = this.onFindLevel(item.ListGroup || [], targetCode, currentLevel + 1);
            if (levelInGroup !== undefined) {
                return levelInGroup;
            }

            const levelInFunction = this.onFindLevel(item.ListFunctions || [], targetCode, currentLevel + 1);
            if (levelInFunction !== undefined) {
                return levelInFunction;
            }
        }

        return undefined; // Không tìm thấy đối tượng trong mảng
    }
    //#endregion


    //#region =========================== dropdownbutton  
    @ViewChildren('anchor') anchors;
    @HostListener('document:click', ['$event'])
    clickout(event) { //sự kiện click ra ngoài đóng popup action
        var anchor = this.getAnchor()
        if (Ps_UtilObjectService.hasValue(anchor)) {
            if (!anchor.nativeElement.contains(event.target)
                && this.popupShow == true) {
                this.popupShow = false
            }
        }
        this.cdr.detectChanges();
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


    //mở popup dropdown trong button action 
    togglePopup(index, item) {
        this.selectedItem = {}
        // nêu function có ListSubFunction và có giá trị thì gán length
        if (item.TypeData == 5 && item.hasOwnProperty("ListSubFunction")) {
            this.lengOfArrDetailFunc = item.ListSubFunction.length // số item trong ListSubFunction
        }

        event.stopPropagation()
        // const popupElement = this.el.nativeElement.querySelector('.stylePopup');
        // const rect = popupElement.getBoundingClientRect();
        //  const topValue = rect.top;

        //kiểm tra index để đóng mở popup
        if (index != this.currentAnchorIndex) {
            this.popupShow = true
        } else if (index == this.currentAnchorIndex) {
            this.popupShow = !this.popupShow
        }
        if (this.popupShow) {
            this.selectedItem = item
            this.onOpenDropDownList(item)
        }

        this.currentAnchorIndex = index
        // this.currentRowItem = item
    }


    // hàm hiện option theo các item tương ứng
    onOpenDropDownList(data: any) {
        this.OptionTool = []
        this.delItem = data
        this.checkbtnDel = false
        this.OptionTool = [
            {
                id: 0,
                text: 'Chỉnh sửa',
                icon: 'k-i-pencil'
            },
        ];

        if (data.hasOwnProperty("ListGroup") && data.hasOwnProperty("ListFunctions")) { //module

            this.OptionTool.push(
                { id: 1, text: 'Thêm mới Module', imageUrl: 'assets/img/icon/icon_site_map.svg' },
                { id: 1, text: 'Thêm mới Module con', imageUrl: 'assets/img/icon/icon_site_map.svg' },
                { id: 2, text: 'Thêm mới tính năng con', imageUrl: 'assets/img/icon/icon_server.svg' },
            )

            if (Ps_UtilObjectService.hasValue(data.GroupID)) { //có cha = module level 2 = không được thêm module level 3
                this.OptionTool.splice(2, 1);
                this.OptionTool.splice(2, 0, { id: 2, text: 'Thêm mới tính năng', imageUrl: 'assets/img/icon/icon_server.svg' })
            }

            // xóa khi không có child
            if (data.ListGroup == null && data.ListFunctions.length == 0) {
                this.OptionTool.push({ id: 4, text: 'Xóa Module', icon: 'k-i-trash' })
                this.checkbtnDel = true
            }

        }
        else if (data.hasOwnProperty("DLLPackage")) { //function
            this.OptionTool.push(
                { id: 1, text: 'Thêm mới Module', imageUrl: 'assets/img/icon/icon_site_map.svg' },
                { id: 2, text: 'Thêm mới tính năng', imageUrl: 'assets/img/icon/icon_server.svg' },
                { id: 3, text: 'Thêm mới chức năng con', icon: 'k-i-share' },
            )


            //Function level 3
            const level = this.onFindLevel(this.originalData, data.Code);
            if (level == 3) {
                this.OptionTool.splice(1, 1);
            }


            // xóa khi không có child
            if (data.ListAction.length == 0) {
                this.OptionTool.push({ id: 4, text: 'Xóa tính năng', icon: 'k-i-trash' })
                this.checkbtnDel = true
            }
        }
        else if (data.hasOwnProperty("ActionName")) { //action
            this.OptionTool.push(
                { id: 3, text: 'Thêm mới chức năng', icon: 'k-i-share' },
                { id: 3, text: 'Thêm mới chức năng con', icon: 'k-i-share' },
            )

            if (data.ListAction == null) { //không có child
                this.OptionTool.push(
                    { id: 4, text: 'Xóa chức năng', icon: 'k-i-trash' },
                )
                this.checkbtnDel = true
            }

        }

    }


    // xử lý act trong popup    
    onActionDropdownBtn(action: { id: number, icon?: string, imageUrl?: string, text: string }) {
        let data = this.selectedItem
        switch (action.id) {
            case 0: //chỉnh sửa 
                this.currentDrawer = this.onCheckUniqueFieldsType(data)
                this.onOpenDrawer('update', this.currentDrawer, data);

                if (this.currentDrawer == 'module') {
                    if (Ps_UtilObjectService.hasValue(data.GroupID)) { //trường hợp có cha   
                        // this.APIGetListModuleTree(2, {}, this.selectedItem);
                        this.APIGetListModuleTree(1, {}, this.selectedItem);
                        this.MultiOOPForm.patchValue({
                            GroupID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                        })
                    } else { //trường hợp không có parent   
                        this.MultiOOPForm.patchValue({
                            GroupID: { Code: null, Vietnamese: 'Không lựa chọn' }
                        })
                        this.APIGetListModuleTree(1, data, this.selectedItem);
                    }
                }
                else if (this.currentDrawer == 'function') {
                    if (Ps_UtilObjectService.hasValue(data.ModuleID)) {
                        this.APIGetListModuleTree(2, {}, this.selectedItem);
                        this.MultiOOPForm.patchValue({
                            ModuleID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                        })
                    }
                }

                else if (this.currentDrawer == 'action') {
                    if (Ps_UtilObjectService.hasValue(data.ParentID)) { //có cha
                        this.APIGetListActionTree(data as DTOAction, {}, 'edit');

                        this.MultiOOPForm.patchValue({
                            ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                        })
                    }
                    else if (data.ParentID === null) { //không cha
                        this.APIGetListActionTree(data as DTOAction, {});
                        this.currentParentIDAction = this.defaultParentAction;
                        this.MultiOOPForm.patchValue({
                            ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                        })

                    }
                }
                break;

            case 1: // thêm mới Module
                if (action.text == 'Thêm mới Module') {
                    this.onOpenDrawer('create', 'module', null, 'sameLevel');
                }
                else if (action.text == 'Thêm mới Module con') {
                    this.selectedItem = data
                    this.onOpenDrawer('create', 'module', null, 'childLevel');
                }
                break;

            case 2: // thêm mới tính năng
                if (action.text == 'Thêm mới tính năng') {
                    this.onOpenDrawer('create', 'function', null, 'sameLevel');
                }
                else if (action.text == 'Thêm mới tính năng con') {
                    this.selectedItem = data
                    this.onOpenDrawer('create', 'function', null, 'childLevel');
                }
                break;

            case 3: // thêm mới chức năng
                if (action.text == 'Thêm mới chức năng') {
                    this.onOpenDrawer('create', 'action', null, 'sameLevel');
                }
                else if (action.text == 'Thêm mới chức năng con') {
                    this.selectedItem = data
                    this.onOpenDrawer('create', 'action', null, 'childLevel');
                }
                break;

            case 4: //xóa 
                this.opened = true
                break;
            default:
                break;
        }
    }



    isPopupVisible() {
        return this.popupShow ? 'visible' : 'hidden'
    }
    //#endregion


    //#region =========================== dialog confirm delete
    onToggleDialog(): void {
        this.opened = !this.opened;
    }

    onDeleteDialog(status: string): void {
        if (status == 'yes') {
            let checktype = this.onCheckUniqueFieldsType(this.delItem)
            if (checktype == 'module') {
                this.APIDeleteModule(this.delItem)
            } else if (checktype == 'function') {
                this.APIDeleteFunction(this.delItem)
            } else if (checktype == 'action') {
                this.APIDeleteAction(this.delItem)
            }
            this.opened = false;
        } else {
            this.opened = false;
        }
    }
    //#endregion

    //#region =========================== Các Hàm đệ qui 
    // đệ qui tìm cha module
    findParentModule(code: string, nodes: any[]): any {
        for (let node of nodes) {
            if (node.Code === code) {
                return node; // tìm thấy cha
            } else if (node.ListGroup && node.ListGroup.length > 0) {
                // nếu có các nút con, tiếp tục tìm kiếm ở cấp dưới
                let foundParent = this.findParentModule(code, node.ListGroup);
                if (foundParent) {
                    return foundParent; // Nếu tìm thấy ở cấp dưới, trả về nút cha
                }
            }
        }
        return null; // Không tìm thấy cha
    }

    // đệ qui tìm cha action
    findParentAction(code: string, nodes: any[]): any {
        for (let node of nodes) {
            if (node.Code === code) {
                return node; // tìm thấy cha
            } else if (node.ListAction && node.ListAction.length > 0) {
                // nếu có các nút con, tiếp tục tìm kiếm ở cấp dưới
                let foundParent = this.findParentAction(code, node.ListAction);
                if (foundParent) {
                    return foundParent; // Nếu tìm thấy ở cấp dưới, trả về nút cha
                }
            }
        }
        return null; // Không tìm thấy cha
    }


    //đệ qui tìm vị trí action để lọc danh sách nhóm cấp cha không chứa nó (trường hợp có cha)
    // findCodeAction(code: number, nodes: any[]) {
    //     for (let i = 0; i < nodes.length; i++) {
    //         if (nodes[i].Code === code) {
    //             return nodes[i].Code
    //         }
    //         else if (nodes[i].ListAction) { //nếu tìm không ra thì tìm tiếp trong ListAction 
    //             const nestedResult = this.findCodeAction(code, nodes[i].ListAction)
    //             if (nestedResult) {
    //                 return nestedResult
    //             }
    //         }
    //     }
    //     return null
    // } 


    //đệ qui lọc action con ra khỏi danh sách để trách trường hợp chọn chính nó trong nhóm cấp cha
    filterArrayWithoutCode = (code: number, arr: any[]) => {
        return arr.filter((item: any) => {
            const isCodeMatch = item.Code === code;

            if (isCodeMatch) {
                return false;  // Loại bỏ đối tượng có Code được truyền vào
            }
            // đệ quy cho mảng con để loại bỏ code được truyền vào
            if (item.ListAction) {
                item.ListAction = this.filterArrayWithoutCode(code, item.ListAction);
            }
            // Giữ lại đối tượng nếu không chứa Code được truyền vào
            return !isCodeMatch;
        });
    };
    //#endregion


    //#region =========================== API    
    // module
    APIGetListSysStructureTree() {
        let ctx = `Lấy danh sách cấu trúc hệ thống`
        this.isLoading = true;
        this.apiService.GetListSysStructureTree().pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.rootData = res.ObjectReturn
                this.listSysTreeList = res.ObjectReturn
                this.originalData = res.ObjectReturn
                this.loadData()
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
        })
    }

    APIGetListModuleTree(level: number, dtoModule?: any, paramParent?: any, type?: string) {
        let ctx = `Lấy danh sách module`;
        this.loading = true;
        this.apiService.GetListModuleTree(level, dtoModule)
            .pipe(takeUntil(this.ngUnsubscribe$))
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                        this.listModuleTree = res.ObjectReturn;
                        this.listModuleTree.unshift(this.defaultParent);

                        if (paramParent) {//tìm cha khi item đó có cha  
                            if (type == 'new') { // tạo mới 
                                this.currentParentID = this.findParentModule(paramParent.Code, this.listModuleTree);
                            } else { //chỉnh sửa
                                if (this.currentDrawer == 'module') {
                                    this.listModuleTree.filter((lv1) => {
                                        if (lv1.Code === paramParent.GroupID) {
                                            this.currentParentID = lv1;
                                        }
                                    });

                                    this.MultiOOPForm.patchValue({
                                        GroupID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                                    })
                                }
                                else if (this.currentDrawer == 'function') {
                                    this.currentParentID = this.findParentModule(paramParent.ModuleID, this.listModuleTree);
                                    this.MultiOOPForm.patchValue({
                                        ModuleID: { Code: this.currentParentID.Code, Vietnamese: this.currentParentID.Vietnamese }
                                    })
                                }
                            }
                        }
                    } else {
                        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                    }
                },
                (error) => {
                    this.loading = false;
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
                }
            );
    }


    APIUpdateModule(dtoModule: DTOModule | any) {
        let GroupID = dtoModule.GroupID.Code
        dtoModule.GroupID = GroupID
        dtoModule as DTOModule

        let ctx = `${dtoModule.Code == 0 ? 'Tạo mới' : 'Cập nhật'} module`
        this.isLoading = true;
        this.apiService.UpdateModule(dtoModule).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {

                this.layoutService.onSuccess(`${ctx} thành công`)
                this.APIGetListSysStructureTree()


                // đóng drawer và reset form sau khi cập nhật/thêm mới
                this.Drawer.close()
                this.MultiOOPForm.reset()

                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false

                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}

            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
        })
    }

    APIDeleteModule(dtoModule: DTOModule) {
        let ctx = `Xóa module`
        this.isLoading = true;
        this.apiService.DeleteModule(dtoModule).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // đóng drawer và reset form sau khi xóa
                this.Drawer.close()
                this.MultiOOPForm.reset()
                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false

                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
                this.Drawer.close()

            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
            this.Drawer.close()

        })
    }


    //function
    APIUpdateFunction(dtoFunction: DTOFunction | any) {
        let ModuleID = dtoFunction.ModuleID.Code
        dtoFunction.ModuleID = ModuleID
        dtoFunction as DTOFunction
        let ctx = `${dtoFunction.Code == 0 ? 'Tạo mới' : 'Cập nhật'} tính năng`
        this.isLoading = true;
        this.apiService.UpdateFunction(dtoFunction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // đóng drawer và reset form sau khi cập nhật/thêm mới
                this.Drawer.close()
                this.MultiOOPForm.reset()

                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false

                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
        })
    }

    APIDeleteFunction(dtoFunction: DTOFunction) {
        let ctx = `Xóa tính năng`
        this.isLoading = true;
        this.apiService.DeleteFunction(dtoFunction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // đóng drawer và reset form sau khi xóa
                this.Drawer.close()
                this.MultiOOPForm.reset()
                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false

                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
                this.Drawer.close()

            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
            this.Drawer.close()

        })
    }


    // action
    APIGetListActionTree(DTOAction: any, paramParent?: any, type?: string) {
        let ctx = `Lấy danh sách chức năng `;
        this.loading = true
        this.apiService.GetListActionTree(DTOAction)
            .pipe(takeUntil(this.ngUnsubscribe$))
            .subscribe(
                (res) => {
                    this.loading = false;
                    if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                        this.listActionTree = res.ObjectReturn;
                        this.listActionTree.unshift(this.defaultParentAction);

                        if (paramParent) {
                            if (type == 'new') { //tạo mới  
                                // luồng tạo cùng cấp
                                if (Ps_UtilObjectService.hasValue(paramParent.ParentID)) { //có cha thì set giá trị cho dropdown khi tạo mới cùng cấp
                                    this.currentParentIDAction = this.findParentAction(paramParent.ParentID, this.listActionTree);
                                    this.MultiOOPForm.patchValue({
                                        ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                                    })

                                } else { //không cha thì set default
                                    this.currentParentIDAction = this.defaultParentAction
                                    this.MultiOOPForm.patchValue({
                                        ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                                    })
                                }


                                // luồng tạo cấp con: lấy Code của item đang được chọn làm parentID cho cấp con
                                if (this.isChildAction == true) {
                                    this.currentParentIDAction = this.findParentAction(paramParent.Code, this.listActionTree);
                                    this.MultiOOPForm.patchValue({
                                        ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                                    })
                                }

                            } else if (type == 'edit') { //click chỉnh sửa tìm cha 

                                this.currentParentIDAction = this.findParentAction(DTOAction.ParentID, this.listActionTree);

                                //DTOAction.Code lấy Action con hiện tại, đệ qui lọc nó ra khỏi danh sách nhóm cấp cha
                                if (Ps_UtilObjectService.hasValue(DTOAction.ParentID)) {
                                    this.listActionTree = this.filterArrayWithoutCode(DTOAction.Code, this.listActionTree)
                                }

                                this.MultiOOPForm.patchValue({
                                    ParentID: { Code: this.currentParentIDAction.Code, ActionName: this.currentParentIDAction.ActionName }
                                })
                            }
                        }
                    } else {
                        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`);
                    }
                },
                (error) => {
                    this.loading = false
                    this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`);
                }
            );
    }

    APIUpdateAction(dtoAction: DTOAction | any) {
        let ParentID = dtoAction.ParentID.Code
        dtoAction.ParentID = ParentID
        dtoAction as DTOAction
        let ctx = `${dtoAction.Code == 0 ? 'Tạo mới' : 'Cập nhật'} chức năng`
        this.isLoading = true;
        this.apiService.UpdateAction(dtoAction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // đóng drawer và reset form sau khi xóa
                this.Drawer.close()
                this.MultiOOPForm.reset()

                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false

                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
        })
    }

    APIDeleteAction(dtoAction: DTOAction) {
        let ctx = `Xóa tính năng`
        this.isLoading = true;
        this.apiService.DeleteAction(dtoAction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // đóng drawer và reset form sau khi cập nhật/thêm mới
                this.Drawer.close()
                this.MultiOOPForm.reset()

                this.showBtnAddModule = true
                this.showBtnAddModuleChild = false

                this.showBtnAddFunc = false
                this.showBtnAddFuncChild = false

                this.showBtnAddAct = false
                this.showBtnAddActChild = false
                //vì khi update xong select trên list bị mất, phải reset biến này để dùng cho các form sau
                this.selectedItem = {}

            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()
                this.Drawer.close()

            }
        }, (error) => {
            this.isLoading = false;
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
            this.Drawer.close()

        })
    }


    //Subfunction  DTOSubFunction
    APIDeleteSupFunction(dtoSubFunction: any) {
        // console.log(dtoSubFunction);
        let ctx = `Xóa tính năng chi tiết`
        this.apiService.DeleteSupFunction(dtoSubFunction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)

                // xóa item trong mảng
                this.popupGridData = this.popupGridData.filter(res => res.Code !== dtoSubFunction.Code)
                this.lengOfArrDetailFunc = this.popupGridData.length

                // console.log('this.popupGridData: ', this.popupGridData);
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()

            }
        }, (error) => {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()

        })
    }


    APIUpdateSupFunction(dtoSubFunction: any) {
        let ctx = `Cập nhật tính năng chi tiết`
        this.apiService.UpdateSupFunction(dtoSubFunction).pipe(takeUntil(this.ngUnsubscribe$)).subscribe(res => {
            this.isLoading = false;
            if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
                this.APIGetListSysStructureTree()
                this.layoutService.onSuccess(`${ctx} thành công`)
                this.newDataFuncDetail = res.ObjectReturn

                // thêm mới: cập nhật giá trị mới vào trong mảng popupGridData
                if (dtoSubFunction.DTO.Code == 0) { //them moi
                    this.popupGridData.filter((res) => {
                        if (res.Code !== this.newDataFuncDetail.Code) {
                            this.popupGridData[0] = this.newDataFuncDetail
                        }
                    })


                    // vì khi nhấn toggle để expand ra thì  this.expandedItems = {0:true} -> khi tạo mới xong detail bị đóng lại
                    // -> tạo mới thay 0 bằng code mới tạo để giữ expand sau khi tạo mới xong không bị đóng
                    if (this.expandedItems.hasOwnProperty(0)) {
                        this.expandedItems[this.newDataFuncDetail.Code] = this.expandedItems[0];
                        delete this.expandedItems[0];
                    }
                }
            } else {
                this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
                this.APIGetListSysStructureTree()

            }
        }, (error) => {
            this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
            this.APIGetListSysStructureTree()
        })
    }
    //#endregion

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}

