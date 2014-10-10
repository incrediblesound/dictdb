var sublevel = require('level-sublevel/bytewise');
var bytewise = require('bytewise');
var through = require('through2');
var isarray = require('isarray');

module.exports = Translate;

function Translate (db) {
    if (!(this instanceof Translate)) return new Translate(db);
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
        gt: [ 'link', opts.from, opts.word, opts.to, null ],
        lt: [ 'link', opts.from, opts.word, opts.to, undefined ]
    });
    var r = through.obj(function (row, enc, next) {
        this.push({ lang: row.key[3], word: row.key[4] });
        next();
    });
    if (cb) {
        r.pipe(collect(cb));
        s.on('error', cb);
    }
    return s.pipe(r);
};

Translate.prototype.link = function (a, b, cb) {
    var wa = a.word || a.words, wb = b.word || b.words;
    var awords = isarray(wa) ? wa : [ wa ];
    var bwords = isarray(wb) ? wb : [ wb ];
    var rows = [];
    awords.forEach(function (aw) {
        bwords.forEach(function (bw) {
            rows.push(
                { key: [ 'link', a.lang, aw, b.lang, bw ], value: 0 },
                { key: [ 'link', b.lang, bw, a.lang, aw ], value: 0 },
                { key: [ 'word', aw, a.lang ], value: 0 },
                { key: [ 'word', bw, b.lang ], value: 0 }
            );
        });
    });
    this.db.batch(rows, cb);
};

function collect (cb) {
    var rows = [];
    return through.obj(write, end);
    function write (row, enc, next) { rows.push(row); next() }
    function end () { cb(null, rows) }
}
