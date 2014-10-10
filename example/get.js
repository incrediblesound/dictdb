var minimist = require('minimist');
var db = require('level')('/tmp/dict.db');
var ddb = require('../')(db);
var argv = minimist(process.argv.slice(2));

var q = {
    word: argv._.join(' '),
    from: argv.from,
    to: argv.to
};
ddb.get(q, function (err, results) {
    if (err) return console.error(err);
    results.forEach(function (r) {
        console.log(r.word);
    });
});
