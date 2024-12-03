import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarConditionApplyComponent } from './mar-condition-apply.component';

describe('MarConditionApplyComponent', () => {
  let component: MarConditionApplyComponent;
  let fixture: ComponentFixture<MarConditionApplyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarConditionApplyComponent]
    });
    fixture = TestBed.createComponent(MarConditionApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
