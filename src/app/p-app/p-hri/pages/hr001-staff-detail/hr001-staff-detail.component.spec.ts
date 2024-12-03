import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hr001StaffDetailComponent } from './hr001-staff-detail.component';
import { OrganizationAPIService } from '../../shared/services/organization-api.service';
import { PS_CommonService } from 'src/app/p-lib';
import { HttpClient,HttpHandler } from '@angular/common/http';
import { PayslipService } from '../../shared/services/payslip.service';

describe('Hr001StaffDetailComponent', () => {
  let component: Hr001StaffDetailComponent;
  let fixture: ComponentFixture<Hr001StaffDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Hr001StaffDetailComponent],
      // ... other necessary imports and providers
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Hr001StaffDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call openDialog correctly', () => {
    spyOn(component, 'openDialog');
    component.openDialog(123);
    expect(component.openDialog).toHaveBeenCalledWith(123);
  });
  
  it('should set loading to true during data retrieval', () => {
    // Simulate data retrieval
    component.getData();
    expect(component.loading).toBeTrue();
  });
  

});