from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '*rg(3(8c!3zi$wu0b_q=al@dn#$sc44c^6rb9uy8$jc65abpms'

# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

try:
    from .local import *
except ImportError:
    pass
