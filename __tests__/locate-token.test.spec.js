import locateToken from '../src/locate-token.js';

describe('locatet()', () => {
  describe('No arguments are provided', () => {
    it('returns undefined', () => {
      expect(locateToken()).toEqual({
        t: undefined
      });
    });
  });

  describe('Both arguments are null', () => {
    it('returns undefined', () => {
      expect(locateToken(null, null)).toEqual({
        t: undefined
      });
    });
  });

  describe('The history buffer is null', () => {
    const dictionaryValue = null;
    describe('The input buffer is not provided', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue)).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer is an empty string', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue, new Buffer([]))).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer is a string of length three', () => {
      it('returns the next character from the input buffer', () => {
        expect(
          locateToken(dictionaryValue, new Buffer([120, 121, 122]))
        ).toEqual({
          t: new Buffer([120]).toString('binary')
        });
      });
    });
  });

  describe('The history buffer is empty', () => {
    const dictionaryValue = new Buffer([]);
    describe('The input buffer is not provided', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue)).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer is an empty string', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue, new Buffer([]))).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer is a string of length three', () => {
      it('returns the next character from the input buffer', () => {
        expect(
          locateToken(dictionaryValue, new Buffer([120, 121, 123]))
        ).toEqual({
          t: new Buffer([120]).toString('binary')
        });
      });
    });
  });

  describe('The history buffer has a length of 3', () => {
    const dictionaryValue = new Buffer([78, 79, 80]);
    describe('The input buffer is not provided', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue)).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer is an empty array', () => {
      it('returns undefined', () => {
        expect(locateToken(dictionaryValue, new Buffer([]))).toEqual({
          t: undefined
        });
      });
    });

    describe('The input buffer contains characters which are not in the history buffer', () => {
      it('returns the next character from the input buffer', () => {
        expect(locateToken(dictionaryValue, new Buffer([97, 98, 99]))).toEqual({
          t: new Buffer([97]).toString('binary')
        });
      });
    });

    describe('The input buffer contains characters which are in the histroy buffer', () => {
      it('returns the next character from the input buffer', () => {
        expect(locateToken(dictionaryValue, new Buffer([79, 80, 79]))).toEqual({
          t: new Buffer([79]).toString('binary')
        });
      });
    });
  });

  describe('The history buffer has a length of 10', () => {
    const dictionaryValue = new Buffer([
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87
    ]);

    describe('The input buffer contains characters which are not in the history buffer', () => {
      it('returns the next character from the input buffer', () => {
        expect(locateToken(dictionaryValue, new Buffer([97, 98, 99]))).toEqual({
          t: new Buffer([97]).toString('binary')
        });
      });
    });

    describe('The input buffer contains characters which are in the histroy buffer', () => {
      describe('and the match is on the threshold (4)', () => {
        it('returns the match as a p', () => {
          expect(
            locateToken(dictionaryValue, new Buffer([81, 82, 83, 84, 100]))
          ).toEqual({
            p: [4, 4],
            t: new Buffer([100]).toString('binary')
          });
        });
      });

      describe('and the match is below the threshold (4)', () => {
        it('returns no p', () => {
          expect(
            locateToken(dictionaryValue, new Buffer([78, 79, 80, 100]))
          ).toEqual({
            t: new Buffer([78]).toString('binary')
          });
        });
      });

      describe('and the match is above the threshold (4)', () => {
        it('returns the match as a p', () => {
          expect(
            locateToken(dictionaryValue, new Buffer([81, 82, 83, 84, 85, 100]))
          ).toEqual({
            p: [3, 5],
            t: new Buffer([100]).toString('binary')
          });
        });
      });
    });
  });
});
