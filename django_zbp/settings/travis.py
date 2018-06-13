from .base import *

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'django_zbp',
        'USER': 'postgres',
        'PASSWORD': '',
        'HOST': 'localhost',
    }
}

try:
    from .local import *
except ImportError:
    pass
