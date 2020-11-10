import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransferPage } from './transfer.page';

describe('TransferPage', () => {
  let component: TransferPage;
  let fixture: ComponentFixture<TransferPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
