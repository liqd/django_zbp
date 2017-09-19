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

        ortsteilslug = request.GET.get('ortsteil', None)
        if ortsteilslug:
            return queryset.filter(ortsteile__slug=ortsteilslug)
        else:
            return queryset


class BezirkFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        bezirksslug = request.GET.get('bezirk', None)
        if bezirksslug:
            return queryset.filter(bezirk__slug=bezirksslug)
        else:
            return queryset


class PlzFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):
        plz = request.GET.get('plz', None)
        if plz:
            return queryset.filter(plz=plz)
        return queryset


class AddressFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        if 'address' in request.GET:
            req_address = request.GET["address"]
            words = req_address.split(' ')
            address = ''
            for word in words:
                if word[-4:] == 'str.':
                    word = word[:-1] + 'asse'
                elif word[-3:] == 'str':
                    word += 'asse'
                address += word
            address = (address.replace(
                '-', '').replace('ß', 'ss')).lower()
            addresses = queryset.filter(search_name=address)
            return addresses
        else:
            return queryset


class BplanFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        if 'bplan' in request.GET:
            bplan = request.GET["bplan"]
            bplan = bplan.replace(' ', '').lower()
            bplans = queryset.filter(bplanID=bplan)
            return bplans
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


