import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri024TransferDecisionDetailComponent } from './hri024-transfer-decision-detail.component';

describe('Hri024TransferDecisionDetailComponent', () => {
  let component: Hri024TransferDecisionDetailComponent;
  let fixture: ComponentFixture<Hri024TransferDecisionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri024TransferDecisionDetailComponent]
    });
    fixture = TestBed.createComponent(Hri024TransferDecisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
