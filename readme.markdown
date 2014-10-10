# dictdb

dictionary database for language translation

# example

First populate the database:

``` js
var parse = require('parse-dictd');
var through = require('through2');
var fs = require('fs');
var gunzip = require('zlib').createGunzip;
var minimist = require('minimist');

var db = require('level')('/tmp/dict.db');
var ddb = require('dictdb')(db);

var argv = minimist(process.argv.slice(2));

var dstream = fs.createReadStream(argv._[0]).pipe(gunzip());
var istream = fs.createReadStream(argv._[1]);

parse(dstream, istream).pipe(through.obj(function (row, enc, next) {
    var a = { word: fix(row.from), lang: argv.from };
    var b = { word: row.to.map(fix), lang: argv.to };
    ddb.link(a, b);
    next();
}));

function fix (w) { return w.replace(/^\w+\.\s*|;$/g,'') }
```

```
$ node import.js --from en --to zh /usr/share/dictd/stardic.{dict.dz,index}
```

then you can query the dictionary database:

``` js
var minimist = require('minimist');
var db = require('level')('/tmp/dict.db');
var ddb = require('dictdb')(db);
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
```

```
$ node get.js --from en --to zh robot
机械人
机械般工作的人
自动机械
```

# methods

``` js
var dictdb = require('dictdb')
```

## var ddb = dictdb(db)

Create a dictdb instance `ddb` from a leveldb handle `db`.

# ddb.link(a, b, cb)

Link `a.word` written in `a.lang` to `b.word` written in `b.lang` and
vice-versa.

`a.word` and `b.word` can be strings or arrays of strings.

The optional callback `cb(err)` fires with any errors.

# var r = ddb.get(query, cb)

Return an object stream `r` with the results of `query`:

* `query.word` - word to search for
* `query.from` - language that `query.word` is written in
* `query.to` - language to translate `query.word` into

`r` pushes objects with `lang` and `word` properties.

# install

With [npm](https://npmjs.org) do:

```
npm install dictdb
```

# license

MIT
