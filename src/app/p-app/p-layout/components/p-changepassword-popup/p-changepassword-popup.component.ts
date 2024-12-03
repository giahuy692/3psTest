import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { LayoutService } from '../../services/layout.service';
import { eyeIcon } from '@progress/kendo-svg-icons';
import { LayoutAPIService } from '../../services/layout-api.service';
import { Ps_UtilObjectService, Ps_AuthService } from 'src/app/p-lib';

@Component({
  selector: 'p-changepassword-popup',
  templateUrl: './p-changepassword-popup.component.html',
  styleUrls: ['./p-changepassword-popup.component.scss']
})
export class PChangepasswordPopupComponent implements OnInit {
  loading = false
  submitted = false;

  PasswordHidden = true;
  NewPasswordHidden = true;
  RenewPasswordHidden = true;

  icons = { eyeIcon: eyeIcon };
  form: UntypedFormGroup;

  @ViewChild('eyeIconPassword') eyeIconPassword;
  @ViewChild('eyeIconNewPassword') eyeIconNewPassword;
  @ViewChild('eyeIconRenewPassword') eyeIconRenewPassword;

  @ViewChild('Password') inputPassword;
  @ViewChild('NewPassword') inputNewPassword;
  @ViewChild('RenewPassword') inputRenewPassword;

  constructor(public layoutService: LayoutService,
    public layoutApiService: LayoutAPIService,
    protected authen: Ps_AuthService,) { }

  ngOnInit(): void {
    this.loadForm()
  }
  //load
  loadForm() {
    this.form = new UntypedFormGroup({
      'Password': new UntypedFormControl('', Validators.required),
      'NewPassword': new UntypedFormControl('', Validators.required),
      'RenewPassword': new UntypedFormControl('', Validators.required),
    }, { validators: this.checkPasswords })
  }
  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }
  //CLICK EVENT
  closeDialog() {
    this.layoutService.setChangePasswordDialog(false)
  }
  onSubmit() {
    var ctx = "Đổi mật khẩu"
    this.submitted = true;
    // reset alerts on submit
    // this.alertService.clear();
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
		var param = { Password: this.f.Password.value, NewPassword: this.f.NewPassword.value, RenewPassword: this.f.RenewPassword.value }

    this.authen.changePassword(param)
      .subscribe(res => {
        this.layoutService.onSuccess(`${ctx} thành công`)
        this.authen.logout()
      }, err => {
        this.layoutService.onError(`${ctx} thất bại`)
        this.loading = false
      })
  }

  togglePassword(inputName: string) {
    this[inputName + 'Hidden'] = !this[inputName + 'Hidden']

    if (this[inputName + 'Hidden']) {
      this['input' + inputName].nativeElement.type = 'password'
      this['eyeIcon' + inputName].element.nativeElement.firstElementChild.style.fill = '#e4e7ea';//$gray-200
    } else {
      this['input' + inputName].nativeElement.type = 'text'
      this['eyeIcon' + inputName].element.nativeElement.firstElementChild.style.fill = '#959db3';//$light-blue-gray
    }
  }
  //AUTO RUN
  isDialogOpen() {
    return this.layoutService.getChangePasswordDialog()
  }
  keydownEnter(e: KeyboardEvent) {
    //disable close drawer
    e.preventDefault();
    e.stopPropagation();
  }
  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('NewPassword').value;
    let confirmPass = group.get('RenewPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }
}
