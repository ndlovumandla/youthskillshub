import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const courseRes = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`);
      setCourse(courseRes.data);
      
      // Check if user is enrolled based on the course data
      if (courseRes.data.is_enrolled) {
        // Fetch enrollment details if enrolled
        try {
          const enrollmentRes = await axios.get(`http://127.0.0.1:8000/api/enrollments/?course=${id}`);
          if (enrollmentRes.data.length > 0) {
            setEnrollment(enrollmentRes.data[0]);
          }
        } catch (enrollmentError) {
          console.error('Error fetching enrollment:', enrollmentError);
        }
      }
    } catch (error) {
      console.error('Error fetching course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    setEnrolling(true);
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/courses/${course.id}/enroll/`);
      setEnrollment(response.data);
      // Refresh course data to update enrollment status
      await fetchCourseDetail();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-cyan-400 hover:text-pink-400"
          >
            ← Back
          </button>
          <h1 className="text-2xl text-pink-400">Youth Skills Hub</h1>
          <div></div>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <section className="mb-8">
            <div className="border-2 border-cyan-400 p-6">
              <h1 className="text-4xl text-cyan-400 mb-4">{course.title}</h1>
              <p className="text-xl text-green-400 mb-4">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <h3 className="text-yellow-400">Category</h3>
                  <p className="text-green-400">{course.category}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-yellow-400">Duration</h3>
                  <p className="text-green-400">{course.duration} hours</p>
                </div>
                <div className="text-center">
                  <h3 className="text-yellow-400">Difficulty</h3>
                  <p className="text-green-400">{course.difficulty || 'Beginner'}</p>
                </div>
              </div>

              {enrollment ? (
                <div className="border-2 border-green-400 p-4 mb-4">
                  <h3 className="text-cyan-400 mb-2">Your Progress</h3>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div
                      className="bg-green-400 h-4 rounded-full"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-green-400">{enrollment.progress}% Complete</p>
                  <p className="text-yellow-400">Status: {enrollment.completed ? 'Completed' : 'In Progress'}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400">
                      Continue Learning
                    </button>
                    {enrollment.completed && (
                      <button className="bg-green-400 text-black px-4 py-2 hover:bg-pink-400">
                        📜 View Certificate
                      </button>
                    )}
                  </div>
                </div>
              ) : course.is_enrolled ? (
                <div className="border-2 border-yellow-400 p-4 mb-4">
                  <h3 className="text-yellow-400 mb-2">🎉 You're Enrolled!</h3>
                  <p className="text-green-400">You can now access this course content.</p>
                  <button className="mt-2 bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400">
                    Start Learning
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-green-400 text-black py-3 px-6 border-2 border-green-400 hover:bg-black hover:text-green-400 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              )}
            </div>
          </section>

          {/* Course Content */}
          <section className="mb-8">
            <h2 className="text-2xl text-yellow-400 mb-4">Course Content</h2>
            <div className="border-2 border-cyan-400 p-6">
              <div className="space-y-4">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, index) => (
                    <div key={index} className="border-b border-green-400 pb-4">
                      <h3 className="text-xl text-cyan-400">{module.title}</h3>
                      <p className="text-green-400">{module.description}</p>
                      <p className="text-yellow-400">Duration: {module.duration} min</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-green-400">Course modules will be available soon!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Instructor Info */}
          {course.instructor && (
            <section className="mb-8">
              <h2 className="text-2xl text-yellow-400 mb-4">About the Instructor</h2>
              <div className="border-2 border-cyan-400 p-6">
                <h3 className="text-xl text-cyan-400">{course.instructor.name}</h3>
                <p className="text-green-400">{course.instructor.bio}</p>
                <div className="mt-4">
                  <h4 className="text-yellow-400">Expertise:</h4>
                  <p className="text-green-400">{course.instructor.expertise}</p>
                </div>
              </div>
            </section>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl text-yellow-400 mb-4">Prerequisites</h2>
              <div className="border-2 border-cyan-400 p-6">
                <ul className="list-disc list-inside space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="text-green-400">{prereq}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
