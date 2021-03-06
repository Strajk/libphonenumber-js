'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = findPhoneNumbers;
exports.searchPhoneNumbers = searchPhoneNumbers;

var _findPhoneNumbers_ = require('./findPhoneNumbers_');

var _findPhoneNumbers_2 = _interopRequireDefault(_findPhoneNumbers_);

var _parsePhoneNumber = require('./parsePhoneNumber');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is a legacy function.
// Use `findNumbers()` instead.

function findPhoneNumbers() {
	var _normalizeArguments = (0, _parsePhoneNumber.normalizeArguments)(arguments),
	    text = _normalizeArguments.text,
	    options = _normalizeArguments.options,
	    metadata = _normalizeArguments.metadata;

	return (0, _findPhoneNumbers_2.default)(text, options, metadata);
}

/**
 * @return ES6 `for ... of` iterator.
 */
function searchPhoneNumbers() {
	var _normalizeArguments2 = (0, _parsePhoneNumber.normalizeArguments)(arguments),
	    text = _normalizeArguments2.text,
	    options = _normalizeArguments2.options,
	    metadata = _normalizeArguments2.metadata;

	return (0, _findPhoneNumbers_.searchPhoneNumbers)(text, options, metadata);
}
//# sourceMappingURL=findPhoneNumbers.js.map