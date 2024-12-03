import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Portal001ExamListComponent } from './portal001-exam-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExamApiService } from '../../shared/services/Exam-api.service';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { GridModule } from "@progress/kendo-angular-grid";
import { SearchFilterGroupComponent } from 'src/app/p-app/p-layout/components/search-filter-group/search-filter-group.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { AppModule } from 'src/app/app.module';
import {RouterTestingModule} from '@angular/router/testing'
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { PKendoGridComponent } from 'src/app/p-app/p-layout/components/p-kendo-grid/p-kendo-grid.component';
import { CheckboxButtonGroupComponent } from 'src/app/p-app/p-layout/components/checkbox-button-group/checkbox-button-group.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextBoxModule } from '@progress/kendo-angular-inputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { SelectedRowitemPopupComponent } from 'src/app/p-app/p-layout/components/selected-rowitem-popup/selected-rowitem-popup.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ColorStatusPipe } from 'src/app/p-app/p-layout/pipe/color-status.pipe';

describe('Portal001ExamListComponent', () => { 
  let component: Portal001ExamListComponent;
  let fixture: ComponentFixture<Portal001ExamListComponent>;

  const mockItems = [
    {
      Code: 1,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 7200,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    {
      Code: 2,
      SessionName: "Đợt đánh giá nhân sự kỳ 2/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 0,  
      SesstionStatusName: "Kết thúc đánh giá",
      SesstionStatusID: 2
    },
    {
      Code: 3,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 0,  
      SesstionStatusName: "Kết thúc đánh giá",
      SesstionStatusID: 2
    },
    {
      Code: 4,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 0,  
      SesstionStatusName: "Kết thúc đánh giá",
      SesstionStatusID: 2
    },
    {
      Code: 5,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 0,  
      SesstionStatusName: "Kết thúc đánh giá",
      SesstionStatusID: 2
    },
    {
      Code: 6,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 0,  
      SesstionStatusName: "Kết thúc đánh giá",
      SesstionStatusID: 2
    },
    {
      Code: 7,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 3600,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    {
      Code: 10,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 900,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    {
      Code: 11,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 900,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    {
      Code: 12,
      SessionName: "Đợt đánh giá nhân sự kỳ 1/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 900,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    {
      Code: 13,
      SessionName: "Đợt đánh giá nhân sự kỳ 2/2023",
      TypeOfSessionName: "Đánh giá năng lực nhân sự",
      StartDate: "1970-01-20T00:00:00",
      EndDate: "2024-12-01T00:00:00",
      OpenedDate: "1970-01-20T08:00:00",
      ClosedDate: "1970-01-01T08:00:00",
      Duration: 900,  
      SesstionStatusName: "Đang làm bài",
      SesstionStatusID: 1
    },
    
  ];
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        Portal001ExamListComponent, 
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
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(Portal001ExamListComponent);
    component = fixture.componentInstance;
    (component as any).items = mockItems;
    fixture.detectChanges();
  });

  //
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  //end

  // render Ui

  //DatePicker
  it('should render the datepickers when isMobile is false', fakeAsync(() => {
    component.isMobile = false; // Set isMobile to false
    fixture.detectChanges();
    
    const datepickers = fixture.debugElement.queryAll(By.css('kendo-datepicker'));
    expect(datepickers.length).toBeGreaterThan(0);
  }));
  
  it('should not render the datepickers when isMobile is true', fakeAsync(() => {
    component.isMobile = true; // Set isMobile to true
    fixture.detectChanges();
    
    const datepickers = fixture.debugElement.queryAll(By.css('kendo-datepicker'));
    expect(datepickers.length).toBe(0);
  }));
  //end datePicker

  //Grid
  it('should render the kendo-grid', () => {
    const grid = fixture.debugElement.query(By.css('app-p-kendo-grid'));
    expect(grid).toBeTruthy();
  });
  //end

  //drawer
  it('should render the kendo-drawer when isMobile is true', fakeAsync(() => {
    component.isMobile = true; // Set isMobile to true
    fixture.detectChanges();
    
    const drawer = fixture.debugElement.query(By.css('kendo-drawer'));
    expect(drawer).toBeTruthy();
  }));
  
  it('should not render the kendo-drawer when isMobile is false', fakeAsync(() => {
    component.isMobile = false; // Set isMobile to false
    fixture.detectChanges();
    
    const drawer = fixture.debugElement.query(By.css('kendo-drawer'));
    expect(drawer).toBeFalsy();
  }));
  //end drawer

  // filter

  // it('should handle search and update grid data', fakeAsync(() => {
  //   const mockFilters = {
  //     filters: [{ field: 'SessionName', operator: 'contains', value: 'Đợt đánh giá nhân sự kỳ 1' }],
  //     logic: 'or'
  //   };
  //   const expectedFilteredData = mockItems.filter(item => item.SessionName.includes('Đợt đánh giá nhân sự kỳ 1'));

  //   component.handleSearch(mockFilters);
  //   tick(); // Simulate the passage of time (e.g., for asynchronous operations)
  //   fixture.detectChanges();

  //   expect(component.gridData).toEqual(expectedFilteredData);
  // }));
  //end filter

  //convertSecondsToMinutes
  // it('should convert seconds to minutes', () => {
  //   const timeInSeconds = 900;
  //   const formattedTime = component.convertSecondsToMinutes(timeInSeconds);
  //   expect(formattedTime).toBe('15:00');
  // });
  //end convertSecondsToMinutes

  //formatdate
  it('should format date', () => {
    const inputDateString = '2023-08-03T10:30:00';
    const formattedDate = component.formatdate(inputDateString);
    expect(formattedDate).toBe('03/08/2023 10:30');
  });
  // end formatdate
});
