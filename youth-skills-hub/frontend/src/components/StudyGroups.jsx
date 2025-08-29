import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Chat from './Chat';

const StudyGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-groups, create
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroupForChat, setSelectedGroupForChat] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    course: '',
    max_members: 10,
    is_private: false,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/study-groups/'),
        axios.get(`http://127.0.0.1:8000/api/study-groups/?member=${user?.id}`),
      ]);

      setGroups(allGroupsRes.data);
      setMyGroups(myGroupsRes.data);
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/study-groups/', {
        ...newGroup,
        creator: user.id,
      });
      setNewGroup({
        name: '',
        description: '',
        course: '',
        max_members: 10,
        is_private: false,
      });
      setShowCreateForm(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/study-groups/${groupId}/join/`);
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <div className="text-2xl">Loading study groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <header className="border-b-2 border-green-400 p-4">
        <h1 className="text-2xl text-pink-400">Study Groups</h1>
        <nav className="mt-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`mr-4 ${activeTab === 'browse' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            Browse Groups
          </button>
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`mr-4 ${activeTab === 'my-groups' ? 'text-cyan-400' : 'hover:text-pink-400'}`}
          >
            My Groups
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
          >
            Create Group
          </button>
        </nav>
      </header>

      <main className="p-8">
        {activeTab === 'browse' && (
          <>
            <section className="mb-8">
              <h2 className="text-4xl text-cyan-400 mb-4">Find Study Groups</h2>
              <p className="text-lg">Join groups to study with peers and collaborate on projects.</p>
            </section>

            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div key={group.id} className="border-2 border-cyan-400 p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-4">👥</div>
                      <div>
                        <h3 className="text-xl text-cyan-400">{group.name}</h3>
                        <p className="text-green-400">Created by {group.creator?.first_name}</p>
                      </div>
                    </div>

                    <p className="text-green-400 mb-4">{group.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-400">
                          Members: {group.members?.length || 0}/{group.max_members}
                        </span>
                        {group.course && (
                          <span className="text-pink-400">Course: {group.course.title}</span>
                        )}
                      </div>
                      {group.is_private && (
                        <span className="text-red-400 text-sm">🔒 Private Group</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => joinGroup(group.id)}
                        className="bg-green-400 text-black px-4 py-2 hover:bg-pink-400 flex-1"
                        disabled={group.members?.some(member => member.id === user?.id)}
                      >
                        {group.members?.some(member => member.id === user?.id) ? 'Joined' : 'Join Group'}
                      </button>
                      <button className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'my-groups' && (
          <>
            <section className="mb-8">
              <h2 className="text-4xl text-cyan-400 mb-4">My Study Groups</h2>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {myGroups.length > 0 ? (
                  <div className="space-y-4">
                    {myGroups.map((group) => (
                      <div key={group.id} className="border-2 border-cyan-400 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="text-4xl mr-4">👥</div>
                            <div>
                              <h3 className="text-xl text-cyan-400">{group.name}</h3>
                              <p className="text-green-400">Your role: {group.creator?.id === user?.id ? 'Creator' : 'Member'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            group.is_private ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                          }`}>
                            {group.is_private ? 'Private' : 'Public'}
                          </span>
                        </div>

                        <p className="text-green-400 mb-4">{group.description}</p>

                        <div className="mb-4">
                          <h4 className="text-yellow-400 mb-2">Members ({group.members?.length || 0}/{group.max_members})</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.members?.slice(0, 5).map((member) => (
                              <span key={member.id} className="bg-cyan-900 text-cyan-200 px-2 py-1 rounded text-sm">
                                {member.first_name}
                              </span>
                            ))}
                            {group.members && group.members.length > 5 && (
                              <span className="text-green-400 text-sm">+{group.members.length - 5} more</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedGroupForChat(group.id)}
                            className="bg-green-400 text-black px-4 py-2 hover:bg-pink-400 flex-1"
                          >
                            💬 Open Chat
                          </button>
                          <button className="bg-cyan-400 text-black px-4 py-2 hover:bg-pink-400">
                            📅 Schedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-green-400">You haven't joined any study groups yet.</p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="mt-4 bg-green-400 text-black px-4 py-2 border-2 border-green-400 hover:bg-black hover:text-green-400"
                    >
                      Browse Groups
                    </button>
                  </div>
                )}
              </div>

              <div>
                {selectedGroupForChat ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl text-cyan-400">Group Chat</h3>
                      <button
                        onClick={() => setSelectedGroupForChat(null)}
                        className="text-green-400 hover:text-pink-400"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <Chat groupId={selectedGroupForChat} />
                  </div>
                ) : (
                  <div className="border-2 border-cyan-400 p-6 text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl text-cyan-400 mb-2">Select a Group to Chat</h3>
                    <p className="text-green-400">Choose a study group from the list to start chatting with members.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-400 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-cyan-400">Create Study Group</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-green-400 hover:text-pink-400 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-green-400 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-green-400 mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none h-20"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-green-400 mb-2">Max Members</label>
                <input
                  type="number"
                  value={newGroup.max_members}
                  onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value)})}
                  className="w-full bg-black border-2 border-green-400 text-green-400 p-2 focus:border-cyan-400 focus:outline-none"
                  min="2"
                  max="50"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center text-green-400">
                  <input
                    type="checkbox"
                    checked={newGroup.is_private}
                    onChange={(e) => setNewGroup({...newGroup, is_private: e.target.checked})}
                    className="mr-2"
                  />
                  Private Group
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-400 text-black py-2 px-4 border-2 border-green-400 hover:bg-black hover:text-green-400"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
