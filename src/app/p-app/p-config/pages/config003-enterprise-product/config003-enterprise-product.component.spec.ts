import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config003EnterpriseProductComponent } from './config003-enterprise-product.component';

describe('Config003EnterpriseProductComponent', () => {
  let component: Config003EnterpriseProductComponent;
  let fixture: ComponentFixture<Config003EnterpriseProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config003EnterpriseProductComponent]
    });
    fixture = TestBed.createComponent(Config003EnterpriseProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
