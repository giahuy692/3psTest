import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigHistoryPopupComponent } from './config-history-popup.component';

describe('ConfigHistoryPopupComponent', () => {
  let component: ConfigHistoryPopupComponent;
  let fixture: ComponentFixture<ConfigHistoryPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigHistoryPopupComponent]
    });
    fixture = TestBed.createComponent(ConfigHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
