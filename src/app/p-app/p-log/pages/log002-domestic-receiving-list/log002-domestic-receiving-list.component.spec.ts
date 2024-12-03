import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Log002DomesticReceivingListComponent } from './log002-domestic-receiving-list.component';

describe('Log002DomesticReceivingListComponent', () => {
  let component: Log002DomesticReceivingListComponent;
  let fixture: ComponentFixture<Log002DomesticReceivingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Log002DomesticReceivingListComponent]
    });
    fixture = TestBed.createComponent(Log002DomesticReceivingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
