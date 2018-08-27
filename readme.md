# OpenStreetMap objects counter

A tool to count the number of objects in a PBF file according to the configuration file:

Example of `conf.json` file:

```js
{
    "landuse":"farmland",
    "highway":"*"
}
```

- If you want to count by a specific object, you should set the value, `"landuse":"farmland"`
- If you want to count all the values, set the values to `*`,  `"highway":"*"`

# Install


```
git clone https://github.com/Rub21/osm-obj-counter.git
cd osm-obj-counter/
npm link
```

# Usage

```
osmcounter <PBF file> --config <Config file> --format <Format output>
```

By default, the output format is in json, is you want you can set it as: `--format csv` 

E.g

```
osmcounter peru.pbf --config config.json > output.json
```
