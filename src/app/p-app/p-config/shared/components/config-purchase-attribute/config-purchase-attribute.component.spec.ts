import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPurchaseAttributeComponent } from './config-purchase-attribute.component';

describe('ConfigPurchaseAttributesComponent', () => {
  let component: ConfigPurchaseAttributeComponent;
  let fixture: ComponentFixture<ConfigPurchaseAttributeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigPurchaseAttributeComponent]
    });
    fixture = TestBed.createComponent(ConfigPurchaseAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
