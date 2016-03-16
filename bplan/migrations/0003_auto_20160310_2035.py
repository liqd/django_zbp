# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-10 20:35
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bplan', '0002_auto_20160310_2011'),
    ]

    operations = [
        migrations.AddField(
            model_name='ortsteil',
            name='bezirk',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='bplan.Bezirk'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='ortsteil',
            name='polygon',
            field=django.contrib.gis.db.models.fields.PolygonField(srid=4326),
        ),
    ]
