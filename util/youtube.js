module.exports = {};

const token = require("../config/token.js");

const google = require("googleapis");
const youtube = google.youtube({version : 'v3', auth : token.googleAPIToken});
const urlParser = require('url');


module.exports.getVideoDataFromId = function (id, part, callback) { // Returns piece of data from video using video id (null if id is invalid)

  if (id.length != 11) callback(null); // Video ids are always 11 characters

  var params = {"part" : part,
                "id" : id};

  youtube.videos.list(params, function(err, response) {
    if (err) {
      callback(null);
    } else {
      if (response.items && response.items[0]) {
        callback(response.items[0]);
      } else {
        callback(null);
      }
    }
  });
};

const idRegex = /^[a-zA-Z0-9-_]{11}$/;
module.exports.getIdFromUrl = function(url) { // Gets id from youtube url, returns null if error finding id
  if (idRegex.test(url)) { // Check to see if it's an id
    return url;
  }

  var parsed = urlParser.parse(url, true); // Enable query parsing

  var id;
  if (parsed.hostname == 'youtu.be') { // Different hostnames store the video id in different places
    id = parsed.path.substr(1); // Use substr to remove the / at the beginning

  } else if (parsed.hostname == 'youtube.com' ||
             parsed.hostname == 'www.youtube.com') {
    id = parsed.query.v;
  }

  if (!id) { // If no id was found
    return null;
  }
  if (!idRegex.test(id)) { // If id is invalid
    return null;
  }

  return id;
};

module.exports.getVideoDataFromSearchQuery = function (query, part, callback) { // Gets the first two videos, will return the second if the first is a livestream (Note: Part needs to include snippet)
  var params = {"part" : part,
                "maxResults" : 2, // Get two incase the first one is a livestream
                "q" : query,
                "type" : "video"};

  youtube.search.list(params, function(err, response) {
    if (err) {
      console.log("test");
      callback(null);
    } else {
      if (response.items && response.items[0]) {
        if (response.items[0].snippet.liveBroadcastContent == "none") { // First option is a video
          callback(response.items[0]);
        } else if (response.items[1].snippet.liveBroadcastContent == "none") { // First option isn't a video and second option is
          callback(response.items[1]);
        } else { // Both options aren't videos
        console.log("test2");
          callback(null);
        }
      } else {
        console.log("test3");
        callback(null)
      }
    }
  });
};
