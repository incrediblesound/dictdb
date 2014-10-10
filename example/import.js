var parse = require('parse-dictd');
var through = require('through2');
var fs = require('fs');
var gunzip = require('zlib').createGunzip;
var minimist = require('minimist');

var db = require('level')('/tmp/dict.db');
var ddb = require('../')(db);

var argv = minimist(process.argv.slice(2));

var dstream = fs.createReadStream(argv._[0]).pipe(gunzip());
var istream = fs.createReadStream(argv._[1]);

parse(dstream, istream).pipe(through.obj(function (row, enc, next) {
    var a = { word: fix(row.from), lang: argv.from };
    var b = { word: row.to.map(fix), lang: argv.to };
    ddb.link(a, b);
    next();
}));

function fix (w) { return w.replace(/^\w+\.\s+|;$/g,'') }
