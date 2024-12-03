import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri034OffboardedDetailComponent } from './hri034-offboarded-detail.component';

describe('Hri034OffboardedDetailComponent', () => {
  let component: Hri034OffboardedDetailComponent;
  let fixture: ComponentFixture<Hri034OffboardedDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri034OffboardedDetailComponent]
    });
    fixture = TestBed.createComponent(Hri034OffboardedDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
