import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri024TransferDecisionListComponent } from './hri024-transfer-decision-list.component';

describe('Hri024TransferDecisionListComponent', () => {
  let component: Hri024TransferDecisionListComponent;
  let fixture: ComponentFixture<Hri024TransferDecisionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri024TransferDecisionListComponent]
    });
    fixture = TestBed.createComponent(Hri024TransferDecisionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
