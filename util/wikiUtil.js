module.exports = {};

const cheerio = require('cheerio');

module.exports.getFirstLink = (html, callback) => {
    const $ = cheerio.load(html); 

    //var firstLink = $("div.mw-parser-output").find('a:not(.reference *, .hatnote *, #coordinates *, table *, span *, .thumbinner *)').eq(0); // Excludes references
    
    var continueIteration = true;
    $("div.mw-parser-output").children("ul, p").each(function (index) {
        $(this).html(strip_brackets($(this).html()));

        $(this).find("a:not(span *)").each(function(index2) {
            var hasTitle = false;
            var nextUrl = '';
            console.log(index);
            console.log("test : " + this.attribs.href + " : " + this.attribs.title);
            if (this.attribs.href) {
                nextUrl = this.attribs.href;
            }

            if (this.attribs.title) {
                hasTitle = true;
            }
        
            if (!hasTitle) {
                return continueIteration;
            }

            continueIteration = false;
            callback(nextUrl.substring(6));

            return continueIteration;
        });

        return continueIteration;
    });
}

function strip_brackets(element) {
    var d = 0;
    var k = 0;
    var out = '';
 
    for (var i = 0; i < element.length; i++) {
        if (d < 1) {
            if (element[i] == '>') k -= 1;
            if (element[i] == '<') k += 1;
        }

        if (k < 1) {
            if (element[i] == '(') d += 1;

            if (d > 0) out += ' ';
            else out += element[i];

            if (element[i] == ')') d -= 1;
        } else {
            out += element[i];
        }
    }
}