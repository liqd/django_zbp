#!/bin/sh
set -ex
./manage.py load_bezirke
./manage.py load_ortsteile
./manage.py load_bplan
wget https://fbinter.stadt-berlin.de/fb/atom/AD/AD_AdressenBerlin.zip
unzip AD_AdressenBerlin.zip
python ./manage.py insert_addresses *.gml
python ./manage.py insert_numberless_addresses
