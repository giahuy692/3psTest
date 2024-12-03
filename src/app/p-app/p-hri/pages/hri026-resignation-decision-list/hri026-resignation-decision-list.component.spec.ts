import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri026ResignationDecisionListComponent } from './hri026-resignation-decision-list.component';

describe('Hri026ResignationDecisionListComponent', () => {
  let component: Hri026ResignationDecisionListComponent;
  let fixture: ComponentFixture<Hri026ResignationDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri026ResignationDecisionListComponent]
    });
    fixture = TestBed.createComponent(Hri026ResignationDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
