from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.pagination import GeoJsonPagination

from .filters import AddressFilter
from .filters import BezirkFilter
from .filters import BPlanAddressFilter
from .filters import BplanFilter
from .filters import OrtsteilFilter
from .filters import PlzFilter
from .filters import StatusFilter
from .models import Address
from .models import Bezirk
from .models import BPlan
from .models import Ortsteil
from .serializers import AddressSerializer
from .serializers import BezirkSerializer
from .serializers import BPlanMultipolygonSerializer
from .serializers import BPlanPointSerializer
from .serializers import BPlanSerializer
from .serializers import OrtsteilSerializer
from .serializers import SimpleBPlanSerializer


class CustomGeoJsonPagination(GeoJsonPagination):
    page_size = 4000
    page_size_query_param = "page_size"
    max_page_size = 10000


class CustomAddressGeoJsonPagination(GeoJsonPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 10000


class CustomPagination(PageNumberPagination):
    page_size = 4000
    page_size_query_param = "page_size"
    max_page_size = 10000


class AddressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Address.objects.all().order_by("plz")
    pagination_class = CustomAddressGeoJsonPagination
    serializer_class = AddressSerializer
    filter_backends = (DjangoFilterBackend, AddressFilter, BezirkFilter, PlzFilter)


class BezirkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bezirk.objects.all()
    serializer_class = BezirkSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("name", "slug")


class OrtsteilViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ortsteil.objects.all()
    serializer_class = OrtsteilSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("name",)


class BPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        DjangoFilterBackend,
        StatusFilter,
        OrtsteilFilter,
        InBBoxFilter,
        BPlanAddressFilter,
        BplanFilter,
    )
    bbox_filter_include_overlapping = True
    bbox_filter_field = "multipolygon"
    filterset_fields = (
        "bplanID",
        "planname",
        "bezirk",
        "festg",
        "bezirk__slug",
        "afs_behoer",
    )


class BPlanDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = SimpleBPlanSerializer
    pagination_class = CustomPagination
    filter_backends = (DjangoFilterBackend, StatusFilter, OrtsteilFilter)
    filterset_fields = (
        "bplanID",
        "planname",
        "bezirk",
        "festg",
        "bezirk__slug",
        "afs_behoer",
    )


class BPlanPointViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanPointSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        DjangoFilterBackend,
        StatusFilter,
        OrtsteilFilter,
        InBBoxFilter,
        BPlanAddressFilter,
        BplanFilter,
    )
    bbox_filter_field = "point"
    bbox_filter_include_overlapping = True
    filterset_fields = (
        "bplanID",
        "planname",
        "bezirk",
        "festg",
        "bezirk__slug",
        "afs_behoer",
    )


class BPlanMultipolygonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BPlan.objects.all()
    serializer_class = BPlanMultipolygonSerializer
    pagination_class = CustomGeoJsonPagination
    filter_backends = (
        DjangoFilterBackend,
        StatusFilter,
        OrtsteilFilter,
        InBBoxFilter,
        BPlanAddressFilter,
        BplanFilter,
    )
    bbox_filter_include_overlapping = True
    bbox_filter_field = "multipolygon"
    filterset_fields = (
        "bplanID",
        "planname",
        "bezirk",
        "festg",
        "bezirk__slug",
        "afs_behoer",
    )
