import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProductPackageInfoComponent } from './config-product-package-info.component';

describe('ConfigProductPackageInfoComponent', () => {
  let component: ConfigProductPackageInfoComponent;
  let fixture: ComponentFixture<ConfigProductPackageInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigProductPackageInfoComponent]
    });
    fixture = TestBed.createComponent(ConfigProductPackageInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
