// Search utility functions
import DOMPurify from 'dompurify';
import Fuse from 'fuse.js';
import { marked } from 'marked';
import { searchConfig } from '../config/search';

export interface SearchItem {
  slug?: string;
  url?: string;
  content?: string;
  date?: string;
  username?: string;
  title?: string;
  data?: {
    content?: string;
    username?: string;
    title?: string;
    pubDate?: string;
  };
}

export interface SearchResult {
  item: SearchItem;
  score: number;
}

export interface PaginatedResults {
  results: SearchResult[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class SearchManager {
  private searchData: SearchItem[] | null = null;
  private fuseInstance: Fuse<SearchItem> | null = null;

  /**
   * Sanitizes user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input.trim());
  }

  /**
   * Validates search term length
   */
  isValidSearchTerm(searchTerm: string): boolean {
    return searchTerm.length >= searchConfig.minSearchLength && 
           searchTerm.length <= searchConfig.maxSearchLength;
  }

  /**
   * Fetches search data from the API
   */
  async fetchSearchData(): Promise<SearchItem[]> {
    if (this.searchData) {
      return this.searchData;
    }

    try {
      console.log(`Fetching search data from ${searchConfig.endpoints.searchData}...`);
      const response = await fetch(searchConfig.endpoints.searchData);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.searchData = data;
      
      // Debug logging
      console.log('Search data loaded:', this.searchData);
      if (this.searchData && this.searchData.length > 0) {
        console.log('First item structure:', this.searchData[0]);
        console.log('Available keys:', Object.keys(this.searchData[0]));
      }
      
      return this.searchData;
    } catch (error) {
      console.error('Error fetching search data:', error);
      throw error;
    }
  }

  /**
   * Initializes the Fuse search instance
   */
  async initializeFuse(): Promise<void> {
    if (this.fuseInstance) {
      return;
    }

    const data = await this.fetchSearchData();
    console.log("Creating new Fuse instance with options:", searchConfig.fuseOptions);
    this.fuseInstance = new Fuse(data, searchConfig.fuseOptions);
  }

  /**
   * Performs the search operation
   */
  async search(searchTerm: string, page: number = 1): Promise<PaginatedResults> {
    const sanitizedTerm = this.sanitizeInput(searchTerm);
    
    if (!this.isValidSearchTerm(sanitizedTerm)) {
      return {
        results: [],
        totalResults: 0,
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
    }

    await this.initializeFuse();
    
    if (!this.fuseInstance) {
      throw new Error('Search instance not available');
    }

    console.log(`Searching for: "${sanitizedTerm}"`);
    const allResults = this.fuseInstance.search(sanitizedTerm);
    console.log('Total search results:', allResults.length);
    
    // Calculate pagination
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / searchConfig.resultsPerPage);
    const startIndex = (page - 1) * searchConfig.resultsPerPage;
    const endIndex = startIndex + searchConfig.resultsPerPage;
    const results: SearchResult[] = allResults.slice(startIndex, endIndex).map(res => ({
      item: res.item,
      score: res.score ?? 0
    }));
    
    return {
      results,
      totalResults,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}

/**
 * Formats a date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `Posted on ${year}-${month}-${day}`;
}

/**
 * Extracts content from search result item
 */
export function extractItemData(item: SearchItem) {
  return {
    content: item.content || item.data?.content || 'No content',
    author: item.username || item.data?.username || 'Unknown',
    title: item.title || item.data?.title || '',
    date: item.date || item.data?.pubDate,
    slug: item.slug
  };
}

/**
 * URL management utilities
 */
export class URLManager {
  static updateSearchURL(searchTerm: string, page: number = 1): void {
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('q', searchTerm);
      if (page > 1) {
        url.searchParams.set('page', page.toString());
      } else {
        url.searchParams.delete('page');
      }
    } else {
      url.searchParams.delete('q');
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url.toString());
  }

  static getSearchTermFromURL(): string {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  static getPageFromURL(): number {
    const pageParam = new URLSearchParams(window.location.search).get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return isNaN(page) || page < 1 ? 1 : page;
  }

  static updateDocumentTitle(searchTerm: string): void {
    document.title = searchTerm
      ? `Search Results for "${searchTerm}"`
      : "Search Tweets";
  }
}