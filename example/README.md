# Getting base map  for each estae of Peru

Let's get a PBF file of Peru form : http://download.geofabrik.de

Get Peru bounduaries from: https://gadm.org/download_country_v3.html, We will use the `gadm36_PER_1.shp` file.

Install 
-  https://github.com/developmentseed/geokit
- https://stedolan.github.io/jq/
- https://github.com/mapbox/geojson-merge


## Step 1: Generate geojson from Shapefile.

 Open the file `gadm36_PER_1.shp` using Qgis and save it as geojson file. Make sure your geojson file has an attribute `name` for ech state.
 
## Step 2: Customize the geojson file.


```
geokit fc2frows peru.geojson > peru.json

```