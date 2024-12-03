import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hri015WrongReportQuestionComponent } from './hri015-wrong-report-question.component';

describe('Hri015WrongReportQuestionComponent', () => {
  let component: Hri015WrongReportQuestionComponent;
  let fixture: ComponentFixture<Hri015WrongReportQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Hri015WrongReportQuestionComponent],
      // ... other necessary imports and providers
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hri015WrongReportQuestionComponent);
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
