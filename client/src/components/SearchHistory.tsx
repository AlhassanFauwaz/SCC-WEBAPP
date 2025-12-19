import React from 'react';
import { SearchHistoryManager, SearchHistoryItem } from '../utils/searchHistory';
import { Case } from '../App';
import { getFeaturedCases, getSmartSuggestions } from '../utils/featuredCases';
import '../styles/SearchHistory.css';

interface SearchHistoryProps {
  isVisible: boolean;
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
  cases?: Case[]; // Optional cases for featured cases and suggestions
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  isVisible,
  onSelectQuery,
  onClearHistory,
  onClose: _onClose, // Keep for API compatibility but not used internally
  cases = [],
}) => {
  // onClose is kept for API compatibility but not used internally
  void _onClose;
  const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);
  const [featuredCases, setFeaturedCases] = React.useState<Case[]>([]);
  const [smartSuggestions, setSmartSuggestions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isVisible) {
      setHistory(SearchHistoryManager.getHistory());
      
      // Get featured cases
      if (cases && cases.length > 0) {
        setFeaturedCases(getFeaturedCases(cases, 3));
      }
      
      // Get smart suggestions
      const recentSearches = SearchHistoryManager.getRecent(10).map(item => item.query);
      setSmartSuggestions(getSmartSuggestions(cases, recentSearches, 5));
    }
  }, [isVisible, cases]);

  const handleClear = () => {
    SearchHistoryManager.clearHistory();
    setHistory([]);
    onClearHistory();
  };

  const handleCaseClick = (caseTitle: string) => {
    onSelectQuery(caseTitle);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSelectQuery(suggestion);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Show empty state if no content at all
  const hasRecentSearches = history.length > 0;
  const hasFeaturedCases = featuredCases.length > 0;
  const hasSuggestions = smartSuggestions.length > 0;

  if (!hasRecentSearches && !hasFeaturedCases && !hasSuggestions) {
    return (
      <div className="search-history">
        <div className="search-history-header">
          <span className="search-history-title">
            <i className="fas fa-search"></i>
            Search Suggestions
          </span>
        </div>
        <div className="search-history-empty">
          <i className="fas fa-lightbulb"></i>
          <p>Start typing to see search suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-history">
      {/* Featured Cases Section */}
      {hasFeaturedCases && (
        <div className="search-history-section">
          <div className="search-history-section-header">
            <span className="search-history-section-title">
              <i className="fas fa-star"></i>
              Featured Cases
            </span>
          </div>
          <ul className="search-history-list featured-cases-list">
            {featuredCases.map((caseItem) => (
              <li
                key={caseItem.caseId}
                className="search-history-item featured-case-item"
                onClick={() => handleCaseClick(caseItem.title)}
              >
                <div className="search-history-content">
                  <i className="fas fa-gavel"></i>
                  <div className="featured-case-info">
                    <span className="featured-case-title">{caseItem.title}</span>
                    {caseItem.citation && (
                      <span className="featured-case-citation">{caseItem.citation}</span>
                    )}
                  </div>
                </div>
                <i className="fas fa-chevron-right featured-case-arrow"></i>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Smart Suggestions Section */}
      {hasSuggestions && (
        <div className="search-history-section">
          <div className="search-history-section-header">
            <span className="search-history-section-title">
              <i className="fas fa-lightbulb"></i>
              Suggested Searches
            </span>
          </div>
          <ul className="search-history-list suggestions-list">
            {smartSuggestions.map((suggestion) => (
              <li
                key={`suggestion-${suggestion}`}
                className="search-history-item suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="search-history-content">
                  <i className="fas fa-sparkles"></i>
                  <span className="search-history-query">{suggestion}</span>
                </div>
                <i className="fas fa-chevron-right suggestion-arrow"></i>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Searches Section */}
      {hasRecentSearches && (
        <div className="search-history-section">
          <div className="search-history-section-header">
            <span className="search-history-section-title">
              <i className="fas fa-history"></i>
              Recent Searches
            </span>
            <button
              className="search-history-clear"
              onClick={handleClear}
              aria-label="Clear search history"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
          <ul className="search-history-list recent-searches-list">
            {history.map((item) => (
              <li
                key={`${item.query}-${item.timestamp}`}
                className="search-history-item recent-search-item"
                onClick={() => onSelectQuery(item.query)}
              >
                <div className="search-history-content">
                  <i className="fas fa-clock"></i>
                  <span className="search-history-query">{item.query}</span>
                  {item.resultCount !== undefined && (
                    <span className="search-history-count">
                      {item.resultCount} result{item.resultCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <button
                  className="search-history-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    SearchHistoryManager.removeFromHistory(item.query);
                    setHistory(prev => prev.filter(h => h.query !== item.query));
                  }}
                  aria-label={`Remove ${item.query} from history`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;

