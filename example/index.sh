#!/bin/bash
geokit fc2frows $2 > _.json.json
while IFS='' read -r line || [[ -n "$line" ]]; do
    echo {\"type\": \"FeatureCollection\", \"features\": [$line]} > zone.geojson
    name=$(jq '.features[0].properties.name' zone.geojson)
    name=$(echo "$name" | tr -d '"')
    name=${name// /_}
    geojsonRegion=_.$name.geojson
    echo $name
    # if [ $name == "Amazonas" ]; then
        mv zone.geojson $geojsonRegion
        geojson2poly $geojsonRegion _.zone.poly
        docker run --rm -v ${PWD}:/app rub21/dosm osmconvert $1 -B=_.zone.poly --complete-ways --complex-ways -o=_.region.pbf
        osmcounter _.region.pbf --config config.json --format csv > result.csv
        csvsql --query "select '$name' as 'region',tag,total,node,way,relation,area,distance from result" result.csv > _.$name.csv
        rm result.csv
    # fi;
done < _.json.json
echo "region,tag,total,node,way,relation,area,distance" > result.csv
for f in _.*.csv; do cat "`pwd`/$f" | tail -n +2 >> result.csv; done 
rm _.*