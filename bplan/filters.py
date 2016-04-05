from rest_framework import filters
from datetime import datetime


class StatusFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        if 'status' in request.GET:
            statustype = request.GET["status"]
            date = datetime.now()
            if statustype == "bbg":
                # FIXME: get local time (DLS)
                return queryset.filter(bbg_anfang__lte=date).filter(bbg_ende__gte=date)
            if statustype == "aul":
                return queryset.filter(aul_anfang__lte=date).filter(aul_ende__gte=date)
        return queryset
