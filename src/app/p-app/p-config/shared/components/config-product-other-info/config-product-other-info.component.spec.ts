import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProductOtherInfoComponent } from './config-product-other-info.component';

describe('ConfigProductOtherInfoComponent', () => {
  let component: ConfigProductOtherInfoComponent;
  let fixture: ComponentFixture<ConfigProductOtherInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigProductOtherInfoComponent]
    });
    fixture = TestBed.createComponent(ConfigProductOtherInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
