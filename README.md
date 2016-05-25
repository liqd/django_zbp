# django_zbp

Zentrale Bplan Plattform for Berlin based on Django 1.9.4 and PostgreSQL/PostGIS


## Set up

``` bash
$ git clone git@github.com:liqd/django_zbp.git
$ cd django_zbp
$ npm install bower
$ pip install -r requirements.txt
$ cp django_zbp/settings/local.sample.py django_zbp/settings/local.py
$ edit django_zbp/settings/local.py -> set GDAL_LEGACY to True in your local settings if GDAL <= 1.10
```

edit *django_zbp/settings/local.py* for your database connection

``` python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'your db name',
        'USER': 'your db username',
        'PASSWORD': 'your db username password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

``` bash
$ ./manage.py migrate
$ ./manage.py bower install
$ ./manage.py createsuperuser

$ ./manage.py load_bezirke
$ ./manage.py load_ortsteile
$ ./manage.py load_bplan --fromFixtures (to load data from fixtures, no GDAL required)
$ ../manage.py load_bplan (to load data from WFS, GDAL required)

$ ./manage.py load_all (installs all, GDAL required)

```
here there is still an ugly error occurring twice that can be disregarded:

> GEOS_ERROR: TopologyException: side location conflict at ...

continue:
```
$ ./manage.py runserver
```

go to http://localhost:8000/admin/
