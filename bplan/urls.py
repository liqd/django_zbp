from django.conf.urls import url, include
from django.views.generic import TemplateView
from rest_framework import routers
from .api import BezirkViewSet
from .api import OrtsteilViewSet
from .api import BPlanViewSet
from .api import SimpleBPlanViewSet
from .views import BezirkDetailView

router = routers.DefaultRouter()
router.register(r'bezirke', BezirkViewSet, base_name='bezirk')
router.register(r'ortsteile', OrtsteilViewSet, base_name='ortsteil')
router.register(r'bplaene', BPlanViewSet, base_name='bplan')
router.register(r'bplaene_simple', SimpleBPlanViewSet, base_name='bplan')


urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^berlin/$',
        TemplateView.as_view(template_name="bplan/berlin.html"), name='berlin'),
    url(r'^berlin/(?P<slug>[a-z\-]+)/',
        BezirkDetailView.as_view(), name='bezirk')
]
