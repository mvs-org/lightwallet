import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MstCardComponent } from './mst-card.component';

describe('MstCardComponent', () => {
  let component: MstCardComponent;
  let fixture: ComponentFixture<MstCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MstCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MstCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
