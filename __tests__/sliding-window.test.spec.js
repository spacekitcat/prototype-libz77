import { SlidingWindow } from '../src/sliding-window';

describe('SlidingWindow', () => {
  let inputStream = [97, 97, 98, 97];

  let slidingWindow;
  describe('intial cursor', () => {
    beforeAll(() => {
      slidingWindow = new SlidingWindow(4, 4);
      slidingWindow.setInput(inputStream);
    });

    it('has the correct lookAhead contents', () => {
      expect(slidingWindow.lookAhead()).toEqual(['a', 'a', 'b', 'a']);
    });

    it('has the correct lookBack contents', () => {
      expect(slidingWindow.lookBack()).toEqual([]);
    });
  });

  describe('slide 2', () => {
    beforeAll(() => {
      slidingWindow = new SlidingWindow(4, 4);
      slidingWindow.setInput(inputStream);
      slidingWindow.slideBy(2);
    });

    it('has the correct lookAhead contents', () => {
      expect(slidingWindow.lookAhead()).toEqual(['b', 'a']);
    });

    it('has the correct lookBack contents', () => {
      expect(slidingWindow.lookBack()).toEqual(['a', 'a']);
    });
  });

  describe('slide callback 2', () => {
    beforeAll(() => {
      slidingWindow = new SlidingWindow(4, 4);
      slidingWindow.setInput(inputStream);
      slidingWindow.slide((lookAhead, lookbackLength) => ({
        prefix: [0, 0]
      }));
    });

    it('has the correct lookAhead contents', () => {
      expect(slidingWindow.lookAhead()).toEqual(['a', 'b', 'a']);
    });

    it('has the correct lookBack contents', () => {
      expect(slidingWindow.lookBack()).toEqual(['a']);
    });
  });
});
