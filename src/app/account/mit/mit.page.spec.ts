import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MitPage } from './mit.page';

describe('MitPage', () => {
  let component: MitPage;
  let fixture: ComponentFixture<MitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
