'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A port of Google's `PhoneNumberMatcher.java`.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/googlei18n/libphonenumber/blob/master/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberMatcher.java
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Date: 08.03.2018.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _PhoneNumber = require('./PhoneNumber');

var _PhoneNumber2 = _interopRequireDefault(_PhoneNumber);

var _constants = require('./constants');

var _extension = require('./extension');

var _util = require('./findNumbers/util');

var _utf = require('./findNumbers/utf-8');

var _Leniency = require('./findNumbers/Leniency');

var _Leniency2 = _interopRequireDefault(_Leniency);

var _parsePreCandidate = require('./findNumbers/parsePreCandidate');

var _parsePreCandidate2 = _interopRequireDefault(_parsePreCandidate);

var _isValidPreCandidate = require('./findNumbers/isValidPreCandidate');

var _isValidPreCandidate2 = _interopRequireDefault(_isValidPreCandidate);

var _isValidCandidate = require('./findNumbers/isValidCandidate');

var _isValidCandidate2 = _interopRequireDefault(_isValidCandidate);

var _metadata = require('./metadata');

var _parse_ = require('./parse_');

var _parse_2 = _interopRequireDefault(_parse_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Patterns used to extract phone numbers from a larger phone-number-like pattern. These are
 * ordered according to specificity. For example, white-space is last since that is frequently
 * used in numbers, not just to separate two numbers. We have separate patterns since we don't
 * want to break up the phone-number-like text on more than one different kind of symbol at one
 * time, although symbols of the same type (e.g. space) can be safely grouped together.
 *
 * Note that if there is a match, we will always check any text found up to the first match as
 * well.
 */
var INNER_MATCHES = [
// Breaks on the slash - e.g. "651-234-2345/332-445-1234"
'\\/+(.*)/',

// Note that the bracket here is inside the capturing group, since we consider it part of the
// phone number. Will match a pattern like "(650) 223 3345 (754) 223 3321".
'(\\([^(]*)',

// Breaks on a hyphen - e.g. "12345 - 332-445-1234 is my number."
// We require a space on either side of the hyphen for it to be considered a separator.
'(?:' + _utf.pZ + '-|-' + _utf.pZ + ')' + _utf.pZ + '*(.+)',

// Various types of wide hyphens. Note we have decided not to enforce a space here, since it's
// possible that it's supposed to be used to break two numbers without spaces, and we haven't
// seen many instances of it used within a number.
'[\u2012-\u2015\uFF0D]' + _utf.pZ + '*(.+)',

// Breaks on a full stop - e.g. "12345. 332-445-1234 is my number."
'\\.+' + _utf.pZ + '*([^.]+)',

// Breaks on space - e.g. "3324451234 8002341234"
_utf.pZ + '+(' + _utf.PZ + '+)'];

// Limit on the number of leading (plus) characters.
var leadLimit = (0, _util.limit)(0, 2);

// Limit on the number of consecutive punctuation characters.
var punctuationLimit = (0, _util.limit)(0, 4);

/* The maximum number of digits allowed in a digit-separated block. As we allow all digits in a
 * single block, set high enough to accommodate the entire national number and the international
 * country code. */
var digitBlockLimit = _constants.MAX_LENGTH_FOR_NSN + _constants.MAX_LENGTH_COUNTRY_CODE;

// Limit on the number of blocks separated by punctuation.
// Uses digitBlockLimit since some formats use spaces to separate each digit.
var blockLimit = (0, _util.limit)(0, digitBlockLimit);

/* A punctuation sequence allowing white space. */
var punctuation = '[' + _constants.VALID_PUNCTUATION + ']' + punctuationLimit;

// A digits block without punctuation.
var digitSequence = _utf.pNd + (0, _util.limit)(1, digitBlockLimit);

/**
 * Phone number pattern allowing optional punctuation.
 * The phone number pattern used by `find()`, similar to
 * VALID_PHONE_NUMBER, but with the following differences:
 * <ul>
 *   <li>All captures are limited in order to place an upper bound to the text matched by the
 *       pattern.
 * <ul>
 *   <li>Leading punctuation / plus signs are limited.
 *   <li>Consecutive occurrences of punctuation are limited.
 *   <li>Number of digits is limited.
 * </ul>
 *   <li>No whitespace is allowed at the start or end.
 *   <li>No alpha digits (vanity numbers such as 1-800-SIX-FLAGS) are currently supported.
 * </ul>
 */
var PATTERN = '(?:' + _isValidCandidate.LEAD_CLASS + punctuation + ')' + leadLimit + digitSequence + '(?:' + punctuation + digitSequence + ')' + blockLimit + '(?:' + _extension.EXTN_PATTERNS_FOR_MATCHING + ')?';

// Regular expression of trailing characters that we want to remove.
// We remove all characters that are not alpha or numerical characters.
// The hash character is retained here, as it may signify
// the previous block was an extension.
//
// // Don't know what does '&&' mean here.
// const UNWANTED_END_CHAR_PATTERN = new RegExp(`[[\\P{N}&&\\P{L}]&&[^#]]+$`)
//
var UNWANTED_END_CHAR_PATTERN = new RegExp('[^' + _utf._pN + _utf._pL + '#]+$');

var NON_DIGITS_PATTERN = /(\D+)/;

var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

/**
 * A stateful class that finds and extracts telephone numbers from {@linkplain CharSequence text}.
 * Instances can be created using the {@linkplain PhoneNumberUtil#findNumbers factory methods} in
 * {@link PhoneNumberUtil}.
 *
 * <p>Vanity numbers (phone numbers using alphabetic digits such as <tt>1-800-SIX-FLAGS</tt> are
 * not found.
 *
 * <p>This class is not thread-safe.
 */

var PhoneNumberMatcher = function () {

  /**
   * Creates a new instance. See the factory methods in {@link PhoneNumberUtil} on how to obtain a
   * new instance.
   *
   * @param util  the phone number util to use
   * @param text  the character sequence that we will search, null for no text
   * @param country  the country to assume for phone numbers not written in international format
   *     (with a leading plus, or with the international dialing prefix of the specified region).
   *     May be null or "ZZ" if only numbers with a leading plus should be
   *     considered.
   * @param leniency  the leniency to use when evaluating candidate phone numbers
   * @param maxTries  the maximum number of invalid numbers to try before giving up on the text.
   *     This is to cover degenerate cases where the text has a lot of false positives in it. Must
   *     be {@code >= 0}.
   */

  /** The iteration tristate. */
  function PhoneNumberMatcher() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var metadata = arguments[2];

    _classCallCheck(this, PhoneNumberMatcher);

    this.state = 'NOT_READY';
    this.searchIndex = 0;

    options = _extends({}, options, {
      defaultCountry: options.defaultCountry && (0, _metadata.isSupportedCountry)(options.defaultCountry, metadata) ? options.defaultCountry : undefined,
      leniency: options.leniency || options.extended ? 'POSSIBLE' : 'VALID',
      maxTries: options.maxTries || MAX_SAFE_INTEGER
    });

    if (!options.leniency) {
      throw new TypeError('`Leniency` not supplied');
    }

    if (options.maxTries < 0) {
      throw new TypeError('`maxTries` not supplied');
    }

    this.text = text;
    this.options = options;
    this.metadata = metadata;

    /** The degree of validation requested. */
    this.leniency = _Leniency2.default[options.leniency];

    if (!this.leniency) {
      throw new TypeError('Unknown leniency: ' + options.leniency + '.');
    }

    /** The maximum number of retries after matching an invalid number. */
    this.maxTries = options.maxTries;

    this.PATTERN = new RegExp(PATTERN, 'ig');
  }

  /**
   * Attempts to find the next subsequence in the searched sequence on or after {@code searchIndex}
   * that represents a phone number. Returns the next match, null if none was found.
   *
   * @param index  the search index to start searching at
   * @return  the phone number match found, null if none can be found
   */


  /** The next index to start searching at. Undefined in {@link State#DONE}. */


  _createClass(PhoneNumberMatcher, [{
    key: 'find',
    value: function find() // (index)
    {
      // // Reset the regular expression.
      // this.PATTERN.lastIndex = index

      var matches = void 0;
      while (this.maxTries > 0 && (matches = this.PATTERN.exec(this.text)) !== null) {
        var candidate = matches[0];
        var offset = matches.index;

        candidate = (0, _parsePreCandidate2.default)(candidate);

        if ((0, _isValidPreCandidate2.default)(candidate, offset, this.text)) {
          var match =
          // Try to come up with a valid match given the entire candidate.
          this.parseAndVerify(candidate, offset, this.text)
          // If that failed, try to find an "inner match" -
          // there might be a phone number within this candidate.
          || this.extractInnerMatch(candidate, offset, this.text);

          if (match) {
            if (this.options.v2) {
              var phoneNumber = new _PhoneNumber2.default(match.country, match.phone, this.metadata);
              if (match.ext) {
                phoneNumber.ext = match.ext;
              }
              return {
                startsAt: match.startsAt,
                endsAt: match.endsAt,
                number: phoneNumber
              };
            }
            return match;
          }
        }

        this.maxTries--;
      }
    }

    /**
     * Attempts to extract a match from `candidate`
     * if the whole candidate does not qualify as a match.
     */

  }, {
    key: 'extractInnerMatch',
    value: function extractInnerMatch(candidate, offset, text) {
      for (var _iterator = INNER_MATCHES, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var innerMatchPattern = _ref;

        var isFirstMatch = true;
        var matches = void 0;
        var possibleInnerMatch = new RegExp(innerMatchPattern, 'g');
        while ((matches = possibleInnerMatch.exec(candidate)) !== null && this.maxTries > 0) {
          if (isFirstMatch) {
            // We should handle any group before this one too.
            var _group = (0, _util.trimAfterFirstMatch)(UNWANTED_END_CHAR_PATTERN, candidate.slice(0, matches.index));

            var _match = this.parseAndVerify(_group, offset, text);
            if (_match) {
              return _match;
            }

            this.maxTries--;
            isFirstMatch = false;
          }

          var group = (0, _util.trimAfterFirstMatch)(UNWANTED_END_CHAR_PATTERN, matches[1]);

          // Java code does `groupMatcher.start(1)` here,
          // but there's no way in javascript to get a group match start index,
          // therefore using the overall match start index `matches.index`.
          var match = this.parseAndVerify(group, offset + matches.index, text);
          if (match) {
            return match;
          }

          this.maxTries--;
        }
      }
    }

    /**
     * Parses a phone number from the `candidate` using `parseNumber` and
     * verifies it matches the requested `leniency`. If parsing and verification succeed,
     * a corresponding `PhoneNumberMatch` is returned, otherwise this method returns `null`.
     *
     * @param candidate  the candidate match
     * @param offset  the offset of {@code candidate} within {@link #text}
     * @return  the parsed and validated phone number match, or null
     */

  }, {
    key: 'parseAndVerify',
    value: function parseAndVerify(candidate, offset, text) {
      if (!(0, _isValidCandidate2.default)(candidate, offset, text, this.options.leniency)) {
        return;
      }

      var number = (0, _parse_2.default)(candidate, {
        extended: true,
        defaultCountry: this.options.defaultCountry
      }, this.metadata);

      if (!number.possible) {
        return;
      }

      if (this.leniency(number, candidate, this.metadata)) {
        // // We used parseAndKeepRawInput to create this number,
        // // but for now we don't return the extra values parsed.
        // // TODO: stop clearing all values here and switch all users over
        // // to using rawInput() rather than the rawString() of PhoneNumberMatch.
        // number.clearCountryCodeSource()
        // number.clearRawInput()
        // number.clearPreferredDomesticCarrierCode()

        var result = {
          startsAt: offset,
          endsAt: offset + candidate.length,
          country: number.country,
          phone: number.phone
        };

        if (number.ext) {
          result.ext = number.ext;
        }

        return result;
      }
    }
  }, {
    key: 'hasNext',
    value: function hasNext() {
      if (this.state === 'NOT_READY') {
        this.lastMatch = this.find(); // (this.searchIndex)

        if (this.lastMatch) {
          // this.searchIndex = this.lastMatch.endsAt
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
      var result = this.lastMatch;
      this.lastMatch = null;
      this.state = 'NOT_READY';
      return result;
    }
  }]);

  return PhoneNumberMatcher;
}();

exports.default = PhoneNumberMatcher;
//# sourceMappingURL=PhoneNumberMatcher.js.map