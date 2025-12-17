# Testing Guide: Advanced Search Features

This guide will help you test all the advanced search features that were recently implemented.

## Prerequisites

1. **Start the Backend Server:**
   ```bash
   cd server
   npm install  # If not already installed
   npm run dev
   ```
   The server should start on `http://localhost:9090`

2. **Start the Frontend:**
   ```bash
   cd client
   npm install  # If not already installed
   npm run dev
   ```
   The frontend should start on `http://localhost:5173` (or similar)

## Feature Testing Checklist

### 1. Autocomplete and Live Search Suggestions

**Test Steps:**
1. Open the application in your browser
2. Click on the search input field
3. Start typing a search query (e.g., "contract", "property", "criminal")
4. **Expected:** A dropdown should appear below the search box showing suggestions
5. **Expected:** Suggestions should update as you type (with 300ms debounce)
6. Try using keyboard navigation:
   - Press `Arrow Down` to navigate through suggestions
   - Press `Arrow Up` to go back
   - Press `Enter` to select a suggestion
   - Press `Escape` to close the dropdown
7. Click on a suggestion
   - **Expected:** The search query should be filled and search should execute

**What to Look For:**
- ✅ Suggestions appear after typing
- ✅ Suggestions are relevant to your input
- ✅ Keyboard navigation works smoothly
- ✅ Clicking outside closes the dropdown
- ✅ Different suggestion types are shown (recent, popular, suggestions)

---

### 2. Search History Dropdown

**Test Steps:**
1. Perform several searches (e.g., "contract", "property", "appeal")
2. Click on the search input field when it's empty
3. **Expected:** A dropdown should appear showing your recent searches
4. Click on any history item
   - **Expected:** That search should execute immediately
5. Hover over a history item
   - **Expected:** A delete (X) button should appear
6. Click the X button on a history item
   - **Expected:** That item should be removed from history
7. Look for a "Clear History" button (if available)
   - **Expected:** Clicking it should remove all history

**What to Look For:**
- ✅ Recent searches are displayed when input is empty
- ✅ History persists after page refresh (stored in localStorage)
- ✅ Individual items can be removed
- ✅ History shows result counts (if available)
- ✅ Maximum of 10 items in history

---

### 3. Search Term Highlighting

**Test Steps:**
1. Perform a search (e.g., "contract")
2. View the search results
3. **Expected:** All instances of "contract" should be highlighted in yellow/gold
4. Check highlighting in:
   - Case titles
   - Descriptions
   - Citations
   - Court names
   - Judge names
5. Try a search with multiple words (e.g., "property rights")
   - **Expected:** Both words should be highlighted

**What to Look For:**
- ✅ Search terms are highlighted in case cards
- ✅ Highlighting is case-insensitive
- ✅ Multiple search terms are all highlighted
- ✅ Highlighting appears in all relevant fields

---

### 4. Applied Filters Display

**Test Steps:**
1. Click the "Filters" button on the homepage
2. Apply some filters:
   - Enter a keyword (e.g., "contract")
   - Select a year (e.g., "2020")
   - Enter a judge name (e.g., "Smith")
   - Select a case type (e.g., "Civil")
3. Click "Apply Filters"
4. Navigate to the results page
5. **Expected:** Above the results, you should see a section showing "Applied Filters:"
6. **Expected:** Each active filter should appear as a badge with an icon

**What to Look For:**
- ✅ All active filters are displayed
- ✅ Filter badges have appropriate icons
- ✅ Filters are clearly labeled
- ✅ Badges are visually distinct

---

### 5. Total Cases Count Display

**Test Steps:**
1. Perform a search
2. **Expected:** In the results header, you should see "Found X cases for 'your query'"
3. Apply filters
4. **Expected:** You should see "Found X cases matching filters"
5. Check the sort options component
   - **Expected:** It should also display the total count

**What to Look For:**
- ✅ Total count is accurate
- ✅ Count updates when filters are applied
- ✅ Count is displayed in multiple places (header, sort options)
- ✅ Pluralization is correct (1 case vs 2 cases)

---

### 6. Sorting Options

**Test Steps:**
1. Perform a search that returns multiple results
2. Look for the "Sort by:" dropdown in the results page
3. Test each sort option:

   **a. Relevance:**
   - Select "Relevance"
   - **Expected:** Results should be sorted by how well they match your search query
   - **Expected:** Titles matching the query should appear first

   **b. Date (Newest First):**
   - Select "Newest First"
   - **Expected:** Most recent cases should appear at the top

   **c. Date (Oldest First):**
   - Select "Oldest First"
   - **Expected:** Oldest cases should appear at the top

   **d. Title (A-Z):**
   - Select "Title (A-Z)"
   - **Expected:** Cases should be sorted alphabetically by title

   **e. Title (Z-A):**
   - Select "Title (Z-A)"
   - **Expected:** Cases should be sorted in reverse alphabetical order

**What to Look For:**
- ✅ All sort options are available
- ✅ Sorting works correctly for each option
- ✅ Results update immediately when sort option changes
- ✅ Sorting doesn't require a new API call (client-side sorting)

---

## Integration Testing

### Test Complete Search Flow

1. **Start with Empty Search:**
   - Click search box → Should show history
   - Type a query → Should show autocomplete
   - Select a suggestion → Should search

2. **Search and Filter:**
   - Perform a search
   - Apply filters
   - Check that filters are displayed
   - Change sort order
   - Verify results update correctly

3. **Search History Persistence:**
   - Perform searches
   - Refresh the page
   - Click search box
   - **Expected:** History should still be there

---

## Browser Console Testing

Open your browser's Developer Tools (F12) and check:

1. **No Errors:**
   - Console should be free of errors
   - Check for any warnings

2. **localStorage:**
   - Go to Application tab → Local Storage
   - Look for `scc_search_history`
   - Verify it contains your search history

3. **Network Tab:**
   - Check that API calls are being made correctly
   - Verify caching is working (subsequent searches should be faster)

---

## Edge Cases to Test

1. **Empty Search:**
   - Try searching with empty string
   - **Expected:** Should not trigger search or show error

2. **No Results:**
   - Search for something that doesn't exist
   - **Expected:** Should show "No cases found" message

3. **Special Characters:**
   - Search with special characters (e.g., "contract & property")
   - **Expected:** Should handle gracefully

4. **Very Long Queries:**
   - Enter a very long search query
   - **Expected:** Should still work correctly

5. **Rapid Typing:**
   - Type very quickly
   - **Expected:** Debouncing should prevent excessive API calls

---

## Performance Testing

1. **Response Time:**
   - Check that search results appear quickly
   - Subsequent searches should be faster (caching)

2. **Autocomplete Performance:**
   - Type quickly
   - **Expected:** Suggestions should appear smoothly without lag

3. **Sorting Performance:**
   - Sort large result sets
   - **Expected:** Should be instant (client-side)

---

## Quick Test Script

Run through this quick checklist:

```
□ Autocomplete appears when typing
□ Search history shows when input is empty
□ Search terms are highlighted in results
□ Applied filters are displayed as badges
□ Total count is shown correctly
□ All 5 sort options work correctly
□ Keyboard navigation works in autocomplete
□ History persists after page refresh
□ No console errors
□ No visual glitches
```

---

## Troubleshooting

**If autocomplete doesn't appear:**
- Check browser console for errors
- Verify backend is running
- Check network tab for API calls

**If history doesn't persist:**
- Check localStorage in browser DevTools
- Verify browser allows localStorage
- Check for any errors in console

**If highlighting doesn't work:**
- Verify search query is being passed to CaseCard component
- Check browser console for errors
- Verify CSS for `mark` tags is loaded

**If sorting doesn't work:**
- Check browser console for errors
- Verify sortCases utility is imported correctly
- Check that results array is not empty

---

## Success Criteria

All features are working correctly if:
- ✅ Autocomplete provides relevant suggestions
- ✅ Search history stores and retrieves searches
- ✅ Search terms are highlighted in all relevant fields
- ✅ Applied filters are clearly displayed
- ✅ Total count is accurate and visible
- ✅ All sorting options work correctly
- ✅ No console errors
- ✅ Smooth user experience

---

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify both frontend and backend servers are running
3. Check network requests in DevTools
4. Review the implementation files:
   - `client/src/components/SearchAutocomplete.tsx`
   - `client/src/components/SearchHistory.tsx`
   - `client/src/components/SortOptions.tsx`
   - `client/src/utils/searchSuggestions.ts`
   - `client/src/utils/sortCases.ts`

