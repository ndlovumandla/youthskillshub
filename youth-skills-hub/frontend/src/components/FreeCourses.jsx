import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFreeCourses();
  }, []);

  const fetchFreeCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/free-courses/');
      setCourses(response.data.results || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching free courses:', error);
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesProvider = selectedProvider === 'all' || course.provider.toLowerCase() === selectedProvider;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const enrollInCourse = async (course) => {
    try {
      // In a real implementation, this would call your backend to save the enrollment
      // For now, we'll just open the external course URL
      window.open(course.url, '_blank');
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading free courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl text-cyan-400 mb-4">Free Online Courses</h1>
          <p className="text-green-400 text-lg">
            Access thousands of free courses from top universities and educational platforms
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Filters and Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border-2 border-green-400 text-green-400 p-3 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="md:w-48">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-black border-2 border-green-400 text-green-400 p-3 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Providers</option>
              <option value="coursera">Coursera</option>
              <option value="edx">edX</option>
              <option value="khan academy">Khan Academy</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border-2 border-cyan-400 p-6 hover:border-pink-400 transition-colors">
              <div className="mb-4">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover border border-green-400"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl text-cyan-400 font-bold">{course.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.provider === 'Coursera' ? 'bg-red-900 text-red-200' :
                    course.provider === 'edX' ? 'bg-blue-900 text-blue-200' :
                    'bg-purple-900 text-purple-200'
                  }`}>
                    {course.provider}
                  </span>
                </div>

                <p className="text-green-400 text-sm mb-3 line-clamp-3">{course.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-yellow-400">Duration:</span>
                    <span className="text-green-400 ml-1">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Level:</span>
                    <span className="text-green-400 ml-1">{course.skill_level}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Rating:</span>
                    <span className="text-green-400 ml-1">⭐ {course.rating}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Enrolled:</span>
                    <span className="text-green-400 ml-1">{course.enrolled_count.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    course.category === 'coding' ? 'bg-green-900 text-green-200' :
                    course.category === 'digital_literacy' ? 'bg-blue-900 text-blue-200' :
                    course.category === 'renewable_energy' ? 'bg-yellow-900 text-yellow-200' :
                    course.category === 'data_science' ? 'bg-purple-900 text-purple-200' :
                    course.category === 'business' ? 'bg-orange-900 text-orange-200' :
                    'bg-gray-900 text-gray-200'
                  }`}>
                    {course.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => enrollInCourse(course)}
                className="w-full bg-green-400 text-black py-3 px-6 border-2 border-green-400 hover:bg-black hover:text-green-400 transition-colors"
              >
                Start Learning
              </button>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl text-cyan-400 mb-4">No courses found</h3>
            <p className="text-green-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 border-2 border-cyan-400 p-6">
          <h2 className="text-2xl text-cyan-400 mb-4">About Free Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <h3 className="text-cyan-400 mb-2">Quality Education</h3>
              <p className="text-green-400 text-sm">
                Courses from top universities like MIT, Harvard, and Stanford
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-cyan-400 mb-2">Completely Free</h3>
              <p className="text-green-400 text-sm">
                No hidden fees or costs - learn at your own pace
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-cyan-400 mb-2">Earn Certificates</h3>
              <p className="text-green-400 text-sm">
                Get recognized for your achievements with shareable certificates
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreeCourses;
