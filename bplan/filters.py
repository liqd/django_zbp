from rest_framework import filters
from datetime import datetime
from django.db.models import Q

from .models import Ortsteil
from .models import Bezirk

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

        if 'ortsteil' in request.GET:
            ortsteilslug = request.GET["ortsteil"]
            ortsteil = Ortsteil.objects.get(slug=ortsteilslug)
            return queryset.filter(ortsteile=ortsteil)
        else:
            return queryset


class BezirkFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        if 'bezirk' in request.GET:
            bezirksslug = request.GET["bezirk"]
            bezirk = Bezirk.objects.get(slug=bezirksslug)
            return queryset.filter(bezirk=bezirk)
        else:
            return queryset


class AddressFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):


        if 'address' in request.GET:
            address = request.GET["address"]
            address = (address.replace(' ','').replace('-', '').replace('ß','ss')).lower()
            addresses = queryset.filter(search_name=address)
            return addresses
        else:
            return queryset
