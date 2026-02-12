import React, { useEffect, useState } from "react";
import "./Stats.css";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.googleId) {
      fetch(`https://deca.redhawks.us/api/get-stats?googleId=${user.googleId}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Stats fetch error:", err));
    }
  }, []);

  return (
    <div className="stats-page">
      <h1 className="Header">STATS</h1>
      {stats ? (
        <>
          <h1>Time Studied Today: {stats.Time} sec</h1>
          <h1>Number of Cards Studied: {stats.NumCards}</h1>
          <h1>Number of Cards Memorized: TODO</h1>
          <h1>Time Per Card: {stats.AvgTime?.toFixed(2)} sec</h1>
        </>
      ) : (
        <h2>Coming Soon!</h2>
      )}
    </div>
  );
};

export default Stats;
