export interface Options {
  /**
   * How many lines to display before/after a line that contains diffs
   *
   * @default 3
   */
  context?: number;
  /**
   * File paths displayed just before the diff
   *
   * @default [disparity.removed, disparity.added]
   */
  paths?: [string, string];
}

/**
 * Diffs two blocks of text, comparing character by character
 * and returning a string with ansi color codes.
 *
 * Will return an empty string if `oldStr` equals `newStr`.
 *
 * @example ```
 * var diff = disparity.chars(file1, file2);
 * console.log(diff);
 * ```
 *
 * @param {string} oldStr
 * @param {string} newStr
 * @param {Options} opts
 *
 * @return {string}
 */
export function chars(oldStr: string, newStr: string, opts: Options): string;

/**
 * Returns ansi colorized {@link https://en.wikipedia.org/wiki/Diff_utility#Unified_format unified diff}.
 *
 * Will return an empty string if `oldStr` equals `newStr`.
 *
 * @example ```
 * var diff = disparity.unified(file1, file2, {
 *  paths: ['test/file1.js', 'test/file2.js']
 * });
 * console.log(diff);
 * ```
 *
 * @param {string} oldStr
 * @param {string} newStr
 * @param {Options} opts
 *
 * @return {string}
 */
export function unified(oldStr: string, newStr: string, opts: Options): string;

/**
 * Returns ansi colorized {@link https://en.wikipedia.org/wiki/Diff_utility#Unified_format unified diff}.
 * Useful for terminals that {@link https://www.npmjs.com/package/supports-color don't support color}.
 *
 * Will return an empty string if `oldStr` equals `newStr`.
 *
 * @example ```
 * var diff = disparity.unifiedNoColor(file1, file2, {
 *  paths: ['test/file1.js', 'test/file2.js']
 * });
 * console.log(diff);
 * ```
 *
 * @param {string} oldStr
 * @param {string} newStr
 * @param {Options} opts
 *
 * @return {string}
 */
export function unifiedNoColor(
  oldStr: string,
  newStr: string,
  opts: Options
): string;

/**
 * The string used on diff headers to say that chars/lines were removed
 *
 * @default 'removed'
 */
export let removed: string;

/**
 * The string used on the diff headers to say that chars/lines were added
 *
 * @default 'added'
 */
export let added: string;

export interface DiffColor {
  open: string;
  close: string;
}

/**
 * Object containing references to all the colors used by disparity.
 */
export let colors: {
  added: DiffColor;
  charsAdded: DiffColor;
  charsRemoved: DiffColor;
  header: DiffColor;
  removed: DiffColor;
  section: DiffColor;
};
