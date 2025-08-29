import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import CourseCard from '../components/CourseCard'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('')
  const { user } = useAuth()

  const categories = [
    'coding', 'digital_literacy', 'renewable_energy', 'business', 'design', 'data_science'
  ]

  const skillLevels = ['beginner', 'intermediate', 'advanced']

  useEffect(() => {
    fetchCourses()
  }, [searchTerm, selectedCategory, selectedSkillLevel])

  const fetchCourses = () => {
    let url = 'http://127.0.0.1:8000/api/courses/'
    const params = new URLSearchParams()

    if (searchTerm) params.append('search', searchTerm)
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedSkillLevel) params.append('skill_level', selectedSkillLevel)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    axios.get(url)
      .then(response => {
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
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSkillLevel('')
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl text-pink-400 hover:text-cyan-400">Youth Skills Hub</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400">Welcome, {user.username}!</span>
              <Link
                to="/dashboard"
                className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/"
              className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
            >
              Login / Register
            </Link>
          )}
        </div>
        <nav className="mt-2">
          <Link to="/" className="mr-4 hover:text-pink-400">Home</Link>
          <span className="mr-4 text-cyan-400">Courses</span>
          <Link to="/mentorship" className="mr-4 hover:text-pink-400">Mentorship</Link>
          <Link to="/study-groups" className="mr-4 hover:text-pink-400">Groups</Link>
          <Link to="/about" className="hover:text-pink-400">About</Link>
        </nav>
      </header>

      <main className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl text-cyan-400 mb-4">Explore Our Courses</h2>
          <p className="text-lg mb-6">Discover skills that will shape your future</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 border border-green-400 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 px-3 py-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="">All Levels</option>
                {skillLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={clearFilters}
                className="w-full bg-red-600 text-white px-4 py-2 border-2 border-red-600 hover:bg-black hover:text-red-400"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-2xl">Loading courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onEnrollmentChange={fetchCourses}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-green-400 mb-4">No courses found matching your criteria.</p>
            <p className="text-sm text-yellow-400">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
            >
              Show All Courses
            </button>
          </div>
        )}

        {/* Course Categories Info */}
        <div className="mt-12 border-t border-green-400 pt-8">
          <h3 className="text-2xl text-yellow-400 mb-4">Course Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">💻 Coding</h4>
              <p>Learn programming languages, web development, and software engineering.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">🌐 Digital Literacy</h4>
              <p>Master essential digital skills for the modern workplace.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">⚡ Renewable Energy</h4>
              <p>Explore sustainable energy solutions and green technology.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">💼 Business</h4>
              <p>Develop entrepreneurial skills and business acumen.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">🎨 Design</h4>
              <p>Learn UI/UX design, graphic design, and creative tools.</p>
            </div>
            <div className="border border-green-400 p-4">
              <h4 className="text-cyan-400 mb-2">📊 Data Science</h4>
              <p>Master data analysis, machine learning, and analytics.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-green-400 p-4 text-center">
        <p>&copy; 2025 Youth Skills Hub. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Courses
