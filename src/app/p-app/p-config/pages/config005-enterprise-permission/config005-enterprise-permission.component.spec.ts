import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Config005EnterprisePermissionComponent } from './config005-enterprise-permission.component';

describe('Config005EnterprisePermissionComponent', () => {
  let component: Config005EnterprisePermissionComponent;
  let fixture: ComponentFixture<Config005EnterprisePermissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Config005EnterprisePermissionComponent]
    });
    fixture = TestBed.createComponent(Config005EnterprisePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
