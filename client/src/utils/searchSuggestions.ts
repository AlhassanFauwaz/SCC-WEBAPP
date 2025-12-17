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
 * Returns suggestions from: history, case titles, popular terms, and fuzzy matches
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

  // Priority 1: Exact matches from recent searches (highest priority)
  recentSearches.forEach(recent => {
    const recentLower = recent.toLowerCase();
    if (recentLower.startsWith(queryLower) && suggestions.length < 10) {
      suggestions.push({
        text: recent,
        type: 'recent',
        highlight: queryLower,
      });
    }
  });

  // Priority 2: Popular search terms that match
  const popularTerms = [
    'contract', 'property', 'criminal', 'constitutional', 'civil', 'appeal',
    'republic', 'supreme', 'court', 'judge', 'ruling', 'decision', 'case',
    'law', 'legal', 'rights', 'constitution', 'statute', 'regulation'
  ];
  popularTerms.forEach(term => {
    const termLower = term.toLowerCase();
    if ((termLower.startsWith(queryLower) || termLower.includes(queryLower)) && 
        suggestions.length < 12 && 
        !suggestions.some(s => s.text.toLowerCase() === termLower)) {
      suggestions.push({
        text: term,
        type: 'popular',
        highlight: queryLower,
      });
    }
  });

  // Priority 3: Extract keywords from case titles (from Wikidata database)
  const titleKeywords = new Set<string>();
  const fullTitleMatches: string[] = [];
  
  if (cases && cases.length > 0) {
    cases.forEach(caseItem => {
      if (caseItem.title) {
        const titleLower = caseItem.title.toLowerCase();
        
        // Check if title contains the query (full title match)
        if (titleLower.includes(queryLower) && fullTitleMatches.length < 5) {
          fullTitleMatches.push(caseItem.title);
        }
        
        // Extract individual words
        const words = titleLower.split(/\s+/);
        words.forEach(word => {
          // Clean word (remove punctuation)
          const cleanWord = word.replace(/[^\w]/g, '');
          // Match words that start with query OR contain query (minimum 2 chars)
          if (cleanWord.length >= 2 && 
              (cleanWord.startsWith(queryLower) || cleanWord.includes(queryLower))) {
            titleKeywords.add(cleanWord);
          }
        });
      }
      
      // Also check description, citation, court for matches
      if (caseItem.description && caseItem.description.toLowerCase().includes(queryLower)) {
        const descWords = caseItem.description.toLowerCase().split(/\s+/);
        descWords.forEach(word => {
          const cleanWord = word.replace(/[^\w]/g, '');
          if (cleanWord.length >= 3 && cleanWord.includes(queryLower)) {
            titleKeywords.add(cleanWord);
          }
        });
      }
    });
  }

  // Add full title matches first (most relevant)
  fullTitleMatches.slice(0, 3).forEach(title => {
    if (suggestions.length < 15 && !suggestions.some(s => s.text === title)) {
      suggestions.push({
        text: title,
        type: 'suggestion',
        highlight: queryLower,
      });
    }
  });

  // Add matching keywords from titles
  Array.from(titleKeywords).slice(0, 8).forEach(keyword => {
    if (suggestions.length < 15 && !suggestions.some(s => s.text.toLowerCase() === keyword)) {
      suggestions.push({
        text: keyword,
        type: 'suggestion',
        highlight: queryLower,
      });
    }
  });

  // Priority 4: Fuzzy/contextual matches (words that are similar)
  if (suggestions.length < 10 && queryLower.length >= 2) {
    const fuzzyMatches = findFuzzyMatches(queryLower, cases, recentSearches, popularTerms);
    fuzzyMatches.forEach(match => {
      if (suggestions.length < 15 && !suggestions.some(s => s.text.toLowerCase() === match.toLowerCase())) {
        suggestions.push({
          text: match,
          type: 'suggestion',
          highlight: queryLower,
        });
      }
    });
  }

  return suggestions.slice(0, 10); // Limit to 10 suggestions for better UX
}

/**
 * Find fuzzy/contextual matches for spelling suggestions
 */
function findFuzzyMatches(
  query: string,
  cases: Case[],
  recentSearches: string[],
  popularTerms: string[]
): string[] {
  const matches: string[] = [];
  const queryLength = query.length;
  
  // Check popular terms for similar matches
  popularTerms.forEach(term => {
    const termLower = term.toLowerCase();
    // Check if term starts with first 2-3 chars of query (for typos)
    if (queryLength >= 2 && termLower.startsWith(query.substring(0, 2)) && 
        termLower !== query && !termLower.startsWith(query)) {
      matches.push(term);
    }
  });
  
  // Check recent searches for similar matches
  recentSearches.forEach(recent => {
    const recentLower = recent.toLowerCase();
    if (queryLength >= 2 && recentLower.startsWith(query.substring(0, 2)) &&
        recentLower !== query && !recentLower.startsWith(query)) {
      matches.push(recent);
    }
  });
  
  return matches.slice(0, 3);
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

