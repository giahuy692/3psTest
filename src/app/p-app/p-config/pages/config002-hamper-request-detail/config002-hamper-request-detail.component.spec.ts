import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config002HamperRequestDetailComponent } from './config002-hamper-request-detail.component';

describe('Config002HamperRequestDetailComponent', () => {
  let component: Config002HamperRequestDetailComponent;
  let fixture: ComponentFixture<Config002HamperRequestDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config002HamperRequestDetailComponent]
    });
    fixture = TestBed.createComponent(Config002HamperRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
