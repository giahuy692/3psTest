import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config007CargoStatusComponent } from './config007-cargo-status.component';

describe('Config007CargoStatusComponent', () => {
  let component: Config007CargoStatusComponent;
  let fixture: ComponentFixture<Config007CargoStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config007CargoStatusComponent]
    });
    fixture = TestBed.createComponent(Config007CargoStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
