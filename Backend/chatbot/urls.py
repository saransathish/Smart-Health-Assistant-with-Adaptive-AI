from django.urls import path
from . import views

urlpatterns = [
    # path('chat/', views.chatbot, name='chatbot'),
    path('chat/', views.Chatbot.as_view(), name='chatbot'),

]