"use client";
import React, { useEffect, useState } from "react";
import "./Stats.css";
import Link from 'next/link';

interface Stats {
  ID: Number;
}

const Stats = () => {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.googleId) {
      fetch(`https://deca.redhawks.us/api/get-stats?googleId=${user.googleId}`)
        .then(res => res.json())
        .then(data => setStats(data)) // NOTES FOR NEXT TIME: IMPLEMENT STATS STUFF MORE 
        .catch(err => console.error("Stats fetch error:", err));
    }
  }, []);

  return (
    <div>
      <h1 className="Header">STATS</h1>
      {stats ? (
        <>
          <h1>Time Studied Today: {stats.Time} sec</h1>
          <h1>Number of Cards Studied: {stats.NumCards}</h1>
          <h1>Number of Cards Memorized: TODO</h1>
          <h1>Time Per Card: {stats.AvgTime?.toFixed(2)} sec</h1>
        </>
      ) : (
        <table className="table-auto border-collapse border border-gray-400">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-gray-300 px-4 py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((stats, index) => (
              <tr key={index} className="odd:bg-gray-100 even:bg-blue-100">
                <td className="border border-gray-300 px-4 py-2">{stats.ID}</td>
        
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Stats;
