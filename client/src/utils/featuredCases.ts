/**
 * Featured Cases Utility
 * Manages featured/landmark cases and smart suggestions
 */

import { Case } from '../App';

/**
 * Get featured/landmark cases
 * These are typically important or frequently accessed cases
 */
export function getFeaturedCases(cases: Case[], limit: number = 3): Case[] {
  if (!cases || cases.length === 0) return [];

  // Criteria for featured cases:
  // 1. Cases with longer descriptions (more detailed)
  // 2. Cases with citations (more official)
  // 3. Cases with multiple judges (more significant)
  // 4. Recent cases (within last 5 years if date available)
  
  const featured = cases
    .filter(caseItem => {
      // Filter cases that have substantial information
      const hasDescription = caseItem.description && caseItem.description.length > 100;
      const hasCitation = caseItem.citation && caseItem.citation.trim().length > 0;
      const hasJudges = caseItem.judges && caseItem.judges.trim().length > 0;
      
      return hasDescription && (hasCitation || hasJudges);
    })
    .sort((a, b) => {
      // Sort by description length (more detailed = more important)
      const aLength = a.description?.length || 0;
      const bLength = b.description?.length || 0;
      
      // Also consider citation presence
      const aHasCitation = a.citation && a.citation.trim().length > 0 ? 1 : 0;
      const bHasCitation = b.citation && b.citation.trim().length > 0 ? 1 : 0;
      
      return (bLength + bHasCitation * 100) - (aLength + aHasCitation * 100);
    })
    .slice(0, limit);

  return featured;
}

/**
 * Generate smart suggestions based on popular or recent activity
 */
export function getSmartSuggestions(
  cases: Case[],
  recentSearches: string[] = [],
  limit: number = 5
): string[] {
  const suggestions: string[] = [];

  // 1. Extract popular keywords from case titles
  const keywordFrequency = new Map<string, number>();
  
  if (cases && cases.length > 0) {
    cases.forEach(caseItem => {
      if (caseItem.title) {
        // Extract meaningful words (3+ characters, not common words)
        const commonWords = new Set(['the', 'and', 'or', 'of', 'in', 'to', 'a', 'an', 'for', 'vs', 'v']);
        const words = caseItem.title
          .toLowerCase()
          .split(/\s+/)
          .map(word => word.replace(/[^\w]/g, ''))
          .filter(word => word.length >= 3 && !commonWords.has(word));
        
        words.forEach(word => {
          keywordFrequency.set(word, (keywordFrequency.get(word) || 0) + 1);
        });
      }
    });
  }

  // 2. Get most frequent keywords (excluding very common legal terms)
  const commonLegalTerms = new Set(['court', 'case', 'supreme', 'ghana', 'republic', 'judge', 'judgment']);
  const sortedKeywords = Array.from(keywordFrequency.entries())
    .filter(([word]) => !commonLegalTerms.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  suggestions.push(...sortedKeywords);

  // 3. Add popular search terms that aren't already in suggestions
  const popularTerms = [
    'Constitutional Law',
    'Property Rights',
    'Criminal Appeal',
    'Civil Procedure',
    'Contract Dispute',
    'Human Rights',
    'Administrative Law',
    'Commercial Law'
  ];

  popularTerms.forEach(term => {
    if (suggestions.length < limit && !suggestions.some(s => s.toLowerCase() === term.toLowerCase())) {
      suggestions.push(term);
    }
  });

  // 4. Add recent searches that might be trending (if they appear multiple times)
  const searchFrequency = new Map<string, number>();
  recentSearches.forEach(search => {
    if (search.trim().length >= 3) {
      const searchLower = search.toLowerCase();
      searchFrequency.set(searchLower, (searchFrequency.get(searchLower) || 0) + 1);
    }
  });

  const trendingSearches = Array.from(searchFrequency.entries())
    .filter(([, count]) => count >= 2) // Appeared at least twice
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([search]) => search.charAt(0).toUpperCase() + search.slice(1));

  trendingSearches.forEach(search => {
    if (suggestions.length < limit && !suggestions.some(s => s.toLowerCase() === search.toLowerCase())) {
      suggestions.push(search);
    }
  });

  return suggestions.slice(0, limit);
}

/**
 * Get popular case titles for suggestions
 */
export function getPopularCaseTitles(cases: Case[], limit: number = 3): string[] {
  if (!cases || cases.length === 0) return [];

  // Return cases with the most complete information
  return cases
    .filter(caseItem => caseItem.title && caseItem.title.length > 10)
    .slice(0, limit)
    .map(caseItem => caseItem.title);
}

