# How to See Autocomplete Suggestions

## Quick Fix Steps

### 1. **Check Backend is Running**
The autocomplete needs the backend API to fetch cases for suggestions.

```bash
# Terminal 1 - Start Backend
cd server
npm run dev
```

**Expected:** You should see:
```
Server running on http://localhost:9090
```

### 2. **Check Frontend is Running**
```bash
# Terminal 2 - Start Frontend  
cd client
npm run dev
```

**Expected:** You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 3. **Open Browser Console**
Press `F12` in your browser to open Developer Tools, then go to the **Console** tab.

### 4. **Type in Search Box**
1. Go to `http://localhost:5173`
2. Click on the search input field
3. Start typing (e.g., type "contract" or "property")

### 5. **Check Console Messages**
You should see these messages in the console:

```
🔍 Fetching cases for suggestions from: http://localhost:9090
✅ Loaded X cases for suggestions
💡 Generated suggestions: X for query: your-query
```

### 6. **What You Should See**
- **After typing 2-3 characters:** A dropdown should appear below the search box
- **Suggestions should show:** Keywords from case titles, popular terms, or recent searches
- **Visual:** White dropdown box with suggestions list

---

## Troubleshooting

### ❌ No Suggestions Appearing?

**Check 1: Backend Connection**
- Open browser Console (F12)
- Look for error messages
- Check if you see: `❌ Error fetching cases for suggestions`
- **Fix:** Make sure backend server is running on port 9090

**Check 2: API Response**
- Go to Network tab in DevTools
- Look for request to `/search?q=&limit=100`
- Check if it returns 200 status
- **Fix:** If 404 or 500, check backend server

**Check 3: Cases Loaded**
- In Console, look for: `✅ Loaded X cases for suggestions`
- If you see `⚠️ No results in response`, the API might not be returning data
- **Fix:** Check backend logs

**Check 4: Suggestions Generated**
- In Console, look for: `💡 Generated suggestions: X for query: ...`
- If it shows `0 suggestions`, try typing a longer word
- **Fix:** Try typing common words like "contract", "property", "criminal"

**Check 5: CSS Visibility**
- Right-click on search box → Inspect Element
- Look for `.search-autocomplete` element
- Check if it has `display: none` or is hidden
- **Fix:** Check if `SearchAutocomplete.css` is loaded

---

## Manual Testing Steps

### Step-by-Step Debug:

1. **Open Browser Console (F12)**

2. **Type in search box:** "contract"

3. **Check Console for:**
   ```
   🔍 Fetching cases for suggestions from: http://localhost:9090
   ✅ Loaded 100 cases for suggestions
   💡 Generated suggestions: 5 for query: contract
   ```

4. **If you see errors:**
   - `Failed to fetch` → Backend not running
   - `404 Not Found` → Wrong API URL
   - `CORS error` → Backend CORS not configured

5. **Check Network Tab:**
   - Look for request: `GET /search?q=&limit=100`
   - Status should be `200 OK`
   - Response should have `results` array

6. **Check Elements Tab:**
   - Find `.search-autocomplete` element
   - Should be visible (not `display: none`)
   - Should have suggestions inside

---

## Expected Behavior

### When It Works:

1. **Type "c"** → Should see suggestions starting with "c"
2. **Type "co"** → Should see suggestions starting with "co"  
3. **Type "contract"** → Should see "contract" and related terms
4. **Click suggestion** → Should fill search box and search
5. **Press Arrow Down** → Should navigate through suggestions
6. **Press Enter** → Should select highlighted suggestion

### Visual Indicators:

- ✅ Dropdown appears below search box
- ✅ White background with border
- ✅ Each suggestion has an icon
- ✅ Hover highlights suggestion
- ✅ Clicking selects suggestion

---

## Common Issues & Solutions

### Issue 1: "No suggestions appear"
**Solution:**
- Check backend is running
- Check console for errors
- Try typing longer words (3+ characters)
- Check Network tab for API calls

### Issue 2: "Suggestions appear but empty"
**Solution:**
- Backend might not have cases
- Check API response in Network tab
- Verify `/search?q=&limit=100` returns results

### Issue 3: "Suggestions flash and disappear"
**Solution:**
- Check if clicking outside closes it (this is normal)
- Try clicking inside the search box again
- Check console for errors

### Issue 4: "Only shows popular terms"
**Solution:**
- This is normal if cases haven't loaded yet
- Wait a few seconds for cases to load
- Check console for "✅ Loaded X cases"

---

## Quick Test Commands

### Test Backend API:
```bash
curl http://localhost:9090/search?q=&limit=10
```

Should return JSON with `results` array.

### Test in Browser:
1. Open: `http://localhost:5173`
2. Open Console (F12)
3. Type in search box
4. Watch console messages

---

## Still Not Working?

1. **Share Console Errors:** Copy any red error messages
2. **Share Network Tab:** Screenshot of failed requests
3. **Check Backend Logs:** Look for errors in server terminal
4. **Verify Ports:** Backend on 9090, Frontend on 5173

The autocomplete should work automatically once:
- ✅ Backend is running
- ✅ Frontend is running  
- ✅ Cases are loaded (check console)
- ✅ You type 2+ characters

