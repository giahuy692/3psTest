import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri026ResignationDecisionDetailComponent } from './hri026-resignation-decision-detail.component';

describe('Hri026ResignationDecisionDetailComponent', () => {
  let component: Hri026ResignationDecisionDetailComponent;
  let fixture: ComponentFixture<Hri026ResignationDecisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri026ResignationDecisionDetailComponent]
    });
    fixture = TestBed.createComponent(Hri026ResignationDecisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
