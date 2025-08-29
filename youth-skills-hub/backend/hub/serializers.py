from rest_framework import serializers
from .models import User, Course, Enrollment, Mentorship, StudyGroup, Portfolio, Badge, UserBadge, Notification, Event, GroupMessage

class UserSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    enrolled_courses_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'location', 'skills', 'interests', 'phone_number', 'avatar', 'points', 'is_verified', 'preferred_language', 'two_factor_enabled', 'badges', 'enrolled_courses_count']
        read_only_fields = ['id', 'points']

    def get_badges(self, obj):
        user_badges = UserBadge.objects.filter(user=obj, is_active=True)
        return UserBadgeSerializer(user_badges, many=True).data

    def get_enrolled_courses_count(self, obj):
        return Enrollment.objects.filter(user=obj).count()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'bio', 'skills', 'interests']

    def validate(self, attrs):
        print(f"Validating registration data: {attrs}")  # Debug print
        
        if not attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": ["This field is required."]})
            
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": ["Passwords don't match"]})
            
        return attrs

    def create(self, validated_data):
        print(f"Creating user with data: {validated_data}")  # Debug print
        validated_data.pop('password_confirm', None)
        user = User.objects.create_user(**validated_data)
        return user

class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = Enrollment.objects.get(user=request.user, course=obj)
                return enrollment.progress
            except Enrollment.DoesNotExist:
                return 0
        return 0

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    course_image = serializers.ImageField(source='course.image', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['user']

class MentorshipSerializer(serializers.ModelSerializer):
    mentor_username = serializers.CharField(source='mentor.username', read_only=True)
    learner_username = serializers.CharField(source='learner.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    mentor_avatar = serializers.ImageField(source='mentor.avatar', read_only=True)
    learner_avatar = serializers.ImageField(source='learner.avatar', read_only=True)

    class Meta:
        model = Mentorship
        fields = '__all__'

class StudyGroupSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    members_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = '__all__'
        read_only_fields = ['creator']

    def get_members_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)

    class Meta:
        model = GroupMessage
        fields = '__all__'
        read_only_fields = ['sender']

class PortfolioSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Portfolio
        fields = '__all__'
        read_only_fields = ['user']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_icon = serializers.ImageField(source='badge.icon', read_only=True)
    badge_description = serializers.CharField(source='badge.description', read_only=True)

    class Meta:
        model = UserBadge
        fields = '__all__'
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user']

class EventSerializer(serializers.ModelSerializer):
    attendee_count = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = '__all__'
