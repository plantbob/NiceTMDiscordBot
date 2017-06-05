module.exports = {};

const request = require('request');
const nodecache = require('node-cache');
const cache = new nodecache();

const logUtil = require('./logging.js');

module.exports.getRandomUrl = function(subreddit, callback) { // TODO: Add limit to how many listings can be cached
  if (subreddit.indexOf('?') != -1) {
    callback(null);
    return;
  }

  var listing = cache.get(subreddit); // See if listing is cached in memory
  if (listing != undefined) {
    if (listing.data != null) {
      var children = listing.data.children; // Get list
      var post = children[getRandomInt(1, children.length)];
      if (post && post.kind && post.kind == "t3") { // Make sure post is a link
        var postdata = post.data;
        callback(postdata.url);
        return;
      }
    }
  }

  request("https://www.reddit.com/r/" + subreddit + "/hot/.json?limit=250", function(error, response, body) {
    try {
      var listing = JSON.parse(body);
    } catch (exception) {
      logUtil.log("Invalid JSON data recieved from Reddit.", logUtil.STATUS_WARNING);
      callback(null);
      return;
    }

    cache.set(subreddit, listing, 3600); // Listing expires after one hour

    if (listing.data != null) {
      var children = listing.data.children; // Get list
      var post = children[getRandomInt(1, children.length)];
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
