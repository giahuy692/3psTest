import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigSalesAttributeComponent } from './config-sales-attribute.component';

describe('ConfigSalesAttributeComponent', () => {
  let component: ConfigSalesAttributeComponent;
  let fixture: ComponentFixture<ConfigSalesAttributeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigSalesAttributeComponent]
    });
    fixture = TestBed.createComponent(ConfigSalesAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
