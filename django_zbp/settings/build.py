from .production import *

SECRET_KEY = "dummykeyforbuilding"

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

COMPRESS_OFFLINE = True
