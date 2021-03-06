# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-13 12:14
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bplan', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Download',
            fields=[
                ('id',
                 models.AutoField(
                     auto_created=True,
                     primary_key=True,
                     serialize=False,
                     verbose_name='ID')),
                ('created', models.DateTimeField(editable=False)),
                ('errors', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.AddField(
            model_name='bezirk',
            name='slug',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='bplan',
            name='bezirk_name',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='bplan',
            name='multipolygon_25833',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(
                srid=25833),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='bplan',
            name='ortsteile',
            field=models.ManyToManyField(to='bplan.Ortsteil'),
        ),
        migrations.AddField(
            model_name='ortsteil',
            name='slug',
            field=models.CharField(default='', max_length=50),
        ),
        migrations.AlterField(
            model_name='bplan',
            name='aul_anfang',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name='bplan',
            name='aul_ende',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name='bplan',
            name='bbg_anfang',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name='bplan',
            name='bbg_ende',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name='ortsteil',
            name='bezirk',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='ortsteile',
                to='bplan.Bezirk'),
        ),
        migrations.AddField(
            model_name='bplan',
            name='download',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to='bplan.Download'),
        ),
        migrations.AlterIndexTogether(
            name='bplan',
            index_together=set([('bbg_anfang', 'bbg_ende'), ('aul_anfang',
                                                             'aul_ende')]),
        ),
    ]
