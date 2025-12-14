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

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
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
          
          <div className="search-container">
            <form className="search-form" onSubmit={handleSubmit}>
              <div className="search-box">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a case by name, number, or keyword"
                  className="search-input"
                  autoComplete="off"
                  required
                />
                <button 
                  type="submit" 
                  className="search-button"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
            <button 
              type="button"
              className="filter-toggle-button"
              onClick={handleFilterToggle}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <i className="fas fa-filter"></i>
              <span>Filters</span>
              {showFilters && <i className="fas fa-chevron-up"></i>}
              {!showFilters && <i className="fas fa-chevron-down"></i>}
            </button>
          </div>

          {/* Filter Panel - appears below search bar when filter button is clicked */}
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
