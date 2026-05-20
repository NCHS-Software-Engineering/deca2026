import React, { useState, useEffect } from 'react';
import './PracticeMode.css';

const OldPractice = () => {
  const [branches, setBranches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);


  const handleRegenerate = () => {
    if (selected && selected.value) {
      fetchPIs(selected.value);
    }
  };

  useEffect(() => {
    fetch('https://deca.redhawks.us/api/branches')
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
      })
      .catch((error) => console.error('Error fetching branches:', error));
  }, []);

  useEffect(() => {
    if (selected && selected.value) {
      fetchPIs(selected.value);
    }
  }, [selected]);

  const fetchPIs = (branchNum) => {
    fetch('https://deca.redhawks.us/api/PIs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ branch: branchNum })
    })
    .then((res) => res.json())
    .then((data) => {
      console.log('Fetched data:', data); // Log fetched data
      setData(data);
    })
    .catch((error) => console.error('Error fetching data:', error));
  };

  console.log('Rendered data:', data); // Log rendered data

  return (
    <>
      <div className="Practice1">
        <h1>PRACTICE</h1>
      </div>

      

      
 
      <div className="flashcard">
        <svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="100" x="10" y="10" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="button-container">
        <button className="regenerate-button" onClick={handleRegenerate}>NEXT CARD</button>
      </div>

      
      <div>
        <table>
          {data.map((PIs) => (
            <tr key={PIs.MovieCode} className="movie item">
              <td>{PIs.PerformanceIndicator}</td>
              <td>{PIs.Meaning}</td>
              <td>{PIs.CareerCluster}</td>
            </tr>
          ))}
        </table>
      </div>
    </>
  );
};

export default OldPractice;
