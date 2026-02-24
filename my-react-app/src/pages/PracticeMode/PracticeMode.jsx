import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./PracticeMode.css";
import { useLocation } from "react-router-dom";

const Practice = () => {
  const location = useLocation();

  const [eventData, setEventData] = useState("Example Event");
  const [eventColor, setEventColor] = useState("var(--Primary)");
  const [eventCluster, setEventCluster] = useState("Marketing");
  const [isInitialized, setIsInitialized] = useState(false);

  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [randomCards, setRandomCards] = useState(false);
  const [remainingRandomIndices, setRemainingRandomIndices] = useState([]);
  const [randomCycleCompleted, setRandomCycleCompleted] = useState(false);
  // store the index the user was on before enabling random mode so we can return to it
  const [savedIndexBeforeRandom, setSavedIndexBeforeRandom] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [knownIndicators, setKnownIndicators] = useState([]);
  const [hasKnown, setHasKnown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showListView, setShowListView] = useState(false);
  const [starred, setStarred] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [sortMode, setSortMode] = useState('default'); // 'default' | 'starred' | 'known'

  // Popup state: show info about recently practiced cluster
  const [showPopup, setShowPopup] = useState(true);

  let user = null;
const storedUserRaw = localStorage.getItem("user");

if (storedUserRaw) {
  try {
    const storedUser = JSON.parse(storedUserRaw);
    user = {
      ...storedUser,
      googleId: storedUser?.sub || storedUser?.google_id,
    };
  } catch (err) {
    console.error("Error parsing stored user:", err);
  }
}


  // Set the event-related metadata on mount
  useEffect(() => {
    const tempEventCluster =
      location.state?.cluster || localStorage.getItem("deca_cluster") || "Marketing";
    const tempEventData =
      location.state?.name || localStorage.getItem("deca_headerName") || tempEventCluster;
    const tempEventColor =
      location.state?.color || localStorage.getItem("deca_color") || "var(--Primary)";

    setEventData(tempEventData);
    setEventColor(tempEventColor);
    setEventCluster(tempEventCluster);
    setIsInitialized(true);
  }, [location.state]);
  

  useEffect(() => {
    if (!isInitialized) return;
    console.log("eventCluster being used:", eventCluster);
    fetchData();
    // load starred items for this cluster from localStorage
    try {
      const key = `starred_${eventCluster}`;
      const raw = localStorage.getItem(key);
      if (raw) setStarred(JSON.parse(raw));
      else setStarred([]);
    } catch (e) {
      setStarred([]);
    }
    // apply any active sort after loading data
    if (sortMode !== 'default' && data.length > 0) {
      applySort(sortMode);
    }
  }, [eventCluster, randomCards, user?.googleId, isInitialized]);

  const applySort = (mode, starredOverride) => {
    // if no source available, nothing to sort
    const useStarred = typeof starredOverride !== 'undefined' ? starredOverride : starred;
    // preserve current PI so we can restore currentIndex after sorting
    const currentPI = data[currentIndex]?.PerformanceIndicator;

    // For starred sorting, operate on the original filtered list (originalData) so toggle-back restores reliably
    let source = (originalData && originalData.length > 0) ? originalData.slice() : data.slice();

    if (mode === 'known') {
      // For known sorting, show the full list (including known items) so we can surface known items
      source = (fullData && fullData.length > 0) ? fullData.slice() : source;
    }

    if (!source || source.length === 0) return;

    let sorted = source.slice();
    if (mode === 'starred') {
      // starred items should appear first
      sorted.sort((a, b) => {
        const aStar = useStarred.includes(a.PerformanceIndicator) ? 0 : 1;
        const bStar = useStarred.includes(b.PerformanceIndicator) ? 0 : 1;
        return aStar - bStar;
      });
    } else if (mode === 'known') {
      // put known items first
      sorted.sort((a, b) => {
        const aKnown = knownIndicators.includes(a.PerformanceIndicator) ? 0 : 1;
        const bKnown = knownIndicators.includes(b.PerformanceIndicator) ? 0 : 1;
        return aKnown - bKnown;
      });
    }

    // update data and restore the current index to the same PI if possible
    setData(sorted);
    if (currentPI) {
      const newIndex = sorted.findIndex(x => x.PerformanceIndicator === currentPI);
      if (newIndex >= 0) setCurrentIndex(newIndex);
    }
  };

  // Close popup for this session
  const [dontShowChecked, setDontShowChecked] = useState(false);

  // Initialize popup visibility from localStorage and restore checkbox state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('practice_popup_dontshow');
      if (saved === 'true') {
        setShowPopup(false);
        setDontShowChecked(true);
      }
    } catch (e) {
      console.error('Error reading popup preference', e);
    }
  }, []);

  const closePopup = () => {
    try {
      if (dontShowChecked) {
        localStorage.setItem('practice_popup_dontshow', 'true');
      }
    } catch (e) {
      console.error('Error saving popup preference', e);
    }
    setShowPopup(false);
  };

  // Helper: shuffle an array (Fisher-Yates)
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  

  //https://deca.redhawks.us/

  const fetchData = async () => {
    try {
      let known = [];
      let index = 0;
  
      if (user?.googleId) {
        const knownRes = await axios.get("https://deca.redhawks.us/api/know-this", {
          params: {
            googleId: user.googleId,
            careerCluster: eventCluster,
          },
        });
  
        const indexRes = await axios.get("https://deca.redhawks.us/api/last-index", {
          params: { googleId: user.googleId, careerCluster: eventCluster },
        });
  
        known = knownRes.data;
        index = Number(indexRes.data[0]?.last_index || 0);
        setHasKnown(known.length > 0);
        setKnownIndicators(known);
      } else {
        setHasKnown(false);
        setKnownIndicators([]);
      }
  
      const piRes = await axios.get("https://deca.redhawks.us/api/PIs", {
        params: { event: eventCluster },
      });
  
      const allIndicators = piRes.data;

      // include all indicators in the main deck (don't remove known ones)
      const filtered = allIndicators;

      console.log("Loaded data (including known):", filtered);
      // fullData keeps the full set
      setFullData(allIndicators.slice());
      // originalData keeps the original ordering for restore
      setOriginalData(filtered.slice());
      setData(filtered.slice());

      const startIndex = index < filtered.length ? index : 0;
      setCurrentIndex(startIndex);

      // initialize remaining random indices when in random mode
      if (randomCards && filtered.length > 0) {
          const allIndices = filtered.map((_, i) => i);
          // remove current startIndex so next random won't immediately repeat
          const remaining = shuffle(allIndices.filter(i => i !== startIndex));
        setRemainingRandomIndices(remaining);
        setRandomCycleCompleted(false);
      } else {
        setRemainingRandomIndices([]);
        setRandomCycleCompleted(false);
      }
    } catch (err) {
      console.error("Error loading practice data:", err);
    }
  };

  // when originalData is loaded, re-apply sort if a mode is active
  // restore or apply sort when sortMode changes
  useEffect(() => {
    if (sortMode === 'default') {
      if (originalData && originalData.length > 0) {
        const currentPI = data[currentIndex]?.PerformanceIndicator;
        setData(originalData.slice());
        if (currentPI) {
          const newIndex = originalData.findIndex(x => x.PerformanceIndicator === currentPI);
          if (newIndex >= 0) setCurrentIndex(newIndex);
        }
      }
    } else {
      applySort(sortMode);
    }
  }, [sortMode]);

  // Add keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Don't trigger if user is typing in the search box
      if (event.target.type === 'text' || event.target.tagName === 'INPUT') {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext(event);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleBack(event);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, data, randomCards, knownIndicators, user?.googleId, startTime]);

  const handleFlip = () => setShowMeaning(prev => !prev);

  const handleNext = async (event) => {
    event.stopPropagation();
    const timeSpent = (Date.now() - startTime) / 1000;

    if (timeSpent >= 5 && user?.googleId) {
      try {
        await fetch("https://deca.redhawks.us/api/update-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: user.googleId,
            timeSpent: Math.round(timeSpent),
          }),
        });
      } catch (err) {
        console.error("Error updating stats:", err);
      }
    }
    
    
    if (user?.googleId) {
      try {
         await fetch("https://deca.redhawks.us/api/last-index", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: user.googleId,
            lastIndex: currentIndex,
            careerCluster: eventCluster,
          }),
        });
      } catch (err) {
        console.error("Error updating index:", err);
      }
    }

    let nextIndex = currentIndex;

    if (randomCards) {
      // Use remainingRandomIndices to ensure each card is shown once per cycle
      let remaining = remainingRandomIndices.slice();

      if (remaining.length === 0) {
        // We've exhausted the cycle; refill (this allows repeats now)
        const allIndices = data.map((_, i) => i);
        // remove currentIndex to avoid immediate repeat if possible
        let refill = shuffle(allIndices.filter(i => i !== currentIndex));
        // if only one card exists, allow it
        if (refill.length === 0 && allIndices.length > 0) refill = [currentIndex];
        remaining = refill;
        setRandomCycleCompleted(true);
      }

      // pop next from front
      nextIndex = remaining.shift();
      setRemainingRandomIndices(remaining);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= data.length) nextIndex = 0;
    }

    setCurrentIndex(nextIndex < data.length ? nextIndex : 0);
    setShowMeaning(false);
    setStartTime(Date.now());
  };

  const handleBack = async (event) => {
    event.stopPropagation();
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = data.length - 1;

    if (user?.googleId) {
      try {
         await fetch("https://deca.redhawks.us/api/last-index", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: user.googleId,
            lastIndex: currentIndex,
            careerCluster: eventCluster,
          }),
    
        });
      } catch (err) {
        console.error("Error updating index:", err);
      }
    }

    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setShowMeaning(false);
      setStartTime(Date.now());
    }
  };

  const handleRestart = (event) => {
    event.stopPropagation();
    setCurrentIndex(0);
    setShowMeaning(false);
    setStartTime(Date.now());
    // reset random cycle when restarting
    if (randomCards && data.length > 0) {
      const allIndices = data.map((_, i) => i);
      const remaining = shuffle(allIndices.filter(i => i !== 0));
      setRemainingRandomIndices(remaining);
      setRandomCycleCompleted(false);
    }
  };

  const handleRand = () => {
    setRandomCards(prev => {
      const newVal = !prev;

      if (newVal && data.length > 0) {
        // turning ON random: save the current index so we can restore it later
        setSavedIndexBeforeRandom(currentIndex);

        const allIndices = data.map((_, i) => i);
        const remaining = shuffle(allIndices.filter(i => i !== currentIndex));
        setRemainingRandomIndices(remaining);
        setRandomCycleCompleted(false);
      } else {
        // turning OFF random: restore the saved index (if valid)
        const restoreIndex =
          savedIndexBeforeRandom !== null && savedIndexBeforeRandom < data.length
            ? savedIndexBeforeRandom
            : currentIndex;

        setCurrentIndex(restoreIndex);
        setShowMeaning(false);
        setStartTime(Date.now());
        setSavedIndexBeforeRandom(null);
        setRemainingRandomIndices([]);
        setRandomCycleCompleted(false);

        // persist restored index for logged-in users (matches Next/Back behavior)
        if (user?.googleId) {
          try {
            fetch("https://deca.redhawks.us/api/last-index", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                googleId: user.googleId,
                lastIndex: restoreIndex,
                careerCluster: eventCluster,
              }),
            });
          } catch (err) {
            console.error("Error updating index after disabling random:", err);
          }
        }
      }

      return newVal;
    });
  };

  const isAtEnd = () => {
    if (!data || data.length === 0) return false;
    if (randomCards) {
      // at end when there are no remaining indices after showing current
      return remainingRandomIndices.length === 0;
    }
    return currentIndex >= data.length - 1;
  };

  const getFilteredSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return data.filter(item =>
      item.PerformanceIndicator.toLowerCase().includes(query) ||
      item.Meaning.toLowerCase().includes(query)
    );
  };

  const handleSearchResultClick = (index) => {
    setCurrentIndex(index);
    setShowMeaning(false);
    setStartTime(Date.now());
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleKnowThis = async () => {
    const currentPI = data[currentIndex]?.PerformanceIndicator;

    if (!user?.googleId || !currentPI) {
      console.error("Missing user Google ID or Performance Indicator");
      return;
    }

    try {
      await fetch("https://deca.redhawks.us/api/know-this", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          GoogleId: user.googleId,
          PerformanceIndicator: currentPI,
          CareerCluster: eventCluster,
         }),
      });
      

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error adding to I_Know_This_Terms:", error);
    }
  };

  const toggleStar = (pi) => {
    try {
      const key = `starred_${eventCluster}`;
      setStarred((prev) => {
        const exists = prev.includes(pi);
        const next = exists ? prev.filter(x => x !== pi) : [pi, ...prev];
        try { localStorage.setItem(key, JSON.stringify(next)); } catch (e) {}
        // reapply starred sort if active (use next as override)
        if (sortMode === 'starred') applySort('starred', next);
        return next;
      });
    } catch (err) {
      console.error('Error toggling star', err);
    }
  };

  const handleSortToggle = (mode) => {
    const next = sortMode === mode ? 'default' : mode;
    setSortMode(next);
  };

  return (
    <div className="practice-page">
      <div className="Event-Title">
        <h1>{eventData}</h1>
      </div>

      {/* Informational popup about recently practiced cluster */}
      {showPopup && (
        <div className="practice-popup-overlay" onClick={closePopup}>
          <div className="practice-popup" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>This page contains your most recently practiced flashcard cluster.</h3>
            <p className="popup-cluster">Cluster: <strong>{eventCluster}</strong></p>
            <div className="practice-popup-controls">
              <label className="popup-checkbox">
                <input
                  type="checkbox"
                  checked={dontShowChecked}
                  onChange={(e) => setDontShowChecked(e.target.checked)}
                />
                <span>Don't show again.</span>
              </label>
              <div className="practice-popup-buttons">
                <button className="popup-button" onClick={closePopup}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search flashcards by keyword..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(e.target.value.trim().length > 0);
          }}
          onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
        />
        
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="search-results">
            {getFilteredSearchResults().length > 0 ? (
              getFilteredSearchResults().map((item, idx) => {
                const originalIndex = data.indexOf(item);
                return (
                  <div
                    key={idx}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(originalIndex)}
                  >
                    <div className="search-result-header">
                      <strong>{item.PerformanceIndicator}</strong>
                      <span className="search-result-index">#{originalIndex + 1}</span>
                    </div>
                    <div className="search-result-meaning">{item.Meaning}</div>
                  </div>
                );
              })
            ) : (
              <div className="search-result-item no-results">
                No flashcards found
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="Flash-Card-Body"
        onClick={handleFlip}
        style={{ backgroundColor: eventColor, position: 'relative' }}
      >
        {hasKnown && user && (
          <button
            className="return-known-button"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await axios.delete("https://deca.redhawks.us/api/know-this", {
                  params: {
                    googleId: user.googleId,
                    cluster: eventCluster, // <--- optional for scoped deletion
                  },
                });
                
                await fetchData();
              } catch (error) {
                console.error("Error resetting known cards:", error);
              }
            }}
          >
            Return Known Cards
          </button>
        )}

        {user && (
          <button
            className="know-button"
            onClick={(e) => {
              e.stopPropagation();
              handleKnowThis();
            }} 
          >
            I Know This
          </button>
        )}

        {data.length > 0 && (
          <div>
            <div className="flash-card-counter">
              <h3>{currentIndex + 1} of {data.length}</h3>
            </div>
            <h2>
              {showMeaning
                ? data[currentIndex]?.Meaning
                : data[currentIndex]?.PerformanceIndicator}
            </h2>
            <div className="flash-card-buttons">
              {currentIndex > 0 ? (
                <button className="flash-card-button back" onClick={handleBack}>
                  <h3>Back</h3>
                </button>
              ) : (
                <div className="flash-card-button blank" />
              )}
              {isAtEnd() ? (
                <button className="flash-card-button restart" onClick={handleRestart}>
                  <h3>Restart</h3>
                </button>
              ) : (
                <button className="flash-card-button next" onClick={handleNext}>
                  <h3>Next</h3>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="practice-controls" style={{ textAlign: 'center', marginTop: 8 }}>
        {!isAtEnd() && (
          <button className={`random-toggle-button ${randomCards ? "active" : ""}`} onClick={handleRand}>
            Random
          </button>
        )}

        <div style={{ display: 'inline-block', marginLeft: 12, marginRight: 12 }}>
          <button className={`sort-button ${sortMode === 'starred' ? 'active' : ''}`} onClick={() => handleSortToggle('starred')}>Sort: Starred</button>
          <button className={`sort-button ${sortMode === 'known' ? 'active' : ''}`} onClick={() => handleSortToggle('known')} style={{ marginLeft: 8 }}>Sort: Known</button>
        </div>

        <div style={{ display: 'block', marginTop: 12 }}>
          <button
            className="flash-card-button restart-below show-all-button"
            onClick={() => setShowListView(prev => !prev)}
            aria-pressed={showListView}
          >
            <h3>{showListView ? 'Hide All' : 'Show All Flashcards'}</h3>
          </button>
        </div>

        <div style={{ display: 'block', marginTop: 12 }}>
          <button className="flash-card-button restart-below" onClick={handleRestart}>
            <h3>Restart</h3>
          </button>
        </div>
      </div>

      {showListView && (
        <div className="flashcard-list" role="region" aria-label="All flashcards">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Term</th>
                <th>Meaning</th>
                <th onClick={() => handleSortToggle('starred')} style={{ cursor: 'pointer' }}>Star ▾</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => {
                const pi = item.PerformanceIndicator;
                const isStarred = starred.includes(pi);
                return (
                  <tr key={idx} className="flashcard-list-row" onClick={() => { setCurrentIndex(idx); setShowMeaning(false); setStartTime(Date.now()); }}>
                    <td>{idx + 1}</td>
                    <td className="fc-term">{pi}</td>
                    <td className="fc-meaning">{item.Meaning}</td>
                    <td>
                      <button
                        className={`star-button ${isStarred ? 'starred' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleStar(pi); }}
                        aria-pressed={isStarred}
                        title={isStarred ? 'Unstar' : 'Star'}
                      >
                        {isStarred ? '★' : '☆'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* single Restart/Random controls are in the practice-controls block above */}
    </div>
  );
};

export default Practice;
