'use strict';

var stringDiff = require('diff');
var ansi = require('ansi-styles');
var hasAnsi = require('has-ansi');

// ---

exports.unified = unified;
exports.unifiedNoColor = unifiedNoColor;
exports.chars = chars;
exports.removed = 'removed';
exports.added = 'added';

// ---

function chars(oldStr, newStr, opts) {
  if (oldStr === newStr) {
    return '';
  }

  opts = opts || {};

  // how many lines to add before/after the chars diff
  var context = opts.context;
  if (context == null) {
    context = 3;
  }

  // text displayed before diff
  var header = opts.header;
  if (header == null) {
    header = bgRed(exports.removed) + ' ' + bgGreen(exports.added) + '\n\n';
  }

  var changes = stringDiff.diffChars(oldStr, newStr);
  var diff = changes.map(function(c) {
    var val = replaceInvisibleChars(c.value);
    if (c.added) return bgGreen(val);
    if (c.removed) return bgRed(val);
    return val;
  }).join('');

  var endsWithLineBreak = (/\n$/m).test(diff);
  var lines = diff.split('\n');

  // if it ends with line break it would add an extra empty line at the end
  if (endsWithLineBreak) {
    lines.pop();
  }

  // add line numbers
  var nChars = lines.length.toString().length;
  lines = lines.map(function(line, i) {
    return rightAlign(i + 1, nChars) + ' | ' + line;
  });

  lines = removeLinesOutOfContext(lines, context);

  var eof = endsWithLineBreak ? '\n' : '';
  return header + lines.join('\n') + eof;
}

function bgGreen(str) {
  return colorize(str, ansi.bgGreen);
}

function bgRed(str) {
  return colorize(str, ansi.bgRed);
}

function green(str) {
  return colorize(str, ansi.green);
}

function red(str) {
  return colorize(str, ansi.red);
}

function yellow(str) {
  return colorize(str, ansi.yellow);
}

function colorize(str, color) {
  // we need to split the lines to avoid highlighting the "\n" (would highlight
  // till the end of the line)
  return str.split('\n').map(function(s) {
    return color.open + s + color.close;
  }).join('\n');
}

function replaceInvisibleChars(str) {
  return str
    .replace(/\t/g, '<tab>')
    .replace(/\r/g, '<CR>')
    .replace(/\n/g, '<LF>\n');
}

function rightAlign(val, nChars) {
  val = val.toString();
  var diff = nChars - val.length;
  return diff ? (new Array(diff)).join(' ') + val : val;
}

function removeLinesOutOfContext(lines, context) {
  var diffMap = {};
  function hasDiff(line, i) {
    if (diffMap[i] || hasAnsi(line)) {
      diffMap[i] = true;
      return true;
    }
    return false;
  }

  return lines.filter(function(line, i, arr) {
    if (hasDiff(line, i)) {
      return true;
    }

    var min = Math.max(i - context, 0);
    var n = i;
    while (--n >= min) {
      if (hasDiff(arr[n], n)) {
        return true;
      }
    }

    var max = Math.min(i + context, arr.length - 1);
    n = i;
    while (++n <= max) {
      if (hasDiff(arr[n], n)) {
        return true;
      }
    }

    return false;
  });
}

function unified(oldStr, newStr, filePathOld, filePathNew) {
  if (newStr === oldStr) {
    return '';
  }

  var changes = unifiedNoColor(oldStr, newStr, filePathOld, filePathNew)
    .replace(/^\-.*/gm, red('$&'))
    .replace(/^\+.*/gm, green('$&'))
    .replace(/^@@.+/gm, yellow('$&'));

  return changes;
}

function unifiedNoColor(oldStr, newStr, filePathOld, filePathNew) {
  if (newStr === oldStr) {
    return '';
  }

  filePathOld = filePathOld || '';
  filePathNew = filePathNew || filePathOld;

  var changes = stringDiff.createPatch('', oldStr, newStr, exports.removed, exports.added);

  // remove first 2 lines (header)
  changes = changes.replace(/^([^\n]+)\n([^\n]+)\n/m, '');

  function appendPath(str, filePath) {
    return str + (filePath ? ' ' + filePath + '\t' : ' ');
  }

  changes = changes
    .replace(/^\+\+\+\s+/gm, appendPath('+++', filePathNew))
    .replace(/^---\s+/gm, appendPath('---', filePathOld));

  return changes;
}
