import { Request, Response } from "express";
import { WikidataService } from "../services/wikidataService";
import { CaseFilterService } from "../services/caseFilterService";
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

    try {
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

      const response: SearchResponse = {
        success: true,
        results: filteredCases,
      };

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
      const cases = await WikidataService.fetchCases();

      const filters: CaseFilters = {
        keyword: keyword || undefined,
        year: year || undefined,
        judge: judge || undefined,
        caseType: caseType || undefined,
      };

      const filteredCases = CaseFilterService.filterCases(cases, filters);

      const response: FilterResponse = {
        success: true,
        results: filteredCases,
        filters: {
          keyword: keyword || null,
          year: year || null,
          judge: judge || null,
          caseType: caseType || null,
        },
        count: filteredCases.length,
      };

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
