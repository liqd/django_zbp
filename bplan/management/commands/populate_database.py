from os.path import dirname
import os
import sys
import subprocess

from django.core.management.base import BaseCommand
from django.core.management import call_command

SHELL_SCRIPT = '''
set -ex

python ./manage.py load_bezirke
python ./manage.py load_ortsteile
python ./manage.py load_bplan

tmp=$(mktemp -d)
cd "$tmp"
wget http://fbarc.stadt-berlin.de/FIS_Broker_Atom/AD/AD_AdressenBerlin.zip
unzip *.zip
cd -

python ./manage.py insert_addresses $tmp/*.gml
python ./manage.py insert_numberless_addresses
'''


class Command(BaseCommand):
    def handle(self, *args, **options):

        bin = dirname(sys.executable)
        os.environ['PATH'] = '{}:{}'.format(bin, os.environ['PATH'])
        p = subprocess.Popen(['sh'], stdin=subprocess.PIPE)
        p.stdin.write((SHELL_SCRIPT + '\n').encode())
        p.stdin.close()
        assert not p.wait(), 'script returned non exit status code'
