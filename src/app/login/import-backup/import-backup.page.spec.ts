import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImportBackupPage } from './import-backup.page';

describe('ImportBackupPage', () => {
  let component: ImportBackupPage;
  let fixture: ComponentFixture<ImportBackupPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportBackupPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportBackupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
