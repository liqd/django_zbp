import os, json

from tqdm import tqdm

from django.utils.text import slugify
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import Point

from bplan.models import Bezirk


class Command(BaseCommand):


    def handle(self, *args, **options):

        fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures', 'adresses')
        filelist = os.listdir(fixtures_dir)

        for file in filelist:

            fixture_file = os.path.join(fixtures_dir, file)
            data_source = DataSource(fixture_file)


            for feature in tqdm(data_source[0]):
                geometry = GEOSGeometry(str(feature.geom))
                