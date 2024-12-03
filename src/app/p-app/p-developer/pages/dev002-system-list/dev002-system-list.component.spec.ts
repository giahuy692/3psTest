import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Developer002SystemListComponent } from './dev002-system-list.component';

describe('Developer002SystemListComponent', () => {
  let component: Developer002SystemListComponent;
  let fixture: ComponentFixture<Developer002SystemListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Developer002SystemListComponent]
    });
    fixture = TestBed.createComponent(Developer002SystemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
