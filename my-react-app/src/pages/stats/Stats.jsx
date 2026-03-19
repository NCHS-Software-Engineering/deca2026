import React, { useEffect, useState } from "react";
import "./Stats.css";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/stats`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })  
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="stats-container">
      <h1 className="Header">STATS</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{color:'red'}}>Error: {error}</div>
      ) : stats && stats.length > 0 ? (
        <table className="stats-table">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Name</th>
              <th>Time (seconds)</th>
              <th>Number of Cards</th>
              <th>Average Time/Card (seconds)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, index) => (
              <tr key={index}>
                <td>{s.email ?? "N/A"}</td>
                <td>{s.name}</td>
                <td>{s.Time}</td>
                <td>{s.NumCards}</td>
                <td>{typeof s.AvgTime === 'number' ? s.AvgTime.toFixed(3) : s.AvgTime}</td>
                <td>{s.stat_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No stats available</p>
      )}
    </div>
  );
};

export default Stats;
