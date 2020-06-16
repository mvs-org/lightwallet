import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CertificatesPage } from './certificates.page';

describe('CertificatesPage', () => {
  let component: CertificatesPage;
  let fixture: ComponentFixture<CertificatesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificatesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CertificatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
