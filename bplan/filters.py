from rest_framework import filters
from datetime import datetime
from django.db.models import Q


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


class AulFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        date = datetime.now()

        if 'aul' in request.GET:
            aul = request.GET['aul']
            if aul == 'true':
                return queryset.filter(aul_anfang__lte=date).filter(aul_ende__gte=date)
            if aul == 'false':
                aul = queryset.filter(aul_anfang__lte=date).filter(
                    aul_ende__gte=date).values_list('id', flat=True)
                return queryset.exclude(pk__in=aul)

        return queryset


class BbgFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        date = datetime.now()

        if 'bbg' in request.GET:
            bbg = request.GET['bbg']
            if bbg == 'true':
                return queryset.filter(bbg_anfang__lte=date).filter(bbg_ende__gte=date)
            if bbg == 'false':
                bbg = queryset.filter(bbg_anfang__lte=date).filter(
                    bbg_ende__gte=date).values_list('id', flat=True)
                return queryset.exclude(pk__in=bbg)

        return queryset


class FestgFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        if 'festg' in request.GET:
            festg = request.GET['festg']
            if festg == 'true':
                return queryset.filter(festg=True)
            if festg == 'false':
                return queryset.filter(festg=False)

        return queryset


class ImVerfahrenFilter(filters.BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):

        date = datetime.now()

        if 'imVerfahren' in request.GET:
            imVerfahren = request.GET['imVerfahren']
            queryset_filtered = queryset.filter(festg=False)
            auls = queryset_filtered.filter(aul_anfang__lte=date).filter(
                aul_ende__gte=date).values_list('id', flat=True)
            bbgs = queryset_filtered.filter(bbg_anfang__lte=date).filter(
                bbg_ende__gte=date).values_list('id', flat=True)
            imVerfahren_all = queryset_filtered.exclude(pk__in=auls).exclude(pk__in=bbgs)

            if imVerfahren == 'true':
                return imVerfahren_all

            if imVerfahren == 'false':
                imVerfahren_all_list = imVerfahren_all.values_list('id', flat=True)
                return queryset.exclude(pk__in=imVerfahren_all_list)

        return queryset
