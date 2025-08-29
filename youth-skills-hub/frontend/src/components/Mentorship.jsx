import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Mentorship = () => {
  const { user } = useAuth();
  const [mentorships, setMentorships] = useState([]);
  const [potentialMentors, setPotentialMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [activeTab, setActiveTab] = useState('find'); // find, my-mentorships

  useEffect(() => {
    if (user) {
      fetchMentorshipData();
    }
  }, [user]);

  const fetchMentorshipData = async () => {
    try {
      const [mentorshipsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/mentorships/'),
      ]);
      setMentorships(mentorshipsRes.data);
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const findMentors = async () => {
    setMatching(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/mentorships/find-mentors/', {
        user_id: user.id,
      });
      setPotentialMentors(response.data);
    } catch (error) {
      console.error('Error finding mentors:', error);
    } finally {
      setMatching(false);
    }
  };

  const requestMentorship = async (mentorId) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/mentorships/', {
        mentor: mentorId,
        mentee: user.id,
        status: 'pending',
      });
      fetchMentorshipData(); // Refresh the list
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading mentorship...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <h1 className="text-2xl text-pink-400">Mentorship Hub</h1>
        <nav className="mt-2">
          <button
            onClick={() => setActiveTab('find')}
            className={`mr-4 ${activeTab === 'find' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab('my-mentorships')}
            className={`${activeTab === 'my-mentorships' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            My Mentorships
          </button>
        </nav>
      </header>

      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'find' && (
            <>
              <section className="text-center mb-8">
                <h2 className="text-4xl text-cyan-400 mb-4">Find Your Perfect Mentor</h2>
                <p className="text-lg mb-6">Our AI-powered matching system connects you with experienced professionals based on your skills, interests, and goals.</p>
                <button
                  onClick={findMentors}
                  disabled={matching}
                  className="bg-green-400 text-black px-6 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400 disabled:opacity-50"
                >
                  {matching ? 'Finding Mentors...' : 'Find My Mentors'}
                </button>
              </section>

              {potentialMentors.length > 0 && (
                <section>
                  <h3 className="text-2xl text-yellow-400 mb-4">Recommended Mentors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {potentialMentors.map((mentor) => (
                      <div key={mentor.id} className="border-2 border-cyan-400 p-6">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">👨‍🏫</div>
                          <h4 className="text-xl text-cyan-400">{mentor.first_name} {mentor.last_name}</h4>
                          <p className="text-green-400">@{mentor.username}</p>
                        </div>

                        {mentor.bio && (
                          <p className="text-green-400 mb-4">{mentor.bio}</p>
                        )}

                        <div className="mb-4">
                          <h5 className="text-yellow-400 mb-2">Skills:</h5>
                          <div className="flex flex-wrap gap-2">
                            {mentor.skills?.map((skill, index) => (
                              <span key={index} className="bg-cyan-900 text-cyan-200 px-2 py-1 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-yellow-400 mb-2">Interests:</h5>
                          <div className="flex flex-wrap gap-2">
                            {mentor.interests?.map((interest, index) => (
                              <span key={index} className="bg-pink-900 text-pink-200 px-2 py-1 rounded text-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => requestMentorship(mentor.id)}
                          className="w-full bg-green-400 text-black py-2 px-4 hover:bg-pink-400"
                        >
                          Request Mentorship
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'my-mentorships' && (
            <>
              <section className="mb-8">
                <h2 className="text-4xl text-cyan-400 mb-4">My Mentorship Connections</h2>
              </section>

              {mentorships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentorships.map((mentorship) => (
                    <div key={mentorship.id} className="border-2 border-cyan-400 p-6">
                      <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">
                          {mentorship.mentor?.id === user?.id ? '👨‍🏫' : '👨‍🎓'}
                        </div>
                        <div>
                          <h4 className="text-xl text-cyan-400">
                            {mentorship.mentor?.id === user?.id
                              ? `${mentorship.mentee?.first_name} ${mentorship.mentee?.last_name}`
                              : `${mentorship.mentor?.first_name} ${mentorship.mentor?.last_name}`
                            }
                          </h4>
                          <p className="text-green-400">
                            {mentorship.mentor?.id === user?.id ? 'Mentee' : 'Mentor'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className={`px-3 py-1 rounded text-sm ${
                          mentorship.status === 'active'
                            ? 'bg-green-900 text-green-200'
                            : mentorship.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-200'
                            : 'bg-red-900 text-red-200'
                        }`}>
                          {mentorship.status}
                        </span>
                      </div>

                      {mentorship.notes && (
                        <p className="text-green-400 mb-4">{mentorship.notes}</p>
                      )}

                      <div className="flex gap-2">
                        <button className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400">
                          Message
                        </button>
                        <button className="bg-green-400 text-black px-4 py-2 hover:bg-pink-400">
                          Schedule Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-green-400">No mentorship connections yet. Find mentors to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mentorship;
