from rest_framework import filters
from django.utils import timezone
from django.db.models import Q
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from rest_framework_gis import filters as gis_filters

from .models import Ortsteil
from .models import Bezirk


class StatusFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        date = timezone.now()

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
            address = (address.replace(' ', '').replace(
                '-', '').replace('ß', 'ss')).lower()
            addresses = queryset.filter(search_name=address)
            return addresses
        else:
            return queryset


class BPlanAddressFilter(filters.BaseFilterBackend):

    def get_filter_point(self, request):
        point_string = request.query_params.get('point', None)
        if not point_string:
            return None
        try:
            (x, y) = (float(n) for n in point_string.split(','))
        except ValueError:
            raise ParseError('Invalid geometry string supplied for parameter {0}'.format(self.point_param))
        p = Point(x, y, srid=4326)
        p.transform(25833)

        return p

    def filter_queryset(self, request, queryset, view):

        if 'point' in request.GET:
            p = self.get_filter_point(request)
            queryset = queryset.filter(multipolygon_25833__dwithin=(p, D(m=500)))
            return queryset
        else:
            return queryset


