import React, { useState, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';
import CaseCard from './CaseCard';
import LoadingSpinner from './LoadingSpinner';
import SortOptions, { SortOption } from './SortOptions';
import { SearchState } from '../../App';
import { FilterValues } from './FilterPanel';
import { sortCases } from '../utils/sortCases';
import '../styles/SearchResultsPage.css';
import '../styles/AppliedFilters.css';

interface SearchResultsPageProps {
  searchState: SearchState;
  onBackToSearch: () => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  searchState,
  onBackToSearch
}) => {
  const { query, results, loading, error, appliedFilters, totalCount } = searchState;
  const [sortOption, setSortOption] = useState<SortOption>('relevance');

  // Sort results based on selected option
  const sortedResults = useMemo(() => {
    return sortCases(results, sortOption, query);
  }, [results, sortOption, query]);

  const displayCount = totalCount !== undefined ? totalCount : results.length;

  return (
    <div className="search-results-page">
      <Header showBackButton={true} onBackClick={onBackToSearch} />

      <main className="main-content">
        <section className="results-section">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="alert error-alert ">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          ) : results.length === 0 ? (
            <div className="alert empty-alert">
              <i className="fas fa-search"></i>
              <h2>No cases found</h2>
              <p>Try adjusting your search terms or check your spelling.</p>
            </div>
          ) : (
            <>
              {/* Sort Options and Results Count */}
              <SortOptions
                currentSort={sortOption}
                onSortChange={setSortOption}
                totalResults={displayCount}
              />

              {/* Applied Filters Display */}
              {appliedFilters && (
                <div className="applied-filters">
                  <h3 className="applied-filters-title">
                    <i className="fas fa-filter"></i>
                    Applied Filters:
                  </h3>
                  <div className="applied-filters-list">
                    {appliedFilters.keyword && (
                      <span className="filter-badge">
                        <i className="fas fa-key"></i>
                        Keyword: {appliedFilters.keyword}
                      </span>
                    )}
                    {appliedFilters.year && (
                      <span className="filter-badge">
                        <i className="fas fa-calendar"></i>
                        Year: {appliedFilters.year}
                      </span>
                    )}
                    {appliedFilters.judge && (
                      <span className="filter-badge">
                        <i className="fas fa-user-gavel"></i>
                        Judge: {appliedFilters.judge}
                      </span>
                    )}
                    {appliedFilters.caseType && (
                      <span className="filter-badge">
                        <i className="fas fa-gavel"></i>
                        Type: {appliedFilters.caseType}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="results-header">
                <h2>Search Results</h2>
                {query && (
                  <p className="results-count">
                    Found {displayCount} case{displayCount !== 1 ? 's' : ''} for "{query}"
                  </p>
                )}
                {!query && appliedFilters && (
                  <p className="results-count">
                    Found {displayCount} case{displayCount !== 1 ? 's' : ''} matching filters
                  </p>
                )}
              </div>
              <div className="results-grid">
                {sortedResults.map((caseItem, index) => (
                  <CaseCard
                    key={`${caseItem.caseId}-${index}`}
                    case={caseItem}
                    searchQuery={query}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
