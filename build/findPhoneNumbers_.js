'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.PhoneNumberSearch = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = findPhoneNumbers;
exports.searchPhoneNumbers = searchPhoneNumbers;

var _constants = require('./constants');

var _extension = require('./extension');

var _parse_ = require('./parse_');

var _parse_2 = _interopRequireDefault(_parse_);

var _parsePreCandidate = require('./findNumbers/parsePreCandidate');

var _parsePreCandidate2 = _interopRequireDefault(_parsePreCandidate);

var _isValidPreCandidate = require('./findNumbers/isValidPreCandidate');

var _isValidPreCandidate2 = _interopRequireDefault(_isValidPreCandidate);

var _isValidCandidate = require('./findNumbers/isValidCandidate');

var _isValidCandidate2 = _interopRequireDefault(_isValidCandidate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } // This is a legacy function.
// Use `findNumbers()` instead.

// Copy-pasted from `./parse.js`.
var VALID_PHONE_NUMBER = '[' + _constants.PLUS_CHARS + ']{0,1}' + '(?:' + '[' + _constants.VALID_PUNCTUATION + ']*' + '[' + _constants.VALID_DIGITS + ']' + '){3,}' + '[' + _constants.VALID_PUNCTUATION + _constants.VALID_DIGITS + ']*';

var WHITESPACE_IN_THE_BEGINNING_PATTERN = new RegExp('^[' + _constants.WHITESPACE + ']+');
var PUNCTUATION_IN_THE_END_PATTERN = new RegExp('[' + _constants.VALID_PUNCTUATION + ']+$');

// // Regular expression for getting opening brackets for a valid number
// // found using `PHONE_NUMBER_START_PATTERN` for prepending those brackets to the number.
// const BEFORE_NUMBER_DIGITS_PUNCTUATION = new RegExp('[' + OPENING_BRACKETS + ']+' + '[' + WHITESPACE + ']*' + '$')

var VALID_PRECEDING_CHARACTER_PATTERN = /[^a-zA-Z0-9]/;

function findPhoneNumbers(text, options, metadata) {
	/* istanbul ignore if */
	if (options === undefined) {
		options = {};
	}

	var search = new PhoneNumberSearch(text, options, metadata);
	var phones = [];
	while (search.hasNext()) {
		phones.push(search.next());
	}
	return phones;
}

/**
 * @return ES6 `for ... of` iterator.
 */
function searchPhoneNumbers(text, options, metadata) {
	/* istanbul ignore if */
	if (options === undefined) {
		options = {};
	}

	var search = new PhoneNumberSearch(text, options, metadata);

	return _defineProperty({}, Symbol.iterator, function () {
		return {
			next: function next() {
				if (search.hasNext()) {
					return {
						done: false,
						value: search.next()
					};
				}
				return {
					done: true
				};
			}
		};
	});
}

/**
 * Extracts a parseable phone number including any opening brackets, etc.
 * @param  {string} text - Input.
 * @return {object} `{ ?number, ?startsAt, ?endsAt }`.
 */

var PhoneNumberSearch = exports.PhoneNumberSearch = function () {
	function PhoneNumberSearch(text) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var metadata = arguments[2];

		_classCallCheck(this, PhoneNumberSearch);

		this.state = 'NOT_READY';

		this.text = text;
		this.options = options;
		this.metadata = metadata;

		this.regexp = new RegExp(VALID_PHONE_NUMBER +
		// Phone number extensions
		'(?:' + _extension.EXTN_PATTERNS_FOR_PARSING + ')?', 'ig');

		// this.searching_from = 0
	}
	// Iteration tristate.


	_createClass(PhoneNumberSearch, [{
		key: 'find',
		value: function find() {
			var matches = this.regexp.exec(this.text);

			if (!matches) {
				return;
			}

			var number = matches[0];
			var startsAt = matches.index;

			number = number.replace(WHITESPACE_IN_THE_BEGINNING_PATTERN, '');
			startsAt += matches[0].length - number.length;
			// Fixes not parsing numbers with whitespace in the end.
			// Also fixes not parsing numbers with opening parentheses in the end.
			// https://github.com/catamphetamine/libphonenumber-js/issues/252
			number = number.replace(PUNCTUATION_IN_THE_END_PATTERN, '');

			number = (0, _parsePreCandidate2.default)(number);

			var result = this.parseCandidate(number, startsAt);

			if (result) {
				return result;
			}

			// Tail recursion.
			// Try the next one if this one is not a valid phone number.
			return this.find();
		}
	}, {
		key: 'parseCandidate',
		value: function parseCandidate(number, startsAt) {
			if (!(0, _isValidPreCandidate2.default)(number, startsAt, this.text)) {
				return;
			}

			// Don't parse phone numbers which are non-phone numbers
			// due to being part of something else (e.g. a UUID).
			// https://github.com/catamphetamine/libphonenumber-js/issues/213
			// Copy-pasted from Google's `PhoneNumberMatcher.js` (`.parseAndValidate()`).
			if (!(0, _isValidCandidate2.default)(number, startsAt, this.text, this.options.extended ? 'POSSIBLE' : 'VALID')) {
				return;
			}

			// // Prepend any opening brackets left behind by the
			// // `PHONE_NUMBER_START_PATTERN` regexp.
			// const text_before_number = text.slice(this.searching_from, startsAt)
			// const full_number_starts_at = text_before_number.search(BEFORE_NUMBER_DIGITS_PUNCTUATION)
			// if (full_number_starts_at >= 0)
			// {
			// 	number   = text_before_number.slice(full_number_starts_at) + number
			// 	startsAt = full_number_starts_at
			// }
			//
			// this.searching_from = matches.lastIndex

			var result = (0, _parse_2.default)(number, this.options, this.metadata);

			if (!result.phone) {
				return;
			}

			result.startsAt = startsAt;
			result.endsAt = startsAt + number.length;

			return result;
		}
	}, {
		key: 'hasNext',
		value: function hasNext() {
			if (this.state === 'NOT_READY') {
				this.last_match = this.find();

				if (this.last_match) {
					this.state = 'READY';
				} else {
					this.state = 'DONE';
				}
			}

			return this.state === 'READY';
		}
	}, {
		key: 'next',
		value: function next() {
			// Check the state and find the next match as a side-effect if necessary.
			if (!this.hasNext()) {
				throw new Error('No next element');
			}

			// Don't retain that memory any longer than necessary.
			var result = this.last_match;
			this.last_match = null;
			this.state = 'NOT_READY';
			return result;
		}
	}]);

	return PhoneNumberSearch;
}();
//# sourceMappingURL=findPhoneNumbers_.js.map