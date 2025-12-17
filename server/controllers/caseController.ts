import { Request, Response } from "express";
import { WikidataService } from "../services/wikidataService";
import { CaseFilterService } from "../services/caseFilterService";
import { CacheService } from "../services/cacheService";
import { CaseFilters, FilterResponse, SearchResponse } from "../models/Case";

/**
 * Controller for handling case-related API requests
 */
export class CaseController {
  /**
   * Handles search requests with keyword query
   * @param req Express request object
   * @param res Express response object
   */
  static async search(req: Request, res: Response): Promise<void> {
    const userQuery = (req.query.q as string)?.trim().toLowerCase() || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 per page

    try {
      // Check cache for this specific search query
      const cacheKey = `search:${userQuery}:page:${page}:limit:${limit}`;
      const cached = CacheService.get<SearchResponse>(cacheKey);
      
      if (cached) {
        console.log(`✅ Using cached search results for: "${userQuery}"`);
        res.json(cached);
        return;
      }

      const cases = await WikidataService.fetchCases();

      const filteredCases = cases.filter((caseData) => {
        if (!userQuery) return true; // Return all if no query

        return (
          caseData.title.toLowerCase().includes(userQuery) ||
          (caseData.description &&
            caseData.description.toLowerCase().includes(userQuery)) ||
          (caseData.judges &&
            caseData.judges.toLowerCase().includes(userQuery)) ||
          (caseData.citation &&
            caseData.citation.toLowerCase().includes(userQuery)) ||
          (caseData.court && caseData.court.toLowerCase().includes(userQuery))
        );
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = filteredCases.slice(startIndex, endIndex);

      const response: SearchResponse = {
        success: true,
        results: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredCases.length / limit),
          totalItems: filteredCases.length,
          itemsPerPage: limit,
          hasNextPage: endIndex < filteredCases.length,
          hasPreviousPage: page > 1,
        },
      };

      // Cache the response for 5 minutes
      CacheService.set(cacheKey, response, 5 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("❌ Search Error:", error);
      res.status(500).json({
        success: false,
        error: "Please check your internet connection!",
      });
    }
  }

  /**
   * Handles filter requests with multiple filter parameters
   * @param req Express request object
   * @param res Express response object
   */
  static async filter(req: Request, res: Response): Promise<void> {
    const keyword = (req.query.keyword as string)?.trim() || "";
    const year = (req.query.year as string)?.trim() || "";
    const judge = (req.query.judge as string)?.trim() || "";
    const caseType = (req.query.type as string)?.trim() || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 per page

    // Validate year if provided
    if (year && !CaseFilterService.validateYear(year)) {
      res.status(400).json({
        success: false,
        error:
          "Invalid year format. Year must be a number between 1900 and current year (e.g., 2020)",
      });
      return;
    }

    try {
      // Check cache for this specific filter query
      const cacheKey = `filter:${keyword}:${year}:${judge}:${caseType}:page:${page}:limit:${limit}`;
      const cached = CacheService.get<FilterResponse>(cacheKey);
      
      if (cached) {
        console.log(`✅ Using cached filter results`);
        res.json(cached);
        return;
      }

      const cases = await WikidataService.fetchCases();

      const filters: CaseFilters = {
        keyword: keyword || undefined,
        year: year || undefined,
        judge: judge || undefined,
        caseType: caseType || undefined,
      };

      const filteredCases = CaseFilterService.filterCases(cases, filters);

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = filteredCases.slice(startIndex, endIndex);

      const response: FilterResponse = {
        success: true,
        results: paginatedResults,
        filters: {
          keyword: keyword || null,
          year: year || null,
          judge: judge || null,
          caseType: caseType || null,
        },
        count: filteredCases.length,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredCases.length / limit),
          totalItems: filteredCases.length,
          itemsPerPage: limit,
          hasNextPage: endIndex < filteredCases.length,
          hasPreviousPage: page > 1,
        },
      };

      // Cache the response for 5 minutes
      CacheService.set(cacheKey, response, 5 * 60 * 1000);

      res.json(response);
    } catch (error) {
      console.error("❌ Filter Error:", error);
      res.status(500).json({
        success: false,
        error: "Please check your internet connection!",
      });
    }
  }
}
