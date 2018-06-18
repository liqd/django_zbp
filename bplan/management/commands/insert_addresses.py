import os
import json
import xml.etree.ElementTree as etree

from tqdm import tqdm

from django.utils.text import slugify
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import Point

from bplan.models import Address
from bplan.models import Bezirk


class BaseCollect:
    def __init__(self, name):
        self.data = {}
        self.name = name

    def get_default_entry_data(self):
        return None

    def begin_entry(self, id):
        self.entry_id = id
        self.entry_data = self.get_default_entry_data()

    def end_entry(self):
        self.data[self.entry_id] = self.entry_data

    def begin_tag(self, elem):
        pass

    def end_tag(self, elem):
        pass

    def get_result(self, db):
        db[self.name] = self.data


class ComponentsCollector(BaseCollect):
    def get_default_entry_data(self):
        return []

    def begin_tag(self, elem):

        tag_name = elem.tag.split('}')[-1].lower()
        if tag_name == 'component':
            component = elem.attrib['{http://www.w3.org/1999/xlink}href']
            component = component.lstrip('#')
            self.entry_data.append(component)


def create_tag_text_collector(tag):
    class Collector(BaseCollect):
        def begin_tag(self, elem):

            if not elem.tag.lower().endswith('}%s' % tag):
                return

            if not elem.text:
                return

            text = elem.text.strip('\n\t\r')
            if not text:
                return

            self.entry_data = text

    return Collector


def parse_fis_broker_address_file(file):

    PostalCodeCollector = create_tag_text_collector('postcode')
    PositionCollector = create_tag_text_collector('pos')
    StreetNumberCollector = create_tag_text_collector('designator')
    TextCollector = create_tag_text_collector('text')

    collectors = {
        'address': [
            PositionCollector('pos'),
            StreetNumberCollector('street_number'),
            ComponentsCollector('components')
        ],
        'thoroughfarename': [TextCollector('street_names')],
        'adminunitname': [TextCollector('names')],
        'postaldescriptor': [PostalCodeCollector('postal_codes')],
    }

    catch_tag = False
    collecting = []
    for event, elem in etree.iterparse(
            file, events=('start', 'end', 'start-ns', 'end-ns')):
        if event == 'start-ns' or event == 'end-ns':
            continue

        tag_name = elem.tag.split('}')[-1].lower()

        if event == 'start' and tag_name == 'featuremember':
            catch_tag = True
            continue

        if event == 'end' and tag_name == 'featuremember':
            for coll in collecting:
                coll.end_entry()
            continue

        if event == 'start' and catch_tag:
            current_id = elem.attrib['{http://www.opengis.net/gml/3.2}id']
            collecting = collectors.get(tag_name, [])
            for coll in collecting:
                coll.begin_entry(current_id)
            catch_tag = False
            continue

        if event == 'start':
            for coll in collecting:
                coll.begin_tag(elem)

        if event == 'end':
            for coll in collecting:
                coll.end_tag(elem)

    db = {}
    for some_collectors in collectors.values():
        for collector in some_collectors:
            collector.get_result(db)

    return db


def get_all(item, keys):
    retval = []
    for key in keys:
        try:
            retval.append(item[key])
        except KeyError:
            pass
    return retval


def get_streets(gml_file):
    #parsed = parse_fis_broker_address_file(gml_file)
    #res = parse_fis_broker_address_file('data_orig.gml')
    #pprint(res)

    import pickle
    parsed = pickle.loads(open('./pick', 'rb').read())
    for comp_key, comp_values in parsed['components'].items():
        all_keys = [comp_key] + comp_values

        entry = {}
        for part in parsed.keys():
            values = get_all(parsed[part], all_keys)
            entry[part] = values

        yield entry


class Command(BaseCommand):
    def _get_bezirk(self, point):
        bezirk = Bezirk.objects.get(polygon__intersects=point)
        return bezirk

    def _get_search_name(self, strname, hsnr):
        strname = strname.replace(' ', '').replace('-', '').replace('ß', 'ss')
        if strname[-3:] == 'str':
            strname += "asse"
        elif strname[-4:] == 'str.':
            strname = strname[:-1] + "asse"
        return (strname + hsnr).lower()

    def add_arguments(self, parser):

        parser.add_argument('gml_file', help='Load data from this gml file')

    def handle(self, *args, **options):
        gml_file = options['gml_file']
        streets = get_streets(gml_file)
        for street in streets:
            print(street)

            import pdb
            pdb.set_trace()
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
