import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExportMobilePage } from './export-mobile.page';

describe('ExportMobilePage', () => {
  let component: ExportMobilePage;
  let fixture: ComponentFixture<ExportMobilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportMobilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
