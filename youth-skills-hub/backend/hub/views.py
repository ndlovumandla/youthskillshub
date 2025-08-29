from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, Course, Enrollment, Mentorship, StudyGroup, Portfolio, Badge, UserBadge, Notification, Event, GroupMessage
from .serializers import UserSerializer, UserRegistrationSerializer, CourseSerializer, EnrollmentSerializer, MentorshipSerializer, StudyGroupSerializer, PortfolioSerializer, BadgeSerializer, UserBadgeSerializer, NotificationSerializer, EventSerializer, GroupMessageSerializer
# Temporarily comment out ML imports to test
# from .ml_model import MentorMatcher, CourseRecommender, award_badges
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'login']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        print(f"Received registration data: {request.data}")  # Debug print
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        skill_level = self.request.query_params.get('skill_level', None)
        search = self.request.query_params.get('search', None)

        if category:
            queryset = queryset.filter(category=category)
        if skill_level:
            queryset = queryset.filter(skill_level=skill_level)
        if search:
            queryset = queryset.filter(
                title__icontains=search) | queryset.filter(description__icontains=search)

        return queryset

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user, course=course)

        if created:
            course.update_enrolled_count()
            return Response({'message': 'Enrolled successfully'})
        return Response({'message': 'Already enrolled'})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        course = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, course=course)
            progress = request.data.get('progress', 0)
            enrollment.progress = progress
            if progress == 100:
                enrollment.completed = True
                # award_badges(request.user)  # Check for badge awards
            enrollment.save()
            return Response(EnrollmentSerializer(enrollment).data)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this course'}, status=400)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        # recommender = CourseRecommender()
        # recommended_courses = recommender.recommend_courses(request.user)
        recommended_courses = Course.objects.filter(is_active=True)[:5]
        serializer = self.get_serializer(recommended_courses, many=True)
        return Response(serializer.data)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = request.data.get('progress', 0)
        enrollment.progress = progress
        if progress == 100:
            enrollment.completed = True
            enrollment.user.points += 10  # Award points
            enrollment.user.save()
        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)

class MentorshipViewSet(viewsets.ModelViewSet):
    queryset = Mentorship.objects.all()
    serializer_class = MentorshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Mentorship.objects.filter(
            mentor=self.request.user) | Mentorship.objects.filter(learner=self.request.user)

    @action(detail=False, methods=['post'])
    def match(self, request):
        # matcher = MentorMatcher()
        # best_mentor = matcher.find_best_mentor(request.user)
        best_mentor = User.objects.filter(role='mentor').first()

        if best_mentor:
            mentorship = Mentorship.objects.create(
                mentor=best_mentor,
                learner=request.user,
                status='pending'
            )
            return Response(MentorshipSerializer(mentorship).data)
        return Response({'error': 'No mentors available'})

    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        mentorship = self.get_object()
        mentorship.complete_session()
        # award_badges(request.user)  # Check for badge awards
        return Response(MentorshipSerializer(mentorship).data)

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudyGroup.objects.all()
        member_id = self.request.query_params.get('member', None)
        if member_id:
            queryset = queryset.filter(members__id=member_id)
        return queryset

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        if group.members.filter(id=request.user.id).exists():
            return Response({'message': 'Already a member'})
        if group.members.count() >= group.max_members:
            return Response({'error': 'Group is full'}, status=400)
        group.members.add(request.user)
        return Response({'message': 'Joined group'})

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        group = self.get_object()
        if not group.members.filter(id=request.user.id).exists():
            return Response({'error': 'Not a member of this group'}, status=400)
        group.members.remove(request.user)
        return Response({'message': 'Left group'})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        group = self.get_object()
        messages = GroupMessage.objects.filter(group=group)
        serializer = GroupMessageSerializer(messages, many=True)
        return Response(serializer.data)

class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['admin', 'superadmin']:
            return Portfolio.objects.all()
        return Portfolio.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        if request.user.role not in ['admin', 'superadmin']:
            return Response({'error': 'Unauthorized'}, status=403)

        portfolio = self.get_object()
        portfolio.is_verified = True
        portfolio.save()
        return Response({'message': 'Portfolio verified'})

class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [AllowAny]

class UserBadgeViewSet(viewsets.ModelViewSet):
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def attend(self, request, pk=None):
        event = self.get_object()
        if event.attendee_count < event.max_attendees:
            event.attendees.add(request.user)
            return Response({'message': 'Added to attendees'})
        return Response({'error': 'Event is full'}, status=400)

class GroupMessageViewSet(viewsets.ModelViewSet):
    queryset = GroupMessage.objects.all()
    serializer_class = GroupMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get('group', None)
        if group_id:
            return GroupMessage.objects.filter(group_id=group_id)
        return GroupMessage.objects.none()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    top_users = User.objects.order_by('-points')[:50]
    serializer = UserSerializer(top_users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    stats = {
        'total_users': User.objects.count(),
        'total_courses': Course.objects.filter(is_active=True).count(),
        'total_enrollments': Enrollment.objects.count(),
        'total_mentorships': Mentorship.objects.filter(status='completed').count(),
        'total_study_groups': StudyGroup.objects.count(),
        'popular_skills': ['coding', 'digital literacy', 'renewable energy'],
        'courses_by_category': {
            'coding': Course.objects.filter(category='coding', is_active=True).count(),
            'digital_literacy': Course.objects.filter(category='digital_literacy', is_active=True).count(),
            'renewable_energy': Course.objects.filter(category='renewable_energy', is_active=True).count(),
        },
        'user_growth': User.objects.filter(date_joined__month=timezone.now().month).count()
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([AllowAny])
def free_courses(request):
    """
    Fetch free courses from external APIs (Coursera, edX, Khan Academy)
    In production, this would make actual API calls to these services
    """
@api_view(['GET'])
@permission_classes([AllowAny])
def free_courses(request):
    """
    Fetch free courses from external APIs (Coursera, edX, Khan Academy, Udacity, FutureLearn)
    In production, this would make actual API calls to these services
    """
    # Comprehensive collection of free courses from various providers
    free_courses_data = [
        # Coursera - Using verified working specialization URLs
        {
            'id': 'coursera_python',
            'title': 'Python for Everybody Specialization',
            'provider': 'Coursera',
            'description': 'Learn to Program and Analyze Data with Python. Develop programs to gather, clean, analyze, and visualize data.',
            'duration': '8 weeks',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.coursera.org/specializations/python',
            'rating': 4.8,
            'enrolled_count': 125000,
            'image_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
            'external_id': 'python-for-everybody'
        },
        {
            'id': 'coursera_web_dev',
            'title': 'Web Development Courses',
            'provider': 'Coursera',
            'description': 'Learn how to create attractive and interactive websites by using HTML, CSS, and JavaScript.',
            'duration': '10 weeks',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.coursera.org/courses?query=web%20development',
            'rating': 4.9,
            'enrolled_count': 156000,
            'image_url': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=250&fit=crop',
            'external_id': 'web-development-coursera'
        },
        {
            'id': 'coursera_machine_learning',
            'title': 'Machine Learning Courses',
            'provider': 'Coursera',
            'description': 'Learn the principles of machine learning and build your first ML algorithm from scratch.',
            'duration': '11 weeks',
            'skill_level': 'Intermediate',
            'category': 'coding',
            'url': 'https://www.coursera.org/courses?query=machine%20learning',
            'rating': 4.9,
            'enrolled_count': 4500000,
            'image_url': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop',
            'external_id': 'machine-learning-coursera'
        },
        {
            'id': 'coursera_data_science',
            'title': 'Data Science Courses',
            'provider': 'Coursera',
            'description': 'Launch your career in data science with comprehensive courses and specializations.',
            'duration': '11 months',
            'skill_level': 'Beginner',
            'category': 'data_science',
            'url': 'https://www.coursera.org/courses?query=data%20science',
            'rating': 4.6,
            'enrolled_count': 890000,
            'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'external_id': 'data-science-coursera'
        },
        {
            'id': 'coursera_ux_design',
            'title': 'UX Design Courses',
            'provider': 'Coursera',
            'description': 'Build job-ready skills for an entry-level UX design role with comprehensive design courses.',
            'duration': '6 months',
            'skill_level': 'Beginner',
            'category': 'design',
            'url': 'https://www.coursera.org/courses?query=ux%20design',
            'rating': 4.8,
            'enrolled_count': 1200000,
            'image_url': 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop',
            'external_id': 'ux-design-coursera'
        },

        # edX - Using verified working course catalog URLs
        {
            'id': 'edx_cs50',
            'title': 'Computer Science Courses',
            'provider': 'edX',
            'description': 'Harvard University\'s introduction to computer science and programming using multiple languages.',
            'duration': '12 weeks',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.edx.org/learn/computer-science',
            'rating': 4.9,
            'enrolled_count': 234000,
            'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            'external_id': 'computer-science-edx'
        },
        {
            'id': 'edx_biology',
            'title': 'Biology Courses',
            'provider': 'edX',
            'description': 'Comprehensive introduction to biology covering molecular genetics, biochemistry, and cell biology.',
            'duration': '15 weeks',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.edx.org/learn/biology',
            'rating': 4.7,
            'enrolled_count': 156000,
            'image_url': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=250&fit=crop',
            'external_id': 'biology-edx'
        },
        {
            'id': 'edx_business',
            'title': 'Business Courses',
            'provider': 'edX',
            'description': 'Learn business fundamentals, management, finance, and entrepreneurship from top universities.',
            'duration': '8-12 weeks',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.edx.org/learn/business-and-management',
            'rating': 4.6,
            'enrolled_count': 89000,
            'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
            'external_id': 'business-edx'
        },

        # Khan Academy - Using verified working subject URLs (completely free)
        {
            'id': 'khan_math',
            'title': 'Mathematics',
            'provider': 'Khan Academy',
            'description': 'Master essential math concepts from arithmetic to calculus with interactive exercises.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.khanacademy.org/math',
            'rating': 4.8,
            'enrolled_count': 5000000,
            'image_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
            'external_id': 'khan-math'
        },
        {
            'id': 'khan_computer_science',
            'title': 'Computer Science',
            'provider': 'Khan Academy',
            'description': 'Learn programming fundamentals, algorithms, cryptography, and computer science concepts.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.khanacademy.org/computing/computer-science',
            'rating': 4.7,
            'enrolled_count': 2100000,
            'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            'external_id': 'khan-computer-science'
        },
        {
            'id': 'khan_physics',
            'title': 'Physics',
            'provider': 'Khan Academy',
            'description': 'Learn physics concepts from mechanics to quantum physics with clear explanations.',
            'duration': 'Self-paced',
            'skill_level': 'Intermediate',
            'category': 'science_technology',
            'url': 'https://www.khanacademy.org/science/physics',
            'rating': 4.7,
            'enrolled_count': 2100000,
            'image_url': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
            'external_id': 'khan-physics'
        },
        {
            'id': 'khan_biology',
            'title': 'Biology',
            'provider': 'Khan Academy',
            'description': 'Explore life sciences from cells to ecosystems with comprehensive biology lessons.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.khanacademy.org/science/biology',
            'rating': 4.6,
            'enrolled_count': 3200000,
            'image_url': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=250&fit=crop',
            'external_id': 'khan-biology'
        },
        {
            'id': 'khan_chemistry',
            'title': 'Chemistry',
            'provider': 'Khan Academy',
            'description': 'Learn chemistry from atomic structure to organic chemistry with interactive simulations.',
            'duration': 'Self-paced',
            'skill_level': 'Intermediate',
            'category': 'science_technology',
            'url': 'https://www.khanacademy.org/science/chemistry',
            'rating': 4.5,
            'enrolled_count': 1800000,
            'image_url': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=250&fit=crop',
            'external_id': 'khan-chemistry'
        },
        {
            'id': 'khan_economics',
            'title': 'Economics',
            'provider': 'Khan Academy',
            'description': 'Learn microeconomics and macroeconomics concepts with real-world applications.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.khanacademy.org/economics-finance-domain',
            'rating': 4.6,
            'enrolled_count': 1500000,
            'image_url': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
            'external_id': 'khan-economics'
        },

        # Udacity - Using main course catalog (free courses page doesn't exist)
        {
            'id': 'udacity_programming',
            'title': 'Programming Courses',
            'provider': 'Udacity',
            'description': 'Learn programming with Python, JavaScript, and other languages through project-based courses.',
            'duration': '2-6 months',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.udacity.com/courses/all',
            'rating': 4.6,
            'enrolled_count': 125000,
            'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            'external_id': 'programming-udacity'
        },
        {
            'id': 'udacity_data_science',
            'title': 'Data Science Courses',
            'provider': 'Udacity',
            'description': 'Master data analysis, machine learning, and AI with hands-on projects and real datasets.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'data_science',
            'url': 'https://www.udacity.com/courses/all',
            'rating': 4.7,
            'enrolled_count': 98000,
            'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'external_id': 'data-science-udacity'
        },

        # FutureLearn - Using verified working subject pages
        {
            'id': 'futurelearn_business',
            'title': 'Business & Management Courses',
            'provider': 'FutureLearn',
            'description': 'Learn business fundamentals, leadership, marketing, and entrepreneurship from top universities.',
            'duration': '3-8 weeks',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.futurelearn.com/subjects/business-and-management-courses',
            'rating': 4.5,
            'enrolled_count': 45000,
            'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
            'external_id': 'business-futurelearn'
        },
        {
            'id': 'futurelearn_technology',
            'title': 'IT & Computer Science Courses',
            'provider': 'FutureLearn',
            'description': 'Master coding, cybersecurity, AI, and other technology skills with university-level courses.',
            'duration': '4-6 weeks',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.futurelearn.com/subjects/it-and-computer-science-courses',
            'rating': 4.4,
            'enrolled_count': 67000,
            'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            'external_id': 'technology-futurelearn'
        },
        {
            'id': 'futurelearn_science',
            'title': 'Science, Engineering & Maths Courses',
            'provider': 'FutureLearn',
            'description': 'Explore STEM subjects from basic science to advanced engineering and mathematics.',
            'duration': '4-8 weeks',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.futurelearn.com/subjects/science-engineering-and-maths-courses',
            'rating': 4.6,
            'enrolled_count': 89000,
            'image_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
            'external_id': 'science-futurelearn'
        },

        # Additional verified courses with working URLs
        {
            'id': 'coursera_cloud_computing',
            'title': 'Cloud Computing Courses',
            'provider': 'Coursera',
            'description': 'Master cloud platforms including AWS, Google Cloud, and Azure with hands-on projects.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'technology',
            'url': 'https://www.coursera.org/courses?query=cloud%20computing',
            'rating': 4.7,
            'enrolled_count': 234000,
            'image_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
            'external_id': 'cloud-computing-coursera'
        },
        {
            'id': 'coursera_react',
            'title': 'React Development Courses',
            'provider': 'Coursera',
            'description': 'Build modern web applications with React and learn advanced frontend development techniques.',
            'duration': '2-4 months',
            'skill_level': 'Intermediate',
            'category': 'coding',
            'url': 'https://www.coursera.org/courses?query=react',
            'rating': 4.8,
            'enrolled_count': 345000,
            'image_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
            'external_id': 'react-development-coursera'
        },
        {
            'id': 'edx_technology',
            'title': 'Technology Courses',
            'provider': 'edX',
            'description': 'Learn cutting-edge technology skills from cloud computing to cybersecurity.',
            'duration': '6-12 weeks',
            'skill_level': 'Beginner',
            'category': 'technology',
            'url': 'https://www.edx.org/learn/technology',
            'rating': 4.5,
            'enrolled_count': 89000,
            'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            'external_id': 'technology-edx'
        },
        {
            'id': 'khan_finance',
            'title': 'Finance & Capital Markets',
            'provider': 'Khan Academy',
            'description': 'Learn personal finance, investing, and financial planning with practical examples.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.khanacademy.org/economics-finance-domain/core-finance',
            'rating': 4.7,
            'enrolled_count': 1200000,
            'image_url': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
            'external_id': 'khan-finance'
        },
        {
            'id': 'coursera_ai_ml',
            'title': 'AI & Machine Learning Courses',
            'provider': 'Coursera',
            'description': 'Master artificial intelligence and machine learning with practical applications.',
            'duration': '3-6 months',
            'skill_level': 'Advanced',
            'category': 'coding',
            'url': 'https://www.coursera.org/courses?query=artificial%20intelligence',
            'rating': 4.9,
            'enrolled_count': 567000,
            'image_url': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop',
            'external_id': 'ai-ml-coursera'
        },
        {
            'id': 'coursera_aws',
            'title': 'AWS Cloud Courses',
            'provider': 'Coursera',
            'description': 'Learn Amazon Web Services and cloud architecture with hands-on labs and projects.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'technology',
            'url': 'https://www.coursera.org/courses?query=aws',
            'rating': 4.6,
            'enrolled_count': 178000,
            'image_url': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
            'external_id': 'aws-coursera'
        },

        # Additional verified free courses from Coursera
        {
            'id': 'coursera_python_data_science',
            'title': 'Python for Data Science, AI & Development',
            'provider': 'Coursera',
            'description': 'Learn Python programming fundamentals for data science, AI, and web development.',
            'duration': '1-3 months',
            'skill_level': 'Beginner',
            'category': 'coding',
            'url': 'https://www.coursera.org/learn/python-for-applied-data-science-ai',
            'rating': 4.6,
            'enrolled_count': 42000,
            'image_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
            'external_id': 'python-data-science-coursera'
        },
        {
            'id': 'coursera_cybersecurity',
            'title': 'Cybersecurity for Everyone',
            'provider': 'Coursera',
            'description': 'Learn cybersecurity fundamentals, risk management, and security strategies.',
            'duration': '1-3 months',
            'skill_level': 'Beginner',
            'category': 'technology',
            'url': 'https://www.coursera.org/learn/cybersecurity-for-everyone',
            'rating': 4.7,
            'enrolled_count': 3100,
            'image_url': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
            'external_id': 'cybersecurity-coursera'
        },
        {
            'id': 'coursera_digital_marketing',
            'title': 'Foundations of Digital Marketing and E-commerce',
            'provider': 'Coursera',
            'description': 'Master digital marketing strategies, SEO, social media, and e-commerce fundamentals.',
            'duration': '1-4 weeks',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.coursera.org/learn/foundations-of-digital-marketing-and-e-commerce',
            'rating': 4.8,
            'enrolled_count': 29000,
            'image_url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
            'external_id': 'digital-marketing-coursera'
        },
        {
            'id': 'coursera_excel',
            'title': 'Excel Skills for Business',
            'provider': 'Coursera',
            'description': 'Master Excel for business analysis, data visualization, and productivity.',
            'duration': '1-2 months',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.coursera.org/specializations/excel-skills-for-business',
            'rating': 4.7,
            'enrolled_count': 156000,
            'image_url': 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b827?w=400&h=250&fit=crop',
            'external_id': 'excel-business-coursera'
        },
        {
            'id': 'coursera_healthcare',
            'title': 'Healthcare Management and Leadership',
            'provider': 'Coursera',
            'description': 'Learn healthcare administration, patient care management, and leadership skills.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'healthcare',
            'url': 'https://www.coursera.org/specializations/healthcare-management',
            'rating': 4.6,
            'enrolled_count': 45000,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            'external_id': 'healthcare-management-coursera'
        },
        {
            'id': 'coursera_psychology',
            'title': 'Introduction to Psychology',
            'provider': 'Coursera',
            'description': 'Explore psychological concepts, human behavior, and mental processes.',
            'duration': '1-3 months',
            'skill_level': 'Beginner',
            'category': 'social_sciences',
            'url': 'https://www.coursera.org/learn/introduction-psychology',
            'rating': 4.8,
            'enrolled_count': 89000,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            'external_id': 'psychology-coursera'
        },

        # Additional verified free courses from edX
        {
            'id': 'edx_data_science',
            'title': 'Data Science and Machine Learning',
            'provider': 'edX',
            'description': 'Master data analysis, statistics, and machine learning with Python and R.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'data_science',
            'url': 'https://www.edx.org/learn/data-science',
            'rating': 4.7,
            'enrolled_count': 125000,
            'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'external_id': 'data-science-edx'
        },
        {
            'id': 'edx_artificial_intelligence',
            'title': 'Artificial Intelligence Courses',
            'provider': 'edX',
            'description': 'Learn AI fundamentals, machine learning algorithms, and neural networks.',
            'duration': '2-6 months',
            'skill_level': 'Intermediate',
            'category': 'coding',
            'url': 'https://www.edx.org/learn/artificial-intelligence',
            'rating': 4.8,
            'enrolled_count': 98000,
            'image_url': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
            'external_id': 'ai-edx'
        },
        {
            'id': 'edx_psychology',
            'title': 'Psychology and Mental Health',
            'provider': 'edX',
            'description': 'Study human behavior, mental health, and psychological research methods.',
            'duration': '2-4 months',
            'skill_level': 'Beginner',
            'category': 'social_sciences',
            'url': 'https://www.edx.org/learn/psychology',
            'rating': 4.6,
            'enrolled_count': 67000,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            'external_id': 'psychology-edx'
        },
        {
            'id': 'edx_english',
            'title': 'English Language and Communication',
            'provider': 'edX',
            'description': 'Improve English language skills for academic and professional communication.',
            'duration': '1-3 months',
            'skill_level': 'Beginner',
            'category': 'language',
            'url': 'https://www.edx.org/learn/language',
            'rating': 4.5,
            'enrolled_count': 156000,
            'image_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
            'external_id': 'english-edx'
        },
        {
            'id': 'edx_environmental_science',
            'title': 'Environmental Science and Sustainability',
            'provider': 'edX',
            'description': 'Learn about climate change, environmental policy, and sustainable development.',
            'duration': '2-4 months',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.edx.org/learn/environmental-science',
            'rating': 4.7,
            'enrolled_count': 45000,
            'image_url': 'https://images.unsplash.com/photo-1569163139394-de44cb89ba02?w=400&h=250&fit=crop',
            'external_id': 'environmental-science-edx'
        },

        # Additional verified free courses from Khan Academy
        {
            'id': 'khan_history',
            'title': 'World History',
            'provider': 'Khan Academy',
            'description': 'Explore ancient civilizations, world wars, and modern history with interactive timelines.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'social_sciences',
            'url': 'https://www.khanacademy.org/humanities/world-history',
            'rating': 4.6,
            'enrolled_count': 1800000,
            'image_url': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
            'external_id': 'khan-world-history'
        },
        {
            'id': 'khan_art_history',
            'title': 'Art History',
            'provider': 'Khan Academy',
            'description': 'Discover art movements, famous artists, and artistic techniques from ancient to modern times.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'arts_humanities',
            'url': 'https://www.khanacademy.org/humanities/art-history',
            'rating': 4.5,
            'enrolled_count': 950000,
            'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
            'external_id': 'khan-art-history'
        },
        {
            'id': 'khan_statistics',
            'title': 'Statistics and Probability',
            'provider': 'Khan Academy',
            'description': 'Learn statistical analysis, probability theory, and data interpretation skills.',
            'duration': 'Self-paced',
            'skill_level': 'Intermediate',
            'category': 'science_technology',
            'url': 'https://www.khanacademy.org/math/probability',
            'rating': 4.7,
            'enrolled_count': 1400000,
            'image_url': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
            'external_id': 'khan-statistics'
        },
        {
            'id': 'khan_career_prep',
            'title': 'Career and College Preparation',
            'provider': 'Khan Academy',
            'description': 'Prepare for college applications, career planning, and professional development.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'personal_development',
            'url': 'https://www.khanacademy.org/college-careers-more',
            'rating': 4.6,
            'enrolled_count': 1200000,
            'image_url': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
            'external_id': 'khan-career-prep'
        },
        {
            'id': 'khan_health_medicine',
            'title': 'Health and Medicine',
            'provider': 'Khan Academy',
            'description': 'Learn about human anatomy, physiology, and healthcare fundamentals.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'healthcare',
            'url': 'https://www.khanacademy.org/science/health-and-medicine',
            'rating': 4.5,
            'enrolled_count': 850000,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            'external_id': 'khan-health-medicine'
        },

        # Additional verified free courses from Udacity
        {
            'id': 'udacity_web_development',
            'title': 'Web Development Courses',
            'provider': 'Udacity',
            'description': 'Learn full-stack web development with HTML, CSS, JavaScript, and modern frameworks.',
            'duration': '3-6 months',
            'skill_level': 'Intermediate',
            'category': 'coding',
            'url': 'https://www.udacity.com/courses/all',
            'rating': 4.7,
            'enrolled_count': 125000,
            'image_url': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=250&fit=crop',
            'external_id': 'web-development-udacity'
        },
        {
            'id': 'udacity_product_management',
            'title': 'Product Management Courses',
            'provider': 'Udacity',
            'description': 'Master product strategy, user research, and agile development methodologies.',
            'duration': '2-4 months',
            'skill_level': 'Intermediate',
            'category': 'business',
            'url': 'https://www.udacity.com/courses/all',
            'rating': 4.6,
            'enrolled_count': 67000,
            'image_url': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
            'external_id': 'product-management-udacity'
        },

        # Additional verified free courses from FutureLearn
        {
            'id': 'futurelearn_data_science',
            'title': 'Data Science and Analytics',
            'provider': 'FutureLearn',
            'description': 'Learn data analysis, visualization, and statistical modeling techniques.',
            'duration': '4-6 weeks',
            'skill_level': 'Beginner',
            'category': 'data_science',
            'url': 'https://www.futurelearn.com/subjects/data-science-and-statistics-courses',
            'rating': 4.5,
            'enrolled_count': 78000,
            'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            'external_id': 'data-science-futurelearn'
        },
        {
            'id': 'futurelearn_mental_health',
            'title': 'Mental Health and Psychology',
            'provider': 'FutureLearn',
            'description': 'Explore mental health, psychological well-being, and therapeutic approaches.',
            'duration': '3-6 weeks',
            'skill_level': 'Beginner',
            'category': 'healthcare',
            'url': 'https://www.futurelearn.com/subjects/psychology-and-mental-health-courses',
            'rating': 4.6,
            'enrolled_count': 45000,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
            'external_id': 'mental-health-futurelearn'
        },
        {
            'id': 'futurelearn_creative_arts',
            'title': 'Creative Arts and Media',
            'provider': 'FutureLearn',
            'description': 'Develop creative skills in writing, design, music, and digital media.',
            'duration': '4-8 weeks',
            'skill_level': 'Beginner',
            'category': 'arts_humanities',
            'url': 'https://www.futurelearn.com/subjects/creative-arts-and-media-courses',
            'rating': 4.4,
            'enrolled_count': 56000,
            'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
            'external_id': 'creative-arts-futurelearn'
        },

        # Additional diverse free courses
        {
            'id': 'coursera_sustainability',
            'title': 'Sustainability and Climate Change',
            'provider': 'Coursera',
            'description': 'Learn about environmental sustainability, climate science, and green technologies.',
            'duration': '2-4 months',
            'skill_level': 'Beginner',
            'category': 'science_technology',
            'url': 'https://www.coursera.org/courses?query=sustainability',
            'rating': 4.7,
            'enrolled_count': 89000,
            'image_url': 'https://images.unsplash.com/photo-1569163139394-de44cb89ba02?w=400&h=250&fit=crop',
            'external_id': 'sustainability-coursera'
        },
        {
            'id': 'coursera_creative_writing',
            'title': 'Creative Writing and Storytelling',
            'provider': 'Coursera',
            'description': 'Develop writing skills, learn narrative techniques, and craft compelling stories.',
            'duration': '1-3 months',
            'skill_level': 'Beginner',
            'category': 'arts_humanities',
            'url': 'https://www.coursera.org/courses?query=creative%20writing',
            'rating': 4.6,
            'enrolled_count': 67000,
            'image_url': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop',
            'external_id': 'creative-writing-coursera'
        },
        {
            'id': 'edx_philosophy',
            'title': 'Philosophy and Critical Thinking',
            'provider': 'edX',
            'description': 'Explore philosophical concepts, ethics, logic, and critical reasoning skills.',
            'duration': '2-4 months',
            'skill_level': 'Beginner',
            'category': 'arts_humanities',
            'url': 'https://www.edx.org/learn/philosophy',
            'rating': 4.5,
            'enrolled_count': 45000,
            'image_url': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
            'external_id': 'philosophy-edx'
        },
        {
            'id': 'khan_music',
            'title': 'Music Theory and Composition',
            'provider': 'Khan Academy',
            'description': 'Learn music fundamentals, theory, and basic composition techniques.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'arts_humanities',
            'url': 'https://www.khanacademy.org/humanities/music',
            'rating': 4.4,
            'enrolled_count': 750000,
            'image_url': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
            'external_id': 'khan-music'
        },
        {
            'id': 'coursera_nutrition',
            'title': 'Nutrition and Wellness',
            'provider': 'Coursera',
            'description': 'Learn about healthy eating, nutrition science, and lifestyle wellness.',
            'duration': '1-2 months',
            'skill_level': 'Beginner',
            'category': 'healthcare',
            'url': 'https://www.coursera.org/courses?query=nutrition',
            'rating': 4.7,
            'enrolled_count': 125000,
            'image_url': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop',
            'external_id': 'nutrition-coursera'
        },
        {
            'id': 'edx_education',
            'title': 'Education and Teaching Methods',
            'provider': 'edX',
            'description': 'Learn modern teaching strategies, educational psychology, and classroom management.',
            'duration': '2-4 months',
            'skill_level': 'Beginner',
            'category': 'education',
            'url': 'https://www.edx.org/learn/education',
            'rating': 4.6,
            'enrolled_count': 78000,
            'image_url': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
            'external_id': 'education-edx'
        },
        {
            'id': 'futurelearn_languages',
            'title': 'Language Learning',
            'provider': 'FutureLearn',
            'description': 'Learn new languages with interactive lessons and cultural immersion.',
            'duration': '4-8 weeks',
            'skill_level': 'Beginner',
            'category': 'language',
            'url': 'https://www.futurelearn.com/subjects/language-courses',
            'rating': 4.5,
            'enrolled_count': 92000,
            'image_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
            'external_id': 'languages-futurelearn'
        },
        {
            'id': 'coursera_project_management',
            'title': 'Project Management Fundamentals',
            'provider': 'Coursera',
            'description': 'Learn project planning, risk management, and team leadership skills.',
            'duration': '2-3 months',
            'skill_level': 'Beginner',
            'category': 'business',
            'url': 'https://www.coursera.org/courses?query=project%20management',
            'rating': 4.8,
            'enrolled_count': 234000,
            'image_url': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
            'external_id': 'project-management-coursera'
        },
        {
            'id': 'khan_grammar',
            'title': 'Grammar and Writing',
            'provider': 'Khan Academy',
            'description': 'Master English grammar, punctuation, and effective writing techniques.',
            'duration': 'Self-paced',
            'skill_level': 'Beginner',
            'category': 'language',
            'url': 'https://www.khanacademy.org/humanities/grammar',
            'rating': 4.5,
            'enrolled_count': 1100000,
            'image_url': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop',
            'external_id': 'khan-grammar'
        },
        {
            'id': 'coursera_blockchain',
            'title': 'Blockchain and Cryptocurrency',
            'provider': 'Coursera',
            'description': 'Learn blockchain technology, cryptocurrency fundamentals, and smart contracts.',
            'duration': '2-4 months',
            'skill_level': 'Intermediate',
            'category': 'technology',
            'url': 'https://www.coursera.org/courses?query=blockchain',
            'rating': 4.6,
            'enrolled_count': 156000,
            'image_url': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop',
            'external_id': 'blockchain-coursera'
        }
    ]

    # Filter by provider if specified
    provider = request.query_params.get('provider', None)
    if provider:
        free_courses_data = [course for course in free_courses_data if course['provider'].lower() == provider.lower()]

    # Filter by category if specified
    category = request.query_params.get('category', None)
    if category:
        free_courses_data = [course for course in free_courses_data if course['category'] == category]

    # Filter by skill level if specified
    skill_level = request.query_params.get('skill_level', None)
    if skill_level:
        free_courses_data = [course for course in free_courses_data if course['skill_level'].lower() == skill_level.lower()]

    # Search by title or description if specified
    search = request.query_params.get('search', None)
    if search:
        search_lower = search.lower()
        free_courses_data = [course for course in free_courses_data
                           if search_lower in course['title'].lower()
                           or search_lower in course['description'].lower()]

    return Response({
        'count': len(free_courses_data),
        'results': free_courses_data
    })
