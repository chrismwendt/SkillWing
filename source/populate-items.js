// Grand Exchange API
// http://services.runescape.com/m=rswiki/en/Grand_Exchange_APIs

var fs = require('fs');
var url = require('url');
var __ = require('underscore');
var async = require('async');
var requestQueue = require('./request-queue');
var rsNumber = require('./rs-number');

exports.items = {};
var cacheFile = 'cache/ge.json';
var totalCategories = 38; // categories use 0-based indices
var maxItemsPerPage = 12; // pages use 1-based indices

var getCategoryURL = function(category) {
    u = url.parse('http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json');
    u.query = {'category': category};
    return url.format(u);
};

var getPageURL = function(category, alpha, page) {
    u = url.parse('http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json');
    u.query = {'category': category, 'alpha': alpha, 'page': page};
    return url.format(u);
};

var getItems = function(onItem, onFinish) {
    requestQueue.drain = onFinish;

    __.each(__.range(totalCategories), function(category) {
        requestQueue.enqueue(getCategoryURL(category), function(response) {
            //console.log('Category '+category);
            var alphas = __(JSON.parse(response.body).alpha).filter(function(a) { return a['items'] > 0; });
            __.each(alphas, function(alpha) {
                __.each(__.range(1, Math.ceil(alpha['items']/maxItemsPerPage)+1), function(page) {
                    requestQueue.enqueue(getPageURL(category, alpha['letter'], page), function(response, timestamp) {
                        __(JSON.parse(response.body).items).each(function(item) {
                            onItem(item, timestamp);
                        });
                    });
                });
            });
        });
    });
};

exports.start = function(ready, customCacheFile) {
    ready = __.once(ready);
    cacheFile = customCacheFile || cacheFile;
    if (fs.existsSync(cacheFile)) {
        exports.items = JSON.parse(fs.readFileSync(cacheFile));
        ready();
    }

    var l = 1;

    async.forever(function(again) {
        var i = 1;
        getItems(function(item, timestamp) {
            exports.items[item.id] = {
                'id': item.id,
                'name': item.name,
                'price': rsNumber.toInt(item.current.price),
                'timestamp': timestamp
            };
            //console.log('    '+l+':'+(i++)+', id '+item.id+', '+item.name+', '+item.current.price+' ('+rsNumber.toInt(item.current.price)+')');
        }, function() {
            l++;
            ready();
            fs.writeFile(cacheFile, JSON.stringify(exports.items, undefined, 4));
            again();
        });
    });
};
