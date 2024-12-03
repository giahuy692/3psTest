import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri025ResignationRequestListComponent } from './hri025-resignation-request-list.component';

describe('Hri025ResignationRequestListComponent', () => {
  let component: Hri025ResignationRequestListComponent;
  let fixture: ComponentFixture<Hri025ResignationRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri025ResignationRequestListComponent]
    });
    fixture = TestBed.createComponent(Hri025ResignationRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
