import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenerateVmAddressPage } from './generate-vm-address.page';

describe('GenerateVmAddressPage', () => {
  let component: GenerateVmAddressPage;
  let fixture: ComponentFixture<GenerateVmAddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateVmAddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateVmAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
