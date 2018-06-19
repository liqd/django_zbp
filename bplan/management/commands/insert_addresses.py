'''
With this you can import addresses provided by the fis broker: https://fbinter.stadt-berlin.de/
The supported data type is named "INSPIRE GML". It is XML based,
to parse this you will need about 16GB of RAM for all addresses in Berlin.

To download it go to: https://fbinter.stadt-berlin.de/fb/index.jsp
Then click on "Adressen im INSPIRE-Datenmodell"
Then click on "Downloaddienst (ATOM)"
Then you get a zip file: http://fbarc.stadt-berlin.de/FIS_Broker_Atom/AD/AD_AdressenBerlin.zip
Here you may find your .gml file with all addresses of Berlin
'''

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


def create_tag_text_collector(tag, multiple=False):
    class Collector(BaseCollect):

        if multiple:

            def get_default_entry_data(self):
                return []

        def begin_tag(self, elem):

            if not elem.tag.lower().endswith('}%s' % tag):
                return

            if not elem.text:
                return

            text = elem.text.strip('\n\t\r')
            if not text:
                return

            if multiple:
                self.entry_data.append(text)
            else:
                self.entry_data = text

    return Collector


def parse_fis_broker_address_file(file):

    PostalCodeCollector = create_tag_text_collector('postcode')
    PositionCollector = create_tag_text_collector('pos')
    StreetNumberCollector = create_tag_text_collector(
        'designator', multiple=True)
    TextCollector = create_tag_text_collector('text')

    collectors = {
        'address': [
            PositionCollector('positions'),
            StreetNumberCollector('street_numbers'),
            ComponentsCollector('components')
        ],
        'thoroughfarename': [TextCollector('street_names')],
        'adminunitname': [TextCollector('names')],
        'postaldescriptor': [PostalCodeCollector('postal_codes')],
    }

    catch_tag = False
    collecting = []
    for event, elem in tqdm(
            etree.iterparse(
                file, events=('start', 'end', 'start-ns', 'end-ns'))):
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
    parsed = parse_fis_broker_address_file(gml_file)

    def getiter():
        for comp_key, comp_values in parsed['components'].items():
            all_keys = [comp_key] + comp_values

            entry = {}
            for part in parsed.keys():
                values = get_all(parsed[part], all_keys)
                if not values:
                    print('Unknown reference in: {}, tried keys {}'.format(
                        part, all_keys))
                    continue
                entry[part] = values

            yield comp_key, entry

    return len(parsed['components']), getiter()


class Command(BaseCommand):

    help = 'Import addresses in the inspire gml format'

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
        print('Parsing xml file ...')
        total, streets = get_streets(gml_file)
        print('Inserting into database ...')
        for (gml_id, street) in tqdm(streets, total=total):
            values = {}

            #print('Inserting {} ...'.format(gml_id))

            # I think that is an error in the xml parsing library
            if not street['positions'][0]:
                print('Could not get position for {}'.format(gml_id))
                continue

            a, b = street['positions'][0].split()
            values['point'] = Point(float(a), float(b))
            values['strname'] = street['street_names'][0]
            values['hsnr'] = ''.join(street['street_numbers'][0])
            values['search_name'] = self._get_search_name(
                values['strname'], values['hsnr'])
            values['plz'] = street['postal_codes'][0]

            bezirk_name = street['names'][-1]
            values['bezirk'] = Bezirk.objects.get(name=bezirk_name)
            values['gml_id'] = gml_id

            addr, created = Address.objects.update_or_create(
                gml_id=gml_id, defaults=values)
            action = 'created' if created else 'updated'
            #print('{}: {}'.format(action.capitalize(), addr))
