import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenPage } from './open.page';

describe('OpenPage', () => {
  let component: OpenPage;
  let fixture: ComponentFixture<OpenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
