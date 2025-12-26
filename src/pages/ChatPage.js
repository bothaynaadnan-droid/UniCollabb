import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUsers, FaUserPlus, FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import '../styles/ChatPage.css';
import { api } from '../api/client';
import { createConversation, listMessages, listMyConversations, sendMessage } from '../api/conversations';

const ChatPage = ({ user }) => {
  const navigate = useNavigate();
  
  const handleBackToDashboard = () => {
    if (user?.type === 'supervisor') {
      navigate('/supervisor');
    } else {
      navigate('/student');
    }
  };
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const messagesEndRef = useRef(null);

  const [allUsers, setAllUsers] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats[activeChat]?.messages]);

  const mapMessage = (m) => {
    const sentAt = m?.sent_at ? new Date(m.sent_at) : new Date();
    return {
      id: m?.id,
      text: m?.message_text || '',
      sender: m?.sender_id === user?.id ? 'user' : 'other',
      senderName: m?.sender_name,
      timestamp: sentAt
    };
  };

  const loadConversations = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const conversations = await listMyConversations(user.id);
      const nextChats = {};

      for (const conv of conversations) {
        const key = `conv-${conv.id}`;
        nextChats[key] = {
          id: conv.id,
          name: conv.name,
          type: conv.type,
          members: conv.participant_count,
          messages: []
        };
      }

      setChats(nextChats);

      const firstKey = Object.keys(nextChats)[0] || null;
      setActiveChat(firstKey);
    } catch (e) {
      setLoadError(e?.response?.data?.message || e?.message || 'Failed to load conversations');
      setChats({});
      setActiveChat(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/user', { params: { page: 1, limit: 100 } });
      const users = res?.data?.data || [];
      setAllUsers(users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        university: u.university,
        avatar: u.role === 'supervisor' ? '👨‍🏫' : '👨‍🎓'
      })));
    } catch (e) {
      setAllUsers([]);
    }
  };

  const loadActiveMessages = async () => {
    const chat = chats[activeChat];
    if (!chat?.id) return;

    try {
      const { messages } = await listMessages(chat.id, { page: 1, limit: 50 });
      setChats(prev => ({
        ...prev,
        [activeChat]: {
          ...prev[activeChat],
          messages: (messages || []).map(mapMessage)
        }
      }));
    } catch (e) {
      // keep existing messages
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, [user?.id]);

  useEffect(() => {
    if (activeChat) loadActiveMessages();
  }, [activeChat]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    const chat = chats[activeChat];
    if (!chat?.id || !user?.id) return;

    const optimistic = {
      id: `tmp-${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setChats(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...(prev[activeChat]?.messages || []), optimistic]
      }
    }));

    const outgoingText = message;
    setMessage('');

    try {
      const created = await sendMessage({
        conversation_id: chat.id,
        sender_id: user.id,
        message_text: outgoingText,
        message_type: 'text'
      });

      // Replace optimistic message
      setChats(prev => {
        const current = prev[activeChat];
        if (!current) return prev;
        const nextMessages = (current.messages || []).map(m => (m.id === optimistic.id ? mapMessage({ ...created, sent_at: new Date().toISOString(), sender_name: user?.name }) : m));
        return {
          ...prev,
          [activeChat]: {
            ...current,
            messages: nextMessages
          }
        };
      });
    } catch (e) {
      // Keep optimistic message but mark as failed text
      setChats(prev => {
        const current = prev[activeChat];
        if (!current) return prev;
        const nextMessages = (current.messages || []).map(m => (m.id === optimistic.id ? { ...m, text: `${m.text} (failed)` } : m));
        return {
          ...prev,
          [activeChat]: {
            ...current,
            messages: nextMessages
          }
        };
      });
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === '' || selectedStudents.length === 0) return;

    (async () => {
      try {
        const participants = selectedStudents.map(s => s.id);
        await createConversation({
          name: groupName.trim(),
          type: 'group',
          created_by: user.id,
          participants
        });

        await loadConversations();
        setShowCreateGroup(false);
        setGroupName('');
        setSelectedStudents([]);
      } catch (e) {
        alert(e?.response?.data?.message || e?.message || 'Failed to create group');
      }
    })();
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => 
      prev.some(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  const filteredStudents = allUsers
    .filter(u => u.role === 'student')
    .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredChatUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
  );

  const startChatWithUser = (targetUser) => {
    // For now, only navigate to an existing conversation if present.
    // Creating a new direct conversation requires a dedicated endpoint/flow.
    const existingKey = Object.keys(chats).find(k => chats[k]?.name === targetUser.name);
    if (existingKey) {
      setActiveChat(existingKey);
    }
    setShowSearchUsers(false);
    setSidebarSearchTerm('');
  };

  return (
    <div className="chat-page">
      {/* Back Button */}
      <button 
        className="back-to-dashboard-btn"
        onClick={handleBackToDashboard}
        style={{ 
          position: 'absolute', 
          top: '80px', 
          left: '20px', 
          zIndex: 1000,
          padding: '8px 12px',
          fontSize: '14px'
        }}
      >
        <FaArrowLeft style={{ fontSize: '12px' }} /> Back
      </button>

      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h3>Chats</h3>
            <button 
              className="create-group-btn"
              onClick={() => setShowCreateGroup(true)}
            >
              <FaUserPlus /> New Group
            </button>
          </div>

          {/* Search Users Section */}
          <div className="sidebar-search">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={sidebarSearchTerm}
                onChange={(e) => {
                  setSidebarSearchTerm(e.target.value);
                  setShowSearchUsers(e.target.value.length > 0);
                }}
                placeholder="Search students or supervisors..."
              />
              {sidebarSearchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => {
                    setSidebarSearchTerm('');
                    setShowSearchUsers(false);
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchUsers && sidebarSearchTerm && (
              <div className="search-results">
                {filteredChatUsers.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      {filteredChatUsers.length} result(s) found
                    </div>
                    {filteredChatUsers.map(user => (
                      <div
                        key={user.id}
                        className="search-result-item"
                        onClick={() => startChatWithUser(user)}
                      >
                        <div className="user-avatar">{user.avatar}</div>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <span className="user-role">
                            {user.role === 'student'
                              ? `Student${user.university ? ` - ${user.university}` : ''}`
                              : `Supervisor${user.university ? ` - ${user.university}` : ''}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="no-results">
                    No users found matching "{sidebarSearchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="chat-list">{Object.entries(chats).map(([chatId, chat]) => (
              <div
                key={chatId}
                className={`chat-item ${activeChat === chatId ? 'active' : ''}`}
                onClick={() => setActiveChat(chatId)}
              >
                <div className="chat-avatar">
                  {chat.type === 'group' ? '👥' : '💬'}
                </div>
                <div className="chat-info">
                  <span className="chat-name">{chat.name}</span>
                  {chat.type === 'group' && (
                    <span className="chat-members">{chat.members} members</span>
                  )}
                  <span className="chat-preview">
                    {(chat.messages[chat.messages.length - 1]?.text || '').slice(0, 30)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {chats[activeChat] && (
            <>
              <div className="chat-header">
                <div className="chat-title">
                  <div className="chat-avatar-large">
                    {chats[activeChat].type === 'group' ? '👥' : '👨‍🏫'}
                  </div>
                  <div>
                    <h3>{chats[activeChat].name}</h3>
                    {chats[activeChat].type === 'group' && (
                      <span className="members-count">{chats[activeChat].members} members</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {chats[activeChat].messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'user' ? 'user-message' : 'system-message'}`}
                  >
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="send-btn">
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay">
          <div className="create-group-modal">
            <div className="modal-header">
              <h3>Create New Group</h3>
              <button className="close-btn" onClick={() => setShowCreateGroup(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>

              <div className="form-group">
                <label>Add Members</label>
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search students by name..."
                  />
                </div>

                <div className="students-list">
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className={`student-item ${selectedStudents.some(s => s.id === student.id) ? 'selected' : ''}`}
                      onClick={() => toggleStudentSelection(student)}
                    >
                      <div className="student-avatar">{student.avatar}</div>
                      <div className="student-info">
                        <span className="student-name">{student.name}</span>
                        <span className="student-major">{student.university || ''}</span>
                      </div>
                      {selectedStudents.some(s => s.id === student.id) && (
                        <div className="checkmark">✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedStudents.length > 0 && (
                  <div className="selected-count">
                    {selectedStudents.length} student(s) selected
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedStudents.length === 0}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;