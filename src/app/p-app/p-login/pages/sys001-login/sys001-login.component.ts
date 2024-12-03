import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Ps_AuthService, Ps_UtilObjectService } from 'src/app/p-lib';
import { envelopIcon, lockIcon, eyeIcon, userIcon } from '@progress/kendo-svg-icons';
import { LayoutService } from '../../../p-layout/services/layout.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sys001-login',
  templateUrl: './sys001-login.component.html',
  styleUrls: ['./sys001-login.component.scss']
})
export class Sys001LoginComponent implements OnInit, AfterViewInit {
  loginForm: UntypedFormGroup;
  registerForm: UntypedFormGroup;
  forgetForm: UntypedFormGroup;
  OTPForm: UntypedFormGroup;
  newFwdForm: UntypedFormGroup;

  returnUrl: "/";
  interval;
  //1 = đăng nhập
  //2 = đăng ký
  //3 = quên mật khẩu
  mode: number = 1
  tempPwd: string = ''

  loading: boolean = false;
  submitted: boolean = false;
  passwordHidden: boolean = true;
  isLoggedIn: boolean = true;
  paused: boolean = false;

  scrollViewList = [
    {
      url: '../../../../assets/img/bg_slide_01.png',
      title: 'Redefine The Management',
      desc: 'Xây dựng hệ thống năng động & hiệu quả'
    },
    {
      url: '../../../../assets/img/bg_slide_02.png',
      title: 'Tự do thiết kế và vận hành',
      desc: 'Phần mềm thông minh, đa dạng, khả năng tùy biến cao giúp doanh nghiệp tự thiết kế và vận hành hệ thống quản lý'
    }
  ]

  public icons = {
    envelopIcon: envelopIcon,
    lockIcon: lockIcon,
    eyeIcon: eyeIcon,
    user: userIcon,
  };

  @ViewChild('eyeIconPassword', { static: false }) eyeIconPassword: ElementRef;
  @ViewChild('eyeIconNewPassword', { static: false }) eyeIconNewPassword: ElementRef;
  @ViewChild('eyeIconReNewPassword', { static: false }) eyeIconReNewPassword: ElementRef;
  @ViewChild('inputPassword', { static: false }) inputPassword: ElementRef;
  @ViewChild('inputNewPassword', { static: false }) inputNewPassword: ElementRef;
  @ViewChild('inputReNewPassword', { static: false }) inputReNewPassword: ElementRef;
  @ViewChild('scrollView') scrollView;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
    protected authen: Ps_AuthService,
    public layoutService: LayoutService,
    // private alertService: AlertService
  ) {
    // redirect to home if already logged in
    // if (this.accountService.userValue) {
    //   this.router.navigate(['/']);
    // }
  }

  ngOnInit() {
    if (Ps_UtilObjectService.hasValue(window.caches))
      window.caches.keys().then(function (names) {
        for (let name of names)
          caches.delete(name);
      });

    this.onInitForm()

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // console.log(this.returnUrl)
    let that = this
    this.authen.getCacheToken().subscribe(
      data => {
        // console.log(`data`);
        // console.log(data)

        if (Ps_UtilObjectService.hasValue(data) &&
          Ps_UtilObjectService.hasValueString(data.access_token)) {
          that.router.navigate([that.returnUrl]);
        } else {
          that.isLoggedIn = false
        }
      },
      error => {
        //this.alertService.error(error);
        // console.log(error)
        that.loading = false;
      }
    )

    //#region register
    // Kiểm tra trạng thái được lưu trong Local Storage hoặc Session Storage
    const selectedTab = localStorage.getItem('selectedTab');
    if (selectedTab) {
      this.tabActived = selectedTab; // Đặt trạng thái dựa trên tab được lưu
    }
    //#endregion
  }
  public ngAfterViewInit() {
    this.interval = setInterval(() => {
      if (!this.paused) {
        this.scrollView?.next();
      }
    }, 3000);
  }

  onInitForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.forgetForm = this.formBuilder.group({
      username: ['', [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{9,12}')]],
      fullName: ['', [Validators.required]]
    });

    this.OTPForm = this.formBuilder.group({
      n1: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      n2: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      n3: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      n4: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      n5: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      n6: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
    });

    this.newFwdForm = this.formBuilder.group({
      newPassword: [null, [Validators.required]],
      reNewPassword: [null, [Validators.required]],
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.tabActived == 'login' ? this.loginForm.controls
      : this.tabActived == 'register' ? this.registerForm.controls
        : this.tabActived == 'forgot-pwd' ? this.forgetForm.controls
          : this.tabActived == 'OTP' ? this.OTPForm.controls
            : this.newFwdForm.controls
  }
  // #region ĐĂNG NHẬP
  onSubmit() {
    let that = this
    this.submitted = true;

    // reset alerts on submit
    // this.alertService.clear();

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authen.getToken(this.f.username.value, this.f.password.value)
      .subscribe(res => {
        that.loading = false;
        that.layoutService.onSuccess('Đăng nhập thành công')

        that.authen.getCacheToken().subscribe(v => {
          that.authen.getUserInfo(v.access_token).subscribe(i => {
            // console.log(i);
            that.authen.setCacheUserInfo(i)
            this.tempPwd = this.f.password.value;
            // this.showUI('newPwd',false) // Mở comment để chạy luồng đăng nhập lần đầu
            that.router.navigate([that.returnUrl]);
            //dùng để kiểm tra thời gian khi vừa login
            const userInfoTime = { ...i, accessTime: Date.now().toString() }
            that.authen.setCacheUserInfo(userInfoTime)
            that.router.navigate([that.returnUrl]);
          });
        });
      }, err => {
        that.loading = false;
        that.layoutService.onError('Đăng nhập thất bại')
      });
  }

  togglePassword(inputref: string, iconref: string) {
    this.passwordHidden = !this.passwordHidden

    if (this.passwordHidden == true) {
      this[inputref].nativeElement.type = 'password'
      this[iconref].element.nativeElement.firstElementChild.style.fill = '#e4e7ea';//$gray-200
    } else {
      this[inputref].nativeElement.type = 'text'
      this[iconref].element.nativeElement.firstElementChild.style.fill = '#959db3';//$light-blue-gray
    }
  }

  //#endregion QUÊN MẬT KHẨU
  switchMode(index: number) {
    this.mode = index
  }

  //----  register ---// 
  tabActived: string = 'login'; //= login, register, forgot-fwd, OTP, newPwd

  showUI(tab: string, setCahe: boolean) {
    this.tabActived = tab;
    this.onInitForm();
    this.submitted = false;
    setCahe && localStorage.setItem('selectedTab', this.tabActived); // Lưu trạng thái vào Local Storage
  }

  onSubmitRegister() {
    this.submitted = true;
    let a = this.registerForm.getRawValue();
    this.registerForm.markAllAsTouched();
    let b = this.registerForm.status
    let c = this.registerForm.valid
    let d = this.registerForm.errors
    if (b == 'VALID') {
      console.log('Gọi API đăng ký tài khoản');
      console.log('Nếu đăng ký thành công thì chuyền người dùng về login');
      this.showUI('login', true);
      console.log('Nếu API trả về lỗi thông báo cho người dùng');
      // this.OTPForm.setErrors({ 'apiError': true });
    }
    console.log(a, b, c, d);
  }

  //#region forgot password

  onSubmitForgotPwd() {
    this.submitted = true;
    let a = this.forgetForm.getRawValue();
    this.forgetForm.markAllAsTouched();
    let b = this.forgetForm.status
    let d = this.registerForm.errors
    console.log(a, b, d);
    if (b == 'VALID') {
      console.log('Gọi API gọi api gửi mã OTP đến người dùng, và chuyển người dùng đến UI nhận OTP');
      this.showUI('OTP', false)
      console.log('Bắt đầu đếm thời gian hiệu lực');
      this.startCountdown();
      console.log('Hết thời gian hiện lực thì hiện gửi lại mã xác nhận');
    }
  }

  timeLeft: number = 60; // Số giây mặc định cho thời gian hết hiệu lực của mã OTP
  OTPExpired: boolean = false;
  intervalOTP: any;

  startCountdown() {
    this.intervalOTP = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.OTPExpired = false;
      } else {
        clearInterval(this.intervalOTP); // Dừng đếm ngược khi hết thời gian
        this.OTPExpired = true;
        // Thực hiện các hành động khi mã OTP hết hiệu lực (ví dụ: hiển thị thông báo cho người dùng)
      }
    }, 1000);
  }

  formatTimeLeft(): string {
    const minutes: number = Math.floor(this.timeLeft / 60);
    const seconds: number = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  //#endregion

  //#region OTP


  public get g(): string {
    return this.OTPForm.status
  }

  onSubmitOTP() {
    this.submitted = true;
    let a = this.OTPForm.getRawValue();
    this.OTPForm.markAllAsTouched();
    let b = this.OTPForm.status
    if (b == 'VALID') {
      console.log('Gọi API kiểm tra OTP hợp lệ. Nếu đúng chuyển người dùng tới bước MK mới');
      this.showUI('newPwd', false)
      console.log('Nếu API trả về lỗi thông báo cho người dùng');
      // this.OTPForm.setErrors({ 'apiError': true });
    }
    else {
      this.OTPForm.setErrors({ 'apiError': true });
    }
    console.log(a, b);
  }

  onGetOTP() {
    console.log('Gọi api lấy mã');
    this.timeLeft = 60;
    this.startCountdown();
  }
  //#endregion

  //#region New Pwd
  notiNewPwd: string = ''

  /**
   * 
   * @param type type 1: nhập mã OTP -> đổi mật khẩu | type 2: đăng nhập thành công lần đầu -> đổi mật khẩu 
   */
  onSubmitNewPwd() {
    this.submitted = true;
    var ctx = "Đổi mật khẩu"
    let f = this.newFwdForm.getRawValue();
    this.newFwdForm.markAllAsTouched();
    if (this.newFwdForm.status == 'VALID') {
      if (this.newFwdForm.controls['newPassword'].value === this.newFwdForm.controls['reNewPassword'].value) {
        this.notiNewPwd = ''
        this.loading = true;
        var param = { Password: this.tempPwd, NewPassword: f.newPassword, RenewPassword: f.reNewPassword }
        console.log(param);
        this.authen.changePassword(param)
          .subscribe(res => {
            this.layoutService.onSuccess(`${ctx} thành công`)
            // this.authen.logout()
            this.showUI('login', true);  // Chuyển người dùng về trang đăng nhập
            this.loading = false
          }, err => {
            this.layoutService.onError(`${ctx} thất bại`)
            this.loading = false
          })
      }
      else {
        this.notiNewPwd = 'Mật khẩu không trùng khớp. Vui lòng kiểm tra lại'
      }
    }
    else {
      this.notiNewPwd = 'Vui lòng nhập mật khẩu'
    }
  }

  //#endregion

  //#region API
  //unsubcribe
  $unsubscribe = new Subject<void>
  //  API register
  // APIRegister(dto:DTOSysRegister) {
  //   const ctx = 'Đăng ký tài khoản'
  //   this.apiServiceNews.register(dto).pipe(takeUntil(this.$unsubscribe)).subscribe(
  //     (res) => {
  //       if (Ps_UtilObjectService.hasValue(res) && Ps_UtilObjectService.hasValue(res.ObjectReturn) && res.StatusCode == 0) {
  //         this.layoutService.onSuccess( ${ctx} thành công`)
  //       }
  //       else {
  //         this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${res.ErrorString}`)
  //       }
  //     },
  //     (error) => {
  //       this.layoutService.onError(`Đã xảy ra lỗi khi ${ctx}: ${error}`)
  //     }
  //   )
  // }
  //#endregion
}
