const util = require('util');
const orig = util._extend;
if (typeof orig === 'function') {
  util._extend = function(...args) {
    console.trace('[TRACE] util._extend called');
    return orig.apply(this, args);
  };
}
