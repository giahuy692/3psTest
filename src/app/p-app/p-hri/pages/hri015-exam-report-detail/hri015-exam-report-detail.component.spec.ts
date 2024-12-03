import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hri015ExamReportDetailComponent } from './hri015-exam-report-detail.component';


describe('Hri015ExamReportDetailComponent', () => {
  let component: Hri015ExamReportDetailComponent;
  let fixture: ComponentFixture<Hri015ExamReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Hri015ExamReportDetailComponent],
      // ... other necessary imports and providers
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hri015ExamReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loading and justLoaded flags', () => {
    expect(component.loading).toBeFalse();
    expect(component.justLoaded).toBeTrue();
  });

  it('should call getListQuizSession and loadFilter when ngOnInit is called', () => {
    spyOn(component, 'getListQuizSession');
    spyOn(component, 'loadFilter');

    component.ngOnInit();

    expect(component.getListQuizSession).toHaveBeenCalled();
    expect(component.loadFilter).toHaveBeenCalled();
  });

  // Add more test cases for other component methods, input/output properties, and template behavior as needed
});