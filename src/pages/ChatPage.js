import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUsers, FaUserPlus, FaRobot, FaSearch, FaTimes } from 'react-icons/fa';
import './ChatPage.css';

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState('ai-assistant');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({
    'ai-assistant': {
      name: 'AI Assistant 🤖',
      type: 'ai',
      messages: [
        {
          id: 1,
          text: "Hello! I'm your AI assistant. I can help you with:\n\n• Project ideas and planning\n• Technical guidance\n• Team collaboration tips\n• Research assistance\n• Presentation preparation\n\nWhat would you like help with today?",
          sender: 'ai',
          timestamp: new Date()
        }
      ]
    },
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
  const messagesEndRef = useRef(null);

  // Sample students for group creation
  const students = [
    { id: 1, name: 'Ahmed Mohamed', avatar: '👦', major: 'Computer Science' },
    { id: 2, name: 'Sarah Ali', avatar: '👧', major: 'AI Engineering' },
    { id: 3, name: 'Mohammed Hassan', avatar: '👨‍💻', major: 'Software Engineering' },
    { id: 4, name: 'Fatima Ibrahim', avatar: '👩‍🔬', major: 'Data Science' },
    { id: 5, name: 'Omar Khalid', avatar: '👨‍🎓', major: 'Cybersecurity' }
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

    // AI Response simulation
    if (activeChat === 'ai-assistant') {
      setTimeout(() => {
        const aiResponses = [
          "That's an interesting point! Have you considered breaking this down into smaller tasks?",
          "I can help you with that. Here are some resources that might be useful...",
          "Great question! Based on your project scope, I'd recommend...",
          "I understand your challenge. Many successful projects have overcome this by...",
          "Let me suggest some approaches that have worked for similar projects..."
        ];
        
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          sender: 'ai',
          timestamp: new Date()
        };

        setChats(prev => ({
          ...prev,
          [activeChat]: {
            ...prev[activeChat],
            messages: [...prev[activeChat].messages, aiMessage]
          }
        }));
      }, 1000);
    }
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-page">
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

          <div className="chat-list">
            {Object.entries(chats).map(([chatId, chat]) => (
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
                    {chats[activeChat].type === 'ai' ? '🤖' : 
                     chats[activeChat].type === 'group' ? '👥' : '👨‍🏫'}
                  </div>
                  <div>
                    <h3>{chats[activeChat].name}</h3>
                    {chats[activeChat].type === 'group' && (
                      <span className="members-count">{chats[activeChat].members} members</span>
                    )}
                    {chats[activeChat].type === 'ai' && (
                      <span className="ai-status">Online - Ready to help! 💡</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {chats[activeChat].messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'user' ? 'user-message' : 
                                 msg.sender === 'ai' ? 'ai-message' : 'system-message'}`}
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
                  placeholder={
                    activeChat === 'ai-assistant' 
                      ? "Ask the AI assistant anything about your project..." 
                      : "Type a message..."
                  }
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