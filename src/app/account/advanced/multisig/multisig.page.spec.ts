import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MultisigPage } from './multisig.page';

describe('MultisigPage', () => {
  let component: MultisigPage;
  let fixture: ComponentFixture<MultisigPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultisigPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MultisigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
