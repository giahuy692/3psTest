import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pur008PriceRequestDetailComponent } from './pur008-price-request-detail.component';

describe('Pur008PriceRequestDetailComponent', () => {
  let component: Pur008PriceRequestDetailComponent;
  let fixture: ComponentFixture<Pur008PriceRequestDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Pur008PriceRequestDetailComponent]
    });
    fixture = TestBed.createComponent(Pur008PriceRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
