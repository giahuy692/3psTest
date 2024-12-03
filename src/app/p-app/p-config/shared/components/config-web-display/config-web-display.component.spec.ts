import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigWebDisplayComponent } from './config-web-display.component';

describe('ConfigWebDisplayComponent', () => {
  let component: ConfigWebDisplayComponent;
  let fixture: ComponentFixture<ConfigWebDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigWebDisplayComponent]
    });
    fixture = TestBed.createComponent(ConfigWebDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
