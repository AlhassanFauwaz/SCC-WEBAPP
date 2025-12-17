import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import FilterPanel, { FilterValues } from './FilterPanel';
import SearchAutocomplete from './SearchAutocomplete';
import SearchHistory from './SearchHistory';
import { generateSuggestions } from '../utils/searchSuggestions';
import { SearchHistoryManager } from '../utils/searchHistory';
import { useDebounce } from '../utils/debounce';
import { Case } from '../App';
import '../styles/HomePage.css';

interface HomePageProps {
  onSearch: (query: string, page?: number, limit?: number) => void;
  onNavigateToAbout?: () => void;
  onApplyFilters?: (filters: FilterValues, page?: number, limit?: number) => void;
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
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof generateSuggestions>>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  // Reduced debounce to 150ms for faster response, but still prevent excessive API calls
  const debouncedQuery = useDebounce(query, 150);

  // Fetch all cases for suggestions (can be optimized later)
  useEffect(() => {
    const fetchCasesForSuggestions = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
        const response = await fetch(`${apiBaseUrl}/search?q=&limit=200`, {
          signal: AbortSignal.timeout(10000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            setAllCases(data.results.slice(0, 200)); // Increased limit for better suggestions
          }
        }
      } catch (error) {
        // Silently fail - suggestions are optional, will use popular terms as fallback
      }
    };
    fetchCasesForSuggestions();
  }, []);

  // Generate suggestions immediately when query changes (for instant feedback)
  useEffect(() => {
    const queryTrimmed = query.trim();
    if (queryTrimmed.length > 0) {
      const recentSearches = SearchHistoryManager.getRecent(10).map(item => item.query);
      const newSuggestions = generateSuggestions(query, allCases, recentSearches);
      setSuggestions(newSuggestions);
      // Show autocomplete immediately if we have suggestions
      if (newSuggestions.length > 0) {
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      // Clear suggestions when query is empty
      setSuggestions([]);
      setShowAutocomplete(false);
    }
  }, [query, allCases]); // Use query directly, not debounced, for immediate response

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowAutocomplete(false);
      setShowHistory(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    // Show autocomplete immediately when typing
    if (newValue.trim().length > 0) {
      setShowAutocomplete(true);
      setShowHistory(false);
    } else {
      // Show history when input is empty
      setShowAutocomplete(false);
      setShowHistory(true);
    }
  };

  const handleInputFocus = () => {
    if (!query.trim()) {
      setShowHistory(true);
      setShowAutocomplete(false);
    } else {
      setShowAutocomplete(true);
      setShowHistory(false);
    }
  };

  const handleInputClick = () => {
    handleInputFocus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowAutocomplete(false);
    onSearch(suggestion);
  };

  const handleSelectHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    onSearch(historyQuery);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
    setShowAutocomplete(false);
    setShowHistory(false);
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
              <div className="search-box-wrapper">
                <div className="search-box" ref={searchBoxRef}>
                  <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onClick={handleInputClick}
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
                
                {/* Search Autocomplete - Shows immediately when typing */}
                <SearchAutocomplete
                  query={query}
                  suggestions={suggestions}
                  isVisible={showAutocomplete && query.trim().length > 0 && suggestions.length > 0}
                  onSelectSuggestion={handleSelectSuggestion}
                  onClose={() => setShowAutocomplete(false)}
                  searchHistory={SearchHistoryManager.getRecent(5).map(item => item.query)}
                  onClearHistory={() => {
                    SearchHistoryManager.clearHistory();
                    setShowAutocomplete(false);
                  }}
                />
                
                {/* Search History - Outside search-box to avoid overflow clipping */}
                <SearchHistory
                  isVisible={showHistory && !query.trim()}
                  onSelectQuery={handleSelectHistory}
                  onClearHistory={() => setShowHistory(false)}
                  onClose={() => setShowHistory(false)}
                />
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
