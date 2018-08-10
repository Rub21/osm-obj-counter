'use strict'
var fs = require('fs')
var osmium = require('osmium')
var _ = require('underscore')
var turf = require('@turf/turf')
var objConfig = require('./objConfig.json');
var argv = require('minimist')(process.argv.slice(2))
var pbfFile = argv._[0];
init(pbfFile)
var counter = {};
function init(pbfFile) {
  var file = new osmium.File(pbfFile);
  var reader = new osmium.Reader(file);
  var location_handler = new osmium.LocationHandler();
  var handler = new osmium.Handler();
  osmium.apply(reader, location_handler, handler);
  var stream = new osmium.Stream(new osmium.Reader(file, location_handler));
  stream.on('data', function (data) {
    var tags = data.tags();
    _.each(objConfig, function (v, k) {
      if (tags[k]) {
        countBykeys(k);
        countBykeysValues(k, tags[k])
        // if (v !== '*') {
        //   var values = v.split(',');
        //   for (var i = 0; i < values.length; i++) {
        //     var value = values[i];
        //     if (tags[k] === value) {
        //       countBykeysValues(k, value);
        //     }
        // }
        // }
      }
    });
  });
  stream.on('end', function () {
    console.log(counter)
  });
}
//counter by key
function countBykeys(k) {
  if (counter[k]) {
    counter[k].total++;
  } else {
    counter[k] = {};
    counter[k].type = {};
    counter[k].total = 1;
  }
}
//counter by key and value
function countBykeysValues(k, v) {
  if (counter[k].type[v]) {
    counter[k].type[v]++
  } else {
    counter[k].type[v] = 1;
  }
}