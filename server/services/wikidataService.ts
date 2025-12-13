import axios from "axios";
import { Case } from "../models/Case";

/**
 * Service for fetching cases from Wikidata
 */
export class WikidataService {
    private static readonly WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";
    private static readonly TIMEOUT = 10000;
    private static readonly MAX_RESULTS = 5000;

    /**
     * Fetches all Supreme Court cases from Wikidata
     * @returns Promise<Case[]> Array of case objects
     */
    static async fetchCases(): Promise<Case[]> {
        const sparqlQuery = this.buildSparqlQuery();
        const url = `${this.WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(sparqlQuery)}&format=json`;

        try {
            const { data } = await axios.get(url, { timeout: this.TIMEOUT });
            return this.parseWikidataResponse(data);
        } catch (error) {
            console.error("❌ Wikidata API Error:", error);
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
        if (!data?.results?.bindings) {
            return [];
        }

        return data.results.bindings.map((item: any) => ({
            caseId: item.item?.value.split("/").pop() || "Not Available",
            title: item.itemLabel?.value || "Not Available",
            description: item.itemDescription?.value || "No description available",
            date: item.date?.value?.split("T")[0] || "Date not recorded",
            citation: item.legal_citation?.value || "Citation unavailable",
            court: item.courtLabel?.value || "Court not specified",
            majorityOpinion: item.majority_opinionLabel?.value || "Majority opinion unavailable",
            sourceLabel: item.sourceLabel?.value || "Source unavailable",
            judges: item.judges?.value || "Judges unavailable",
            articleUrl: item.item?.value || ""
        }));
    }
}

