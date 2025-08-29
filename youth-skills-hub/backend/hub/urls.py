from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CourseViewSet, EnrollmentViewSet, MentorshipViewSet, StudyGroupViewSet, PortfolioViewSet, BadgeViewSet, UserBadgeViewSet, NotificationViewSet, EventViewSet, GroupMessageViewSet, leaderboard, public_stats, free_courses

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'mentorships', MentorshipViewSet)
router.register(r'study-groups', StudyGroupViewSet)
router.register(r'portfolios', PortfolioViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'user-badges', UserBadgeViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'events', EventViewSet)
router.register(r'group-messages', GroupMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('public-stats/', public_stats, name='public_stats'),
    path('free-courses/', free_courses, name='free_courses'),
]
