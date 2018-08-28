#!/bin/bash
while IFS='' read -r line || [[ -n "$line" ]]; do
    echo {\"type\": \"FeatureCollection\", \"features\": [$line]} > zone.geojson
    name=$(jq '.features[0].properties.name' zone.geojson)
    name=$(echo "$name" | tr -d '"')
    name=${name// /_}
    geojsonRegion=$name.geojson
    echo $name
    if [ $name == "Amazonas" ]; then
        mv zone.geojson $geojsonRegion
        geojson2poly $geojsonRegion zone.poly
        docker run --rm -v ${PWD}:/app rub21/dosm osmconvert $1 -B=zone.poly --complete-ways --complex-ways -o=region.pbf
        osmcounter region.pbf --config config.json --format csv > result.csv

        awk -F"," 'BEGIN { OFS = "," } ; {$6="2012-02-29 16:13:00" OFS $6; print}' result.csv >output.csv


        # jq '.features[0].properties | . + {"stats":$result}' $geojsonRegion
    fi;
done < $2


