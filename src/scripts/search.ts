// Search page functionality
import { SearchManager, URLManager, formatDate, extractItemData, type PaginatedResults } from '../utils/search';
import { searchConfig } from '../config/search';

export class SearchPageController {
  private searchManager: SearchManager;
  private searchInput: HTMLInputElement | null;
  private searchReadout: HTMLElement | null;
  private resultsList: HTMLUListElement | null;
  private paginationContainer: HTMLElement | null;
  private currentPage: number = 1;
  private currentSearchTerm: string = '';

  constructor() {
    this.searchManager = new SearchManager();
    this.searchInput = document.querySelector('#search') as HTMLInputElement;
    this.searchReadout = document.querySelector('#searchReadout');
    this.resultsList = document.querySelector('#searchResults') as HTMLUListElement;
    this.paginationContainer = document.querySelector('#searchPagination');
  }

  /**
   * Updates the search readout text
   */
  private updateSearchReadout(searchTerm: string, paginatedResults?: PaginatedResults): void {
    if (this.searchReadout) {
      if (searchTerm && paginatedResults) {
        const { totalResults, currentPage, totalPages } = paginatedResults;
        this.searchReadout.textContent = `${searchConfig.text.resultsTitle} "${searchTerm}" - ${totalResults} results (Page ${currentPage} of ${totalPages})`;
      } else if (searchTerm) {
        this.searchReadout.textContent = `${searchConfig.text.resultsTitle} "${searchTerm}"`;
      } else {
        this.searchReadout.textContent = "";
      }
    }
  }

  /**
   * Generates HTML for search results
   */
  private async generateSearchResultsHTML(results: any[]): Promise<string> {
    const { marked } = await import('marked');
    
    return results
      .map((r) => {
        const { content, author, title, date, slug } = extractItemData(r.item);
        
        const dateString = date ? formatDate(date) : '';
        const relevanceScore = (1 - r.score).toFixed(2);
        
        // Convert markdown content to HTML
        const htmlContent = marked.parse(content);
        
        return `
          <li class="search-result-item">
            ${date ? `<time datetime="${new Date(date).toISOString()}" class="search-result-date">${dateString}</time>` : ''}
            <div class="search-result-content">
              <strong class="search-result-author">@${author}</strong>
              ${title ? `<h3 class="search-result-title">${title}</h3>` : ''}
              <div class="search-result-text">${htmlContent}</div>
              ${slug ? `<a href="/tweets/${slug}/" class="search-result-link">${searchConfig.text.readMore}</a>` : ''}
              <small class="search-result-relevance">${searchConfig.text.relevanceLabel} ${relevanceScore}</small>
            </div>
          </li>
        `;
      })
      .join("");
  }

  /**
   * Generates pagination HTML
   */
  private generatePaginationHTML(paginatedResults: PaginatedResults): string {
    const { currentPage, totalPages, hasPrevPage, hasNextPage } = paginatedResults;
    
    if (totalPages <= 1) {
      return '';
    }
    
    return `
      <nav class="pagination">
        <div class="pagination-button">
          ${hasPrevPage ? 
            `<button class="btn btn-primary pagination-prev" data-page="${currentPage - 1}">
              <i class="fas fa-arrow-left fa-icon arrow"></i>
              Previous
            </button>` : 
            `<span class="btn btn-primary btn-disabled">
              <i class="fas fa-arrow-left fa-icon arrow"></i>
              Previous
            </span>`
          }
        </div>
        
        <div class="pagination-info">
          Page ${currentPage} of ${totalPages}
        </div>
        
        <div class="pagination-button">
          ${hasNextPage ? 
            `<button class="btn btn-primary pagination-next" data-page="${currentPage + 1}">
              Next
              <i class="fas fa-arrow-right fa-icon arrow"></i>
            </button>` : 
            `<span class="btn btn-primary btn-disabled">
              Next
              <i class="fas fa-arrow-right fa-icon arrow"></i>
            </span>`
          }
        </div>
      </nav>
    `;
  }

  /**
   * Sets up pagination event listeners
   */
  private setupPaginationListeners(): void {
    if (!this.paginationContainer) return;
    
    this.paginationContainer.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button[data-page]') as HTMLButtonElement;
      
      if (button && button.dataset.page) {
        const newPage = parseInt(button.dataset.page, 10);
        if (!isNaN(newPage) && newPage !== this.currentPage) {
          this.currentPage = newPage;
          URLManager.updateSearchURL(this.currentSearchTerm, this.currentPage);
          await this.performSearch(this.currentSearchTerm, this.currentPage);
        }
      }
    });
  }

  /**
   * Shows loading spinner
   */
  private showLoadingSpinner(): void {
    if (this.resultsList) {
      this.resultsList.innerHTML = '<li class="search-loading"><div class="loading-spinner"></div></li>';
    }
    if (this.paginationContainer) {
      this.paginationContainer.innerHTML = '';
    }
  }

  /**
   * Shows error message
   */
  private showError(message: string): void {
    if (this.resultsList) {
      this.resultsList.innerHTML = `<li class="search-error">${message}</li>`;
    }
  }

  /**
   * Shows no results message
   */
  private showNoResults(searchTerm: string): void {
    if (this.resultsList) {
      this.resultsList.innerHTML = `
        <li class="search-no-results">
          ${searchConfig.text.noResults} "${searchTerm}". ${searchConfig.text.noResultsHint}
        </li>
      `;
    }
    if (this.paginationContainer) {
      this.paginationContainer.innerHTML = '';
    }
  }

  /**
   * Performs search and updates UI
   */
  async performSearch(searchTerm: string, page: number = 1): Promise<void> {
    this.currentSearchTerm = searchTerm;
    this.currentPage = page;
    
    // Clear results if no search term
    if (searchTerm.length === 0) {
      if (this.resultsList) {
        this.resultsList.innerHTML = '';
      }
      if (this.paginationContainer) {
        this.paginationContainer.innerHTML = '';
      }
      return;
    }

    // Show loading state
    this.showLoadingSpinner();

    try {
      // Perform search
      const paginatedResults = await this.searchManager.search(searchTerm, page);

      // Display results
      if (this.resultsList) {
        if (paginatedResults.results.length > 0) {
          this.resultsList.innerHTML = await this.generateSearchResultsHTML(paginatedResults.results);
        } else {
          this.showNoResults(searchTerm);
          return;
        }
      }
      
      // Display pagination
      if (this.paginationContainer) {
        this.paginationContainer.innerHTML = this.generatePaginationHTML(paginatedResults);
      }
      
      // Update readout with pagination info
      this.updateSearchReadout(searchTerm, paginatedResults);
      
    } catch (error) {
      console.error('Search error:', error);
      this.showError(searchConfig.text.errorMessage);
    }
  }

  /**
   * Handles search input changes
   */
  private async handleSearchInput(): Promise<void> {
    if (!this.searchInput) return;

    const searchTerm = this.searchManager.sanitizeInput(this.searchInput.value);
    
    // Reset to page 1 when search term changes
    this.currentPage = 1;
    
    // Update UI elements
    URLManager.updateDocumentTitle(searchTerm);
    URLManager.updateSearchURL(searchTerm, this.currentPage);
    
    // Perform search
    await this.performSearch(searchTerm, this.currentPage);
  }

  /**
   * Initializes the search page
   */
  async initialize(): Promise<void> {
    // Get search term from URL
    const urlSearchTerm = this.searchManager.sanitizeInput(URLManager.getSearchTermFromURL());
    const urlPage = URLManager.getPageFromURL();
    
    this.currentPage = urlPage;

    // Set up initial state
    if (this.searchInput) {
      this.searchInput.value = urlSearchTerm;
      this.searchInput.focus();
      
      // Add event listener
      this.searchInput.addEventListener('input', () => this.handleSearchInput());
    }
    
    // Set up pagination listeners
    this.setupPaginationListeners();
    
    // Update UI and perform initial search
    URLManager.updateDocumentTitle(urlSearchTerm);
    
    // Only search if there's a term
    if (urlSearchTerm) {
      await this.performSearch(urlSearchTerm, this.currentPage);
    }
  }
}

// Initialize search when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  const searchController = new SearchPageController();
  await searchController.initialize();
});