import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrApplicablePositionListComponent } from './hr-applicable-position-list.component';

describe('HrApplicablePositionListComponent', () => {
  let component: HrApplicablePositionListComponent;
  let fixture: ComponentFixture<HrApplicablePositionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrApplicablePositionListComponent]
    });
    fixture = TestBed.createComponent(HrApplicablePositionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
