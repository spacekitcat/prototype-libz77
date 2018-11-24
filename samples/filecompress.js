#!/usr/bin/env node
import { CompressorTransformer } from '../lib/compressor-transformer';

import fs from 'fs';

let filePath = process.argv[2];

if (!filePath) {
  console.log('No input file path specified. Please provide a file path.');
  process.exit(-1);
}

let fileReadStream = fs.createReadStream(filePath, 'ascii');

let compressorTransformer = new CompressorTransformer();
let fileWriteStream = fs.createWriteStream(filePath + '.bzz', 'ascii');
fileReadStream.pipe(compressorTransformer).pipe(fileWriteStream);
