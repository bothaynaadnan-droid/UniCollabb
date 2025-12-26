import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTrash, FaPalette, FaShapes, FaTextHeight, FaUndo, FaRedo, FaCalendarAlt, FaStickyNote } from 'react-icons/fa';
import '../styles/NotesCalendarPage.css';
import { getPlannerBucket, savePlannerBucket } from '../api/planner';

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
  const isCanvasReadyRef = useRef(false);
  const hasLoadedPlannerRef = useRef(false);
  const didRestoreRef = useRef(false);
  const saveTimerRef = useRef(null);

  const WHITEBOARD_LS_KEY = 'planner_whiteboard';
  const EVENTS_LS_KEY = 'planner_events';
  const MAX_SAVED_HISTORY = 10;

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

    isCanvasReadyRef.current = true;
  }, []);

  const safeParseLocal = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  };

  const scheduleSave = (fn) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(fn, 600);
  };

  const normalizeEvents = (raw) => {
    if (!Array.isArray(raw)) return null;
    return raw
      .filter(Boolean)
      .map((e) => {
        const d = e?.date;
        const dateObj = d instanceof Date ? d : new Date(d);
        return {
          ...e,
          date: isNaN(dateObj.getTime()) ? new Date() : dateObj
        };
      });
  };

  const serializeEvents = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((e) => ({
      ...e,
      date: e?.date instanceof Date ? e.date.toISOString() : (e?.date || null)
    }));
  };

  const buildWhiteboardPayload = () => {
    const hist = Array.isArray(history) ? history : [];
    const step = Number.isInteger(historyStep) ? historyStep : -1;

    if (hist.length <= MAX_SAVED_HISTORY) {
      return { history: hist, historyStep: step };
    }

    const removed = hist.length - MAX_SAVED_HISTORY;
    const sliced = hist.slice(-MAX_SAVED_HISTORY);
    const nextStep = Math.max(-1, Math.min(sliced.length - 1, step - removed));
    return { history: sliced, historyStep: nextStep };
  };

  const restoreCanvasFromHistory = (hist, step) => {
    if (!isCanvasReadyRef.current) return;
    if (!canvasRef.current) return;
    if (!Array.isArray(hist) || step < 0 || !hist[step]) return;

    const img = new Image();
    img.src = hist[step];
    img.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  // Load planner data (API first, localStorage fallback)
  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      // events
      try {
        const apiEvents = await getPlannerBucket('events');
        const normalized = normalizeEvents(apiEvents);
        if (!cancelled && normalized) setEvents(normalized);
      } catch (_) {
        if (!cancelled) {
          const localEvents = normalizeEvents(safeParseLocal(EVENTS_LS_KEY, null));
          if (localEvents) setEvents(localEvents);
        }
      }

      // whiteboard
      try {
        const apiWhiteboard = await getPlannerBucket('whiteboard');
        if (!cancelled && apiWhiteboard && typeof apiWhiteboard === 'object') {
          const hist = Array.isArray(apiWhiteboard.history) ? apiWhiteboard.history : [];
          const step = Number.isInteger(apiWhiteboard.historyStep) ? apiWhiteboard.historyStep : (hist.length - 1);
          setHistory(hist);
          setHistoryStep(step);
        }
      } catch (_) {
        if (!cancelled) {
          const localWb = safeParseLocal(WHITEBOARD_LS_KEY, null);
          if (localWb && typeof localWb === 'object') {
            const hist = Array.isArray(localWb.history) ? localWb.history : [];
            const step = Number.isInteger(localWb.historyStep) ? localWb.historyStep : (hist.length - 1);
            setHistory(hist);
            setHistoryStep(step);
          }
        }
      }

      if (!cancelled) {
        hasLoadedPlannerRef.current = true;
      }
    };

    loadPlanner();
    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // Restore canvas once after load
  useEffect(() => {
    if (didRestoreRef.current) return;
    if (!hasLoadedPlannerRef.current) return;
    if (!isCanvasReadyRef.current) return;

    didRestoreRef.current = true;
    restoreCanvasFromHistory(history, historyStep);
    // eslint-disable-next-line
  }, [history, historyStep]);

  const saveAll = async () => {
    // Always update localStorage first (offline mode)
    try {
      localStorage.setItem(EVENTS_LS_KEY, JSON.stringify(serializeEvents(events)));
    } catch (_) {
      // ignore
    }

    const wbPayload = buildWhiteboardPayload();
    try {
      localStorage.setItem(WHITEBOARD_LS_KEY, JSON.stringify(wbPayload));
    } catch (_) {
      // ignore
    }

    try {
      await savePlannerBucket('events', serializeEvents(events));
      await savePlannerBucket('whiteboard', wbPayload);
    } catch (_) {
      // ignore (localStorage is the fallback)
    }
  };

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

    if (hasLoadedPlannerRef.current) {
      scheduleSave(saveAll);
    }
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

    if (hasLoadedPlannerRef.current) {
      scheduleSave(saveAll);
    }
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

      if (hasLoadedPlannerRef.current) {
        scheduleSave(saveAll);
      }
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

      if (hasLoadedPlannerRef.current) {
        scheduleSave(saveAll);
      }
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
                    <button className="action-btn" onClick={saveAll}>
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