import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrBoardingDetailComponent } from './hr-boarding-detail.component';

describe('HrBoardingDetailComponent', () => {
  let component: HrBoardingDetailComponent;
  let fixture: ComponentFixture<HrBoardingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrBoardingDetailComponent]
    });
    fixture = TestBed.createComponent(HrBoardingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
