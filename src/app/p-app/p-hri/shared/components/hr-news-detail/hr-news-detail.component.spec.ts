import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrNewsDetailComponent } from './hr-news-detail.component';

describe('HrNewDetailComponent', () => {
  let component: HrNewsDetailComponent;
  let fixture: ComponentFixture<HrNewsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HrNewsDetailComponent]
    });
    fixture = TestBed.createComponent(HrNewsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
