import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrOffboardDecisionListComponent } from './hr-offboard-decision-list.component';

describe('HrOffboardDecisionListComponent', () => {
  let component: HrOffboardDecisionListComponent;
  let fixture: ComponentFixture<HrOffboardDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrOffboardDecisionListComponent]
    });
    fixture = TestBed.createComponent(HrOffboardDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
