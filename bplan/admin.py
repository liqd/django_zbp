from django.contrib.gis import admin
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan

admin.site.register(Bezirk, admin.GeoModelAdmin)
admin.site.register(Ortsteil, admin.GeoModelAdmin)
admin.site.register(BPlan, admin.GeoModelAdmin)