from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Bezirk
from .models import Ortsteil

class OrtsteilSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Ortsteil
        fields = ('name', 'polygon', 'bezirk')
        geo_field = 'polygon'


class BezirkSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Bezirk
        fields = ('name', 'polygon','ortsteile')
        geo_field = 'polygon'


