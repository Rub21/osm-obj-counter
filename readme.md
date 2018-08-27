# OpenStreetMap status counter

A tool to count the number of objects in a pbf file according to a configuration file:

Example of `conf.json` file:

```js
{
    "landuse":"farmland",
    "highway":"*"
}
```

# Install


```
git clone https://github.com/Rub21/osmstatus.git
cd osmstatus/
npm link
```

# Usage

```
osmstatus <PBF file> --config <Config file> --format <Format output>
```

By default the output format is in json, is you want you can set it as: `--format csv` 

E.g


```
osmstatus peru.pbf --config config.json > output.json
```
