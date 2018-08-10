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
        countBykeysValues(k, tags[k]);
        //Areas and distance
        if (typeof data.geojson === 'function') {
          propsByKey(k, data.geojson());
          propsKeyValues(k, tags[k], data.geojson());
        }
      }
    });
  });
  stream.on('end', function () {
    //print result
    console.log(`tag,total,area,distace`);
    _.each(counter, function (val, key) {
      console.log(`${key}, ${val.total},${val.area},${val.distance}`);
      _.each(val.type, function (v, k) {
        console.log(`${key}:${k}, ${v.total},${v.area},${v.distance}`);
      });
    });
  });
}
//counter by key
function countBykeys(k) {
  if (counter[k]) {
    counter[k].total++;
  } else {
    //total
    counter[k] = {};
    counter[k].area = 0;
    counter[k].distance = 0;
    counter[k].total = 1;
    //type
    counter[k].type = {};
  }
}
//counter by key and value
function countBykeysValues(k, v) {
  if (counter[k].type[v]) {
    counter[k].type[v].total++
  } else {
    counter[k].type[v] = {};
    counter[k].type[v].area = 0;
    counter[k].type[v].distance = 0;
    counter[k].type[v].total = 1;
  }
}

//Distance
function propsByKey(k, geojson) {
  if (geojson.type === 'LineString') {
    counter[k].distance = counter[k].distance + distance(geojson)
  }
  if (geojson.type === 'MultiPolygon' || geojson.type === 'Polygon') {
    counter[k].area = counter[k].area + area(geojson)
  }
}

function propsKeyValues(k, v, geojson) {
  if (geojson.type === 'LineString' || geojson.type === 'MultiLineString') {
    counter[k].type[v].distance = counter[k].type[v].distance + distance(geojson)
  }
  if (geojson.type === 'MultiPolygon' || geojson.type === 'Polygon') {
    counter[k].type[v].area = counter[k].type[v].area + area(geojson)
  }
}

function distance(line) {
  var lineDistance = 0;
  for (let i = 0; i < line.coordinates.length - 1; i++) {
    var coord1 = line.coordinates[i];
    var coord2 = line.coordinates[i + 1];
    var from = turf.point(coord1);
    var to = turf.point(coord2);
    var d = turf.distance(from, to, {
      units: 'kilometers'
    });
    lineDistance += d;
  }
  return lineDistance;
}

function area(polygon) {
  return turf.area(polygon);
}