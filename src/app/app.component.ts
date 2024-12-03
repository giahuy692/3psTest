import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { AppInit } from './p-app/p-config/shared/services/app-init';
import { PS_CommonService, Ps_AuthService, Ps_UtilCacheService, Ps_UtilObjectService } from './p-lib';
import { LocalStorageService } from './p-lib/services/local-storage.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public isLoaded: boolean = false;
  appInit_sst: Subscription
  ngUnsubcribe$ = new Subject<void>();

  constructor(
    public libCommon: PS_CommonService,
    public auth: Ps_AuthService,
    public cache: Ps_UtilCacheService,
    public zone: NgZone,
    public router: Router,
    private localStorageService: LocalStorageService,
  ) { }

  ngOnInit() {
    let that = this;

    this.appInit_sst = AppInit.init(
      that.libCommon,
      that.auth,
      that.cache,
      that.zone,
      that.router
    ).subscribe(res => {
      that.isLoaded = true;
    });

    that.hiddenLoadingIndex();
    // TODO: test localStorage 
    this.localStorageService.subscribeToLoginState('loginState')
    .pipe(takeUntil(this.ngUnsubcribe$))
    .subscribe(res => {
      if (Ps_UtilObjectService.hasValue(res) && res) {
        this.router.navigate(['']);
      } else {
        this.router.navigate(['login'])
      }
    }
    );
  }
  hiddenLoadingIndex() {
    let item = document.getElementById("pageBody");
    if (Ps_UtilObjectService.hasValue(item) && Ps_UtilObjectService.hasValue(item.setAttribute)) {
      item.setAttribute("class", "ps_loaded");
    }
  }
  showLoadingIndex() {
    let item = document.getElementById("pageBody");
    if (Ps_UtilObjectService.hasValue(item) && Ps_UtilObjectService.hasValue(item.setAttribute)) {
      item.setAttribute("class", "");
    }
  }
  ngOnDestroy() {
    this.appInit_sst?.unsubscribe();
    this.ngUnsubcribe$.next();
    this.ngUnsubcribe$.complete();
  }
}
