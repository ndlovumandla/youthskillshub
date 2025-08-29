import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from .models import User, Course, Enrollment

class MentorMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)

    def get_user_profile_text(self, user):
        """Convert user profile to text for matching"""
        skills = ' '.join(user.skills) if user.skills else ''
        interests = ' '.join(user.interests) if user.interests else ''
        bio = user.bio or ''
        return f"{skills} {interests} {bio}".lower()

    def find_best_mentor(self, learner):
        """Find the best mentor match for a learner"""
        mentors = User.objects.filter(role='mentor')

        if not mentors:
            return None

        learner_profile = self.get_user_profile_text(learner)
        mentor_profiles = [self.get_user_profile_text(mentor) for mentor in mentors]

        if not any(mentor_profiles) or not learner_profile:
            return mentors.first()  # Return first mentor if no profiles

        # Add learner profile to the list for vectorization
        all_profiles = [learner_profile] + mentor_profiles

        try:
            tfidf_matrix = self.vectorizer.fit_transform(all_profiles)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

            # Get the index of the most similar mentor
            best_match_index = np.argmax(similarities)
            return mentors[best_match_index]
        except:
            return mentors.first()

class CourseRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=500)

    def get_course_text(self, course):
        """Convert course to text for recommendation"""
        return f"{course.title} {course.description} {course.category}".lower()

    def recommend_courses(self, user, limit=5):
        """Recommend courses based on user's profile and completed courses"""
        # Get user's completed courses
        completed_course_ids = Enrollment.objects.filter(
            user=user, completed=True
        ).values_list('course_id', flat=True)

        # Get all available courses except completed ones
        available_courses = Course.objects.filter(is_active=True).exclude(id__in=completed_course_ids)

        if not available_courses:
            return Course.objects.filter(is_active=True)[:limit]

        user_profile = f"{' '.join(user.skills)} {' '.join(user.interests)}".lower()
        course_texts = [self.get_course_text(course) for course in available_courses]

        if not user_profile or not any(course_texts):
            return list(available_courses[:limit])

        try:
            # Vectorize user profile and course descriptions
            all_texts = [user_profile] + course_texts
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

            # Sort courses by similarity score
            course_similarity_pairs = list(zip(available_courses, similarities))
            course_similarity_pairs.sort(key=lambda x: x[1], reverse=True)

            recommended_courses = [course for course, _ in course_similarity_pairs[:limit]]
            return recommended_courses
        except:
            return list(available_courses[:limit])

def award_badges(user):
    """Check and award badges to user based on their achievements"""
    from .models import Badge, UserBadge

    # Get user's stats
    completed_courses = Enrollment.objects.filter(user=user, completed=True).count()
    coding_courses = Enrollment.objects.filter(
        user=user, completed=True, course__category='coding'
    ).count()
    renewable_energy_courses = Enrollment.objects.filter(
        user=user, completed=True, course__category='renewable_energy'
    ).count()
    mentorship_sessions = user.mentorships_as_learner.filter(status='completed').count()

    awarded_badges = []

    # Check for Code Master badge
    if coding_courses >= 5:
        badge, created = Badge.objects.get_or_create(
            name='Code Master',
            defaults={
                'description': "Awarded for completing 5 coding courses",
                'criteria': {'courses_completed': 5, 'category': 'coding'}
            }
        )
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge,
            defaults={'is_active': True}
        )
        if created:
            awarded_badges.append(badge)

    # Check for Green Tech Pioneer badge
    if renewable_energy_courses >= 1:
        badge, created = Badge.objects.get_or_create(
            name='Green Tech Pioneer',
            defaults={
                'description': "Awarded for completing 1 renewable energy course",
                'criteria': {'courses_completed': 1, 'category': 'renewable_energy'}
            }
        )
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge,
            defaults={'is_active': True}
        )
        if created:
            awarded_badges.append(badge)

    # Check for Mentor Ally badge
    if mentorship_sessions >= 10:
        badge, created = Badge.objects.get_or_create(
            name='Mentor Ally',
            defaults={
                'description': "Awarded for completing 10 mentorship sessions",
                'criteria': {'sessions': 10}
            }
        )
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge,
            defaults={'is_active': True}
        )
        if created:
            awarded_badges.append(badge)

    # Check for Learning Enthusiast badge
    if completed_courses >= 10:
        badge, created = Badge.objects.get_or_create(
            name='Learning Enthusiast',
            defaults={
                'description': "Awarded for completing 10 courses",
                'criteria': {'courses_completed': 10}
            }
        )
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge,
            defaults={'is_active': True}
        )
        if created:
            awarded_badges.append(badge)

    # Check for First Steps badge
    if completed_courses >= 1:
        badge, created = Badge.objects.get_or_create(
            name='First Steps',
            defaults={
                'description': "Awarded for completing your first course",
                'criteria': {'courses_completed': 1}
            }
        )
        user_badge, created = UserBadge.objects.get_or_create(
            user=user,
            badge=badge,
            defaults={'is_active': True}
        )
        if created:
            awarded_badges.append(badge)

    return awarded_badges</content>
<parameter name="filePath">c:\Users\User\OneDrive\Desktop\Education\youth-skills-hub\backend\hub\ml_model.py
