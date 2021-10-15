import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BurnPage } from './burn.page';

describe('BurnPage', () => {
  let component: BurnPage;
  let fixture: ComponentFixture<BurnPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BurnPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BurnPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
