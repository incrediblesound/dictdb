var minimist = require('minimist');
var db = require('level')('/tmp/dict.db');
var ddb = require('../')(db);
var argv = minimist(process.argv.slice(2));

var words = argv._.slice();
(function next () {
    if (words.length === 0) return console.log();
    var word = words.shift();
    var q = { word: word, from: argv.from, to: argv.to };
    ddb.get(q, function (err, results) {
        if (err) return console.error(err);
        var w = results[0] ? results[0].word : '???';
        process.stdout.write(w);
        next();
    });
})();
