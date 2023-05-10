import os

from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from bplan.models import Bezirk


class Command(BaseCommand):
    def handle(self, *args, **options):
        fixtures_dir = os.path.join(settings.BASE_DIR, "bplan", "fixtures")
        fixture_file = os.path.join(fixtures_dir, "bezirk.geojson")
        data_source = DataSource(fixture_file)

        for feature in data_source[0]:
            polygon = GEOSGeometry(str(feature.geom), srid=4326)
            name = feature.get("spatial_alias")
            slug = slugify(
                name.replace("ö", "oe").replace("ä", "ae").replace("ü", "ue")
            )

            bezirk, created = Bezirk.objects.update_or_create(
                name=name, defaults=dict(polygon=polygon, slug=slug)
            )
            action = {True: "Created", False: "Updated"}[created]
            print("{}: {}".format(action, bezirk))
