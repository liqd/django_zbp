from django.conf.urls import url, include
from django.views.generic import TemplateView
from rest_framework import routers
from .api import BezirkViewSet
from .api import OrtsteilViewSet
from .views import BezirkDetailView

router = routers.DefaultRouter()
router.register(r'bezirke', BezirkViewSet, base_name='bezirk')
router.register(r'ortsteile', OrtsteilViewSet, base_name='ortsteil')

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^berlin/$', TemplateView.as_view(template_name="bplan/berlin.html"), name='berlin'),
    url(r'^berlin/(?P<slug>[a-z\-]+)/', BezirkDetailView.as_view(), name='bezirk')
]