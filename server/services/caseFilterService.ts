import { Case, CaseFilters } from "../models/Case";

/**
 * Service for filtering cases based on various criteria
 */
export class CaseFilterService {
    /**
     * Filters cases based on provided criteria
     * @param cases Array of cases to filter
     * @param filters Filter criteria
     * @returns Filtered array of cases
     */
    static filterCases(cases: Case[], filters: CaseFilters): Case[] {
        return cases.filter((caseData) => {
            // Keyword filter (searches in title, description, citation, court)
            if (filters.keyword && !this.matchesKeyword(caseData, filters.keyword)) {
                return false;
            }

            // Year filter
            if (filters.year && !this.matchesYear(caseData, filters.year)) {
                return false;
            }

            // Judge filter
            if (filters.judge && !this.matchesJudge(caseData, filters.judge)) {
                return false;
            }

            // Case type filter
            if (filters.caseType && !this.matchesCaseType(caseData, filters.caseType)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Checks if a case matches the keyword filter
     * @param caseData Case to check
     * @param keyword Keyword to search for
     * @returns true if case matches keyword
     */
    private static matchesKeyword(caseData: Case, keyword: string): boolean {
        const searchTerm = keyword.toLowerCase();
        return (
            caseData.title.toLowerCase().includes(searchTerm) ||
            (!!caseData.description && caseData.description.toLowerCase().includes(searchTerm)) ||
            (!!caseData.citation && caseData.citation.toLowerCase().includes(searchTerm)) ||
            (!!caseData.court && caseData.court.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Checks if a case matches the year filter
     * @param caseData Case to check
     * @param year Year to filter by
     * @returns true if case matches year
     */
    private static matchesYear(caseData: Case, year: string): boolean {
        if (!caseData.date || caseData.date === "Date not recorded") {
            return false;
        }

        try {
            const caseYear = new Date(caseData.date).getFullYear();
            const filterYear = parseInt(year);
            return caseYear === filterYear;
        } catch {
            return false;
        }
    }

    /**
     * Checks if a case matches the judge filter
     * @param caseData Case to check
     * @param judge Judge name to search for
     * @returns true if case matches judge
     */
    private static matchesJudge(caseData: Case, judge: string): boolean {
        if (!caseData.judges || caseData.judges === "Judges unavailable") {
            return false;
        }

        const judgeName = judge.toLowerCase();
        const judges = caseData.judges.toLowerCase();
        return judges.includes(judgeName);
    }

    /**
     * Checks if a case matches the case type filter
     * @param caseData Case to check
     * @param caseType Case type to search for
     * @returns true if case matches type
     */
    private static matchesCaseType(caseData: Case, caseType: string): boolean {
        const searchType = caseType.toLowerCase();
        return (
            caseData.title.toLowerCase().includes(searchType) ||
            (!!caseData.description && caseData.description.toLowerCase().includes(searchType)) ||
            (!!caseData.citation && caseData.citation.toLowerCase().includes(searchType))
        );
    }

    /**
     * Validates year parameter
     * @param year Year string to validate
     * @returns true if year is valid
     */
    static validateYear(year: string): boolean {
        if (!year) return true; // Empty is valid (optional parameter)
        const yearNum = parseInt(year);
        return !isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 1;
    }
}

