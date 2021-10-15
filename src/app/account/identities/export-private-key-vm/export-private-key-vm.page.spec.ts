import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExportPrivateKeyVmPage } from './export-private-key-vm.page';

describe('ExportPrivateKeyVmPage', () => {
  let component: ExportPrivateKeyVmPage;
  let fixture: ComponentFixture<ExportPrivateKeyVmPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportPrivateKeyVmPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportPrivateKeyVmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
