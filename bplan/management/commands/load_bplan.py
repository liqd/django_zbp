import copy
import os
from operator import itemgetter

from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.gdal.error import GDALException
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import MultiPolygon
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from django.core.management.base import BaseCommand
from tqdm import tqdm

from bplan.models import BPlan
from bplan.models import Bezirk
from bplan.models import Download
from bplan.models import Ortsteil


class Command(BaseCommand):
    def __init__(self, stdout=None, stderr=None, no_color=False, force_color=False):
        super().__init__(stdout, stderr, no_color, force_color)
        self.planname = ""
        self.debug = False

    def _check_freedom(self, point, points):
        for k in range(len(points)):
            if point.distance(points[k][1]) < 0.0001:
                if self.debug:
                    print("Centers of " + self.planname + " and " + points[k][0] + " are too close")
                return False
        return True

    def _check_inclusion_and_freedom(self, multipolygon, point, points):
        # we currently assume all multipolygons to actually be plain polygons
        point_in_polygon = point.within(multipolygon[0])
        if point_in_polygon:
            point_is_free = self._check_freedom(point, points)
            if point_is_free:
                return True
        return False

    def _get_bounds(self, multipolygon):
        # we currently assume all multipolygons to actually be plain polygons
        min_x = sorted(multipolygon[0][0], key=itemgetter(0))[0][0]
        max_x = sorted(multipolygon[0][0], key=itemgetter(0), reverse=True)[0][0]
        min_y = sorted(multipolygon[0][0], key=itemgetter(1))[0][1]
        max_y = sorted(multipolygon[0][0], key=itemgetter(1), reverse=True)[0][1]
        bounds = [min_x, max_x, min_y, max_y]
        if self.debug:
            print("Bounds of " + self.planname + ":")
            print(bounds)
        return bounds

    def _get_next_pseudocentroid(self, k, half, multipolygon):
        a = multipolygon[0][0][k]
        b = multipolygon[0][0][k + 1]
        c = multipolygon[0][0][half + k]
        d = multipolygon[0][0][half + k + 1]
        quadrangle = Polygon((a, b, c, d, a))
        return Point(quadrangle.centroid.x, quadrangle.centroid.y, srid=4326)

    def _get_next_centers(self, k, bounds):
        centers = []
        d_x = bounds[1] - bounds[0]
        d_y = bounds[3] - bounds[2]
        for i in range(0, k - 1):
            centers.append(
                Point(
                    bounds[0] + (2 * i + 1) * d_x / (2 * k),
                    bounds[2] + (2 * i + 1) * d_y / (2 * k),
                    srid=4326))
        return centers

    def _calculate_point(self, multipolygon, points):
        # Try three different methods for getting a unique, central point within the bplan polygon:
        # 1. the centroid
        point = Point(
            multipolygon[0].centroid.x,
            multipolygon[0].centroid.y,
            srid=4326)
        if self._check_inclusion_and_freedom(multipolygon, point, points):
            if self.debug:
                print("Found point for bplan: " + self.planname + " using method: centroid")
            return point
        else:
            k = 0
            half = int(len(multipolygon[0][0]) / 2)
            while k + 1 < half:
                # 2. a "pseudo-centroid", i.e. the centroid of a simplified polygon
                new_point = self._get_next_pseudocentroid(
                    k, half, multipolygon)
                if self._check_inclusion_and_freedom(multipolygon, new_point, points):
                    if self.debug:
                        print("Found point for bplan: " + self.planname + " using method: pseudo-centroid")
                    return new_point
                else:
                    k += 1
            k = 2
            bounds = self._get_bounds(multipolygon)
            while k < 10:
                # 3. a "tile center", i.e. the center of a diagonal tile in k^2 square tiles
                new_points = self._get_next_centers(k, bounds)
                for new_point in new_points:
                    if self._check_inclusion_and_freedom(multipolygon, new_point, points):
                        if self.debug:
                            print("Found point for bplan: " + self.planname + " using method: tile center")
                        return new_point
                k += 1
        if self.debug:
            print("Failed to find a suitable point for bplan: " + self.planname + " , using fallback")
        return Point(multipolygon[0][0][0], srid=4326)

    def _download_geodata(self, filename, url, layer):
        call = 'ogr2ogr -s_srs EPSG:25833' \
               ' -t_srs WGS84 -f' \
               ' geoJSON %s WFS:"%s%s" %s' % (
                   filename, url,
                   '?version=1.1.0' if settings.GDAL_LEGACY else '',
                   layer)

        try:
            os.remove(filename)
        except FileNotFoundError:
            pass

        result = os.system(call)
        if result != 0:
            raise Exception("Could not download data")

    def _get_identifier(self, feature):
        planname = feature.get("PLANNAME")
        return planname

    def _get_spatial_data(self, feature):
        geometry = GEOSGeometry(str(feature.geom), srid=4326)
        bereich = feature.get("BEREICH")

        if geometry.geom_type == "GeometryCollection":
            num_polygons = 0
            new_geometry = None
            for geom in geometry:
                if geom.geom_type == "Polygon" or geom.geom_type == "MultiPolygon":
                    new_geometry = GEOSGeometry(geom)
                    num_polygons += 1
            if num_polygons == 0:
                print("No Polygons found in GeometryCollection, discarding "
                      "BPLAN " + feature.get("PLANNAME"))
                return
            elif num_polygons > 1:
                print(
                    "Multiple Polygons found in GeometryColleection for BPLAN " + feature.get(
                        "PLANNAME") + " - only using the last")
            geometry = new_geometry
        if geometry.geom_type == "Polygon":
            multipolygon = MultiPolygon(geometry, srid=4326)
        else:
            multipolygon = geometry

        multipolygon_25833 = copy.deepcopy(multipolygon)
        multipolygon_25833.transform(25833)
        return (multipolygon, multipolygon_25833, geometry,
                bereich)

    def _get_district(self, feature):
        b = feature.get("BEZIRK")
        bezirk = Bezirk.objects.get(name=b)
        bezirk_name = bezirk.name
        return bezirk, bezirk_name

    def _get_ortsteile(self, geometry):
        ortsteile = Ortsteil.objects.filter(polygon__intersects=geometry)
        return ortsteile

    def _get_imVerfahren_data(self, feature):
        try:
            afs_beschl = feature.get("AFS_BESCHL").date
        except AttributeError:
            afs_beschl = None
        try:
            afs_l_aend = feature.get("AFS_L_AEND").date
        except AttributeError:
            afs_l_aend = None
        return afs_beschl, afs_l_aend

    def _get_festg_data(self, feature):
        try:
            f = feature.get("FESTSG")
            festg = True if f == 'ja' else False
        except AttributeError:
            festg = None
        try:
            festsg_von = feature.get("FESTSG_VON")
        except AttributeError:
            festsg_von = None
        try:
            festsg_am = feature.get("FESTSG_AM").date
        except AttributeError:
            festsg_am = None
        return festg, festsg_von, festsg_am

    def _get_participation_data(self, feature):
        try:
            bbg_anfang = feature.get("BBG_ANFANG").date
        except AttributeError:
            bbg_anfang = None
        try:
            bbg_ende = feature.get("BBG_ENDE").date
        except AttributeError:
            bbg_ende = None
        try:
            aul_anfang = feature.get("AUL_ANFANG").date
        except AttributeError:
            aul_anfang = None
        try:
            aul_ende = feature.get("AUL_ENDE").date
        except AttributeError:
            aul_ende = None
        return bbg_anfang, bbg_ende, aul_anfang, aul_ende

    def _get_www_data(self, feature):

        ausleg_www = None
        scan_www = None
        grund_www = None

        try:
            www = feature.get("AUSLEG_WWW")
            if www:
                ausleg_www = www
        except AttributeError:
            pass

        try:
            scan = feature.get("SCAN_WWW")
            if scan:
                scan_www = scan
        except AttributeError:
            pass

        try:
            grund = feature.get("GRUND_WWW")
            if grund:
                grund_www = grund
        except AttributeError:
            pass

        return ausleg_www, scan_www, grund_www

    def _get_other_data(self, feature):
        gml_id = feature.get("gml_id")
        fsg_gvbl_n = feature.get("FSG_GVBL_N")
        fsg_gvbl_s = feature.get("FSG_GVBL_S")
        try:
            fsg_gvbl_d = feature.get("FSG_GVBL_D").date
        except AttributeError:
            fsg_gvbl_d = None
        normkontr = feature.get("NORMKONTR")
        return gml_id, fsg_gvbl_n, fsg_gvbl_s, fsg_gvbl_d, normkontr

    def add_arguments(self, parser):

        parser.add_argument(
            '--fromFixtures',
            action='store_true',
            dest='fromFixtures',
            default=False,
            help='Load data from fixtures')

        parser.add_argument(
            '--debug',
            action='store_true',
            dest='debug',
            default=False,
            help='Print detailed info about plans')

    def handle(self, *args, **options):

        url = 'http://fbinter.stadt-berlin.de/fb/' \
              'wfs/data/senstadt/sach_bplan'

        if options['debug']:
            self.debug = True
        if options['fromFixtures']:
            fixtures_dir = os.path.join(settings.BASE_DIR, 'bplan', 'fixtures')
            fixture_file = os.path.join(fixtures_dir, 'bplan.geojson')
            data_source = DataSource(fixture_file)
        else:
            self._download_geodata('/tmp/sach_bplan.json', url,
                                   'fis:sach_bplan')
            data_source = DataSource('/tmp/sach_bplan.json')

        download = Download.objects.create()

        if data_source:
            BPlan.objects.all().delete()

        errors = []
        points = []
        plannames = []

        for feature in tqdm(
                data_source[0], disable=(int(options['verbosity']) < 1)):

            geometry = None
            try:
                geometry = feature.geom
            except GDALException:
                pass

            if geometry:
                self.planname = self._get_identifier(feature)
                if self.debug and self.planname in plannames:
                    print("warning: duplicate bplan: " + self.planname)
                plannames.append(self.planname)
                bplan_id = self.planname.replace(" ", "").lower()
                multipolygon, multipolygon_25833, geometry, bereich = self._get_spatial_data(
                    feature)
                point = self._calculate_point(multipolygon, points)
                points.append((self.planname, point))
                ortsteile = self._get_ortsteile(geometry)
                afs_behoer = feature.get("AFS_BEHOER")
                afs_beschl, afs_l_aend = self._get_imVerfahren_data(feature)
                festg, festsg_von, festsg_am = self._get_festg_data(feature)
                bbg_anfang, bbg_ende, aul_anfang, aul_ende = self._get_participation_data(
                    feature)
                ausleg_www, scan_www, grund_www = self._get_www_data(feature)
                gml_id, fsg_gvbl_n, fsg_gvbl_s, fsg_gvbl_d, normkontr = self._get_other_data(
                    feature)

                try:
                    bezirk, bezirk_name = self._get_district(feature)
                    bplan, created = BPlan.objects.update_or_create(
                        bplanID=bplan_id,
                        defaults={
                            'planname': self.planname,
                            'multipolygon': multipolygon,
                            'multipolygon_25833': multipolygon_25833,
                            'point': point,
                            'bereich': bereich,
                            'bezirk': bezirk,
                            'bezirk_name': bezirk_name,
                            'afs_behoer': afs_behoer,
                            'afs_beschl': afs_beschl,
                            'afs_l_aend': afs_l_aend,
                            'festg': festg,
                            'festsg_von': festsg_von,
                            'festsg_am': festsg_am,
                            'bbg_anfang': bbg_anfang,
                            'bbg_ende': bbg_ende,
                            'aul_anfang': aul_anfang,
                            'aul_ende': aul_ende,
                            'ausleg_www': ausleg_www,
                            'scan_www': scan_www,
                            'grund_www': grund_www,
                            'gml_id': gml_id,
                            'fsg_gvbl_n': fsg_gvbl_n,
                            'fsg_gvbl_s': fsg_gvbl_s,
                            'fsg_gvbl_d': fsg_gvbl_d,
                            'normkontr': normkontr
                        })
                    bplan.save()
                    for ortsteil in ortsteile:
                        bplan.ortsteile.add(ortsteil)
                    if created:
                        bplan.download = download
                        bplan.save()
                except Exception as e:
                    new_error = "Bplan " + self.planname + ": " + str(e)
                    errors.append(new_error)
                    pass

        download.errors = errors
        download.save()
