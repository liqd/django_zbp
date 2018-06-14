import os
import json

from tqdm import tqdm

from django.utils.text import slugify
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry

from bplan.models import Bezirk


class Command(BaseCommand):
    def _download_geodata(self, filename, url, layer):
        call = 'ogr2ogr -s_srs EPSG:25833'\
            ' -t_srs WGS84 -f'\
            ' geoJSON %s WFS:"%s%s" %s' % (
               filename,
               url,
               '?version=1.1.0' if settings.GDAL_LEGACY else '',
               layer)
        try:
            os.remove(filename)
        except:
            pass

        result = os.system(call)
        if result != 0:
            raise Exception("Could not download data")

    def handle(self, *args, **options):

        fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures',
                                    'addresses')

        if not os.path.exists(fixtures_dir):
            os.makedirs(fixtures_dir)

        min_x = 369000
        max_x = 417000

        min_y = 5799000
        max_y = 5840000

        x = min_x
        y = min_y

        filenumber = 1

        url = 'http://fbinter.stadt-berlin.de/fb/'\
            'wfs/geometry/senstadt/re_rbsadressen'

        while x < max_x:
            new_x = x + 10000
            while y < max_y:
                new_y = y + 10000
                bbox = str(x) + ',' + str(y) + ',' + \
                    str(new_x) + ',' + str(new_y)
                fixture_file = os.path.join(
                    fixtures_dir, 'addresses' + str(filenumber) + '.geojson')
                download_url = url + '?BBOX=' + bbox
                self._download_geodata(fixture_file, download_url,
                                       're_rbsadressen')
                filenumber = filenumber + 1
                y = new_y
            y = min_y
            x = new_x
