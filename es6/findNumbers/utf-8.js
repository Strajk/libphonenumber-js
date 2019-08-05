// Javascript doesn't support UTF-8 regular expressions.
// So mimicking them here.

// Copy-pasted from `PhoneNumberMatcher.js`.

/**
 * "\p{Z}" is any kind of whitespace or invisible separator ("Separator").
 * http://www.regular-expressions.info/unicode.html
 * "\P{Z}" is the reverse of "\p{Z}".
 * "\p{N}" is any kind of numeric character in any script ("Number").
 * "\p{Nd}" is a digit zero through nine in any script except "ideographic scripts" ("Decimal_Digit_Number").
 * "\p{Sc}" is a currency symbol ("Currency_Symbol").
 * "\p{L}" is any kind of letter from any language ("Letter").
 * "\p{Mn}" is "non-spacing mark".
 *
 * Javascript doesn't support Unicode Regular Expressions
 * so substituting it with this explicit set of characters.
 *
 * https://stackoverflow.com/questions/13210194/javascript-regex-equivalent-of-a-za-z-using-pl
 * https://github.com/danielberndt/babel-plugin-utf-8-regex/blob/master/src/transformer.js
 */

var _pZ = '\s';
export var pZ = '[' + _pZ + ']';
export var PZ = '[^' + _pZ + ']';

export var _pN = '\d';
// const pN = `[${_pN}]`

var _pNd = '0-9';
export var pNd = '[' + _pNd + ']';

export var _pL = 'a-zA-Z';
var pL = '[' + _pL + ']';
var pL_regexp = new RegExp(pL);

var _pSc = '';
var pSc = '[' + _pSc + ']';
var pSc_regexp = new RegExp(pSc);

/**
 * Helper method to determine if a character is a Latin-script letter or not.
 * For our purposes, combining marks should also return true since we assume
 * they have been added to a preceding Latin character.
 */
export function isLatinLetter(letter) {
  // Combining marks are a subset of non-spacing-mark.
  if (!pL_regexp.test(letter)) {
    return false;
  }

  // ¯\_(ツ)_/¯
  return true;
}

export function isInvalidPunctuationSymbol(character) {
  return character === '%' || pSc_regexp.test(character);
}
//# sourceMappingURL=utf-8.js.map