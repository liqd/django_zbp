from django.contrib.gis import admin

from .models import Address
from .models import Bezirk
from .models import BPlan
from .models import Download
from .models import Ortsteil


class DownloadAdmin(admin.ModelAdmin):
    list_filter = ("bplan",)


admin.site.register(Bezirk, admin.GeoModelAdmin)
admin.site.register(Ortsteil, admin.GeoModelAdmin)
admin.site.register(BPlan, admin.GeoModelAdmin)
admin.site.register(Address, admin.GeoModelAdmin)
admin.site.register(Download, DownloadAdmin)
