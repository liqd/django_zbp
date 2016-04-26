from django.conf.urls import url, include
from rest_framework import routers
from .api import BezirkViewSet
from .api import OrtsteilViewSet
from .api import BPlanPointViewSet
from .api import BPlanMultipolygonViewSet
from .api import BPlanDataViewSet
from .views import BezirkDetailView
from .views import StadtView


router = routers.DefaultRouter()
router.register(r'bezirke', BezirkViewSet, base_name='bezirk')
router.register(r'ortsteile', OrtsteilViewSet, base_name='ortsteil')
router.register(r'bplaene_point', BPlanPointViewSet, base_name='bplan')
router.register(r'bplaene_multipolygon',
                BPlanMultipolygonViewSet, base_name='bplan_multipoligon')
router.register(r'bplaene_data', BPlanDataViewSet, base_name='bplan_data')


urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^berlin/$',
        StadtView.as_view(template_name="bplan/berlin.html"), name='berlin'),
    url(r'^berlin/(?P<slug>[a-z\-]+)/',
        BezirkDetailView.as_view(), name='bezirk'),
    # user login
    url(r'^accounts/login/', 'bplan.views.login_user'),
    url(r'^logout/', 'bplan.views.logout_user'),
    url(r'^downloads/', 'bplan.views.downloads')
]
