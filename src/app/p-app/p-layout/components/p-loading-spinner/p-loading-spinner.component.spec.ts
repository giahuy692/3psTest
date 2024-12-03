import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PLoadingSpinnerComponent } from './p-loading-spinner.component';

describe('PLoadingSpinnerComponent', () => {
  let component: PLoadingSpinnerComponent;
  let fixture: ComponentFixture<PLoadingSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PLoadingSpinnerComponent]
    });
    fixture = TestBed.createComponent(PLoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
