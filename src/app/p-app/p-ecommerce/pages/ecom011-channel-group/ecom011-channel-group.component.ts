import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ExpandEvent, SelectableSettings, SelectionChangeEvent, TreeListComponent, } from '@progress/kendo-angular-treelist';
import { Subject } from 'rxjs';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { EcomChannelAPIService } from '../../shared/services/ecom-channel-api.service';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOChannelGroup } from '../../shared/dto/DTOChannelGroup.dto';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import DTOChannel from '../../shared/dto/DTOChannel.dto';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { DTOPermission } from 'src/app/p-app/p-layout/dto/DTOPermission';
import { DTODataPermission } from 'src/app/p-app/p-layout/dto/DTODataPermission';
import { DTOActionPermission } from 'src/app/p-app/p-layout/dto/DTOActionPermission';
import { distinct } from '@progress/kendo-data-query';
import { EcomService } from '../../shared/services/ecom.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-ecom011-channel-group',
  templateUrl: './ecom011-channel-group.component.html',
  styleUrls: ['./ecom011-channel-group.component.scss']
})
export class Ecom011ChannelGroupComponent {
  //#region ========= START VARIABLE

  // BUTTON HEADER
  isShowAddGC: boolean = true;
  isShowAddGCChild: boolean = false;



  // DRAWER
  @ViewChild('Drawer') Drawer: MatDrawer
  loadingDropdownTree: boolean = false;
  listParentChannel: DTOChannelGroup[] = []
  defaultParent: any = { Code: null, ChannelGroupName: 'Không lựa chọn' };


  ListChildChannelGroup: any[] = [];
  countTrue: number = 0;
  ListChannelInGroup: any[] = [];
  ListPriority: any[] = [];
  OrgListPriority: any[] = [];

  isEditing: boolean = false
  selectedItemId: any = null;

  tempParentID: number = null;
  ListGroup: any[] = [];
  ListChannel: any[] = [];
  // properties: string[] = ['ChannelGroupName', 'ChannelGroupID', 'IsPoolStock', 'IsOutDistributedStock', 'TypeData', 'Level', 'ParentID']
  properties: string[] = []


  isJoin: boolean = true;


  // FORM
  MultiOOPForm: UntypedFormGroup;
  levelOfNew: number = 0;

  //TREELIST 
  isLoading: boolean = false
  isLoadingTree: boolean = false
  listChannelGroup: DTOChannelGroup[] = []
  itemCollapsed: DTOChannelGroup[] = [];
  @ViewChild('treeGroupChannel') treeGroupChannel: TreeListComponent;
  selectedItem: DTOChannelGroup = new DTOChannelGroup();


  public settings: SelectableSettings = {
    enabled: true,
    mode: 'row',
    multiple: false,
    drag: true
  };


  // DROPDOWN ACTION IN TREELIST
  OptionTool: { id: number, icon?: string, imageUrl?: string, text: string }[] = [];
  currentAnchorIndex: number = -1
  popupShow: boolean = false;
  currentDrawer: string = ""
  currentDto: DTOChannelGroup;
  defaultDTO: DTOChannelGroup = new DTOChannelGroup();
  dataItem: DTOChannelGroup = new DTOChannelGroup();


  // DIALOG CONFIRM
  isOpenConfirm: boolean = false;
  delItem: DTOChannelGroup;

  // EXPAND - COLLAPSE 
  expandedIds: any[] = [];
  isExpandAll: boolean = true;


  // PERMISSION
  isAllPers: boolean = false
  isCanCreate: boolean = false
  isCanApproved: boolean = false
  justLoaded: boolean = true
  dataPerm: DTODataPermission[] = [];
  actionPerm: DTOActionPermission[] = [];

  //UNSUBCRIBE
  Unsubscribe = new Subject<void>();

  //#endregion ========= END VARIABLE


  constructor(
    private APIService: EcomChannelAPIService,
    private cdr: ChangeDetectorRef,
    public layoutService: LayoutService,
    private formBuilder: FormBuilder,
    public menuService: PS_HelperMenuService,
    private ecomService: EcomService,
    public domSanititizer: DomSanitizer

  ) {
  }


  ngOnInit() {
    let that = this

    this.MultiOOPForm = this.handleCreateForm(new DTOChannelGroup());

    // Khai báo object cho dropdown ParentID
    this.MultiOOPForm.patchValue({
      ParentID: new DTOChannelGroup()
    })

    // Load danh sách tree
    // this.APIGetListChannelGroup(this.defaultDTO)
    this.menuService.changePermissionAPI().pipe(takeUntil(this.Unsubscribe)).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res)) {
        this.APIGetListChannelGroup(this.defaultDTO)
      }
    })

    // permission  
    this.menuService.changePermission().pipe(takeUntil(this.Unsubscribe)).subscribe((res: DTOPermission) => {
      if (Ps_UtilObjectService.hasValue(res) && that.justLoaded) {
        that.actionPerm = distinct(res.ActionPermission, 'ActionType');
        that.isAllPers = that.actionPerm.findIndex((s) => s.ActionType == 1) > -1 || false;
        that.isCanCreate = that.actionPerm.findIndex((s) => s.ActionType == 2) > -1 || false;
        that.isCanApproved = that.actionPerm.findIndex((s) => s.ActionType == 3) > -1 || false;

        // this.isAllPers = false
        // this.isCanCreate = false
        // this.isCanApproved = true
        that.justLoaded = false;
      }
    });
  }


  //#region ========= BREADCUM
  // Gọi lại danh sách
  reloadData() {
    this.APIGetListChannelGroup(this.defaultDTO);
  }
  //#endregion  


  //#region ========= HANDLE TREELIST
  fetchChildren = (parent?: any): any[] => {
    const items = parent ? parent.ListGroup : this.listChannelGroup;
    return items
  }

  hasChildren(item: any): boolean {
    const children = this.fetchChildren(item);
    return children && children.length > 0;
  }


  // Sự kiện chọn vào item trên danh sách
  selectionChange(e: any) {
    let dataItem: any = {}
    this.isShowAddGC = false;
    this.isShowAddGCChild = false;

    if (e.action == 'select') {
      e.items.map((i) => { dataItem = i.dataItem }) //lấy ra dataItem
      if (dataItem.TypeData != 2) { //nhóm chứa nhóm  
        this.selectedItem = dataItem
        this.isShowAddGC = true;
        this.isShowAddGCChild = true;
      }
      else if (dataItem.TypeData == 2) { //nhóm chứa kênh
        this.selectedItem = dataItem
        this.isShowAddGC = true;
        this.isShowAddGCChild = false;
      }
    } else if (e.action == 'remove') {
      this.isShowAddGC = true;
      this.selectedItem = new DTOChannelGroup();
    }

  }

  //#endregion  


  //#region ========= DRAWER
  onOpenDrawer(type: string, data?: DTOChannelGroup | null, level?: string) {

    // Tạo form
    this.MultiOOPForm = this.handleCreateForm(new DTOChannelGroup());
    if (Ps_UtilObjectService.hasValue(data)) {
      // Kiểm tra loại drawer theo "data"
      this.currentDrawer = this.onCheckTypeDrawer(data)

      // Đẩy data vào form
      this.MultiOOPForm.patchValue(data);

    }
    this.countGroup = Ps_UtilObjectService.hasListValue(this.MultiOOPForm.value.ListGroup) ? this.MultiOOPForm.value.ListGroup.length : 0
    this.positionGroupChannel = this.MultiOOPForm.value.Priority


    this.isJoin = this.MultiOOPForm.value.IsOutDistributedStock == true ? false : true;
    this.MultiOOPForm.value.Priority = this.MultiOOPForm.value.IsOutDistributedStock == true ? null : this.MultiOOPForm.value.Priority;


    // console.log(this.MultiOOPForm.value);
    // console.log(this.selectedItem);


    if (type == 'create') { //Tạo mới
      if (level == 'sameLevel') {
        if (Ps_UtilObjectService.hasValue(this.selectedItem.ParentID)) { // có cha thì tìm cha
          this.APIGetListChannelGroup(data ? data : this.defaultDTO, true, this.selectedItem.ParentID);
        } else {
          this.APIGetListChannelGroup(data ? data : this.defaultDTO, true);
        }
      }

      if (level == 'childLevel') {
        this.APIGetListChannelGroup(data ? data : this.defaultDTO, true, this.selectedItem.Code);
      }
    } else if (type == 'update') {

      if (this.MultiOOPForm.value.ParentID == null) { // Không có cha  
        this.APIGetListChannelGroup(data ? data : this.defaultDTO, true);

      } else if (this.MultiOOPForm.value.ParentID != null) { //có cha thì tìm cha và fill lên dropdown
        this.APIGetListChannelGroup(data ? data : this.defaultDTO, true, this.MultiOOPForm.value.ParentID);
      }

      // Drawer nhóm chứa kênh
      if (this.MultiOOPForm.value.TypeData == 2) {
        this.APIGetListChannelInGroup(this.MultiOOPForm.value);

        // Nếu là drawer channel và checkbox được tích thì gọi API
        if (this.currentDrawer == 'channel' && this.MultiOOPForm.value.IsPoolStock == true) {
          this.APIGetListPriority()
        }
      }

      // console.log(this.MultiOOPForm.value);

    }

    this.MultiOOPForm.patchValue({
      ParentID: { Code: null, ChannelGroupName: 'Không lựa chọn' }
    })

    //Nếu là drawer channelGroup mới được gọi API
    if (this.currentDrawer == 'channelGroup' && this.MultiOOPForm.value.Code != 0) {
      this.APIGetListChildChannelGroup(this.dataItem);
    }
    this.Drawer.open()
  }


  // Đệ qui tìm cha
  findParent(code: any, nodes: any[]): any {
    for (let node of nodes) {
      if (node.Code === code) {
        return node; // tìm thấy cha
      } else if (node.ListGroup && node.ListGroup.length > 0) {
        // nếu có các nút con, tiếp tục tìm kiếm ở cấp dưới
        let foundParent = this.findParent(code, node.ListGroup);
        if (foundParent) {
          return foundParent; // Nếu tìm thấy ở cấp dưới, trả về nút cha
        }
      }
    }
    return null; // Không tìm thấy cha
  }

  // Chặn sự kiện enter
  onKeydownEnter(e: KeyboardEvent) {
    e.preventDefault;
    e.stopPropagation;
  }

  // Lấy link hình
  errorOccurred: any = {};
  getRes(str: string, imageKey: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    if (this.errorOccurred[imageKey]) { return this.getResHachi(a); }
    else {
      return this.domSanititizer.bypassSecurityTrustResourceUrl(Ps_UtilObjectService.getImgRes(a));
    }
  }

  getResHachi(str: string) {
    let a = Ps_UtilObjectService.removeImgRes(str);
    return Ps_UtilObjectService.getImgResHachi(a);
  }

  handleError(imageKey: string) { this.errorOccurred[imageKey] = true; }


  //Chọn Dropdown trên drawer
  onSelectedDropdownList(e) {
    if (!Ps_UtilObjectService.hasValue(e) || e.Code == null) { //nếu bị undentify thì set default
      this.MultiOOPForm.patchValue({
        ParentID: { Code: null, ChannelGroupName: 'Không lựa chọn' }
      })
    } else {
      this.tempParentID = e.Code;
    }

    this.onBlurForm('ParentID')
  }

  //Đóng drawer 
  onCloseDrawer() {
    this.Drawer.close();
    this.MultiOOPForm.reset();
    this.currentDrawer = '';
    this.ListGroup = [];
    this.ListChannel = [];
    this.ListChildChannelGroup = [];
    this.ListPriority = [];
    this.properties = [];
    this.selectedItem = new DTOChannelGroup();
  }


  // Hàm sắp xếp lại mảng Thứ tự phân bổ tồn kho sau khi cập nhật
  // updatePriority(code, newPriority, arr) {
  //   const obj = arr.find(item => item.Code === code);
  //   if (obj) {
  //     const oldPriority = obj.Priority;
  //     obj.Priority = newPriority;
  //     arr.forEach(item => {
  //       if (item.Code !== code) {
  //         if (oldPriority < newPriority) {
  //           if (item.Priority > oldPriority && item.Priority <= newPriority) {
  //             item.Priority--;
  //           }
  //         } else {
  //           if (item.Priority < oldPriority && item.Priority >= newPriority) {
  //             item.Priority++;
  //           }
  //         }
  //       }
  //     });

  //     arr.sort((a, b) => a.Priority - b.Priority);
  //     let index = arr.findIndex(item => item.Code === code);
  //     if (index !== -1) {
  //       for (let i = index - 1; i >= 0; i--) {
  //         if (arr[i].Priority > newPriority) {
  //           arr[i].Priority++;
  //         } else {
  //           break;
  //         }
  //       }
  //       for (let i = index + 1; i < arr.length; i++) {
  //         if (arr[i].Priority < newPriority) {
  //           arr[i].Priority--;
  //         } else {
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }



  positionGroupChannel: number = 0;
  @ViewChild('numberic') numberic;
  // Hàm cập nhật giá trị của Thứ tự phân bổ tồn kho
  onBlurPriority(dataItem: any, numberic) {
    const value = numberic.value;

    if (Ps_UtilObjectService.hasValue(value) && value != dataItem.Priority) {
      if (value !== 0) {
        this.updatePriority(dataItem.Code, value, this.ListPriority);
      }
      else {
        const index = this.ListPriority.findIndex(item => item.Code === dataItem.Code);
        this.ListPriority[index].Priority = 0;
        this.ListPriority.sort((a, b) => a.Priority - b.Priority);
      }
      this.onBlurForm('ListPriority');

      //Lấy Priority của item hiện tại để bind lên html
      this.ListPriority.map(res => {
        if (res.Code == this.MultiOOPForm.value.Code) {
          this.positionGroupChannel = res.Priority;
        }
      })

    }
  }

  // Hàm sắp xếp lại mảng Thứ tự phân bổ tồn kho sau khi blur
  updatePriority(codeToUpdate, newPriority, arr1) {
    const hasPriorityZero = arr1.some(obj => obj.Priority === 0);
    let index = arr1.findIndex(item => item.Code === codeToUpdate);
    if (index !== -1) {

      // Trường hợp Thêm mới item hiện tại vào danh sách phân bổ: 
      // Từ số 0 người dùng nhập tới số bất kì (0 tức là chưa có trong danh sách)
      if (hasPriorityZero == true) {
        arr1[index].Priority = newPriority;
        arr1.sort((a, b) => {
          if (a.Priority === b.Priority) {
            if (a.Code === codeToUpdate) return -1;
            else if (b.Code === codeToUpdate) return 1;
            else return 0;
          }
          return a.Priority - b.Priority;
        });
        let currentPriority = 0;
        for (let i = 0; i < arr1.length; i++) {
          if (i > 0 && arr1[i].Priority === arr1[i - 1].Priority) {
            arr1[i].Priority = ++currentPriority;
          } else {
            currentPriority = arr1[i].Priority;
          }
        }
      } else { // trường hợp chỉnh sửa (đã có trong danh sách và thay đổi Priority của item đó)
        // Lưu Priority cũ của item cần cập nhật
        let oldPriority = arr1[index].Priority;
        // Nếu newPriority lớn hơn oldPriority thì -1 của các item từ oldPriority đến newPriority 
        if (newPriority > oldPriority) {
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].Priority > oldPriority && arr1[i].Priority <= newPriority) {
              arr1[i].Priority--;
            }
          }
        }
        // Nếu newPriority nhỏ hơn oldPriority thì +1 của các item từ newPriority đến oldPriority
        if (newPriority < oldPriority) {
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].Priority >= newPriority && arr1[i].Priority < oldPriority) {
              arr1[i].Priority++;
            }
          }
        }
        // Cập nhật ưu tiên mới cho phần tử cần cập nhật
        arr1[index].Priority = newPriority;
        // Sắp xếp lại mảng arr1 theo ưu tiên
        arr1.sort((a, b) => a.Priority - b.Priority);
      }
    }
  }

  // Function của danh sách checkbox drawer nhóm chứa nhóm con
  countGroup: number = 0;
  onCheckboxChangeGroupChannel(channelGroup: DTOChannelGroup) {
    const index = this.ListGroup.findIndex(group => group.Code === channelGroup.Code);

    if (Ps_UtilObjectService.hasListValue(this.MultiOOPForm.value.ListGroup)) { //chỉnh sửa
      if (index === -1) {
        channelGroup.IsChild = true;
        this.ListGroup.push(channelGroup);
      } else {
        const index2 = this.MultiOOPForm.value.ListGroup.findIndex(group => group.Code === channelGroup.Code);
        if (index2 === -1) {
          channelGroup.IsChild = false;
          this.ListGroup.splice(index, 1);
        } else {
          this.ListGroup[index].IsChild = channelGroup.IsChild == true ? false : true;
        }
      }
    }
    else if (!Ps_UtilObjectService.hasListValue(this.MultiOOPForm.value.ListGroup)) { //tạo mới 
      if (index === -1) {
        channelGroup.IsChild = true;
        this.ListGroup.push(channelGroup);
      } else {
        channelGroup.IsChild = false;
        this.ListGroup.splice(index, 1);
      }
    }

    // Số nhóm kênh được check
    this.countGroup = this.ListGroup.filter(item => item.IsChild == true).length;
    this.onBlurForm('ListGroup');
  }

  // Function của danh sách checkbox drawer nhóm chứa kênh
  originalListChannel: any[] = [];
  countChannel: number = 0;
  onCheckboxChangeChannel(channel: DTOChannel) {
    const index = this.ListChannel.findIndex(group => group.Code === channel.Code);
    if (this.MultiOOPForm.value.HasChannel == true) { //chỉnh sửa
      if (index === -1) {
        channel.IsChild = true;
        this.ListChannel.push(channel);
      } else {
        const index2 = this.originalListChannel.findIndex(group => group.Code === channel.Code);
        if (index2 === -1) {
          channel.IsChild = false;
          this.ListChannel.splice(index, 1);
        } else {
          this.ListChannel[index].IsChild = channel.IsChild == true ? false : true;
        }
      }
    }
    else if (this.MultiOOPForm.value.HasChannel == false) { //tạo mới 
      if (index === -1) {
        channel.IsChild = true;
        this.ListChannel.push(channel);
      } else {
        channel.IsChild = false;
        this.ListChannel.splice(index, 1);
      }
    }

    this.countChannel = this.ListChannel.filter(item => item.IsChild == true).length;
    this.onBlurForm('ListChannel')
  }
  // Hàm khi blur ra ngoài thì đẩy trường vừa được blur ra vào mảng properties để cập nhật theo properties 
  onBlurForm(prop: string) {

    // Tìm trong mảng properties xem có chưa
    const itemExists = this.properties.find(item => item === prop);
    if (!itemExists) {
      this.properties.push(prop);
    }


    const itemPush = {
      ChannelGroupID: this.MultiOOPForm.value.ChannelGroupID,
      ChannelGroupName: this.MultiOOPForm.value.ChannelGroupName,
      Code: this.MultiOOPForm.value.Code,
      IsPoolStock: this.MultiOOPForm.value.IsPoolStock,
      ParentID: this.MultiOOPForm.value.ParentID.Code,
      Priority: this.MultiOOPForm.value.Priority == null ? 0 : this.MultiOOPForm.value.Priority,
      TypeData: this.MultiOOPForm.value.TypeData,
    }

    // Nếu click vào Trung tâm phân bổ tồn kho thì load danh sách phân bổ
    if (prop == "IsPoolStock") {
      if (this.MultiOOPForm.value.IsPoolStock == true) {
        this.APIGetListPriority(itemPush, this.MultiOOPForm.value.Code);
      } else if (this.MultiOOPForm.value.IsPoolStock == false) {
        this.ListPriority = [];
      }
    }


    // Nếu click vào Không tham gia phân bổ tồn kho thì xóa item hiện tại khỏi danh sách thứ tự
    if (prop == 'IsOutDistributedStock') {
      let tempListPriority = this.ListPriority;
      if (this.MultiOOPForm.value.IsOutDistributedStock == true) {
        this.isJoin = false;
        var elementsToRemove = ['ListPriority'];
        this.properties = this.properties.filter(function (item) {
          return !elementsToRemove.includes(item);
        });

        // Nếu Tạo mới thì gọi lại api lấy danh sách mới
        if (this.MultiOOPForm.value.Code == 0) {
          this.APIGetListPriority()
          // this.ListPriority = this.OrgListPriority
        } else {
          this.ListPriority = this.OrgListPriority
          this.ListPriority = this.ListPriority.filter(item => item.Code !== this.MultiOOPForm.value.Code);
        }
        this.positionGroupChannel = 0;
      }
      else {
        this.isJoin = true;
        if (this.isJoin == true && this.ListPriority.length > 0) {
          tempListPriority.unshift(itemPush)
        }
        this.positionGroupChannel = this.MultiOOPForm.value.Priority;
        this.ListPriority = tempListPriority

        // Kiểm tra chưa có thì push vào properties
        const itemExists = this.properties.find(item => item === 'ListPriority');
        if (!itemExists) {
          this.properties.push('ListPriority');
        }
      }
      this.ListPriority = this.ListPriority.sort((a, b) => a.Priority - b.Priority);
    }

  }
  //#endregion


  //#region ========= FORM

  // Hàm tạo form
  handleCreateForm(dto: DTOChannelGroup): UntypedFormGroup {
    const formGroup = this.formBuilder.group({});
    Object.keys(dto).forEach(key => {
      if (key === 'ChannelGroupName' || key === 'Code' || key === 'ChannelGroupID') {
        formGroup.addControl(key, this.formBuilder.control(dto[key], Validators.required));
      } else {
        formGroup.addControl(key, this.formBuilder.control(dto[key]));
      }
    });
    return formGroup;
  }

  // Hàm submit form
  onSubmitForm() {
    this.MultiOOPForm.markAsTouched();

    // Không chứa kênh thì cho false hai trường này
    if ((this.MultiOOPForm.value.IsPoolStock == true) && (this.currentDrawer == 'channelGroup' || this.currentDrawer == '')) {
      this.MultiOOPForm.value.IsPoolStock = false;
      this.MultiOOPForm.value.IsOutDistributedStock = false;
      this.properties.push('IsPoolStock')
    }

    let parentHaveChannel = this.MultiOOPForm.value.ParentID.TypeData == 2 ? true : false;

    // Check nhóm kênh cha có chứa kênh hay không
    if (this.MultiOOPForm.value.ParentID.TypeData == 2) {
      this.layoutService.onWarning(`Nhóm kênh cha này đã đang chứa kênh vui lòng chọn nhóm kênh cha khác`);
    }


    // Gán level
    if (Ps_UtilObjectService.hasValue(this.MultiOOPForm.value.ParentID.Code)) {
      const parent = this.findParent(this.MultiOOPForm.value.ParentID.Code, this.listParentChannel);
      this.levelOfNew = Ps_UtilObjectService.hasValue(parent.Code) ? parent.Level + 1 : 1;

      const itemExists = this.properties.find(item => item === 'Level');
      if (!itemExists) {
        this.properties.push('Level');
      }
    } else if (this.MultiOOPForm.value.ParentID.Code === null || this.MultiOOPForm.value.ParentID.Code === 0) {
      this.levelOfNew = 1

      const itemExists = this.properties.find(item => item === 'Level');
      if (!itemExists) {
        this.properties.push('Level');
      }
    }


    if (this.MultiOOPForm.valid) {
      // copy ra {} khác tránh bị lỗi dorpdown tree khi thay đổi object
      const data = { ...this.MultiOOPForm.value };
      data.ParentID = data.ParentID.Code;
      data.Level = this.levelOfNew;


      // Tạo mới và có thay đổi parent thì push vào mảng
      if (data.Code == 0 && Ps_UtilObjectService.hasValue(data.ParentID)) {
        const itemExists = this.properties.find(item => item === 'ParentID');
        if (!itemExists) {
          this.properties.push('ParentID');
        }
      }



      //Kiểm tra khoảng trắng
      if (!Ps_UtilObjectService.hasValueString(data.ChannelGroupName) && !Ps_UtilObjectService.hasValueString(data.ChannelGroupID)) {
        this.layoutService.onWarning(`Vui lòng điền vào tên nhóm kênh và mã nhóm kênh`);
      } else if (!Ps_UtilObjectService.hasValueString(data.ChannelGroupName)) {
        this.layoutService.onWarning(`Vui lòng điền vào tên nhóm kênh`);
      } else if (!Ps_UtilObjectService.hasValueString(data.ChannelGroupID)) {
        this.layoutService.onWarning(`Vui lòng điền vào mã nhóm kênh`);
      } else if (
        (Ps_UtilObjectService.hasValueString(data.ChannelGroupName)) || (Ps_UtilObjectService.hasValueString(data.ChannelGroupID) &&
          (Ps_UtilObjectService.hasValueString(data.ChannelGroupName) && Ps_UtilObjectService.hasValueString(data.ChannelGroupID)))
      ) {
        // ========== Tạo - cập nhật nhóm chứa nhóm
        if (this.currentDrawer == 'channelGroup') {
          data.ListGroup = this.ListGroup;


          //Check xem có list nhóm con bắt buộc không, có thì warning
          let arrListGroup = data.ListGroup.filter(item => item.IsChild === true);

          if (!Ps_UtilObjectService.hasListValue(arrListGroup)) {
            this.layoutService.onWarning(`Vui lòng chọn nhóm cấp con`)
          } else {
            // Set level nhóm con, level + 1 so với level cha đang chứa nó 
            data.ListGroup.forEach((item: any) => {
              if (item.IsChild == true) { // Nếu item là con thì + 1 cấp và parentId là code cha hiện tại
                item.Level = data.Level + 1;
                item.ParentID = data.Code != 0 ? data.Code : null
              }
              else if (item.IsChild == false) { // Nếu item con được unchecked thì set cho nó đồng cấp với parent cũ
                item.ParentID = data.ParentID !== null ? data.ParentID : null;
                item.Level = data.Level;
              }
            });

            data.HasChannel = false;
            // Chứa nhóm typedata = 1
            if (Ps_UtilObjectService.hasListValue(data.ListGroup) && data.TypeData != 1) {
              data.TypeData = 1;
              this.properties.push('TypeData')
            }


            if (parentHaveChannel == false) {
              // console.log(data);
              // console.log(this.properties);
              this.APIUpdateChannelGroup(data, this.properties)
            }
          }
        }

        // ========== Tạo - cập nhật nhóm chứa kênh
        if (this.currentDrawer == 'channel') {
          data.ListChannel = this.ListChannel;
          data.ListPriority = this.ListPriority;
          data.ListGroup = this.ListGroup;

          // Chứa kênh typedata = 2
          if (Ps_UtilObjectService.hasListValue(data.ListChannel) && data.TypeData != 2) {
            data.TypeData = 2;
            this.properties.push('TypeData')
          }

          //Check xem có list nhóm con bắt buộc không, có thì warning
          let arrListChannel = data.ListChannel.filter(item => item.IsChild === true);

          if (!Ps_UtilObjectService.hasListValue(arrListChannel)) {
            this.layoutService.onWarning(`Vui lòng chọn kênh bán hàng`)
          } else {
            //Trường hợp chuyển từ chứa nhóm sang chứa kênh, check có ListGroup thì thay đổi
            if (Ps_UtilObjectService.hasListValue(data.ListGroup)) {
              data.ListGroup.forEach(obj => {
                this.onCheckboxChangeGroupChannel(obj)
                if (obj.IsChild == true) {
                  obj.ParentID = data.ParentID !== null ? data.ParentID : null;
                  obj.Level = data.Level;
                  obj.IsChild = false;
                }
              });
            }

            // Set parentID cho kênh
            data.ListChannel.forEach((item: any) => {
              if (item.IsChild == true) {
                item.ParentID = data.Code != 0 ? data.Code : null
              }
              else if (item.IsChild == false) { // Nếu item con được unchecked thì set cho nó đồng cấp với parent cũ
                item.ParentID = null;
              }
            });


            let havePriority = true;
            data.ListPriority.map((e) => {
              if (e.Priority == 0 || e.Priority == null) {
                this.layoutService.onWarning(`Vui lòng nhập thứ tự phân bổ tồn kho`)
                havePriority = false;
              }

              // Lưu Priority cho item hiện tại
              if (data.Code == e.Code) {
                data.Priority = e.Priority;
                this.onBlurForm('Priority')
              }
            })

            if (havePriority == true && parentHaveChannel == false && Ps_UtilObjectService.hasListValue(data.ListChannel)) {
              // console.log(data);
              // console.log(this.properties);
              this.APIUpdateChannelGroup(data, this.properties)
            }
          }
        }

        // ========== Tạo - cập nhật default
        if (this.currentDrawer == '') {

          data.ListGroup = this.ListGroup;

          //Trường hợp chuyển từ chứa nhóm sang mặc định, check có ListGroup thì thay đổi
          if (Ps_UtilObjectService.hasListValue(data.ListGroup)) {
            data.ListGroup.forEach(obj => {
              this.onCheckboxChangeGroupChannel(obj)
              if (obj.IsChild == true) {
                obj.ParentID = data.ParentID !== null ? data.ParentID : null;
                obj.Level = data.Level;
                obj.IsChild = data.ParentID == null ? false : true;
              }
            });
          }

          if (data.TypeData != 0) {
            data.TypeData = 0;
            this.properties.push('TypeData')
          }

          if (parentHaveChannel == false) {
            // console.log(data);
            // console.log(this.properties);
            this.APIUpdateChannelGroup(data, this.properties)
          }
        }
      }


    }
    else {
      const invalidFields = this.getInvalidFields(this.MultiOOPForm.controls);
      const fieldTranslations = {
        "ChannelGroupID": 'Mã nhóm kênh',
        "ChannelGroupName": 'Nhóm kênh bán hàng',
      };

      invalidFields.forEach((field) => {
        const translatedField = fieldTranslations[field] || field;
        this.layoutService.onWarning(`Vui lòng điền vào trường ${translatedField}`);
      });
    }
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

  // hàm kiểm tra Drawer thuộc loại gì
  onCheckTypeDrawer(DTO: DTOChannelGroup) {
    if (DTO.TypeData == 1 || Ps_UtilObjectService.hasListValue(DTO.ListGroup)) // không chứa kênh => mở drawer Nhóm con
      return 'channelGroup';
    else if (DTO.TypeData == 2) // nhóm cấp cuối cùng chứa kênh => mở drawer Kênh
      return 'channel';
    if (DTO == null || (DTO.TypeData == 0 && (DTO.ListGroup == null || DTO.HasChannel == false))) // nhóm không có nhóm con và kênh => mở drawer default
      return '';
  }

  //#endregion


  //#region ========= DROPDOWN ACTION 
  // Hiện popup actiom
  isPopupVisible() {
    return this.popupShow ? 'visible' : 'hidden'
  }

  @ViewChildren('anchor') anchors
  @HostListener('document:click', ['$event'])
  //sự kiện click ra ngoài đóng popup action
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


  // Lấy neo để popup action dựa vào 
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
    event.stopPropagation()

    //kiểm tra index để đóng mở popup
    if (index != this.currentAnchorIndex) {
      this.popupShow = true
    } else if (index == this.currentAnchorIndex) {
      this.popupShow = !this.popupShow
    }
    if (this.popupShow) {
      this.onOpenDropDownList(item)
    }
    this.currentAnchorIndex = index
  }

  // Hiện các option cho item tương ứng
  onOpenDropDownList(data: any) {
    this.dataItem = data;
    this.delItem = data;
    this.OptionTool = []
    // console.log(this.dataItem);
    //Quyền tạo
    if (this.isAllPers == true || this.isCanCreate == true) {
      this.OptionTool.push({ id: 0, text: 'Chỉnh sửa', icon: 'k-i-pencil' });

      //Item chứa nhóm => được thêm nhóm con
      if (data.TypeData == 0 || data.TypeData == 1) {
        this.OptionTool.push(
          { id: 1, text: 'Thêm nhóm', imageUrl: 'assets/img/icon/icon_site_map.svg' },
          { id: 2, text: 'Thêm nhóm con', imageUrl: 'assets/img/icon/icon_site_map.svg' }
        );
      }

      //Item chứa kênh 
      if (data.TypeData == 2) {
        this.OptionTool.splice(1, 2);
      }


      // Xóa
      if (((data.TypeData == 0 || data.TypeData == 1) && !Ps_UtilObjectService.hasListValue(data.ListGroup)) ||
        (data.TypeData == 2 && data.HasChannel == false)
      ) {
        this.OptionTool.push({ id: 4, text: 'Xóa nhóm kênh', icon: 'k-i-trash' })
      }


    }

    //Quyền duyệt
    if (this.isCanApproved == true) {
      this.OptionTool.push({ id: 3, text: 'Xem chi tiết', icon: 'k-i-eye', });
    }
  }

  // xử lý act trong popup action 
  onActionDropdownBtn(action: { id: number, icon?: string, imageUrl?: string, text: string }) {
    // this.selectedItem = new DTOChannelGroup();
    switch (action.id) {
      case 0: //chỉnh sửa '
        this.onOpenDrawer('update', this.dataItem);
        break;

      case 1: // thêm mới nhóm con
        this.selectedItem = this.dataItem;
        if (action.text == 'Thêm nhóm') {
          this.onOpenDrawer('create', new DTOChannelGroup(), 'sameLevel');
        }
        break;
      case 2: // thêm mới nhóm con
        this.selectedItem = this.dataItem;
        if (action.text == 'Thêm nhóm con') {
          this.onOpenDrawer('create', new DTOChannelGroup(), 'childLevel');
        }
        break;
      case 3: //Xem
        this.onOpenDrawer('update', this.dataItem);

        break;
      case 4: //xóa 
        this.isOpenConfirm = true
        break;
      default:
        break;
    }
  }
  //#endregion


  //#region ========= DIALOG CONFIRM
  // Mở-đóng popup confirm
  onToggleDialog(): void {
    this.isOpenConfirm = !this.isOpenConfirm;
  }

  // Xử lý action trong popup confirm delete
  onDeleteDialog(status: string): void {
    if (status == 'yes') {
      this.APIDeleteChannelGroup(this.delItem);
      this.isOpenConfirm = false;
    } else {
      this.isOpenConfirm = false;
    }
  }
  //#endregion


  //#region ========= HANDLE COLLAPSE/EXPAND 
  ExpandListChildGroupChannel: boolean = true;
  ExpandListChildChannel: boolean = true;

  //Hàm expand-collapse cho danh sách checkbox
  onChangeCE(type: number) {



    if (type == 1) {
      let filteredArrayGroup = this.ListGroup.filter(item => item.IsChild === true);
      let filteredArrayChannel = this.ListChannel.filter(item => item.IsChild === true);
      if (filteredArrayGroup.length != 0 || (filteredArrayChannel.length != 0 ||
        this.MultiOOPForm.value.IsPoolStock == true || this.MultiOOPForm.value.IsOutDistributedStock == true)) {
        this.ExpandListChildGroupChannel = !this.ExpandListChildGroupChannel;
      } else {
        this.ExpandListChildGroupChannel = true;
      }


      // Lọc trong danh sách còn nhóm nào không thì chuyển sang drawer default
      if (this.currentDrawer == 'channelGroup' && filteredArrayGroup.length == 0) {
        this.currentDrawer = '';
      }


      // Lọc trong danh sách còn nhóm nào không thì chuyển sang drawer default
      if (this.currentDrawer == 'channel' && this.MultiOOPForm.value.IsPoolStock == false && filteredArrayChannel.length == 0 &&
        this.MultiOOPForm.value.IsOutDistributedStock == false) {
        this.currentDrawer = '';
      }
    }
    else
      this.ExpandListChildChannel = !this.ExpandListChildChannel;
  }
  //#endregion


  //#region ========= TRANSFORM STATUS OF DRAWER
  // Từ drawer "Tạo mới" => chưa chọn Nhóm cấp con hoặc Kênh quản lý
  //Hàm chuyển sang drawer tương ứng với mong muốn
  onTransDrawer(type: string) {
    // this.currentDrawer = type;
    const data = { ... this.MultiOOPForm.value };
    data.ParentID = data.ParentID.Code;

    //Nếu là drawer channelGroup mới được gọi API
    if (type == 'channelGroup') {
      this.currentDrawer = type;
      this.APIGetListChildChannelGroup(data);
    }

    // Nếu là drawer channel và checkbox được tích thì gọi API
    if (type == 'channel') {
      if (Ps_UtilObjectService.hasValueString(data.ChannelGroupName) && Ps_UtilObjectService.hasValueString(data.ChannelGroupID)) {
        this.currentDrawer = type;

        this.APIGetListChannelInGroup(data.Code !== 0 ? data : this.defaultDTO);
        if (data.IsPoolStock) {
          const itemPush = {
            ChannelGroupID: this.MultiOOPForm.value.ChannelGroupID,
            ChannelGroupName: this.MultiOOPForm.value.ChannelGroupName,
            Code: this.MultiOOPForm.value.Code,
            IsPoolStock: this.MultiOOPForm.value.IsPoolStock,
            ParentID: this.MultiOOPForm.value.ParentID.Code,
            Priority: this.MultiOOPForm.value.Priority == null ? 0 : this.MultiOOPForm.value.Priority,
            TypeData: this.MultiOOPForm.value.TypeData,
          }
          this.APIGetListPriority(itemPush);
        }
      }
      else {
        this.layoutService.onWarning('Vui lòng điền đầy dủ thông tin yêu cầu để thiết lập kênh quản lý')
      }

    }
  }
  //#endregion


  //#region ========= OPEN PAGE 
  // chuyển vào trang sau và set cache
  onOpenPage(data: DTOChannelGroup) {
    event.stopPropagation()
    this.menuService.changeModuleData().pipe(takeUntil(this.Unsubscribe)).subscribe((item: ModuleDataItem) => {
      var parent = item.ListMenu.find(f => f.Code.includes('ecom-channel') || f.Link.includes('/ecommerce/ecom003-channel-list'))
      if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
        var detail = parent.LstChild.find(f => f.Code.includes('ecom012-product-channel') || f.Link.includes('/ecommerce/ecom012-product-channel'))
        if (Ps_UtilObjectService.hasValue(detail)) {
          // this.ecomService.setCacheGroupChannel(data)
          localStorage.setItem("ecom_groupChannel_detail", JSON.stringify(data))
        }
        this.menuService.selectedMenu(detail, parent)
      }
    })
  }
  //#endregion


  //#region ========= EXPAND - COLLAPSE 

  // Khi Expand item thì hàm này được gọi, lưu vào mảng expandedIds
  onExpand(e: ExpandEvent): void {
    this.expandedIds.push(e.dataItem.Code);
  }

  // Khi Collapse item thì hàm này được gọi, bỏ khỏi mảng expandedIds
  onCollapse(e: ExpandEvent): void {
    this.expandedIds = this.expandedIds.filter(Code => Code !== e.dataItem.Code);
  }

  // Kiểm tra nếu trong mảng có item expand thì trả về true 
  isExpanded = (dataItem: any): boolean => {
    return this.expandedIds.indexOf(dataItem.Code) > -1;
  };


  // Đệ qui lấy hết Code có trong tree để expand ra hết khi load trang
  getAllIds(data: DTOChannelGroup[]): number[] {
    let ids: number[] = [];
    for (const item of data) {
      ids.push(item.Code);
      if (item.ListGroup) {
        ids = ids.concat(this.getAllIds(item.ListGroup));
      }
    }
    return ids;
  }

  //#endregion


  //#region ========= API

  //Danh sách tree của Nhóm kênh bán hàng
  APIGetListChannelGroup(data: DTOChannelGroup, isDropdown?: boolean, ParentID?: any) {
    const ctx = 'nhóm kênh bán hàng'
    // Lấy treelist dropdown
    if (isDropdown == true) {
      this.loadingDropdownTree = true
      this.APIService.GetListChannelGroup(data).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listParentChannel = res.ObjectReturn;
          this.listParentChannel.unshift(this.defaultParent);
          if (ParentID) {
            let parent = this.findParent(ParentID, this.listParentChannel)
            this.MultiOOPForm.patchValue({
              ParentID: { Code: parent.Code, ChannelGroupName: parent.ChannelGroupName }
            })
          }
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`) }
        this.loadingDropdownTree = false

      }, (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
        this.loadingDropdownTree = false

      })
    } else { //Lấy ra danh sách tree
      this.isLoadingTree = true
      this.APIService.GetListChannelGroup({}).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
        if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
          this.listChannelGroup = res.ObjectReturn;
          if (this.isExpandAll == true) {
            this.expandedIds = this.getAllIds(this.listChannelGroup);
          }
        }
        else { this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`) }
        this.isLoadingTree = false;
      }, (err) => {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
        this.isLoadingTree = false;
      })
    }
  }


  // Lấy danh sách nhóm kênh cấp con
  APIGetListChildChannelGroup(data: DTOChannelGroup) {
    this.isLoading = true
    const ctx = 'nhóm kênh cấp con'
    this.APIService.GetListChildChannelGroup(data).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.ListChildChannelGroup = res.ObjectReturn;

        // Lọc ra item nào đang là true thì bỏ vào mảng ListGroup
        this.ListGroup = this.ListChildChannelGroup.filter((item) => { return item.IsChild === true; });
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`)
      }
      this.isLoading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
      this.isLoading = false;
    })
  }


  // Lấy danh sách kênh trong phân nhóm
  APIGetListChannelInGroup(data: DTOChannelGroup) {
    this.isLoading = true
    const ctx = 'kênh trong phân nhóm'
    this.APIService.GetListChannelInGroup(data).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.ListChannelInGroup = res.ObjectReturn;
        this.ListChannel = this.ListChannelInGroup.filter(item => item.ParentID == data.Code && item.IsChild == true);
        this.originalListChannel = [...  this.ListChannel];
        this.countChannel = this.ListChannel.length;
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`)
      }
      this.isLoading = false;
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
      this.isLoading = false;
    })
  }



  // Lấy danh sách thứ tự phân bổ tồn kho
  APIGetListPriority(itemCurrent?: any, CurrentCode?: number) {
    const ctx = 'thứ tự phân bổ tồn kho';
    this.APIService.GetListPriority().pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.OrgListPriority = res.ObjectReturn.sort((a, b) => a.Priority - b.Priority);
        this.ListPriority = JSON.parse(JSON.stringify(this.OrgListPriority));
        const isExist = CurrentCode ? this.ListPriority.some(obj => obj.Code === CurrentCode) : false;
        if (isExist == false) {
          if (itemCurrent && this.isJoin == true) {
            this.ListPriority.unshift(itemCurrent)
          }
        }
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}: ${res.ErrorString}`)
      }
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi lấy danh sách ${ctx}:  ${err}`)
    })
  }


  // Cập nhật- Tạo nhóm kênh
  APIUpdateChannelGroup(dataUpdate: DTOChannelGroup, prop) {
    this.isLoading = true;
    const ctx = dataUpdate.Code == 0 ? 'Tạo mới' : 'Cập nhật';
    let DTO = {
      DTO: dataUpdate,
      Properties: prop
    };

    this.APIService.UpdateChannelGroup(DTO).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`${ctx} nhóm kênh thành công!`);
        this.Drawer.close();
        this.MultiOOPForm.reset();

        this.ListGroup = [];
        this.ListChannel = [];
        this.ListChildChannelGroup = [];
        this.isShowAddGCChild = false;
        this.currentDrawer = '';
        this.properties = [];
        this.selectedItem = new DTOChannelGroup();

      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx} nhóm kênh: ${res.ErrorString}`)
      }
      this.isLoading = false;
      this.APIGetListChannelGroup(this.defaultDTO);
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx} nhóm kênh:  ${err}`)
      this.isLoading = false;
      this.APIGetListChannelGroup(this.defaultDTO);
    })
    this.isExpandAll = false;
  }


  // Xóa nhóm kênh
  APIDeleteChannelGroup(data) {
    this.isLoading = true
    const ctx = 'xóa nhóm kênh'
    this.APIService.DeleteChannelGroup(data).pipe(takeUntil(this.Unsubscribe)).subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.layoutService.onSuccess(`Xóa nhóm kênh thành công!`);
        this.isShowAddGCChild = false
      }
      else {
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
      }
      this.isLoading = false;
      this.APIGetListChannelGroup(this.defaultDTO);
    }, (err) => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}:  ${err}`)
      this.isLoading = false;
      this.APIGetListChannelGroup(this.defaultDTO);
    })
    this.isExpandAll = false;
  }
  //#endregion =========



  // ================= DESTROY SUB ==========
  ngOnDestroy() {
    this.Unsubscribe.next();
    this.Unsubscribe.complete();
  }


}
