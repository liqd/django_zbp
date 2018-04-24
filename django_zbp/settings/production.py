from .base import *

DEBUG = False

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

COMPRESS_OFFLINE = True

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'djanog_zbp',
        'TIMEOUT': 1800,
    }
}

try:
    from .local import *
except ImportError:
    pass
