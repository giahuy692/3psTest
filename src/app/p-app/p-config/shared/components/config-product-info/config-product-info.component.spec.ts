import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProductInfoComponent } from './config-product-info.component';

describe('ConfigProductInfoComponent', () => {
  let component: ConfigProductInfoComponent;
  let fixture: ComponentFixture<ConfigProductInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigProductInfoComponent]
    });
    fixture = TestBed.createComponent(ConfigProductInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
