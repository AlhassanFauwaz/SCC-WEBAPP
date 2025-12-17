/**
 * Case Model - Defines the structure of a Supreme Court case
 */
export interface Case {
    caseId: string;
    title: string;
    description: string;
    date: string;
    citation: string;
    court: string;
    majorityOpinion: string;
    sourceLabel: string;
    judges: string;
    articleUrl: string;
}

/**
 * Filter criteria for searching cases
 */
export interface CaseFilters {
    keyword?: string;
    year?: string;
    judge?: string;
    caseType?: string;
}

/**
 * API Response structure
 */
export interface FilterResponse {
    success: boolean;
    results: Case[];
    filters: {
        keyword: string | null;
        year: string | null;
        judge: string | null;
        caseType: string | null;
    };
    count: number;
    pagination?: PaginationInfo;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SearchResponse {
    success: boolean;
    results: Case[];
    pagination?: PaginationInfo;
}

