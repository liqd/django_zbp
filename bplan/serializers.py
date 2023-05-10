from django.contrib.gis.geos import Point
from django.utils import timezone
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import Address
from .models import Bezirk
from .models import BPlan
from .models import Ortsteil


class OrtsteilSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Ortsteil
        fields = ("name", "polygon", "slug")
        geo_field = "polygon"


class BezirkSerializer(
    GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer
):
    bplan_count = serializers.SerializerMethodField()
    bplan_festgesetzt_count = serializers.SerializerMethodField()
    bplan_imVerfahren_count = serializers.SerializerMethodField()
    bplan_aul_count = serializers.SerializerMethodField()
    bplan_bbg_count = serializers.SerializerMethodField()
    point = serializers.SerializerMethodField()

    class Meta:
        model = Bezirk
        fields = (
            "name",
            "slug",
            "polygon",
            "ortsteile",
            "pk",
            "bplan_count",
            "bplan_festgesetzt_count",
            "bplan_imVerfahren_count",
            "bplan_aul_count",
            "bplan_bbg_count",
            "point",
        )
        geo_field = "polygon"

    def _filter_queryset(self, qs):
        filter = self.context["request"].GET.get("afs_behoer", None)
        if filter:
            return qs.filter(afs_behoer=filter)
        return qs

    def get_bplan_count(self, object):
        bplans = BPlan.objects.filter(bezirk=object)
        bplans = self._filter_queryset(bplans)
        return bplans.count()

    def get_bplan_festgesetzt_count(self, object):
        bplans = BPlan.objects.filter(bezirk=object).filter(festg=True)
        bplans = self._filter_queryset(bplans)
        return bplans.count()

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
        qs = qs.filter(aul_anfang__lte=date, aul_ende__gte=date)
        qs = self._filter_queryset(qs)
        return qs.count()

    def get_bplan_bbg_count(self, object):
        date = timezone.now().date()
        qs = BPlan.objects.filter(bezirk=object).filter(festg=False)
        qs = qs.exclude(bbg_anfang__isnull=True, bbg_ende__isnull=True)
        qs = qs.filter(bbg_anfang__lte=date, bbg_ende__gte=date)
        qs = self._filter_queryset(qs)
        return qs.count()

    def get_point(self, object):
        point = Point(object.polygon.centroid.x, object.polygon.centroid.y, srid=4326)
        return point.coords


class AddressSerializer(
    GeoFeatureModelSerializer, serializers.HyperlinkedModelSerializer
):
    bezirk_name = serializers.SerializerMethodField()

    class Meta:
        model = Address
        fields = ("strname", "hsnr", "point", "plz", "bezirk_name")
        geo_field = "point"

    def get_bezirk_name(self, obj):
        return obj.bezirk.name


class SimpleBezirkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bezirk
        fields = ("name",)


class SimpleBPlanSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    status_normkontr = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        exclude = ("multipolygon", "point")

    def get_status(self, object):
        if object.festg:
            return "festg"
        else:
            date = timezone.now().date()
            if (object.bbg_anfang and object.bbg_anfang <= date) and (
                object.bbg_ende and date <= object.bbg_ende
            ):
                return "bbg"
            elif (object.aul_anfang and object.aul_anfang <= date) and (
                object.aul_ende and date <= object.aul_ende
            ):
                return "aul"
            else:
                return "imVerfahren"

    def get_status_normkontr(self, object):
        if object.normkontr == "unwirksam" or object.normkontr == "nichtig":
            return "unwirksam"
        elif object.normkontr == "teilunwirksam" or object.normkontr == "teilnichtig":
            return "teilunwirksam"
        return ""


class BPlanPointSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()
    status_normkontr = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        id_field = False
        geo_field = "point"
        fields = ("point", "status", "pk", "bezirk")


class BPlanMultipolygonSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()
    status_normkontr = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        id_field = False
        geo_field = "multipolygon"
        fields = ("multipolygon", "bplanID", "status", "pk")


class BPlanSerializer(SimpleBPlanSerializer, GeoFeatureModelSerializer):
    status = serializers.SerializerMethodField()
    status_normkontr = serializers.SerializerMethodField()

    class Meta:
        model = BPlan
        fields = "__all__"
        id_field = False
        geo_field = "multipolygon"
