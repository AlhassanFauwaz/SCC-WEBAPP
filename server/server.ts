import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { CaseController } from "./controllers/caseController";

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
        documentation: "Use /search or /filter endpoints to get case data"
    });
});

// ✅ Search endpoint
app.get("/search", CaseController.search);

// ✅ Filter endpoint with advanced filtering
app.get("/filter", CaseController.filter);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});