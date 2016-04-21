from .base import *

DEBUG = False

COMPRESS_OFFLINE = True

try:
    from .local import *
except ImportError:
    pass
