import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from faker import Faker
from hub.models import User, Course, Enrollment, Mentorship, StudyGroup, Portfolio, Badge, UserBadge, Notification, Event, GroupMessage

fake = Faker()

def create_sample_data():
    print("Creating sample users...")
    # Create sample users with different roles
    users_data = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'learner',
            'bio': 'Aspiring software developer passionate about coding and technology.',
            'skills': ['Python', 'JavaScript', 'HTML', 'CSS'],
            'interests': ['Web Development', 'Machine Learning', 'Open Source'],
            'points': 150
        },
        {
            'username': 'sarah_smith',
            'email': 'sarah@example.com',
            'first_name': 'Sarah',
            'last_name': 'Smith',
            'role': 'mentor',
            'bio': 'Senior software engineer with 8 years experience in web development.',
            'skills': ['Python', 'Django', 'React', 'Node.js', 'AWS'],
            'interests': ['Mentoring', 'Tech Education', 'Agile Development'],
            'points': 500
        },
        {
            'username': 'mike_johnson',
            'email': 'mike@example.com',
            'first_name': 'Mike',
            'last_name': 'Johnson',
            'role': 'learner',
            'bio': 'Digital literacy enthusiast helping others learn technology.',
            'skills': ['Microsoft Office', 'Google Workspace', 'Basic Programming'],
            'interests': ['Digital Literacy', 'Education Technology'],
            'points': 200
        },
        {
            'username': 'linda_brown',
            'email': 'linda@example.com',
            'first_name': 'Linda',
            'last_name': 'Brown',
            'role': 'mentor',
            'bio': 'Renewable energy consultant and educator.',
            'skills': ['Solar Power', 'Wind Energy', 'Sustainable Design', 'Project Management'],
            'interests': ['Climate Change', 'Sustainable Development', 'Green Technology'],
            'points': 350
        },
        {
            'username': 'admin_user',
            'email': 'admin@youthskills.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'bio': 'Platform administrator managing content and users.',
            'skills': ['System Administration', 'Content Management'],
            'interests': ['Education Technology', 'Platform Management'],
            'points': 100
        }
    ]

    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password123')
            user.save()
        users.append(user)

    print(f"Created {len(users)} users")

    # Create badges
    print("Creating badges...")
    badges_data = [
        {
            'name': 'Code Master',
            'description': 'Complete 5 coding courses',
            'points_required': 50,
            'criteria': {'courses_completed': 5, 'category': 'coding'}
        },
        {
            'name': 'Green Tech Pioneer',
            'description': 'Complete renewable energy course',
            'points_required': 25,
            'criteria': {'courses_completed': 1, 'category': 'renewable_energy'}
        },
        {
            'name': 'Mentor Ally',
            'description': 'Complete 10 mentorship sessions',
            'points_required': 200,
            'criteria': {'sessions': 10}
        },
        {
            'name': 'Learning Enthusiast',
            'description': 'Complete 10 courses',
            'points_required': 100,
            'criteria': {'courses_completed': 10}
        },
        {
            'name': 'First Steps',
            'description': 'Complete your first course',
            'points_required': 10,
            'criteria': {'courses_completed': 1}
        },
        {
            'name': 'Study Group Leader',
            'description': 'Create and manage a study group',
            'points_required': 30,
            'criteria': {'study_groups_created': 1}
        }
    ]

    badges = []
    for badge_data in badges_data:
        badge, created = Badge.objects.get_or_create(
            name=badge_data['name'],
            defaults=badge_data
        )
        badges.append(badge)

    print(f"Created {len(badges)} badges")

    # Create events
    print("Creating events...")
    events_data = [
        {
            'title': 'Web Development Career Workshop',
            'description': 'Learn about career opportunities in web development and get tips from industry professionals.',
            'event_type': 'workshop',
            'start_time': datetime.now() + timedelta(days=7),
            'end_time': datetime.now() + timedelta(days=7, hours=2),
            'external_url': 'https://meet.google.com/example1'
        },
        {
            'title': 'Renewable Energy Career Fair',
            'description': 'Connect with companies working in renewable energy and explore job opportunities.',
            'event_type': 'career_fair',
            'start_time': datetime.now() + timedelta(days=14),
            'end_time': datetime.now() + timedelta(days=14, hours=4),
            'external_url': 'https://zoom.us/example2'
        },
        {
            'title': 'Digital Skills Webinar',
            'description': 'Free webinar on essential digital skills for the modern workplace.',
            'event_type': 'webinar',
            'start_time': datetime.now() + timedelta(days=3),
            'end_time': datetime.now() + timedelta(days=3, hours=1),
            'external_url': 'https://youtube.com/live/example3'
        }
    ]

    events = []
    for event_data in events_data:
        event = Event.objects.create(**event_data)
        events.append(event)

    print(f"Created {len(events)} events")

    # Create study groups
    print("Creating study groups...")
    study_groups_data = [
        {
            'name': 'Python Beginners Study Group',
            'description': 'A supportive community for beginners learning Python programming.',
            'course': Course.objects.filter(title__icontains='python').first(),
            'creator': users[0],
            'max_members': 15
        },
        {
            'name': 'Web Development Bootcamp',
            'description': 'Intensive study group for learning modern web development technologies.',
            'course': Course.objects.filter(category='coding').first(),
            'creator': users[1],
            'max_members': 20
        },
        {
            'name': 'Digital Literacy Essentials',
            'description': 'Learn essential digital skills for work and life.',
            'course': Course.objects.filter(category='digital_literacy').first(),
            'creator': users[2],
            'max_members': 25
        }
    ]

    study_groups = []
    for group_data in study_groups_data:
        group = StudyGroup.objects.create(**group_data)
        study_groups.append(group)

    print(f"Created {len(study_groups)} study groups")

    # Create portfolios
    print("Creating portfolios...")
    portfolios_data = [
        {
            'user': users[0],
            'title': 'Personal Portfolio Website',
            'description': 'A responsive portfolio website built with React and deployed on Vercel.',
            'project_url': 'https://johndoe.dev',
            'github_url': 'https://github.com/johndoe/portfolio',
            'skills_used': ['React', 'JavaScript', 'CSS', 'HTML'],
            'is_public': True
        },
        {
            'user': users[1],
            'title': 'E-commerce Platform',
            'description': 'Full-stack e-commerce solution with Django backend and React frontend.',
            'project_url': 'https://sarahshop.com',
            'github_url': 'https://github.com/sarahsmith/ecommerce',
            'skills_used': ['Django', 'React', 'PostgreSQL', 'Stripe API'],
            'is_public': True
        },
        {
            'user': users[2],
            'title': 'Digital Literacy Training Materials',
            'description': 'Comprehensive training materials for digital literacy programs.',
            'project_url': 'https://digitalliteracyguide.com',
            'skills_used': ['Content Creation', 'Microsoft Office', 'Google Workspace'],
            'is_public': True
        }
    ]

    portfolios = []
    for portfolio_data in portfolios_data:
        portfolio = Portfolio.objects.create(**portfolio_data)
        portfolios.append(portfolio)

    print(f"Created {len(portfolios)} portfolios")

    # Create some enrollments and mentorships
    print("Creating enrollments and mentorships...")
    learner = users[0]
    mentor = users[1]

    # Create mentorship
    mentorship = Mentorship.objects.create(
        mentor=mentor,
        learner=learner,
        course=Course.objects.filter(category='coding').first(),
        status='active',
        scheduled_at=datetime.now() + timedelta(days=2)
    )

    # Create some enrollments
    courses = Course.objects.all()[:5]
    for course in courses:
        Enrollment.objects.get_or_create(
            user=learner,
            course=course,
            defaults={'progress': 75 if course == courses[0] else 100}
        )

    print("Sample data created successfully!")
    print(f"Total users: {User.objects.count()}")
    print(f"Total courses: {Course.objects.count()}")
    print(f"Total enrollments: {Enrollment.objects.count()}")
    print(f"Total mentorships: {Mentorship.objects.count()}")
    print(f"Total study groups: {StudyGroup.objects.count()}")
    print(f"Total portfolios: {Portfolio.objects.count()}")
    print(f"Total badges: {Badge.objects.count()}")
    print(f"Total events: {Event.objects.count()}")

if __name__ == '__main__':
    create_sample_data()</content>
<parameter name="filePath">c:\Users\User\OneDrive\Desktop\Education\youth-skills-hub\backend\populate_comprehensive.py
