from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan
from .models import Address
from datetime import datetime




class OrtsteilSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Ortsteil
        fields = ('name', 'polygon', 'slug')
        geo_field = 'polygon'


class BezirkSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Bezirk
        fields = ('name', 'slug', 'polygon', 'ortsteile', 'pk')
        geo_field = 'polygon'

class AddressSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):
    bezirk_name = serializers.SerializerMethodField()

    class Meta:
        model = Address
        fields = ('strname', 'hsnr', 'point', 'plz', 'bezirk_name')
        geo_field = 'point'

    def get_bezirk_name(self, obj):
        return obj.bezirk.name


class SimpleBezirkSerializer(serializers.ModelSerializer):

    class Meta:
        model = Bezirk
        fields = ('name',)


class SimpleBPlanSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()


    class Meta:
        model = BPlan
        exclude = ('multipolygon', 'point')

    def get_status(self, object):
        if object.festg:
            return 'festg'
        else:
            date = datetime.now().date()
            if (object.bbg_anfang and object.bbg_anfang <= date) and (object.bbg_ende and date <= object.bbg_ende):
                return 'bbg'
            elif (object.aul_anfang and object.aul_anfang <= date) and (object.aul_ende and date <= object.aul_ende):
                return 'aul'
            else:
                return 'imVerfahren'


class BPlanPointSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        id_field = False
        geo_field = 'point'
        fields = ('point', 'status', 'pk')


class BPlanMultipolygonSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        id_field = False
        geo_field = 'multipolygon'
        fields = ('multipolygon', 'bplanID', 'status', 'pk')
