import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config003EnterpriseProductDetailComponent } from './config003-enterprise-product-detail.component';

describe('Config003EnterpriseProductDetailComponent', () => {
  let component: Config003EnterpriseProductDetailComponent;
  let fixture: ComponentFixture<Config003EnterpriseProductDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config003EnterpriseProductDetailComponent]
    });
    fixture = TestBed.createComponent(Config003EnterpriseProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
