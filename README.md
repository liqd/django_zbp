# django_zbp

![Build Status](https://github.com/liqd/a4-meinberlin/actions/workflows/django.yml/badge.svg)

Zentrale Bplan Plattform for Berlin based on Django 1.9.4 and PostgreSQL/PostGIS


## Set up

### Requirements:

 * postgresql
 * gdal
 * postgis

``` bash
$ git clone git@github.com:liqd/django_zbp.git
$ make install
$ cp django_zbp/settings/local.sample.py django_zbp/settings/local.py
$ edit django_zbp/settings/local.py -> set GDAL_LEGACY to True in your local settings if GDAL <= 1.10
```
create a postgres db and superuser
```bash
$ sudo -u postgres psql
postgres=# create database my_database;
postgres=# create user my_user with encrypted password 'my_password';
postgres=# alter role my_user SUPERUSER;
 ```
and then edit *django_zbp/settings/local.py* for your database connection

``` python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'my_database',
        'USER': 'my_user',
        'PASSWORD': 'my_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

``` bash

INSTALL DEPENDENCIES
$ make install

LOAD DISTRICTS AND ORTSTEILE
$ ./manage.py load_bezirke
$ ./manage.py load_ortsteile

LOAD BPLAN
$ ./manage.py load_bplan --fromFixtures (to load data from fixtures, no GDAL required)
$ ./manage.py load_bplan (to load data from WFS, GDAL required)

INSERT ADDRESSES
$ wget http://fbarc.stadt-berlin.de/FIS_Broker_Atom/AD/AD_AdressenBerlin.zip
$ unzip *.zip
$ ./manage.py insert_addresses *.gml

LOAD ALL DATA
$ ./manage.py populate_database

```

continue:
```
$ ./manage.py runserver
```

go to http://localhost:8000/admin/
