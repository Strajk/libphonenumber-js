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

const _pZ = '\s'
export const pZ = `[${_pZ}]`
export const PZ = `[^${_pZ}]`

export const _pN = '\d'
// const pN = `[${_pN}]`

const _pNd = '0-9'
export const pNd = `[${_pNd}]`

export const _pL = 'a-zA-Z'
const pL = `[${_pL}]`
const pL_regexp = new RegExp(pL)

const _pSc = ''
const pSc = `[${_pSc}]`
const pSc_regexp = new RegExp(pSc)


/**
 * Helper method to determine if a character is a Latin-script letter or not.
 * For our purposes, combining marks should also return true since we assume
 * they have been added to a preceding Latin character.
 */
export function isLatinLetter(letter)
{
	// Combining marks are a subset of non-spacing-mark.
	if (!pL_regexp.test(letter)) {
		return false
	}

	// ¯\_(ツ)_/¯
	return true
}

export function isInvalidPunctuationSymbol(character)
{
	return character === '%' || pSc_regexp.test(character)
}
