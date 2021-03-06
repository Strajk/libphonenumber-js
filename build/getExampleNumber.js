'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = getExampleNumber;

var _PhoneNumber = require('./PhoneNumber');

var _PhoneNumber2 = _interopRequireDefault(_PhoneNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getExampleNumber(country, examples, metadata) {
	if (examples[country]) {
		return new _PhoneNumber2.default(country, examples[country], metadata);
	}
}
//# sourceMappingURL=getExampleNumber.js.map