import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config006EnterprisePartnerComponent } from './config006-enterprise-partner.component';

describe('Config006PartnerListComponent', () => {
  let component: Config006EnterprisePartnerComponent;
  let fixture: ComponentFixture<Config006EnterprisePartnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config006EnterprisePartnerComponent]
    });
    fixture = TestBed.createComponent(Config006EnterprisePartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
