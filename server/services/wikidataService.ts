import axios from "axios";
import { Case } from "../models/Case";
import { CacheService } from "./cacheService";

/**
 * Service for fetching cases from Wikidata
 * Includes caching to reduce API calls and improve performance
 */
export class WikidataService {
  private static readonly WIKIDATA_SPARQL_URL =
    "https://query.wikidata.org/sparql";
  private static readonly TIMEOUT = 30000; // Increased to 30 seconds to match server.ts
  private static readonly MAX_RESULTS = 5000;
  private static readonly CACHE_KEY = "wikidata:all-cases";
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  /**
   * Fetches all Supreme Court cases from Wikidata
   * Uses caching to reduce API calls
   * @param forceRefresh Force refresh from API, bypassing cache
   * @returns Promise<Case[]> Array of case objects
   */
  static async fetchCases(forceRefresh: boolean = false): Promise<Case[]> {
    // Check cache first
    if (!forceRefresh) {
      const cached = CacheService.get<Case[]>(this.CACHE_KEY);
      if (cached) {
        console.log("✅ Using cached Wikidata data");
        return cached;
      }
    }

    const sparqlQuery = this.buildSparqlQuery();
    const url = `${this.WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(
      sparqlQuery
    )}&format=json`;

    try {
      console.log("🌐 Fetching fresh data from Wikidata...");
      const { data } = await axios.get(url, { 
        timeout: this.TIMEOUT,
        headers: {
          'User-Agent': 'SupremeCourtGhana-WebApp/1.0'
        }
      });
      
      const cases = this.parseWikidataResponse(data);
      
      // Cache the results
      CacheService.set(this.CACHE_KEY, cases, this.CACHE_TTL);
      console.log(`✅ Cached ${cases.length} cases for ${this.CACHE_TTL / 1000 / 60} minutes`);
      
      return cases;
    } catch (error: any) {
      console.error("❌ Wikidata API Error:", error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error("Wikidata API request timed out. The service may be slow.");
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error("Cannot reach Wikidata API. Please check your network connection.");
      }
      
      if (error.response) {
        throw new Error(`Wikidata API returned an error (${error.response.status}).`);
      }
      
      throw new Error("Failed to fetch cases from Wikidata");
    }
  }

  /**
   * Builds the SPARQL query for fetching Supreme Court cases
   * @returns SPARQL query string
   */
  private static buildSparqlQuery(): string {
    return `
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
            LIMIT ${this.MAX_RESULTS}
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
  }

  /**
   * Parses Wikidata SPARQL response into Case objects
   * @param data Raw Wikidata API response
   * @returns Case[] Array of parsed case objects
   */
  private static parseWikidataResponse(data: any): Case[] {
    if (!data || !data.results || !Array.isArray(data.results.bindings)) {
      return [];
    }

    return data.results.bindings.map((item: any) => ({
      caseId: item.item?.value.split("/").pop() || "Not Available",
      title: item.itemLabel?.value || "Not Available",
      description: item.itemDescription?.value || "No description available",
      date: item.date?.value?.split("T")[0] || "Date not recorded",
      citation: item.legal_citation?.value || "Citation unavailable",
      court: item.courtLabel?.value || "Court not specified",
      majorityOpinion:
        item.majority_opinionLabel?.value || "Majority opinion unavailable",
      sourceLabel: item.sourceLabel?.value || "Source unavailable",
      judges: item.judges?.value || "Judges unavailable",
      articleUrl: item.item?.value || "",
    }));
  }
}
