import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Hr001StaffListComponent } from './hr001-staff-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';
import { PKendoGridComponent } from 'src/app/p-app/p-layout/components/p-kendo-grid/p-kendo-grid.component';
import { CheckboxButtonGroupComponent } from 'src/app/p-app/p-layout/components/checkbox-button-group/checkbox-button-group.component';
import { SelectedRowitemPopupComponent } from 'src/app/p-app/p-layout/components/selected-rowitem-popup/selected-rowitem-popup.component';
import { ColorStatusPipe } from 'src/app/p-app/p-layout/pipe/color-status.pipe';
import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextBoxModule } from '@progress/kendo-angular-inputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { StaffApiService } from '../../shared/services/staff-api.service';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { LayoutService } from 'src/app/p-app/p-layout/services/layout.service';
import { PS_HelperMenuService } from 'src/app/p-app/p-layout/services/p-menu.helper.service';
import { ModuleDataItem } from 'src/app/p-app/p-layout/dto/menu-data-item.dto';
import { of } from 'rxjs';
//ng test --include=src/app/p-app/p-hri/pages/hr001-staff-list/hr001-staff-list.component.spec.ts   
describe('Hr001StaffListComponent', () => { 
  let component: Hr001StaffListComponent;
  let fixture: ComponentFixture<Hr001StaffListComponent>;
  let httpTestingController: HttpTestingController;
  let layoutService: LayoutService;
  let menuService: PS_HelperMenuService;
  let apiService: StaffApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        Hr001StaffListComponent, 
        SearchFilterGroupComponent,
        PKendoGridComponent,
        CheckboxButtonGroupComponent,
        SelectedRowitemPopupComponent,
        ColorStatusPipe
      ],
      imports: [
        HttpClientTestingModule,
        AppModule,
        RouterTestingModule,
        DatePickerModule,
        GridModule,
        FormsModule,
        BrowserAnimationsModule,
        TextBoxModule,
        PopupModule,
        ButtonsModule
      ],
      providers: [
        NotificationService,
        StaffApiService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hr001StaffListComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  // afterEach(() => {
  //   httpTestingController.verify();
  // });

  //
   it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 
  it('should load filters correctly', () => {
    const pageSizeOptions = [10, 20, 50]; // Sample page size options
    const gridState = {
      take: 0,
      filter: {
        filters: []
      }
    };

    component.layoutService.pageSizes = pageSizeOptions;
    component.pageSize = 20; // Set an example pageSize value

    component.danglamviec_checked = true;
    component.thutucnghiviec_checked = true;
    component.danghiviec_checked = false;
    
    component.loadFilter();

    expect(component.pageSizes).toEqual(pageSizeOptions);
    expect(component.gridState.take).toBe(component.pageSize);
    expect(component.filterStatus.filters).toEqual([component.filterStatus_dang, component.filterStatus_thutuc]);
    expect(component.gridState.filter.filters).toEqual([component.filterStatus]);
  });

  it('should update properties and call loadFilter and GetListEmployee', () => {
    const mockEvent = true; // Example mock event
    const mockStrCheck = 'danglamviec_checked';

    spyOn(component, 'loadFilter');
    spyOn(component, 'GetListEmployee');

    component.selectedBtnChange(mockEvent, mockStrCheck);

    expect(component[mockStrCheck]).toBe(mockEvent);
    expect(component.gridState.skip).toBe(0);
    expect(component.loadFilter).toHaveBeenCalled();
    expect(component.GetListEmployee).toHaveBeenCalled();
  });

  it('should skip and call loadFilter and GetListEmployee when filters value is empty string', () => {
    const mockEvent = {
      filters: [
        {
          value: ''
        }
      ]
    };

    spyOn(component, 'loadFilter');
    spyOn(component, 'GetListEmployee');

    component.handleSearch(mockEvent);

    expect(component.gridState.skip).toBe(0);
    expect(component.loadFilter).toHaveBeenCalled();
    expect(component.GetListEmployee).toHaveBeenCalled();
  });

  it('should update filters and properties and call loadFilter and GetListEmployee when filters value is not empty string', () => {
    const mockEvent = {
      filters: [
        {
          value: 'search_value'
        }
      ]
    };

    spyOn(component, 'loadFilter');
    spyOn(component, 'GetListEmployee');

    component.handleSearch(mockEvent);

    expect(component.filterSearchBox.filters).toEqual(jasmine.arrayContaining(mockEvent.filters));
    expect(component.tempSearch).toEqual(mockEvent.filters);
    expect(component.gridState.skip).toBe(0);
    expect(component.loadFilter).toHaveBeenCalled();
    expect(component.GetListEmployee).toHaveBeenCalled();
  });

  it('should reset filters and properties and call loadFilter and GetListEmployee', () => {
    spyOn(component, 'loadFilter');
    spyOn(component, 'GetListEmployee');

    component.resetFilter();

    expect(component.danglamviec_checked).toBe(true);
    expect(component.thutucnghiviec_checked).toBe(false);
    expect(component.danghiviec_checked).toBe(false);
    expect(component.gridState.skip).toBe(0);
    expect(component.loadFilter).toHaveBeenCalled();
    expect(component.GetListEmployee).toHaveBeenCalled();
  });

})

