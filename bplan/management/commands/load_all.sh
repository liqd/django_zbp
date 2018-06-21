#!/bin/sh
set -ex
./manage.py load_bezirke
./manage.py load_ortsteile
./manage.py load_bplan
wget http://fbarc.stadt-berlin.de/FIS_Broker_Atom/AD/AD_AdressenBerlin.zip
unzip .zip
python ./manage.py insert_addresses *.gml
python ./manage.py insert_numberless_addresses
