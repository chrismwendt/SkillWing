// Grand Exchange API
// http://services.runescape.com/m=rswiki/en/Grand_Exchange_APIs

var url = require('url');
var _ = require('underscore');
var async = require('async');
var requestQueue = require('./request-queue');

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

    _.each(_.range(totalCategories), function(category) {
        requestQueue.enqueue(getCategoryURL(category), function(response) {
            console.log('Category ' + category + ' of ' + totalCategories);
            var alphas = _(JSON.parse(response.body).alpha).filter(function(a) { return a['items'] > 0; });
            _.each(alphas, function(alpha) {
                _.each(_.range(1, Math.ceil(alpha['items']/maxItemsPerPage)+1), function(page) {
                    requestQueue.enqueue(getPageURL(category, alpha['letter'], page), function(response, timestamp) {
                        _(JSON.parse(response.body).items).each(function(item) {
                            onItem(item, timestamp);
                        });
                    });
                });
            });
        });
    });
};

// Calls callback(item, timestamp) for each item in the GE database.
exports.itemStream = function(callback) {
    async.forever(function(again) {
        getItems(callback, again);
    });
};
