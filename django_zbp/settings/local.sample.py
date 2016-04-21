DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'django_zbp_database',
        'USER': 'postgres_user',
        'PASSWORD': 'mysupersecurepassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
