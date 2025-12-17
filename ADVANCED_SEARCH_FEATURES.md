# Advanced Search Feature Enhancement

## Overview
This document describes the advanced search features implemented to enhance the search experience for Supreme Court cases.

## Features Implemented

### 1. Autocomplete and Live Search Suggestions
- **Component**: `SearchAutocomplete.tsx`
- **Location**: `client/src/components/SearchAutocomplete.tsx`
- **Features**:
  - Real-time search suggestions as user types
  - Suggestions based on case titles, recent searches, and popular terms
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Visual highlighting of matched terms
  - Different suggestion types (recent, popular, suggestions)

### 2. Search Term Highlighting
- **Implementation**: `highlightSearchTerms` utility function
- **Location**: `client/src/utils/searchSuggestions.ts`
- **Features**:
  - Highlights matched search terms in case titles, descriptions, citations, and other fields
  - Uses `<mark>` tags with custom styling
  - Case-insensitive matching
  - Applied to all case card fields

### 3. Search History Dropdown
- **Component**: `SearchHistory.tsx`
- **Location**: `client/src/components/SearchHistory.tsx`
- **Utility**: `SearchHistoryManager` class
- **Features**:
  - Stores last 10 searches in localStorage
  - Shows recent searches when input is focused and empty
  - Displays result count for each historical search
  - Individual item removal
  - Clear all history option
  - Persists across browser sessions

### 4. Applied Filters Display
- **Component**: Integrated in `SearchResultsPage.tsx`
- **Styles**: `AppliedFilters.css`
- **Features**:
  - Visual display of all active filters
  - Filter badges with icons
  - Shows keyword, year, judge, and case type filters
  - Appears above search results when filters are applied

### 5. Total Cases Count Display
- **Implementation**: Enhanced in `SearchResultsPage.tsx` and `SortOptions.tsx`
- **Features**:
  - Displays total number of cases found
  - Shows count in results header
  - Integrated with sort options component
  - Updates dynamically based on search/filter results

### 6. Sorting Options
- **Component**: `SortOptions.tsx`
- **Utility**: `sortCases.ts`
- **Location**: `client/src/components/SortOptions.tsx` and `client/src/utils/sortCases.ts`
- **Sort Options**:
  - **Relevance**: Sorts by search query match (title matches weighted highest)
  - **Date (Newest First)**: Most recent cases first
  - **Date (Oldest First)**: Oldest cases first
  - **Title (A-Z)**: Alphabetical order
  - **Title (Z-A)**: Reverse alphabetical order
- **Features**:
  - Dropdown selector for sort options
  - Real-time sorting without re-fetching
  - Relevance scoring algorithm considers:
    - Title matches (highest weight)
    - Description matches
    - Citation matches
    - Judge name matches

## File Structure

```
client/src/
├── components/
│   ├── SearchAutocomplete.tsx      # Autocomplete dropdown component
│   ├── SearchHistory.tsx            # Search history dropdown
│   ├── SortOptions.tsx              # Sort controls component
│   ├── HomePage.tsx                 # Updated with autocomplete/history
│   ├── SearchResultsPage.tsx       # Updated with sorting and filters
│   └── CaseCard.tsx                 # Updated with highlighting
├── utils/
│   ├── searchHistory.ts             # Search history management
│   ├── searchSuggestions.ts         # Suggestion generation and highlighting
│   ├── sortCases.ts                 # Case sorting logic
│   └── debounce.ts                  # Debounce utility
└── styles/
    ├── SearchAutocomplete.css       # Autocomplete styles
    ├── SearchHistory.css            # History dropdown styles
    ├── SortOptions.css              # Sort controls styles
    ├── AppliedFilters.css          # Filter badges styles
    └── CaseCard.css                 # Updated with highlight styles
```

## Usage

### Autocomplete
- Start typing in the search box
- Suggestions appear automatically after 300ms delay
- Use arrow keys to navigate, Enter to select, Escape to close

### Search History
- Click on empty search box to see recent searches
- Click on any history item to repeat that search
- Use trash icon to remove individual items
- Use "Clear History" button to remove all

### Sorting
- Use the "Sort by" dropdown on results page
- Select desired sort option
- Results update immediately

### Filter Display
- Applied filters appear automatically when using filter panel
- Each filter shown as a badge with icon
- Filters persist until reset

## Technical Details

### Debouncing
- Search suggestions are debounced by 300ms to reduce API calls
- Implemented using `useDebounce` React hook

### LocalStorage
- Search history stored in `localStorage` with key `scc_search_history`
- Maximum 10 items stored
- Automatically cleaned up when limit exceeded

### Relevance Scoring
- Title matches: 100 points (150 if starts with query)
- Description matches: 30 points
- Citation matches: 25 points
- Judge matches: 15 points
- Individual term matches: 10-20 points

## Testing

To test the features:

1. **Autocomplete**: Type in search box and observe suggestions
2. **History**: Perform searches, then click empty search box
3. **Highlighting**: Search for a term and check highlighted results
4. **Sorting**: Use sort dropdown and verify results order
5. **Filters**: Apply filters and check filter badges display

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires localStorage support
- Keyboard navigation requires standard keyboard events

