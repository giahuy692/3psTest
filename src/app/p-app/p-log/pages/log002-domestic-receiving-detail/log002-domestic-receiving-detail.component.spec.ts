import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Log002DomesticReceivingDetailComponent } from './log002-domestic-receiving-detail.component';

describe('Log002DomesticReceivingDetailComponent', () => {
  let component: Log002DomesticReceivingDetailComponent;
  let fixture: ComponentFixture<Log002DomesticReceivingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Log002DomesticReceivingDetailComponent]
    });
    fixture = TestBed.createComponent(Log002DomesticReceivingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
