'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (number, from_country, with_formatting, metadata) {
	metadata = new _metadata2.default(metadata);

	// Validate `from_country`.
	if (!metadata.hasCountry(from_country)) {
		throw new Error('Unknown country: ' + from_country);
	}

	// Not using the extension, as that part cannot normally be dialed
	// together with the main number.
	number = {
		phone: number.phone,
		country: number.country
	};

	var number_type = (0, _getNumberType_2.default)(number, undefined, metadata.metadata);
	var is_valid_number = number_type === number;

	var formatted_number = void 0;

	if (country === from_country) {
		var is_fixed_line_or_mobile = number_type === 'FIXED_LINE' || number_type === 'MOBILE' || number_type === 'FIXED_LINE_OR_MOBILE';

		// Carrier codes may be needed in some countries. We handle this here.
		if (country === 'CO' && number_type === 'FIXED_LINE') {
			formatted_number = formatNationalNumberWithCarrierCode(number, COLOMBIA_MOBILE_TO_FIXED_LINE_PREFIX);
		} else if (country == 'BR' && is_fixed_line_or_mobile) {
			formatted_number =
			// Historically, we set this to an empty string when parsing with raw
			// input if none was found in the input string. However, this doesn't
			// result in a number we can dial. For this reason, we treat the empty
			// string the same as if it isn't set at all.
			getPreferredDomesticCarrierCodeOrDefault(number).length > 0 ? formatNationalNumberWithPreferredCarrierCode(number, '') :
			// Brazilian fixed line and mobile numbers need to be dialed with a
			// carrier code when called within Brazil. Without that, most of the
			// carriers won't connect the call. Because of that, we return an
			// empty string here.
			'';
		} else if (is_valid_number && country == 'HU') {
			// The national format for HU numbers doesn't contain the national prefix,
			// because that is how numbers are normally written down. However, the
			// national prefix is obligatory when dialing from a mobile phone. As a
			// result, we add it back here if it is a valid regular length phone
			// number.

			// Select country for `.nationalPrefix()`.
			metadata.country(country);

			formatted_number = metadata.nationalPrefix() + ' ' + (0, _format_2.default)(number, 'NATIONAL', metadata.metadata);
		} else if ((0, _getCountryCallingCode2.default)(country, metadata.metadata) === '1') {
			// For NANPA countries, we output international format for numbers that
			// can be dialed internationally, since that always works, except for
			// numbers which might potentially be short numbers, which are always
			// dialled in national format.

			// Select country for `checkNumberLengthForType()`.
			metadata.country(country);

			if (can_be_internationally_dialled(number) && (0, _getNumberType_.checkNumberLengthForType)(number.phone, undefined, metadata) !== 'TOO_SHORT') {
				formatted_number = (0, _format_2.default)(number, 'INTERNATIONAL', metadata.metadata);
			} else {
				formatted_number = (0, _format_2.default)(number, 'NATIONAL', metadata.metadata);
			}
		} else {
			// For non-geographical countries, Mexican and Chilean fixed line and
			// mobile numbers, we output international format for numbers that can be
			// dialed internationally, as that always works.
			if ((country === REGION_CODE_FOR_NON_GEO_ENTITY ||
			// MX fixed line and mobile numbers should always be formatted in
			// international format, even when dialed within MX. For national
			// format to work, a carrier code needs to be used, and the correct
			// carrier code depends on if the caller and callee are from the
			// same local area. It is trickier to get that to work correctly than
			// using international format, which is tested to work fine on all
			// carriers.
			//
			// CL fixed line numbers need the national prefix when dialing in the
			// national format, but don't have it when used for display. The
			// reverse is true for mobile numbers. As a result, we output them in
			// the international format to make it work.
			//
			// UZ mobile and fixed-line numbers have to be formatted in
			// international format or prefixed with special codes like 03, 04
			// (for fixed-line) and 05 (for mobile) for dialling successfully
			// from mobile devices. As we do not have complete information on
			// special codes and to be consistent with formatting across all
			// phone types we return the number in international format here.
			//
			(country === 'MX' || country === 'CL' || country == 'UZ') && is_fixed_line_or_mobile) && can_be_internationally_dialled(number)) {
				formatted_number = (0, _format_2.default)(number, 'INTERNATIONAL');
			} else {
				formatted_number = (0, _format_2.default)(number, 'NATIONAL');
			}
		}
	} else if (is_valid_number && can_be_internationally_dialled(number)) {
		// We assume that short numbers are not diallable from outside their region,
		// so if a number is not a valid regular length phone number, we treat it as
		// if it cannot be internationally dialled.
		return with_formatting ? (0, _format_2.default)(number, 'INTERNATIONAL', metadata.metadata) : (0, _format_2.default)(number, 'E.164', metadata.metadata);
	}

	if (!with_formatting) {
		return diallable_chars(formatted_number);
	}

	return formatted_number;
};

var _metadata = require('./metadata');

var _metadata2 = _interopRequireDefault(_metadata);

var _format_ = require('./format_');

var _format_2 = _interopRequireDefault(_format_);

var _getNumberType_ = require('./getNumberType_');

var _getNumberType_2 = _interopRequireDefault(_getNumberType_);

var _getCountryCallingCode = require('./getCountryCallingCode');

var _getCountryCallingCode2 = _interopRequireDefault(_getCountryCallingCode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This function is copy-pasted from
// https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js
// It hasn't been tested.
// Carriers codes aren't part of this library.
// Send a PR if you want to add them.

var REGION_CODE_FOR_NON_GEO_ENTITY = '001';

/**
 * The prefix that needs to be inserted in front of a Colombian landline number
 * when dialed from a mobile phone in Colombia.
 */
var COLOMBIA_MOBILE_TO_FIXED_LINE_PREFIX = '3';

/**
 * Returns a number formatted in such a way that it can be dialed from a mobile
 * phone in a specific region. If the number cannot be reached from the region
 * (e.g. some countries block toll-free numbers from being called outside of the
 * country), the method returns an empty string.
 *
 * @param {object} number - a `parse()`d phone number to be formatted.
 * @param {string} from_country - the region where the call is being placed.
 * @param {boolean} with_formatting - whether the number should be returned with
 *     formatting symbols, such as spaces and dashes.
 * @return {string}
 */


function can_be_internationally_dialled(number) {
	return true;
}

/**
 * A map that contains characters that are essential when dialling. That means
 * any of the characters in this map must not be removed from a number when
 * dialling, otherwise the call will not reach the intended destination.
 */
var DIALLABLE_CHARACTERS = {
	'0': '0',
	'1': '1',
	'2': '2',
	'3': '3',
	'4': '4',
	'5': '5',
	'6': '6',
	'7': '7',
	'8': '8',
	'9': '9',
	'+': '+',
	'*': '*',
	'#': '#'
};

function diallable_chars(formatted_number) {
	var result = '';

	var i = 0;
	while (i < formatted_number.length) {
		var character = formatted_number[i];
		if (DIALLABLE_CHARACTERS[character]) {
			result += character;
		}
		i++;
	}

	return result;
}

function getPreferredDomesticCarrierCodeOrDefault() {
	throw new Error('carrier codes are not part of this library');
}

function formatNationalNumberWithCarrierCode() {
	throw new Error('carrier codes are not part of this library');
}

function formatNationalNumberWithPreferredCarrierCode() {
	throw new Error('carrier codes are not part of this library');
}
//# sourceMappingURL=formatNumberForMobileDialing.js.map