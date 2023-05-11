# django_zbp

![Build Status](https://github.com/liqd/django_zbp/actions/workflows/django.yml/badge.svg)

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
``` bash
$ sudo -u postgres psql
postgres=# create database my_database;
postgres=# create user my_user with encrypted password 'my_password';
postgres=# grant all privileges on database'my_database' to my_user;
```
if the last step does not work, you can also do
``` bash
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

FILL DB, LOAD DISTRICTS, ORTSTEILE AND BPLANS
$ make fixtures

INSERT ADDRESSES
$ wget https://fbinter.stadt-berlin.de/fb/atom/AD/AD_AdressenBerlin.zip
$ unzip *.zip
$ ./manage.py insert_addresses *.gml

LOAD ALL DATA
$ ./manage.py populate_database

```

The Bplans loaded via the `make fixtures` are from the fixtures. To get them from the FIS-broker, do
``` bash
$ ./manage.py load_bplan
```
In this case, GDAL is required to be installed.

continue:
```
$ make watch
```

go to http://localhost:8005/admin/

### testing the embedded version
To test an embedded version open the file `test.html` after running `make watch`
