import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MstPage } from './mst.page';

describe('MstPage', () => {
  let component: MstPage;
  let fixture: ComponentFixture<MstPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MstPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
