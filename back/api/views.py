from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404

from .models import Subject, TutorProfile, LessonSlot, Booking
from .serializers import (
    RegisterSerializer, LoginSerializer,
    SubjectSerializer, TutorProfileSerializer,
    LessonSlotSerializer, BookingSerializer,
)



@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    if request.data.get('is_tutor') and not (request.user.is_authenticated and request.user.is_staff):
        return Response({'detail': 'Only admins can register tutor accounts.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED)



@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username, 'user_id': user.id})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({'detail': 'Logged out.'})



@api_view(['GET'])
@permission_classes([AllowAny])
def tutor_list(request):
    qs = TutorProfile.active.select_related('user', 'subject').all()
    subject_id = request.query_params.get('subject')
    if subject_id:
        qs = qs.filter(subject_id=subject_id)
    serializer = TutorProfileSerializer(qs, many=True)
    return Response(serializer.data)



class TutorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            profile = get_object_or_404(TutorProfile, pk=pk)
        else:
            profile = get_object_or_404(TutorProfile, user=request.user)
        return Response(TutorProfileSerializer(profile).data)

    def post(self, request):
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



class LessonSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_tutor_profile(self, user):
        return get_object_or_404(TutorProfile, user=user)

    def get(self, request, pk=None):
        if pk:
            slot = get_object_or_404(LessonSlot, pk=pk)
            return Response(LessonSlotSerializer(slot).data)
        profile = self._get_tutor_profile(request.user)
        slots = profile.slots.all()
        return Response(LessonSlotSerializer(slots, many=True).data)

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

    def get(self, _request, pk=None):
        if pk:
            subject = get_object_or_404(Subject, pk=pk)
            return Response(SubjectSerializer(subject).data)
        subjects = Subject.objects.all()
        return Response(SubjectSerializer(subjects, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = SubjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
