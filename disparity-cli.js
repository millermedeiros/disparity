'use strict';

var disparity = require('./disparity');

// decided to not use an external lib because we have very few options
// and very basic logic
exports.parse = function(argv) {
  var args = {
    help: argv.indexOf('--help') !== -1 || argv.indexOf('-h') !== -1 || !argv.length,
    version: argv.indexOf('--version') !== -1 || argv.indexOf('-v') !== -1,
    unified: argv.indexOf('-u') !== -1 || argv.indexOf('--unified') !== -1,
    filePath1: argv[argv.length - 2] || '--',
    filePath2: argv[argv.length - 1] || '--',
    errors: []
  };
  // default mode is "--chars"
  args.chars = !args.unified;

  var re = /^-/;
  if (!args.help && !args.version &&
    (args.filePath1.match(re) || args.filePath2.match(re))) {
    args.errors.push('Error: missing or invalid <file_1> and/or <file_2> path.');
  }

  return args;
};

exports.run = function(args, out, err) {
  out = out || process.stdout;
  err = err || process.stderr;

  if (args.help) {
    showHelp(out);
    return 0;
  }

  if (args.version) {
    out.write('disparity v' + require('./package.json').version + '\n');
    return 0;
  }

  if (args.errors && args.errors.length) {
    args.errors.forEach(function(e) {
      err.write(e + '\n');
    });
    err.write('\n');
    showHelp(out);
    return 1;
  }

  var fs = require('fs');
  var p1 = args.filePath1;
  var p2 = args.filePath2;
  var f1 = fs.readFileSync(p1).toString();
  var f2 = fs.readFileSync(p2).toString();

  if (args.unified) {
    out.write(disparity.unified(f1, f2, p1, p2));
    return 0;
  }

  // defaul to char diff
  out.write(disparity.chars(f1, f2));
  return 0;
};

function showHelp(out) {
  out.write([
    'disparity [OPTIONS] <file_1> <file_2>',
    'Colorized string diff.',
    '',
    'Options:',
    '  -u, --unified  Output unified diff.',
    '  -c, --chars    Output char diff (default mode).',
    '  -v, --version  Display current version.',
    '  -h, --help     Display this help.',
    ''
  ].join('\n'));
}
