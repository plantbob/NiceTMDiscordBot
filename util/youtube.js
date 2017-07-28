module.exports = {};

const token = require("../config/token.js");

const google = require("googleapis");
const youtube = google.youtube({
    version: 'v3',
    auth: token.googleAPIToken
});
const urlParser = require('url');


module.exports.getVideoDataFromId = function(id, part, callback) { // Returns piece of data from video using video id (null if id is invalid)

    if (id.length != 11) callback(null); // Video ids are always 11 characters

    var params = {
        "part": part,
        "id": id
    };

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
module.exports.getInfoFromUrl = function(url) { // Returns object containing the video id and playlist id from a youtube url
    var result = {};

    if (idRegex.test(url)) { // Check to see if it's an id
        result.id = url;
        return result;
    }

    var parsed = urlParser.parse(url, true); // Enable query parsing

    if (parsed.hostname == 'youtu.be') { // Different hostnames store the video id in different places
        result.id = parsed.pathname.substr(1); // Use substr to remove the / at the beginning

    } else if (parsed.hostname == 'youtube.com' ||
        parsed.hostname == 'www.youtube.com') { // If its a regular youtube link
        if (parsed.pathname == "/watch") { // If its a video link
          result.id = parsed.query.v;
          result.list = parsed.query.list;
        } else if (parsed.pathname == "/playlist") {
          result.list = parsed.query.list; // Return playlist id
        }
    }

    if (!idRegex.test(result.id)) { // If id is invalid
      result.id = undefined;
    }

    return result;
};

module.exports.getDataFromSearchQuery = function(query, part, type, callback) { // Gets the first two videos, will return the second if the first is a livestream (Note: Part needs to include snippet)
    var params = {
        "part": part,
        "maxResults": 2, // Get two incase the first one is a livestream
        "q": query,
        "type": type
    };

    youtube.search.list(params, function(err, response) {
        if (err) {
          callback(null);
        } else {
            if (type == "video") {
                if (response.items && response.items[0]) {
                    if (response.items[0].snippet.liveBroadcastContent == "none") { // First option is a video
                        callback(response.items[0]);
                    } else if (response.items[1].snippet.liveBroadcastContent == "none") { // First option isn't a video and second option is
                        callback(response.items[1]);
                    } else { // Both options aren't videos
                        callback(null);
                    }
                } else {
                    callback(null)
                }
            } else if (type == "playlist") {
              if (response.items && response.items[0]) {
                callback(response.items[0])
              } else {
                callback(null);
              }
            }
        }
    });
};

module.exports.getVideoIdsFromPlaylist = function(id, callback) {
  var videoIdList = [];

  var params = {
    "part" : "contentDetails",
    "maxResults" : 50,
    "playlistId" : id
  }

  youtube.playlistItems.list(params, onReturn);

  function onReturn(err, response) {
    if (err) {
      callback(null);
    } else {
      for (var i = 0; i < response.items.length; i++) {
        videoIdList.push(response.items[i].contentDetails.videoId);
      }

      if (response.nextPageToken) {
        var params = {
          "part" : "contentDetails",
          "maxResults" : 50,
          "playlistId" : id,
          "pageToken" : response.nextPageToken
        }

        youtube.playlistItems.list(params, onReturn);
      } else {
        callback(videoIdList);
      }
    }
  }
}

module.exports.getVideoDataFromIdList = function(list, part, callback) {
  var videoDataList = [];
  var i = 0;

  module.exports.getVideoDataFromId(list[i], part, onData);

  function onData(data) {
    if (!data) {

    } else {
      videoDataList.push(data);
    }

    i++;
    if (i == list.length) {
      callback(videoDataList);
    } else {
      module.exports.getVideoDataFromId(list[i], part, onData);
    }
  }
}
