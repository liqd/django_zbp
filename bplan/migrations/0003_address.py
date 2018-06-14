# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-13 13:27
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bplan', '0002_auto_20160513_1414'),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id',
                 models.AutoField(
                     auto_created=True,
                     primary_key=True,
                     serialize=False,
                     verbose_name='ID')),
                ('point',
                 django.contrib.gis.db.models.fields.PointField(srid=4326)),
                ('strname', models.CharField(max_length=256)),
                ('hsnr', models.CharField(max_length=50)),
                ('search_name', models.CharField(max_length=256)),
                ('plz', models.CharField(max_length=50)),
                ('gml_id', models.CharField(max_length=50)),
                ('spatial_name', models.CharField(max_length=50)),
                ('bezirk',
                 models.ForeignKey(
                     on_delete=django.db.models.deletion.CASCADE,
                     to='bplan.Bezirk')),
            ],
        ),
    ]
