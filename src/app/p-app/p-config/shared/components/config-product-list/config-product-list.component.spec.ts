import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProductListComponent } from './config-product-list.component';

describe('ConfigProductListComponent', () => {
  let component: ConfigProductListComponent;
  let fixture: ComponentFixture<ConfigProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigProductListComponent]
    });
    fixture = TestBed.createComponent(ConfigProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
