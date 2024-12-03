import { Component, OnDestroy, OnInit } from '@angular/core';
import { DTODetailConfProduct } from '../../shared/dto/DTOConfProduct';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { MenuDataItem, ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-config002-hamper-detail-request',
  templateUrl: './config002-hamper-detail-request.component.html',
  styleUrls: ['./config002-hamper-detail-request.component.scss']
})
export class Config002HamperDetailRequestComponent implements OnInit, OnDestroy{

  product = new DTODetailConfProduct()
  items: any[] = [];

  ngUnsubscribe = new Subject<void>;

  constructor( public menuService: PS_HelperMenuService,
  ){

  }

  ngOnInit(): void {
   const product = JSON.parse(localStorage.getItem("Hamper"))
   this.product = product
   if(product.TypeInfo == 2){
     this.getMenuBreadCrumb();
   }
  }

  loadPage(){
    
  }

  listMenu: MenuDataItem[] = [];
  getMenuBreadCrumb(){
    this.items = []
    this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
      if (Ps_UtilObjectService.hasValue(item)) {
        this.listMenu = item.ListMenu;
        var Menu = localStorage.getItem('Menu');
        var SubMenu = localStorage.getItem('SubMenu');
        this.listMenu.filter(s => s.Type == 'group').find(z => {
          if(z.Code == Menu){
            this.items.push({text: z.Name, Code: z.Code})
            if(Ps_UtilObjectService.hasListValue(z.LstChild)){
              z.LstChild.find(s => {
                if(s.Code == SubMenu){
                  this.items.push({text: s.Name, Code: s.Code})
                  if(Ps_UtilObjectService.hasListValue(s.LstChild)){
                    s.LstChild.find(c => {
                      if(!Ps_UtilObjectService.hasListValue(c.LstChild)){
                        this.items.push(
                          {text: c.Name, Code: c.Code},
                          {text: "Sản phẩm gốc",}
                        )
                      }
                    })
                  }
                }
              })
            }
          }
        })

      }

    });
  }

  backPage(itemBreadcrumb){
      this.menuService.changeModuleData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ModuleDataItem) => {
        if (Ps_UtilObjectService.hasValue(item)) {
         var parent = item.ListMenu.find(f => f.Code == "erpproduct")
          if (Ps_UtilObjectService.hasValue(parent) && Ps_UtilObjectService.hasListValue(parent.LstChild)) {
            var detail = this.searchMenuData(parent.LstChild,itemBreadcrumb.Code)
            this.menuService.activeMenu(detail)
            }
        }
      });
  }

  searchMenuData(dataList, targetCode) {
    for (const item of dataList) {
      if (item.Code === targetCode) {
        return item;
      }
  
      if (Ps_UtilObjectService.hasListValue(item.LstChild)) {
        const foundItem = this.searchMenuData(item.LstChild, targetCode);
        if (foundItem) {
          return foundItem;
        }
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
