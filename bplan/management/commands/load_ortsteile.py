import os, json

from tqdm import tqdm

from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.utils.text import slugify

from bplan.models import Bezirk
from bplan.models import Ortsteil


class Command(BaseCommand):

    def handle(self, *args, **options):

        fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures')
        fixture_file = os.path.join(fixtures_dir, 'ortsteil.geojson')
        data_source = DataSource(fixture_file)

        for feature in tqdm(data_source[0]):
            polygon = GEOSGeometry(str(feature.geom), srid=4326)
            name = feature.get("spatial_alias")
            slug = slugify(name.replace('ö', 'oe').replace('ä', 'ae').replace('ü','ue'))
            bezirk = feature.get("BEZIRK")

            bezirks_model = Bezirk.objects.get(name=bezirk)

            try:
                ortsteil = Ortsteil.objects.create(name=name, slug=slug, polygon=polygon, bezirk=bezirks_model)
                print(ortsteil)
            except Exception as e:
                print(e)
                print("error: " + name)
                pass