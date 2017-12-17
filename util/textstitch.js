var Jimp = require("jimp");

var logUtil = require('./logging.js');
var dictmapping = require("./dictmapping.js");

const letterSpacing = 2;
const softLineLimit = 850 
const hardLineLimit = 1200 
const lineLimit = 5;
const endsPadding = 10;

const padding = 10;

const triangleWidth = 40;

module.exports.stichText = (letterPaths, softNewLinePoints, hardNewLinePoints) => {
    let letterPromises = letterPaths.map((path) => Jimp.read(path))

    //console.log(letterPaths);
    return new Promise(function(resolve, reject) {
      
      Promise.all(letterPromises).then((letterImages) => {
        // for (let i in letterImages) {
        //   if (letterPaths[i].includes('http')) { // It's a custom emoji
        //     letterImages[i].autocrop();
        //   }
        // }

        let totalWidth = letterImages.map((l) => l.bitmap.width).reduce((a, b) => a + b, 0);
        let maxHeight = Math.max(...letterImages.map((l) => l.bitmap.height));
        let totalSpacing = letterSpacing * letterImages.length;

        let newImage = new Jimp(totalWidth + totalSpacing, maxHeight, 0x00000000);
        let xOffset = 0, yOffset = 0;
        let currLine = 1;
        let maxLineWidth = 0;
        //console.log(softNewLinePoints);
        for (let i in letterImages) {
          newImage.composite(letterImages[i], xOffset, yOffset);
          xOffset += letterImages[i].bitmap.width + letterSpacing;

          if ((hardNewLinePoints.includes(i)) || ((softNewLinePoints.includes(i)) && (xOffset >= softLineLimit)) || (xOffset >= hardLineLimit)) {
            if (currLine > lineLimit) {
              reject("Too many Lines");
            }
            
            // Make new line
            if (xOffset > maxLineWidth)
            maxLineWidth = xOffset;

            yOffset += maxHeight;
            newImage = new Jimp(totalWidth + totalSpacing, yOffset + maxHeight, 0x00000000).composite(newImage, 0, 0);

            xOffset = 0;
            currLine++;
          }
        }

        if (xOffset > maxLineWidth)
        maxLineWidth = xOffset;

        newImage = new Jimp(maxLineWidth + endsPadding + endsPadding, yOffset + maxHeight).composite(newImage, endsPadding, 0);
        resolve(newImage);
    }).catch((err) => {
      logUtil.log("Error stitching text together.", logUtil.STATUS_ERROR);

      console.log(err);
      reject("Error stitching text together.")
    });
  }); 
}

module.exports.addSpeechBubble = (image, headPath, wide = false, discordBackground = false, animationIteration = -1) => {
  let mouthposition = dictmapping.getMouthHeight(headPath) || 20;

  image = addSpeechBorders(image, animationIteration);
  image = new Jimp(image.bitmap.width + triangleWidth, image.bitmap.height, 0).composite(image, triangleWidth, 0);

  drawTriangle(image, 0, image.bitmap.height - mouthposition, 20 + triangleWidth, image.bitmap.height - 15, 20 + triangleWidth, image.bitmap.height - 65, 0x000000FF)
  
  return new Promise(function(resolve, reject) {
    Jimp.read(headPath).then((headImage) => {
      //headImage.autocrop();
      if (wide) {
        headImage.resize(headImage.bitmap.width * 2, headImage.bitmap.height);
      }

      //let final = new Jimp(headImage.bitmap.width + image.bitmap.width, Math.max(image.bitmap.height, headImage.bitmap.height), 0x36393EFF);
      //let final = new Jimp(headImage.bitmap.width + image.bitmap.width, Math.max(image.bitmap.height, headImage.bitmap.height), 0x00000000);
      let final;

      if (discordBackground) {
        final = new Jimp(headImage.bitmap.width + image.bitmap.width, Math.max(image.bitmap.height, headImage.bitmap.height), 0x36393EFF);
      } else {
        final = new Jimp(headImage.bitmap.width + image.bitmap.width, Math.max(image.bitmap.height, headImage.bitmap.height), 0x00000000);
      }
      
      final.composite(headImage, 0, final.bitmap.height - headImage.bitmap.height);
      final.composite(image, headImage.bitmap.width, final.bitmap.height - image.bitmap.height);


      resolve(final);
    }).catch((err) => {
      logUtil.log("Error getting head image.", logUtil.STATUS_ERROR);

      console.log(err);
      reject("Error getting head image.")
    });
  });
}

function replaceColorWithColor(a, b, image) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    if (this.bitmap.data.readUInt32BE(idx) == a) {
      this.bitmap.data.writeUInt32BE(b, idx, true);
    }
  });
}

function drawTriangle(image, x0, y0, x1, y1, x2, y2, color) {
  let minX = Math.min(x0, x1, x2);
  let maxX = Math.max(x0, x1, x2);
  let minY = Math.min(y0, y1, y2);
  let maxY = Math.max(y0, y1, y2);

  image.scan(minX, minY, maxX - minX, maxY - minY, function(x, y, idx) {
    if (pointInTriangle(x0, y0, x1, y1, x2, y2, x, y)) {
      this.bitmap.data.writeUInt32BE(color, idx, true);
    }
  });
}

function sign(x0, y0, x1, y1, x2, y2) {
    return (x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2);
}

function pointInTriangle(x0, y0, x1, y1, x2, y2, xp, yp) {
    let b1, b2, b3;

    b1 = sign(xp, yp, x0, y0, x1, y1) < 0;
    b2 = sign(xp, yp, x1, y1, x2, y2) < 0;
    b3 = sign(xp, yp, x2, y2, x0, y0) < 0;

    return ((b1 == b2) && (b2 == b3));
}

function addSpeechBorders(image, animationIteration) {
    let background = new Jimp(image.bitmap.width + padding + padding, image.bitmap.height + padding + padding, 0x000000FF);
    background.composite(image, padding, padding);
    let background2 = new Jimp(background.bitmap.width + padding + padding, background.bitmap.height + padding + padding, 0x00000000);
    background2.composite(background, padding, padding);
    
    drawChord(background2, padding, padding, padding + background.bitmap.width, padding, 0, 5, 0x000000FF, animationIteration);
    drawChord(background2, padding, padding + background.bitmap.height - 1, padding + background.bitmap.width, padding + background.bitmap.height - 1, 2, 5, 0x000000FF, animationIteration);
  
    drawChord(background2, padding, padding, padding, padding + background.bitmap.height, 1, 10, 0x000000FF, animationIteration);
    drawChord(background2, padding + background.bitmap.width - 1, padding, padding + background.bitmap.width - 1, padding + background.bitmap.height, 3, 10, 0x000000FF, animationIteration);

    return background2;
}

let sineAmplitude = 2;
let sinePeriod = 100;

// dir = 0, up
// dir = 3, right
// dir = 2, down
// dir = 1, left
function drawChord(image, x0, y0, x1, y1, dir, height, color, animationIteration) {
    let circlex, radius, circley;

    switch (dir) {
      case 0:
        circlex = (x0 + x1) / 2;
        radius = getRadiusFromChord(Math.abs(x0 - x1), height);
        circley = y0 + radius - height;
  
        image.scan(x0, y0 - height, (x1 - x0), height, function(x, y, idx) {
          let offset = 0;
          if (animationIteration != -1) {
            offset = sineAmplitude * Math.sin(x / sinePeriod + animationIteration)
          }

          if (getDistance(x, y, circlex, circley) < radius + offset) {
            this.bitmap.data.writeUInt32BE(color, idx, true);
          }
        });
        break;
      case 1:
        circley = (y0 + y1) / 2;
        radius = getRadiusFromChord(Math.abs(y0 - y1), height);
        circlex = x0 + radius - height;
  
        image.scan(x0 - height, y0, height, (y1 - y0), function(x, y, idx) {
          let offset = 0;
          if (animationIteration != -1) {
            offset = sineAmplitude * Math.sin(y / sinePeriod + animationIteration)
          }

          if (getDistance(x, y, circlex, circley) < radius + offset) {
            this.bitmap.data.writeUInt32BE(color, idx, true);
          }
        });
        break;
      case 2:
        circlex = (x0 + x1) / 2;
        radius = getRadiusFromChord(Math.abs(x0 - x1), height);
        circley = y0 - radius + height;
  
        image.scan(x0, y0, (x1 - x0), height, function(x, y, idx) {
          let offset = 0;
          if (animationIteration != -1) {
            offset = sineAmplitude * Math.sin(x / sinePeriod + animationIteration)
          }

          if (getDistance(x, y, circlex, circley) < radius + offset) {
            this.bitmap.data.writeUInt32BE(color, idx, true);
          }
        });
        break;
      case 3:
        circley = (y0 + y1) / 2;
        radius = getRadiusFromChord(Math.abs(y0 - y1), height);
        circlex = x0 - radius + height;
  
        image.scan(x0, y0, height, (y1 - y0), function(x, y, idx) {
          let offset = 0;
          if (animationIteration != -1) {
            offset = sineAmplitude * Math.sin(y / sinePeriod + animationIteration)
          }

          if (getDistance(x, y, circlex, circley) < radius + offset) {
            this.bitmap.data.writeUInt32BE(color, idx, true);
          }
        });
        break;
    }
  }
  
  // https://www.desmos.com/calculator/7ynjqiusfb
  function getRadiusFromChord(width, height) {
    let circlex = width / 2;
    let radius = circlex / height * circlex / 2 + height / 2;
    return radius;
  }
  
  function getDistance(x0, y0, x1, y1) {
    let dx = x0 - x1;
    let dy = y0 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }