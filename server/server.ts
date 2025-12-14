import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9090;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Configure CORS
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());

// ✅ Health check endpoint (required for deployment)
app.get("/api/health", (req: Request, res: Response) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

// ✅ Root endpoint
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Supreme Court of Ghana Cases API",
        version: "1.0.0",
        description: "API for searching Supreme Court of Ghana cases from Wikidata",
        endpoints: {
            health: "GET /api/health",
            search_all_cases: "GET /search",
            search_with_query: "GET /search?q={query}",
            filter_cases: "GET /filter?keyword={keyword}&year={year}&judge={judge}&type={type}",
            examples: [
                "http://localhost:9090/api/health",
                "http://localhost:9090/search",
                "http://localhost:9090/search?q=human+rights",
                "http://localhost:9090/search?q=constitution",
                "http://localhost:9090/filter?keyword=rights&year=2020",
                "http://localhost:9090/filter?judge=Smith&year=2019",
                "http://localhost:9090/filter?type=criminal&year=2021"
            ]
        },
        documentation: "Use /search endpoint to get case data"
    });
});

// ✅ Search endpoint returning JSON
app.get("/search", async (req: Request, res: Response) => {
    // Input validation
    const userQuery = typeof req.query.q === 'string' 
        ? req.query.q.trim().toLowerCase() 
        : "";

    const sparqlQuery = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?date ?legal_citation ?courtLabel ?majority_opinionLabel ?sourceLabel (GROUP_CONCAT(DISTINCT ?judge; SEPARATOR = ", ") AS ?judges) WHERE {
      {
        SELECT DISTINCT * WHERE {
          ?item (wdt:P31/(wdt:P279*)) wd:Q114079647;
            (wdt:P17/(wdt:P279*)) wd:Q117;
            (wdt:P1001/(wdt:P279*)) wd:Q117;
            (wdt:P793/(wdt:P279*)) wd:Q7099379;
            wdt:P4884 ?court.
          ?court (wdt:P279*) wd:Q1513611.
        }
        LIMIT 5000
      }
      ?item wdt:P577 ?date;
        wdt:P1031 ?legal_citation;
        wdt:P1433 ?source;
        wdt:P1594 _:b3.
      _:b3 rdfs:label ?judge.
      FILTER((LANG(?judge)) = "en")
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
    }
    GROUP BY ?item ?itemLabel ?itemDescription ?date ?legal_citation ?courtLabel ?majority_opinionLabel ?sourceLabel
    ORDER BY (?date)`;

    try {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        
        let data;
        try {
            const response = await axios.get(url, { 
                timeout: 30000, // Increased timeout to 30 seconds
                headers: {
                    'User-Agent': 'SupremeCourtGhana-WebApp/1.0'
                }
            });
            data = response.data;
        } catch (axiosError: any) {
            // Handle specific axios errors
            if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
                console.error("❌ Wikidata API Timeout:", axiosError.message);
                return res.status(504).json({ 
                    success: false, 
                    error: "Wikidata API request timed out. The service may be slow. Please try again in a moment." 
                });
            }
            
            if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
                console.error("❌ Network Error:", axiosError.message);
                return res.status(503).json({ 
                    success: false, 
                    error: "Cannot reach Wikidata API. Please check your network connection." 
                });
            }
            
            if (axiosError.response) {
                // Wikidata API returned an error response
                console.error("❌ Wikidata API Error:", axiosError.response.status, axiosError.response.data);
                return res.status(502).json({ 
                    success: false, 
                    error: `Wikidata API returned an error (${axiosError.response.status}). The service may be temporarily unavailable.` 
                });
            }
            
            throw axiosError; // Re-throw if we can't handle it
        }

        // Validate response structure
        if (!data || !data.results || !data.results.bindings) {
            console.error("❌ Invalid Wikidata Response Structure:", data);
            return res.status(502).json({ 
                success: false, 
                error: "Invalid response format from Wikidata. The service may be experiencing issues." 
            });
        }

        const cases = data.results.bindings
            .map((item: any) => {
                try {
                    return {
                        caseId: item.item?.value ? item.item.value.split("/").pop() : "Not Available",
                        title: item.itemLabel?.value || "Not Available",
                        description: item.itemDescription?.value || "No description available",
                        date: item.date?.value ? item.date.value.split("T")[0] : "Date not recorded",
                        citation: item.legal_citation?.value || "Citation unavailable",
                        court: item.courtLabel?.value || "Court not specified",
                        majorityOpinion: item.majority_opinionLabel?.value || "Majority opinion unavailable",
                        sourceLabel: item.sourceLabel?.value || "Source unavailable",
                        judges: item.judges?.value || "Judges unavailable",
                        articleUrl: item.item?.value || ""
                    };
                } catch (error) {
                    console.warn("Error mapping case item:", error, item);
                    // Return a minimal valid case object
                    return {
                        caseId: "Not Available",
                        title: "Not Available",
                        description: "No description available",
                        date: "Date not recorded",
                        citation: "Citation unavailable",
                        court: "Court not specified",
                        majorityOpinion: "Majority opinion unavailable",
                        sourceLabel: "Source unavailable",
                        judges: "Judges unavailable",
                        articleUrl: ""
                    };
                }
            })
            .filter((caseData: any) => caseData.caseId !== "Not Available") // Filter out invalid cases
            .filter((caseData: any) => {
                if (!userQuery) return true; // Return all if no query
                
                try {
                    return (
                        (caseData.title && caseData.title.toLowerCase().includes(userQuery)) ||
                        (caseData.description && caseData.description.toLowerCase().includes(userQuery)) ||
                        (caseData.judges && caseData.judges.toLowerCase().includes(userQuery)) ||
                        (caseData.citation && caseData.citation.toLowerCase().includes(userQuery)) ||
                        (caseData.court && caseData.court.toLowerCase().includes(userQuery))
                    );
                } catch (error) {
                    // If any field is null/undefined and causes an error, skip this case
                    console.warn("Error filtering case:", error);
                    return false;
                }
            });

        // Ensure we always return an array, even if empty
        res.json({ 
            success: true, 
            results: Array.isArray(cases) ? cases : [] 
        });
    } catch (error: any) {
        // Catch any unexpected errors
        console.error("❌ Unexpected API Error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "An unexpected error occurred while fetching cases. Please try again." 
        });
    }
});

// ✅ Filter endpoint with advanced filtering
app.get("/filter", async (req: Request, res: Response) => {
    // Input validation - ensure all query params are strings
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : "";
    const year = typeof req.query.year === 'string' ? req.query.year.trim() : "";
    const judge = typeof req.query.judge === 'string' ? req.query.judge.trim() : "";
    const caseType = typeof req.query.type === 'string' ? req.query.type.trim() : "";

    // Validate year if provided
    if (year) {
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid year format. Year must be a number between 1900 and current year." 
            });
        }
    }

    const sparqlQuery = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?date ?legal_citation ?courtLabel ?majority_opinionLabel ?sourceLabel (GROUP_CONCAT(DISTINCT ?judge; SEPARATOR = ", ") AS ?judges) WHERE {
      {
        SELECT DISTINCT * WHERE {
          ?item (wdt:P31/(wdt:P279*)) wd:Q114079647;
            (wdt:P17/(wdt:P279*)) wd:Q117;
            (wdt:P1001/(wdt:P279*)) wd:Q117;
            (wdt:P793/(wdt:P279*)) wd:Q7099379;
            wdt:P4884 ?court.
          ?court (wdt:P279*) wd:Q1513611.
        }
        LIMIT 5000
      }
      ?item wdt:P577 ?date;
        wdt:P1031 ?legal_citation;
        wdt:P1433 ?source;
        wdt:P1594 _:b3.
      _:b3 rdfs:label ?judge.
      FILTER((LANG(?judge)) = "en")
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
    }
    GROUP BY ?item ?itemLabel ?itemDescription ?date ?legal_citation ?courtLabel ?majority_opinionLabel ?sourceLabel
    ORDER BY (?date)`;

    try {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        
        let data;
        try {
            const response = await axios.get(url, { 
                timeout: 30000,
                headers: {
                    'User-Agent': 'SupremeCourtGhana-WebApp/1.0'
                }
            });
            data = response.data;
        } catch (axiosError: any) {
            if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
                console.error("❌ Wikidata API Timeout:", axiosError.message);
                return res.status(504).json({ 
                    success: false, 
                    error: "Wikidata API request timed out. The service may be slow. Please try again in a moment." 
                });
            }
            
            if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
                console.error("❌ Network Error:", axiosError.message);
                return res.status(503).json({ 
                    success: false, 
                    error: "Cannot reach Wikidata API. Please check your network connection." 
                });
            }
            
            if (axiosError.response) {
                console.error("❌ Wikidata API Error:", axiosError.response.status, axiosError.response.data);
                return res.status(502).json({ 
                    success: false, 
                    error: `Wikidata API returned an error (${axiosError.response.status}). The service may be temporarily unavailable.` 
                });
            }
            
            throw axiosError;
        }

        // Validate response structure
        if (!data || !data.results || !data.results.bindings) {
            console.error("❌ Invalid Wikidata Response Structure:", data);
            return res.status(502).json({ 
                success: false, 
                error: "Invalid response format from Wikidata. The service may be experiencing issues." 
            });
        }

        let cases = data.results.bindings
            .map((item: any) => {
                try {
                    return {
                        caseId: item.item?.value ? item.item.value.split("/").pop() : "Not Available",
                        title: item.itemLabel?.value || "Not Available",
                        description: item.itemDescription?.value || "No description available",
                        date: item.date?.value ? item.date.value.split("T")[0] : "Date not recorded",
                        citation: item.legal_citation?.value || "Citation unavailable",
                        court: item.courtLabel?.value || "Court not specified",
                        majorityOpinion: item.majority_opinionLabel?.value || "Majority opinion unavailable",
                        sourceLabel: item.sourceLabel?.value || "Source unavailable",
                        judges: item.judges?.value || "Judges unavailable",
                        articleUrl: item.item?.value || ""
                    };
                } catch (error) {
                    console.warn("Error mapping case item in filter:", error, item);
                    // Return a minimal valid case object
                    return {
                        caseId: "Not Available",
                        title: "Not Available",
                        description: "No description available",
                        date: "Date not recorded",
                        citation: "Citation unavailable",
                        court: "Court not specified",
                        majorityOpinion: "Majority opinion unavailable",
                        sourceLabel: "Source unavailable",
                        judges: "Judges unavailable",
                        articleUrl: ""
                    };
                }
            })
            .filter((caseData: any) => caseData.caseId !== "Not Available"); // Filter out invalid cases

        // Apply filters
        if (keyword) {
            const keywordLower = keyword.toLowerCase();
            cases = cases.filter((caseData: any) => {
                try {
                    return (
                        (caseData.title && caseData.title.toLowerCase().includes(keywordLower)) ||
                        (caseData.description && caseData.description.toLowerCase().includes(keywordLower)) ||
                        (caseData.citation && caseData.citation.toLowerCase().includes(keywordLower)) ||
                        (caseData.court && caseData.court.toLowerCase().includes(keywordLower))
                    );
                } catch (error) {
                    console.warn("Error filtering by keyword:", error);
                    return false;
                }
            });
        }

        if (year) {
            const filterYear = parseInt(year);
            cases = cases.filter((caseData: any) => {
                if (!caseData.date || caseData.date === "Date not recorded") return false;
                try {
                    const dateObj = new Date(caseData.date);
                    // Check if date is valid
                    if (isNaN(dateObj.getTime())) return false;
                    const caseYear = dateObj.getFullYear();
                    return caseYear === filterYear;
                } catch (error) {
                    console.warn("Error parsing date for filtering:", caseData.date, error);
                    return false;
                }
            });
        }

        if (judge) {
            const judgeLower = judge.toLowerCase();
            cases = cases.filter((caseData: any) => {
                try {
                    return caseData.judges && 
                           typeof caseData.judges === 'string' &&
                           caseData.judges.toLowerCase().includes(judgeLower);
                } catch (error) {
                    console.warn("Error filtering by judge:", error);
                    return false;
                }
            });
        }

        if (caseType) {
            const typeLower = caseType.toLowerCase();
            
            // Define keywords for each case type for better matching
            const typeKeywords: { [key: string]: string[] } = {
                'criminal': ['criminal', 'murder', 'theft', 'robbery', 'assault', 'fraud', 'homicide', 'manslaughter', 'rape', 'burglary', 'kidnapping', 'drug', 'narcotic', 'offence', 'offense', 'prosecution', 'conviction', 'sentence', 'penal', 'prison'],
                'civil': ['civil', 'contract', 'tort', 'negligence', 'damages', 'compensation', 'liability', 'breach', 'plaintiff', 'defendant', 'suit', 'claim'],
                'constitutional': ['constitutional', 'constitution', 'fundamental', 'rights', 'human rights', 'freedom', 'liberty', 'democracy', 'election', 'vote', 'amendment', 'charter'],
                'administrative': ['administrative', 'administrator', 'government', 'public', 'authority', 'agency', 'regulation', 'policy', 'executive', 'minister', 'department'],
                'commercial': ['commercial', 'business', 'trade', 'company', 'corporation', 'partnership', 'merchant', 'sale', 'purchase', 'transaction', 'commerce', 'corporate'],
                'family': ['family', 'divorce', 'marriage', 'custody', 'child', 'parent', 'adoption', 'maintenance', 'alimony', 'spouse', 'matrimonial', 'domestic'],
                'labor': ['labor', 'labour', 'employment', 'employee', 'employer', 'work', 'worker', 'union', 'strike', 'wage', 'salary', 'dismissal', 'termination', 'industrial'],
                'property': ['property', 'land', 'real estate', 'ownership', 'title', 'deed', 'lease', 'leasehold', 'freehold', 'mortgage', 'tenancy', 'landlord', 'tenant', 'eviction', 'possession', 'acquisition', 'compulsory', 'expropriation', 'conveyance', 'transfer', 'purchase', 'sale', 'immovable', 'realty']
            };
            
            // Get keywords for the selected case type, or use the type itself as a keyword
            const keywords = typeKeywords[typeLower] || [typeLower];
            
            cases = cases.filter((caseData: any) => {
                try {
                    const searchText = (
                        (caseData.title || '') + ' ' +
                        (caseData.description || '') + ' ' +
                        (caseData.citation || '') + ' ' +
                        (caseData.majorityOpinion || '')
                    ).toLowerCase();
                    
                    // Check if any of the keywords match
                    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
                } catch (error) {
                    console.warn("Error filtering by case type:", error);
                    return false;
                }
            });
        }

        // Ensure we always return an array, even if empty
        const filteredResults = Array.isArray(cases) ? cases : [];
        
        res.json({ 
            success: true, 
            results: filteredResults,
            filters: {
                keyword: keyword || null,
                year: year || null,
                judge: judge || null,
                caseType: caseType || null
            },
            count: filteredResults.length
        });
    } catch (error: any) {
        console.error("❌ Unexpected Filter Error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "An unexpected error occurred while filtering cases. Please try again." 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});