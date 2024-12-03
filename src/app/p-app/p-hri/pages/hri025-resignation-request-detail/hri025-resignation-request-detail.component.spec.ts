import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri025ResignationRequestDetailComponent } from './hri025-resignation-request-detail.component';

describe('Hri025ResignationRequestDetailComponent', () => {
  let component: Hri025ResignationRequestDetailComponent;
  let fixture: ComponentFixture<Hri025ResignationRequestDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri025ResignationRequestDetailComponent]
    });
    fixture = TestBed.createComponent(Hri025ResignationRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
