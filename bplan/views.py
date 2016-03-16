from django.shortcuts import render
from django.views.generic.detail import DetailView
from .models import Bezirk

class BezirkDetailView(DetailView):

	model = Bezirk


