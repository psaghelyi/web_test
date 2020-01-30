from django.shortcuts import render
import time

# Create your views here.
from django.http import HttpResponse


def homePageView(request):
    time.sleep(0.01)
    return HttpResponse('Hello, World!')