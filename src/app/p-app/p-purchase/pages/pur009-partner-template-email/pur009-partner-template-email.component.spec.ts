import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pur009PartnerTemplateEmailComponent } from './pur009-partner-template-email.component';

describe('Pur009PartnerTemplateEmailComponent', () => {
  let component: Pur009PartnerTemplateEmailComponent;
  let fixture: ComponentFixture<Pur009PartnerTemplateEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Pur009PartnerTemplateEmailComponent]
    });
    fixture = TestBed.createComponent(Pur009PartnerTemplateEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
