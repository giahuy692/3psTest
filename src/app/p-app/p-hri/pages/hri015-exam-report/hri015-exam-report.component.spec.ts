import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hri015ExamReportComponent } from './hri015-exam-report.component';


describe('Hri015ExamReportComponent', () => {
  let component: Hri015ExamReportComponent;
  let fixture: ComponentFixture<Hri015ExamReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Hri015ExamReportComponent],
      // ... other necessary imports and providers
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hri015ExamReportComponent);
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

  it('should call p_GetReports when ngOnInit is called', () => {
    spyOn(component, 'p_GetReports');

    component.ngOnInit();

    expect(component.p_GetReports).toHaveBeenCalled();
  });

  // Add more test cases for other component methods, input/output properties, and template behavior as needed
});