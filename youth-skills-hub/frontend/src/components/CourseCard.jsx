import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CourseCard = ({ course, onEnrollmentChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleEnroll = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/');
      return;
    }

    setEnrolling(true);
    try {
      await axios.post(`http://127.0.0.1:8000/api/courses/${course.id}/enroll/`);
      // Refresh the course data to update enrollment status
      if (onEnrollmentChange) {
        onEnrollmentChange();
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div
      className="border-2 border-cyan-400 p-4 m-4 bg-black text-green-400 hover:border-pink-400 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-xl text-cyan-400">{course.title}</h3>
      <p className="text-sm">{course.description}</p>
      <p className="text-yellow-400">Category: {course.category}</p>
      <p className="text-pink-400">Duration: {course.duration} hours</p>
      
      <div className="flex justify-between items-center mt-2">
        <button
          className="bg-green-400 text-black px-4 py-2 hover:bg-pink-400"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Course
        </button>
        
        {user && (
          <div className="flex items-center space-x-2">
            {course.is_enrolled ? (
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm">Enrolled</span>
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: `${course.user_progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-yellow-400 text-sm">{course.user_progress || 0}%</span>
              </div>
            ) : (
              <button
                className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400 disabled:opacity-50"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
