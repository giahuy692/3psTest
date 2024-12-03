import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config002HamperDetailComponent } from './config002-hamper-detail.component';

describe('Config002HamperDetailComponent', () => {
  let component: Config002HamperDetailComponent;
  let fixture: ComponentFixture<Config002HamperDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config002HamperDetailComponent]
    });
    fixture = TestBed.createComponent(Config002HamperDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
