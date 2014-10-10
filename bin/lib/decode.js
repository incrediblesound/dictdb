module.exports = function (s) {
    if (s.length === 1) s += 'A';
    var buf = Buffer(s, 'base64');
    var index = 0, len = buf.length;;
    for (var i = 0; i < len; i++) {
        index += Math.pow(256,len-i-1) * buf[i];
    }
    return index;
};
