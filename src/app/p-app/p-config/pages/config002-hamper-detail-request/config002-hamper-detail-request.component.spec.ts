import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config002HamperDetailRequestComponent } from './config002-hamper-detail-request.component';

describe('Config002HamperDetailRequestComponent', () => {
  let component: Config002HamperDetailRequestComponent;
  let fixture: ComponentFixture<Config002HamperDetailRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config002HamperDetailRequestComponent]
    });
    fixture = TestBed.createComponent(Config002HamperDetailRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
