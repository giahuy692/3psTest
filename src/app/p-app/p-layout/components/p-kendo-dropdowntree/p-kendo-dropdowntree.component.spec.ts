import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PKendoDropdowntreeComponent } from './p-kendo-dropdowntree.component';

describe('PKendoDropdowntreeComponent', () => {
  let component: PKendoDropdowntreeComponent;
  let fixture: ComponentFixture<PKendoDropdowntreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PKendoDropdowntreeComponent]
    });
    fixture = TestBed.createComponent(PKendoDropdowntreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
