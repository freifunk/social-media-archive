// Search configuration
export const searchConfig = {
  // Search behavior settings
  resultsPerPage: 10,
  minSearchLength: 2,
  maxSearchLength: 100,
  
  // Fuse.js configuration
  fuseOptions: {
    includeScore: true,
    shouldSort: true,
    threshold: 0.6, // Lower = more strict matching (0.0 = perfect match, 1.0 = match anything)
    keys: [
      {
        name: 'content',
        weight: 0.8
      },
      {
        name: 'username',
        weight: 0.2
      },
      {
        name: 'data.content',
        weight: 0.8
      },
      {
        name: 'data.username',
        weight: 0.2
      },
    ]
  },
  
  // UI text configuration
  text: {
    searchLabel: 'Search Tweets',
    searchPlaceholder: 'Search tweets...',
    searchDescription: 'Enter a search term or phrase to search tweets',
    resultsTitle: 'Showing search results for',
    noResults: 'No results found for',
    noResultsHint: 'Try different keywords or check spelling.',
    errorMessage: 'Error loading search data. Please try again.',
    searchNotAvailable: 'Search not available. Please try again.',
    relevanceLabel: 'Relevance:',
    readMore: 'Read more'
  },
  
  // API endpoints
  endpoints: {
    searchData: '/search.json'
  }
};