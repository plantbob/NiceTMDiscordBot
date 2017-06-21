module.exports = {};

const stream = require('stream');

module.exports.STATUS_INFO = 0;
module.exports.STATUS_WARNING = 1;
module.exports.STATUS_ERROR = 2;
module.exports.STATUS_NOTIFICATION = 3;

module.exports.log = function(message, status) {
  var prefix = "\x1b[0m";
  switch(status) {
    case module.exports.STATUS_INFO:
      prefix = "\x1b[0m"; // Reset
    break;
    case module.exports.STATUS_WARNING:
     prefix = "\x1b[33m"; // Foreground Yellow
    break;
    case module.exports.STATUS_ERROR:
      prefix = "\x1b[31m"; // Foreground Red
    break;
    case module.exports.STATUS_NOTIFICATION:
      prefix = "\x1b[36m"; // Foreground Cyan
    break;
  }
  console.log(prefix + "[ " + new Date().toString() + " ] - " + message + "\x1b[0m");
}

module.exports.logStream = function() { // Returns Writable stream that can be used to log data
  var logStream = new stream.Writable();
  logStream._write = function (chunk, encoding, data) {
    console.log("Log data: " + chunk.toString());
    done(chunk);
  }

  return logStream;
}
