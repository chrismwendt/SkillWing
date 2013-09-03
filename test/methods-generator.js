var fs = require('fs');
var __ = require('underscore');
var expect = JSON.parse(fs.readFileSync('data/methods.json'));
var got = JSON.parse(fs.readFileSync('data/methods.json.new'));
console.log(__.isEqual(got, expect));
