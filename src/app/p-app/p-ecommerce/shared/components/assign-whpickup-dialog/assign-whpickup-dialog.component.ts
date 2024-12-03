import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { DTOECOMCart } from '../../dto/DTOECOMCart.dto';
import { CartAssignPickOrders } from '../../dto/CartAssignPickOrders';
import { EcomService } from '../../services/ecom.service';
import { EcomAPIService } from '../../services/ecom-api.service';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { DTOMAStore } from 'src/app/p-app/p-marketing/shared/dto/DTOMAStore.dto';

@Component({
  selector: 'assign-whpickup-dialog',
  templateUrl: './assign-whpickup-dialog.component.html',
  styleUrls: ['./assign-whpickup-dialog.component.scss']
})
export class AssignWhpickupDialogComponent implements OnInit {
  loading = false
  @Input('opened') WHPickupDialogOpened = false
  @Output() closed = new EventEmitter();

  WHPickupForm: UntypedFormGroup;
  @Input() selectedOrderList = new Array<DTOECOMCart>()
  @Input('WHPickupList') orderWHNamePickupList = new Array<DTOMAStore>()

  constructor(
    public service: EcomService,
    public apiService: EcomAPIService,
    public layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
    this.loadWHPickupForm()
  }
  //LOAD
  loadWHPickupForm() {
    this.WHPickupForm = new UntypedFormGroup({
      'WHPickup_radio': new UntypedFormControl(null, Validators.required),
    })
    this.WHPickupForm.markAllAsTouched()
  }
  //API
  p_AssignPickOrders(obj: CartAssignPickOrders) {
    this.loading = true;
    var ctx = "Giao đơn vị xử lý"

    this.apiService.AssignPickOrders(obj).subscribe((res) => {
      if (Ps_UtilObjectService.hasValue(res) && res.StatusCode == 0) {
        this.closeWHPickupDialog(true)
        this.layoutService.onSuccess(`${ctx} thành công`)
      } else
        this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)

      this.loading = false;
    }, () => {
      this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}`)
      this.loading = false;
    });
  }
  //EVENT
  //click
  closeWHPickupDialog(refresh: boolean) {
    this.WHPickupDialogOpened = false
    this.closed.emit(refresh)
  }
  assign() {
    var i = this.WHPickupForm.get("WHPickup_radio").value

    if (Ps_UtilObjectService.hasValue(i)) {
      let obj = new CartAssignPickOrders()
      obj.ListOrders = this.selectedOrderList.map(s => s.Code)
      obj.StoreID = this.orderWHNamePickupList[i].Code

      if (obj.ListOrders.length > 0 && Ps_UtilObjectService.hasValue(obj.StoreID))
        this.p_AssignPickOrders(obj)
    }
  }
}
