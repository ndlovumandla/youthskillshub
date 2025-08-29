import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import CourseCard from '../components/CourseCard'

const Home = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const fetchCourses = () => {
    axios.get('http://127.0.0.1:8000/api/courses/')
      .then(response => {
        // Handle both paginated and non-paginated responses
        const coursesData = response.data.results || response.data || [];
        console.log('Fetched courses:', coursesData.length);
        setCourses(coursesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setLoading(false);
      })
  };

  useEffect(() => {
    fetchCourses();
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-pink-400">Youth Skills Hub</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400">Welcome, {user.first_name || user.username}!</span>
              <Link
                to="/dashboard"
                className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
            >
              Login / Register
            </button>
          )}
        </div>
        <nav className="mt-2">
          <Link to="/" className="mr-4 hover:text-pink-400">Home</Link>
          <Link to="/courses" className="mr-4 hover:text-pink-400">Courses</Link>
          <Link to="/free-courses" className="mr-4 hover:text-pink-400">Free Courses</Link>
          <Link to="/mentorship" className="mr-4 hover:text-pink-400">Mentorship</Link>
          <Link to="/study-groups" className="mr-4 hover:text-pink-400">Groups</Link>
          {user && (user.role === 'admin' || user.role === 'superadmin') && (
            <Link to="/admin" className="mr-4 hover:text-pink-400 text-yellow-400">Admin</Link>
          )}
          <Link to="/about" className="hover:text-pink-400">About</Link>
        </nav>
      </header>

      <main className="p-8">
        <section id="home" className="text-center mb-8">
          <h2 className="text-4xl text-cyan-400 mb-4">Welcome to the 90s Skills Revolution!</h2>
          <p className="text-lg mb-6">Connect, Learn, Grow – Retro Style</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-400 text-black px-6 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
          >
            Get Started
          </button>
        </section>

        <section id="courses" className="mb-8">
          <h3 className="text-2xl text-yellow-400 mb-4">Featured Courses</h3>
          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.slice(0, 3).map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onEnrollmentChange={fetchCourses}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-green-400 mb-4">No courses available at the moment.</p>
              <p className="text-sm text-yellow-400">Please check back later or contact support if this persists.</p>
            </div>
          )}
        </section>

        <section id="mentorship" className="mb-8">
          <h3 className="text-2xl text-purple-400 mb-4">Why Choose Our Mentorship Program?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">Expert Guidance</h4>
              <p>Get mentored by industry professionals with years of experience.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">Personalized Learning</h4>
              <p>Receive tailored advice based on your goals and current skill level.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">Career Advancement</h4>
              <p>Build your network and accelerate your career growth.</p>
            </div>
          </div>
        </section>

        <section id="groups" className="mb-8">
          <h3 className="text-2xl text-orange-400 mb-4">Study Groups & Community</h3>
          <div className="border border-green-400 p-6">
            <p className="mb-4">Join our vibrant community of learners!</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Collaborate on projects with fellow students</li>
              <li>Share knowledge and resources</li>
              <li>Get help when you're stuck</li>
              <li>Build lasting professional relationships</li>
            </ul>
          </div>
        </section>

        <section id="about" className="text-center">
          <h3 className="text-2xl text-pink-400 mb-4">About Youth Skills Hub</h3>
          <p className="max-w-2xl mx-auto">
            We're on a mission to bridge the skills gap in South Africa by providing accessible,
            high-quality education and mentorship opportunities to youth. Our platform combines
            traditional learning with modern technology to create an engaging, effective learning experience.
          </p>
        </section>
      </main>

      <footer className="border-t-2 border-green-400 p-4 text-center">
        <p>&copy; 2025 Youth Skills Hub. All rights reserved.</p>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

export default Home
