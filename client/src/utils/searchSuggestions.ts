/**
 * Search Suggestions Utility
 * Generates search suggestions based on query and available cases
 */

import { Case } from '../App';

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'suggestion' | 'popular';
  highlight?: string;
}

/**
 * Generate search suggestions from case data
 */
export function generateSuggestions(
  query: string,
  cases: Case[],
  recentSearches: string[] = []
): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase().trim();

  if (!queryLower) {
    // Show recent searches when query is empty
    return recentSearches.slice(0, 5).map(text => ({
      text,
      type: 'recent' as const,
    }));
  }

  // Extract unique keywords from case titles
  const titleKeywords = new Set<string>();
  cases.forEach(caseItem => {
    const words = caseItem.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length >= 3 && word.startsWith(queryLower)) {
        titleKeywords.add(word);
      }
    });
  });

  // Add matching keywords as suggestions
  Array.from(titleKeywords).slice(0, 5).forEach(keyword => {
    suggestions.push({
      text: keyword,
      type: 'suggestion',
      highlight: queryLower,
    });
  });

  // Add matching recent searches
  recentSearches.forEach(recent => {
    if (recent.toLowerCase().includes(queryLower) && suggestions.length < 8) {
      suggestions.push({
        text: recent,
        type: 'recent',
        highlight: queryLower,
      });
    }
  });

  // Add popular search terms (if query matches)
  const popularTerms = ['contract', 'property', 'criminal', 'constitutional', 'civil', 'appeal'];
  popularTerms.forEach(term => {
    if (term.toLowerCase().startsWith(queryLower) && suggestions.length < 10) {
      suggestions.push({
        text: term,
        type: 'popular',
        highlight: queryLower,
      });
    }
  });

  return suggestions.slice(0, 8); // Limit to 8 suggestions
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) return text;

  const query = searchQuery.trim();
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Extract search terms from query
 */
export function extractSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length >= 2);
}

