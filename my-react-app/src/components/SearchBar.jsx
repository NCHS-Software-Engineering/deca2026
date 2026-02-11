import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Website pages that can be searched
  const websitePages = [
    { title: 'Home', path: '/', type: 'page' },
    { title: 'Practice', path: '/Practice', type: 'page' },
    { title: 'Stats', path: '/Stats', type: 'page' },
    { title: 'Edit', path: '/edit', type: 'page' },
    { title: 'Profile', path: '/profile', type: 'page' },
  ];

  // Cluster pages that can be searched
  const clusterPages = [
    { title: 'Marketing', cluster: 'Marketing', type: 'cluster' },
    { title: 'Business', cluster: 'Business', type: 'cluster' },
    { title: 'Entrepreneurship', cluster: 'Entrepreneurship', type: 'cluster' },
    { title: 'Finance', cluster: 'Finance', type: 'cluster' },
    { title: 'Hospitality', cluster: 'Hospitality', type: 'cluster' },
    { title: 'Personal Finance', cluster: 'Personal-Finance', type: 'cluster' },
  ];

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    setLoading(true);

    try {
      const lowerQuery = query.toLowerCase();
      
      // Search website pages
      const pageMatches = websitePages.filter(page =>
        page.title.toLowerCase().includes(lowerQuery)
      );

      // Search cluster pages
      const clusterMatches = clusterPages.filter(cluster =>
        cluster.title.toLowerCase().includes(lowerQuery)
      );

      const results = [
        ...pageMatches.map(page => ({
          type: 'page',
          title: page.title,
          path: page.path,
          icon: '📄'
        })),
        ...clusterMatches.map(cluster => ({
          type: 'cluster',
          title: cluster.title,
          cluster: cluster.cluster,
          icon: '📚'
        }))
      ];

      // Try to search flashcards
      try {
        const piRes = await axios.get("https://deca.redhawks.us/api/PIs", {
          params: { event: "Marketing" } // Default cluster; adjust as needed
        });

        const flashcards = piRes.data || [];
        const flashcardMatches = flashcards.filter(card =>
          card.PerformanceIndicator?.toLowerCase().includes(lowerQuery) ||
          card.Meaning?.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        results.push(
          ...flashcardMatches.map(card => ({
            type: 'flashcard',
            title: card.PerformanceIndicator,
            description: card.Meaning,
            cluster: card.cluster || 'Marketing',
            icon: '🎓'
          }))
        );
      } catch (err) {
        console.warn("Flashcard search failed:", err.message);
      }

      setSearchResults(results);
    } catch (err) {
      console.error("Error searching:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'page') {
      navigate(result.path);
    } else if (result.type === 'cluster') {
      navigate('/Practice', {
        state: { cluster: result.cluster }
      });
    } else if (result.type === 'flashcard') {
      navigate('/Practice', {
        state: { cluster: result.cluster }
      });
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-bar-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search website & flashcards..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => searchQuery.trim() && setShowResults(true)}
      />
      <span className="search-icon">🔍</span>

      {showResults && (
        <div className="search-results-dropdown">
          {loading ? (
            <div className="search-result-item loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result, idx) => (
              <div
                key={idx}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <span className="result-icon">{result.icon}</span>
                <div className="result-content">
                  <div className="result-title">{result.title}</div>
                  {result.description && (
                    <div className="result-description">{result.description}</div>
                  )}
                  {result.cluster && (
                    <div className="result-cluster">{result.cluster}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="search-result-item no-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
