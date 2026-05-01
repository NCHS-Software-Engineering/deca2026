import React, { useEffect, useState } from "react";
import "./Stats.css";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setStats(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatLoginDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  useEffect(() => {
    fetchStats();

    const intervalId = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(intervalId);
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
              <th>Most Recent Log-in Date</th>
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
                <td>{formatLoginDate(s.lastLoginAt)}</td>
                <td>{s.Time ?? "N/A"}</td>
                <td>{s.NumCards ?? "N/A"}</td>
                <td>{typeof s.AvgTime === 'number' ? s.AvgTime.toFixed(3) : (s.AvgTime ?? "N/A")}</td>
                <td>{s.stat_date ?? "N/A"}</td>
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
