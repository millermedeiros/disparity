'use strict';

var assert = require('assert');
var disparity = require('../disparity');
var cli = require('../disparity-cli');
var fs = require('fs');
var path = require('path');

function readFile(name) {
  var filePath = path.join(__dirname, name);
  return fs.readFileSync(filePath).toString();
}

function compare(diff, expected, name) {
  if (diff !== expected) {
    // not using assert because it is easier to understand what is wrong
    process.stderr.write('disparity.' + name + '() failure!\n');
    process.stderr.write('=== expected result:\n');
    process.stderr.write(expected);
    process.stderr.write('=== actual result:\n');
    process.stderr.write(diff);
    throw new Error('assertion error');
  }
}

// setup
// =====

var diff, expected;
var file1 = readFile('file1.js');
var file2 = readFile('file2.js');

// chars
// =====

diff = disparity.chars(file1, file2);
expected = readFile('chars.txt');
compare(diff, expected, 'chars');

// unified
// =======

diff = disparity.unified(file1, file2);
expected = readFile('unified.txt');
compare(diff, expected, 'unified');

diff = disparity.unified(file1, file2, 'test/file1.js', 'test/file2.js');
expected = readFile('unified_2.txt');
compare(diff, expected, 'unified_2');

// unifiedNoColor
// ==============

diff = disparity.unifiedNoColor(file1, file2, 'test/file1.js', 'test/file2.js');
expected = readFile('unified_no_color.txt');
compare(diff, expected, 'unified_no_color');

// custom colors
// =============

var _oldColors = disparity.colors;
// wrap blocks into custom tags
disparity.colors = {
  // chars diff
  charsRemoved: { open: '<bggreen>', close: '</bggreen>' },
  charsAdded: { open: '<bgred>', close: '</bgred>' },

  // unified diff
  removed: { open: '<red>', close: '</red>' },
  added: { open: '<green>', close: '</green>' },
  header: { open: '<yellow>', close: '</yellow>' },
  section: { open: '<magenta>', close: '</magenta>' }
};

diff = disparity.chars(file1, file2);
expected = readFile('chars.html');
compare(diff, expected, 'chars.html');

diff = disparity.unified(file1, file2, 'test/file1.js', 'test/file2.js');
expected = readFile('unified.html');
compare(diff, expected, 'unified.html');

disparity.colors = _oldColors;

// cli.parse
// =========

var args = cli.parse([]);
assert.ok(args.help, 'help');
assert.equal(args.errors.length, 0, 'error 1');

args = cli.parse(['--help']);
assert.ok(args.help, 'help 2');

args = cli.parse(['-h']);
assert.ok(args.help, 'help 3');

args = cli.parse(['-v']);
assert.ok(args.version, 'version');
assert.equal(args.errors.length, 0, 'error 2');

args = cli.parse(['-u']);
assert.equal(args.errors[0], 'Error: missing or invalid <file_1> and/or <file_2> path.', 'error 3');

args = cli.parse(['-u', 'foo.js', '--bar']);
assert.ok(args.unified, '-u');
assert.equal(args.filePath1, 'foo.js');
// --bar should cause an error since it's invalid
assert.equal(args.filePath2, '--bar');
assert.equal(args.errors[0], 'Error: missing or invalid <file_1> and/or <file_2> path.', 'error 4');

args = cli.parse(['--unified', 'foo.js', 'bar.js']);
assert.ok(args.unified, '--unified');
assert.equal(args.filePath1, 'foo.js');
assert.equal(args.filePath2, 'bar.js');
assert.equal(args.errors.length, 0, 'error 5');

args = cli.parse(['-c', 'foo.js', 'bar.js']);
assert.ok(!args.unified, '!--unified');
assert.ok(args.chars, '-c');

args = cli.parse(['--chars', 'foo.js', 'bar.js']);
assert.ok(!args.unified, '!--unified');
assert.ok(args.chars, '--chars');

args = cli.parse(['--no-color', 'foo.js', 'bar.js']);
assert.ok(args.errors.length, '--no-color errors');
assert.ok(args.noColor, '--no-color');

args = cli.parse(['--unified', '--no-color', 'foo.js', 'bar.js']);
assert.ok(!args.errors.length, '--unified --no-color errors');
assert.ok(args.noColor, '--no-color');

// cli.run
// =======

function FakeStream(){
  this.data = '';
  this.write = function(data) {
    this.data += data;
  };
}

var code;
var out = new FakeStream();
var err = new FakeStream();

function run(args) {
  code = null;
  out.data = '';
  err.data = '';
  return cli.run(args, out, err);
}

code = run({ help: true });
assert.ok(!code, 'exit code');
assert.ok(out.data.length > 100, 'output help');

code = run({ version: true });
assert.ok(!code, 'exit code');
assert.equal(out.data, 'disparity v' + require('../package.json').version +'\n', 'version');

code = run({ errors: ['Error: foo bar'] });
assert.ok(code, 'exit code error');
assert.equal(err.data, 'Error: foo bar\n\n');
assert.ok(out.data.search('Options:'));

code = run({
  chars: true,
  filePath1: 'test/file1.js',
  filePath2: 'test/file2.js'
});
expected = readFile('chars.txt');
assert.ok(!code, 'exit code chars');
assert.equal(out.data, expected);
assert.equal(err.data, '');

code = run({
  unified: true,
  filePath1: 'test/file1.js',
  filePath2: 'test/file2.js'
});
expected = readFile('unified_2.txt');
assert.ok(!code, 'exit code chars');
assert.equal(out.data, expected);
assert.equal(err.data, '');

code = run({
  unified: true,
  noColor: true,
  filePath1: 'test/file1.js',
  filePath2: 'test/file2.js'
});
expected = readFile('unified_no_color.txt');
assert.ok(!code, 'exit code chars');
assert.equal(out.data, expected);
assert.equal(err.data, '');
