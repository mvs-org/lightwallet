import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExportXpubPage } from './export-xpub.page';

describe('ExportXpubPage', () => {
  let component: ExportXpubPage;
  let fixture: ComponentFixture<ExportXpubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportXpubPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportXpubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
