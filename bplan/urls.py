from django.urls import include
from django.urls import path
from django.urls import re_path
from django.views.generic.base import RedirectView
from rest_framework import routers

from . import views
from .api import AddressViewSet
from .api import BezirkViewSet
from .api import BPlanDataViewSet
from .api import BPlanMultipolygonViewSet
from .api import BPlanPointViewSet
from .api import BPlanViewSet
from .api import OrtsteilViewSet

router = routers.DefaultRouter()
router.register(r"addresses", AddressViewSet, basename="addresse")
router.register(r"bezirke", BezirkViewSet, basename="bezirk")
router.register(r"ortsteile", OrtsteilViewSet, basename="ortsteil")
router.register(r"bplan/points", BPlanPointViewSet, basename="bplan_points")
router.register(
    r"bplan/multipolygons", BPlanMultipolygonViewSet, basename="bplan_multipoligon"
)
router.register(r"bplan/data", BPlanDataViewSet, basename="bplan_data")
router.register(r"bplan", BPlanViewSet, basename="bplan_all")

urlpatterns = [
    path("api/", include(router.urls)),
    path(
        "berlin/",
        views.StadtView.as_view(template_name="bplan/berlin.html"),
        name="berlin",
    ),
    re_path(
        r"^berlin/(?P<slug>[a-z\-]+)/", views.BezirkDetailView.as_view(), name="bezirk"
    ),
    path("login/", views.login_user, name="login"),
    path("logout/", views.logout_user, name="logout"),
    path("downloads/", views.downloads, name="downloads"),
    path("", RedirectView.as_view(pattern_name="berlin"), name="index"),
]
