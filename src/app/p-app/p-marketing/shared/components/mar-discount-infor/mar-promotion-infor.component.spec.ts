import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarDiscountInforComponent } from './mar-promotion-infor.component';

describe('MarDiscountInforComponent', () => {
  let component: MarDiscountInforComponent;
  let fixture: ComponentFixture<MarDiscountInforComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarDiscountInforComponent]
    });
    fixture = TestBed.createComponent(MarDiscountInforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
