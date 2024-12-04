import { Component, OnDestroy, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PS_HelperMenuService } from '../services/p-menu.helper.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ps_UtilObjectService } from 'src/app/p-lib';

@Component({
  selector: 'app-layout-default',
  templateUrl: './layout-default.component.html',
  styleUrls: ['./layout-default.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutDefaultComponent implements OnInit, OnDestroy {
  windowSize: number = 0; // kích thước màn hình
  constructor(public menuService: PS_HelperMenuService,
    public router: Router,
    public activatedRoute: ActivatedRoute) { }
    
  isLoading: boolean = false;
  ngUnsubcribe$ = new Subject<void>();  

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.switchToLayout();
  }

  ngOnInit(): void {
    this.switchToLayout();
    // this.localStorageService.subscribeToStorageChanges('Permission')
    // .pipe(takeUntil(this.ngUnsubcribe$))
    // .subscribe(res => {
    //   if (Ps_UtilObjectService.hasValue(res)) {
    //     console.log('1');
    //     const {key, value} = res;
    //     if (Ps_UtilObjectService.hasValue(key) && Ps_UtilObjectService.hasValue(value)) {
    //       this.router.navigate(['']);
    //       console.log('2');
    //     }
    //   } else {
    //     // this.router.navigate(['login'])
    //     console.log(res);
    //   }
    // }
    // );

    // Lắng nghe GetListModuleAPITree complete
    this.isLoading = true
    this.menuService
      .changePermissionAPI()
      .pipe(takeUntil(this.ngUnsubcribe$))
      .subscribe((res) => {
        if (Ps_UtilObjectService.hasValue(res)) {
          this.isLoading = false
        }
      });
  }

  switchToLayout(){
    this.windowSize = window.innerWidth;
    if(this.windowSize < 440){
      this.menuService.switchToLayout('portal');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubcribe$.next();
    this.ngUnsubcribe$.complete();
  }
}