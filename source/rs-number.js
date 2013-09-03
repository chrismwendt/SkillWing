module.exports.fromInt = function(n) {
    n = Math.round(n);
    if (Math.abs(n) < 10000) {
        // add commas
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    var suffix;
    if (1000000000 <= Math.abs(n)) {
        suffix = 'b';
        n /= 1000000000;
    } else if (1000000 <= Math.abs(n)) {
        suffix = 'm';
        n /= 1000000;
    } else if (10000 <= Math.abs(n)) {
        suffix = 'k';
        n /= 1000;
    }
    return n.toFixed(1) + suffix;
}

module.exports.toInt = function(n) {
    n = n.toString().toLowerCase().replace(/,/, '').trim();
    if (String(Number(n)) == n) {
        return Math.round(n);
    } else {
        return Math.round(n.slice(0, -1) * Math.pow(10, {'k': 3, 'm': 6, 'b': 9}[n.slice(-1)[0]]));
    }
}
