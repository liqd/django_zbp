# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-11 12:45
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bplan', '0011_auto_20160511_1445'),
    ]

    operations = [
        migrations.RunSQL("UPDATE bplan_bplan SET point = ST_Transform(point,25833);"),
        migrations.RunSQL("UPDATE bplan_bplan SET multipolygon = ST_Transform(multipolygon,25833);"),
        migrations.RunSQL("UPDATE bplan_address SET point = ST_Transform(point,25833);"),
        migrations.RunSQL("UPDATE bplan_bezirk SET polygon = ST_Transform(polygon,25833);"),
        migrations.RunSQL("UPDATE bplan_ortsteil SET polygon = ST_Transform(polygon,25833);"),
    ]
