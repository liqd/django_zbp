from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Bezirk
from .models import Ortsteil
from .models import BPlan
from datetime import datetime
from django.utils import timezone
from django.contrib.gis.geos import Point


class OrtsteilSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Ortsteil
        fields = ('name', 'polygon', 'slug')
        geo_field = 'polygon'


class BezirkSerializer(GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer):
    bplan_count = serializers.SerializerMethodField()
    bplan_festgesetzt_count = serializers.SerializerMethodField()
    bplan_imVerfahren_count = serializers.SerializerMethodField()
    bplan_aul_count = serializers.SerializerMethodField()
    bplan_bbg_count = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()

    class Meta:
        model = Bezirk
        fields = ('name', 'slug', 'polygon', 'ortsteile', 'pk',
                  'bplan_count', 'bplan_festgesetzt_count',
                  'bplan_imVerfahren_count', 'bplan_aul_count',
                  'bplan_bbg_count', 'point')
        geo_field = 'polygon'

    def get_bplan_count(self, object):
        count = BPlan.objects.filter(bezirk=object).count()
        return count

    def get_bplan_festgesetzt_count(self, object):
        return BPlan.objects.filter(bezirk=object).filter(festg=True).count()

    def get_bplan_imVerfahren_count(self, object):
        bplan_count = self.get_bplan_count(object)
        bplan_festgesetzt_count = self.get_bplan_festgesetzt_count(object)
        bplan_aul_count = self.get_bplan_aul_count(object)
        bplan_bbg_count = self.get_bplan_bbg_count(object)
        return bplan_count - bplan_festgesetzt_count - bplan_aul_count - bplan_bbg_count

    def get_bplan_aul_count(self, object):
        date = timezone.now().date()
        qs = BPlan.objects.filter(bezirk=object).filter(festg=False)
        qs = qs.exclude(aul_anfang__isnull=True, aul_ende__isnull=True)
        count = qs.filter(aul_anfang__lte=date, aul_ende__gte=date).count()
        return count

    def get_bplan_bbg_count(self, object):
        date = timezone.now().date()
        qs = BPlan.objects.filter(bezirk=object).filter(festg=False)
        qs = qs.exclude(bbg_anfang__isnull=True, bbg_ende__isnull=True)
        count = qs.filter(bbg_anfang__lte=date, bbg_ende__gte=date).count()
        return count

    def get_point(self, object):
        point = Point(
            object.polygon.centroid.x, object.polygon.centroid.y, srid=4326)
        return point.coords


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
        fields = ('point', 'status', 'pk', 'bezirk')


class BPlanMultipolygonSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        id_field = False
        geo_field = 'multipolygon'
        fields = ('multipolygon', 'bplanID', 'status', 'pk')
