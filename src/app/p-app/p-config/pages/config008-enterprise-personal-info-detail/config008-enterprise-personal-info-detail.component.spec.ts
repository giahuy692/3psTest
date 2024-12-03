import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config008EnterprisePersonalInfoDetailComponent } from './config008-enterprise-personal-info-detail.component';

describe('Config008EnterprisePersonalInfoDetailComponent', () => {
  let component: Config008EnterprisePersonalInfoDetailComponent;
  let fixture: ComponentFixture<Config008EnterprisePersonalInfoDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config008EnterprisePersonalInfoDetailComponent]
    });
    fixture = TestBed.createComponent(Config008EnterprisePersonalInfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
