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
  const [startTime, setStartTime] = useState(Date.now());
  const [knownIndicators, setKnownIndicators] = useState([]);
  const [hasKnown, setHasKnown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    const tempEventData =
      location.state?.name || localStorage.getItem("deca_headerName") || "Please Choose an Event from Home";
    const tempEventColor =
      location.state?.color || localStorage.getItem("deca_color") || "var(--Primary)";
    const tempEventCluster =
      location.state?.cluster || localStorage.getItem("deca_cluster") || "Marketing";
  
    setEventData(tempEventData);
    setEventColor(tempEventColor);
    setEventCluster(tempEventCluster);
    setIsInitialized(true);
  }, [location.state]);
  

  useEffect(() => {
    if (!isInitialized) return;
    console.log("eventCluster being used:", eventCluster);
    fetchData();
  }, [eventCluster, randomCards, user?.googleId, isInitialized]);
  

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
          params: { googleId: user.googleId },
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
  
      const filtered = user?.googleId
        ? allIndicators.filter(
            (item) => !known.includes(item.PerformanceIndicator)
          )
        : allIndicators;
  
      console.log("Filtered data:", filtered);
      setData(filtered);
  
      setCurrentIndex(index < filtered.length ? index : 0);
    } catch (err) {
      console.error("Error loading practice data:", err);
    }
  };

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
          }),
        });
      } catch (err) {
        console.error("Error updating index:", err);
      }
    }

    let nextIndex;

    if (randomCards) {
      do {
        nextIndex = Math.floor(Math.random() * data.length);
      } while (
        data.length > 1 &&
        knownIndicators.includes(data[nextIndex]?.PerformanceIndicator) &&
        nextIndex === currentIndex
      );
    } else {
      nextIndex = currentIndex + 1;
      while (
        nextIndex < data.length &&
        knownIndicators.includes(data[nextIndex]?.PerformanceIndicator)
      ) {
        nextIndex++;
      }
    }

    setCurrentIndex(nextIndex < data.length ? nextIndex : 0);
    setShowMeaning(false);
    setStartTime(Date.now());
  };

  const handleBack = async (event) => {
    event.stopPropagation();
    let prevIndex = currentIndex - 1;
    while (
      prevIndex >= 0 &&
      knownIndicators.includes(data[prevIndex]?.PerformanceIndicator)
    ) {
      prevIndex--;
    }

    if (user?.googleId) {
      try {
         await fetch("https://deca.redhawks.us/api/last-index", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleId: user.googleId,
            lastIndex: currentIndex,
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
    setStartTime(Date.now());
  };

  const handleRand = () => {
    setRandomCards(prev => !prev);
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

  return (
    <div>
      <div className="Event-Title">
        <h1>{eventData}</h1>
      </div>

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
              {currentIndex >= data.length - 1 ? (
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

      <button className="flash-card-button restart-below" onClick={handleRestart}>
        <h3>Restart</h3>
      </button>

      <button className={`random-toggle-button ${randomCards ? "active" : ""}`} onClick={handleRand}>
        Random
      </button>
    </div>
  );
};

export default Practice;
