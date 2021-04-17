import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VotePage } from './vote.page';

describe('VotePage', () => {
  let component: VotePage;
  let fixture: ComponentFixture<VotePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VotePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
