# Server Architecture

## 📁 Project Structure

```
server/
├── models/
│   └── Case.ts              # Type definitions and interfaces
├── services/
│   ├── wikidataService.ts   # Wikidata API integration
│   └── caseFilterService.ts # Case filtering logic
├── controllers/
│   └── caseController.ts    # Request handlers
├── server.ts                # Express app setup and routes
├── package.json
└── tsconfig.json
```

## 📋 Module Descriptions

### Models (`models/Case.ts`)
- **Case**: Interface defining the structure of a Supreme Court case
- **CaseFilters**: Interface for filter criteria
- **FilterResponse**: Response structure for filter endpoint
- **SearchResponse**: Response structure for search endpoint

### Services

#### `services/wikidataService.ts`
- **WikidataService**: Handles all interactions with Wikidata API
  - `fetchCases()`: Fetches cases from Wikidata
  - `buildSparqlQuery()`: Constructs SPARQL query
  - `parseWikidataResponse()`: Parses API response into Case objects

#### `services/caseFilterService.ts`
- **CaseFilterService**: Handles case filtering logic
  - `filterCases()`: Main filtering function
  - `matchesKeyword()`: Keyword matching logic
  - `matchesYear()`: Year filtering logic
  - `matchesJudge()`: Judge filtering logic
  - `matchesCaseType()`: Case type filtering logic
  - `validateYear()`: Year validation

### Controllers (`controllers/caseController.ts`)
- **CaseController**: Handles HTTP requests
  - `search()`: Handles `/search` endpoint
  - `filter()`: Handles `/filter` endpoint

### Main Server (`server.ts`)
- Express app configuration
- Route definitions
- Middleware setup
- Server initialization

## 🔌 API Endpoints

### GET `/search?q={query}`
Basic keyword search endpoint.

### GET `/filter?keyword={keyword}&year={year}&judge={judge}&type={type}`
Advanced filtering endpoint with multiple parameters.

## 🚀 Benefits of This Structure

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Testability**: Services and controllers can be tested independently
4. **Scalability**: Easy to add new features without cluttering main server file
5. **Readability**: Clear organization makes code easier to understand

