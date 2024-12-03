import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrOffboardDecisionDetailComponent } from './hr-offboard-decision-detail.component';

describe('HrOffboardDecisionDetailComponent', () => {
  let component: HrOffboardDecisionDetailComponent;
  let fixture: ComponentFixture<HrOffboardDecisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrOffboardDecisionDetailComponent]
    });
    fixture = TestBed.createComponent(HrOffboardDecisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
