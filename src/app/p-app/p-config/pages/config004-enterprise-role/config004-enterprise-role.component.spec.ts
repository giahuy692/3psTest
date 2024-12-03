import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config004EnterpriseRoleComponent } from './config004-enterprise-role.component';

describe('Config004EnterpriseRoleComponent', () => {
  let component: Config004EnterpriseRoleComponent;
  let fixture: ComponentFixture<Config004EnterpriseRoleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config004EnterpriseRoleComponent]
    });
    fixture = TestBed.createComponent(Config004EnterpriseRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
