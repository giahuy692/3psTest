import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dev003ApiListComponent } from './dev003-api-list.component';

describe('Developer003ApiListComponent', () => {
  let component: Dev003ApiListComponent;
  let fixture: ComponentFixture<Dev003ApiListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Dev003ApiListComponent]
    });
    fixture = TestBed.createComponent(Dev003ApiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
