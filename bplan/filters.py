from rest_framework import filters
from datetime import datetime
from django.db.models import Q

from .models import Ortsteil

class StatusFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        date = datetime.now()

        if 'status' in request.GET:
            queryset = queryset.filter(festg=False)
            statustype = request.GET["status"]

            if statustype == 'bbg':
                return queryset.filter(bbg_anfang__lte=date).filter(bbg_ende__gte=date)
            if statustype == 'aul':
                return queryset.filter(aul_anfang__lte=date).filter(aul_ende__gte=date)
            if statustype == 'imVerfahren':
                auls = queryset.filter(aul_anfang__lte=date).filter(
                    aul_ende__gte=date).values_list('id', flat=True)
                bbgs = queryset.filter(bbg_anfang__lte=date).filter(
                    bbg_ende__gte=date).values_list('id', flat=True)
                return queryset.exclude(pk__in=auls).exclude(pk__in=bbgs)

        return queryset


class OrtsteilFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):
        print("Hallo")

        if 'ortsteil' in request.GET:
            ortsteilname = request.GET["ortsteil"]
            print(ortsteilname)
            ortsteil = Ortsteil.objects.get(name=ortsteilname)
            return queryset.filter(ortsteile=ortsteil)
        else:
            return queryset
