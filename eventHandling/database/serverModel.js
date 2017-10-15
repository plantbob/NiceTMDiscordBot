var mongoose = require('mongoose');
var nodecache = require('node-cache');

var logUtil = require('../../util/logging.js');

var serverSchema = mongoose.Schema({
    _id: String, // fuck it
    prefix: String,
    newMemberMessage: String
});

serverSchema.statics.updateWithIdFromNodeCache = function(id, cache) {
    this.findByIdAndUpdate(id, {
        prefix: cache.get('prefix'), 
        newMemberMessage: cache.get('newMemberMessage'),
        _id: id
    }, {
        upsert: true // Makes it so it will created a new document if this one doesn't exist
    }, (err, server) => {
        if (err) {
            logUtil.log('Error updating server with id ' + id + ':', logUtil.STATUS_ERROR);
            console.log(err);
        }
    });
};

serverSchema.methods.getFilledNodeCache = function() {
    var newCache = new nodecache();
    newCache.set("prefix", this.prefix);
    newCache.set("newMemberMessage", this.newMemberMessage);
    return newCache;
}

module.exports = mongoose.model("DiscordServer", serverSchema);