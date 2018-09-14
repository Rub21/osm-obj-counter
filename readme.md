# OpenStreetMap objects counter

This is a tool for counting the number of objects in a PBF or OSM file according to the configuration file.

# Install


```
git clone https://github.com/developmentseed/osm-obj-counter.git
cd osm-obj-counter/
npm link
```

# Usage

```
osmcounter <PBF file or OSM FILE> --config <Config file> --format <Format output> --users=<List of users>
```

- `<PBF file or OSM FILE>` Required parameter

- `--config` : Required parameter, The app will count the objects according to this configuration file.

Example of `config.json` file:

```js
{
    "landuse":"farmland",
    "highway":"*"
}
```

- If you want to count by a specific object, you should set the value, `"landuse":"farmland"`
- If you want to count all the values, set the values to `*`,  `"highway":"*"`


- ` --format`: By default, the output format is in json, is you want a CSV ouput, you can set it as: `--format csv` 

- `--users` : If you set this argument, you can set to count for the specific users like `--users 'piligab,karitotp,Rub21'` or if you want to count all user you can set it as: `--users '*'`, 

E.g: Getting the base map

```
osmcounter peru.pbf --config config.json > output.json
```

E.g: Getting the base map by user

```
osmcounter peru.pbf --config config.json --users 'piligab,karitotp,Rub21' > output.json
```

E.g: Getting the base map in csv format 

```
osmcounter peru.pbf --config config.json --format csv > output.csv
```