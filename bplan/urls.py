from django.views.generic.base import RedirectView
from django.conf.urls import url, include
from rest_framework import routers
from .api import BezirkViewSet
from .api import OrtsteilViewSet
from .api import BPlanPointViewSet
from .api import BPlanMultipolygonViewSet
from .api import BPlanDataViewSet
from .api import AddressViewSet
from . import views


router = routers.DefaultRouter()
router.register(r'bezirke', BezirkViewSet, base_name='bezirk')
router.register(r'ortsteile', OrtsteilViewSet, base_name='ortsteil')
router.register(r'bplaene_point', BPlanPointViewSet, base_name='bplan')
router.register(r'bplaene_multipolygon',
                BPlanMultipolygonViewSet, base_name='bplan_multipoligon')
router.register(r'bplaene_data', BPlanDataViewSet, base_name='bplan_data')
router.register(r'addresses', AddressViewSet, base_name='addresse')


urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^berlin/$',
        views.StadtView.as_view(template_name="bplan/berlin.html"), name='berlin'),
    url(r'^berlin/(?P<slug>[a-z\-]+)/',
        views.BezirkDetailView.as_view(), name='bezirk'),
    url(r'^login/', views.login_user, name='login'),
    url(r'^logout/', views.logout_user, name='logout'),
    url(r'^downloads/', views.downloads, name='downloads'),
    url(r'^$', RedirectView.as_view(pattern_name='berlin'), name='index')
]
