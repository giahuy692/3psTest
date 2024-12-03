import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri034OffboardedListComponent } from './hri034-offboarded-list.component';

describe('Hri034OffboardedListComponent', () => {
  let component: Hri034OffboardedListComponent;
  let fixture: ComponentFixture<Hri034OffboardedListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri034OffboardedListComponent]
    });
    fixture = TestBed.createComponent(Hri034OffboardedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
