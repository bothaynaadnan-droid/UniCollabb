import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Universities.css';

const UniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    const universitiesData = [
      {
        id: 1,
        name: 'The World Islamic and Sciences Education University',
        shortName: 'WISE University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/WISE_University_Campus.jpg/1280px-WISE_University_Campus.jpg',
        description: 'A leading private university in Jordan focusing on Islamic studies, sciences, and education with state-of-the-art facilities. Known for its innovative approach to combining traditional Islamic education with modern sciences.',
        students: 2450,
        supervisors: 180,
        projects: 890,
        colorTheme: 'yellow',
        rating: 4.8,
        location: 'Amman, Jordan',
        founded: 2008
      },
      {
        id: 2,
        name: 'University of Jordan',
        shortName: 'University of Jordan',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/University_of_Jordan_Main_Gate.jpg/1280px-University_of_Jordan_Main_Gate.jpg',
        description: 'The largest and oldest university in Jordan, renowned for its comprehensive academic programs and research excellence. A pioneer in higher education with extensive campus facilities.',
        students: 38500,
        supervisors: 2200,
        projects: 15600,
        colorTheme: 'blue',
        rating: 4.7,
        location: 'Amman, Jordan',
        founded: 1962
      },
      {
        id: 3,
        name: 'Al-Balqa Applied University',
        shortName: 'Al-Balqa Applied University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Al-Balqa%27_Applied_University.jpg/1280px-Al-Balqa%27_Applied_University.jpg',
        description: 'Pioneering applied education in Jordan with strong emphasis on practical skills and industry partnerships. Focuses on technical and vocational education across multiple campuses.',
        students: 28700,
        supervisors: 1500,
        projects: 9200,
        colorTheme: 'green',
        rating: 4.5,
        location: 'Al-Salt, Jordan',
        founded: 1997
      },
      {
        id: 4,
        name: 'Jordan University of Science and Technology',
        shortName: 'JUST',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Jordan_University_of_Science_and_Technology.jpg/1280px-Jordan_University_of_Science_and_Technology.jpg',
        description: 'Premier institution for scientific and technological education and research in the Middle East. Specializes in engineering, medicine, and applied sciences.',
        students: 26800,
        supervisors: 1350,
        projects: 11200,
        colorTheme: 'teal',
        rating: 4.6,
        location: 'Irbid, Jordan',
        founded: 1986
      },
      {
        id: 5,
        name: 'Princess Sumaya University for Technology',
        shortName: 'PSUT',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Princess_Sumaya_University_2019.jpg/1280px-Princess_Sumaya_University_2019.jpg',
        description: 'Specialized in IT, engineering, and business with strong industry connections and innovation focus. Known for its modern campus and technology-driven programs.',
        students: 5200,
        supervisors: 320,
        projects: 2800,
        colorTheme: 'purple',
        rating: 4.4,
        location: 'Amman, Jordan',
        founded: 1991
      },
      {
        id: 6,
        name: 'Yarmouk University',
        shortName: 'Yarmouk University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Yarmouk_University_main_gate.jpg/1280px-Yarmouk_University_main_gate.jpg',
        description: 'Comprehensive university known for its diverse academic programs and vibrant campus life. Strong focus on humanities, sciences, and cultural studies.',
        students: 31500,
        supervisors: 1650,
        projects: 8400,
        colorTheme: 'orange',
        rating: 4.3,
        location: 'Irbid, Jordan',
        founded: 1976
      },
      {
        id: 7,
        name: 'Hashemite University',
        shortName: 'Hashemite University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hashemite_University_%28Zarqa%29_001.jpg/1280px-Hashemite_University_%28Zarqa%29_001.jpg',
        description: 'Modern university with strong research programs and commitment to community development. Features extensive campus facilities and diverse academic offerings.',
        students: 22800,
        supervisors: 1100,
        projects: 6700,
        colorTheme: 'red',
        rating: 4.2,
        location: 'Zarqa, Jordan',
        founded: 1995
      }
    ];

    setUniversities(universitiesData);
  }, []);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="universities-page">
      {/* Hero Section */}
      <section className="universities-page__hero-section">
        <div className="universities-page__container">
          <div className="universities-page__hero-content">
            <div className="universities-page__hero-text">
              <h1 className="universities-page__hero-title">
                Connecting Jordan's Academic Excellence
              </h1>
              <p className="universities-page__hero-description">
                UniCollab is revolutionizing how Jordanian universities collaborate. 
                Our platform bridges the gap between students and supervisors across 
                institutions, creating unprecedented opportunities for innovation, 
                research, and academic growth.
              </p>
              <div className="universities-page__hero-highlights">
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🚀</div>
                  <span>Showcase groundbreaking projects</span>
                </div>
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🤝</div>
                  <span>Connect with top supervisors</span>
                </div>
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🌍</div>
                  <span>Collaborate across universities</span>
                </div>
              </div>
            </div>
            <div className="universities-page__hero-visual">
              <div className="universities-page__floating-cards">
                <div className="universities-page__floating-card universities-page__card-1">🎓</div>
                <div className="universities-page__floating-card universities-page__card-2">🔬</div>
                <div className="universities-page__floating-card universities-page__card-3">💡</div>
                <div className="universities-page__floating-card universities-page__card-4">🏆</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="universities-page__universities-section">
        <div className="universities-page__container">
          <div className="universities-page__section-header">
            <h2 className="universities-page__section-title">
              Explore the Universities Participating in Our Platform
            </h2>
            <p className="universities-page__section-subtitle">
              Discover Jordan's leading academic institutions and their vibrant communities on UniCollab
            </p>
          </div>

          <div className="universities-page__universities-list">
            {universities.map((university, index) => (
              <Link 
                to={`/university/${university.id}`} 
                key={university.id}
                className={`universities-page__university-item universities-page__${university.colorTheme} ${index % 2 === 1 ? 'universities-page__reverse' : ''}`}
              >
                <div className="universities-page__university-image-container">
                  <img 
                    src={university.image} 
                    alt={`${university.name} campus`}
                    className="universities-page__university-building"
                  />
                  <div className="universities-page__image-overlay"></div>
                  <div className="universities-page__university-rating">
                    <span className="universities-page__rating-star">⭐</span>
                    <span className="universities-page__rating-value">{university.rating}</span>
                  </div>
                  <div className="universities-page__university-badge">
                    #{index + 1} in Participation
                  </div>
                </div>
                
                <div className="universities-page__university-content">
                  <div className="universities-page__university-header">
                    <h3 className="universities-page__university-name">{university.name}</h3>
                    <div className="universities-page__university-meta">
                      <span className="universities-page__location">📍 {university.location}</span>
                      <span className="universities-page__founded">🏛️ Founded {university.founded}</span>
                    </div>
                  </div>
                  
                  <p className="universities-page__university-description">{university.description}</p>
                  
                  <div className="universities-page__university-stats">
                    <div className="universities-page__stat-item">
                      <div className="universities-page__stat-icon">👨‍🎓</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.students)}</div>
                        <div className="universities-page__stat-label">Active Students</div>
                      </div>
                    </div>
                    <div className="universities-page__stat-item">
                      <div className="universities-page__stat-icon">👨‍🏫</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.supervisors)}</div>
                        <div className="universities-page__stat-label">Supervisors</div>
                      </div>
                    </div>
                    <div className="universities-page__stat-item">
                      <div className="universities-page__stat-icon">📁</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.projects)}</div>
                        <div className="universities-page__stat-label">Projects</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="universities-page__university-actions">
                    <button className="universities-page__view-profile-btn">
                      View University Profile →
                    </button>
                  </div>
                </div>
                
                <div className="universities-page__university-accent"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UniversitiesPage;