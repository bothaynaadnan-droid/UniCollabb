import React, { useState } from 'react';
import { FaLightbulb, FaRobot, FaSpinner } from 'react-icons/fa';
import './ProjectIdeas.css';

const ProjectIdeas = () => {
  const [ideas, setIdeas] = useState([
    {
      id: 1,
      title: 'Virtual Study Group Platform',
      description: 'A platform where students can create virtual study groups, share resources, and schedule study sessions.',
      category: 'IT',
      source: 'user',
      votes: 15
    },
    {
      id: 2,
      title: 'Campus Food Waste Reduction App',
      description: 'Mobile app connecting students with leftover food from campus events to reduce food waste.',
      category: 'Business',
      source: 'user',
      votes: 23
    }
  ]);
  
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'IT' });

  const getAISuggestion = async () => {
    setIsAILoading(true);
    
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiIdeas = [
      {
        title: 'AI-Powered Lecture Summarizer',
        description: 'Browser extension that uses AI to summarize online lectures and generate study notes automatically.',
        category: 'AI'
      },
      {
        title: 'Smart Classroom Attendance System',
        description: 'IoT-based system using facial recognition for automated attendance tracking in classrooms.',
        category: 'Engineering'
      },
      {
        title: 'Sustainable Campus E-Commerce',
        description: 'Platform for students to buy/sell/swap used textbooks and electronics to promote sustainability.',
        category: 'Business'
      }
    ];
    
    const randomIdea = aiIdeas[Math.floor(Math.random() * aiIdeas.length)];
    
    setIdeas(prev => [{
      id: prev.length + 1,
      ...randomIdea,
      source: 'ai',
      votes: 0
    }, ...prev]);
    
    setIsAILoading(false);
  };

  const handleSubmitIdea = (e) => {
    e.preventDefault();
    if (newIdea.title.trim() && newIdea.description.trim()) {
      setIdeas(prev => [{
        id: prev.length + 1,
        ...newIdea,
        source: 'user',
        votes: 0
      }, ...prev]);
      setNewIdea({ title: '', description: '', category: 'IT' });
      setShowIdeaModal(false);
    }
  };

  const categories = ['IT', 'AI', 'Engineering', 'Business', 'Science', 'Design', 'Other'];

  return (
    <div className="project-ideas">
      {/* Header with Action Buttons */}
      <div className="ideas-header">
        <h2>Project Ideas & Inspiration</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowIdeaModal(true)}
          >
            <FaLightbulb /> Suggest New Idea
          </button>
          <button 
            className="btn btn-ai"
            onClick={getAISuggestion}
            disabled={isAILoading}
          >
            {isAILoading ? <FaSpinner className="spinner" /> : <FaRobot />}
            AI Suggest Idea 💡
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="ideas-grid">
        {ideas.map(idea => (
          <div key={idea.id} className={`idea-card ${idea.source}`}>
            {idea.source === 'ai' && (
              <div className="ai-badge">
                <FaRobot /> AI Generated
              </div>
            )}
            <h3 className="idea-title">{idea.title}</h3>
            <p className="idea-description">{idea.description}</p>
            <div className="idea-meta">
              <span className="idea-category">{idea.category}</span>
              <span className="idea-votes">👍 {idea.votes} votes</span>
            </div>
            <div className="idea-actions">
              <button className="btn btn-outline">Use This Idea</button>
              <button className="btn vote-btn">Vote</button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggest Idea Modal */}
      {showIdeaModal && (
        <div className="modal-overlay">
          <div className="idea-modal">
            <div className="modal-header">
              <h3>Suggest New Project Idea</h3>
              <button className="close-btn" onClick={() => setShowIdeaModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitIdea} className="idea-form">
              <div className="form-group">
                <label>Idea Title</label>
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  placeholder="Enter your project idea title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  placeholder="Describe your project idea..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newIdea.category}
                  onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowIdeaModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectIdeas;