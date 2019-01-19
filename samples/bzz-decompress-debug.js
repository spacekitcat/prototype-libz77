#!/usr/bin/env node
import { DecompressorTransformer } from '../lib/decompressor-transformer';
import fs from 'fs';
import { createStream } from 'table';
import colors from 'ansi-colors';
import readline from 'readline';

/* 
  This is a quick and dirty convenience tool. It parses a `.bzz` binary format 
  file (generated by `filecompress.js`), deserializes the packet, and it 
  outputs each compression packet in the order they would be parsed. It also
  attaches context state, such contents of the dictionary.

  The comments below are markers for where the main responsibilities lie. The
  next step would to modularize along those lines. Forgive the mess, this is
  likely just a throwaway tool for trickier debugging sessions.
*/

let filePath = process.argv[2];

if (!filePath) {
  console.log('No input file path specified. Please provide a file path.');
  process.exit(-1);
}

let fileReadStream = fs.createReadStream(filePath);
let fileWriteStream = fs.createWriteStream('/dev/null');
let decompressorTransformer = new DecompressorTransformer();

// stdout-table-formatter: create table formatter stream
let statusStream = createStream({
  columnDefault: {
    width: 25
  },
  columnCount: 5
});
// stdout-table-formatter: create column headers
statusStream.write([
  'Token field',
  'Prefix field',
  'Packet header',
  'Packet raw source buffer',
  'History buffer'
]);

// stdin-next-page-event: enable readline and set raw mode on
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
// stdin-next-page-event: register key-press listened
process.stdin.on('keypress', (str, key) => {
  let data = fileReadStream.read(64);
  if (data) {
    decompressorTransformer.write(data);
    process.stdout.write(
      `\n\t\t\t\t\t\t\tPress ${colors.red('Enter')} to advance.\n`
    );
  } else {
    decompressorTransformer.end();
  }
});
// stdin-next-page-event: disable raw mode
process.stdin.setRawMode(false);

// decompress-unpack-event: register callback for packet unpack events
decompressorTransformer.on('packet-unpack', data => {
  // decompress-unpack-event: extract prefix value for display
  let prefix = data.packet.p ? data.packet.p : 'N/A';
  // tokenize the dictionary into octet digits
  let buffer = data.history_buffer.buffer.toString('hex').match(/.{1,2}/g);
  // decompress-unpack-event: write stats to status (table formatter) stream
  statusStream.write([
    data.packet.t.toString('hex'),
    prefix,
    `size=${data.header.size}, prefix=${
      data.header.hasPrefix ? data.header.hasPrefix : 'N/A'
    } prefixByteExtOne=${
      data.header.prefixByteExtOne ? data.header.prefixByteExtOne : 'N/A'
    }`,
    data.buffer.toString('hex'),
    buffer
  ]);
});

// decompress-finish-event: register callback for when the caller of decompressor is done with it.
decompressorTransformer.on('finish', () => {
  // decompress-finish-event: get the user telt.
  process.stdout.write(`\n${colors.red('Boom, done.')}\n`);
  // decompress-finish-event: get the operating system telt.
  process.exit();
});

// application-execute: start the flow from decompressor to output
decompressorTransformer.pipe(fileWriteStream);
// application-execute: user instructions, get them telt.
process.stdout.write(
  `\n\t\t\t\t\t\t\tPress ${colors.red('Enter')} to advance.\n`
);
