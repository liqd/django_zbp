from rest_framework import viewsets
from rest_framework import filters
from rest_framework_gis.pagination import GeoJsonPagination
from .serializers import BezirkSerializer
from .serializers import OrtsteilSerializer
from .models import Bezirk
from .models import Ortsteil

class CustomPagination(GeoJsonPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 10000

class BezirkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bezirk.objects.all()
    serializer_class = BezirkSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('name',)

class OrtsteilViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ortsteil.objects.all()
    serializer_class = OrtsteilSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('name',)
