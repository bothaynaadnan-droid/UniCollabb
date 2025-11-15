import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTrash, FaPalette, FaShapes, FaTextHeight, FaUndo, FaRedo, FaCalendarAlt, FaStickyNote } from 'react-icons/fa';
import './NotesCalendarPage.css';

const NotesCalendarPage = () => {
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState('#007bff');
  const [brushSize, setBrushSize] = useState(3);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Project Meeting',
      date: new Date(2024, 9, 30),
      color: '#007bff',
      description: 'Weekly team sync'
    },
    {
      id: 2,
      title: 'Proposal Deadline',
      date: new Date(2024, 10, 5),
      color: '#28a745',
      description: 'Submit project proposal'
    }
  ]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = selectedColor;
    context.lineWidth = brushSize;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    if (selectedTool !== 'brush') return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Save to history
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const img = new Image();
      img.src = history[historyStep - 1];
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      const img = new Image();
      img.src = history[historyStep + 1];
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  };

  const tools = [
    { id: 'select', name: 'Select', icon: '↖' },
    { id: 'brush', name: 'Brush', icon: '✏' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'text', name: 'Text', icon: <FaTextHeight /> }
  ];

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
    '#fd7e14', '#e83e8c', '#20c997', '#000000', '#6c757d'
  ];

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`prev-${i}`} className="calendar-day empty"></div>);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = events.filter(event => 
        event.date.toDateString() === date.toDateString()
      );

      days.push(
        <div key={i} className="calendar-day">
          <span className="day-number">{i}</span>
          {dayEvents.map(event => (
            <div 
              key={event.id} 
              className="calendar-event"
              style={{ backgroundColor: event.color }}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="notes-calendar-page">
      <div className="container">
        <div className="page-header">
          <h1>Planning & Notes</h1>
          <p>Organize your projects with interactive tools and calendar</p>
        </div>

        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            <FaStickyNote /> Whiteboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <FaCalendarAlt /> Calendar
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'whiteboard' && (
            <div className="whiteboard-section">
              <div className="toolbar">
                <div className="tool-group">
                  <h4>Tools</h4>
                  <div className="tools-grid">
                    {tools.map(tool => (
                      <button
                        key={tool.id}
                        className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-name">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-group">
                  <h4>Colors</h4>
                  <div className="colors-grid">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setSelectedColor(color);
                          if (contextRef.current) {
                            contextRef.current.strokeStyle = color;
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="tool-group">
                  <h4>Brush Size</h4>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => {
                      setBrushSize(parseInt(e.target.value));
                      if (contextRef.current) {
                        contextRef.current.lineWidth = parseInt(e.target.value);
                      }
                    }}
                    className="brush-slider"
                  />
                  <span className="brush-size">{brushSize}px</span>
                </div>

                <div className="tool-group">
                  <h4>Actions</h4>
                  <div className="action-buttons">
                    <button className="action-btn" onClick={undo} disabled={historyStep <= 0}>
                      <FaUndo /> Undo
                    </button>
                    <button className="action-btn" onClick={redo} disabled={historyStep >= history.length - 1}>
                      <FaRedo /> Redo
                    </button>
                    <button className="action-btn" onClick={clearCanvas}>
                      <FaTrash /> Clear
                    </button>
                    <button className="action-btn">
                      <FaSave /> Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="canvas-container">
                <canvas
                  ref={canvasRef}
                  className="drawing-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="calendar-section">
              <div className="calendar-header">
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  ←
                </button>
                <h2>
                  {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                </h2>
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  →
                </button>
              </div>

              <div className="calendar-grid">
                <div className="calendar-weekday">Sun</div>
                <div className="calendar-weekday">Mon</div>
                <div className="calendar-weekday">Tue</div>
                <div className="calendar-weekday">Wed</div>
                <div className="calendar-weekday">Thu</div>
                <div className="calendar-weekday">Fri</div>
                <div className="calendar-weekday">Sat</div>
                
                {renderCalendar()}
              </div>

              <div className="events-sidebar">
                <h3>Upcoming Events</h3>
                <div className="events-list">
                  {events.sort((a, b) => a.date - b.date).map(event => (
                    <div key={event.id} className="event-item">
                      <div 
                        className="event-color" 
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="event-details">
                        <strong>{event.title}</strong>
                        <span>{event.date.toLocaleDateString()}</span>
                        <small>{event.description}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesCalendarPage;