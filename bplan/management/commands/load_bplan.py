import os, json
import dateutil.parser

from tqdm import tqdm


from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import MultiPolygon
from django.contrib.gis.geos import Point

from bplan.models import Bezirk
from bplan.models import BPlan



class Command(BaseCommand):

    def handle(self, *args, **options):

        fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures')
        fixture_file = os.path.join(fixtures_dir, 'bplan.geojson')
        data_source = DataSource(fixture_file)

        for feature in tqdm(data_source[0]):

            # ID
            planname = feature.get("planname")
            bplanID = planname.replace(" ", "")
            spatial_alias = feature.get("spatial_alias")
            spatial_name = feature.get("spatial_name")

            # Örtliche Beschreibung
            spatial_type = feature.get("spatial_type")
            geometry = GEOSGeometry(str(feature.geom))
            if geometry.geom_type == "Polygon":
                multipolygon = MultiPolygon(geometry)
            else:
                multipolygon = geometry

            point = Point(multipolygon[0].centroid.x,multipolygon[0].centroid.y)
            bereich = feature.get("bereich")
            b = feature.get("bezirk")
            bezirk = Bezirk.objects.get(name=b)

            # Verantwortlichkeiten
            afs_behoer = feature.get("afs_behoer")

            # Im Verfahren:
            try:
                afs_beschl = dateutil.parser.parse(feature.get("afs_beschl"))
            except:
                afs_beschl = None
            try:
                afs_l_aend = dateutil.parser.parse(feature.get("afs_l_aend"))
            except:
                afs_l_aend = None

            # festgesetzte Verfahren
            try:
                f = feature.get("FESTSG")
                festg = True if f == 'ja' else False
            except:
                festg = None

            try:
                festsg_von = feature.get("festsg_von")
            except Exception as e:
                festsg_von = None

            try:
                festsg_am = dateutil.parser.parse(feature.get("festsg_am"))
            except Exception as e:
                festsg_am = None

            try:
                bplan = BPlan.objects.create(
                    bplanID = bplanID,
                    planname = planname,
                    spatial_alias = spatial_alias,
                    spatial_name = spatial_name,
                    spatial_type = spatial_type,
                    multipolygon = multipolygon,
                    point = point,
                    bereich = bereich,
                    bezirk = bezirk,
                    afs_behoer = afs_behoer,
                    afs_beschl = afs_beschl,
                    afs_l_aend = afs_l_aend,
                    festg = festg,
                    festsg_von = festsg_von,
                    festsg_am = festsg_am
                    )
                print(str(bplan) + " ERSTELLT")
            except Exception as e:
                print(e)
                pass

'''





    #  Anfangs und End der frühzeitigen Bürgerbeteiligung
    bbg_anfang = models.DateField(blank=True, null=True)
    bbg_ende = models.DateField(blank=True, null=True)

    # Anfang und Ende der öffentlichen Auslegung
    aul_anfang = models.DateField(blank=True, null=True)
    aul_ende = models.DateField(blank=True, null=True)

    # Links
    ausleg_www = models.URLField(max_length=256,blank=True, null=True)
    scan_www = models.URLField(max_length=256, blank=True, null=True)
    grund_www = models.URLField(max_length=256, blank=True, null=True)

    # Sontiges
    gml_id = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_n = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_s = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_d = models.DateField(blank=True, null=True)
    normkontr = models.CharField(max_length=50, blank=True, null=True)
    '''