const Jimp = require('jimp');

const fs = require('fs');
const path = require('path');

let isWin = /^win/.test(process.platform);

let normalizedPath = path.join(__dirname, "assets/emojis");

fs.readdirSync(normalizedPath).forEach(function(file) {
  if (file.endsWith(".png")) { // So it doesn't load folders
    console.log("Loading /assets/emojis/" + file);

    Jimp.read(convertPathIfWindows("assets/emojis/" + file)).then(function(image) {
        image.autocrop();
        //addBlackBG(image);
        image.resize(50, Jimp.AUTO);
        image.write(convertPathIfWindows("assets/smallemojis/" + file));
        console.log("Saved /assets/emojis/" + file);
    }).catch(console.error);
  }
});

function addBlackBG(image) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        //console.log(this.bitmap.data.readUInt32BE(idx, true));
        if (this.bitmap.data.readUInt32BE(idx, true) == 0x00000000) {
            this.bitmap.data.writeUInt32BE(0x000000FF, idx, true);
        }
    });
}

function convertPathIfWindows(path) {
    if (isWin) return path.replace(/\//g, "\\");
    else return path;
}

function getGlobalPath(localpath) {
    return convertPathIfWindows(path.normalize(__dirname + "/") + localpath);
}
