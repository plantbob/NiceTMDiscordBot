module.exports = {};

const request = require('request');
const nodecache = require('node-cache');
const cache = new nodecache();

module.exports.getRandomUrl = function(subreddit, nsfw, callback) { // TODO: Add limit to how many listings can be cached
  if (subreddit.indexOf('?') != -1) {
    callback(null);
    return;
  }

  if (!nsfw) { // If the request is for sfw subreddits
    console.log("test1");
    module.exports.getAboutData(subreddit, function(data) {
        console.log("Memery: " + data.over18);
        if (data.over18) { // If its a nsfw subreddit
          console.log("test4");
          callback(null); // Subreddit is nsfw and the user requested sfw so return null
        } else {
          console.log("test3");
          getSubredditListingHelper(subreddit, nsfw, callback);
        }
    });
  } else { // If the request ignores nsfw
    console.log("test2");
    getSubredditListingHelper(subreddit, nsfw, callback);
  };
};

function getSubredditListingHelper(subreddit, nsfw, callback) {
  var listing = cache.get(subreddit + nsfwStringHelper(nsfw)); // See if listing is cached in memory
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




    if (listing.data != null) {

      var children = listing.data.children; // Get list

      if (!nsfw) { // Remove all nsfw posts if requested
        for (var i = 0; i < children.length; i++) {
          if (children[i].over_18) {
            children.splice(i, 1); // Remove element
          }
        }
      }

      cache.set(subreddit + nsfwStringHelper(nsfw), listing, 3600); // Listing expires after one hour

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

function nsfwStringHelper(nsfw) {
  if (nsfw) {
    return "_nsfw";
  } else {
    return "_sfw";
  }
}

module.exports.getAboutData = function(subreddit, callback) {
  if (subreddit.indexOf('?') != -1) {
    callback(null);
    return;
  }

  request(`https://www.reddit.com/r/${subreddit}/about.json`, function(error, response, body) {
    try {
      var about = JSON.parse(body);
    } catch (exception) {
      callback(null);
      return;
    }

    if (about.data != null) {
      callback(about.data);
      return;
    }

    callback(null);
  });
}
