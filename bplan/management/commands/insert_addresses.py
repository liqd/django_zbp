import os
import json

from tqdm import tqdm

from django.utils.text import slugify
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import Point

from bplan.models import Address
from bplan.models import Bezirk


class Command(BaseCommand):

    def _get_bezirk(self, point):
        bezirk = Bezirk.objects.get(
            polygon__intersects=point)
        return bezirk

    def _get_search_name(self, strname, hsnr):
        strname = strname.replace(' ', '').replace('-', '').replace('ß', 'ss')
        if strname[-3:] == 'str':
            strname += "asse"
        elif strname[-4:] == 'str.':
            strname = strname[:-1] + "asse"
        hsnr = hsnr.lstrip('0')
        return (strname+hsnr).lower()

    def add_arguments(self, parser):

        parser.add_argument('--fromFixtures',
                            action='store_true',
                            dest='fromFixtures',
                            default=False,
                            help='Load data from fixtures')

    def handle(self, *args, **options):

        if options['fromFixtures']:
            fixtures_dir = os.path.join(
                settings.BASE_DIR, 'bplan', 'fixtures')
        else:
            fixtures_dir = os.path.join(
                settings.BASE_DIR, 'bplan', 'fixtures', 'addresses')

        filelist = os.listdir(fixtures_dir)

        for file in filelist:

            filepath = os.path.join(fixtures_dir, file)

            if not os.path.isdir(filepath) and file.startswith('addresses'):

                data_source = DataSource(filepath)

                for feature in tqdm(data_source[0]):
                    try:
                        point = GEOSGeometry(str(feature.geom), srid=4326)
                        strname = feature.get("strname")
                        hsnr = (feature.get("hsnr")).lstrip('0')
                        search_name = self._get_search_name(strname, hsnr)
                        plz = feature.get("plz")
                        gml_id = feature.get("gml_id")
                        spatial_name = feature.get("spatial_name")
                        bezirk = self._get_bezirk(point)

                        address, created = Address.objects.get_or_create(
                            point=point,
                            strname=strname,
                            search_name=search_name,
                            hsnr=hsnr,
                            plz=plz,
                            gml_id=gml_id,
                            spatial_name=spatial_name,
                            bezirk=bezirk)
                    except Exception as e:
                        print(strname + ' ' + hsnr)
                        print(e)