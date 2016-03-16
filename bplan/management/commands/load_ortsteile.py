import os, json

from tqdm import tqdm

from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry

from bplan.models import Bezirk
from bplan.models import Ortsteil


class Command(BaseCommand):

    def handle(self, *args, **options):

        fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures')
        fixture_file = os.path.join(fixtures_dir, 'ortsteil.geojson')
        data_source = DataSource(fixture_file)

        for feature in tqdm(data_source[0]):
            polygon = GEOSGeometry(str(feature.geom))
            name = feature.get("spatial_alias")
            bezirk = feature.get("BEZIRK")

            bezirks_model = Bezirk.objects.get(name=bezirk)

            try:
                ortsteil = Ortsteil.objects.create(name=name, polygon=polygon, bezirk=bezirks_model)
                print(ortsteil)
            except Exception as e:
                print(e)
                print("error: " + name)
                pass