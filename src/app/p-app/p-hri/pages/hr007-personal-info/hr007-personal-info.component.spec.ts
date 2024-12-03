import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Hri007PersonalInfoComponent } from './hr007-personal-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppModule } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { NumericTextBoxModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { Ps_UtilObjectService } from 'src/app/p-lib';
import { formatDate } from '@angular/common';

describe('Hri007PersonalInfoComponent', () => { 
  let component: Hri007PersonalInfoComponent;
  let fixture: ComponentFixture<Hri007PersonalInfoComponent>;

  beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ 
          Hri007PersonalInfoComponent, 
        ],
        imports: [
          HttpClientTestingModule,
          AppModule,
          RouterTestingModule,
          DatePickerModule,
          BrowserAnimationsModule,
          TextBoxModule,
          ButtonsModule,
          DropDownsModule,
          NumericTextBoxModule
        ],
        providers: [
      
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    });
  
  beforeEach(() => {
  fixture = TestBed.createComponent(Hri007PersonalInfoComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
  });

  it('should create the component', () => {
  expect(component).toBeTruthy();
  });

  it('should generate a list of years', () => {
    const yearList = component.generateYearList();

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 60;
    const endYear = currentYear - 18;
    const expectedYearList = [];

    for (let year = startYear; year <= endYear; year++) {
      expectedYearList.push({ text: year.toString(), value: year });
    }

    expect(yearList).toEqual(expectedYearList);
  })

  it('should return true for a leap year', () => {
    const leapYear = 2000; // A known leap year
    expect(component.isLeapYear(leapYear)).toBeTrue();
  });
  
  it('should return false for a non-leap year', () => {
    const nonLeapYear = 1900; // A known non-leap year
    expect(component.isLeapYear(nonLeapYear)).toBeFalse();
  });

  it('should generate a list of months', () => {
    const monthList = component.getMonth();
    const expectedMonthList = [];
  
    for (let month = 1; month <= 12; month++) {
      expectedMonthList.push({ text: month.toString(), value: month });
    }
  
    expect(monthList).toEqual(expectedMonthList);
  });

  it('should generate a list of days for February', () => {
    const februaryDays = component.getDaysInMonth(2);
  
    expect(februaryDays.length).toBe(28); // February without considering leap year
  });
  
  it('should generate a list of days for April', () => {
    const aprilDays = component.getDaysInMonth(4);
  
    expect(aprilDays.length).toBe(30);
  });
  
  it('should generate a list of days for September', () => {
    const septemberDays = component.getDaysInMonth(9);
  
    expect(septemberDays.length).toBe(30);
  });
  
  it('should generate a list of days for December', () => {
    const decemberDays = component.getDaysInMonth(12);
  
    expect(decemberDays.length).toBe(31);
  });

  it('should call GetGender() and update isFirstGenderOpen flag', () => {
    component.isFirstGenderOpen = true;
    spyOn(component, 'GetGender');
  
    component.open(1);
  
    expect(component.GetGender).toHaveBeenCalled();
    expect(component.isFirstGenderOpen).toBe(false);
  });
  
  it('should call GetMarital() and update isFirstMaritalOpen flag', () => {
    component.isFirstMaritalOpen = true;
    spyOn(component, 'GetMarital');
  
    component.open(2);
  
    expect(component.GetMarital).toHaveBeenCalled();
    expect(component.isFirstMaritalOpen).toBe(false);
  });
  
  // Repeat similar tests for other cases (3, 4, 5, ...)
  
  it('should not call any method and not update any flag for unknown dropdowntype', () => {
    component.isFirstGenderOpen = true;
    component.isFirstMaritalOpen = true;
    // Set other flags as needed
  
    spyOn(component, 'GetGender');
    spyOn(component, 'GetMarital');
    // spyOn other methods as needed
  
    component.open(99); // An unknown value
  
    expect(component.GetGender).not.toHaveBeenCalled();
    expect(component.GetMarital).not.toHaveBeenCalled();
    // expect other methods not to have been called
    expect(component.isFirstGenderOpen).toBe(true);
    expect(component.isFirstMaritalOpen).toBe(true);
    // expect other flags not to have been changed
  });

})