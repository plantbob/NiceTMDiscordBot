module.exports = {};

module.exports.STATUS_INFO = 0;
module.exports.STATUS_WARNING = 1;
module.exports.STATUS_ERROR = 2;
module.exports.STATUS_NOTIFICATION = 3;

module.exports.log = function(message, status) {
  switch(status) {
    case module.exports.STATUS_INFO:
      console.log("\x1b[0m"); // Reset
    break;
    case module.exports.STATUS_WARNING:
     console.log("\x1b[33m"); // Foreground Yellow
    break;
    case module.exports.STATUS_ERROR:
      console.log("\x1b[31m"); // Foreground Red
    break;
    case module.exports.STATUS_NOTIFICATION:
      console.log("\x1b[36m"); // Foreground Cyan
    break;
  }
  console.log("[ " + new Date().toString() + " ] - " + message);
  console.log("\x1b[0m"); // Reset
}
