// Search page functionality
import { SearchManager, URLManager, formatDate, extractItemData } from '../utils/search';
import { searchConfig } from '../config/search';

export class SearchPageController {
  private searchManager: SearchManager;
  private searchInput: HTMLInputElement | null;
  private searchReadout: HTMLElement | null;
  private resultsList: HTMLUListElement | null;

  constructor() {
    this.searchManager = new SearchManager();
    this.searchInput = document.querySelector('#search') as HTMLInputElement;
    this.searchReadout = document.querySelector('#searchReadout');
    this.resultsList = document.querySelector('#searchResults') as HTMLUListElement;
  }

  /**
   * Updates the search readout text
   */
  private updateSearchReadout(searchTerm: string): void {
    if (this.searchReadout) {
      this.searchReadout.textContent = searchTerm
        ? `${searchConfig.text.resultsTitle} "${searchTerm}"`
        : "";
    }
  }

  /**
   * Generates HTML for search results
   */
  private generateSearchResultsHTML(results: any[]): string {
    return results
      .map((r) => {
        const { content, author, title, date, slug } = extractItemData(r.item);
        
        const dateString = date ? formatDate(date) : '';
        const relevanceScore = (1 - r.score).toFixed(2);
        
        return `
          <li class="search-result-item">
            ${date ? `<time datetime="${new Date(date).toISOString()}" class="search-result-date">${dateString}</time>` : ''}
            <div class="search-result-content">
              <strong class="search-result-author">@${author}</strong>
              ${title ? `<h3 class="search-result-title">${title}</h3>` : ''}
              <p class="search-result-text">${content}</p>
              ${slug ? `<a href="/tweets/${slug}/" class="search-result-link">${searchConfig.text.readMore}</a>` : ''}
              <small class="search-result-relevance">${searchConfig.text.relevanceLabel} ${relevanceScore}</small>
            </div>
          </li>
        `;
      })
      .join("");
  }

  /**
   * Shows loading spinner
   */
  private showLoadingSpinner(): void {
    if (this.resultsList) {
      this.resultsList.innerHTML = '<li class="search-loading"><div class="loading-spinner"></div></li>';
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
  }

  /**
   * Performs search and updates UI
   */
  async performSearch(searchTerm: string): Promise<void> {
    // Clear results if no search term
    if (searchTerm.length === 0) {
      if (this.resultsList) {
        this.resultsList.innerHTML = '';
      }
      return;
    }

    // Show loading state
    this.showLoadingSpinner();

    try {
      // Perform search
      const searchResults = await this.searchManager.search(searchTerm);

      // Display results
      if (this.resultsList) {
        if (searchResults.length > 0) {
          this.resultsList.innerHTML = this.generateSearchResultsHTML(searchResults);
        } else {
          this.showNoResults(searchTerm);
        }
      }
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
    
    // Update UI elements
    URLManager.updateDocumentTitle(searchTerm);
    this.updateSearchReadout(searchTerm);
    URLManager.updateSearchURL(searchTerm);
    
    // Perform search
    await this.performSearch(searchTerm);
  }

  /**
   * Initializes the search page
   */
  async initialize(): Promise<void> {
    // Get search term from URL
    const urlSearchTerm = this.searchManager.sanitizeInput(URLManager.getSearchTermFromURL());

    // Set up initial state
    if (this.searchInput) {
      this.searchInput.value = urlSearchTerm;
      this.searchInput.focus();
      
      // Add event listener
      this.searchInput.addEventListener('input', () => this.handleSearchInput());
    }
    
    // Update UI and perform initial search
    URLManager.updateDocumentTitle(urlSearchTerm);
    this.updateSearchReadout(urlSearchTerm);
    
    // Only search if there's a term
    if (urlSearchTerm) {
      await this.performSearch(urlSearchTerm);
    }
  }
}

// Initialize search when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  const searchController = new SearchPageController();
  await searchController.initialize();
});