import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Notification from './Notification';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'coding',
    skill_level: 'beginner',
    duration: 10,
    provider: '',
    external_url: '',
    image: null,
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target_users: 'all', // 'all', 'learners', 'mentors', 'admins'
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [coursesRes, usersRes, statsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/courses/'),
        axios.get('http://127.0.0.1:8000/api/users/'),
        axios.get('http://127.0.0.1:8000/api/public-stats/'),
      ]);

      setCourses(coursesRes.data.results || coursesRes.data);
      setUsers(usersRes.data.results || usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newCourse).forEach(key => {
        if (newCourse[key] !== null) {
          formData.append(key, newCourse[key]);
        }
      });

      await axios.post('http://127.0.0.1:8000/api/courses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewCourse({
        title: '',
        description: '',
        category: 'coding',
        skill_level: 'beginner',
        duration: 10,
        provider: '',
        external_url: '',
        image: null,
      });
      setShowCreateForm(false);
      fetchAdminData();
      showNotification('Course created successfully!', 'success');
    } catch (error) {
      console.error('Error creating course:', error);
      showNotification('Failed to create course. Please try again.', 'error');
    }
  };

  const toggleCourseStatus = async (courseId, isActive) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/courses/${courseId}/`, {
        is_active: !isActive,
      });
      fetchAdminData();
      showNotification(`Course ${!isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating course:', error);
      showNotification('Failed to update course status.', 'error');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editingCourse).forEach(key => {
        if (editingCourse[key] !== null) {
          formData.append(key, editingCourse[key]);
        }
      });

      await axios.put(`http://127.0.0.1:8000/api/courses/${editingCourse.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEditingCourse(null);
      setShowEditForm(false);
      fetchAdminData();
      showNotification('Course updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating course:', error);
      showNotification('Failed to update course. Please try again.', 'error');
    }
  };

  const handleBulkCourseAction = async () => {
    if (selectedCourses.length === 0) {
      showNotification('Please select courses to perform bulk action.', 'error');
      return;
    }

    try {
      if (bulkAction === 'activate') {
        await Promise.all(selectedCourses.map(courseId =>
          axios.patch(`http://127.0.0.1:8000/api/courses/${courseId}/`, { is_active: true })
        ));
        showNotification(`${selectedCourses.length} courses activated successfully!`, 'success');
      } else if (bulkAction === 'deactivate') {
        await Promise.all(selectedCourses.map(courseId =>
          axios.patch(`http://127.0.0.1:8000/api/courses/${courseId}/`, { is_active: false })
        ));
        showNotification(`${selectedCourses.length} courses deactivated successfully!`, 'success');
      } else if (bulkAction === 'delete') {
        await Promise.all(selectedCourses.map(courseId =>
          axios.delete(`http://127.0.0.1:8000/api/courses/${courseId}/`)
        ));
        showNotification(`${selectedCourses.length} courses deleted successfully!`, 'success');
      }

      setSelectedCourses([]);
      setBulkAction('');
      fetchAdminData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showNotification('Failed to perform bulk action.', 'error');
    }
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.id));
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-400 mb-4">Access Denied</h1>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-pink-400">Admin Panel</h1>
          <div className="text-cyan-400">
            Welcome, {user.first_name} ({user.role})
          </div>
        </div>
        <nav className="mt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`mr-4 ${activeTab === 'dashboard' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`mr-4 ${activeTab === 'courses' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Manage Courses
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`mr-4 ${activeTab === 'users' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`mr-4 ${activeTab === 'analytics' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Analytics
          </button>
        </nav>
      </header>

      <main className="p-8">
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-4xl text-cyan-400 mb-8">Admin Dashboard</h2>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="border-2 border-cyan-400 p-6 text-center">
                <h3 className="text-3xl text-cyan-400">{stats.total_users || 0}</h3>
                <p className="text-green-400">Total Users</p>
              </div>
              <div className="border-2 border-cyan-400 p-6 text-center">
                <h3 className="text-3xl text-cyan-400">{stats.total_courses || 0}</h3>
                <p className="text-green-400">Total Courses</p>
              </div>
              <div className="border-2 border-cyan-400 p-6 text-center">
                <h3 className="text-3xl text-cyan-400">{stats.total_enrollments || 0}</h3>
                <p className="text-green-400">Total Enrollments</p>
              </div>
              <div className="border-2 border-cyan-400 p-6 text-center">
                <h3 className="text-3xl text-cyan-400">{stats.total_study_groups || 0}</h3>
                <p className="text-green-400">Study Groups</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="border-2 border-green-400 p-6 hover:border-cyan-400 text-center"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-cyan-400 mb-2">Add New Course</h3>
                <p className="text-green-400">Create and publish new courses</p>
              </button>

              <div className="border-2 border-cyan-400 p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-cyan-400 mb-2">User Management</h3>
                <p className="text-green-400">Manage user roles and permissions</p>
              </div>

              <div className="border-2 border-cyan-400 p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-cyan-400 mb-2">View Analytics</h3>
                <p className="text-green-400">Monitor platform performance</p>
              </div>
            </div>

            {/* Notification Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl text-cyan-400">Send Notifications</h3>
                <button
                  onClick={() => setShowNotificationForm(true)}
                  className="bg-pink-400 text-black px-6 py-2 border-2 border-pink-400 hover:bg-black hover:text-pink-400"
                >
                  📢 Send Notification
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'courses' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl text-cyan-400">Manage Courses</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-400 text-black px-6 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
                >
                  + Add New Course
                </button>
                {selectedCourses.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="bg-black border-2 border-cyan-400 text-green-400 px-3 py-2 focus:border-pink-400 focus:outline-none"
                    >
                      <option value="">Bulk Actions</option>
                      <option value="activate">Activate</option>
                      <option value="deactivate">Deactivate</option>
                      <option value="delete">Delete</option>
                    </select>
                    <button
                      onClick={handleBulkCourseAction}
                      className="bg-pink-400 text-black px-4 py-2 border-2 border-pink-400 hover:bg-black hover:text-pink-400"
                    >
                      Apply ({selectedCourses.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Select All Checkbox */}
            <div className="mb-4">
              <label className="flex items-center text-green-400">
                <input
                  type="checkbox"
                  checked={selectedCourses.length === courses.length && courses.length > 0}
                  onChange={handleSelectAllCourses}
                  className="mr-2 bg-black border-2 border-green-400"
                />
                Select All Courses ({selectedCourses.length} selected)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="border-2 border-cyan-400 p-6 relative">
                  {/* Checkbox */}
                  <div className="absolute top-4 right-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleCourseSelection(course.id)}
                      className="bg-black border-2 border-green-400"
                    />
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl text-cyan-400 pr-8">{course.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      course.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-green-400 mb-4 line-clamp-3">{course.description}</p>

                  <div className="mb-4">
                    <p className="text-yellow-400">Category: {course.category}</p>
                    <p className="text-pink-400">Enrolled: {course.enrolled_count}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCourseStatus(course.id, course.is_active)}
                      className={`px-4 py-2 text-sm ${
                        course.is_active
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-4xl text-cyan-400 mb-8">Manage Users</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-cyan-400">
                <thead>
                  <tr className="border-b-2 border-cyan-400">
                    <th className="p-4 text-left text-cyan-400">Username</th>
                    <th className="p-4 text-left text-cyan-400">Email</th>
                    <th className="p-4 text-left text-cyan-400">Role</th>
                    <th className="p-4 text-left text-cyan-400">Points</th>
                    <th className="p-4 text-left text-cyan-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-green-400">
                      <td className="p-4 text-green-400">{user.username}</td>
                      <td className="p-4 text-green-400">{user.email}</td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="bg-black border border-green-400 text-green-400 px-2 py-1"
                        >
                          <option value="learner">Learner</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      </td>
                      <td className="p-4 text-yellow-400">{user.points || 0}</td>
                      <td className="p-4">
                        <button className="bg-cyan-400 text-black px-3 py-1 hover:bg-pink-400 text-sm">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <h2 className="text-4xl text-cyan-400 mb-8">Platform Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-cyan-400 p-6">
                <h3 className="text-2xl text-cyan-400 mb-4">Courses by Category</h3>
                <div className="space-y-2">
                  {Object.entries(stats.courses_by_category || {}).map(([category, count]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-green-400 capitalize">{category.replace('_', ' ')}</span>
                      <span className="text-yellow-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-cyan-400 p-6">
                <h3 className="text-2xl text-cyan-400 mb-4">User Growth</h3>
                <div className="text-center">
                  <div className="text-4xl text-green-400 mb-2">{stats.user_growth || 0}</div>
                  <p className="text-yellow-400">New users this month</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-400 p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-cyan-400">Create New Course</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-green-400 hover:text-pink-400 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Provider</label>
                  <input
                    type="text"
                    value={newCourse.provider}
                    onChange={(e) => setNewCourse({...newCourse, provider: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-green-400 mb-2">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="coding">Coding</option>
                    <option value="digital_literacy">Digital Literacy</option>
                    <option value="renewable_energy">Renewable Energy</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="data_science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Skill Level</label>
                  <select
                    value={newCourse.skill_level}
                    onChange={(e) => setNewCourse({...newCourse, skill_level: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({...newCourse, duration: parseInt(e.target.value)})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 mb-2">External URL</label>
                <input
                  type="url"
                  value={newCourse.external_url}
                  onChange={(e) => setNewCourse({...newCourse, external_url: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  placeholder="https://example.com/course"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 mb-2">Course Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCourse({...newCourse, image: e.target.files[0]})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-400 text-black py-3 px-6 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Course Modal */}
      {showEditForm && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-400 p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-cyan-400">Edit Course</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingCourse(null);
                }}
                className="text-green-400 hover:text-pink-400 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Provider</label>
                  <input
                    type="text"
                    value={editingCourse.provider || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, provider: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 mb-2">Description</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-green-400 mb-2">Category</label>
                  <select
                    value={editingCourse.category || 'coding'}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="coding">Coding</option>
                    <option value="digital_literacy">Digital Literacy</option>
                    <option value="renewable_energy">Renewable Energy</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="data_science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Skill Level</label>
                  <select
                    value={editingCourse.skill_level || 'beginner'}
                    onChange={(e) => setEditingCourse({...editingCourse, skill_level: e.target.value})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={editingCourse.duration || 10}
                    onChange={(e) => setEditingCourse({...editingCourse, duration: parseInt(e.target.value)})}
                    className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 mb-2">External URL</label>
                <input
                  type="url"
                  value={editingCourse.external_url || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, external_url: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  placeholder="https://example.com/course"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 mb-2">Course Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditingCourse({...editingCourse, image: e.target.files[0]})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-400 text-black py-3 px-6 border-2 border-cyan-400 hover:bg-black hover:text-cyan-400"
              >
                Update Course
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Notification Modal */}
      {showNotificationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-pink-400 p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-pink-400">Send Notification</h2>
              <button
                onClick={() => setShowNotificationForm(false)}
                className="text-green-400 hover:text-pink-400 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-green-400 mb-2">Notification Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full bg-black border-2 border-pink-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 mb-2">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full bg-black border-2 border-pink-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 mb-2">Target Users</label>
                <select
                  value={newNotification.target_users}
                  onChange={(e) => setNewNotification({...newNotification, target_users: e.target.value})}
                  className="w-full bg-black border-2 border-pink-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="learners">Learners Only</option>
                  <option value="mentors">Mentors Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-400 text-black py-3 px-6 border-2 border-pink-400 hover:bg-black hover:text-pink-400"
              >
                Send Notification
              </button>
            </form>
          </div>
        </div>
      )}
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
