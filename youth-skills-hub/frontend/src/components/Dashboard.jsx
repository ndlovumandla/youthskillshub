import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from './CourseCard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsRes, badgesRes, userRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/enrollments/'),
        axios.get('http://127.0.0.1:8000/api/user-badges/'),
        axios.get('http://127.0.0.1:8000/api/users/me/'),
      ]);

      setEnrollments(enrollmentsRes.data);
      setBadges(badgesRes.data);
      setStats({
        points: userRes.data.points || 0,
        level: Math.floor((userRes.data.points || 0) / 100) + 1,
        ...userRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({
        points: 0,
        level: 1
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-pink-400">Welcome back, {user?.first_name}!</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 border-2 border-red-600 hover:bg-black hover:text-red-600"
          >
            Logout
          </button>
        </div>
        <nav className="mt-2">
          <Link to="/dashboard" className="mr-4 hover:text-pink-400">Dashboard</Link>
          <Link to="/" className="mr-4 hover:text-pink-400">Browse Courses</Link>
          <Link to="/mentorship" className="mr-4 hover:text-pink-400">Mentorship</Link>
          <Link to="/study-groups" className="mr-4 hover:text-pink-400">Study Groups</Link>
          <Link to="/leaderboard" className="mr-4 hover:text-pink-400">Leaderboard</Link>
          <Link to="#" className="hover:text-pink-400">Portfolio</Link>
        </nav>
      </header>

      <main className="p-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="border-2 border-cyan-400 p-4 text-center">
            <h3 className="text-2xl text-cyan-400">{stats.points || 0}</h3>
            <p className="text-green-400">Skill Points</p>
          </div>
          <div className="border-2 border-cyan-400 p-4 text-center">
            <h3 className="text-2xl text-cyan-400">{enrollments.length}</h3>
            <p className="text-green-400">Enrolled Courses</p>
          </div>
          <div className="border-2 border-cyan-400 p-4 text-center">
            <h3 className="text-2xl text-cyan-400">{badges.length}</h3>
            <p className="text-green-400">Badges Earned</p>
          </div>
          <div className="border-2 border-cyan-400 p-4 text-center">
            <h3 className="text-2xl text-cyan-400">{stats.level || 1}</h3>
            <p className="text-green-400">Current Level</p>
          </div>
        </section>

        {/* My Courses */}
        <section className="mb-8">
          <h2 className="text-2xl text-yellow-400 mb-4">My Courses</h2>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="border-2 border-cyan-400 p-4">
                  <h3 className="text-xl text-cyan-400">{enrollment.course.title}</h3>
                  <p className="text-green-400">Progress: {enrollment.progress}%</p>
                  <p className="text-sm text-yellow-400">Status: {enrollment.status}</p>
                  <button className="mt-2 bg-green-400 text-black px-4 py-2 hover:bg-pink-400">
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400">You haven't enrolled in any courses yet.</p>
          )}
        </section>

        {/* Badges */}
        <section className="mb-8">
          <h2 className="text-2xl text-yellow-400 mb-4">My Badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map(userBadge => (
                <div key={userBadge.id} className="border-2 border-pink-400 p-4 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="text-cyan-400">{userBadge.badge.name}</h3>
                  <p className="text-sm text-green-400">{userBadge.badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400">No badges earned yet. Keep learning!</p>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl text-yellow-400 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/"
              className="border-2 border-green-400 p-4 hover:border-cyan-400 text-center block"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="text-cyan-400">Browse Courses</h3>
              <p className="text-green-400">Find new courses to enroll</p>
            </Link>
            <Link
              to="/mentorship"
              className="border-2 border-green-400 p-4 hover:border-cyan-400 text-center block"
            >
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="text-cyan-400">Find Mentor</h3>
              <p className="text-green-400">Get guidance from experts</p>
            </Link>
            <Link
              to="/study-groups"
              className="border-2 border-green-400 p-4 hover:border-cyan-400 text-center block"
            >
              <div className="text-2xl mb-2">👥</div>
              <h3 className="text-cyan-400">Study Groups</h3>
              <p className="text-green-400">Learn with peers</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
