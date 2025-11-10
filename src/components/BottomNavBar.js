import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComment, FaCalendarAlt, FaStickyNote, FaCog } from 'react-icons/fa';
import './BottomNavBar.css';

const BottomNavBar = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();
    
    const tabs = [
        { 
            id: 'chat', 
            label: 'Chat', 
            icon: <FaComment />, 
            onClick: () => navigate('/chat') 
        },
        { 
            id: 'planning', 
            label: 'Planning', 
            icon: <FaStickyNote />, 
            onClick: () => navigate('/notes-calendar') 
        },
        { 
            id: 'settings', 
            label: 'Settings', 
            icon: <FaCog />, 
            onClick: () => onTabChange('settings') 
        }
    ];

    return (
        <div className="bottom-nav-bar">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={tab.onClick}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default BottomNavBar;