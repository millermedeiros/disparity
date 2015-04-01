# disparity

Colorized string diff ideal for text/code that spans through multiple lines.

This is basically just a wrapper around
[diff](https://www.npmjs.com/package/diff) and
[ansi-styles](https://www.npmjs.com/package/ansi-styles) + line numbers and
omitting lines that don't have changes and that wouldn't help user identify the
diff "context".

We also replace some *invisible* chars to make it easier to understand what
really changed from one file to another:

 - `\r` becomes `<CR>`
 - `\n` becomes `<LF>`
 - `\t` becomes `<tab>`

Created mainly to be used by
[esformatter](https://www.npmjs.com/package/esformatter) and other tools that
might need to display a nice looking diff of source files.


## API

```js
var disparity = require('disparity');
```

### chars(oldStr, newStr[, opts]):String

Diffs two blocks of text, comparing character by character and returns
a `String` with ansi color codes.

```js
var diff = disparity.chars(file1, file2);
console.log(diff);
```

Will return an empty string if `oldStr === newStr`;

```js
// default options
var opts = {
  // how many lines to display before/after a line that contains diffs
  context: 3,
  // text displayed just before the diff
  header: '\u001b[41mmremoved\u001b[49m \u001b[42madded\u001b[49m\n\n'
};
```

![screenshot char diff](https://github.com/millermedeiros/disparity/chars_diff.png)

### unified(oldStr, newStr[, filePathOld, filePathNew]):String

Returns ansi colorized [unified
diff](http://en.wikipedia.org/wiki/Diff_utility#Unified_format).

```js
var diff = disparity.unified(file1, file2);
console.log(diff);
```

Will return an empty string if `oldStr === newStr`;

![screenshot unified diff](https://github.com/millermedeiros/disparity/unified_diff.png)


## License

Released under the MIT license.

