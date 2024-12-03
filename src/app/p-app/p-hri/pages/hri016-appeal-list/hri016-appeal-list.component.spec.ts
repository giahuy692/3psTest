import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hri016AppealListComponent } from './hri016-appeal-list.component';

describe('Hri016AppealListComponent', () => {
  let component: Hri016AppealListComponent;
  let fixture: ComponentFixture<Hri016AppealListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Hri016AppealListComponent]
    });
    fixture = TestBed.createComponent(Hri016AppealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
