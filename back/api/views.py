from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Subject, TutorProfile, LessonSlot, Booking
from .serializers import (
    RegisterSerializer, LoginSerializer,
    SubjectSerializer, TutorProfileSerializer,
    LessonSlotSerializer, BookingSerializer,
)

User = get_user_model()




@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(_request):
    return Response({
        'auth': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'profile': '/api/auth/profile/',
        },
        'tutors': '/api/tutors/',
        'tutor_profile': '/api/tutors/profile/',
        'slots': '/api/slots/',
        'bookings': '/api/bookings/',
        'subjects': '/api/subjects/',
        'admin_users': '/api/admin/users/',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            'message': 'User registered successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'detail': 'Logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def tutor_list(request):
    qs = TutorProfile.active.select_related('user', 'subject').all()
    subject_id = request.query_params.get('subject')
    if subject_id:
        qs = qs.filter(subject_id=subject_id)
    return Response(TutorProfileSerializer(qs, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
    }, status=status.HTTP_200_OK
)

class TutorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            profile = get_object_or_404(TutorProfile, pk=pk)
        else:
            if getattr(request.user, 'is_tutor', False):
                profile, _ = TutorProfile.objects.get_or_create(user=request.user)
            else:
                profile = get_object_or_404(TutorProfile, user=request.user)
        return Response(TutorProfileSerializer(profile).data)

    def post(self, request):
        if not (getattr(request.user, 'is_tutor', False) or request.user.is_staff):
            return Response({'detail': 'Only tutors can create a profile.'}, status=status.HTTP_403_FORBIDDEN)
        if TutorProfile.objects.filter(user=request.user).exists():
            return Response({'detail': 'Profile already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TutorProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        profile = get_object_or_404(TutorProfile, user=request.user)
        serializer = TutorProfileSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        profile = get_object_or_404(TutorProfile, user=request.user)
        serializer = TutorProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        profile = get_object_or_404(TutorProfile, user=request.user)
        profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
def tutor_slots(_request, tutor_pk):
    profile = get_object_or_404(TutorProfile, pk=tutor_pk)
    slots = profile.slots.filter(is_booked=False)
    return Response(LessonSlotSerializer(slots, many=True).data)


class LessonSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_tutor_profile(self, user):
        return get_object_or_404(TutorProfile, user=user)

    def get(self, request, pk=None):
        if pk:
            slot = get_object_or_404(LessonSlot, pk=pk)
            return Response(LessonSlotSerializer(slot).data)
        profile = self._get_tutor_profile(request.user)
        return Response(LessonSlotSerializer(profile.slots.all(), many=True).data)

    def post(self, request):
        profile = self._get_tutor_profile(request.user)
        serializer = LessonSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(tutor=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        profile = self._get_tutor_profile(request.user)
        slot = get_object_or_404(LessonSlot, pk=pk, tutor=profile)
        serializer = LessonSlotSerializer(slot, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        profile = self._get_tutor_profile(request.user)
        slot = get_object_or_404(LessonSlot, pk=pk, tutor=profile)
        serializer = LessonSlotSerializer(slot, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        profile = self._get_tutor_profile(request.user)
        slot = get_object_or_404(LessonSlot, pk=pk, tutor=profile)
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            booking = get_object_or_404(Booking, pk=pk, student=request.user)
            return Response(BookingSerializer(booking).data)
        bookings = Booking.objects.filter(student=request.user).select_related('lesson_slot')
        return Response(BookingSerializer(bookings, many=True).data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        slot = serializer.validated_data['lesson_slot']
        booking = serializer.save(student=request.user)
        slot.is_booked = True
        slot.save(update_fields=['is_booked'])
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, student=request.user)
        new_status = request.data.get('status')
        if new_status not in ['Cancelled', 'Completed']:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = new_status
        booking.save(update_fields=['status'])
        if new_status == 'Cancelled':
            booking.lesson_slot.is_booked = False
            booking.lesson_slot.save(update_fields=['is_booked'])
        return Response(BookingSerializer(booking).data)

    def delete(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, student=request.user)
        booking.lesson_slot.is_booked = False
        booking.lesson_slot.save(update_fields=['is_booked'])
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SubjectView(APIView):
    permission_classes = [AllowAny]

    def _require_admin(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

    def get(self, _request, pk=None):
        if pk:
            return Response(SubjectSerializer(get_object_or_404(Subject, pk=pk)).data)
        return Response(SubjectSerializer(Subject.objects.all(), many=True).data)

    def post(self, request):
        err = self._require_admin(request)
        if err:
            return err
        serializer = SubjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        err = self._require_admin(request)
        if err:
            return err
        subject = get_object_or_404(Subject, pk=pk)
        serializer = SubjectSerializer(subject, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        err = self._require_admin(request)
        if err:
            return err
        subject = get_object_or_404(Subject, pk=pk)
        serializer = SubjectSerializer(subject, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        err = self._require_admin(request)
        if err:
            return err
        get_object_or_404(Subject, pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def _require_admin(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

    def get(self, request):
        err = self._require_admin(request)
        if err:
            return err
        users = User.objects.all().order_by('id')
        data = [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': u.role,
                'is_staff': u.is_staff,
                'is_active': u.is_active,
            }
            for u in users
        ]
        return Response(data)

def patch(self, request, pk):
    err = self._require_admin(request)
    if err:
        return err
    user = get_object_or_404(User, pk=pk)

    if 'role' in request.data and request.data['role'] in ['student', 'tutor', 'admin']:
        user.role = request.data['role']
        user.save(update_fields=['role'])

    return Response({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'is_staff': user.is_staff,
    })