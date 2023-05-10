from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.core.management import call_command
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.generic import TemplateView
from django.views.generic.detail import DetailView

from .forms import LoginForm
from .models import Bezirk
from .models import Download


class BezirkDetailView(DetailView):
    model = Bezirk

    @xframe_options_exempt
    def dispatch(self, *args, **kwargs):
        return super(BezirkDetailView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["afs_behoer"] = self.request.GET.get("afs_behoer", "")
        context["map_baseurl"] = settings.MAP_BASEURL
        attribution = ""
        if hasattr(settings, "MAP_ATTRIBUTION"):
            attribution = settings.MAP_ATTRIBUTION
        context["map_attribution"] = attribution
        return context


class StadtView(TemplateView):
    @xframe_options_exempt
    def dispatch(self, *args, **kwargs):
        return super(StadtView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["afs_behoer"] = self.request.GET.get("afs_behoer", "")
        context["map_baseurl"] = settings.MAP_BASEURL
        attribution = ""
        if hasattr(settings, "MAP_ATTRIBUTION"):
            attribution = settings.MAP_ATTRIBUTION
        context["map_attribution"] = attribution
        return context


def login_user(request):
    form = LoginForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.login(request)
            if user:
                login(request, user)
                if request.GET.get("next"):
                    return HttpResponseRedirect(request.GET.get("next"))
                else:
                    return HttpResponseRedirect(reverse("downloads"))
    return render(request, "login.html", {"form": form})


def logout_user(request):
    logout(request)
    return render(request, "logout.html")


@login_required
def downloads(request):
    errors = []
    if request.method == "POST":
        try:
            result = call_command("load_bplan")
        except Exception as e:
            errors.append(str(e))
            pass

    downloads = Download.objects.all().order_by("-created")[:20]

    return render(request, "downloads.html", {"downloads": downloads, "errors": errors})
