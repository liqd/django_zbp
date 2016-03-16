# django_zbp

Zentrale Bplan Plattform for Berlin based on Django 1.9.4 and PostgreSQL/PostGIS


## Set up

``` bash
$ git clone git@github.com:liqd/django_zbp.git
$ cd django_zbp
$ pip install -r requirements.txt
$ cp django_zbp/settings_sample.py django_zbp/settings.py
```

edit *django_zbp/settings.py* for your database connection

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
$ ./manage.py createsuperuser
$ ./manage.py load_bezirke
$ ./manage.py load_ortsteile
$ ./manage.py load_bplan
$ ./manage.py runserver
```

go to http://localhost:8000/admin/ or http://localhost:8000/api/

