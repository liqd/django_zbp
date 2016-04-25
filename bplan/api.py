from rest_framework import viewsets
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
from rest_framework_gis.pagination import GeoJsonPagination
from rest_framework_extensions.cache.mixins import CacheResponseMixin
from rest_framework_gis.filters import InBBoxFilter
from .filters import StatusFilter
from .filters import OrtsteilFilter
from .serializers import BezirkSerializer
from .serializers import OrtsteilSerializer
from .serializers import BPlanPointSerializer
from .serializers import SimpleBPlanSerializer
from .serializers import BPlanMultipolygonSerializer
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan


class CustomGeoJsonPagination(GeoJsonPagination):
    page_size = 4000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class CustomPagination(PageNumberPagination):
    page_size = 4000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class BezirkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bezirk.objects.all()
    serializer_class = BezirkSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('name', 'slug')


class OrtsteilViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ortsteil.objects.all()
    serializer_class = OrtsteilSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('name',)


class BPlanDataViewSet(viewsets.ReadOnlyModelViewSet, CacheResponseMixin):
    queryset = BPlan.objects.all()
    serializer_class = SimpleBPlanSerializer
    pagination_class = CustomPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter)
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class BPlanPointViewSet(viewsets.ReadOnlyModelViewSet, CacheResponseMixin):
    queryset = BPlan.objects.all()
    serializer_class = BPlanPointSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter, InBBoxFilter)
    bbox_filter_field = 'point'
    bbox_filter_include_overlapping = True
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class BPlanMultipolygonViewSet(viewsets.ReadOnlyModelViewSet, CacheResponseMixin):
    queryset = BPlan.objects.all()
    serializer_class = BPlanMultipolygonSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter, InBBoxFilter)
    bbox_filter_include_overlapping = True
    bbox_filter_field = 'multipolygon'
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')
