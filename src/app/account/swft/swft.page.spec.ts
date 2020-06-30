import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwftPage } from './swft.page';

describe('SwftPage', () => {
  let component: SwftPage;
  let fixture: ComponentFixture<SwftPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwftPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwftPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
