import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from faker import Faker
from hub.models import (
    User, Course, Enrollment, Mentorship, StudyGroup, GroupMessage,
    Portfolio, Badge, UserBadge, Notification, Event
)

fake = Faker()

def create_comprehensive_test_data():
    print("Creating comprehensive test data...")

    # Create 200 diverse users
    users = []
    mentors = []
    learners = []

    print("Creating users...")
    for i in range(200):
        # Weighted random selection for roles (80% learners, 20% mentors)
        role = 'mentor' if fake.random_int(1, 100) <= 20 else 'learner'
        user = User.objects.create_user(
            username=fake.user_name() + str(i),
            email=fake.email(),
            password='password123',
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            role=role,
            bio=fake.paragraph(nb_sentences=3),
            location=fake.city(),
            skills=fake.random_elements([
                'Python', 'JavaScript', 'React', 'Node.js', 'Django', 'Flask',
                'Digital Literacy', 'Microsoft Office', 'Google Workspace',
                'Solar Energy', 'Wind Power', 'Sustainable Farming', 'Green Tech',
                'Data Analysis', 'Machine Learning', 'Web Development',
                'Mobile Development', 'Cybersecurity', 'Cloud Computing'
            ], length=fake.random_int(1, 5)),
            interests=fake.random_elements([
                'Coding', 'Mentorship', 'Education', 'Technology', 'Sustainability',
                'Career Development', 'Networking', 'Innovation', 'Community Building'
            ], length=fake.random_int(1, 3)),
            phone_number=fake.phone_number(),
            points=fake.random_int(0, 1000),
            is_verified=fake.boolean(chance_of_getting_true=70),
            preferred_language=fake.random_element(['en', 'af', 'xh', 'zu'])
        )
        users.append(user)
        if role == 'mentor':
            mentors.append(user)
        else:
            learners.append(user)

    print(f"Created {len(users)} users ({len(mentors)} mentors, {len(learners)} learners)")

    # Create 150 comprehensive courses
    courses = []
    course_templates = [
        # Coding Courses
        {
            'title': 'Python Programming Fundamentals',
            'description': 'Master Python basics including variables, loops, functions, and object-oriented programming.',
            'category': 'coding',
            'skill_level': 'beginner',
            'duration': 24,
            'provider': 'Codecademy',
            'external_url': 'https://www.codecademy.com/learn/learn-python-3'
        },
        {
            'title': 'Advanced Python: Data Science',
            'description': 'Learn pandas, numpy, matplotlib, and scikit-learn for data analysis and visualization.',
            'category': 'coding',
            'skill_level': 'intermediate',
            'duration': 32,
            'provider': 'DataCamp',
            'external_url': 'https://www.datacamp.com/tracks/data-scientist-with-python'
        },
        {
            'title': 'Full-Stack Web Development',
            'description': 'Complete MERN stack development including React, Node.js, Express, and MongoDB.',
            'category': 'coding',
            'skill_level': 'advanced',
            'duration': 48,
            'provider': 'freeCodeCamp',
            'external_url': 'https://www.freecodecamp.org/learn/scientific-computing-with-python/'
        },
        {
            'title': 'JavaScript Mastery',
            'description': 'From basics to advanced concepts including ES6+, async programming, and frameworks.',
            'category': 'coding',
            'skill_level': 'intermediate',
            'duration': 36,
            'provider': 'Udemy',
            'external_url': 'https://www.udemy.com/course/the-complete-javascript-course/'
        },
        {
            'title': 'Machine Learning with Python',
            'description': 'Build ML models using scikit-learn, TensorFlow, and neural networks.',
            'category': 'coding',
            'skill_level': 'advanced',
            'duration': 40,
            'provider': 'Coursera',
            'external_url': 'https://www.coursera.org/learn/machine-learning'
        },
        {
            'title': 'React Native Mobile Development',
            'description': 'Create cross-platform mobile apps for iOS and Android using React Native.',
            'category': 'coding',
            'skill_level': 'intermediate',
            'duration': 28,
            'provider': 'React Native',
            'external_url': 'https://reactnative.dev/docs/getting-started'
        },
        {
            'title': 'Cybersecurity Fundamentals',
            'description': 'Learn ethical hacking, network security, and cybersecurity best practices.',
            'category': 'coding',
            'skill_level': 'intermediate',
            'duration': 30,
            'provider': 'Cybrary',
            'external_url': 'https://www.cybrary.it/course/comptia-cysa/'
        },
        {
            'title': 'Cloud Computing with AWS',
            'description': 'Master Amazon Web Services including EC2, S3, Lambda, and serverless architecture.',
            'category': 'coding',
            'skill_level': 'advanced',
            'duration': 35,
            'provider': 'AWS',
            'external_url': 'https://aws.amazon.com/training/'
        },

        # Digital Literacy Courses
        {
            'title': 'Digital Skills for Beginners',
            'description': 'Essential computer skills including file management, internet browsing, and basic software use.',
            'category': 'digital_literacy',
            'skill_level': 'beginner',
            'duration': 16,
            'provider': 'Google Digital Garage',
            'external_url': 'https://learndigital.withgoogle.com/digitalgarage'
        },
        {
            'title': 'Microsoft Office Mastery',
            'description': 'Complete guide to Word, Excel, PowerPoint, and Outlook for professional productivity.',
            'category': 'digital_literacy',
            'skill_level': 'intermediate',
            'duration': 20,
            'provider': 'Microsoft',
            'external_url': 'https://www.microsoft.com/en-us/learning'
        },
        {
            'title': 'Online Safety and Privacy',
            'description': 'Protect yourself online: password management, phishing awareness, and data privacy.',
            'category': 'digital_literacy',
            'skill_level': 'beginner',
            'duration': 12,
            'provider': 'Internet Society',
            'external_url': 'https://www.internetsociety.org/learn/'
        },
        {
            'title': 'Social Media Marketing',
            'description': 'Create engaging content, grow audiences, and measure social media ROI.',
            'category': 'digital_literacy',
            'skill_level': 'intermediate',
            'duration': 24,
            'provider': 'HubSpot Academy',
            'external_url': 'https://academy.hubspot.com/courses/social-media-marketing'
        },
        {
            'title': 'E-commerce Fundamentals',
            'description': 'Start and manage an online business including Shopify, payment processing, and marketing.',
            'category': 'digital_literacy',
            'skill_level': 'intermediate',
            'duration': 22,
            'provider': 'Shopify',
            'external_url': 'https://www.shopify.com/academy'
        },
        {
            'title': 'Digital Photography',
            'description': 'Master DSLR cameras, composition, editing with Lightroom, and photo storytelling.',
            'category': 'digital_literacy',
            'skill_level': 'beginner',
            'duration': 18,
            'provider': 'Adobe',
            'external_url': 'https://www.adobe.com/creativecloud/photography/discover/digital-photography.html'
        },

        # Renewable Energy Courses
        {
            'title': 'Solar Energy Systems',
            'description': 'Design, install, and maintain residential and commercial solar power systems.',
            'category': 'renewable_energy',
            'skill_level': 'intermediate',
            'duration': 28,
            'provider': 'Solar Energy International',
            'external_url': 'https://www.solarenergy.org/'
        },
        {
            'title': 'Wind Power Technology',
            'description': 'Learn wind turbine design, installation, maintenance, and power generation.',
            'category': 'renewable_energy',
            'skill_level': 'advanced',
            'duration': 32,
            'provider': 'Wind Energy Institute',
            'external_url': 'https://www.windenergy.org/'
        },
        {
            'title': 'Sustainable Living Practices',
            'description': 'Reduce your environmental impact through energy conservation and sustainable habits.',
            'category': 'renewable_energy',
            'skill_level': 'beginner',
            'duration': 16,
            'provider': 'edX',
            'external_url': 'https://www.edx.org/learn/sustainability'
        },
        {
            'title': 'Green Building Design',
            'description': 'Sustainable architecture principles, LEED certification, and eco-friendly construction.',
            'category': 'renewable_energy',
            'skill_level': 'advanced',
            'duration': 36,
            'provider': 'USGBC',
            'external_url': 'https://www.usgbc.org/education'
        },
        {
            'title': 'Electric Vehicle Technology',
            'description': 'EV batteries, charging infrastructure, motor design, and future of transportation.',
            'category': 'renewable_energy',
            'skill_level': 'intermediate',
            'duration': 24,
            'provider': 'Tesla',
            'external_url': 'https://www.tesla.com/'
        },
        {
            'title': 'Energy Storage Solutions',
            'description': 'Battery technology, grid storage, and renewable energy integration.',
            'category': 'renewable_energy',
            'skill_level': 'advanced',
            'duration': 30,
            'provider': 'NREL',
            'external_url': 'https://www.nrel.gov/'
        }
    ]

    print("Creating courses...")
    for i in range(150):
        if i < len(course_templates):
            template = course_templates[i]
        else:
            # Generate additional courses
            categories = ['coding', 'digital_literacy', 'renewable_energy']
            skill_levels = ['beginner', 'intermediate', 'advanced']
            providers = ['Coursera', 'Udemy', 'edX', 'Khan Academy', 'LinkedIn Learning', 'YouTube', 'Skillshare']

            template = {
                'title': fake.sentence(nb_words=6)[:-1],  # Remove period
                'description': fake.paragraph(nb_sentences=3),
                'category': fake.random_element(categories),
                'skill_level': fake.random_element(skill_levels),
                'duration': fake.random_int(8, 60),
                'provider': fake.random_element(providers),
                'external_url': f"https://{fake.domain_name()}/course/{fake.slug()}"
            }

        course = Course.objects.create(**template)
        courses.append(course)

    print(f"Created {len(courses)} courses")

    # Create enrollments (users enrolling in courses)
    print("Creating enrollments...")
    enrollments = []
    for user in users:
        # Each user enrolls in 2-8 random courses
        num_enrollments = fake.random_int(2, 8)
        enrolled_courses = fake.random_elements(courses, length=num_enrollments, unique=True)

        for course in enrolled_courses:
            enrollment = Enrollment.objects.create(
                user=user,
                course=course,
                progress=fake.random_int(0, 100),
                completed=fake.boolean(chance_of_getting_true=30),
                rating=fake.random_int(1, 5) if fake.boolean(chance_of_getting_true=60) else 0
            )
            enrollments.append(enrollment)

    print(f"Created {len(enrollments)} enrollments")

    # Create mentorship relationships
    print("Creating mentorships...")
    mentorships = []
    for learner in learners[:100]:  # First 100 learners
        if mentors:  # If we have mentors available
            mentor = fake.random_element(mentors)
            mentorship = Mentorship.objects.create(
                mentor=mentor,
                learner=learner,
                course=fake.random_element(courses) if fake.boolean(chance_of_getting_true=70) else None,
                status=fake.random_element(['pending', 'active', 'completed']),
                notes=fake.paragraph(nb_sentences=2),
                rating=fake.random_int(1, 5) if fake.boolean(chance_of_getting_true=40) else 0
            )
            mentorships.append(mentorship)

    print(f"Created {len(mentorships)} mentorships")

    # Create study groups
    print("Creating study groups...")
    study_groups = []
    for i in range(50):
        creator = fake.random_element(users)
        group = StudyGroup.objects.create(
            name=fake.sentence(nb_words=4)[:-1],
            description=fake.paragraph(nb_sentences=2),
            course=fake.random_element(courses) if fake.boolean(chance_of_getting_true=60) else None,
            creator=creator,
            is_private=fake.boolean(chance_of_getting_true=20),
            max_members=fake.random_int(5, 25),
            meeting_link=f"https://meet.google.com/{fake.random_letters(length=10)}" if fake.boolean(chance_of_getting_true=50) else ""
        )
        study_groups.append(group)

        # Add members to study groups
        num_members = fake.random_int(2, min(15, len(users)))
        members = fake.random_elements(users, length=num_members, unique=True)
        for member in members:
            if member != creator:  # Creator is already a member
                group.members.add(member)

    print(f"Created {len(study_groups)} study groups")

    # Create group messages
    print("Creating group messages...")
    group_messages = []
    for group in study_groups:
        # Create 5-20 messages per group
        num_messages = fake.random_int(5, 20)
        group_members = list(group.members.all())

        for _ in range(num_messages):
            if group_members:
                sender = fake.random_element(group_members)
                message = GroupMessage.objects.create(
                    group=group,
                    sender=sender,
                    message=fake.paragraph(nb_sentences=fake.random_int(1, 3)),
                    message_type=fake.random_element(['text', 'file', 'system']),
                    file_url=f"https://example.com/files/{fake.file_name()}" if fake.boolean(chance_of_getting_true=20) else "",
                    file_name=fake.file_name() if fake.boolean(chance_of_getting_true=20) else ""
                )
                group_messages.append(message)

    print(f"Created {len(group_messages)} group messages")

    # Create portfolios
    print("Creating portfolios...")
    portfolios = []
    for user in users[:80]:  # First 80 users get portfolios
        portfolio = Portfolio.objects.create(
            user=user,
            title=fake.sentence(nb_words=5)[:-1],
            description=fake.paragraph(nb_sentences=4),
            project_url=f"https://{fake.domain_name()}/project/{fake.slug()}" if fake.boolean(chance_of_getting_true=70) else "",
            github_url=f"https://github.com/{user.username}/{fake.slug()}" if fake.boolean(chance_of_getting_true=60) else "",
            images=[f"https://picsum.photos/400/300?random={i}" for i in range(fake.random_int(0, 5))],
            skills_used=fake.random_elements(['Python', 'JavaScript', 'React', 'Django', 'HTML', 'CSS'], length=fake.random_int(1, 4)),
            is_verified=fake.boolean(chance_of_getting_true=40),
            is_public=fake.boolean(chance_of_getting_true=80)
        )
        portfolios.append(portfolio)

    print(f"Created {len(portfolios)} portfolios")

    # Create comprehensive badges
    print("Creating badges...")
    badges = []
    badge_templates = [
        {
            'name': 'First Steps',
            'description': 'Complete your first course',
            'criteria': {'courses_completed': 1},
            'points_required': 0
        },
        {
            'name': 'Learning Enthusiast',
            'description': 'Complete 5 courses',
            'criteria': {'courses_completed': 5},
            'points_required': 50
        },
        {
            'name': 'Code Master',
            'description': 'Complete 10 coding courses',
            'criteria': {'courses_completed': 10, 'category': 'coding'},
            'points_required': 200
        },
        {
            'name': 'Digital Expert',
            'description': 'Complete 8 digital literacy courses',
            'criteria': {'courses_completed': 8, 'category': 'digital_literacy'},
            'points_required': 150
        },
        {
            'name': 'Green Champion',
            'description': 'Complete 6 renewable energy courses',
            'criteria': {'courses_completed': 6, 'category': 'renewable_energy'},
            'points_required': 120
        },
        {
            'name': 'Mentor',
            'description': 'Mentor 5 learners',
            'criteria': {'mentees_helped': 5},
            'points_required': 100
        },
        {
            'name': 'Community Builder',
            'description': 'Create 3 study groups',
            'criteria': {'groups_created': 3},
            'points_required': 75
        },
        {
            'name': 'Portfolio Creator',
            'description': 'Create and publish a portfolio',
            'criteria': {'portfolio_created': True},
            'points_required': 25
        },
        {
            'name': 'High Achiever',
            'description': 'Earn 500 points',
            'criteria': {'points_earned': 500},
            'points_required': 500
        },
        {
            'name': 'Consistency King',
            'description': 'Maintain a 30-day learning streak',
            'criteria': {'learning_streak': 30},
            'points_required': 300
        }
    ]

    for template in badge_templates:
        badge = Badge.objects.create(**template)
        badges.append(badge)

    print(f"Created {len(badges)} badges")

    # Award badges to users
    print("Awarding badges...")
    user_badges = []
    for user in users:
        # Award 1-4 random badges to each user
        num_badges = fake.random_int(1, 4)
        awarded_badges = fake.random_elements(badges, length=num_badges, unique=True)

        for badge in awarded_badges:
            user_badge = UserBadge.objects.create(
                user=user,
                badge=badge
            )
            user_badges.append(user_badge)

    print(f"Awarded {len(user_badges)} badges to users")

    # Create notifications
    print("Creating notifications...")
    notifications = []
    notification_types = [
        'Welcome to Youth Skills Hub!',
        'New course available in your area',
        'Mentorship request received',
        'Course completion certificate ready',
        'New badge earned!',
        'Study group invitation',
        'Event reminder',
        'Portfolio featured',
        'Weekly progress report',
        'Mentor feedback received'
    ]

    for user in users:
        # Create 2-8 notifications per user
        num_notifications = fake.random_int(2, 8)
        for _ in range(num_notifications):
            notification = Notification.objects.create(
                user=user,
                title=fake.random_element(notification_types),
                message=fake.paragraph(nb_sentences=2),
                is_read=fake.boolean(chance_of_getting_true=60),
                notification_type=fake.random_element(['email', 'sms', 'push', 'in_app']),
                action_url=f"/{fake.random_element(['courses', 'dashboard', 'mentorship', 'profile'])}" if fake.boolean(chance_of_getting_true=50) else ""
            )
            notifications.append(notification)

    print(f"Created {len(notifications)} notifications")

    # Create events
    print("Creating events...")
    events = []
    event_types = ['webinar', 'workshop', 'career_fair', 'networking']
    event_titles = [
        'Tech Career Fair 2025',
        'Digital Skills Workshop',
        'Renewable Energy Summit',
        'Coding Bootcamp Info Session',
        'Mentorship Networking Event',
        'Portfolio Review Workshop',
        'Industry Guest Speaker Series',
        'Job Interview Preparation',
        'Entrepreneurship Workshop',
        'AI and Future Careers'
    ]

    for i in range(30):
        start_date = fake.date_time_between(start_date='now', end_date='+60d')
        end_date = start_date + timedelta(hours=fake.random_int(1, 8))

        event = Event.objects.create(
            title=fake.random_element(event_titles),
            description=fake.paragraph(nb_sentences=4),
            event_type=fake.random_element(event_types),
            start_time=start_date,
            end_time=end_date,
            external_url=f"https://eventbrite.com/e/{fake.slug()}" if fake.boolean(chance_of_getting_true=60) else "",
            max_attendees=fake.random_int(20, 200),
            is_active=fake.boolean(chance_of_getting_true=80)
        )
        events.append(event)

        # Add attendees to events
        num_attendees = fake.random_int(5, min(50, len(users)))
        attendees = fake.random_elements(users, length=num_attendees, unique=True)
        for attendee in attendees:
            event.attendees.add(attendee)

    print(f"Created {len(events)} events")

    print("\n" + "="*50)
    print("COMPREHENSIVE TEST DATA CREATION COMPLETE!")
    print("="*50)
    print(f"Users: {len(users)}")
    print(f"Courses: {len(courses)}")
    print(f"Enrollments: {len(enrollments)}")
    print(f"Mentorships: {len(mentorships)}")
    print(f"Study Groups: {len(study_groups)}")
    print(f"Group Messages: {len(group_messages)}")
    print(f"Portfolios: {len(portfolios)}")
    print(f"Badges: {len(badges)}")
    print(f"User Badges: {len(user_badges)}")
    print(f"Notifications: {len(notifications)}")
    print(f"Events: {len(events)}")
    print("="*50)

if __name__ == '__main__':
    create_comprehensive_test_data()
