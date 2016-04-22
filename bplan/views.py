from django.shortcuts import render
from django.views.generic.detail import DetailView
from .models import Bezirk
from .forms import LoginForm
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render
from django.shortcuts import Http404,render_to_response,redirect,render,get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect,HttpResponse
from django.contrib.auth.decorators import login_required


class BezirkDetailView(DetailView):
    model = Bezirk


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
