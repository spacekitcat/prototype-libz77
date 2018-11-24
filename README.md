Project in progress. It's a first pass at this stage. The samples do lots of work in memory, so don't do anything stupid, such as feeding it a 16GB string.

## synopsis

This is my implementation of the LZ77 compression algorithm described by Yaakov Ziv and Abraham Lempel in thier 1977 paper. LZ77 utilises a structure often described as a sliding window. I like to view the sliding window as a variation of the Cursor (Iterator in _Design Patterns: Elements of Reusable Object-Oriented Software_) pattern, where instead of describing a single index, the current position describes a range of elements and the traversal rate has no connection to the cursor size. The sliding window designates the bottom half of the cursor as the dictionary and the top half as the input stream. So far I've learned that getting the compresison algorithm working is where the fight begins, encoding and streaming is tricky.

The compression process produces a series of compressed frames, each one describing a single token and a pointer onto a range in the dictionary, relative to the current cursor position.

- [x] Skeleton with tests, jests, vests, babel and npm build and test scripts.
- [x] Basic sliding window with lookahead and lookbehind.
- [x] Dynamic window slider for recognising tokens in the lookahead that the lookbehind doesn't know about.
- [x] Basic compression algorithm
- [x] Basic inflate algorithm
- [x] Seperate the slide logic from the SlidingWindow (pass an external function)
- [x] Seperate the compression frame storage from the SlidingWindow
- [x] Make this work with nodejs streams
- [x] Custom iterator for the dictionary to abstract some of the dictionary lookup operations.
- [x] Proper, unit tested sliding window system
- [ ] Release system
- [x] The compression streams resets after every read chunk. This shouldn't have too big an impact for most cases, but it's still rubbish.
- [x] Make everything use arrays instead of strings. This will improve data intergrity because it will use explicit unicode charcodes. It should also make it faster by eliminating string conversions.
- [x] A sample program that can compress and save a file.
- [x] A sample program that can decompress the above
- [ ] Allow an explicit character encoing and for this to be consistent everywhere
- [ ] User configuratble window size.
- [ ] Consistent domain language. The 'dictionary' (from the original paper, it's a different world) should be call the history_buffer everywhere and the window should be called the window or frame.
- [ ] The sliding window doesn't have any kind back pressure or ability to queue stream data

# Building

```bash
$ npm install
```

```bash
ibz7 ‹master*› % npm run build

> libz7@0.1.0 prebuild /Users/burtol86/lisa-workspace/libz7
> babel src --out-dir lib --source-maps && babel samples --out-dir samplestarget --source-maps

Successfully compiled 8 files with Babel.
Successfully compiled 1 file with Babel.
```

# Unit tests

```
/libz7
> jest --coverage

 PASS  __tests__/decompressor-transformer.test.spec.js
 PASS  __tests__/compressor-transformer.test.spec.js
 PASS  __tests__/locate-token.test.spec.js
 PASS  __tests__/find-index-of-subarray.test.spec.js
 PASS  __tests__/consume-input.test.spec.js
 PASS  __tests__/deserialize-packet-from-binary.test.spec.js
 PASS  __tests__/serialize-packet-to-binary.test.spec.js
 PASS  __tests__/extract-token.spec.js
 PASS  __tests__/sliding-window.test.spec.js
-----------------------------------|----------|----------|----------|----------|-------------------|
File                               |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------------------------|----------|----------|----------|----------|-------------------|
All files                          |      100 |      100 |      100 |      100 |                   |
 compressor-transformer.js         |      100 |      100 |      100 |      100 |                   |
 consume-input.js                  |      100 |      100 |      100 |      100 |                   |
 decompressor-transformer.js       |      100 |      100 |      100 |      100 |                   |
 deserialize-packet-from-binary.js |      100 |      100 |      100 |      100 |                   |
 extract-token.js                  |      100 |      100 |      100 |      100 |                   |
 find-index-of-subarray.js         |      100 |      100 |      100 |      100 |                   |
 locate-token.js                   |      100 |      100 |      100 |      100 |                   |
 serialize-packet-to-binary.js     |      100 |      100 |      100 |      100 |                   |
 sliding-window.js                 |      100 |      100 |      100 |      100 |                   |
-----------------------------------|----------|----------|----------|----------|-------------------|

Test Suites: 9 passed, 9 total
Tests:       94 passed, 94 total
Snapshots:   0 total
Time:        1.292s
Ran all test suites.
```

# Examples

The **./sampletarget** folder contains small demonstration scripts which demonstrate interaction with the compress and inflate methods.

### runcompress.js

```bash
libz7 ‹master*› % samplestarget/runcompress.js ilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthew                                           1 ↵

📥         input : ilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthew
💤    compressed : 1i1l1o1v1e1m1a1t1t1h1e1w1r1o1m1a1n1o6iP1,186lP1,367wP10,27
🙌         ratio : 56.86274509803921%

📥         input : 1i1l1o1v1e1m1a1t1t1h1e1w1r1o1m1a1n1o6iP1,186lP1,367wP10,27
💤  decompressed : ilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthewromanoilovematthew
🙌         ratio : 175.86206896551724%
```

## Observations

LZ77 is a very old compression algorithm. It isn't the most optimal, but it's the spark for a whole generation of compression systems and a very nice one to look at for a side project. I thought I'd list some observations I found interesting.

- Compressing jpeg files with this implementation of LZ77 actually make it larger than the original file! It makes sense when you think about it. The sliding window is equivilent to a look up table (LZ78 showed this, citations when I have the spoons), so the thing making it compress like it does is Run Length Encodings (RLEs). The overhead for each compression packet will always be larger than the token assigned to the packet, so you only start to get returns once the prefix entries reference RLEs larger than storage overhead for each packet. I calculate the overhead for an 8 bit token to amount to a minimum overhead 48 bits, which means the prefix must be above 4 characters to actually give a reduction in storage requirements. Calculations are based on the assumption that each compression packet is stored as "T,S,E" where T is the token (8 bits), S (8 bits) is the prefix start index in the current sliding window frame and E (8 bits) is end index offset from S of the prefix. Those three pieces of data give 24 bits, the other 24 bits are the comma seperators and the terminator for each packet (newline, space etc). Anyway, the point I'm making is that JPEGs use much _much_ more sophisticated compression strategies (plural!) in comparison to LZ77 which means the compressed output contains virtually no RLE blocks. I don't know a great deal about JPEG so far, but what I've read is exciting and I hope I can start taking those algorithms apart too.
