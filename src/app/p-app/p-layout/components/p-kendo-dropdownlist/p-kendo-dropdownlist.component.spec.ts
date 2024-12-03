import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDropdownlistComponent } from './p-kendo-dropdownlist.component';

describe('PDropdownlistComponent', () => {
  let component: PDropdownlistComponent;
  let fixture: ComponentFixture<PDropdownlistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PDropdownlistComponent]
    });
    fixture = TestBed.createComponent(PDropdownlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
