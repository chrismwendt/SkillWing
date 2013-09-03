var fs = require('fs');
var request = require('request');
var bodies = JSON.parse(fs.readFileSync('cache/internet.json'));

module.exports = function(u, callback) {
    if (!bodies[u]) {
        console.log('fetching '+u);
        request(u, function(e, r) {
            if (e) {
                console.log(e);
            } else {
                bodies[u] = r.body;
            }
            callback(e, {'body': bodies[u]});
            fs.writeFileSync('fakege.json', JSON.stringify(bodies, undefined, 4));
        });
    } else {
        //console.log('have '+u);
        callback(undefined, {'body': bodies[u]});
    }
};
