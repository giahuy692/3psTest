import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrBoardingListComponent } from './hr-boarding-list.component';

describe('HrBoardingListComponent', () => {
  let component: HrBoardingListComponent;
  let fixture: ComponentFixture<HrBoardingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrBoardingListComponent]
    });
    fixture = TestBed.createComponent(HrBoardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
