import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenFilePage } from './open-file.page';

describe('OpenFilePage', () => {
  let component: OpenFilePage;
  let fixture: ComponentFixture<OpenFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
