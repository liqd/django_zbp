from django.shortcuts import render
from django.views.generic.detail import DetailView
from .models import Bezirk
from django.views.generic import TemplateView
from django.views.decorators.clickjacking import xframe_options_exempt


class BezirkDetailView(DetailView):

    model = Bezirk

    @xframe_options_exempt
    def dispatch(self, *args, **kwargs):
        return super(BezirkDetailView, self).dispatch(*args, **kwargs)


class StadtView(TemplateView):

    @xframe_options_exempt
    def dispatch(self, *args, **kwargs):
        return super(StadtView, self).dispatch(*args, **kwargs)
