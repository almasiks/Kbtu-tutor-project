from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()
from .models import Subject, TutorProfile, LessonSlot, Booking


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['student', 'tutor'])

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role,
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account disabled.")
        data['user'] = user
        return data



class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class TutorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = TutorProfile
        fields = ['id', 'user', 'subject', 'subject_id', 'experience_years', 'bio', 'hourly_rate', 'rating']
        read_only_fields = ['rating']


class LessonSlotSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source='tutor.user.username', read_only=True)
    tutor_subject = serializers.CharField(source='tutor.subject.name', read_only=True, default=None)
    tutor_hourly_rate = serializers.DecimalField(source='tutor.hourly_rate', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = LessonSlot
        fields = ['id', 'tutor', 'tutor_username', 'tutor_subject', 'tutor_hourly_rate', 'start_time', 'end_time', 'is_booked']
        read_only_fields = ['tutor', 'is_booked']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("end_time must be after start_time.")
        return data


class BookingSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    lesson_slot_detail = LessonSlotSerializer(source='lesson_slot', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'student', 'student_username', 'lesson_slot', 'lesson_slot_detail', 'created_at', 'status']
        read_only_fields = ['student', 'created_at']

    def validate_lesson_slot(self, slot):
        if slot.is_booked:
            raise serializers.ValidationError("This slot is already booked.")
        return slot
