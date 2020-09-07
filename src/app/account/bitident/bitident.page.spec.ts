import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BitidentPage } from './bitident.page';

describe('BitidentPage', () => {
  let component: BitidentPage;
  let fixture: ComponentFixture<BitidentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BitidentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BitidentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
