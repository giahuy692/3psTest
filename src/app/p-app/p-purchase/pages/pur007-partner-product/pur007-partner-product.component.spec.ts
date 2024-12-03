import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pur007PartnerProductComponent } from './pur007-partner-product.component';

describe('Pur007PartnerProductComponent', () => {
  let component: Pur007PartnerProductComponent;
  let fixture: ComponentFixture<Pur007PartnerProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Pur007PartnerProductComponent]
    });
    fixture = TestBed.createComponent(Pur007PartnerProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
