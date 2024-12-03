import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { EcomAPIService } from '../../services/ecom-api.service';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EcomService } from '../../services/ecom.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { EcomAppCartAPIService } from '../../services/ecom-appcart-api.service';

@Component({
  selector: 'assign-cart-staff-dialog',
  templateUrl: './assign-cart-staff-dialog.component.html',
  styleUrls: ['./assign-cart-staff-dialog.component.scss']
})
export class AssignCartStaffDialogComponent implements OnInit {
  loading: boolean = false
  justLoaded: boolean = true
  @Input('opened') AssignUserDialogOpened: boolean = false
  @Output() closed = new EventEmitter();

  searchUser: string = ""
  AssignUserForm: UntypedFormGroup;
  onlineUserList = []
  filterOnlineUserList = new Observable<Array<any>>()

  constructor(public apiService: EcomAPIService,
    public apiCartService: EcomAppCartAPIService,
    public service: EcomService,
    public layoutService: LayoutService,
    ) { }

  ngOnInit(): void {
    this.loadForm()
  }
  ngDoCheck() {
    if (this.AssignUserDialogOpened && this.justLoaded) {
      this.justLoaded = false
      this.GetStaffOnline()
    }
  }
  //API  
  GetStaffOnline() {
    this.loading = true;

    this.filterOnlineUserList = this.apiService.GetStaffOnline().pipe(map(res => {
      this.loading = false;
      this.onlineUserList = res.ObjectReturn
      return res.ObjectReturn
    }))
  }
  AssignUsers(id: number) {
    this.loading = true;
    var ctx = "Chuyển giao ca làm việc"

    this.apiCartService.AssignCartStaff(id).subscribe(res => {
      this.closeAssignUserDialog(true)
      this.layoutService.onSuccess(`${ctx} thành công`)
      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //LOAD  
  loadForm() {
    this.AssignUserForm = new UntypedFormGroup({
      'onlineUser_radio': new UntypedFormControl('', Validators.required),
    })
    this.AssignUserForm.markAllAsTouched()
  }
  //EVENT
  search() {
    this.filterOnlineUserList = new Observable<any[]>(obs => {
      obs.next(this.onlineUserList.filter(s => s.FullName.toLowerCase().includes(this.searchUser.toLowerCase())))
      obs.complete()
    })
    this.AssignUserForm.reset()
    this.AssignUserForm.markAllAsTouched()
  }
  //click
  closeAssignUserDialog(refresh: boolean) {
    this.AssignUserDialogOpened = false
    this.closed.emit(refresh)
  }
  assign() {
    var i = this.AssignUserForm.get('onlineUser_radio').value

    if (Ps_UtilObjectService.hasValue(i)) {
      this.filterOnlineUserList.subscribe(res => {
        var staffID: number = res[i].Code

        if (Ps_UtilObjectService.hasValue(staffID) && staffID > 0)
          this.AssignUsers(staffID)
      })
    }
  }
}
