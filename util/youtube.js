module.exports = {};

const google = require("googleapis");
const youtube = google.youtube('v3');
const urlParser = require('url');

const token = require("../config/token.js");

module.exports.getVideoSnippetFromId = function (id, callback) { // Returns snippet of data from video using video id (null if id is invalid)
  if (id.length != 11) callback(null); // Video ids are always 11 characters

  var params = {"part" : "snippet",
                "id" : id,
                "auth" : token.googleAPIToken};

  youtube.videos.list(params, function(err, response) {
    if (err) {
      callback(null);
    } else {
      if (response.items && response.items[0]) {
        callback(response.items[0].snippet);
      } else {
        callback(null);
      }
    }
  });
}

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
