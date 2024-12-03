import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config008EnterprisePersonalInfoListComponent } from './config008-enterprise-personal-info-list.component';

describe('Config008EnterprisePersonalInfoListComponent', () => {
  let component: Config008EnterprisePersonalInfoListComponent;
  let fixture: ComponentFixture<Config008EnterprisePersonalInfoListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config008EnterprisePersonalInfoListComponent]
    });
    fixture = TestBed.createComponent(Config008EnterprisePersonalInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
