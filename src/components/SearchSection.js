import React from 'react';

const SearchSection = () => {
  return (
    <section className="search-section">
      <div className="container">
        <div className="search-container">
          <div className="search-box">
            <input type="text" className="search-input" placeholder="Search for projects, ideas, or team members..." />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;