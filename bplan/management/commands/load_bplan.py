# This Python file uses the following encoding: utf-8

import os, json, math
import dateutil.parser

from tqdm import tqdm


from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import MultiPolygon
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from django.contrib.gis.db import models

from bplan.models import Bezirk
from bplan.models import BPlan
from bplan.models import Ortsteil


def getPseudoCentroid(multipolygon):
    k = 0
    half = len(multipolygon[0][0])/2

    while k + 1 < half:
        try:
            a = multipolygon[0][0][k]
            b = multipolygon[0][0][k+1]
            c = multipolygon[0][0][int(half)+k]
            d = multipolygon[0][0][int(half)+k+1]
            quadrangle = Polygon((a,b,c,d,a))
            e = Point(quadrangle.centroid.x, quadrangle.centroid.y)
            if e.within(multipolygon[0]):
                return e
            else:
                k += 1
        except:
            k += 1

    # print ("Never found a pseudocentroid, there were " + str(len(multipolygon[0][0])) + " corners.")
    return Point(multipolygon[0][0][0])



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

            # check whether point is within the first polygon
            try:
                if not point.within(multipolygon[0]):
                    point = getPseudoCentroid(multipolygon)
                else:
                    pass
            except:
                pass

            # calculate the Ortsteile in which the bplan is located
            try:
                ortsteile = Ortsteil.objects.filter(polygon__intersects=geometry)
            except:
                pass

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
                bbg_anfang = dateutil.parser.parse(feature.get("bbg_anfang"))
            except Exception as e:
                bbg_anfang = None

            try:
                bbg_ende = dateutil.parser.parse(feature.get("bbg_ende"))
            except Exception as e:
                bbg_ende = None

            try:
                aul_anfang = dateutil.parser.parse(feature.get("aul_anfang"))
            except Exception as e:
                aul_anfang = None

            try:
                aul_ende = dateutil.parser.parse(feature.get("aul_ende"))
            except Exception as e:
                aul_ende = None

            www = feature.get("ausleg_www")
            if www:
                ausleg_www = www.split('"')[1]
            else:
                ausleg_www = None


            scan = feature.get("scan_www")
            if scan:
                scan_www = scan.split('"')[1]
            else:
                scan_www = None

            grund = feature.get("grund_www")
            if grund:
                grund_www = grund.split('"')[1]
                # print(grund_www)
            else:
                grund_www = None

            try:
                gml_id = feature.get("gml_id")
            except Exception as e:
                gml_id = None

            try:
                fsg_gvbl_n = feature.get("fsg_gvbl_n")
            except Exception as e:
                fsg_gvbl_n = None

            try:
                fsg_gvbl_s = feature.get("fsg_gvbl_s")
            except Exception as e:
                fsg_gvbl_s = None

            try:
                fsg_gvbl_d = dateutil.parser.parse(feature.get("fsg_gvbl_d"))
            except Exception as e:
                fsg_gvbl_d = None

            try:
                normkontr = feature.get("normkontr")
            except Exception as e:
                normkontr = None



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
                    festsg_am = festsg_am,
                    bbg_anfang = bbg_anfang,
                    bbg_ende = bbg_ende,
                    aul_anfang = aul_anfang,
                    aul_ende = aul_ende,
                    ausleg_www = ausleg_www,
                    scan_www = scan_www,
                    grund_www = grund_www,
                    gml_id = gml_id,
                    fsg_gvbl_n = fsg_gvbl_n,
                    fsg_gvbl_s = fsg_gvbl_s,
                    fsg_gvbl_d = fsg_gvbl_d,
                    normkontr = normkontr
                    )
                bplan.save()
                for ortsteil in ortsteile:
                    bplan.ortsteile.add(ortsteil)
                # print(bplan.ortsteile.all())
                print(str(bplan) + " ERSTELLT")
            except Exception as e:
                # print(e)
                pass

