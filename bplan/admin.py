from django.contrib.gis import admin
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan
from .models import Download

class DownloadAdmin(admin.ModelAdmin):
    list_filter = ('bplan', )

admin.site.register(Bezirk, admin.GeoModelAdmin)
admin.site.register(Ortsteil, admin.GeoModelAdmin)
admin.site.register(BPlan, admin.GeoModelAdmin)
admin.site.register(Download, DownloadAdmin)