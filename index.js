#!/usr/bin/env node

var fs = require('fs')
var osmium = require('osmium')
var _ = require('underscore')
var turf = require('@turf/turf')
var argv = require('minimist')(process.argv.slice(2))
var pbfFile = argv._[0];
var objConfig = JSON.parse(fs.readFileSync(argv.config).toString());
var counter = {};
init(pbfFile)
function init(pbfFile) {
  var handlerA = new osmium.Handler();
  handlerA.on("relation", function (relation) {
    mainCounter(relation, 'relation');
  });

  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on("node", function (node) {
    mainCounter(node, 'node');
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on("way", function (way) {
    mainCounter(way, 'way')
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on("done", function () {
    //print result
    if (argv.format === 'csv') {
      console.log(`tag,total,node,way,relation,area,distace`);
      _.each(counter, function (val, key) {
        console.log(`${key}, ${val.total},${val.node},${val.way},${val.relation},${val.area.toFixed(2)},${val.distance.toFixed(2)}`);
        _.each(val.types, function (v, k) {
          console.log(`${key}:${k}, ${v.total},${v.node},${v.way},${v.relation},${v.area.toFixed(2)},${v.distance.toFixed(2)}`);
        });
      });
    } else {
      console.log(JSON.stringify(counter));
    }
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
}

function mainCounter(data, type) {
  var tags = data.tags();
  _.each(objConfig, function (v, k) {
    if (tags[k]) {
      //General counter
      countBykeys(k, type);
      if (typeof data.geojson === 'function') {
        getDistanceAreaByKey(k, data.geojson());
      }
      // Count by key and values
      if (v !== '*') {
        var values = v.split(',');
        for (var i = 0; i < values.length; i++) {
          var value = values[i];
          if (tags[k] === value) {
            countBykeysValues(k, value, type);
            if (typeof data.geojson === 'function') {
              getDistanceAreaByKeyValues(k, value, data.geojson());
            }
          }
        }
      } else {
        countBykeysValues(k, tags[k], type);
        if (typeof data.geojson === 'function') {
          getDistanceAreaByKeyValues(k, tags[k], data.geojson());
        }
      }
    }
  });
}

//counter by key
function countBykeys(k, type) {
  if (counter.hasOwnProperty(k)) {
    counter[k].total++;
    counter[k][type]++;
  } else {
    counter[k] = {};
    // Counting by type of values
    counter[k].types = {};
    // Counting the total of objects
    counter[k].node = 0;
    counter[k].way = 0;
    counter[k].relation = 0;
    counter[k].total = 1
    counter[k][type] = 1;
    // Measures
    counter[k].area = 0;
    counter[k].distance = 0;

  }
}
//counter by key and value
function countBykeysValues(k, v, type) {
  if (counter[k].types[v]) {
    counter[k].types[v].total++;
    counter[k].types[v][type]++;
  } else {
    counter[k].types[v] = {};
    counter[k].types[v].node = 0;
    counter[k].types[v].way = 0;
    counter[k].types[v].relation = 0;
    counter[k].types[v][type] = 1;
    counter[k].types[v].total = 1;
    // Measures
    counter[k].types[v].area = 0;
    counter[k].types[v].distance = 0;
  }
}

//Distance and Area
function getDistanceAreaByKey(k, geojson) {
  //Get area from any geometry which is LineString && the first and last coordinates are equal
  if (geojson.type === 'LineString' && _.intersection(geojson.coordinates[0], geojson.coordinates[geojson.coordinates.length - 1]).length == 2) {
    var polygon = turf.lineToPolygon(geojson);
    counter[k].area = counter[k].area + area(polygon)
  }
  //Get distance
  if (geojson.type === 'LineString') {
    counter[k].distance = counter[k].distance + distance(geojson)
  }
}

function getDistanceAreaByKeyValues(k, v, geojson) {
  // Get area
  if (geojson.type === 'LineString' && _.intersection(geojson.coordinates[0], geojson.coordinates[geojson.coordinates.length - 1]).length == 2) {
    var polygon = turf.lineToPolygon(geojson);
    counter[k].types[v].area = counter[k].types[v].area + area(polygon)
  }
  // Get distance
  if (geojson.type === 'LineString') {
    counter[k].types[v].distance = counter[k].types[v].distance + distance(geojson)
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
  // turf.area return in square meter , let's convert to square meters
  return turf.area(polygon) / 1000;
}