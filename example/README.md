# Getting base map  for each estae of Peru

Let's get a PBF file of Peru form : http://download.geofabrik.de

Get Peru bounduaries from: https://gadm.org/download_country_v3.html, We will use the `gadm36_PER_1.shp` file.

Install 
-  https://github.com/developmentseed/geokit
- https://stedolan.github.io/jq/
- https://csvkit.readthedocs.io/en/1.0.2/index.html


## Step 1: Generate geojson from Shapefile.

 Open the file `gadm36_PER_1.shp` using Qgis and save it as geojson file. Make sure your geojson file has an attribute `name` for each state.
 
## Step 2: Customize the geojson file.

```
geokit fc2frows peru.geojson > peru.json
```

## Step 3: Run the `index.sh` script

```
./index.sh <pbf file> <geojson file>
```

The result is a csv file called : `result.csv`