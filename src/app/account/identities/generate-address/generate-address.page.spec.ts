import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenerateAddressPage } from './generate-address.page';

describe('GenerateAddressPage', () => {
  let component: GenerateAddressPage;
  let fixture: ComponentFixture<GenerateAddressPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateAddressPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
