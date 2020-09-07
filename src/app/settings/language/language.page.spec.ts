import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LanguagePage } from './language.page';

describe('LanguagePage', () => {
  let component: LanguagePage;
  let fixture: ComponentFixture<LanguagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
