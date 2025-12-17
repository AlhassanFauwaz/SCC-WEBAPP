# 🧪 Quick Test Guide - Error Handling Features

## How to See Each Feature

### 1. **Offline Indicator** 🌐
**Easiest Method:**
1. Open your app in browser (usually `http://localhost:5173`)
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Find the dropdown that says "No throttling" (top of Network tab)
5. Change it to **"Offline"**
6. **✅ You'll see:** Red banner at top saying "You're currently offline"

**To see "Back Online" message:**
- Change back from "Offline" to "Online"
- **✅ You'll see:** Green banner saying "You're back online!" (disappears after 3 seconds)

---

### 2. **Toast Notifications** 🔔
**To see toasts:**
1. Make sure you're online
2. Perform a search (this caches the data)
3. Go offline (see Method 1 above)
4. Try searching again
5. **✅ You'll see:** Toast notification in top-right corner saying "You are offline. Showing cached results."

**Other ways to see toasts:**
- Stop your backend server → Try searching → Error toast appears
- Come back online → Success toast appears

---

### 3. **Error Messages with Retry Button** 🔄
**Test Steps:**
1. Start your backend server: `cd server && npm start`
2. Start your frontend: `cd client && npm run dev`
3. **Stop the backend server** (Ctrl+C in server terminal)
4. Go to your app and perform a search
5. **✅ You'll see:**
   - Error message: "Cannot connect to the server..."
   - "Try Again" button
   - "Back to Search" button
   - Toast notification in top-right

**Click "Try Again":**
- It will retry the search immediately

---

### 4. **Cache Fallback** 💾
**Test Steps:**
1. **First:** While online, perform a search (e.g., search for "case")
2. **Then:** Go offline (F12 → Network → Offline)
3. **Finally:** Perform the same search again
4. **✅ You'll see:**
   - Results still appear (from cache!)
   - Message: "Showing cached results. You are currently offline."
   - Toast: "You are offline. Showing cached results."

**To verify cache:**
- F12 → Application tab → Local Storage → Look for `scc_cache_*` keys

---

### 5. **404 Not Found Page** 🚫
**Now you can test it!**
1. Make sure your app is running
2. In the browser address bar, type any invalid URL:
   - `http://localhost:5173/this-does-not-exist`
   - `http://localhost:5173/404`
   - `http://localhost:5173/random-page`
3. Press Enter
4. **✅ You'll see:** Custom 404 page with:
   - "404 Page Not Found" message
   - "Go to Home" button
   - "Go Back" button
   - Helpful suggestions

---

### 6. **Error Boundary** ⚠️
**To test (requires code modification):**
I can add a test button that triggers an error. For now, it automatically catches any React component errors.

**What it does:**
- If any component crashes, ErrorBoundary catches it
- Shows friendly error UI instead of white screen
- Provides "Go to Home" and "Refresh" buttons

---

### 7. **Automatic Retry** 🔁
**To see automatic retries:**
1. Stop your backend server
2. Open DevTools → Network tab
3. Perform a search
4. **✅ Watch the Network tab:** You'll see 3 retry attempts with delays between them
5. Each retry waits longer (exponential backoff: 1s, 2s, 4s)

---

## 🎯 Complete Test Scenario

**Follow these steps in order:**

1. ✅ **Start both servers:**
   ```bash
   # Terminal 1
   cd server && npm start
   
   # Terminal 2
   cd client && npm run dev
   ```

2. ✅ **Test Normal Search:**
   - Go to `http://localhost:5173`
   - Search for something (e.g., "case")
   - See results appear

3. ✅ **Test Offline Indicator:**
   - F12 → Network → Offline
   - See red banner appear

4. ✅ **Test Cache Fallback:**
   - While offline, search again
   - See cached results appear

5. ✅ **Test Error Handling:**
   - Stop backend server (Ctrl+C)
   - Try searching
   - See error message + retry button

6. ✅ **Test Retry:**
   - Click "Try Again" button
   - See retry attempt

7. ✅ **Test 404 Page:**
   - Type `http://localhost:5173/404` in address bar
   - See custom 404 page

8. ✅ **Test Online Recovery:**
   - Restart backend
   - Change Network back to "Online"
   - Search again
   - See success!

---

## 📸 What You Should See

### Offline Indicator:
```
┌─────────────────────────────────────────┐
│ ⚠️ You're currently offline. Some       │
│    features may be limited.             │
└─────────────────────────────────────────┘
```

### Toast Notification (Top-Right):
```
┌─────────────────────┐
│ ✓ Search completed  │
│   successfully!     │
│              [×]    │
└─────────────────────┘
```

### Error with Retry:
```
┌─────────────────────────────────────┐
│ ⚠️ Oops! Something went wrong       │
│                                      │
│ Cannot connect to the server...     │
│                                      │
│ [Try Again]  [Back to Search]      │
└─────────────────────────────────────┘
```

### 404 Page:
```
┌─────────────────────────────────────┐
│         🔍                          │
│         404                         │
│    Page Not Found                   │
│                                      │
│ [Go to Home]  [Go Back]            │
└─────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

**Offline indicator not showing?**
- Make sure you're using Chrome/Edge DevTools
- Try refreshing the page after going offline
- Check that `OfflineIndicator` component is in App.tsx

**Toast not appearing?**
- Check top-right corner of screen
- Make sure you triggered an action (search, error, etc.)
- Check browser console for errors

**404 page not showing?**
- Make sure you're using an invalid URL
- Check that routing is set up correctly
- Try `http://localhost:5173/this-does-not-exist`

**Cache not working?**
- Make sure you searched while online first
- Check LocalStorage: F12 → Application → Local Storage
- Look for keys starting with `scc_cache_`

---

## 💡 Pro Tips

1. **Keep DevTools Open:** You can see network requests, retries, and cache
2. **Check Console:** Error logs appear in console (F12 → Console)
3. **Check LocalStorage:** Application tab shows cached data and error logs
4. **Network Tab:** Shows all retry attempts and their timing

---

**Need help?** All features are working! Just follow the steps above. 🚀

