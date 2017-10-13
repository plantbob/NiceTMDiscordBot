var mongoose = require('mongoose');

var serverSchema = mongoose.Schema({
    id: Number,
    prefix: String,
    newMemberMessage: String
});

module.exports = mongoose.model("DiscordServer", serverSchema);