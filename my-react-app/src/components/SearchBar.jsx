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

  const normalizeText = (value = '') => String(value).toLowerCase();

  // Website pages that can be searched
  const websitePages = [
    { title: 'Home', path: '/', type: 'page' },
    { title: 'Practice', path: '/Practice', type: 'page' },
    { title: 'Stats', path: '/Stats', type: 'page' },
    { title: 'Reports', path: '/flashcard-reports', type: 'page' },
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

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    setLoading(true);

    try {
      const lowerQuery = normalizeText(trimmedQuery);
      
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

      const flashcardResponses = await Promise.allSettled(
        clusterPages.map(async (cluster) => {
          const response = await axios.get("https://deca.redhawks.us/api/PIs", {
            params: { event: cluster.cluster },
          });

          return (response.data || []).map((card) => ({
            ...card,
            cluster: card.cluster || cluster.cluster,
            clusterTitle: cluster.title,
          }));
        })
      );

      const flashcards = flashcardResponses.flatMap((result) => (
        result.status === 'fulfilled' ? result.value : []
      ));

      const flashcardMatches = flashcards
        .map((card) => {
          const performanceIndicator = normalizeText(card.PerformanceIndicator);
          const meaning = normalizeText(card.Meaning);
          const clusterName = normalizeText(card.clusterTitle || card.cluster);

          let score = Number.POSITIVE_INFINITY;
          if (performanceIndicator === lowerQuery) {
            score = 0;
          } else if (performanceIndicator.includes(lowerQuery)) {
            score = 1;
          } else if (clusterName.includes(lowerQuery)) {
            score = 2;
          } else if (meaning.includes(lowerQuery)) {
            score = 3;
          }

          return { ...card, score };
        })
        .filter((card) => Number.isFinite(card.score))
        .sort((a, b) => a.score - b.score || a.PerformanceIndicator.localeCompare(b.PerformanceIndicator))
        .filter((card, index, array) => {
          const uniqueKey = `${card.cluster}::${card.PerformanceIndicator}`;
          return index === array.findIndex((item) => `${item.cluster}::${item.PerformanceIndicator}` === uniqueKey);
        })
        .slice(0, 8);

      results.push(
        ...flashcardMatches.map(card => ({
          type: 'flashcard',
          title: card.PerformanceIndicator,
          description: card.Meaning,
          cluster: card.clusterTitle || card.cluster || 'Flashcard',
          icon: '🎓'
        }))
      );

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
        placeholder="    Search topics, pages, and flashcards..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => searchQuery.trim() && setShowResults(true)}
      />
      {!searchQuery && <span className="search-icon">🔍</span>}

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
