import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUsers, FaUserPlus, FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState('team-alpha');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({
    'team-alpha': {
      name: 'Project Team Alpha 👥',
      type: 'group',
      members: 4,
      messages: [
        {
          id: 1,
          text: "Welcome to the team chat! Let's coordinate our project work here.",
          sender: 'system',
          timestamp: new Date()
        }
      ]
    },
    'dr-smith': {
      name: 'Dr. Smith 👨‍🏫',
      type: 'supervisor',
      messages: [
        {
          id: 1,
          text: "Hello! I'm here to support your project. Feel free to ask any questions.",
          sender: 'dr-smith',
          timestamp: new Date()
        }
      ]
    }
  });
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample students and supervisors for search
  const allUsers = [
    { id: 's1', name: 'Ahmed Mohamed', avatar: '👦', role: 'student', major: 'Computer Science' },
    { id: 's2', name: 'Sarah Ali', avatar: '👧', role: 'student', major: 'AI Engineering' },
    { id: 's3', name: 'Mohammed Hassan', avatar: '👨‍💻', role: 'student', major: 'Software Engineering' },
    { id: 's4', name: 'Fatima Ibrahim', avatar: '👩‍🔬', role: 'student', major: 'Data Science' },
    { id: 's5', name: 'Omar Khalid', avatar: '👨‍🎓', role: 'student', major: 'Cybersecurity' },
    { id: 'sup1', name: 'Dr. Smith Johnson', avatar: '👨‍🏫', role: 'supervisor', department: 'Computer Science' },
    { id: 'sup2', name: 'Dr. Layla Hassan', avatar: '👩‍🏫', role: 'supervisor', department: 'AI & Robotics' },
    { id: 'sup3', name: 'Prof. Ahmad Khalil', avatar: '👨‍💼', role: 'supervisor', department: 'Software Engineering' },
    { id: 'sup4', name: 'Dr. Noor Abdullah', avatar: '👩‍💼', role: 'supervisor', department: 'Data Science' }
  ];

  const [selectedStudents, setSelectedStudents] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats[activeChat]?.messages]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setChats(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...prev[activeChat].messages, newMessage]
      }
    }));

    setMessage('');
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === '' || selectedStudents.length === 0) return;

    const newGroupId = `group-${Date.now()}`;
    const newGroup = {
      name: groupName,
      type: 'group',
      members: selectedStudents.length + 1, // +1 for the creator
      messages: [
        {
          id: 1,
          text: `Group "${groupName}" created! ${selectedStudents.length + 1} members joined.`,
          sender: 'system',
          timestamp: new Date()
        }
      ]
    };

    setChats(prev => ({ ...prev, [newGroupId]: newGroup }));
    setActiveChat(newGroupId);
    setShowCreateGroup(false);
    setGroupName('');
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => 
      prev.some(s => s.id === student.id)
        ? prev.filter(s => s.id !== student.id)
        : [...prev, student]
    );
  };

  const filteredStudents = allUsers.filter(u => u.role === 'student').filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChatUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
  );

  const startChatWithUser = (user) => {
    const chatId = `user-${user.id}`;
    
    // Check if chat already exists
    if (!chats[chatId]) {
      const newChat = {
        name: user.name,
        type: user.role,
        avatar: user.avatar,
        messages: [
          {
            id: 1,
            text: `Chat started with ${user.name}`,
            sender: 'system',
            timestamp: new Date()
          }
        ]
      };
      
      setChats(prev => ({ ...prev, [chatId]: newChat }));
    }
    
    setActiveChat(chatId);
    setShowSearchUsers(false);
    setSidebarSearchTerm('');
  };

  return (
    <div className="chat-page">
      {/* Back Button */}
      <button 
        className="back-to-dashboard-btn"
        onClick={() => navigate('/student')}
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
                            {user.role === 'student' ? `Student - ${user.major}` : `Supervisor - ${user.department}`}
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
                  {chat.type === 'ai' ? '🤖' : chat.type === 'group' ? '👥' : '👨‍🏫'}
                </div>
                <div className="chat-info">
                  <span className="chat-name">{chat.name}</span>
                  {chat.type === 'group' && (
                    <span className="chat-members">{chat.members} members</span>
                  )}
                  <span className="chat-preview">
                    {chat.messages[chat.messages.length - 1]?.text.slice(0, 30)}...
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
                        <span className="student-major">{student.major}</span>
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