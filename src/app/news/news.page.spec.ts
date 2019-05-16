import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsPage } from './news.page';

describe('NewsPage', () => {
  let component: NewsPage;
  let fixture: ComponentFixture<NewsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
