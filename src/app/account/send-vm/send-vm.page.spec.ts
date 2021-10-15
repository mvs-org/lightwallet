import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendVmPage } from './send-vm.page';

describe('SwapPage', () => {
  let component: SendVmPage;
  let fixture: ComponentFixture<SendVmPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendVmPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SendVmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
