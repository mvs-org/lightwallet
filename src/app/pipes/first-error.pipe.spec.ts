import { FirstErrorPipe } from './first-error.pipe';

describe('FirstErrorPipe', () => {
  it('create an instance', () => {
    const pipe = new FirstErrorPipe();
    expect(pipe).toBeTruthy();
  });
});
