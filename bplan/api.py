from rest_framework import viewsets
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
from rest_framework_gis.pagination import GeoJsonPagination
from rest_framework_extensions.cache.mixins import CacheResponseMixin
from .filters import StatusFilter
from .filters import AulFilter
from .filters import BbgFilter
from .filters import FestgFilter
from .filters import ImVerfahrenFilter
from .serializers import BezirkSerializer
from .serializers import OrtsteilSerializer
from .serializers import BPlanSerializer
from .serializers import SimpleBPlanSerializer
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan


class CustomGeoJsonPagination(GeoJsonPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 10000


class CustomPagination(PageNumberPagination):
    page_size = 100
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


class BPlanViewSet(viewsets.ReadOnlyModelViewSet, CacheResponseMixin):
    queryset = BPlan.objects.all()
    serializer_class = BPlanSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (filters.DjangoFilterBackend, StatusFilter, AulFilter, BbgFilter, FestgFilter, ImVerfahrenFilter)
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class SimpleBPlanViewSet(viewsets.ReadOnlyModelViewSet, CacheResponseMixin):
    queryset = BPlan.objects.all()
    serializer_class = SimpleBPlanSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend, StatusFilter, AulFilter, BbgFilter, FestgFilter, ImVerfahrenFilter)
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')
