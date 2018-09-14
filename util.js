var turf = require('@turf/turf')

function distance (line) {
  var lineDistance = 0
  for (let i = 0; i < line.coordinates.length - 1; i++) {
    var coord1 = line.coordinates[i]
    var coord2 = line.coordinates[i + 1]
    var from = turf.point(coord1)
    var to = turf.point(coord2)
    var d = turf.distance(from, to, {
      units: 'kilometers'
    })
    lineDistance += d
  }
  return lineDistance
}

function area (polygon) {
    // turf.area return in square meter , let's convert to square kilometers
  return turf.area(polygon) / 1000000
}

module.exports = {
  distance,
  area
}
