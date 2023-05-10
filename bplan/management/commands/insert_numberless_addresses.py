import json
import os

from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import Point
from django.core.management.base import BaseCommand
from django.db.models import Min
from django.utils.text import slugify
from tqdm import tqdm

from bplan.models import Address
from bplan.models import Bezirk


class Command(BaseCommand):
    def _get_bezirk(self, point):
        bezirk = Bezirk.objects.get(polygon__intersects=point)
        return bezirk

    def _get_int(self, string):
        while not string[-1].isdigit():
            string = string[0:-1]
        return int(string)

    def _get_search_name(self, strname, hsnr):
        strname = strname.replace(" ", "").replace("-", "").replace("ß", "ss")
        if strname[-3:] == "str":
            strname += "asse"
        elif strname[-4:] == "str.":
            strname = strname[:-1] + "asse"
        return (strname + hsnr).lower()

    def _get_string(self, string):
        while string[-1].isdigit():
            string = string[0:-1]
        return string

    def handle(self, *args, **options):
        qs = Address.objects.all()
        streets = qs.values("strname", "plz").order_by().annotate(Min("hsnr"))

        for street in streets:
            base_address = Address.objects.filter(
                strname=street["strname"], plz=street["plz"], hsnr=street["hsnr__min"]
            ).first()

            search_name = self._get_search_name(
                self._get_string(base_address.strname), ""
            ).rstrip(" ")
            new_address, created = Address.objects.get_or_create(
                point=base_address.point,
                strname=base_address.strname,
                search_name=search_name,
                hsnr="",
                plz=base_address.plz,
                gml_id=base_address.gml_id + "_no_hsnr",
                spatial_name=base_address.spatial_name,
                bezirk=base_address.bezirk,
            )
