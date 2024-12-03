import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pur008PriceProductDetailComponent } from './pur008-price-product-detail.component';

describe('Pur008PriceProductDetailComponent', () => {
  let component: Pur008PriceProductDetailComponent;
  let fixture: ComponentFixture<Pur008PriceProductDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Pur008PriceProductDetailComponent]
    });
    fixture = TestBed.createComponent(Pur008PriceProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
