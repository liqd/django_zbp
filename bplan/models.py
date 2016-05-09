from django.contrib.gis.db import models
from django.utils import timezone


class Download(models.Model):

    created = models.DateTimeField(editable=False)
    errors = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.created = timezone.now()
        return super(Download, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.created)


class Bezirk(models.Model):
    name = models.CharField(max_length=50)
    slug = models.CharField(max_length=50)
    polygon = models.PolygonField()

    def __str__(self):
        return self.name


class Ortsteil(models.Model):
    name = models.CharField(max_length=50)
    slug = models.CharField(max_length=50, default='')
    bezirk = models.ForeignKey(Bezirk, related_name='ortsteile')
    polygon = models.PolygonField()

    def __str__(self):
        return self.name


class Address(models.Model):
    point = models.PointField()
    strname = models.CharField(max_length=256)
    hsnr = models.CharField(max_length=50)
    search_name = models.CharField(max_length=256)
    plz = models.CharField(max_length=50)
    gml_id = models.CharField(max_length=50)
    spatial_name = models.CharField(max_length=50)
    bezirk = models.ForeignKey(Bezirk)

    def __str__(self):
        return self.strname + ' ' + self.hsnr



class BPlan(models.Model):

    bplanID = models.CharField(max_length=50)
    planname = models.CharField(max_length=50)
    spatial_alias = models.CharField(max_length=50)
    spatial_name = models.CharField(max_length=50)
    spatial_type = models.CharField(max_length=50)
    multipolygon = models.MultiPolygonField()
    point = models.PointField(blank=True, null=True)
    bereich = models.TextField()
    bezirk = models.ForeignKey(Bezirk)
    bezirk_name = models.CharField(max_length=50)
    ortsteile = models.ManyToManyField(Ortsteil)
    afs_behoer = models.CharField(max_length=256)
    afs_beschl = models.DateField(blank=True, null=True)
    afs_l_aend = models.DateField(blank=True, null=True)
    festg = models.BooleanField(default=False)
    festsg_von = models.CharField(max_length=256, blank=True, null=True)
    festsg_am = models.DateField(blank=True, null=True)
    bbg_anfang = models.DateField(db_index=True, blank=True, null=True)
    bbg_ende = models.DateField(db_index=True, blank=True, null=True)
    aul_anfang = models.DateField(db_index=True, blank=True, null=True)
    aul_ende = models.DateField(db_index=True, blank=True, null=True)
    ausleg_www = models.URLField(max_length=256, blank=True, null=True)
    scan_www = models.URLField(max_length=256, blank=True, null=True)
    grund_www = models.URLField(max_length=256, blank=True, null=True)
    gml_id = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_n = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_s = models.CharField(max_length=50, blank=True, null=True)
    fsg_gvbl_d = models.DateField(blank=True, null=True)
    normkontr = models.CharField(max_length=50, blank=True, null=True)
    download = models.ForeignKey(Download, blank=True, null=True)

    def __str__(self):
        return self.planname

    class Meta:
        index_together = [
            ["bbg_anfang", "bbg_ende"],
            ["aul_anfang", "aul_ende"]
        ]
