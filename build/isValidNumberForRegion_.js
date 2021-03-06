'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isValidNumberForRegion;

var _validate_ = require('./validate_');

var _validate_2 = _interopRequireDefault(_validate_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if a given phone number is valid within a given region.
 * Is just an alias for `phoneNumber.isValid() && phoneNumber.country === country`.
 * https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion
 */
function isValidNumberForRegion(input, country) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var metadata = arguments[3];

  return input.country === country && (0, _validate_2.default)(input, options, metadata);
}
//# sourceMappingURL=isValidNumberForRegion_.js.map