from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),

    path('tutors/', views.tutor_list, name='tutor-list'),
    path('tutors/profile/', views.TutorProfileView.as_view(), name='tutor-profile-me'),
    path('tutors/profile/<int:pk>/', views.TutorProfileView.as_view(), name='tutor-profile-detail'),

    path('slots/', views.LessonSlotView.as_view(), name='slot-list'),
    path('slots/<int:pk>/', views.LessonSlotView.as_view(), name='slot-detail'),

    path('bookings/', views.BookingView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingView.as_view(), name='booking-detail'),

    path('subjects/', views.SubjectView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectView.as_view(), name='subject-detail'),
]
