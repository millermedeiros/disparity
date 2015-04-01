'use strict';

var stringDiff = require('diff');
var ansi = require('ansi-styles');

// ---

exports.unified = unified;
exports.unifiedNoColor = unifiedNoColor;
exports.chars = chars;
exports.removed = 'removed';
exports.added = 'added';
exports.colors = {
  charsRemoved: ansi.bgRed,
  charsAdded: ansi.bgGreen,
  removed: ansi.red,
  added: ansi.green,
  header: ansi.yellow,
  section: ansi.magenta,
};

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
    header = colorize(exports.removed, 'charsRemoved') + ' ' +
      colorize(exports.added, 'charsAdded') + '\n\n';
  }

  var changes = stringDiff.diffChars(oldStr, newStr);
  var diff = changes.map(function(c) {
    var val = replaceInvisibleChars(c.value);
    if (c.added) return colorize(val, 'charsAdded');
    if (c.removed) return colorize(val, 'charsRemoved');
    return val;
  }).join('');

  // this RegExp will include the '\n' char into the lines, easier to join()
  var lines = diff.split(/^/m);

  // add line numbers
  var nChars = lines.length.toString().length;
  lines = lines.map(function(line, i) {
    return rightAlign(i + 1, nChars) + ' | ' + line;
  });

  lines = removeLinesOutOfContext(lines, context);

  return header + lines.join('');
}

function colorize(str, colorId) {
  var color = exports.colors[colorId];
  // avoid highlighting the "\n" (would highlight till the end of the line)
  return str.replace(/[^\n\r]+/g, color.open + '$&' + color.close);
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
    if (diffMap[i] || hasCharDiff(line)) {
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

function hasCharDiff(line) {
  return line.indexOf(exports.colors.charsAdded.open) !== -1 ||
    line.indexOf(exports.colors.charsRemoved.open) !== -1;
}

function escapeRegExp(str) {
  return str.replace(/\W/g,'\\$&');
}

function unified(oldStr, newStr, filePathOld, filePathNew) {
  if (newStr === oldStr) {
    return '';
  }

  var changes = unifiedNoColor(oldStr, newStr, filePathOld, filePathNew);
  // this RegExp will include all the `\n` chars into the lines, easier to join
  var lines = changes.split(/^/m);

  // we avoid colorizing the line breaks
  var start = colorize(lines.slice(0, 2).join(''), 'header');
  var end = lines.slice(2).join('')
    .replace(/^\-.*/gm, colorize('$&', 'removed'))
    .replace(/^\+.*/gm, colorize('$&', 'added'))
    .replace(/^@@.+@@/gm, colorize('$&', 'section'));

  return start + end;
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
