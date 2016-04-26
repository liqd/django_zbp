from django.views.generic.detail import DetailView
from .models import Bezirk
from .forms import LoginForm
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth import logout
from django.shortcuts import render
from django.shortcuts import Http404
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from django.shortcuts import get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
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


def login_user(request):
    form = LoginForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.login(request)
            if user:
                login(request, user)
                if request.GET.get('next'):
                    # Redirect to a success page.
                    return HttpResponseRedirect(request.GET.get('next'))
                else:
                    return HttpResponseRedirect('/downloads/')
    return render(request, 'login.html', {'form': form})


def logout_user(request):
    logout(request)
    return render_to_response('logout.html', context_instance=RequestContext(request))


@login_required
def downloads(request):
    return render_to_response('downloads.html', context_instance=RequestContext(request))
