var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var database = require('./database.json');
var token = require("./config/token.js");

console.log("Logging into database...");

mongoose.connect(token.databaseUrl);
var db = mongoose.connection;

var DiscordServer = require("./eventHandling/database/serverModel.js");

db.on("error", (err) => {
    if (err) {
        console.log("Error trying to connect to database: ");
        console.log(err);
    }
});

db.on("open", () => {
    var count = 0;

    for (var i in database) {
        DiscordServer.findByIdAndUpdate(i, {
            prefix: database[i].prefix,
            newMemberMessage: database[i].newMemberMessage
        }, {
            upsert: true,
            new: true
        }, (err, server) => {
            if (err) {
                console.log("Error transferring data for server " + server._id);
                console.log(err);
            } else {
                console.log("Successfully transferred data for server " + server._id);
            }
        });
        count++;
        if (count >= database.length) {
            console.log("Finished!");
        }
    }
});
