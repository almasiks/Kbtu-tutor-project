from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),

    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/profile/', views.profile, name='profile'),

    path('tutors/', views.tutor_list, name='tutor-list'),
    path('tutors/<int:tutor_pk>/', views.tutor_detail, name='tutor-detail'),
    path('tutors/<int:tutor_pk>/slots/', views.tutor_slots, name='tutor-slots'),
    path('tutors/<int:tutor_pk>/rate/', views.tutor_rate, name='tutor-rate'),
    path('tutors/profile/', views.TutorProfileView.as_view(), name='tutor-profile-me'),
    path('tutors/profile/<int:pk>/', views.TutorProfileView.as_view(), name='tutor-profile-detail'),

    path('slots/', views.LessonSlotView.as_view(), name='slot-list'),
    path('slots/<int:pk>/', views.LessonSlotView.as_view(), name='slot-detail'),

    path('bookings/', views.BookingView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingView.as_view(), name='booking-detail'),

    path('subjects/', views.SubjectView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectView.as_view(), name='subject-detail'),

    path('admin/users/', views.UserAdminView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.UserAdminView.as_view(), name='admin-user-detail'),
]
