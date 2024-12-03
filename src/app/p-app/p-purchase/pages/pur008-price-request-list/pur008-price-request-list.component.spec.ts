import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pur008PriceRequestListComponent } from './pur008-price-request-list.component';

describe('Pur008PriceRequestListComponent', () => {
  let component: Pur008PriceRequestListComponent;
  let fixture: ComponentFixture<Pur008PriceRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Pur008PriceRequestListComponent]
    });
    fixture = TestBed.createComponent(Pur008PriceRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
