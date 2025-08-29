from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('learner', 'Learner'),
        ('mentor', 'Mentor'),
        ('admin', 'Admin'),
        ('superadmin', 'Superadmin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='learner')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list)  # List of skills
    interests = models.JSONField(default=list)  # List of interests
    phone_number = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    points = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    preferred_language = models.CharField(max_length=10, default='en')
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='hub_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='hub_users',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username

    def add_points(self, points):
        self.points += points
        self.save()

    def get_badges(self):
        return UserBadge.objects.filter(user=self)

class Course(models.Model):
    CATEGORY_CHOICES = [
        ('coding', 'Coding'),
        ('digital_literacy', 'Digital Literacy'),
        ('renewable_energy', 'Renewable Energy'),
        ('other', 'Other'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    skill_level = models.CharField(max_length=20, choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')])
    duration = models.IntegerField(help_text='Duration in hours')
    provider = models.CharField(max_length=100)  # e.g., Coursera, edX
    external_url = models.URLField()
    image = models.ImageField(upload_to='courses/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    enrolled_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def update_enrolled_count(self):
        self.enrolled_count = self.enrollment_set.count()
        self.save()

class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    certificate_url = models.URLField(blank=True)
    rating = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])

    class Meta:
        unique_together = ('user', 'course')

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
            self.user.add_points(10)  # Award points for completion
        super().save(*args, **kwargs)

class Mentorship(models.Model):
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorships_as_mentor')
    learner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorships_as_learner')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)
    rating = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    feedback = models.TextField(blank=True)
    meeting_link = models.URLField(blank=True)  # For video calls

    def __str__(self):
        return f"{self.mentor.username} mentoring {self.learner.username}"

    def complete_session(self):
        self.completed_at = timezone.now()
        self.status = 'completed'
        self.mentor.add_points(20)  # Award points for mentorship session
        self.save()

class StudyGroup(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='study_groups', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_private = models.BooleanField(default=False)
    max_members = models.IntegerField(default=20)
    meeting_link = models.URLField(blank=True)

    def __str__(self):
        return self.name

    def add_member(self, user):
        if self.members.count() < self.max_members:
            self.members.add(user)
            user.add_points(5)  # Award points for joining group
            return True
        return False

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    message_type = models.CharField(max_length=20, choices=[
        ('text', 'Text'),
        ('file', 'File'),
        ('system', 'System')
    ], default='text')
    file_url = models.URLField(blank=True)
    file_name = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.message[:50]}"

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    images = models.JSONField(default=list)  # List of image URLs
    skills_used = models.JSONField(default=list)
    is_verified = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def public_url(self):
        return f"/portfolio/{self.user.username}/{self.id}/"

class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='badges/', default='badges/default.png')
    criteria = models.JSONField()  # e.g., {'courses_completed': 5, 'category': 'coding'}
    points_required = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push'),
        ('in_app', 'In App')
    ], default='in_app')
    action_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.title}"

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=[
        ('webinar', 'Webinar'),
        ('workshop', 'Workshop'),
        ('career_fair', 'Career Fair'),
        ('networking', 'Networking')
    ])
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    external_url = models.URLField(blank=True)
    attendees = models.ManyToManyField(User, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    max_attendees = models.IntegerField(default=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    @property
    def attendee_count(self):
        return self.attendees.count()
