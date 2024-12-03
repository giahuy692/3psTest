import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Developer001CompanyListComponent } from './dev001-company-list.component';

describe('Developer001CompanyListComponent', () => {
  let component: Developer001CompanyListComponent;
  let fixture: ComponentFixture<Developer001CompanyListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Developer001CompanyListComponent]
    });
    fixture = TestBed.createComponent(Developer001CompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
