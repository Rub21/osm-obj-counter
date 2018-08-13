#!/usr/bin/env node

var fs = require('fs')
var osmium = require('osmium')
var _ = require('underscore')
var turf = require('@turf/turf')
var objConfig = require('./objConfig.json');
var argv = require('minimist')(process.argv.slice(2))
var pbfFile = argv._[0];
var counter = {};
init(pbfFile)
function init(pbfFile) {
  var handlerA = new osmium.Handler();
  handlerA.on("relation", function (relation) {
    mainCounter(relation);
  });

  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on("node", function (node) {
    mainCounter(node);
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on("way", function (way) {
    mainCounter(way)
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on("done", function () {
    //print result
    console.log(`tag,total,area,distace`);
    _.each(counter, function (val, key) {
      console.log(`${key}, ${val.total},${val.area.toFixed(2)},${val.distance.toFixed(2)}`);
      _.each(val.type, function (v, k) {
        console.log(`${key}:${k}, ${v.total},${v.area.toFixed(2)},${v.distance.toFixed(2)}`);
      });
    });
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
}

function mainCounter(data) {
  var tags = data.tags();
  _.each(objConfig, function (v, k) {
    if (tags[k]) {
      //General counter
      countBykeys(k);
      if (typeof data.geojson === 'function') {
        getDistanceAreaByKey(k, data.geojson());
      }
      if (v !== '*') {
        var values = v.split(',');
        for (var i = 0; i < values.length; i++) {
          var value = values[i];
          if (tags[k] === value) {
            countBykeysValues(k, value);
            if (typeof data.geojson === 'function') {
              getDistanceAreaByKeyValues(k, value, data.geojson());
            }
          }
        }
      } else {
        countBykeysValues(k, tags[k]);
        if (typeof data.geojson === 'function') {
          getDistanceAreaByKeyValues(k, tags[k], data.geojson());
        }
      }
    }
  });
}

//counter by key
function countBykeys(k) {
  if (counter.hasOwnProperty(k)) {
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

//Distance and Area
function getDistanceAreaByKey(k, geojson) {
  if (geojson.type !== 'Point' && geojson.type === 'LineString' && _.intersection(geojson.coordinates[0], geojson.coordinates[geojson.coordinates.length - 1]).length == 2) {
    geojson = turf.lineToPolygon(geojson);
  }
  if (geojson.type === 'LineString') {
    counter[k].distance = counter[k].distance + distance(geojson)
  }
  if (geojson.type === 'MultiPolygon' || geojson.type === 'Polygon') {
    counter[k].area = counter[k].area + area(geojson)
  }
}

function getDistanceAreaByKeyValues(k, v, geojson) {
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