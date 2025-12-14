import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import FilterPanel, { FilterValues } from './FilterPanel';
import '../styles/HomePage.css';

interface HomePageProps {
  onSearch: (query: string) => void;
  onNavigateToAbout?: () => void;
  onApplyFilters?: (filters: FilterValues) => void;
  onResetFilters?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onSearch, 
  onNavigateToAbout,
  onApplyFilters,
  onResetFilters 
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSearchInputClick = () => {
    setShowFilters(true);
  };

  const handleSearchButtonClick = () => {
    setShowFilters(true);
  };

  const handleApplyFilters = (filters: FilterValues) => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
    setShowFilters(false);
  };

  return (
    <div className="home-page">
      <Header showBackButton={false} onNavigateToAbout={onNavigateToAbout} />
      
      <main className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">SUPREME COURT CASES</h1>
          
          <form className="search-container" onSubmit={handleSubmit}>
            <div className="search-box">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={handleSearchInputClick}
                placeholder="Search for a case by name, number, or keyword"
                className="search-input"
                autoComplete="off"
                required
              />
              <button 
                type="submit" 
                className="search-button"
                onClick={handleSearchButtonClick}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          {/* Filter Panel - appears below search bar when clicked */}
          {showFilters && onApplyFilters && onResetFilters && (
            <div className="homepage-filters-container">
              <FilterPanel
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                isLoading={false}
              />
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateToAbout={onNavigateToAbout} />
    </div>
  );
};

export default HomePage;
