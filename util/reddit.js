module.exports = {};

var request = require('request');

module.exports.getRandomUrl = function(subreddit, callback) {
  if (subreddit.indexOf('?') != -1) {
    callback(null);
    return;
  }
  request("https://www.reddit.com/r/" + subreddit + "/hot/.json", function(error, response, body) {
    var listing = JSON.parse(body);
    if (listing.data != null) {
      var children = listing.data.children; // Get list
      var post = children[getRandomInt(1, 25)];
      if (post && post.kind && post.kind == "t3") { // Make sure post is a link
        var postdata = post.data;
        callback(postdata.url);
        return;
      }
    }
    callback(null);
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
