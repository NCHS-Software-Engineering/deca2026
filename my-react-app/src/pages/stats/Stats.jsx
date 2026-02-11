import React, { useEffect, useState } from "react";
import "./Stats.css";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.googleId) {
      fetch(`http://localhost:4000/api/get-stats?googleId=${user.googleId}`)
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Stats fetch error:", err);
          setLoading(false);
        });
    }
  }, []);

  return (
    <div>
      <h1 className="Header">STATS</h1>
      {loading ? (
        <p>Loading...</p>
      ) : stats ? (
        <>
          <h1>Time Studied Today: {stats.Time} sec</h1>
          <h1>Number of Cards Studied: {stats.NumCards}</h1>
          <h1>Number of Cards Memorized: TODO</h1>
          <h1>Time Per Card: {stats.AvgTime?.toFixed(2)} sec</h1>
        </>
      ) : (
        <p>No stats available</p>
      )}
    </div>
  );
};

export default Stats;
