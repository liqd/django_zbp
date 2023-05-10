import os
import subprocess
import sys
from os.path import dirname

from django.core.management import call_command
from django.core.management.base import BaseCommand

SHELL_SCRIPT = """
set -ex

python ./manage.py load_bezirke
python ./manage.py load_ortsteile
python ./manage.py load_bplan

tmp=$(mktemp -d)
cd "$tmp"
wget https://fbinter.stadt-berlin.de/fb/atom/AD/AD_AdressenBerlin.zip
unzip *.zip
cd -

python ./manage.py insert_addresses $tmp/*.gml
python ./manage.py insert_numberless_addresses
"""


class Command(BaseCommand):
    def handle(self, *args, **options):
        bin = dirname(sys.executable)
        os.environ["PATH"] = "{}:{}".format(bin, os.environ["PATH"])
        p = subprocess.Popen(["sh"], stdin=subprocess.PIPE)
        p.stdin.write((SHELL_SCRIPT + "\n").encode())
        p.stdin.close()
        assert not p.wait(), "script returned non exit status code"
