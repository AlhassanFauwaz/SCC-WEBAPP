# 🧪 Postman Testing Guide for fetchCases Endpoints

## 📋 Overview

The `fetchCases` method is called internally by two endpoints:
- **`/search`** - Search cases with optional keyword query
- **`/filter`** - Filter cases with multiple parameters (keyword, year, judge, type)

## 🚀 Prerequisites

1. **Start the Server**
   ```bash
   cd server
   Pnpm run dev
   # or
   Pnpm start
   ```
   Server should be running on `http://localhost:9090` (or port specified in `.env`)

2. **Verify Server is Running**
   - Test health endpoint: `GET http://localhost:9090/api/health`
   - Should return: `{"status":"healthy",...}`

---

## 📮 Postman Setup

### 1. **Test Health Endpoint** (Verify Server is Running)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:9090/api/health`
- **Headers:** None required

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 123.45,
  "environment": "development"
}
```

---

### 2. **Test `/search` Endpoint** (Fetches All Cases)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:9090/search`
- **Headers:** None required
- **Query Parameters:** None (optional: `?q=keyword`)

**Example 1: Get All Cases**
```
GET http://localhost:9090/search
```

**Example 2: Search with Keyword**
```
GET http://localhost:9090/search?q=human+rights
```

**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "caseId": "Q123456",
      "title": "Case Title",
      "description": "Case description",
      "date": "2023-01-15",
      "citation": "123 S.Ct. 456",
      "court": "Supreme Court of Ghana",
      "majorityOpinion": "Justice Name",
      "sourceLabel": "Source",
      "judges": "Justice 1, Justice 2",
      "articleUrl": "https://www.wikidata.org/wiki/Q123456"
    }
    // ... more cases
  ]
}
```

**Error Response (if network fails):**
```json
{
  "success": false,
  "error": "Please check your internet connection!"
}
```

---

### 3. **Test `/filter` Endpoint** (Advanced Filtering)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:9090/filter`
- **Headers:** None required
- **Query Parameters:**
  - `keyword` (optional): Search keyword
  - `year` (optional): Year filter (1900-current year)
  - `judge` (optional): Judge name filter
  - `type` (optional): Case type filter

**Example 1: Filter by Keyword**
```
GET http://localhost:9090/filter?keyword=rights
```

**Example 2: Filter by Year**
```
GET http://localhost:9090/filter?year=2020
```

**Example 3: Filter by Judge**
```
GET http://localhost:9090/filter?judge=Smith
```

**Example 4: Multiple Filters**
```
GET http://localhost:9090/filter?keyword=constitution&year=2020&judge=Justice&type=criminal
```

**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "caseId": "Q123456",
      "title": "Case Title",
      "description": "Case description",
      "date": "2020-01-15",
      "citation": "123 S.Ct. 456",
      "court": "Supreme Court of Ghana",
      "majorityOpinion": "Justice Name",
      "sourceLabel": "Source",
      "judges": "Justice 1, Justice 2",
      "articleUrl": "https://www.wikidata.org/wiki/Q123456"
    }
    // ... filtered cases
  ],
  "filters": {
    "keyword": "rights",
    "year": "2020",
    "judge": null,
    "caseType": null
  },
  "count": 15
}
```

**Error Response (Invalid Year):**
```json
{
  "success": false,
  "error": "Invalid year format. Year must be a number between 1900 and current year (e.g., 2020)"
}
```

---

## 🎯 Postman Collection Setup

### Step-by-Step Instructions:

1. **Open Postman** and create a new collection: "Supreme Court Cases API"

2. **Add Health Check Request:**
   - Name: `Health Check`
   - Method: `GET`
   - URL: `http://localhost:9090/api/health`
   - Save to collection

3. **Add Search All Cases Request:**
   - Name: `Search - All Cases`
   - Method: `GET`
   - URL: `http://localhost:9090/search`
   - Save to collection

4. **Add Search with Query Request:**
   - Name: `Search - With Keyword`
   - Method: `GET`
   - URL: `http://localhost:9090/search`
   - Go to **Params** tab
   - Add query parameter:
     - Key: `q`
     - Value: `human rights` (or any keyword)
   - Save to collection

5. **Add Filter Request:**
   - Name: `Filter - Multiple Parameters`
   - Method: `GET`
   - URL: `http://localhost:9090/filter`
   - Go to **Params** tab
   - Add query parameters:
     - Key: `keyword`, Value: `constitution`
     - Key: `year`, Value: `2020`
     - Key: `judge`, Value: `Justice`
     - Key: `type`, Value: `criminal`
   - Save to collection

---

## 🔍 Testing Scenarios

### Scenario 1: Basic Search
```
GET http://localhost:9090/search
```
**Expected:** Returns all cases (may take a few seconds as it fetches from Wikidata)

### Scenario 2: Search with Query
```
GET http://localhost:9090/search?q=constitution
```
**Expected:** Returns cases matching "constitution" in title, description, judges, citation, or court

### Scenario 3: Filter by Year Only
```
GET http://localhost:9090/filter?year=2020
```
**Expected:** Returns cases from year 2020

### Scenario 4: Filter by Multiple Parameters
```
GET http://localhost:9090/filter?keyword=rights&year=2019&judge=Smith
```
**Expected:** Returns cases matching all filter criteria

### Scenario 5: Invalid Year Format
```
GET http://localhost:9090/filter?year=invalid
```
**Expected:** Returns 400 error with validation message

### Scenario 6: No Results
```
GET http://localhost:9090/search?q=xyzabc123nonexistent
```
**Expected:** Returns empty results array: `{"success": true, "results": []}`

---

## ⚠️ Common Issues & Solutions

### Issue 1: Connection Refused
**Error:** `ECONNREFUSED` or `Cannot reach server`
**Solution:** 
- Ensure server is running: `cd server && npm run dev`
- Check if port 9090 is available
- Verify server started successfully (check console logs)

### Issue 2: Timeout
**Error:** Request times out
**Solution:**
- Wikidata API may be slow (30-second timeout)
- Wait and retry
- Check internet connection

### Issue 3: CORS Error
**Error:** CORS policy error
**Solution:**
- This shouldn't happen in Postman (CORS is browser-specific)
- If testing from browser, ensure `CORS_ORIGIN` in `.env` matches your frontend URL

### Issue 4: Empty Results
**Error:** `{"success": true, "results": []}`
**Solution:**
- This is normal if no cases match your search/filter criteria
- Try a broader search term
- Remove filters to see all cases

---

## 📊 Response Time Expectations

- **First Request:** 5-15 seconds (fetching from Wikidata)
- **Subsequent Requests:** 5-15 seconds (each request hits Wikidata)
- **Note:** The API doesn't cache, so each request fetches fresh data

---

## ✅ Success Criteria

Your endpoint is working correctly if:
1. ✅ Health check returns `200 OK` with status "healthy"
2. ✅ `/search` returns `200 OK` with `success: true` and `results` array
3. ✅ `/filter` returns `200 OK` with filtered results
4. ✅ Error responses return appropriate status codes (400, 500)
5. ✅ Response JSON is properly formatted

---

## 🎓 Quick Test Checklist

- [ ] Server is running on port 9090
- [ ] Health endpoint returns 200
- [ ] `/search` returns all cases
- [ ] `/search?q=test` filters results
- [ ] `/filter?year=2020` filters by year
- [ ] `/filter?year=invalid` returns 400 error
- [ ] Response format matches expected structure

---

## 📝 Notes

- The `fetchCases` method is called internally by both endpoints
- All requests are GET requests (no POST/PUT/DELETE)
- No authentication required
- No request body needed (all parameters in query string)
- Responses are JSON formatted

