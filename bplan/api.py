from rest_framework import viewsets
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination
from rest_framework_gis.pagination import GeoJsonPagination
from .filters import StatusFilter, OrtsteilFilter
from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.filters import DistanceToPointFilter
from .filters import StatusFilter
from .filters import OrtsteilFilter
from .filters import AddressFilter
from .filters import BezirkFilter
from .filters import BPlanAddressFilter
from .filters import BplanFilter
from .serializers import BezirkSerializer
from .serializers import OrtsteilSerializer
from .serializers import BPlanPointSerializer
from .serializers import SimpleBPlanSerializer
from .serializers import BPlanMultipolygonSerializer
from .serializers import BPlanSerializer
from .serializers import AddressSerializer
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan
from .models import Address


class CustomGeoJsonPagination(GeoJsonPagination):
    page_size = 4000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class CustomAddressGeoJsonPagination(GeoJsonPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 10000


class CustomPagination(PageNumberPagination):
    page_size = 4000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class AddressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Address.objects.all().order_by('plz')
    pagination_class = CustomAddressGeoJsonPagination
    serializer_class = AddressSerializer
    filter_backends = (
        filters.DjangoFilterBackend, AddressFilter, BezirkFilter)


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


class BPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter, InBBoxFilter, BPlanAddressFilter, BplanFilter)
    bbox_filter_include_overlapping = True
    bbox_filter_field = 'multipolygon'
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class BPlanDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = SimpleBPlanSerializer
    pagination_class = CustomPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter)
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class BPlanPointViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanPointSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter, InBBoxFilter, BPlanAddressFilter, BplanFilter)
    bbox_filter_field = 'point'
    bbox_filter_include_overlapping = True
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')


class BPlanMultipolygonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanMultipolygonSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        filters.DjangoFilterBackend, StatusFilter, OrtsteilFilter, InBBoxFilter, BPlanAddressFilter, BplanFilter)
    bbox_filter_include_overlapping = True
    bbox_filter_field = 'multipolygon'
    filter_fields = (
        'bplanID', 'planname', 'bezirk', 'festg', 'bezirk__slug', 'afs_behoer')
