var sublevel = require('level-sublevel/bytewise');
var bytewise = require('bytewise');
var through = require('through2');

module.exports = Translate;

function Translate (db) {
    if (!(this instanceof db)) return new Translate(db);
    this.db = sublevel(db, {
        keyEncoding: bytewise,
        valueEncoding: 'json'
    });
}

Translate.prototype.get = function (opts, cb) {
    if (typeof opts === 'string') {
        opts = { word: opts };
    }
    var s = this.db.createReadStream({
        gt: [ 'link', opts.from, word, opts.to ],
        lt: [ 'link', opts.from, word, opts.to ]
    });
    var r = through.obj(function (row, enc, next) {
        this.push({ lang: row.key[3], word: row.key[4] });
        next();
    }));
    if (cb) {
        r.pipe(collect(cb));
        s.on('error', cb);
    }
    return s.pipe(r);
};

Translate.prototype.link = function (a, b) {
    this.db.batch([
        { key: [ 'link', a.lang, a.word, b.lang, b.word ], value: 0 },
        { key: [ 'link', b.lang, b.word, a.lang, a.word ], value: 0 },
        { key: [ 'word', a.word, a.lang ], value: 0 },
        { key: [ 'word', b.word, b.lang ], value: 0 }
    ]);
};

function collect (cb) {
    var rows = [];
    return through.obj(write, end);
    function write (row, enc, next) { rows.push(row); next() }
    function end () { cb(null, rows);
}
