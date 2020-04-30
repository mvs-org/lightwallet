import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeveloperPage } from './developer.page';

describe('DeveloperPage', () => {
  let component: DeveloperPage;
  let fixture: ComponentFixture<DeveloperPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeveloperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
