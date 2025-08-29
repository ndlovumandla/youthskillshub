import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Chat = ({ groupId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/study-groups/${groupId}/messages/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/group-messages/`, {
        group: groupId,
        message: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="retro-card">
        <div className="retro-loading text-center">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="retro-card h-96 flex flex-col">
      <h3 className="retro-subtitle mb-4">Group Chat</h3>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 p-2 bg-black border border-green-400 rounded">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 p-2 rounded ${
                message.sender?.id === user?.id
                  ? 'bg-cyan-900 ml-8 text-cyan-100'
                  : 'bg-green-900 mr-8 text-green-100'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-yellow-400">
                  {message.sender?.first_name} {message.sender?.last_name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-green-400 mt-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="retro-input flex-1"
          maxLength={500}
        />
        <button
          type="submit"
          className="retro-button whitespace-nowrap"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>

      <div className="text-xs text-green-400 mt-2 text-center">
        💬 Real-time chat • Messages refresh every 5 seconds
      </div>
    </div>
  );
};

export default Chat;
