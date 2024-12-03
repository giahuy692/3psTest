import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hri015AnalysisReportQuestionComponent } from './hri015-analysis-report-question.component';

describe('Hri015AnalysisReportQuestionComponent', () => {
  let component: Hri015AnalysisReportQuestionComponent;
  let fixture: ComponentFixture<Hri015AnalysisReportQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Hri015AnalysisReportQuestionComponent],
      // ... other necessary imports and providers
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hri015AnalysisReportQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Your test cases go here
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
  
  it('should call getQuizQuestionReport when loadFilter is called', () => {
    spyOn(component, 'getQuizQuestionReport');
    
    component.loadFilter();
    
    expect(component.getQuizQuestionReport).toHaveBeenCalled();
  });
});
